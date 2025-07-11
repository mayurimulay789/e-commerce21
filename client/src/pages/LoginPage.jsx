"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import {
  registerWithEmail,
  loginWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  forgotPassword,
  clearError,
  clearSuccess,
  clearPhoneAuthState,
} from "../store/slices/authSlice"
import toast from "react-hot-toast"

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, error, success, isAuthenticated, phoneNumber, confirmationResult, phoneAuthLoading } = useSelector(
    (state) => state.auth,
  )

  // UI State
  const [activeTab, setActiveTab] = useState("email") // 'email' or 'phone'
  const [mode, setMode] = useState("login") // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })

  // Phone Form State
  const [phoneForm, setPhoneForm] = useState({
    phoneNumber: "",
    otp: "",
  })

  // OTP Timer
  const [otpTimer, setOtpTimer] = useState(0)

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success)
      dispatch(clearSuccess())
    }
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [success, error, dispatch])

  // OTP Timer Effect
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  // Handle Email Form Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (mode === "register") {
      // Validation
      if (!emailForm.name.trim()) {
        toast.error("Name is required")
        return
      }
      if (emailForm.password !== emailForm.confirmPassword) {
        toast.error("Passwords don't match")
        return
      }
      if (emailForm.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }

      dispatch(
        registerWithEmail({
          email: emailForm.email,
          password: emailForm.password,
          name: emailForm.name,
        }),
      )
    } else {
      dispatch(
        loginWithEmail({
          email: emailForm.email,
          password: emailForm.password,
        }),
      )
    }
  }

  // Handle Phone Form Submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()

    if (!confirmationResult) {
      // Send OTP
      if (!phoneForm.phoneNumber.trim()) {
        toast.error("Phone number is required")
        return
      }

      // Basic phone validation
      if (!phoneForm.phoneNumber.startsWith("+")) {
        toast.error("Please include country code (e.g., +1)")
        return
      }

      dispatch(sendPhoneOTP(phoneForm.phoneNumber))
      setOtpTimer(60) // 60 seconds timer
    } else {
      // Verify OTP
      if (!phoneForm.otp.trim()) {
        toast.error("OTP is required")
        return
      }

      if (phoneForm.otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP")
        return
      }

      dispatch(
        verifyPhoneOTP({
          confirmationResult,
          otp: phoneForm.otp,
        }),
      )
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!forgotEmail.trim()) {
      toast.error("Email is required")
      return
    }

    dispatch(forgotPassword(forgotEmail))
    setShowForgotPassword(false)
    setForgotEmail("")
  }

  // Resend OTP
  const handleResendOTP = () => {
    if (otpTimer > 0) return

    dispatch(sendPhoneOTP(phoneForm.phoneNumber))
    setOtpTimer(60)
  }

  // Reset forms when switching tabs or modes
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    dispatch(clearPhoneAuthState())
    setEmailForm({ email: "", password: "", name: "", confirmPassword: "" })
    setPhoneForm({ phoneNumber: "", otp: "" })
    setOtpTimer(0)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    dispatch(clearPhoneAuthState())
    setEmailForm({ email: "", password: "", name: "", confirmPassword: "" })
    setPhoneForm({ phoneNumber: "", otp: "" })
    setOtpTimer(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/placeholder-logo.png" alt="Fashion Store" className="h-12 mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-600">
            {mode === "login" ? "Sign in to your account to continue" : "Join us and start your fashion journey"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "login" ? "bg-white text-pink-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange("register")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "register" ? "bg-white text-pink-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex bg-gray-50 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleTabChange("email")}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "email" ? "bg-white text-pink-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
            <button
              onClick={() => handleTabChange("phone")}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "phone" ? "bg-white text-pink-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === "email" && (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={emailForm.name}
                          onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={emailForm.confirmPassword}
                          onChange={(e) => setEmailForm({ ...emailForm, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === "phone" && (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  {!confirmationResult ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={phoneForm.phoneNumber}
                          onChange={(e) => setPhoneForm({ ...phoneForm, phoneNumber: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Verification Code Sent</h3>
                        <p className="text-sm text-gray-600">
                          We've sent a 6-digit code to
                          <br />
                          <span className="font-medium">{phoneForm.phoneNumber}</span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                        <input
                          type="text"
                          value={phoneForm.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                            setPhoneForm({ ...phoneForm, otp: value })
                          }}
                          className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-center text-2xl font-mono tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={otpTimer > 0 || phoneAuthLoading}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {otpTimer > 0
                            ? `Resend code in ${otpTimer}s`
                            : phoneAuthLoading
                              ? "Sending..."
                              : "Resend code"}
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || phoneAuthLoading}
                    className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading || phoneAuthLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {!confirmationResult ? "Send Code" : "Verify & Continue"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>

                  {confirmationResult && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearPhoneAuthState())
                        setPhoneForm({ phoneNumber: "", otp: "" })
                        setOtpTimer(0)
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium"
                    >
                      Change Phone Number
                    </button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-pink-600 hover:text-pink-700 font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-pink-600 hover:text-pink-700 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowForgotPassword(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Reset Password</h3>
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* reCAPTCHA container for phone auth */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  )
}

export default LoginPage
