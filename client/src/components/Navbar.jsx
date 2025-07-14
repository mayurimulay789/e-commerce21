"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Crown,
  LogOut,
  Settings,
  Package,
} from "lucide-react"
import { logout } from "../store/slices/authSlice"
import { fetchCategories } from "../store/slices/categorySlice"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { scrollY } = useScroll()

  const { user, token } = useSelector((state) => state.auth)
  const { categories } = useSelector((state) => state.categories)
  const { items: cartItems } = useSelector((state) => state.cart)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  // Handle scroll effects
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }))
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setSearchFocused(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    setShowUserMenu(false)
    navigate("/")
  }

  const menCategories = categories.filter((cat) => cat.name.toLowerCase().includes("men"))
  const womenCategories = categories.filter((cat) => cat.name.toLowerCase().includes("women"))
  const otherCategories = categories.filter(
    (cat) => !cat.name.toLowerCase().includes("men") && !cat.name.toLowerCase().includes("women"),
  )

  // Animation variants
  const navVariants = {
    top: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "0.75rem 0",
    },
    scrolled: {
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      padding: "0.5rem 0",
    },
  }

  const logoVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const searchVariants = {
    unfocused: {
      width: "100%",
      backgroundColor: "rgba(243, 244, 246, 0.8)",
    },
    focused: {
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow: "0 0 0 2px rgba(236, 72, 153, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  const mobileMenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const badgeVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    hover: { scale: 1.1 },
  }

  return (
    <motion.nav
      variants={navVariants}
      animate={isScrolled ? "scrolled" : "top"}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="container px-4 mx-auto lg:px-6">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  FashionHub
                </span>
                <span className="text-xs text-gray-500 -mt-1">Elegance Redefined</span>
              </div>
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 hidden max-w-lg mx-8 md:flex">
            <motion.form
              onSubmit={handleSearch}
              className="relative w-full"
              variants={searchVariants}
              animate={searchFocused ? "focused" : "unfocused"}
            >
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
              <motion.input
                ref={searchRef}
                type="text"
                placeholder="Discover your perfect style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full py-3 pl-12 pr-4 text-sm transition-all duration-300 border-0 rounded-full outline-none placeholder-gray-400"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-3 h-3" />
              </motion.button>
            </motion.form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center p-2 space-x-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-pink-50 hover:text-pink-600 group"
              >
                <Heart className="w-5 h-5 transition-colors group-hover:fill-pink-200" />
                <span className="hidden text-sm font-medium lg:block">Wishlist</span>
                <AnimatePresence>
                  {wishlistItems.length > 0 && (
                    <motion.span
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center p-2 space-x-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-pink-50 hover:text-pink-600 group"
              >
                <ShoppingBag className="w-5 h-5 transition-colors group-hover:fill-pink-200" />
                <span className="hidden text-sm font-medium lg:block">Cart</span>
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.span
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    >
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              {token ? (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center p-2 space-x-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-pink-50 hover:text-pink-600 group"
                >
                  <div className="relative">
                    <User className="w-5 h-5" />
                    {user?.role === "admin" && <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />}
                  </div>
                  <span className="hidden text-sm font-medium lg:block">{user?.name || "Profile"}</span>
                  <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center p-2 space-x-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-pink-50 hover:text-pink-600"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden text-sm font-medium lg:block">Login</span>
                  </motion.button>
                </Link>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && token && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 w-56 py-2 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl backdrop-blur-lg"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <motion.div whileHover={{ x: 4 }}>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ x: 4 }}>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                    </motion.div>

                    {user?.role === "admin" && (
                      <motion.div whileHover={{ x: 4 }}>
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Crown className="w-4 h-4 mr-3 text-yellow-500" />
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    )}

                    <div className="border-t border-gray-100 mt-2">
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full md:hidden hover:bg-pink-50"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="items-center justify-center hidden py-4 space-x-8 border-t border-gray-100 md:flex"
        >
          {/* Women Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setShowCategoryMenu("women")}
            onMouseLeave={() => setShowCategoryMenu(null)}
          >
            <Link
              to="/products/women"
              className="flex items-center space-x-1 font-medium text-gray-700 transition-all duration-300 hover:text-pink-600 group"
            >
              <span className="relative">
                Women
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </span>
              <motion.div animate={{ rotate: showCategoryMenu === "women" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Link>

            <AnimatePresence>
              {showCategoryMenu === "women" && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 w-56 py-2 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl backdrop-blur-lg top-full"
                >
                  {womenCategories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link
                        to={`/products/${category.slug}`}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Men Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setShowCategoryMenu("men")}
            onMouseLeave={() => setShowCategoryMenu(null)}
          >
            <Link
              to="/products/men"
              className="flex items-center space-x-1 font-medium text-gray-700 transition-all duration-300 hover:text-pink-600 group"
            >
              <span className="relative">
                Men
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </span>
              <motion.div animate={{ rotate: showCategoryMenu === "men" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Link>

            <AnimatePresence>
              {showCategoryMenu === "men" && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 w-56 py-2 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl backdrop-blur-lg top-full"
                >
                  {menCategories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link
                        to={`/products/${category.slug}`}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Categories */}
          {otherCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                to={`/products/${category.slug}`}
                className="relative font-medium text-gray-700 transition-all duration-300 hover:text-pink-600 group"
              >
                {category.name}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden border-t border-gray-100 md:hidden"
            >
              <div className="py-6 space-y-6">
                {/* Mobile Search */}
                <motion.form
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onSubmit={handleSearch}
                  className="relative"
                >
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                  <input
                    type="text"
                    placeholder="Discover your perfect style..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 text-sm bg-gray-50 border-0 rounded-full outline-none placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-200"
                  />
                </motion.form>

                {/* Mobile Navigation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      to="/products/women"
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Women
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      to="/products/men"
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Men
                    </Link>
                  </motion.div>

                  {otherCategories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link
                        to={`/products/${category.slug}`}
                        className="block py-3 text-lg font-medium text-gray-700 hover:text-pink-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mobile Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-around pt-6 border-t border-gray-100"
                >
                  <Link
                    to="/wishlist"
                    className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="relative">
                      <Heart className="w-6 h-6" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-500 rounded-full">
                          {wishlistItems.length}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">Wishlist</span>
                  </Link>

                  {token ? (
                    <Link
                      to="/profile"
                      className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">Login</span>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
