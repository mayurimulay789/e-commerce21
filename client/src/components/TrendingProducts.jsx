"use client"

import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Star } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { addToCart } from "../store/slices/cartSlice"
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice"
import toast from "react-hot-toast"

const TrendingProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const dispatch = useDispatch()

  const { trendingProducts, isLoading } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { user } = useSelector((state) => state.auth)

  const itemsPerView = 4
  const maxIndex = Math.max(0, trendingProducts.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }
    dispatch(
      addToCart({
        product: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url,
      }),
    )
    toast.success("Added to cart!")
  }

  const handleWishlistToggle = (product) => {
    if (!user) {
      toast.error("Please login to add items to wishlist")
      return
    }

    const isInWishlist = wishlistItems.some((item) => item._id === product._id)

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
      toast.success("Removed from wishlist")
    } else {
      dispatch(addToWishlist(product))
      toast.success("Added to wishlist!")
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
            <p className="text-lg text-gray-600">Most popular items this week</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!trendingProducts.length) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
          <p className="text-lg text-gray-600">No trending products available at the moment.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
            <p className="text-lg text-gray-600">Most popular items this week</p>
          </div>
          <div className="hidden space-x-2 md:flex">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {trendingProducts.map((product, index) => {
              const isInWishlist = wishlistItems.some((item) => item._id === product._id)

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-full px-3 md:w-1/2 lg:w-1/4"
                >
                  <div className="relative overflow-hidden transition-shadow duration-300 bg-white shadow-lg group rounded-2xl hover:shadow-xl">
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.images[0]?.url || "/placeholder.svg?height=400&width=300"}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute flex flex-col space-y-2 top-3 left-3">
                        {product.tags.includes("new-arrival") && (
                          <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">NEW</span>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute flex flex-col space-y-2 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWishlistToggle(product)}
                          className={`p-2 rounded-full shadow-md transition-colors ${
                            isInWishlist
                              ? "bg-pink-500 text-white"
                              : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>

                      {/* Quick Add Button */}
                      <div className="absolute transition-opacity duration-300 opacity-0 bottom-3 left-3 right-3 group-hover:opacity-100">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center justify-center w-full py-2 space-x-2 text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="mb-2 font-semibold text-gray-800 transition-colors line-clamp-2 hover:text-pink-600">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating?.average || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">({product.rating?.count || 0})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center mt-6 space-x-2 md:hidden">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/products?tag=trending"
            className="inline-block px-8 py-3 text-pink-600 transition-colors border-2 border-pink-500 rounded-full hover:bg-pink-500 hover:text-white"
          >
            View All Trending Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default TrendingProducts
