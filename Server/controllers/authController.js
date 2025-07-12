const admin = require('firebase-admin')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const { sendEmail } = require("../utils/emailService")

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map()

// Helper function to check rate limits
const checkRateLimit = (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`

  const attempts = rateLimitStore.get(key) || 0
  if (attempts >= maxAttempts) {
    throw new Error(`Too many attempts. Please try again later.`)
  }

  rateLimitStore.set(key, attempts + 1)

  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (k.split("_")[1] < Math.floor((now - windowMs) / windowMs)) {
      rateLimitStore.delete(k)
    }
  }
}

// Email Registration
const registerWithEmail = async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      })
    }

    // Check rate limit
    checkRateLimit(`register_${email}`)

    try {
      // Create user in Firebase
      const firebaseUser = await admin.auth().createUser({
        email: email.toLowerCase(),
        password,
        displayName: name.trim(),
        emailVerified: false,
      })

      // Create user in database
      const user = new User({
        firebaseUid: firebaseUser.uid,
        name: name.trim(),
        email: email.toLowerCase(),
        authMethod: "email",
        isVerified: false,
        role: "user",
        createdAt: new Date(),
      })

      await user.save()

      // Create custom token for immediate login
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid)

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          userId: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      // Send welcome email
      try {
        await sendEmail({
          to: user.email,
          template: "welcome",
          data: {
            name: user.name,
            email: user.email,
          },
        })
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
          authMethod: user.authMethod,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        customToken,
        jwtToken,
      })
    } catch (firebaseError) {
      console.error("Firebase registration error:", firebaseError)

      if (firebaseError.code === "auth/email-already-exists") {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        })
      }

      return res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      })
    }
  } catch (error) {
    console.error("Email registration error:", error)

    if (error.message.includes("Too many attempts")) {
      return res.status(429).json({
        success: false,
        message: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    })
  }
}

// Login with Email
const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Check rate limit
    checkRateLimit(`login_${email}`)

    try {
      // Get user by email from Firebase
      const firebaseUser = await admin.auth().getUserByEmail(email.toLowerCase())

      // Find user in database
      const user = await User.findOne({ firebaseUid: firebaseUser.uid })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register first.",
        })
      }

      // Create custom token for login
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid)

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          userId: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      res.status(200).json({
        success: true,
        message: "Login successful",
        customToken,
        jwtToken,
        user: {
          _id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          authMethod: user.authMethod,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      })
    } catch (firebaseError) {
      console.error("Firebase login error:", firebaseError)

      if (firebaseError.code === "auth/user-not-found") {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address",
        })
      }

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }
  } catch (error) {
    console.error("Login error:", error)

    if (error.message.includes("Too many attempts")) {
      return res.status(429).json({
        success: false,
        message: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    })
  }
}

// Verify Firebase ID Token (for both email and phone auth)
const verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      })
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const firebaseUid = decodedToken.uid

    // Get Firebase user details
    const firebaseUser = await admin.auth().getUser(firebaseUid)

    // Find or create user in database
    let user = await User.findOne({ firebaseUid })

    if (!user) {
      // Create new user for phone authentication
      const authMethod = firebaseUser.phoneNumber ? "phone" : "email"
      const name =
        firebaseUser.displayName || `User ${firebaseUser.phoneNumber?.slice(-4) || firebaseUser.email?.split("@")[0]}`

      user = new User({
        firebaseUid: firebaseUser.uid,
        name,
        email: firebaseUser.email || null,
        phoneNumber: firebaseUser.phoneNumber || null,
        authMethod,
        isVerified: firebaseUser.emailVerified || !!firebaseUser.phoneNumber,
        role: "user",
        createdAt: new Date(),
      })

      await user.save()

      // Send welcome email for email users
      if (authMethod === "email" && firebaseUser.email) {
        try {
          await sendEmail({
            to: firebaseUser.email,
            template: "welcome",
            data: {
              name: user.name,
              email: firebaseUser.email,
            },
          })
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError)
        }
      }
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.status(200).json({
      success: true,
      message: "Token verified successfully",
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        authMethod: user.authMethod,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      jwtToken,
    })
  } catch (error) {
    console.error("Token verification error:", error)

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      })
    }

    res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }
}

// Forgot Password (Email only)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Check rate limit
    checkRateLimit(`forgot_${email}`, 3, 60 * 60 * 1000) // 3 attempts per hour

    try {
      // Check if user exists in Firebase
      await admin.auth().getUserByEmail(email.toLowerCase())

      // Generate password reset link
      const resetLink = await admin.auth().generatePasswordResetLink(email.toLowerCase())

      // Send password reset email
      await sendEmail({
        to: email,
        template: "passwordReset",
        data: {
          name: "User", // We don't have the name here, so use generic
          resetLink,
        },
      })

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      })
    } catch (firebaseError) {
      console.error("Firebase forgot password error:", firebaseError)

      if (firebaseError.code === "auth/user-not-found") {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address",
        })
      }

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      })
    }
  } catch (error) {
    console.error("Forgot password error:", error)

    if (error.message.includes("Too many attempts")) {
      return res.status(429).json({
        success: false,
        message: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    })
  }
}

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        authMethod: user.authMethod,
        isVerified: user.isVerified,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, addresses } = req.body
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update fields
    if (name) user.name = name.trim()
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth)
    if (gender) user.gender = gender
    if (addresses) user.addresses = addresses

    await user.save()

    // Update Firebase profile if name changed
    if (name && name !== user.name) {
      try {
        await admin.auth().updateUser(user.firebaseUid, {
          displayName: name.trim(),
        })
      } catch (firebaseError) {
        console.error("Failed to update Firebase profile:", firebaseError)
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        authMethod: user.authMethod,
        isVerified: user.isVerified,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
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

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update user avatar (assuming cloudinary URL is in req.file.path)
    user.avatar = req.file.path
    await user.save()

    // Update Firebase profile photo
    try {
      await admin.auth().updateUser(user.firebaseUid, {
        photoURL: req.file.path,
      })
    } catch (firebaseError) {
      console.error("Failed to update Firebase photo:", firebaseError)
    }

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        authMethod: user.authMethod,
        isVerified: user.isVerified,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Upload avatar error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
    })
  }
}

// Logout
const logout = async (req, res) => {
  try {
    const firebaseUid = req.user.firebaseUid

    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(firebaseUid)

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Logout failed",
    })
  }
}

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId
    const firebaseUid = req.user.firebaseUid

    // Delete user from database
    await User.findByIdAndDelete(userId)

    // Delete from Firebase
    await admin.auth().deleteUser(firebaseUid)

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    })
  }
}

module.exports = {
  registerWithEmail,
  loginWithEmail,
  verifyFirebaseToken,
  forgotPassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  logout,
  deleteAccount,
}
