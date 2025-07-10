"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from "lucide-react"
import { fetchProducts } from "../store/slices/productSlice"
import { addToCart } from "../store/slices/cartSlice"
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const RelatedProducts = ({ currentProduct }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { products, isLoading } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [relatedProducts, setRelatedProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(4)

  // Update slides to show based on screen size
  useEffect(() => {
    const updateSlidesToShow = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1)
      } else if (window.innerWidth < 768) {
        setSlidesToShow(2)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3)
      } else {
        setSlidesToShow(4)
      }
    }

    updateSlidesToShow()
    window.addEventListener("resize", updateSlidesToShow)
    return () => window.removeEventListener("resize", updateSlidesToShow)
  }, [])

  // Fetch related products
  useEffect(() => {
    if (currentProduct) {
      const params = {
        category: currentProduct.category?._id,
        limit: 12,
        exclude: currentProduct._id,
      }

      dispatch(fetchProducts(params))
    }
  }, [dispatch, currentProduct])

  // Filter and set related products
  useEffect(() => {
    if (products.length > 0 && currentProduct) {
      const filtered = products.filter((product) => product._id !== currentProduct._id).slice(0, 8) // Limit to 8 related products

      setRelatedProducts(filtered)
      setCurrentSlide(0) // Reset slide when products change
    }
  }, [products, currentProduct])

  const nextSlide = () => {
    const maxSlide = Math.max(0, relatedProducts.length - slidesToShow)
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1))
  }

  const prevSlide = () => {
    const maxSlide = Math.max(0, relatedProducts.length - slidesToShow)
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1))
  }

  const handleQuickAddToCart = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          quantity: 1,
          size: product.sizes?.[0]?.size || "",
          color: product.colors?.[0]?.name || "",
        }),
      ).unwrap()

      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error(error)
    }
  }

  const handleQuickWishlist = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const isInWishlist = wishlistItems.some((item) => item._id === product._id)

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap()
        toast.success("Removed from wishlist")
      } else {
        await dispatch(addToWishlist(product._id)).unwrap()
        toast.success("Added to wishlist")
      }
    } catch (error) {
      toast.error(error)
    }
  }

  if (isLoading || relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">You Might Also Like</h2>
          <p className="text-gray-600">Similar products in {currentProduct.category?.name}</p>
        </div>

        {/* Navigation Arrows - Desktop */}
        <div className="items-center hidden space-x-2 md:flex">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide >= Math.max(0, relatedProducts.length - slidesToShow)}
            className="p-2 transition-colors border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
          }}
        >
          {relatedProducts.map((product, index) => (
            <div key={product._id} className="flex-shrink-0 px-2" style={{ width: `${100 / slidesToShow}%` }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm group hover:shadow-lg"
              >
                <Link to={`/product/${product._id}`} className="block">
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={product.images[0]?.url || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Discount Badge */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full top-2 left-2">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}

                    {/* Stock Badge */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-white rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Quick Actions - Show on Hover */}
                    <div className="absolute flex items-center justify-between transition-opacity duration-300 opacity-0 bottom-2 left-2 right-2 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleQuickWishlist(product, e)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          wishlistItems.some((item) => item._id === product._id)
                            ? "bg-pink-600 text-white"
                            : "bg-white bg-opacity-90 text-gray-600 hover:bg-pink-600 hover:text-white"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlistItems.some((item) => item._id === product._id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => handleQuickAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className="flex items-center px-3 py-2 space-x-1 text-sm text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="mb-1 text-sm font-medium text-gray-800 transition-colors line-clamp-2 group-hover:text-pink-600">
                      {product.name}
                    </h3>

                    {/* Category */}
                    <p className="mb-2 text-xs text-gray-500">{product.category?.name}</p>

                    {/* Rating */}
                    <div className="flex items-center mb-2 space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating?.average || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({product.rating?.count || 0})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>

                    {/* Sizes Preview */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.slice(0, 3).map((sizeData) => (
                            <span key={sizeData.size} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                              {sizeData.size}
                            </span>
                          ))}
                          {product.sizes.length > 3 && (
                            <span className="text-xs text-gray-500">+{product.sizes.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile Navigation Dots */}
      <div className="flex justify-center space-x-2 md:hidden">
        {Array.from({ length: Math.ceil(relatedProducts.length / slidesToShow) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-pink-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* View All Link */}
      <div className="pt-4 text-center">
        <Link
          to={`/products/${currentProduct.category?.slug || ""}`}
          className="inline-flex items-center font-medium text-pink-600 transition-colors hover:text-pink-700"
        >
          View All {currentProduct.category?.name} Products
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default RelatedProducts
