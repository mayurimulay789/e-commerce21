"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { User, MapPin, Edit3, Save, X, Camera, Shield, Package, Heart } from "lucide-react"
import { updateProfile, changePassword, uploadAvatar } from "../store/slices/authSlice"
import { fetchUserOrders } from "../store/slices/orderSlice"
import { fetchWishlist } from "../store/slices/wishlistSlice"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"
import { format } from "date-fns"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const { orders } = useSelector((state) => state.order)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    addresses: [],
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [newAddress, setNewAddress] = useState({
    type: "home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), "yyyy-MM-dd") : "",
        gender: user.gender || "",
        addresses: user.addresses || [],
      })
    }
  }, [user])

  useEffect(() => {
    dispatch(fetchUserOrders({ limit: 5 }))
    dispatch(fetchWishlist())
  }, [dispatch])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    try {
      await dispatch(updateProfile(profileData)).unwrap()
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      toast.error(error)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      ).unwrap()

      toast.success("Password changed successfully!")
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error(error)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB")
      return
    }

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      await dispatch(uploadAvatar(formData)).unwrap()
      toast.success("Profile picture updated!")
    } catch (error) {
      toast.error(error)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()

    try {
      const updatedAddresses = [...profileData.addresses, { ...newAddress, _id: Date.now().toString() }]
      await dispatch(updateProfile({ ...profileData, addresses: updatedAddresses })).unwrap()

      toast.success("Address added successfully!")
      setShowAddressForm(false)
      setNewAddress({
        type: "home",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      })
    } catch (error) {
      toast.error(error)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const updatedAddresses = profileData.addresses.filter((addr) => addr._id !== addressId)
        await dispatch(updateProfile({ ...profileData, addresses: updatedAddresses })).unwrap()
        toast.success("Address deleted successfully!")
      } catch (error) {
        toast.error(error)
      }
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "security", label: "Security", icon: Shield },
  ]

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading profile..." />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-pink-100 rounded-full">
                  {user?.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-12 h-12 text-pink-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 text-white transition-colors bg-pink-600 rounded-full cursor-pointer hover:bg-pink-700">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">Member since {format(new Date(user?.createdAt), "MMMM yyyy")}</p>
              </div>

              {/* Stats */}
              <div className="flex ml-auto space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{orders?.length || 0}</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{wishlistItems?.length || 0}</div>
                  <div className="text-sm text-gray-600">Wishlist</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{profileData.addresses?.length || 0}</div>
                  <div className="text-sm text-gray-600">Addresses</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-pink-50 text-pink-600 border-r-2 border-pink-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <AnimatePresence mode="wait">
                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
                        >
                          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          <span>{isEditing ? "Cancel" : "Edit"}</span>
                        </button>
                      </div>

                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                              type="date"
                              value={profileData.dateOfBirth}
                              onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                            <select
                              value={profileData.gender}
                              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="flex items-center px-6 py-2 space-x-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        )}
                      </form>
                    </motion.div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === "orders" && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h2 className="mb-6 text-xl font-semibold text-gray-800">Recent Orders</h2>
                      {orders && orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.slice(0, 5).map((order) => (
                            <div key={order._id} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Order #{order.orderNumber}</span>
                                <span className="text-sm text-gray-500">
                                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">{order.items.length} items</span>
                                <div className="flex items-center space-x-4">
                                  <span className="font-semibold">₹{order.pricing.total}</span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "shipped"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-600">No orders yet</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Security Tab */}
                  {activeTab === "security" && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h2 className="mb-6 text-xl font-semibold text-gray-800">Security Settings</h2>

                      <div className="space-y-6">
                        {/* Change Password */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-800">Password</h3>
                              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                            </div>
                            <button
                              onClick={() => setShowPasswordForm(!showPasswordForm)}
                              className="font-medium text-pink-600 hover:text-pink-700"
                            >
                              {showPasswordForm ? "Cancel" : "Change"}
                            </button>
                          </div>

                          {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                  type="password"
                                  value={passwordData.currentPassword}
                                  onChange={(e) =>
                                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
                                <input
                                  type="password"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                />
                              </div>

                              <button
                                type="submit"
                                className="px-6 py-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
                              >
                                Update Password
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfilePage
