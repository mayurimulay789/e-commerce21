"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, Plus } from "lucide-react"
import { fetchWishlist, removeFromWishlist, clearWishlist, moveToCart } from "../store/slices/wishlistSlice"
import { addToCart } from "../store/slices/cartSlice"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const WishlistPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items, isLoading, error } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [selectedSizes, setSelectedSizes] = useState({})
  const [movingToCart, setMovingToCart] = useState(new Set())

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    dispatch(fetchWishlist())
  }, [dispatch, isAuthenticated, navigate])

  const handleRemoveFromWishlist = async (productId, productName) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap()
      toast.success(`${productName} removed from wishlist`)
    } catch (error) {
      toast.error(error)
    }
  }

  const handleAddToCart = async (product) => {
    const size = selectedSizes[product._id]

    // Check if size is required but not selected
    if (product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Please select a size")
      return
    }

    setMovingToCart((prev) => new Set(prev).add(product._id))

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          quantity: 1,
          size,
        }),
      ).unwrap()

      toast.success(`${product.name} added to cart`)
    } catch (error) {
      toast.error(error)
    } finally {
      setMovingToCart((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product._id)
        return newSet
      })
    }
  }

  const handleMoveToCart = async (product) => {
    const size = selectedSizes[product._id]

    // Check if size is required but not selected
    if (product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Please select a size")
      return
    }

    setMovingToCart((prev) => new Set(prev).add(product._id))

    try {
      await dispatch(
        moveToCart({
          productId: product._id,
          data: { quantity: 1, size },
        }),
      ).unwrap()

      toast.success(`${product.name} moved to cart`)
    } catch (error) {
      toast.error(error)
    } finally {
      setMovingToCart((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product._id)
        return newSet
      })
    }
  }

  const handleClearWishlist = async () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      try {
        await dispatch(clearWishlist()).unwrap()
        toast.success("Wishlist cleared successfully")
      } catch (error) {
        toast.error(error)
      }
    }
  }

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }))
  }

  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirecting to login..." />
  }

  if (isLoading && items.length === 0) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading your wishlist..." />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 transition-colors rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">My Wishlist</h1>
              <p className="text-gray-600">
                {items.length} {items.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="font-medium text-red-600 transition-colors hover:text-red-700"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Wishlist */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Your wishlist is empty</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-600">
              Save items you love by clicking the heart icon. They'll appear here for easy shopping later!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Items */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {items.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden group">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.images[0]?.url || "/placeholder.svg?height=300&width=225"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id, product.name)}
                      className="absolute p-2 transition-colors bg-white rounded-full shadow-md top-3 right-3 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Discount Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute px-2 py-1 text-xs text-white bg-red-500 rounded-full top-3 left-3">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="mb-2 font-semibold text-gray-800 transition-colors line-clamp-2 hover:text-pink-600">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Category */}
                    {product.category && <p className="mb-2 text-sm text-gray-500">{product.category.name}</p>}

                    {/* Rating */}
                    {product.rating && product.rating.average > 0 && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating.average)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">({product.rating.count})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center mb-3 space-x-2">
                      <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>

                    {/* Size Selection */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 text-sm text-gray-600">Size:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((sizeObj) => (
                            <button
                              key={sizeObj.size}
                              onClick={() => handleSizeSelect(product._id, sizeObj.size)}
                              disabled={sizeObj.stock === 0}
                              className={`px-3 py-1 text-sm border rounded transition-colors ${
                                selectedSizes[product._id] === sizeObj.size
                                  ? "border-pink-500 bg-pink-50 text-pink-600"
                                  : sizeObj.stock === 0
                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              {sizeObj.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stock Status */}
                    {product.stock === 0 ? (
                      <div className="mb-3 text-sm font-medium text-red-600">Out of Stock</div>
                    ) : product.stock < 5 ? (
                      <div className="mb-3 text-sm text-orange-600">Only {product.stock} left!</div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock === 0 || movingToCart.has(product._id)}
                        className="flex items-center justify-center w-full py-2 space-x-2 font-medium text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {movingToCart.has(product._id) ? (
                          <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Move to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex items-center justify-center w-full py-2 space-x-2 font-medium text-pink-600 transition-colors border border-pink-600 rounded-lg hover:bg-pink-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Continue Shopping */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 space-x-2 text-pink-600 transition-colors border border-pink-600 rounded-lg hover:bg-pink-50"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default WishlistPage
