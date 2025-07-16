"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Play, Pause } from "lucide-react" // Import Play/Pause icons
import { fetchNewArrivals } from "../store/slices/productSlice"
import LoadingSpinner from "./LoadingSpinner"

const NewArrivals = () => {
  const dispatch = useDispatch()
  const { newArrivals, isLoadingNewArrivals } = useSelector((state) => state.products)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true) // State for auto-play
  const itemsPerPage = 4 // Number of products to show per slide on large screens

  useEffect(() => {
    dispatch(fetchNewArrivals())
  }, [dispatch])

  // Auto-play functionality
  useEffect(() => {
    if (newArrivals.length > 0 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalPages)
      }, 5000) // Change slide every 5 seconds
      return () => clearInterval(timer)
    }
  }, [newArrivals.length, isAutoPlaying, currentSlide]) // Added currentSlide to dependencies for re-triggering timer

  const totalPages = Math.ceil(newArrivals.length / itemsPerPage)

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages)
    setIsAutoPlaying(false) // Pause auto-play on manual navigation
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages)
    setIsAutoPlaying(false) // Pause auto-play on manual navigation
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev)
  }

  // Determine products for the current slide
  const startIndex = currentSlide * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const productsToShow = newArrivals.slice(startIndex, endIndex)

  if (isLoadingNewArrivals) {
    return <LoadingSpinner />
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">New Arrivals</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Discover the latest fashion trends and must-have pieces that just landed in our collection
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide} // Key for re-rendering and animating on slide change
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {productsToShow.map((product) => (
                <motion.div // Added motion.div for individual card animations
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }} // Subtle lift and shadow on hover
                  className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl group"
                >
                  <div className="relative w-full overflow-hidden bg-gray-200 aspect-square">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg?height=400&width=400"}
                      alt={product.name}
                      className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.isNew && (
                      <div className="absolute top-0 left-0 px-3 py-1 text-xs font-semibold text-white rounded-br-lg bg-ksauni-red">
                        NEW
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white rounded-bl-lg bg-ksauni-dark-red">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0) ? "text-yellow-400" : "text-gray-300"
                            }`}
                            fill="currentColor"
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-xl font-bold text-gray-900">
                              ₹{Math.round(product.price * (1 - product.discount / 100))}
                            </span>
                            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex mt-4 space-x-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 px-4 py-2 text-sm font-medium text-center text-white transition-colors duration-200 rounded-md bg-ksauni-red hover:bg-ksauni-dark-red"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => {
                          // Add to cart functionality
                          console.log("Add to cart:", product._id)
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 border rounded-md text-ksauni-red border-ksauni-red hover:bg-ksauni-red hover:text-white"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-0 z-10 p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-0 z-10 p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Dots Indicator and Auto-play Toggle */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={toggleAutoPlay}
              className="p-2 text-gray-700 transition-colors duration-300 rounded-full shadow-md bg-white/80 hover:bg-white"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index)
                    setIsAutoPlaying(false) // Pause auto-play on manual dot navigation
                  }}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? "bg-ksauni-red" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/products?filter=new"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-colors duration-200 rounded-md bg-ksauni-red hover:bg-ksauni-dark-red"
          >
            View All New Arrivals
            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewArrivals
