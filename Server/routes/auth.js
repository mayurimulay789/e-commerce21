const express = require("express")
const {
  sendOTP,
  verifyOTP,
  updateProfile,
  getProfile,
  refreshToken,
  logout,
  checkAuth,
} = require("../controllers/authController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Public routes
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

// Protected routes (require authentication)
router.use(auth) // Apply auth middleware to all routes below

router.get("/profile", getProfile)
router.put("/profile", updateProfile)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)
router.get("/check", checkAuth)

module.exports = router
