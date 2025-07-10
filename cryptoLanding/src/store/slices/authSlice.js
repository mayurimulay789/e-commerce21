import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fashionhub_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Async thunks
export const sendOTP = createAsyncThunk("auth/sendOTP", async (phoneNumber, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/send-otp", { phoneNumber })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to send OTP")
  }
})

export const verifyOTP = createAsyncThunk("auth/verifyOTP", async ({ phoneNumber, otp }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/verify-otp", { phoneNumber, otp })

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem("fashionhub_token", response.data.token)
      localStorage.setItem("fashionhub_user", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to verify OTP")
  }
})

// Check authentication status
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("fashionhub_token")
    if (!token) {
      throw new Error("No token found")
    }

    const response = await api.get("/auth/check", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem("fashionhub_user", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    // Clear invalid token
    localStorage.removeItem("fashionhub_token")
    localStorage.removeItem("fashionhub_user")
    return rejectWithValue(error.response?.data?.message || "Authentication failed")
  }
})

// Login user
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", credentials)
    const { token, user } = response.data
    localStorage.setItem("fashionhub_token", token)
    localStorage.setItem("fashionhub_user", JSON.stringify(user))
    return { token, user }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed")
  }
})

// Register user
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", userData)
    const { token, user } = response.data
    localStorage.setItem("fashionhub_token", token)
    localStorage.setItem("fashionhub_user", JSON.stringify(user))
    return { token, user }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Registration failed")
  }
})

// Logout user
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout")
    localStorage.removeItem("fashionhub_token")
    localStorage.removeItem("fashionhub_user")
    return { success: true }
  } catch (error) {
    localStorage.removeItem("fashionhub_token")
    localStorage.removeItem("fashionhub_user")
    return { success: true }
  }
})

// Get current user
export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/me")
    return response.data.user
  } catch (error) {
    localStorage.removeItem("fashionhub_token")
    localStorage.removeItem("fashionhub_user")
    return rejectWithValue(error.response?.data?.message || "Failed to get user")
  }
})

// Update profile
export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put("/auth/profile", profileData)

    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem("fashionhub_user", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update profile")
  }
})

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/change-password", { currentPassword, newPassword })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password")
    }
  },
)

// Upload avatar
export const uploadAvatar = createAsyncThunk("auth/uploadAvatar", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem("fashionhub_user", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to upload avatar")
  }
})

// Get profile
export const getProfile = createAsyncThunk("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/profile")

    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem("fashionhub_user", JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to get profile")
  }
})

// Refresh token
export const refreshToken = createAsyncThunk("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("fashionhub_token")
    const response = await api.post(
      "/auth/refresh-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.data.token) {
      localStorage.setItem("fashionhub_token", response.data.token)
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to refresh token")
  }
})

// Forgot password
export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to send reset email")
  }
})

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password")
    }
  },
)

// Verify email
export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (token, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/verify-email", { token })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to verify email")
  }
})

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem("fashionhub_token")
    const userStr = localStorage.getItem("fashionhub_user")
    const user = userStr ? JSON.parse(userStr) : null

    return {
      user,
      token,
      isAuthenticated: !!(token && user),
      isLoading: false,
      error: null,
      success: null,
      otpSent: false,
      phoneNumber: null,
      isNewUser: false,
      sessionExpiry: null,
    }
  } catch (error) {
    // Clear corrupted data
    localStorage.removeItem("fashionhub_token")
    localStorage.removeItem("fashionhub_user")

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      success: null,
      otpSent: false,
      phoneNumber: null,
      isNewUser: false,
      sessionExpiry: null,
    }
  }
}

const initialState = getInitialState()

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.otpSent = false
      state.phoneNumber = null
      state.isNewUser = false
      state.sessionExpiry = null
      state.error = null
      state.success = null

      // Clear localStorage
      localStorage.removeItem("fashionhub_token")
      localStorage.removeItem("fashionhub_user")
    },

    clearError: (state) => {
      state.error = null
    },

    clearSuccess: (state) => {
      state.success = null
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload
    },

    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload
    },

    clearOtpState: (state) => {
      state.otpSent = false
      state.phoneNumber = null
      state.isNewUser = false
      state.error = null
    },

    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem("fashionhub_user", JSON.stringify(state.user))
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        state.phoneNumber = action.payload.phoneNumber
        state.isNewUser = action.payload.isNewUser
        state.error = null
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.otpSent = false
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.otpSent = false
        state.error = null

        // Set session expiry (30 days from now)
        state.sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.success = "Login successful"
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.success = "Registration successful"
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.success = "Logout successful"
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.error = null
        state.success = action.payload.message
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.success = action.payload.message
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, avatar: action.payload.avatar }
        state.error = null
        state.success = action.payload.message
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload

        // If profile fetch fails, likely token is invalid
        if (action.payload.includes("token") || action.payload.includes("Authentication")) {
          state.user = null
          state.token = null
          state.isAuthenticated = false
          localStorage.removeItem("fashionhub_token")
          localStorage.removeItem("fashionhub_user")
        }
      })

      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload

        // If refresh fails, logout user
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem("fashionhub_token")
        localStorage.removeItem("fashionhub_user")
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.success = action.payload.message
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.success = action.payload.message
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Verify email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, isEmailVerified: true }
        state.error = null
        state.success = action.payload.message
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError, clearSuccess, setLoading, setPhoneNumber, clearOtpState, updateUserData } =
  authSlice.actions

export default authSlice.reducer
