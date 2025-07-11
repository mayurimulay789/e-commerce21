"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, X } from "lucide-react"

const ProductFilters = ({ filters, categories, onFilterChange, onClearFilters, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePriceChange = (field, value) => {
    onFilterChange({
      [field]: value,
    })
  }

  const priceRanges = [
    { label: "Under ₹500", min: "", max: "500" },
    { label: "₹500 - ₹1000", min: "500", max: "1000" },
    { label: "₹1000 - ₹2000", min: "1000", max: "2000" },
    { label: "₹2000 - ₹5000", min: "2000", max: "5000" },
    { label: "Above ₹5000", min: "5000", max: "" },
  ]

  const ratings = [4, 3, 2, 1]

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Clear All Filters */}
      <button
        onClick={onClearFilters}
        className="w-full py-2 text-sm font-medium text-pink-600 transition-colors border border-pink-200 rounded-lg hover:text-pink-700 hover:bg-pink-50"
      >
        Clear All Filters
      </button>

      {/* Categories */}
      <div className="pb-4 border-b">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-medium text-gray-800">Categories</h3>
          {expandedSections.categories ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ height: expandedSections.categories ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-3 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => onFilterChange({ category: "" })}
                className="mr-3 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-gray-700">All Categories</span>
            </label>
            {categories.map((category) => (
              <label key={category._id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category._id}
                  onChange={() => onFilterChange({ category: category._id })}
                  className="mr-3 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">{category.name}</span>
                <span className="ml-auto text-sm text-gray-500">({category.productCount || 0})</span>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Price Range */}
      <div className="pb-4 border-b">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full text-left">
          <h3 className="text-lg font-medium text-gray-800">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ height: expandedSections.price ? "auto" : 0 }}
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
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Max Price</label>
                <input
                  type="number"
                  placeholder="₹∞"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                    onChange={() => onFilterChange({ minPrice: range.min, maxPrice: range.max })}
                    className="mr-3 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating */}
      <div>
        <button onClick={() => toggleSection("rating")} className="flex items-center justify-between w-full text-left">
          <h3 className="text-lg font-medium text-gray-800">Customer Rating</h3>
          {expandedSections.rating ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ height: expandedSections.rating ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-3 space-y-2">
            {ratings.map((rating) => (
              <label key={rating} className="flex items-center">
                <input type="checkbox" className="mr-3 text-pink-600 focus:ring-pink-500" />
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-700">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductFilters
