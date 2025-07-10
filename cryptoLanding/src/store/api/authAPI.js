import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance with interceptors
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 10000,
})

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fashionhub_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token expiry
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("fashionhub_token")
      localStorage.removeItem("fashionhub_user")

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

const authAPIService = {
  // Send OTP to phone number
  sendOTP: (phoneNumber) => authAPI.post("/send-otp", { phoneNumber }),

  // Verify OTP and login/register
  verifyOTP: (phoneNumber, otp) => authAPI.post("/verify-otp", { phoneNumber, otp }),

  // Update user profile
  updateProfile: (profileData) => authAPI.put("/profile", profileData),

  // Get user profile
  getProfile: () => authAPI.get("/profile"),

  // Refresh JWT token
  refreshToken: () => authAPI.post("/refresh-token"),

  // Logout user
  logout: () => authAPI.post("/logout"),

  // Check authentication status
  checkAuth: () => authAPI.get("/check"),
}

export default authAPIService
