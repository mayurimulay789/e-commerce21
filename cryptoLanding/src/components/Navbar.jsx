"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react"
import { logout } from "../store/slices/authSlice"
import { fetchCategories } from "../store/slices/categorySlice"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, token } = useSelector((state) => state.auth)
  const { categories } = useSelector((state) => state.categories)
  const { items: cartItems } = useSelector((state) => state.cart)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }))
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    setShowUserMenu(false)
    navigate("/")
  }

  const menCategories = categories.filter((cat) => cat.name.toLowerCase().includes("men"))
  const womenCategories = categories.filter((cat) => cat.name.toLowerCase().includes("women"))

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="container px-4 mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/">
            <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold text-pink-600">
              FashionHub
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 hidden max-w-md mx-8 md:flex">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-full outline-none focus:border-pink-500"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative items-center hidden space-x-1 text-gray-700 transition-colors md:flex hover:text-pink-600"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-pink-500 rounded-full -top-2 -right-2">
                    {wishlistItems.length}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center space-x-1 text-gray-700 transition-colors hover:text-pink-600"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden text-sm md:block">Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-pink-500 rounded-full -top-2 -right-2">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              {token ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="items-center hidden space-x-1 text-gray-700 transition-colors md:flex hover:text-pink-600"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user?.name || "Profile"}</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="items-center hidden space-x-1 text-gray-700 transition-colors md:flex hover:text-pink-600"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">Login</span>
                  </motion.button>
                </Link>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && token && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 w-48 py-2 mt-2 bg-white border rounded-lg shadow-lg"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="items-center justify-center hidden py-3 space-x-8 border-t md:flex">
          {/* Women Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoryMenu("women")}
            onMouseLeave={() => setShowCategoryMenu(null)}
          >
            <Link
              to="/products/women"
              className="flex items-center space-x-1 font-medium text-gray-700 transition-colors hover:text-pink-600"
            >
              <span>Women</span>
              <ChevronDown className="w-4 h-4" />
            </Link>

            <AnimatePresence>
              {showCategoryMenu === "women" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 w-48 py-2 mt-2 bg-white border rounded-lg shadow-lg top-full"
                >
                  {womenCategories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Men Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoryMenu("men")}
            onMouseLeave={() => setShowCategoryMenu(null)}
          >
            <Link
              to="/products/men"
              className="flex items-center space-x-1 font-medium text-gray-700 transition-colors hover:text-pink-600"
            >
              <span>Men</span>
              <ChevronDown className="w-4 h-4" />
            </Link>

            <AnimatePresence>
              {showCategoryMenu === "men" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 w-48 py-2 mt-2 bg-white border rounded-lg shadow-lg top-full"
                >
                  {menCategories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Categories */}
          {categories
            .filter((cat) => !cat.name.toLowerCase().includes("men") && !cat.name.toLowerCase().includes("women"))
            .map((category) => (
              <Link
                key={category._id}
                to={`/products/${category.slug}`}
                className="font-medium text-gray-700 transition-colors hover:text-pink-600"
              >
                {category.name}
              </Link>
            ))}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t md:hidden"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-full"
                  />
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  <Link
                    to="/products/women"
                    className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women
                  </Link>
                  <Link
                    to="/products/men"
                    className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men
                  </Link>
                  {categories
                    .filter(
                      (cat) => !cat.name.toLowerCase().includes("men") && !cat.name.toLowerCase().includes("women"),
                    )
                    .map((category) => (
                      <Link
                        key={category._id}
                        to={`/products/${category.slug}`}
                        className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-around pt-4 border-t">
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-1 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-pink-500 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  {token ? (
                    <Link
                      to="/profile"
                      className="flex items-center space-x-1 text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">Profile</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-1 text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
