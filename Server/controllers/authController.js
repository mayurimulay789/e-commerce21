const User = require("../models/User")
const jwt = require("jsonwebtoken")
const twilio = require("twilio")

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate JWT Token with role
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    },
    process.env.JWT_SECRET,
  )
}

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body

    // Validate phone number format
    const phoneRegex = /^(\+91|91)?[6789]\d{9}$/
    if (!phoneNumber || !phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number",
      })
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith("+91")
      ? phoneNumber
      : phoneNumber.startsWith("91")
        ? `+${phoneNumber}`
        : `+91${phoneNumber}`

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Find existing user or prepare for auto-registration
    let user = await User.findOne({ phoneNumber: formattedPhone })
    let isNewUser = false

    if (!user) {
      // Auto-register new user
      user = new User({
        phoneNumber: formattedPhone,
        role: "user", // Default role
      })
      isNewUser = true
    }

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP via Twilio
    try {
      await client.messages.create({
        body: `Your FashionHub verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      })

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        phoneNumber: formattedPhone,
        isNewUser,
        expiresIn: "10 minutes",
      })
    } catch (twilioError) {
      console.error("Twilio error:", twilioError)
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      })
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    })
  }
}

// Verify OTP and Login/Register
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      })
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith("+91")
      ? phoneNumber
      : phoneNumber.startsWith("91")
        ? `+${phoneNumber}`
        : `+91${phoneNumber}`

    const user = await User.findOne({ phoneNumber: formattedPhone })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please request a new OTP.",
      })
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      })
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      })
    }

    // Clear OTP and mark as verified
    user.otp = undefined
    user.otpExpiry = undefined
    user.isVerified = true
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token with role
    const token = generateToken(user._id, user.role)

    // Prepare user data for response (exclude sensitive fields)
    const userData = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }

    res.status(200).json({
      success: true,
      message: user.name ? "Login successful" : "Registration successful! Please complete your profile.",
      token,
      user: userData,
      expiresIn: "30 days",
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    })
  }
}

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.user.userId

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      })
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      })
    }

    // Check if email already exists
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered with another account",
        })
      }
    }

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.toLowerCase()

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-otp -otpExpiry",
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    })
  }
}

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId)
      .select("-otp -otpExpiry")
      .populate("wishlist", "name price images")
      .populate("cart.product", "name price images")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        wishlist: user.wishlist,
        cart: user.cart,
        addresses: user.addresses,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    })
  }
}

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.userId
    const userRole = req.user.role

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Generate new token
    const newToken = generateToken(userId, userRole)

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      expiresIn: "30 days",
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    })
  }
}

// Logout
exports.logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    })
  }
}

// Check Auth Status
exports.checkAuth = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId).select("-otp -otpExpiry")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Check auth error:", error)
    res.status(500).json({
      success: false,
      message: "Authentication check failed",
    })
  }
}
