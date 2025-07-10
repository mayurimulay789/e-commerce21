import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import wishlistAPI from "../api/wishlistAPI"

// Async thunks
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const response = await wishlistAPI.getWishlist()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist")
  }
})

export const addToWishlist = createAsyncThunk("wishlist/addToWishlist", async (productId, { rejectWithValue }) => {
  try {
    const response = await wishlistAPI.addToWishlist(productId)
    return { ...response.data, productId }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist")
  }
})

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId)
      return { ...response.data, productId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist")
    }
  },
)

export const clearWishlist = createAsyncThunk("wishlist/clearWishlist", async (_, { rejectWithValue }) => {
  try {
    const response = await wishlistAPI.clearWishlist()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to clear wishlist")
  }
})

export const moveToCart = createAsyncThunk("wishlist/moveToCart", async ({ productId, data }, { rejectWithValue }) => {
  try {
    const response = await wishlistAPI.moveToCart(productId, data)
    return { ...response.data, productId }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to move to cart")
  }
})

const initialState = {
  items: [],
  count: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearWishlist: (state) => {
      state.items = []
      state.count = 0
    },
    toggleWishlistItem: (state, action) => {
      const productId = action.payload
      const existingIndex = state.items.findIndex((item) => item._id === productId)

      if (existingIndex > -1) {
        state.items.splice(existingIndex, 1)
        state.count = state.items.length
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.wishlist
        state.count = action.payload.count
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.count = action.payload.wishlistCount
        // Refresh wishlist to get the actual product data
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.productId)
        state.count = action.payload.wishlistCount
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload
      })

      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.count = 0
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Move to Cart
      .addCase(moveToCart.pending, (state) => {
        state.error = null
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.productId)
        state.count = action.payload.wishlistCount
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, toggleWishlistItem } = wishlistSlice.actions
export default wishlistSlice.reducer
