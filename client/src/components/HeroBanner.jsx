"use client"
import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, ArrowRight, Star } from "lucide-react"
import { Link } from "react-router-dom"

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const { heroBanners } = useSelector((state) => state.banners)

  // Mouse tracking for parallax effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 700 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // Scroll-based animations
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    if (heroBanners.length > 0 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [heroBanners.length, isAutoPlaying])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setMousePosition({ x, y })
    mouseX.set((x - centerX) / 20)
    mouseY.set((y - centerY) / 20)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  }

  const textVariants = {
    hidden: { y: 50, opacity: 0 }, // Smoother initial hidden state
    visible: (delay) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: delay * 0.1,
        duration: 0.6, // Slightly faster duration
        ease: "easeOut", // Smoother ease
      },
    }),
  }

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 }, // Smoother initial hidden state
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.5, // Slightly faster duration
        ease: "easeOut", // Smoother ease
      },
    },
    hover: {
      scale: 1.05,
      // Removed boxShadow for a cleaner look
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  const floatingElementVariants = {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Fallback UI if no banners are available
  if (!heroBanners.length) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative h-[70vh] md:h-[90vh] bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
          }}
        />
        {/* Floating Elements */}
        <motion.div
          variants={floatingElementVariants}
          animate="animate"
          className="absolute w-20 h-20 rounded-full top-20 left-20 bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 blur-xl"
        />
        <motion.div
          variants={floatingElementVariants}
          animate="animate"
          className="absolute w-32 h-32 rounded-full bottom-20 right-20 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 blur-xl"
          style={{ animationDelay: "2s" }}
        />
        <div className="relative z-10 max-w-4xl px-4 text-center">
          <motion.div variants={textVariants} custom={0} className="mb-6">
            <div // Removed rotation animation from Sparkles
              className="inline-block p-4 mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1
            variants={textVariants}
            custom={1}
            className="mb-6 text-5xl font-bold text-transparent md:text-7xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text"
          >
            Welcome to FashionHub
          </motion.h1>
          <motion.p variants={textVariants} custom={2} className="mb-8 text-xl font-light text-gray-600 md:text-2xl">
            Discover the latest fashion trends and elevate your style
          </motion.p>
          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-full group bg-gradient-to-r from-pink-600 to-purple-600" // Removed shadow-lg and hover:shadow-xl
            >
              Shop Now
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const currentBanner = heroBanners[currentSlide]

  return (
    <motion.section
      ref={containerRef}
      className="relative h-[70vh] md:h-[90vh] overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ y, opacity }}
    >
      {/* Custom Cursor */}
      <motion.div
        className="fixed z-50 w-4 h-4 bg-white rounded-full pointer-events-none mix-blend-difference"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
        animate={{
          scale: isHovered ? 2 : 1,
          opacity: isHovered ? 0.8 : 0,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Background Image with Parallax */}
      <motion.div
        key={currentBanner._id} // Key for re-render on slide change
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${currentBanner.image?.url || "/placeholder.svg?height=800&width=1200"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          x: mouseXSpring,
          y: mouseYSpring,
        }}
        initial={{ opacity: 0 }} // Fade in new background image
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />

      {/* Content */}
      <div className="relative flex items-center h-full px-6 md:px-12">
        <motion.div className="max-w-3xl text-white" initial="hidden" animate="visible" variants={containerVariants}>
          {/* Badge */}
          <motion.div
            variants={textVariants}
            custom={0}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium border rounded-full bg-white/20 backdrop-blur-sm border-white/30"
          >
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            Premium Collection
          </motion.div>
          <motion.h1 variants={textVariants} custom={1} className="mb-4 text-4xl font-bold leading-tight md:text-7xl">
            <span className="block">{currentBanner.title}</span>
          </motion.h1>
          {currentBanner.subtitle && (
            <motion.p variants={textVariants} custom={2} className="mb-2 text-xl font-light text-pink-200 md:text-3xl">
              {currentBanner.subtitle}
            </motion.p>
          )}
          {currentBanner.description && (
            <motion.p
              variants={textVariants}
              custom={3}
              className="max-w-2xl mb-8 text-lg leading-relaxed text-gray-200 md:text-xl"
            >
              {currentBanner.description}
            </motion.p>
          )}
          {currentBanner.buttonText && currentBanner.buttonLink && (
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to={currentBanner.buttonLink}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-full group bg-gradient-to-r from-pink-600 to-purple-600" // Removed shadow-lg and hover:shadow-xl
              >
                {currentBanner.buttonText}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <motion.button
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 rounded-full border-white/30 backdrop-blur-sm hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation Controls */}
      {heroBanners.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <motion.button
            onClick={prevSlide}
            className="absolute p-3 text-white transition-all duration-300 transform -translate-y-1/2 border rounded-full left-6 top-1/2 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 group"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute p-3 text-white transition-all duration-300 transform -translate-y-1/2 border rounded-full right-6 top-1/2 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 group"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>

          {/* Progress Indicators */}
          <div className="absolute flex items-center space-x-4 transform -translate-x-1/2 bottom-8 left-1/2">
            <motion.button
              onClick={toggleAutoPlay}
              className="p-2 text-white transition-all duration-300 border rounded-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
            <div className="flex space-x-3">
              {heroBanners.map((_, index) => (
                <motion.button
                  key={index}
                  className="relative group"
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <div
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                  {index === currentSlide && (
                    <motion.div
                      className="absolute inset-0 w-12 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                      layoutId="activeSlide"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="px-3 py-1 text-sm font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              {currentSlide + 1} / {heroBanners.length}
            </div>
          </div>
        </>
      )}

      {/* Scroll Indicator */}
      <motion.div
        className="absolute text-white bottom-8 right-8"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-px h-8 bg-white/50" />
        </div>
      </motion.div>
    </motion.section>
  )
}

export default HeroBanner
