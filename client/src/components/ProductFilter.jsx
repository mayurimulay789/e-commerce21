"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X, Tag, DollarSign, Star } from "lucide-react" // Import Star icon

const ProductFilters = ({ filters, categories, onFilterChange, onClearFilters, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true, // Keep rating expanded by default for better visibility
  })
  const [selectedRatings, setSelectedRatings] = useState(filters.ratings || [])

  // Update local rating state when filters prop changes from parent
  useEffect(() => {
    setSelectedRatings(filters.ratings || [])
  }, [filters.ratings])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePriceChange = (field, value) => {
    onFilterChange({
      ...filters, // Ensure other filters are preserved
      [field]: value,
    })
  }

  const handleRatingChange = (rating) => {
    setSelectedRatings((prev) => {
      const newRatings = prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
      onFilterChange({ ratings: newRatings }) // Pass the new array to parent
      return newRatings
    })
  }

  const priceRanges = [
    { label: "Under ₹500", min: "", max: "500" },
    { label: "₹500 - ₹1000", min: "500", max: "1000" },
    { label: "₹1000 - ₹2000", min: "1000", max: "2000" },
    { label: "₹2000 - ₹5000", min: "2000", max: "5000" },
    { label: "Above ₹5000", min: "5000", max: "" },
  ]
  const ratings = [4, 3, 2, 1] // Ratings for "X Stars & Up"

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-100 shadow-lg rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 transition-colors rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Clear All Filters */}
      <button
        onClick={onClearFilters}
        className="w-full py-2 text-sm font-medium transition-colors border rounded-lg shadow-sm text-ksauni-red border-ksauni-red/50 hover:text-white hover:bg-ksauni-red"
      >
        Clear All Filters
      </button>

      {/* Categories */}
      <div className="pb-4 border-b border-gray-100">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <Tag className="w-5 h-5 mr-2 text-ksauni-red" />
            Categories
          </h3>
          <motion.div animate={{ rotate: expandedSections.categories ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <label className="flex items-center text-gray-700 transition-colors cursor-pointer hover:text-ksauni-red">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => onFilterChange({ category: "" })}
                    className="w-4 h-4 border-gray-300 rounded text-ksauni-red focus:ring-ksauni-red"
                  />
                  <span className="ml-2">All Categories</span>
                </label>
                {categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center text-gray-700 transition-colors cursor-pointer hover:text-ksauni-red"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === category._id}
                      onChange={() => onFilterChange({ category: category._id })}
                      className="w-4 h-4 border-gray-300 rounded text-ksauni-red focus:ring-ksauni-red"
                    />
                    <span className="ml-2">{category.name}</span>
                    <span className="ml-auto text-sm text-gray-500">({category.productCount || 0})</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="pb-4 border-b border-gray-100">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <DollarSign className="w-5 h-5 mr-2 text-ksauni-red" />
            Price Range
          </h3>
          <motion.div animate={{ rotate: expandedSections.price ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                {/* Custom Price Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Min Price</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      value={filters.minPrice || ""}
                      onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                      className="w-full px-3 py-2 text-sm transition-colors border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Max Price</label>
                    <input
                      type="number"
                      placeholder="₹∞"
                      value={filters.maxPrice || ""}
                      onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                      className="w-full px-3 py-2 text-sm transition-colors border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                    />
                  </div>
                </div>
                {/* Quick Price Ranges */}
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <label
                      key={index}
                      className="flex items-center text-gray-700 transition-colors cursor-pointer hover:text-ksauni-red"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                        onChange={() => onFilterChange({ minPrice: range.min, maxPrice: range.max })}
                        className="w-4 h-4 border-gray-300 rounded text-ksauni-red focus:ring-ksauni-red"
                      />
                      <span className="ml-2">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating */}
      <div>
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <Star className="w-5 h-5 mr-2 text-ksauni-red" />
            Customer Rating
          </h3>
          <motion.div animate={{ rotate: expandedSections.rating ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {ratings.map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center text-gray-700 transition-colors cursor-pointer hover:text-ksauni-red"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => handleRatingChange(rating)}
                      className="w-4 h-4 border-gray-300 rounded text-ksauni-red focus:ring-ksauni-red"
                    />
                    <div className="flex items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-gray-700">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default ProductFilters
