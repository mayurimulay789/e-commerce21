import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios instance with token interceptor
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fashionhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const bannerAPI = {
  getAllBanners: (params) => axios.get(`${API_BASE_URL}/banners`, { params }), // can pass type, isActive as query params
  getHeroBanners: () => axios.get(`${API_BASE_URL}/banners/hero`),
  getPromoBanners: () => axios.get(`${API_BASE_URL}/banners/promo`),
  createBanner: (bannerData) => axios.post(`${API_BASE_URL}/banners`, bannerData),
  updateBanner: (id, bannerData) => axios.put(`${API_BASE_URL}/banners/${id}`, bannerData),
  deleteBanner: (id) => axios.delete(`${API_BASE_URL}/banners/${id}`),
};

export { bannerAPI };
