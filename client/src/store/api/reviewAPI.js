import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

const reviewAPI = {
  // Get product reviews
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),

  // Create review
  createReview: (reviewData) => api.post("/reviews", reviewData),

  // Update review
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),

  // Delete review
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),

  // Get user reviews
  getUserReviews: () => api.get("/reviews/user"),

  // Like/Unlike review
  toggleReviewLike: (reviewId) => api.post(`/reviews/${reviewId}/like`),

  // Report review
  reportReview: (reviewId, reason) => api.post(`/reviews/${reviewId}/report`, { reason }),

  // Get review by ID
  getReviewById: (reviewId) => api.get(`/reviews/${reviewId}`),
}

export default reviewAPI
