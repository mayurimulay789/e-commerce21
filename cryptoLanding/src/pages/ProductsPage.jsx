"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Grid, List, SlidersHorizontal, X } from "lucide-react"
import { fetchProducts, setFilters, clearFilters } from "../store/slices/productSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ProductCard from "../components/ProductCard"
import ProductFilters from "../components/ProductFilter"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const ProductsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { products, pagination, isLoading, error, filters } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.categories)

  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      category: searchParams.get("category") || "",
      search: searchParams.get("search") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
    }

    dispatch(setFilters(urlFilters))
    setSortBy(urlFilters.sort)
  }, [searchParams, dispatch])

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Fetch products when filters change
  useEffect(() => {
    const params = {
      ...filters,
      page: searchParams.get("page") || 1,
      limit: 12,
    }

    dispatch(fetchProducts(params))
  }, [dispatch, filters, searchParams])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    const page = searchParams.get("page")
    if (page && page !== "1") params.set("page", page)

    setSearchParams(params)
  }, [filters, setSearchParams, searchParams])

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters))
    // Reset to page 1 when filters change
    const params = new URLSearchParams(searchParams)
    params.delete("page")
    setSearchParams(params)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
    handleFilterChange({ sort })
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page)
    }
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearAllFilters = () => {
    dispatch(clearFilters())
    setSearchParams({})
    setSortBy("newest")
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value && value !== "newest").length
  }

  if (error) {
    toast.error(error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex flex-col justify-between mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {filters.search ? `Search results for "${filters.search}"` : "All Products"}
            </h1>
            <p className="text-gray-600">{pagination ? `${pagination.total} products found` : "Loading products..."}</p>
          </div>

          {/* View Controls */}
          <div className="flex items-center mt-4 space-x-4 md:mt-0">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex overflow-hidden border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-pink-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-pink-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-pink-500 rounded-lg md:hidden hover:bg-pink-600"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-1 text-xs bg-pink-700 rounded-full">{getActiveFiltersCount()}</span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 text-sm text-pink-800 bg-pink-100 rounded-full">
                Category: {categories.find((cat) => cat._id === filters.category)?.name || filters.category}
                <button onClick={() => handleFilterChange({ category: "" })} className="ml-2 hover:text-pink-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 text-sm text-pink-800 bg-pink-100 rounded-full">
                Search: {filters.search}
                <button onClick={() => handleFilterChange({ search: "" })} className="ml-2 hover:text-pink-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-3 py-1 text-sm text-pink-800 bg-pink-100 rounded-full">
                Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || "∞"}
                <button
                  onClick={() => handleFilterChange({ minPrice: "", maxPrice: "" })}
                  className="ml-2 hover:text-pink-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-sm font-medium text-pink-600 hover:text-pink-700">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="flex-shrink-0 hidden w-64 md:block">
            <ProductFilters
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              <LoadingSpinner message="Loading products..." />
            ) : products.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                  <SlidersHorizontal className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-800">No products found</h3>
                <p className="mb-8 text-gray-600">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 text-white transition-colors bg-pink-500 rounded-lg hover:bg-pink-600"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                {/* Products Grid */}
                <motion.div
                  layout
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProductCard product={product} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center mt-12 space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          page === pagination.current
                            ? "bg-pink-500 text-white border-pink-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="absolute top-0 left-0 h-full overflow-y-auto bg-white shadow-xl w-80"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearAllFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default ProductsPage
