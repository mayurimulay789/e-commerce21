import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const categoryAPI = {
  getCategories: (params) => axios.get(`${API_URL}/categories`, { params }),

  getCategoryById: (id) => axios.get(`${API_URL}/categories/${id}`),

  createCategory: (categoryData) =>
    axios.post(`${API_URL}/categories`, categoryData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    }),

  updateCategory: (id, categoryData) =>
    axios.put(`${API_URL}/categories/${id}`, categoryData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteCategory: (id) =>
    axios.delete(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
}

export default categoryAPI
