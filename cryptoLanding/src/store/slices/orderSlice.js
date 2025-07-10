import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { orderAPI } from "../api/orderAPI"

// Async thunks
export const createRazorpayOrder = createAsyncThunk(
  "order/createRazorpayOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createRazorpayOrder(orderData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order")
    }
  },
)

export const verifyPayment = createAsyncThunk("order/verifyPayment", async (paymentData, { rejectWithValue }) => {
  try {
    const response = await orderAPI.verifyPayment(paymentData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Payment verification failed")
  }
})

export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getUserOrders(page, limit)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders")
    }
  },
)

export const fetchOrderDetails = createAsyncThunk("order/fetchOrderDetails", async (orderId, { rejectWithValue }) => {
  try {
    const response = await orderAPI.getOrderDetails(orderId)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch order details")
  }
})

export const cancelOrder = createAsyncThunk("order/cancelOrder", async ({ orderId, reason }, { rejectWithValue }) => {
  try {
    const response = await orderAPI.cancelOrder(orderId, reason)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to cancel order")
  }
})

const initialState = {
  orders: [],
  currentOrder: null,
  razorpayOrder: null,
  orderSummary: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: {
    creating: false,
    verifying: false,
    fetching: false,
    cancelling: false,
  },
  error: null,
  success: {
    orderCreated: false,
    paymentVerified: false,
    orderCancelled: false,
  },
}

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = {
        orderCreated: false,
        paymentVerified: false,
        orderCancelled: false,
      }
    },
    clearRazorpayOrder: (state) => {
      state.razorpayOrder = null
      state.orderSummary = null
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Razorpay Order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading.creating = true
        state.error = null
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading.creating = false
        state.razorpayOrder = action.payload.razorpayOrder
        state.orderSummary = action.payload.orderSummary
        state.success.orderCreated = true
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading.creating = false
        state.error = action.payload
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading.verifying = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading.verifying = false
        state.currentOrder = action.payload.order
        state.success.paymentVerified = true
        state.razorpayOrder = null
        state.orderSummary = null
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading.verifying = false
        state.error = action.payload
      })

      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading.fetching = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })

      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading.fetching = true
        state.error = null
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.currentOrder = action.payload.order
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading.cancelling = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading.cancelling = false
        state.success.orderCancelled = true
        // Update the order in the orders array
        const index = state.orders.findIndex((order) => order._id === action.payload.order._id)
        if (index !== -1) {
          state.orders[index] = action.payload.order
        }
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === action.payload.order._id) {
          state.currentOrder = action.payload.order
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading.cancelling = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess, clearRazorpayOrder, setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
