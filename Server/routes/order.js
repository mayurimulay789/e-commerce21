const express = require("express");
const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment", verifyPaymentAndCreateOrder);
router.get("/my-orders", getUserOrders);
router.get("/:orderId", getOrderDetails);
router.get("/:orderId/track", trackOrder);
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
