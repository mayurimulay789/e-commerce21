const express = require("express")
const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
} = require("../controllers/orderController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// All routes require authentication
router.use(auth)

// Create Razorpay order
router.post("/create-razorpay-order", createRazorpayOrder)

// Verify payment and create order
router.post("/verify-payment", verifyPaymentAndCreateOrder)

// Get user orders
router.get("/my-orders", getUserOrders)

// Get specific order details
router.get("/:orderId", getOrderDetails)

// Track order
router.get("/:orderId/track", trackOrder)

// Cancel order
router.put("/:orderId/cancel", cancelOrder)

module.exports = router
