const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")
const Coupon = require("../models/Coupon")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const shiprocketService = require("../services/shiprocketService")

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})


// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body
    const userId = req.user.userId

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required",
      })
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phoneNumber || !shippingAddress.pinCode) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      })
    }

    // Validate and calculate order total
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        })
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color || "Default",
        image: product.images[0],
      })
    }

    // Apply coupon if provided
    let discount = 0
    let couponDetails = null
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (coupon) {
        const validation = coupon.isValidForUser(userId)
        if (validation.valid) {
          if (subtotal >= coupon.minOrderValue) {
            discount = coupon.calculateDiscount(subtotal)
            couponDetails = {
              code: coupon.code,
              discount: discount,
              discountType: coupon.discountType,
            }
          } else {
            return res.status(400).json({
              success: false,
              message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
            })
          }
        } else {
          return res.status(400).json({
            success: false,
            message: validation.message,
          })
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        })
      }
    }

    // Calculate final amounts
    const shippingCharges = subtotal >= 999 ? 0 : 99
    const tax = Math.round((subtotal - discount) * 0.18) // 18% GST
    const total = subtotal + shippingCharges + tax - discount

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        couponCode: couponCode || "",
      },
    })

    // Store order details temporarily
    const orderData = {
      user: userId,
      items: validatedItems,
      shippingAddress,
      pricing: {
        subtotal,
        shippingCharges,
        tax,
        discount,
        total,
      },
      coupon: couponDetails,
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "pending",
      },
    }

    // Store in user document temporarily
    await User.findByIdAndUpdate(userId, {
      tempOrderData: orderData,
    })

    res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      orderSummary: {
        items: validatedItems,
        pricing: {
          subtotal,
          shippingCharges,
          tax,
          discount,
          total,
        },
        coupon: couponDetails,
      },
    })
  } catch (error) {
    console.error("Create Razorpay order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    })
  }
}

// Verify Payment and Create Order with Shiprocket Integration
const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const userId = req.user.userId

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    // Get temporary order data
    const user = await User.findById(userId)
    if (!user || !user.tempOrderData) {
      return res.status(400).json({
        success: false,
        message: "Order data not found",
      })
    }

    const orderData = user.tempOrderData

    // Update payment info
    orderData.paymentInfo.razorpayPaymentId = razorpay_payment_id
    orderData.paymentInfo.razorpaySignature = razorpay_signature
    orderData.paymentInfo.paymentStatus = "completed"
    orderData.paymentInfo.paidAt = new Date()
    orderData.status = "confirmed"

    // Create order
    const order = new Order(orderData)
    await order.save()

    // Update product stock
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    // Update coupon usage if applied
    if (orderData.coupon) {
      const coupon = await Coupon.findOne({ code: orderData.coupon.code })
      if (coupon) {
        coupon.usedCount += 1
        const userUsage = coupon.usedBy.find((usage) => usage.user.toString() === userId)
        if (userUsage) {
          userUsage.usedCount += 1
          userUsage.lastUsed = new Date()
        } else {
          coupon.usedBy.push({
            user: userId,
            usedCount: 1,
            lastUsed: new Date(),
          })
        }
        await coupon.save()
      }
    }

    // Create shipment on Shiprocket
    try {
      const populatedOrder = await Order.findById(order._id).populate("user", "name email phoneNumber")
      const shiprocketResponse = await shiprocketService.createOrder(populatedOrder)

      if (shiprocketResponse.order_id) {
        // Update order with Shiprocket details
        order.trackingInfo = {
          trackingNumber: shiprocketResponse.awb_code,
          carrier: "Shiprocket",
          shiprocketOrderId: shiprocketResponse.order_id,
          trackingUrl: `https://shiprocket.co/tracking/${shiprocketResponse.awb_code}`,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        }
        await order.save()
      }
    } catch (shiprocketError) {
      console.error("Shiprocket integration error:", shiprocketError)
      // Continue with order creation even if Shiprocket fails
    }

    // Clear user's cart and temp order data
    await User.findByIdAndUpdate(userId, {
      cart: [],
      tempOrderData: null,
    })

    // Send confirmation email
    await sendOrderConfirmationEmail(user, order)

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        status: order.status,
        trackingNumber: order.trackingInfo?.trackingNumber,
        estimatedDelivery: order.trackingInfo?.estimatedDelivery,
      },
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    })
  }
}

// Track Order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user.userId

    const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product", "name images")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    let trackingData = null
    if (order.trackingInfo?.trackingNumber) {
      try {
        trackingData = await shiprocketService.trackShipment(order.trackingInfo.trackingNumber)
      } catch (trackingError) {
        console.error("Tracking error:", trackingError)
      }
    }

    res.status(200).json({
      success: true,
      order,
      trackingData,
    })
  } catch (error) {
    console.error("Track order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    })
  }
}

// Send Order Confirmation Email
const sendOrderConfirmationEmail = async (user, order) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ec4899;">Order Confirmation - FashionHub</h2>
        <p>Dear ${user.name || "Customer"},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
          ${
            order.trackingInfo?.trackingNumber
              ? `<p><strong>Tracking Number:</strong> ${order.trackingInfo.trackingNumber}</p>`
              : ""
          }
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Items Ordered</h3>
          ${order.items
            .map(
              (item) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <p><strong>${item.name}</strong></p>
              <p>Size: ${item.size} | Quantity: ${item.quantity} | Price: ₹${item.price}</p>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.fullName}</p>
          <p>${order.shippingAddress.addressLine1}</p>
          ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ""}
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}</p>
          <p>Phone: ${order.shippingAddress.phoneNumber}</p>
        </div>
        
        <p>Your order will be delivered within 5-7 business days.</p>
        ${
          order.trackingInfo?.trackingUrl
            ? `<p><a href="${order.trackingInfo.trackingUrl}" style="color: #ec4899;">Track your order</a></p>`
            : ""
        }
        <p>For any queries, contact us at support@fashionhub.com</p>
        
        <p>Thank you for shopping with FashionHub!</p>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailHtml,
    })
  } catch (error) {
    console.error("Email sending error:", error)
  }
}

// Get User Orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalOrders = await Order.countDocuments({ user: userId })

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
}

// Get Order Details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user.userId

    const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product", "name images")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Get order details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    })
  }
}

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { reason } = req.body
    const userId = req.user.userId

    const order = await Order.findOne({ _id: orderId, user: userId })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    if (order.status !== "confirmed" && order.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      })
    }

    // Cancel shipment on Shiprocket if exists
    if (order.trackingInfo?.trackingNumber) {
      try {
        await shiprocketService.cancelShipment(order.trackingInfo.trackingNumber)
      } catch (shiprocketError) {
        console.error("Shiprocket cancellation error:", shiprocketError)
      }
    }

    // Update order status
    order.status = "cancelled"
    order.cancelReason = reason
    order.cancelledAt = new Date()
    await order.save()

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    })
  } catch (error) {
    console.error("Cancel order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    })
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
}
