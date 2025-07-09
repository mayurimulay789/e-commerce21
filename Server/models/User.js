const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5}$/,
  },
  landmark: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
})

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "Default",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\+91[6789]\d{9}$/,
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
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    cart: [cartItemSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [addressSchema],
    tempOrderData: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
userSchema.index({ phoneNumber: 1 })
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.otp
  delete user.otpExpiry
  delete user.tempOrderData
  return user
}

module.exports = mongoose.model("User", userSchema)
