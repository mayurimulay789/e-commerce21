import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import cartAPI from "../api/cartAPI"

// Async thunks
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartAPI.getCart()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cart")
  }
})

export const addToCart = createAsyncThunk("cart/addToCart", async (cartData, { rejectWithValue }) => {
  try {
    const response = await cartAPI.addToCart(cartData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add item to cart")
  }
})

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ itemId, data }, { rejectWithValue }) => {
  try {
    const response = await cartAPI.updateCartItem(itemId, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update cart item")
  }
})

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (itemId, { rejectWithValue }) => {
  try {
    const response = await cartAPI.removeFromCart(itemId)
    return { ...response.data, itemId }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to remove item from cart")
  }
})

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartAPI.clearCart()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to clear cart")
  }
})

const initialState = {
  items: [],
  summary: {
    totalItems: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCart: (state) => {
      state.items = []
      state.summary = initialState.summary
    },
    updateLocalQuantity: (state, action) => {
      const { itemId, quantity } = action.payload
      const item = state.items.find((item) => item._id === itemId)
      if (item) {
        item.quantity = quantity
        item.itemTotal = item.product.price * quantity

        // Recalculate summary
        state.summary.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
        state.summary.subtotal = state.items.reduce((total, item) => total + item.itemTotal, 0)
        state.summary.shipping = state.summary.subtotal > 999 ? 0 : 99
        state.summary.total = state.summary.subtotal + state.summary.shipping
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.cart.items
        state.summary = action.payload.cart.summary
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        // Refresh cart after adding item
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem = action.payload.cartItem
        const itemIndex = state.items.findIndex((item) => item._id === updatedItem._id)
        if (itemIndex > -1) {
          state.items[itemIndex] = { ...state.items[itemIndex], ...updatedItem }
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.itemId)

        // Recalculate summary
        state.summary.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
        state.summary.subtotal = state.items.reduce((total, item) => total + item.itemTotal, 0)
        state.summary.shipping = state.summary.subtotal > 999 ? 0 : 99
        state.summary.total = state.summary.subtotal + state.summary.shipping
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.summary = initialState.summary
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateLocalQuantity } = cartSlice.actions
export default cartSlice.reducer
