"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react"
import { fetchProductById } from "../store/slices/productSlice"
import { addToCart } from "../store/slices/cartSlice"
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ProductReviews from "../components/ProductReviews"
import RelatedProducts from "../components/RelatedProducts"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const ProductDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { currentProduct, isLoading, error } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showImageModal, setShowImageModal] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const isInWishlist = wishlistItems.some((item) => item._id === currentProduct?._id)

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentProduct) {
      // Set default selections
      if (currentProduct.sizes?.length > 0) {
        setSelectedSize(currentProduct.sizes[0].size)
      }
      if (currentProduct.colors?.length > 0) {
        setSelectedColor(currentProduct.colors[0].name)
      }
    }
  }, [currentProduct])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    if (currentProduct.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    if (currentProduct.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color")
      return
    }

    setAddingToCart(true)

    try {
      await dispatch(
        addToCart({
          productId: currentProduct._id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        }),
      ).unwrap()

      toast.success("Added to cart!")
    } catch (error) {
      toast.error(error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(currentProduct._id)).unwrap()
        toast.success("Removed from wishlist")
      } else {
        await dispatch(addToWishlist(currentProduct._id)).unwrap()
        toast.success("Added to wishlist")
      }
    } catch (error) {
      toast.error(error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct.name,
          text: currentProduct.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      } catch (error) {
        toast.error("Failed to copy link")
      }
    }
  }

  const getDiscountPercentage = () => {
    if (currentProduct?.originalPrice && currentProduct.originalPrice > currentProduct.price) {
      return Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    }
    return 0
  }

  const getSelectedSizeStock = () => {
    if (!selectedSize || !currentProduct?.sizes) return currentProduct?.stock || 0
    const sizeData = currentProduct.sizes.find((s) => s.size === selectedSize)
    return sizeData?.stock || 0
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % (currentProduct?.images?.length || 1))
  }

  const prevImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + (currentProduct?.images?.length || 1)) % (currentProduct?.images?.length || 1),
    )
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner message="Loading product..." />
        <Footer />
      </div>
    )
  }

  if (error || !currentProduct) {
    return (
      <div>
        <Navbar />
        <div className="container px-4 py-16 mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Product Not Found</h1>
          <p className="mb-8 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/products"
            className="px-6 py-3 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-8 space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-pink-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-pink-600">
            Products
          </Link>
          <span>/</span>
          <Link to={`/products/${currentProduct.category?.slug}`} className="hover:text-pink-600">
            {currentProduct.category?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{currentProduct.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square group">
              <img
                src={currentProduct.images[selectedImage]?.url || "/placeholder.svg?height=600&width=600"}
                alt={currentProduct.name}
                className="object-cover w-full h-full cursor-zoom-in"
                onClick={() => setShowImageModal(true)}
              />

              {/* Navigation Arrows */}
              {currentProduct.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute p-2 transition-all transform -translate-y-1/2 bg-white rounded-full shadow-lg opacity-0 left-4 top-1/2 bg-opacity-80 hover:bg-opacity-100 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute p-2 transition-all transform -translate-y-1/2 bg-white rounded-full shadow-lg opacity-0 right-4 top-1/2 bg-opacity-80 hover:bg-opacity-100 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {getDiscountPercentage() > 0 && (
                <div className="absolute px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-full top-4 left-4">
                  {getDiscountPercentage()}% OFF
                </div>
              )}

              {/* Stock Badge */}
              {getSelectedSizeStock() === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <span className="px-4 py-2 font-medium text-gray-800 bg-white rounded-full">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentProduct.images?.length > 1 && (
              <div className="flex pb-2 space-x-2 overflow-x-auto">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-pink-500" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">{currentProduct.name}</h1>
              <div className="flex items-center mb-4 space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(currentProduct.rating?.average || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({currentProduct.rating?.count || 0} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-800">₹{currentProduct.price}</span>
              {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{currentProduct.originalPrice}</span>
                  <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                    Save ₹{currentProduct.originalPrice - currentProduct.price}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Description</h3>
              <p className="leading-relaxed text-gray-600">{currentProduct.description}</p>
            </div>

            {/* Colors */}
            {currentProduct.colors && currentProduct.colors.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center space-x-2 px-4 py-2 border-2 rounded-lg transition-colors ${
                        selectedColor === color.name
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className="w-4 h-4 border border-gray-300 rounded-full"
                        style={{ backgroundColor: color.hex || color.name.toLowerCase() }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {currentProduct.sizes && currentProduct.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Size</h3>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.sizes.map((sizeData) => (
                    <button
                      key={sizeData.size}
                      onClick={() => setSelectedSize(sizeData.size)}
                      disabled={sizeData.stock === 0}
                      className={`px-4 py-2 border-2 rounded-lg transition-colors font-medium ${
                        selectedSize === sizeData.size
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : sizeData.stock === 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {sizeData.size}
                      {sizeData.stock === 0 && <span className="block text-xs">Out of Stock</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 transition-colors hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getSelectedSizeStock(), quantity + 1))}
                    disabled={quantity >= getSelectedSizeStock()}
                    className="p-2 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {getSelectedSizeStock()} available
                  {selectedSize && ` in ${selectedSize}`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || getSelectedSizeStock() === 0}
                className="flex items-center justify-center flex-1 px-6 py-3 space-x-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`px-6 py-3 border-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isInWishlist
                    ? "border-pink-500 bg-pink-50 text-pink-600"
                    : "border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600"
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
                <span>{isInWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center px-6 py-3 text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:border-gray-400"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="text-sm font-medium text-gray-800">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over ₹999</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="text-sm font-medium text-gray-800">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="text-sm font-medium text-gray-800">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <ProductReviews product={currentProduct} />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts currentProduct={currentProduct} />
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute z-10 p-2 text-white transition-colors bg-white rounded-full top-4 right-4 bg-opacity-20 hover:bg-opacity-30"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={currentProduct.images[selectedImage]?.url || "/placeholder.svg"}
                alt={currentProduct.name}
                className="object-contain max-w-full max-h-full"
              />

              {currentProduct.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute p-3 text-white transition-colors transform -translate-y-1/2 bg-white rounded-full left-4 top-1/2 bg-opacity-20 hover:bg-opacity-30"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute p-3 text-white transition-colors transform -translate-y-1/2 bg-white rounded-full right-4 top-1/2 bg-opacity-20 hover:bg-opacity-30"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
