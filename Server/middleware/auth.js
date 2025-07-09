const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No valid token provided.",
      })
    }

    const token = authHeader.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is required.",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Check if token is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        })
      }

      // Verify user still exists
      const user = await User.findById(decoded.userId).select("-otp -otpExpiry")

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please login again.",
        })
      }

      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Account not verified. Please complete verification.",
        })
      }

      // Attach user info to request
      req.user = {
        userId: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
      }

      next()
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        })
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
        })
      } else {
        throw jwtError
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    })
  }
}

// Admin-only access middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
  next()
}

// Digital Marketer or Admin access middleware
const digitalMarketerAuth = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "digitalMarketer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or Digital Marketer privileges required.",
    })
  }
  next()
}

// User access middleware (any authenticated user)
const userAuth = (req, res, next) => {
  if (!req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    })
  }
  next()
}

// Optional auth middleware (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null
      return next()
    }

    const token = authHeader.replace("Bearer ", "")

    if (!token) {
      req.user = null
      return next()
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        req.user = null
        return next()
      }

      const user = await User.findById(decoded.userId).select("-otp -otpExpiry")

      if (!user || !user.isVerified) {
        req.user = null
        return next()
      }

      req.user = {
        userId: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
      }

      next()
    } catch (jwtError) {
      req.user = null
      next()
    }
  } catch (error) {
    req.user = null
    next()
  }
}

module.exports = {
  auth,
  adminAuth,
  digitalMarketerAuth,
  userAuth,
  optionalAuth,
}
