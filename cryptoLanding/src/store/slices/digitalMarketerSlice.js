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

// Marketing Analytics
export const fetchMarketingAnalytics = createAsyncThunk(
  "digitalMarketer/fetchMarketingAnalytics",
  async (period = "7d", { rejectWithValue }) => {
    try {
      const response = await api.get(`/marketing/analytics?period=${period}`)
      return response.data
    } catch (error) {
      // Return mock data for development
      const mockData = {
        summary: {
          totalRevenue: 125000,
          totalOrders: 450,
          totalUsers: 1250,
          conversionRate: "3.2%",
          avgSessionDuration: "4m 32s",
          bounceRate: "42%",
        },
        trafficData: [
          { date: new Date().toISOString(), pageViews: 1200, uniqueVisitors: 800 },
          { date: new Date(Date.now() - 86400000).toISOString(), pageViews: 1100, uniqueVisitors: 750 },
          { date: new Date(Date.now() - 172800000).toISOString(), pageViews: 1300, uniqueVisitors: 900 },
          { date: new Date(Date.now() - 259200000).toISOString(), pageViews: 1000, uniqueVisitors: 700 },
          { date: new Date(Date.now() - 345600000).toISOString(), pageViews: 1400, uniqueVisitors: 950 },
        ],
        salesAnalytics: [
          { _id: new Date().toISOString(), sales: 25000 },
          { _id: new Date(Date.now() - 86400000).toISOString(), sales: 22000 },
          { _id: new Date(Date.now() - 172800000).toISOString(), sales: 28000 },
          { _id: new Date(Date.now() - 259200000).toISOString(), sales: 20000 },
          { _id: new Date(Date.now() - 345600000).toISOString(), sales: 30000 },
        ],
        topProducts: [
          { _id: "1", product: { name: "Designer Dress" }, totalSold: 45, revenue: 22500 },
          { _id: "2", product: { name: "Casual Shirt" }, totalSold: 38, revenue: 15200 },
          { _id: "3", product: { name: "Denim Jeans" }, totalSold: 32, revenue: 12800 },
          { _id: "4", product: { name: "Summer Top" }, totalSold: 28, revenue: 8400 },
          { _id: "5", product: { name: "Formal Blazer" }, totalSold: 25, revenue: 18750 },
        ],
        topCategories: [
          { _id: "1", category: { name: "Women's Clothing" }, totalSold: 120, revenue: 48000 },
          { _id: "2", category: { name: "Men's Clothing" }, totalSold: 95, revenue: 38000 },
          { _id: "3", category: { name: "Accessories" }, totalSold: 75, revenue: 15000 },
          { _id: "4", category: { name: "Footwear" }, totalSold: 60, revenue: 24000 },
        ],
        userDemographics: {
          ageGroups: [
            { range: "18-25", percentage: 35 },
            { range: "26-35", percentage: 40 },
            { range: "36-45", percentage: 20 },
            { range: "46+", percentage: 5 },
          ],
          devices: [
            { type: "Mobile", percentage: 65 },
            { type: "Desktop", percentage: 30 },
            { type: "Tablet", percentage: 5 },
          ],
          locations: [
            { city: "Mumbai", percentage: 25, count: 312 },
            { city: "Delhi", percentage: 20, count: 250 },
            { city: "Bangalore", percentage: 18, count: 225 },
            { city: "Chennai", percentage: 15, count: 187 },
            { city: "Kolkata", percentage: 12, count: 150 },
          ],
        },
      }
      return mockData
    }
  },
)

// SEO Management
export const fetchSEOData = createAsyncThunk("digitalMarketer/fetchSEOData", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/seo")
    return response.data
  } catch (error) {
    // Return mock data for development
    const mockData = [
      {
        page: "home",
        title: "Fashion Hub - Latest Trends & Styles",
        description:
          "Discover the latest fashion trends and styles at Fashion Hub. Shop premium clothing, accessories, and more.",
        keywords: "fashion, clothing, trends, style, shopping",
        metaTags: {
          "og:title": "Fashion Hub - Latest Trends & Styles",
          "og:description": "Discover the latest fashion trends and styles",
          "og:image": "/images/og-home.jpg",
        },
      },
      {
        page: "products",
        title: "Products - Fashion Hub",
        description:
          "Browse our extensive collection of fashion products including clothing, accessories, and footwear.",
        keywords: "products, fashion products, clothing, accessories",
        metaTags: {
          "og:title": "Products - Fashion Hub",
          "og:description": "Browse our extensive collection of fashion products",
          "og:image": "/images/og-products.jpg",
        },
      },
    ]
    return { seoData: mockData }
  }
})

export const updateSEOData = createAsyncThunk("digitalMarketer/updateSEOData", async (seoData, { rejectWithValue }) => {
  try {
    const response = await api.put("/seo", seoData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update SEO data")
  }
})

// Campaign Management
export const fetchAllCampaigns = createAsyncThunk(
  "digitalMarketer/fetchAllCampaigns",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/campaigns", { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      const mockData = {
        campaigns: [
          {
            _id: "1",
            name: "Summer Sale 2024",
            type: "discount",
            status: "active",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 50000,
            spent: 25000,
            impressions: 125000,
            clicks: 3750,
            conversions: 120,
          },
          {
            _id: "2",
            name: "New Arrivals Promotion",
            type: "promotion",
            status: "active",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 30000,
            spent: 15000,
            impressions: 85000,
            clicks: 2550,
            conversions: 85,
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCampaigns: 2,
        },
      }
      return mockData
    }
  },
)

export const createCampaign = createAsyncThunk(
  "digitalMarketer/createCampaign",
  async (campaignData, { rejectWithValue }) => {
    try {
      const response = await api.post("/campaigns", campaignData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create campaign")
    }
  },
)

export const updateCampaign = createAsyncThunk(
  "digitalMarketer/updateCampaign",
  async ({ campaignId, campaignData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, campaignData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update campaign")
    }
  },
)

export const deleteCampaign = createAsyncThunk(
  "digitalMarketer/deleteCampaign",
  async (campaignId, { rejectWithValue }) => {
    try {
      await api.delete(`/campaigns/${campaignId}`)
      return campaignId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete campaign")
    }
  },
)

export const fetchCampaignAnalytics = createAsyncThunk(
  "digitalMarketer/fetchCampaignAnalytics",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/analytics`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch campaign analytics")
    }
  },
)

// Banner Management for Digital Marketer
export const fetchAllBanners = createAsyncThunk(
  "digitalMarketer/fetchAllBanners",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/marketing/banners", { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      const mockData = {
        banners: [
          {
            _id: "1",
            title: "Summer Collection",
            description: "Discover our latest summer styles",
            image: "/placeholder.svg?height=400&width=800&text=Summer+Collection",
            type: "hero",
            isActive: true,
            link: "/products?category=summer",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            title: "50% Off Sale",
            description: "Limited time offer on selected items",
            image: "/placeholder.svg?height=300&width=600&text=50%+Off+Sale",
            type: "promo",
            isActive: true,
            link: "/products?sale=true",
            createdAt: new Date().toISOString(),
          },
        ],
      }
      return mockData
    }
  },
)

export const createBanner = createAsyncThunk(
  "digitalMarketer/createBanner",
  async (bannerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/marketing/banners", bannerData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create banner")
    }
  },
)

export const updateBanner = createAsyncThunk(
  "digitalMarketer/updateBanner",
  async ({ bannerId, bannerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/marketing/banners/${bannerId}`, bannerData, {
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

export const deleteBanner = createAsyncThunk("digitalMarketer/deleteBanner", async (bannerId, { rejectWithValue }) => {
  try {
    await api.delete(`/marketing/banners/${bannerId}`)
    return bannerId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete banner")
  }
})

const initialState = {
  // Analytics
  marketingAnalytics: null,
  analyticsLoading: false,

  // SEO
  seoData: [],
  seoLoading: false,

  // Campaigns
  campaigns: [],
  campaignsPagination: null,
  campaignsLoading: false,
  selectedCampaign: null,
  campaignAnalytics: null,

  // Banners
  banners: [],
  bannersLoading: false,

  // UI State
  loading: false,
  error: null,
  success: null,
}

const digitalMarketerSlice = createSlice({
  name: "digitalMarketer",
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
    setSelectedCampaign: (state, action) => {
      state.selectedCampaign = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Marketing Analytics
      .addCase(fetchMarketingAnalytics.pending, (state) => {
        state.analyticsLoading = true
        state.error = null
      })
      .addCase(fetchMarketingAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.marketingAnalytics = action.payload
      })
      .addCase(fetchMarketingAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
      })

      // SEO Data
      .addCase(fetchSEOData.pending, (state) => {
        state.seoLoading = true
        state.error = null
      })
      .addCase(fetchSEOData.fulfilled, (state, action) => {
        state.seoLoading = false
        state.seoData = action.payload.seoData
      })
      .addCase(fetchSEOData.rejected, (state, action) => {
        state.seoLoading = false
        state.error = action.payload
      })

      .addCase(updateSEOData.fulfilled, (state, action) => {
        const updatedSEO = action.payload.seoData
        const index = state.seoData.findIndex((seo) => seo.page === updatedSEO.page)
        if (index !== -1) {
          state.seoData[index] = updatedSEO
        } else {
          state.seoData.push(updatedSEO)
        }
        state.success = action.payload.message
      })

      // Campaigns
      .addCase(fetchAllCampaigns.pending, (state) => {
        state.campaignsLoading = true
        state.error = null
      })
      .addCase(fetchAllCampaigns.fulfilled, (state, action) => {
        state.campaignsLoading = false
        state.campaigns = action.payload.campaigns
        state.campaignsPagination = action.payload.pagination
      })
      .addCase(fetchAllCampaigns.rejected, (state, action) => {
        state.campaignsLoading = false
        state.error = action.payload
      })

      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload.campaign)
        state.success = action.payload.message
      })

      .addCase(updateCampaign.fulfilled, (state, action) => {
        const updatedCampaign = action.payload.campaign
        const index = state.campaigns.findIndex((campaign) => campaign._id === updatedCampaign._id)
        if (index !== -1) {
          state.campaigns[index] = updatedCampaign
        }
        state.success = action.payload.message
      })

      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((campaign) => campaign._id !== action.payload)
        state.success = "Campaign deleted successfully"
      })

      .addCase(fetchCampaignAnalytics.fulfilled, (state, action) => {
        state.campaignAnalytics = action.payload.analytics
        state.selectedCampaign = action.payload.campaign
      })

      // Banners
      .addCase(fetchAllBanners.pending, (state) => {
        state.bannersLoading = true
        state.error = null
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.bannersLoading = false
        state.banners = action.payload.banners
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.bannersLoading = false
        state.error = action.payload
      })

      .addCase(createBanner.fulfilled, (state, action) => {
        state.banners.unshift(action.payload.banner)
        state.success = action.payload.message
      })

      .addCase(updateBanner.fulfilled, (state, action) => {
        const updatedBanner = action.payload.banner
        const index = state.banners.findIndex((banner) => banner._id === updatedBanner._id)
        if (index !== -1) {
          state.banners[index] = updatedBanner
        }
        state.success = action.payload.message
      })

      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((banner) => banner._id !== action.payload)
        state.success = "Banner deleted successfully"
      })
  },
})

export const { clearError, clearSuccess, setLoading, setSelectedCampaign } = digitalMarketerSlice.actions
export default digitalMarketerSlice.reducer
