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
  Home,
  Mic,
} from "lucide-react"
import { logoutUser } from "../store/slices/authSlice"
import { fetchCategories } from "../store/slices/categorySlice"

const navVariants = {
  top: {
    padding: "1rem 1.5rem",
    backgroundColor: "rgba(255, 255, 255, 0)",
    boxShadow: "none",
    color: "#333",
  },
  scrolled: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(5px)",
    color: "#333",
  },
}

const logoVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
}

const badgeVariants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  hover: { scale: 1.2 },
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeInOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.1, ease: "easeInOut" } },
}

const mobileMenuVariants = {
  open: { height: "auto", opacity: 1, pointerEvents: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { height: 0, opacity: 0, pointerEvents: "none", transition: { duration: 0.2, ease: "easeInOut" } },
}

const searchVariants = {
  focused: {
    width: "100%",
    transition: { duration: 0.3 },
  },
  unfocused: {
    width: "auto",
    transition: { duration: 0.3 },
  },
}

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

  // Handle scroll effects for sticky header
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
    dispatch(logoutUser())
    setShowUserMenu(false)
    navigate("/")
  }

  const menCategories = categories.filter((cat) => cat.name.toLowerCase().includes("men"))
  const womenCategories = categories.filter((cat) => cat.name.toLowerCase().includes("women"))
  const otherCategories = categories.filter(
    (cat) => !cat.name.toLowerCase().includes("men") && !cat.name.toLowerCase().includes("women"),
  )

  return (
    <motion.nav
      variants={navVariants}
      animate={isScrolled ? "scrolled" : "top"}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="container px-4 mx-auto lg:px-6">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between py-2 gap-x-8">
          {" "}
          {/* Added gap-x-8 here */}
          {/* Left Section: Navigation Links */}
          <div className="items-center justify-start flex-1 hidden md:flex gap-x-6">
            <Link
              to="/"
              className="relative font-medium text-gray-700 transition-all duration-300 hover:text-ksauni-red group"
            >
              Home
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-ksauni-red to-ksauni-dark-red"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            {/* Women Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setShowCategoryMenu("women")}
              onMouseLeave={() => setShowCategoryMenu(null)}
            >
              <Link
                to="/products/women"
                className="flex items-center space-x-1 font-medium text-gray-700 transition-all duration-300 hover:text-ksauni-red group"
              >
                <span className="relative">
                  Women
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-ksauni-red to-ksauni-dark-red"
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
                    className="absolute left-0 w-56 py-2 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl backdrop-blur-lg top-full"
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
                          className="block px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-ksauni-red/5 hover:text-ksauni-red"
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
                className="flex items-center space-x-1 font-medium text-gray-700 transition-all duration-300 hover:text-ksauni-red group"
              >
                <span className="relative">
                  Men
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-ksauni-red to-ksauni-dark-red"
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
                    className="absolute left-0 w-56 py-2 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl backdrop-blur-lg top-full"
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
                          className="block px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-ksauni-red/5 hover:text-ksauni-red"
                        >
                          {category.name}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Center Section: Logo */}
          <div className="flex justify-center flex-1 md:flex-none">
            <Link to="/">
              <motion.div
                variants={logoVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="flex items-center flex-shrink-0 space-x-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="p-2 rounded-full bg-gradient-to-r from-ksauni-red to-ksauni-dark-red"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-transparent bg-gradient-to-r from-ksauni-red to-ksauni-dark-red bg-clip-text">
                    KsauniBliss
                  </span>
                  <span className="-mt-1 text-xs text-gray-500">Your Style, Elevated</span>
                </div>
              </motion.div>
            </Link>
          </div>
          {/* Right Section: Search Bar and Icons */}
          <div className="flex items-center justify-end flex-1 gap-x-4">
            {/* Search Bar - Desktop */}
            <div className="flex-1 hidden max-w-xs md:flex">
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
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full py-2 pl-10 pr-10 text-sm placeholder-gray-400 transition-all duration-300 border border-gray-200 rounded-full outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ksauni-red/20"
                  whileFocus={{ scale: 1.02 }}
                />
                <Mic className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-4 top-1/2" />
              </motion.form>
            </div>
            {/* Right Icons */}
            <div className="flex items-center flex-shrink-0 space-x-4">
              {/* Home Icon */}
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center p-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-ksauni-red/5 hover:text-ksauni-red group"
                >
                  <Home className="w-5 h-5" />
                </motion.button>
              </Link>
              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center p-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-ksauni-red/5 hover:text-ksauni-red group"
                >
                  <Heart className="w-5 h-5 transition-colors group-hover:fill-ksauni-red/20" />
                  <AnimatePresence>
                    {wishlistItems.length > 0 && (
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-gradient-to-r from-ksauni-red to-ksauni-dark-red"
                      >
                        {wishlistItems.length}
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
                    className="flex items-center p-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-ksauni-red/5 hover:text-ksauni-red group"
                  >
                    <div className="relative">
                      <User className="w-5 h-5" />
                      {user?.role === "admin" && <Crown className="absolute w-3 h-3 text-ksauni-red -top-1 -right-1" />}
                    </div>
                    <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }}>
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                ) : (
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center p-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-ksauni-red/5 hover:text-ksauni-red"
                    >
                      <User className="w-5 h-5" />
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
                      className="absolute right-0 w-56 py-2 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl backdrop-blur-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <motion.div whileHover={{ x: 4 }}>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-ksauni-red/5 hover:text-ksauni-red"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ x: 4 }}>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-ksauni-red/5 hover:text-ksauni-red"
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
                            className="flex items-center px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-ksauni-red/5 hover:text-ksauni-red"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Crown className="w-4 h-4 mr-3 text-ksauni-red" />
                            Admin Dashboard
                          </Link>
                        </motion.div>
                      )}
                      <div className="mt-2 border-t border-gray-100">
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-left transition-colors text-ksauni-red hover:bg-ksauni-red/5"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Cart */}
              <Link to="/cart">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center p-2 text-gray-700 transition-all duration-300 rounded-full hover:bg-ksauni-red/5 hover:text-ksauni-red group"
                >
                  <ShoppingBag className="w-5 h-5 transition-colors group-hover:fill-ksauni-red/20" />
                  <AnimatePresence>
                    {cartItems.length > 0 && (
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-gradient-to-r from-ksauni-dark-red to-ksauni-red"
                      >
                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full md:hidden hover:bg-ksauni-red/5"
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
      </div>
      {/* Scrolling Banner */}
      <div className="w-full py-2 overflow-hidden bg-ksauni-red">
        <div className="whitespace-nowrap animate-scroll-text">
          <span className="text-sm font-medium text-white">
            Welcome to Ksauni Bliss! Enjoy exclusive deals and offers.
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Welcome to Ksauni Bliss! Enjoy
            exclusive deals and offers. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Welcome
            to Ksauni Bliss! Enjoy exclusive deals and offers.
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>
      {/* Mobile Menu (remains as an overlay) */}
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
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-12 pr-12 text-sm placeholder-gray-400 border border-gray-200 rounded-full outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ksauni-red/20"
                />
                <Mic className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-4 top-1/2" />
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
                    className="block py-3 text-lg font-medium text-gray-700 transition-colors hover:text-ksauni-red"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 4 }}>
                  <Link
                    to="/products/men"
                    className="block py-3 text-lg font-medium text-gray-700 transition-colors hover:text-ksauni-red"
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
                      className="block py-3 text-lg font-medium text-gray-700 transition-colors hover:text-ksauni-red"
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
                  className="flex flex-col items-center space-y-1 text-gray-700 transition-colors hover:text-ksauni-red"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative">
                    <Heart className="w-6 h-6" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full bg-ksauni-red -top-2 -right-2">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Wishlist</span>
                </Link>
                {token ? (
                  <Link
                    to="/profile"
                    className="flex flex-col items-center space-y-1 text-gray-700 transition-colors hover:text-ksauni-red"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-6 h-6" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex flex-col items-center space-y-1 text-gray-700 transition-colors hover:text-ksauni-red"
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
    </motion.nav>
  )
}

export default Navbar
