"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion" // Import motion for animations
import { ArrowRight } from "lucide-react" // Import ArrowRight icon
import { fetchCategories } from "../store/slices/categorySlice"
import LoadingSpinner from "./LoadingSpinner"

const FeaturedCategories = () => {
  const dispatch = useDispatch()
  const { categories, isLoading } = useSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }))
  }, [dispatch])

  if (isLoading) {
    return <LoadingSpinner />
  }

  const featuredCategories = categories?.filter((cat) => cat.showOnHomepage)?.slice(0, 6) || []

  return (
    <section className="relative z-20 py-16 mt-16 bg-white">
      {" "}
      {/* Added relative z-20 and mt-16 */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ksauni-red to-ksauni-dark-red md:text-5xl" // Gradient text
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-lg text-gray-600 md:text-xl"
          >
            Explore our curated collection of fashion categories designed for every style and occasion
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden shadow-xl rounded-2xl group" // Modern rounded corners and shadow
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }} // Enhanced hover effect
            >
              <Link to={`/products?category=${category._id}`}>
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {" "}
                  {/* Adjusted aspect ratio for elegance */}
                  <img
                    src={category.image?.url || "/placeholder.svg?height=400&width=533"} // Use placeholder.svg
                    alt={category.image?.alt || category.name}
                    className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-110" // Smoother zoom
                  />
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-ksauni-dark-red/70 to-ksauni-red/40 group-hover:opacity-100" />{" "}
                  {/* Red gradient overlay */}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <motion.h3
                    className="mb-2 text-3xl font-bold text-white drop-shadow-md"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {category.name}
                  </motion.h3>
                  <motion.p
                    className="mb-4 text-sm text-white opacity-90 drop-shadow-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {category.description}
                  </motion.p>
                  <motion.span
                    className="inline-flex items-center px-6 py-3 font-semibold transition-colors duration-300 bg-white rounded-full shadow-lg text-ksauni-red group-hover:bg-gray-100"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white transition-colors duration-300 rounded-full shadow-lg bg-ksauni-red hover:bg-ksauni-dark-red hover:shadow-xl"
          >
            View All Categories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
