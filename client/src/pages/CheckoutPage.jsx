"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingBag, MapPin, CreditCard, Tag, Truck, Shield, X } from "lucide-react"
import { createRazorpayOrder, clearError, clearSuccess } from "../store/slices/orderSlice"
import { validateCoupon, removeCoupon, clearError as clearCouponError } from "../store/slices/couponSlice"
import { fetchCart } from "../store/slices/cartSlice"
import LoadingSpinner from "../components/LoadingSpinner"
import { verifyPayment } from "../store/slices/paymentSlice" // Import verifyPayment

const CheckoutPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items: cartItems, summary } = useSelector((state) => state.cart)
  const { razorpayOrder, orderSummary, loading, error, success } = useSelector((state) => state.order)
  const { appliedCoupon, loading: couponLoading, error: couponError } = useSelector((state) => state.coupon)
  const { user } = useSelector((state) => state.auth)

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber?.replace("+91", "") || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
  })

  const [couponCode, setCouponCode] = useState("")
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [addressErrors, setAddressErrors] = useState({})

  useEffect(() => {
    if (!cartItems.length) {
      dispatch(fetchCart())
    }
  }, [dispatch, cartItems.length])

  useEffect(() => {
    if (success.orderCreated && razorpayOrder) {
      handleRazorpayPayment()
    }
  }, [success.orderCreated, razorpayOrder])

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000)
    }
  }, [error, dispatch])

  useEffect(() => {
    if (couponError) {
      setTimeout(() => dispatch(clearCouponError()), 5000)
    }
  }, [couponError, dispatch])

  const validateAddress = () => {
    const errors = {}

    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required"
    if (!shippingAddress.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    else if (!/^[6789]\d{9}$/.test(shippingAddress.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid 10-digit mobile number"
    }
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = "Address is required"
    if (!shippingAddress.city.trim()) errors.city = "City is required"
    if (!shippingAddress.state.trim()) errors.state = "State is required"
    if (!shippingAddress.pinCode.trim()) errors.pinCode = "PIN code is required"
    else if (!/^[1-9][0-9]{5}$/.test(shippingAddress.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit PIN code"
    }

    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    const orderValue = summary.subtotal
    dispatch(validateCoupon({ code: couponCode, orderValue }))
  }

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon())
    setCouponCode("")
    setShowCouponInput(false)
  }

  const calculateFinalPricing = () => {
    const subtotal = summary.subtotal
    const shippingCharges = subtotal >= 999 ? 0 : 99
    const discount = appliedCoupon?.discountAmount || 0
    const tax = Math.round((subtotal - discount) * 0.18) // 18% GST
    const total = subtotal + shippingCharges + tax - discount

    return {
      subtotal,
      shippingCharges,
      tax,
      discount,
      total,
    }
  }

  const pricing = calculateFinalPricing()

  const handlePlaceOrder = () => {
    if (!validateAddress()) {
      return
    }

    if (!cartItems.length) {
      alert("Your cart is empty")
      return
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: {
        ...shippingAddress,
        phoneNumber: `+91${shippingAddress.phoneNumber}`,
      },
      couponCode: appliedCoupon?.code || "",
    }

    dispatch(createRazorpayOrder(orderData))
  }

  const handleRazorpayPayment = () => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "FashionHub",
      description: "Fashion Purchase",
      order_id: razorpayOrder.id,
      handler: (response) => {
        // Payment successful, verify on backend
        dispatch(
          verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        ).then((result) => {
          if (result.type === "order/verifyPayment/fulfilled") {
            navigate(`/order-confirmation/${result.payload.order.id}`)
          }
        })
      },
      prefill: {
        name: shippingAddress.fullName,
        email: user?.email || "",
        contact: `+91${shippingAddress.phoneNumber}`,
      },
      theme: {
        color: "#ec4899",
      },
      modal: {
        ondismiss: () => {
          dispatch(clearSuccess())
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (!cartItems.length && !loading.creating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="mb-4 text-gray-600">Add some items to your cart to proceed with checkout</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Review your order and complete your purchase</p>
          </div>

          {/* Error Display */}
          {(error || couponError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50"
            >
              {error || couponError}
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="space-y-6 lg:col-span-2">
              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white rounded-lg shadow-md"
              >
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-pink-600" />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        addressErrors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {addressErrors.fullName && <p className="mt-1 text-sm text-red-500">{addressErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) =>
                          handleAddressChange("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className={`w-full px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          addressErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                    {addressErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{addressErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        addressErrors.addressLine1 ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="House/Flat No., Building Name, Street"
                    />
                    {addressErrors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-500">{addressErrors.addressLine1}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Area, Locality (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        addressErrors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your city"
                    />
                    {addressErrors.city && <p className="mt-1 text-sm text-red-500">{addressErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        addressErrors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your state"
                    />
                    {addressErrors.state && <p className="mt-1 text-sm text-red-500">{addressErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">PIN Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.pinCode}
                      onChange={(e) => handleAddressChange("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        addressErrors.pinCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter 6-digit PIN code"
                    />
                    {addressErrors.pinCode && <p className="mt-1 text-sm text-red-500">{addressErrors.pinCode}</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Landmark</label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => handleAddressChange("landmark", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Nearby landmark (Optional)"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Coupon Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white rounded-lg shadow-md"
              >
                <div className="flex items-center mb-4">
                  <Tag className="w-5 h-5 mr-2 text-pink-600" />
                  <h2 className="text-xl font-semibold">Promo Code</h2>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">You saved ₹{appliedCoupon.discountAmount}!</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="p-1 text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    {!showCouponInput ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="font-medium text-pink-600 hover:text-pink-700"
                      >
                        Have a promo code? Click here to apply
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || couponLoading.validating}
                          className="px-4 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading.validating ? "Applying..." : "Apply"}
                        </button>
                        <button
                          onClick={() => {
                            setShowCouponInput(false)
                            setCouponCode("")
                          }}
                          className="px-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky p-6 bg-white rounded-lg shadow-md top-4"
              >
                <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                {/* Cart Items */}
                <div className="mb-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.product._id}-${item.size}`} className="flex items-center space-x-3">
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="object-cover w-16 h-16 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">₹{item.product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({summary.totalItems} items)</span>
                    <span>₹{pricing.subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={pricing.shippingCharges === 0 ? "text-green-600" : ""}>
                      {pricing.shippingCharges === 0 ? "FREE" : `₹${pricing.shippingCharges}`}
                    </span>
                  </div>

                  {pricing.shippingCharges === 0 && (
                    <div className="flex items-center text-xs text-green-600">
                      <Truck className="w-3 h-3 mr-1" />
                      <span>Free shipping on orders above ₹999</span>
                    </div>
                  )}

                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{pricing.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Tax (GST 18%)</span>
                    <span>₹{pricing.tax}</span>
                  </div>

                  <div className="flex justify-between pt-2 text-lg font-semibold border-t">
                    <span>Total</span>
                    <span>₹{pricing.total}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center mt-4 text-xs text-gray-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading.creating || !cartItems.length}
                  className="flex items-center justify-center w-full py-3 mt-6 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.creating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Place Order ₹{pricing.total}
                    </>
                  )}
                </button>

                <p className="mt-2 text-xs text-center text-gray-500">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CheckoutPage
