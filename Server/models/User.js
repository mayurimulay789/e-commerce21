const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["home", "work", "other"],
    default: "home",
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
})

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allow null values for users not yet verified
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values for phone-only users
      lowercase: true,
      validate: {
        validator: (email) => {
          if (email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          }
          return true
        },
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values for email-only users
      validate: {
        validator: (phone) => {
          if (phone) {
            return /^\+[1-9]\d{1,14}$/.test(phone)
          }
          return true
        },
        message: "Invalid phone number format",
      },
    },
    authMethod: {
      type: String,
      enum: ["email", "phone", "google", "facebook"],
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "digitalMarketer"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    addresses: [addressSchema],

    // Account security
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Timestamps
    lastLogin: {
      type: Date,
    },

    // Preferences
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Social media links
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.loginAttempts
        delete ret.lockUntil
        return ret
      },
    },
  },
)

// Indexes for better performance
userSchema.index({ email: 1 })
userSchema.index({ phoneNumber: 1 })
userSchema.index({ authMethod: 1 })
userSchema.index({ role: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ firebaseUid: 1 })

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware
userSchema.pre("save", function (next) {
  // Ensure only one default address
  if (this.addresses && this.addresses.length > 0) {
    let hasDefault = false
    this.addresses.forEach((address, index) => {
      if (address.isDefault) {
        if (hasDefault) {
          address.isDefault = false
        } else {
          hasDefault = true
        }
      }
    })
    // If no default address, make the first one default
    if (!hasDefault && this.addresses.length > 0) {
      this.addresses[0].isDefault = true
    }
  }

  next()
})

// Methods
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
      },
      $unset: {
        lockUntil: 1,
      },
    })
  }
  const updates = { $inc: { loginAttempts: 1 } }
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  return this.updateOne(updates)
}

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
  })
}

userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model("User", userSchema)
