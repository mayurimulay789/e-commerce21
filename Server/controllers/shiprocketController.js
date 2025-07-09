const Order = require("../models/Order")
const crypto = require("crypto")

// Handle Shiprocket webhook
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature if provided
    const signature = req.headers["x-shiprocket-signature"]
    if (signature && process.env.SHIPROCKET_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.SHIPROCKET_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex")

      if (signature !== expectedSignature) {
        return res.status(401).json({ message: "Invalid signature" })
      }
    }

    const { awb, current_status, delivered_date, pickup_date } = req.body

    if (!awb) {
      return res.status(400).json({ message: "AWB code is required" })
    }

    // Find order by tracking number
    const order = await Order.findOne({ "trackingInfo.trackingNumber": awb })

    if (!order) {
      console.log(`Order not found for AWB: ${awb}`)
      return res.status(404).json({ message: "Order not found" })
    }

    // Map Shiprocket status to our order status
    let orderStatus = order.status
    switch (current_status?.toLowerCase()) {
      case "shipped":
      case "in transit":
        orderStatus = "shipped"
        break
      case "out for delivery":
        orderStatus = "out_for_delivery"
        break
      case "delivered":
        orderStatus = "delivered"
        if (delivered_date) {
          order.deliveredAt = new Date(delivered_date)
        }
        break
      case "cancelled":
      case "rto":
        orderStatus = "cancelled"
        break
      default:
        orderStatus = "processing"
    }

    // Update order
    order.status = orderStatus
    order.trackingInfo.currentStatus = current_status
    order.trackingInfo.lastUpdate = new Date()

    if (pickup_date && !order.trackingInfo.pickupDate) {
      order.trackingInfo.pickupDate = new Date(pickup_date)
    }

    await order.save()

    console.log(`Order ${order.orderNumber} status updated to: ${orderStatus}`)

    res.status(200).json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Shiprocket webhook error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  handleWebhook,
}
