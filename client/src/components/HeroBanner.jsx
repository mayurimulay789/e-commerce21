"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { heroBanners } = useSelector((state) => state.banners)

  useEffect(() => {
    if (heroBanners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [heroBanners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
  }

  if (!heroBanners.length) {
    return (
      <div className="h-[60vh] md:h-[80vh] bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-6xl">Welcome to FashionHub</h1>
          <p className="mb-8 text-xl text-gray-600">Discover the latest fashion trends</p>
          <Link
            to="/products"
            className="px-8 py-3 text-lg text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
          >
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        {heroBanners.map(
          (banner, index) =>
            index === currentSlide && (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${banner.image.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="relative flex items-center justify-center h-full px-4 text-center text-white">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="max-w-4xl"
                  >
                    <motion.h1
                      className="mb-4 text-4xl font-bold md:text-6xl"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {banner.title}
                    </motion.h1>
                    {banner.subtitle && (
                      <motion.p
                        className="mb-2 text-xl md:text-2xl"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        {banner.subtitle}
                      </motion.p>
                    )}
                    {banner.description && (
                      <motion.p
                        className="mb-8 text-lg md:text-xl"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      >
                        {banner.description}
                      </motion.p>
                    )}
                    {banner.buttonText && banner.buttonLink && (
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <Link
                          to={banner.buttonLink}
                          className="inline-block px-8 py-3 text-lg text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                        >
                          {banner.buttonText}
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      {heroBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute p-2 text-white transition-colors transform -translate-y-1/2 bg-white rounded-full left-4 top-1/2 bg-opacity-20 hover:bg-opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute p-2 text-white transition-colors transform -translate-y-1/2 bg-white rounded-full right-4 top-1/2 bg-opacity-20 hover:bg-opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default HeroBanner
