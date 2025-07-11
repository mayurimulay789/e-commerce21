import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as reviewAPI from "../api/reviewAPI"

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  "review/fetchProductReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getProductReviews(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reviews")
    }
  },
)

export const createReview = createAsyncThunk("review/createReview", async (reviewData, { rejectWithValue }) => {
  try {
    const response = await reviewAPI.createReview(reviewData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create review")
  }
})

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.updateReview(reviewId, reviewData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update review")
    }
  },
)

export const deleteReview = createAsyncThunk("review/deleteReview", async (reviewId, { rejectWithValue }) => {
  try {
    await reviewAPI.deleteReview(reviewId)
    return reviewId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete review")
  }
})

export const likeReview = createAsyncThunk("review/likeReview", async (reviewId, { rejectWithValue }) => {
  try {
    const response = await reviewAPI.likeReview(reviewId)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to like review")
  }
})

const initialState = {
  reviews: [],
  currentProductReviews: [],
  loading: false,
  error: null,
  reviewStats: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  },
}

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProductReviews: (state) => {
      state.currentProductReviews = []
      state.reviewStats = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    },
    calculateReviewStats: (state) => {
      const reviews = state.currentProductReviews
      const totalReviews = reviews.length

      if (totalReviews === 0) {
        state.reviewStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }
        return
      }

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      let totalRating = 0

      reviews.forEach((review) => {
        const rating = review.rating
        ratingDistribution[rating]++
        totalRating += rating
      })

      state.reviewStats = {
        averageRating: (totalRating / totalReviews).toFixed(1),
        totalReviews,
        ratingDistribution,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false
        state.currentProductReviews = action.payload
        // Calculate stats
        reviewSlice.caseReducers.calculateReviewStats(state)
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false
        state.currentProductReviews.unshift(action.payload)
        reviewSlice.caseReducers.calculateReviewStats(state)
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.currentProductReviews.findIndex((review) => review._id === action.payload._id)
        if (index !== -1) {
          state.currentProductReviews[index] = action.payload
          reviewSlice.caseReducers.calculateReviewStats(state)
        }
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.currentProductReviews = state.currentProductReviews.filter((review) => review._id !== action.payload)
        reviewSlice.caseReducers.calculateReviewStats(state)
      })
      // Like review
      .addCase(likeReview.fulfilled, (state, action) => {
        const index = state.currentProductReviews.findIndex((review) => review._id === action.payload._id)
        if (index !== -1) {
          state.currentProductReviews[index] = action.payload
        }
      })
  },
})

export const { clearError, clearCurrentProductReviews, calculateReviewStats } = reviewSlice.actions
export default reviewSlice.reducer
