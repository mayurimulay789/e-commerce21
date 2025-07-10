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
export const fetchAllBanners = createAsyncThunk("banners/fetchAllBanners", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/banners", { params })
    return response.data
  } catch (error) {
    // Return mock data for development
    const mockData = {
      banners: [
        {
          _id: "1",
          title: "Summer Collection 2024",
          description: "Discover the hottest trends this summer",
          image: "/placeholder.svg?height=600&width=1200&text=Summer+Collection",
          type: "hero",
          isActive: true,
          link: "/products?category=summer",
          buttonText: "Shop Now",
          position: 1,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "50% Off Everything",
          description: "Limited time mega sale",
          image: "/placeholder.svg?height=600&width=1200&text=50%+Off+Sale",
          type: "hero",
          isActive: true,
          link: "/products?sale=true",
          buttonText: "Shop Sale",
          position: 2,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "3",
          title: "New Arrivals",
          description: "Fresh styles just landed",
          image: "/placeholder.svg?height=400&width=800&text=New+Arrivals",
          type: "promo",
          isActive: true,
          link: "/products?filter=new",
          buttonText: "Explore",
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    }
    return mockData
  }
})

export const fetchHeroBanners = createAsyncThunk("banners/fetchHeroBanners", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/banners?type=hero&isActive=true")
    return response.data
  } catch (error) {
    // Return mock data for development
    const mockData = {
      banners: [
        {
          _id: "1",
          title: "Summer Collection 2024",
          description: "Discover the hottest trends this summer with our exclusive collection",
          image: "/placeholder.svg?height=600&width=1200&text=Summer+Collection",
          type: "hero",
          isActive: true,
          link: "/products?category=summer",
          buttonText: "Shop Now",
          position: 1,
        },
        {
          _id: "2",
          title: "50% Off Everything",
          description: "Limited time mega sale on all items",
          image: "/placeholder.svg?height=600&width=1200&text=50%+Off+Sale",
          type: "hero",
          isActive: true,
          link: "/products?sale=true",
          buttonText: "Shop Sale",
          position: 2,
        },
      ],
    }
    return mockData
  }
})

export const fetchPromoBanners = createAsyncThunk("banners/fetchPromoBanners", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/banners?type=promo&isActive=true")
    return response.data
  } catch (error) {
    // Return mock data for development
    const mockData = {
      banners: [
        {
          _id: "3",
          title: "New Arrivals",
          description: "Fresh styles just landed",
          image: "/placeholder.svg?height=300&width=600&text=New+Arrivals",
          type: "promo",
          isActive: true,
          link: "/products?filter=new",
          buttonText: "Explore",
          position: 1,
        },
        {
          _id: "4",
          title: "Free Shipping",
          description: "On orders over ₹999",
          image: "/placeholder.svg?height=300&width=600&text=Free+Shipping",
          type: "promo",
          isActive: true,
          link: "/products",
          buttonText: "Shop Now",
          position: 2,
        },
      ],
    }
    return mockData
  }
})

export const createBanner = createAsyncThunk("banners/createBanner", async (bannerData, { rejectWithValue }) => {
  try {
    const response = await api.post("/banners", bannerData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create banner")
  }
})

export const updateBanner = createAsyncThunk(
  "banners/updateBanner",
  async ({ bannerId, bannerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/banners/${bannerId}`, bannerData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update banner")
    }
  },
)

export const deleteBanner = createAsyncThunk("banners/deleteBanner", async (bannerId, { rejectWithValue }) => {
  try {
    await api.delete(`/banners/${bannerId}`)
    return bannerId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete banner")
  }
})

export const toggleBannerStatus = createAsyncThunk(
  "banners/toggleBannerStatus",
  async (bannerId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/banners/${bannerId}/toggle`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle banner status")
    }
  },
)

const initialState = {
  banners: [],
  heroBanners: [],
  promoBanners: [],
  loading: false,
  error: null,
  success: null,
}

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all banners
      .addCase(fetchAllBanners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.loading = false
        state.banners = action.payload.banners
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch hero banners
      .addCase(fetchHeroBanners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHeroBanners.fulfilled, (state, action) => {
        state.loading = false
        state.heroBanners = action.payload.banners
      })
      .addCase(fetchHeroBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch promo banners
      .addCase(fetchPromoBanners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPromoBanners.fulfilled, (state, action) => {
        state.loading = false
        state.promoBanners = action.payload.banners
      })
      .addCase(fetchPromoBanners.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false
        state.banners.unshift(action.payload.banner)
        state.success = action.payload.message
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false
        const updatedBanner = action.payload.banner
        const index = state.banners.findIndex((banner) => banner._id === updatedBanner._id)
        if (index !== -1) {
          state.banners[index] = updatedBanner
        }
        state.success = action.payload.message
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false
        state.banners = state.banners.filter((banner) => banner._id !== action.payload)
        state.heroBanners = state.heroBanners.filter((banner) => banner._id !== action.payload)
        state.promoBanners = state.promoBanners.filter((banner) => banner._id !== action.payload)
        state.success = "Banner deleted successfully"
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle banner status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedBanner = action.payload.banner
        const updateBannerInArray = (array) => {
          const index = array.findIndex((banner) => banner._id === updatedBanner._id)
          if (index !== -1) {
            array[index] = updatedBanner
          }
        }

        updateBannerInArray(state.banners)
        updateBannerInArray(state.heroBanners)
        updateBannerInArray(state.promoBanners)

        state.success = action.payload.message
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess, setLoading } = bannerSlice.actions
export default bannerSlice.reducer
