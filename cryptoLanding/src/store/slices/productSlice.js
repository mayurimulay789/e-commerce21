import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import productAPI from "../api/productAPI"

// Async thunks
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params, { rejectWithValue }) => {
  try {
    const response = await productAPI.getProducts(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch products")
  }
})

export const fetchTrendingProducts = createAsyncThunk(
  "products/fetchTrendingProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getTrendingProducts()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch trending products")
    }
  },
)

export const fetchNewArrivals = createAsyncThunk("products/fetchNewArrivals", async (_, { rejectWithValue }) => {
  try {
    const response = await productAPI.getNewArrivals()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch new arrivals")
  }
})

export const fetchProductById = createAsyncThunk("products/fetchProductById", async (id, { rejectWithValue }) => {
  try {
    const response = await productAPI.getProductById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch product")
  }
})

const initialState = {
  products: [],
  trendingProducts: [],
  newArrivals: [],
  currentProduct: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    search: "",
  },
}

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Trending Products
      .addCase(fetchTrendingProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.trendingProducts = action.payload.products
      })
      .addCase(fetchTrendingProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.isLoading = false
        state.newArrivals = action.payload.products
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload.product
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
