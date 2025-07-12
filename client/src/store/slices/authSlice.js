import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth"
import { auth, cleanupRecaptcha } from "../../config/firebase.js"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      try {
        const idToken = await user.getIdToken(true) // Force refresh
        config.headers.Authorization = `Bearer ${idToken}`
      } catch (error) {
        console.error("Error getting ID token:", error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const user = auth.currentUser
        if (user) {
          // Try to refresh the token
          const newToken = await user.getIdToken(true)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
      }

      // If refresh fails, sign out user
      try {
        await firebaseSignOut(auth)
      } catch (signOutError) {
        console.error("Error signing out:", signOutError)
      }

      // Clear local storage
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")

      // Redirect to login if not already there
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

// Check Auth Status
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user")
    }

    // Get fresh token and verify with backend
    const idToken = await user.getIdToken(true)
    const response = await api.post("/auth/verify-token", { idToken })

    // Update local storage
    localStorage.setItem("user", JSON.stringify(response.data.user))
    localStorage.setItem("authToken", response.data.jwtToken)

    return {
      firebaseUser: {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
      },
      user: response.data.user,
      jwtToken: response.data.jwtToken,
    }
  } catch (error) {
    console.error("Check auth error:", error)

    // Clear invalid auth data
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")

    return rejectWithValue(error.response?.data?.message || "Authentication failed")
  }
})

// Upload Avatar
export const uploadAvatar = createAsyncThunk("auth/uploadAvatar", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Update local storage
    localStorage.setItem("user", JSON.stringify(response.data.user))

    return response.data
  } catch (error) {
    console.error("Upload avatar error:", error)
    return rejectWithValue(error.response?.data?.message || "Failed to upload avatar")
  }
})

// Email Authentication Thunks
export const registerWithEmail = createAsyncThunk(
  "auth/registerWithEmail",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update Firebase profile
      await updateFirebaseProfile(firebaseUser, {
        displayName: name,
      })

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // Register user in backend
      const response = await axios.post(`${API_BASE_URL}/auth/register/email`, {
        email,
        password,
        name,
      })

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("authToken", response.data.jwtToken)

      return {
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
        },
        user: response.data.user,
        customToken: response.data.customToken,
        jwtToken: response.data.jwtToken,
      }
    } catch (error) {
      console.error("Email registration error:", error)

      if (error.code) {
        // Firebase error
        switch (error.code) {
          case "auth/email-already-in-use":
            return rejectWithValue("An account with this email already exists")
          case "auth/weak-password":
            return rejectWithValue("Password is too weak. Please choose a stronger password.")
          case "auth/invalid-email":
            return rejectWithValue("Invalid email address")
          case "auth/operation-not-allowed":
            return rejectWithValue("Email/password accounts are not enabled")
          case "auth/network-request-failed":
            return rejectWithValue("Network error. Please check your connection.")
          default:
            return rejectWithValue("Registration failed. Please try again.")
        }
      }
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  },
)

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get ID token and verify with backend
      const idToken = await firebaseUser.getIdToken()
      const response = await api.post("/auth/verify-token", { idToken })

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("authToken", response.data.jwtToken)

      return {
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
        },
        user: response.data.user,
        jwtToken: response.data.jwtToken,
      }
    } catch (error) {
      console.error("Email login error:", error)

      if (error.code) {
        // Firebase error
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            return rejectWithValue("Invalid email or password")
          case "auth/invalid-email":
            return rejectWithValue("Invalid email address")
          case "auth/user-disabled":
            return rejectWithValue("This account has been disabled")
          case "auth/too-many-requests":
            return rejectWithValue("Too many failed attempts. Please try again later.")
          case "auth/network-request-failed":
            return rejectWithValue("Network error. Please check your connection.")
          case "auth/invalid-credential":
            return rejectWithValue("Invalid email or password")
          default:
            return rejectWithValue("Login failed. Please try again.")
        }
      }
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

// Phone Authentication Thunks
export const sendPhoneOTP = createAsyncThunk("auth/sendPhoneOTP", async (phoneNumber, { rejectWithValue }) => {
  try {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved:", response)
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired")
          window.recaptchaVerifier = null
        },
      })
    }

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)

    return {
      phoneNumber,
      confirmationResult,
      message: "OTP sent successfully",
    }
  } catch (error) {
    console.error("Send phone OTP error:", error)

    // Clean up reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }

    switch (error.code) {
      case "auth/invalid-phone-number":
        return rejectWithValue("Invalid phone number format")
      case "auth/too-many-requests":
        return rejectWithValue("Too many requests. Please try again later.")
      case "auth/captcha-check-failed":
        return rejectWithValue("reCAPTCHA verification failed. Please try again.")
      case "auth/network-request-failed":
        return rejectWithValue("Network error. Please check your connection.")
      default:
        return rejectWithValue("Failed to send OTP. Please try again.")
    }
  }
})

export const verifyPhoneOTP = createAsyncThunk(
  "auth/verifyPhoneOTP",
  async ({ confirmationResult, otp }, { rejectWithValue }) => {
    try {
      // Verify OTP
      const userCredential = await confirmationResult.confirm(otp)
      const firebaseUser = userCredential.user

      // Get ID token and verify with backend
      const idToken = await firebaseUser.getIdToken()
      const response = await api.post("/auth/verify-token", { idToken })

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("authToken", response.data.jwtToken)

      // Clean up reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }

      return {
        firebaseUser: {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
        user: response.data.user,
        jwtToken: response.data.jwtToken,
      }
    } catch (error) {
      console.error("Verify phone OTP error:", error)

      switch (error.code) {
        case "auth/invalid-verification-code":
          return rejectWithValue("Invalid verification code")
        case "auth/code-expired":
          return rejectWithValue("Verification code has expired")
        case "auth/too-many-requests":
          return rejectWithValue("Too many requests. Please try again later.")
        default:
          return rejectWithValue("Failed to verify OTP. Please try again.")
      }
    }
  },
)

// Legacy functions for backward compatibility
export const sendOTP = sendPhoneOTP
export const verifyOTP = verifyPhoneOTP

// Legacy login function for backward compatibility
export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  return loginWithEmail({ email, password }, { rejectWithValue })
})

// Legacy register function for backward compatibility
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password, name }, { rejectWithValue }) => {
    return registerWithEmail({ email, password, name }, { rejectWithValue })
  },
)

// Common Authentication Thunks
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    // Call backend logout
    await api.post("/auth/logout")

    // Sign out from Firebase
    await firebaseSignOut(auth)

    // Clear local storage
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")

    // Clean up reCAPTCHA
    cleanupRecaptcha()

    return { success: true }
  } catch (error) {
    // Even if backend call fails, still sign out locally
    try {
      await firebaseSignOut(auth)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      cleanupRecaptcha()
    } catch (signOutError) {
      console.error("Error signing out:", signOutError)
    }

    return { success: true }
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { message: "Password reset email sent successfully" }
  } catch (error) {
    console.error("Forgot password error:", error)

    switch (error.code) {
      case "auth/user-not-found":
        return rejectWithValue("No account found with this email address")
      case "auth/invalid-email":
        return rejectWithValue("Invalid email address")
      case "auth/too-many-requests":
        return rejectWithValue("Too many requests. Please try again later.")
      case "auth/network-request-failed":
        return rejectWithValue("Network error. Please check your connection.")
      default:
        return rejectWithValue("Failed to send password reset email")
    }
  }
})

export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user")
    }

    // Update Firebase profile if name is provided
    if (profileData.name && profileData.name !== user.displayName) {
      await updateFirebaseProfile(user, {
        displayName: profileData.name,
      })
    }

    // Update backend profile
    const response = await api.put("/auth/profile", profileData)

    // Update local storage
    localStorage.setItem("user", JSON.stringify(response.data.user))

    return response.data
  } catch (error) {
    console.error("Update profile error:", error)
    return rejectWithValue(error.response?.data?.message || "Failed to update profile")
  }
})

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user")
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      return { message: "Password updated successfully" }
    } catch (error) {
      console.error("Change password error:", error)

      switch (error.code) {
        case "auth/wrong-password":
          return rejectWithValue("Current password is incorrect")
        case "auth/weak-password":
          return rejectWithValue("New password is too weak")
        case "auth/requires-recent-login":
          return rejectWithValue("Please log in again to change your password")
        case "auth/too-many-requests":
          return rejectWithValue("Too many requests. Please try again later.")
        default:
          return rejectWithValue("Failed to change password")
      }
    }
  },
)

export const sendVerificationEmail = createAsyncThunk("auth/sendVerificationEmail", async (_, { rejectWithValue }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user")
    }

    await sendEmailVerification(user)
    return { message: "Verification email sent successfully" }
  } catch (error) {
    console.error("Send verification email error:", error)

    switch (error.code) {
      case "auth/too-many-requests":
        return rejectWithValue("Too many requests. Please try again later.")
      case "auth/network-request-failed":
        return rejectWithValue("Network error. Please check your connection.")
      default:
        return rejectWithValue("Failed to send verification email")
    }
  }
})

export const deleteAccount = createAsyncThunk("auth/deleteAccount", async (_, { rejectWithValue }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user")
    }

    // Delete from backend first
    await api.delete("/auth/account")

    // Delete Firebase user
    await deleteUser(user)

    // Clear local storage
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")

    // Clean up reCAPTCHA
    cleanupRecaptcha()

    return { success: true }
  } catch (error) {
    console.error("Delete account error:", error)

    if (error.code === "auth/requires-recent-login") {
      return rejectWithValue("Please log in again to delete your account")
    }
    return rejectWithValue(error.response?.data?.message || "Failed to delete account")
  }
})

export const getProfile = createAsyncThunk("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/profile")

    // Update local storage
    localStorage.setItem("user", JSON.stringify(response.data.user))

    return response.data
  } catch (error) {
    console.error("Get profile error:", error)
    return rejectWithValue(error.response?.data?.message || "Failed to get profile")
  }
})

export const refreshUserData = createAsyncThunk("auth/refreshUserData", async (_, { rejectWithValue }) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user")
    }

    // Reload Firebase user to get latest data
    await reload(user)

    // Get updated profile from backend
    const response = await api.get("/auth/profile")

    // Update local storage
    localStorage.setItem("user", JSON.stringify(response.data.user))

    return {
      firebaseUser: {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
      },
      user: response.data.user,
    }
  } catch (error) {
    console.error("Refresh user data error:", error)
    return rejectWithValue(error.response?.data?.message || "Failed to refresh user data")
  }
})

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const userStr = localStorage.getItem("user")
    const authToken = localStorage.getItem("authToken")
    const user = userStr ? JSON.parse(userStr) : null

    return {
      user,
      firebaseUser: null,
      isAuthenticated: !!user && !!authToken,
      isLoading: false,
      error: null,
      success: null,
      authStateChecked: false,
      authToken,
      // Phone auth state
      phoneNumber: null,
      confirmationResult: null,
      phoneAuthLoading: false,
    }
  } catch (error) {
    // Clear corrupted data
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")

    return {
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      success: null,
      authStateChecked: false,
      authToken: null,
      phoneNumber: null,
      confirmationResult: null,
      phoneAuthLoading: false,
    }
  }
}

const initialState = getInitialState()

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setFirebaseUser: (state, action) => {
      state.firebaseUser = action.payload
      state.authStateChecked = true

      // Update email verification status if user exists
      if (action.payload && state.user) {
        if (action.payload.emailVerified !== undefined) {
          state.user.isVerified = action.payload.emailVerified
        }
        localStorage.setItem("user", JSON.stringify(state.user))
      }
    },

    clearError: (state) => {
      state.error = null
    },

    clearSuccess: (state) => {
      state.success = null
    },

    clearPhoneAuthState: (state) => {
      state.phoneNumber = null
      state.confirmationResult = null
      state.phoneAuthLoading = false
    },

    // Legacy reducer for backward compatibility
    clearOtpState: (state) => {
      state.phoneNumber = null
      state.confirmationResult = null
      state.phoneAuthLoading = false
    },

    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem("user", JSON.stringify(state.user))
      }
    },

    logout: (state) => {
      state.user = null
      state.firebaseUser = null
      state.isAuthenticated = false
      state.error = null
      state.success = null
      state.authToken = null
      state.phoneNumber = null
      state.confirmationResult = null
      state.phoneAuthLoading = false

      // Clear localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")

      // Clean up reCAPTCHA
      cleanupRecaptcha()
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload
    },

    setAuthToken: (state, action) => {
      state.authToken = action.payload
      if (action.payload) {
        localStorage.setItem("authToken", action.payload)
      } else {
        localStorage.removeItem("authToken")
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.authStateChecked = true
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
        state.authStateChecked = true
      })

      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.success = action.payload.message
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Register with Email
      .addCase(registerWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.success = "Registration successful! Please check your email for verification."
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
      })

      // Login with Email
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.success = "Login successful!"
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
      })

      // Send Phone OTP
      .addCase(sendPhoneOTP.pending, (state) => {
        state.phoneAuthLoading = true
        state.error = null
        state.success = null
      })
      .addCase(sendPhoneOTP.fulfilled, (state, action) => {
        state.phoneAuthLoading = false
        state.phoneNumber = action.payload.phoneNumber
        state.confirmationResult = action.payload.confirmationResult
        state.success = action.payload.message
      })
      .addCase(sendPhoneOTP.rejected, (state, action) => {
        state.phoneAuthLoading = false
        state.error = action.payload
        state.phoneNumber = null
        state.confirmationResult = null
      })

      // Verify Phone OTP
      .addCase(verifyPhoneOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(verifyPhoneOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.success = "Phone verification successful!"
        state.phoneNumber = null
        state.confirmationResult = null
        state.phoneAuthLoading = false
      })
      .addCase(verifyPhoneOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
      })

      // Legacy Register User (for backward compatibility)
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.success = "Registration successful! Please check your email for verification."
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
      })

      // Legacy Login User (for backward compatibility)
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
        state.authToken = action.payload.jwtToken
        state.success = "Login successful!"
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.firebaseUser = null
        state.authToken = null
      })

      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.firebaseUser = null
        state.isAuthenticated = false
        state.authToken = null
        state.phoneNumber = null
        state.confirmationResult = null
        state.phoneAuthLoading = false
        state.success = "Logged out successfully"
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false
        // Still clear user data even if logout fails
        state.user = null
        state.firebaseUser = null
        state.isAuthenticated = false
        state.authToken = null
        state.phoneNumber = null
        state.confirmationResult = null
        state.phoneAuthLoading = false
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
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
        state.success = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Send Verification Email
      .addCase(sendVerificationEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(sendVerificationEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.firebaseUser = null
        state.isAuthenticated = false
        state.authToken = null
        state.phoneNumber = null
        state.confirmationResult = null
        state.phoneAuthLoading = false
        state.success = "Account deleted successfully"
      })
      .addCase(deleteAccount.rejected, (state, action) => {
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
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload

        // If profile fetch fails, likely token is invalid
        if (action.payload?.includes("token") || action.payload?.includes("Authentication")) {
          state.user = null
          state.firebaseUser = null
          state.isAuthenticated = false
          state.authToken = null
          localStorage.removeItem("user")
          localStorage.removeItem("authToken")
        }
      })

      // Refresh User Data
      .addCase(refreshUserData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.firebaseUser = action.payload.firebaseUser
        state.isAuthenticated = true
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  setFirebaseUser,
  clearError,
  clearSuccess,
  clearPhoneAuthState,
  clearOtpState,
  updateUserData,
  logout,
  setLoading,
  setAuthToken,
} = authSlice.actions

export default authSlice.reducer
