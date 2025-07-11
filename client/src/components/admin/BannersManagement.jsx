import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Plus, Search, Edit, Trash2, Eye, ImageIcon } from 'lucide-react'
import {
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  clearError,
} from "../../store/slices/bannerSlice"

const BannersManagement = () => {
  const dispatch = useDispatch()
  const { allBanners, isLoading, error } = useSelector((state) => state.banners)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    type: "hero",
    sortOrder: 0,
    startDate: "",
    endDate: "",
    targetAudience: "all",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    dispatch(fetchAllBanners({ type: filterType }))
  }, [dispatch, filterType])

  useEffect(() => {
    if (error) {
      alert(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formDataToSend = new FormData()

    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key])
      }
    })

    if (imageFile) {
      formDataToSend.append("image", imageFile)
    }

    try {
      if (editingBanner) {
        await dispatch(updateBanner({ id: editingBanner._id, data: formDataToSend })).unwrap()
      } else {
        await dispatch(createBanner(formDataToSend)).unwrap()
      }
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving banner:", error)
    }
  }

  const handleDelete = async (bannerId) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await dispatch(deleteBanner(bannerId)).unwrap()
      } catch (error) {
        console.error("Error deleting banner:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      type: "hero",
      sortOrder: 0,
      startDate: "",
      endDate: "",
      targetAudience: "all",
    })
    setImageFile(null)
    setImagePreview("")
    setEditingBanner(null)
  }

  const openEditModal = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      type: banner.type,
      sortOrder: banner.sortOrder,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split("T")[0] : "",
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split("T")[0] : "",
      targetAudience: banner.targetAudience || "all",
    })
    setImagePreview(banner.image?.url || "")
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredBanners = allBanners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="hero">Hero Banners</option>
            <option value="promo">Promo Banners</option>
            <option value="category">Category Banners</option>
          </select>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="flex justify-center py-8 col-span-full">
            <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-8 text-center text-gray-500 col-span-full">No banners found</div>
        ) : (
          filteredBanners.map((banner) => (
            <div key={banner._id} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={banner.image?.url || "/placeholder.jpg"}
                  alt={banner.title}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      banner.type === "hero"
                        ? "bg-purple-100 text-purple-800"
                        : banner.type === "promo"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {banner.type.charAt(0).toUpperCase() + banner.type.slice(1)}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      banner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium text-gray-900">{banner.title}</h3>
                {banner.subtitle && <p className="mb-2 text-sm text-gray-600">{banner.subtitle}</p>}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created by: {banner.createdBy?.name || "Unknown"}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-11/12 max-w-3xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="hero">Hero Banner</option>
                      <option value="promo">Promo Banner</option>
                      <option value="category">Category Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Button Link</label>
                    <input
                      type="url"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required={!editingBanner}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="object-cover w-full h-32 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BannersManagement
