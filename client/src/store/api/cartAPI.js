import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance with interceptors
const cartAPI = axios.create({
  baseURL: `${API_URL}/cart`,
  timeout: 10000,
})

// Request interceptor to add auth token
cartAPI.interceptors.request.use(
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

// Response interceptor to handle errors
cartAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fashionhub_token")
      localStorage.removeItem("fashionhub_user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

const cartAPIService = {
  // Get user's cart
  getCart: () => cartAPI.get("/"),

  // Add item to cart
  addToCart: (cartData) => cartAPI.post("/", cartData),

  // Update cart item
  updateCartItem: (itemId, data) => cartAPI.put(`/${itemId}`, data),

  // Remove item from cart
  removeFromCart: (itemId) => cartAPI.delete(`/${itemId}`),

  // Clear entire cart
  clearCart: () => cartAPI.delete("/"),
}

export default cartAPIService
