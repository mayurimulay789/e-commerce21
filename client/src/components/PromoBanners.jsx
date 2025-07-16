"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { fetchPromoBanners } from "../store/slices/bannerSlice"
import LoadingSpinner from "./LoadingSpinner"

// Utility function for countdown
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date()
  let timeLeft = {}

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  return timeLeft
}

const PromoBanners = () => {
  const dispatch = useDispatch()
  const { promoBanners, isLoading } = useSelector((state) => state.banners)

  // Fetch promo banners on component mount
  useEffect(() => {
    dispatch(fetchPromoBanners())
  }, [dispatch])

  // Set a target date for the countdown (e.g., December 13, 2024, as per image)
  // You might want to make this dynamic from backend data if available in banner object
  const targetDate = "2024-12-13T00:00:00"
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))

  // Update countdown every second
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearTimeout(timer)
  })

  // Prepare countdown timer components
  const timerComponents = []
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return
    }

    timerComponents.push(
      <motion.div
        key={interval}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 * Object.keys(timeLeft).indexOf(interval) }}
        className="flex flex-col items-center justify-center w-16 h-16 p-2 bg-white border border-gray-100 rounded-lg shadow-md sm:w-20 sm:h-20" // Responsive size, added border
      >
        <span className="text-xl font-bold text-gray-800 sm:text-2xl">
          {String(timeLeft[interval]).padStart(2, "0")}
        </span>{" "}
        {/* Responsive font size */}
        <span className="text-xs text-gray-500 uppercase">{interval}</span>
      </motion.div>,
    )
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Select the first active banner, or use a default if none exist
  const activeBanner = promoBanners?.filter((banner) => banner.isActive)?.[0]

  const bannerToDisplay = activeBanner || {
    _id: "default-deal",
    title: "DEAL OF THE DAY",
    subtitle: "CLICK SHOP NOW FOR ALL DEAL OF THE PRODUCT",
    description:
      "Donec condimentum Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras cursus pretium sapien, in pulvinar ipsum molestie id. Aliquam erat volutpat. Duis quam tellus, ullamcorper....",
    image: { url: "/images/deal-of-the-day.png" }, // Use the provided image as default
    buttonText: "Shop Now",
    buttonLink: "/products?deal=true",
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="py-16 bg-red-50" // Light pinkish background
    >
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Section: Deal Details and Countdown */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl"
            >
              {bannerToDisplay.title}
            </motion.h2>
            {bannerToDisplay.subtitle && (
              <motion.p
                variants={itemVariants}
                className="text-base font-semibold tracking-wide uppercase sm:text-lg text-ksauni-red"
              >
                {bannerToDisplay.subtitle}
              </motion.p>
            )}
            {bannerToDisplay.description && (
              <motion.p
                variants={itemVariants}
                className="max-w-lg mx-auto text-sm leading-relaxed text-gray-700 sm:text-base lg:mx-0"
              >
                {bannerToDisplay.description}
              </motion.p>
            )}
            <motion.p variants={itemVariants} className="text-xs text-gray-600 sm:text-sm">
              Available until:{" "}
              {new Date(targetDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
            </motion.p>

            {/* Countdown Timer */}
            <div className="flex justify-center mt-8 space-x-2 lg:justify-start sm:space-x-4">
              {" "}
              {/* Responsive spacing */}
              {timerComponents.length ? (
                timerComponents
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold text-ksauni-red"
                >
                  Deal Expired!
                </motion.span>
              )}
            </div>

            {/* Shop Now Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <Link
                to={bannerToDisplay.buttonLink || "/products"}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white transition-colors duration-300 rounded-full shadow-lg sm:px-8 sm:py-4 sm:text-lg bg-ksauni-red hover:bg-ksauni-dark-red" // Responsive padding
              >
                {bannerToDisplay.buttonText || "Shop Now"}
              </Link>
            </motion.div>
          </div>

          {/* Right Section: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="relative flex justify-center w-full lg:justify-end" // Ensure full width for responsiveness
          >
            <div className="relative w-full max-w-md overflow-hidden border-4 shadow-2xl rounded-xl border-ksauni-red lg:max-w-none">
              {" "}
              {/* Responsive width */}
              <img
                src={bannerToDisplay.image?.url || "/placeholder.svg?height=500&width=500"}
                alt={bannerToDisplay.title || "Deal of the Day Product"}
                className="object-cover w-full h-auto max-h-[400px] sm:max-h-[500px]" // Responsive max height
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default PromoBanners
