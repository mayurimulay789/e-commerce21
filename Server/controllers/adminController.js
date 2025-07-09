const User = require("../models/User")
const Product = require("../models/Product")
const Category = require("../models/Category")
const Order = require("../models/Order")
const Banner = require("../models/Banner")
const Coupon = require("../models/Coupon")
const { uploadToCloudinary } = require("../utils/cloudinary")

// Dashboard Overview Stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total counts
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: { $in: ["pending", "confirmed", "processing"] } })

    // Sales stats
    const totalSales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } },
    ])

    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
    ])

    const weeklySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
    ])

    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
    ])

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name phoneNumber")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(10)

    // Popular products
    const popularProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
    ])

    // Sales chart data (last 7 days)
    const salesChart = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalSales: totalSales[0]?.total || 0,
        dailySales: {
          amount: dailySales[0]?.total || 0,
          count: dailySales[0]?.count || 0,
        },
        weeklySales: {
          amount: weeklySales[0]?.total || 0,
          count: weeklySales[0]?.count || 0,
        },
        monthlySales: {
          amount: monthlySales[0]?.total || 0,
          count: monthlySales[0]?.count || 0,
        },
      },
      recentOrders,
      popularProducts,
      salesChart,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    })
  }
}

// User Management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ]
    }
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select("-otp -otpExpiry -tempOrderData")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const totalUsers = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!["user", "admin", "digitalMarketer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select(
      "-otp -otpExpiry -tempOrderData",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Check if user has orders
    const orderCount = await Order.countDocuments({ user: userId })
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with existing orders",
      })
    }

    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    })
  }
}

// Order Management
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, startDate, endDate } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (status) {
      query.status = status
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: search, $options: "i" } },
      ]
    }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const orders = await Order.find(query)
      .populate("user", "name phoneNumber email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const totalOrders = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status, trackingNumber, carrier, notes } = req.body

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      })
    }

    const updateData = { status }
    if (notes) updateData.notes = notes

    // Handle tracking info for shipped orders
    if (status === "shipped" && trackingNumber) {
      updateData.trackingInfo = {
        trackingNumber,
        carrier: carrier || "Unknown",
        trackingUrl: carrier === "shiprocket" ? `https://shiprocket.co/tracking/${trackingNumber}` : null,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      }
    }

    // Set delivered date
    if (status === "delivered") {
      updateData.deliveredAt = new Date()
    }

    // Set cancelled date
    if (status === "cancelled") {
      updateData.cancelledAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true }).populate(
      "user",
      "name phoneNumber email",
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    })
  }
}

// Coupon Management
const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    const coupons = await Coupon.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const totalCoupons = await Coupon.countDocuments(query)

    res.status(200).json({
      success: true,
      coupons,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCoupons / limit),
        totalCoupons,
        hasNext: page < Math.ceil(totalCoupons / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get all coupons error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    })
  }
}

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      maxUses,
      maxUsesPerUser,
      validUntil,
      applicableCategories,
      applicableProducts,
    } = req.body

    // Validate required fields
    if (!code || !description || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: "Required fields: code, description, discountType, discountValue, validUntil",
      })
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      })
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      maxUsesPerUser: Number(maxUsesPerUser) || 1,
      validUntil: new Date(validUntil),
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      createdBy: req.user.userId,
    })

    await coupon.save()

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    })
  } catch (error) {
    console.error("Create coupon error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    })
  }
}

const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params
    const updateData = req.body

    // Parse numeric fields
    if (updateData.discountValue) updateData.discountValue = Number(updateData.discountValue)
    if (updateData.minOrderValue) updateData.minOrderValue = Number(updateData.minOrderValue)
    if (updateData.maxDiscountAmount) updateData.maxDiscountAmount = Number(updateData.maxDiscountAmount)
    if (updateData.maxUses) updateData.maxUses = Number(updateData.maxUses)
    if (updateData.maxUsesPerUser) updateData.maxUsesPerUser = Number(updateData.maxUsesPerUser)
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil)

    const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true, runValidators: true }).populate(
      "createdBy",
      "name",
    )

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    })
  } catch (error) {
    console.error("Update coupon error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    })
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params

    const coupon = await Coupon.findByIdAndDelete(couponId)
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    })
  } catch (error) {
    console.error("Delete coupon error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    })
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
}
