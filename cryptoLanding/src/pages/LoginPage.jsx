"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Shield, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { sendOTP, verifyOTP, clearError, clearOtpState } from "../store/slices/authSlice"
import toast from "react-hot-toast"

const LoginPage = () => {
  const [step, setStep] = useState("phone") // "phone" or "otp"
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    isLoading,
    error,
    otpSent,
    isAuthenticated,
    isNewUser,
    phoneNumber: sentPhoneNumber,
  } = useSelector((state) => state.auth)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Handle OTP sent state
  useEffect(() => {
    if (otpSent) {
      setStep("otp")
      setCountdown(60) // 60 seconds countdown
      toast.success("OTP sent successfully!")
    }
  }, [otpSent])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as +91 XXXXX XXXXX
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{5})/, "$1 $2").trim()
    }
    return digits.slice(0, 10).replace(/(\d{5})(\d{5})/, "$1 $2")
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    const cleanPhone = phoneNumber.replace(/\s/g, "")

    if (!/^[6789]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit mobile number")
      return
    }

    dispatch(clearError())

    try {
      await dispatch(sendOTP(cleanPhone)).unwrap()
    } catch (error) {
      toast.error(error || "Failed to send OTP")
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()

    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP")
      return
    }

    dispatch(clearError())

    try {
      const result = await dispatch(
        verifyOTP({
          phoneNumber: sentPhoneNumber || phoneNumber,
          otp,
        }),
      ).unwrap()

      if (result.success) {
        toast.success(result.message)

        // Redirect based on user role or intended destination
        const from = location.state?.from?.pathname || "/"
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(error || "Invalid OTP")
      setOtp("")
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return

    setIsResending(true)
    dispatch(clearError())

    try {
      await dispatch(sendOTP(sentPhoneNumber || phoneNumber)).unwrap()
      setCountdown(60)
      toast.success("OTP resent successfully!")
    } catch (error) {
      toast.error(error || "Failed to resend OTP")
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToPhone = () => {
    setStep("phone")
    setOtp("")
    setCountdown(0)
    dispatch(clearOtpState())
  }

  const handleOtpChange = (value) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setOtp(digits)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
            >
              {step === "phone" ? <Phone className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
            </motion.div>

            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              {step === "phone" ? "Welcome to FashionHub" : "Verify Your Number"}
            </h1>

            <p className="text-gray-600">
              {step === "phone"
                ? "Enter your mobile number to get started"
                : `We've sent a 6-digit code to ${sentPhoneNumber || phoneNumber}`}
            </p>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center p-3 mb-4 space-x-2 border border-red-200 rounded-lg bg-red-50"
              >
                <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Number Step */}
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.form
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-sm text-gray-500">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      placeholder="Enter your mobile number"
                      className="w-full py-3 pl-12 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      maxLength={11}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">We'll send you a verification code</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || !phoneNumber.trim()}
                  className="flex items-center justify-center w-full py-3 space-x-2 font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <Phone className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* OTP Verification Step */}
            {step === "otp" && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 text-lg tracking-widest text-center transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    maxLength={6}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">Resend code in {countdown} seconds</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-sm font-medium text-pink-600 hover:text-pink-700 disabled:opacity-50"
                    >
                      {isResending ? "Resending..." : "Resend OTP"}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex items-center justify-center w-full py-3 space-x-2 font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="flex items-center justify-center w-full py-2 space-x-2 text-gray-600 transition-colors hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change Phone Number</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* New User Indicator */}
          <AnimatePresence>
            {isNewUser && step === "otp" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center p-3 mt-4 space-x-2 border border-green-200 rounded-lg bg-green-50"
              >
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">New account will be created for this number</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-pink-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-pink-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
