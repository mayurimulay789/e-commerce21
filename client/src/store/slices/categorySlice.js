import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Async thunks
export const fetchCategories = createAsyncThunk("category/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/categories")
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch categories")
  }
})

export const fetchCategoryById = createAsyncThunk("category/fetchCategoryById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/categories/${id}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch category")
  }
})

export const createCategory = createAsyncThunk("category/createCategory", async (categoryData, { rejectWithValue }) => {
  try {
    const formData = new FormData()

    // Append text fields
    Object.keys(categoryData).forEach((key) => {
      if (key !== "image" && categoryData[key] !== undefined) {
        formData.append(key, categoryData[key])
      }
    })

    // Append image if exists
    if (categoryData.image) {
      formData.append("image", categoryData.image)
    }

    const response = await api.post("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create category")
  }
})

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const formData = new FormData()

      // Append text fields
      Object.keys(categoryData).forEach((key) => {
        if (key !== "image" && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key])
        }
      })

      // Append image if exists
      if (categoryData.image) {
        formData.append("image", categoryData.image)
      }

      const response = await api.put(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category")
    }
  },
)

export const deleteCategory = createAsyncThunk("category/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/categories/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete category")
  }
})

const initialState = {
  categories: [],
  currentCategory: null,
  featuredCategories: [],
  loading: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
  success: {
    categoryCreated: false,
    categoryUpdated: false,
    categoryDeleted: false,
  },
}

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = {
        categoryCreated: false,
        categoryUpdated: false,
        categoryDeleted: false,
      }
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload
    },
    setFeaturedCategories: (state, action) => {
      state.featuredCategories = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading.fetching = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.categories = action.payload.categories
        // Set featured categories (first 6 categories)
        state.featuredCategories = action.payload.categories.slice(0, 6)
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })

      // Fetch Category By ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading.fetching = true
        state.error = null
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.currentCategory = action.payload.category
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading.creating = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading.creating = false
        state.categories.unshift(action.payload.category)
        state.success.categoryCreated = true
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading.creating = false
        state.error = action.payload
      })

      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading.updating = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading.updating = false
        const index = state.categories.findIndex((category) => category._id === action.payload.category._id)
        if (index !== -1) {
          state.categories[index] = action.payload.category
        }
        state.success.categoryUpdated = true
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading.updating = false
        state.error = action.payload
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading.deleting = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading.deleting = false
        state.categories = state.categories.filter((category) => category._id !== action.payload)
        state.success.categoryDeleted = true
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading.deleting = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess, setCurrentCategory, setFeaturedCategories } = categorySlice.actions
export default categorySlice.reducer
