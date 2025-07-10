import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const bannerAPI = {
  getAllBanners: () => axios.get(`${API_URL}/banners`),
  getHeroBanners: () => axios.get(`${API_URL}/banners/hero`),
  getPromoBanners: () => axios.get(`${API_URL}/banners/promo`),
  createBanner: (bannerData) => axios.post(`${API_URL}/banners`, bannerData),
  updateBanner: (id, bannerData) => axios.put(`${API_URL}/banners/${id}`, bannerData),
  deleteBanner: (id) => axios.delete(`${API_URL}/banners/${id}`),
}

export { bannerAPI }
