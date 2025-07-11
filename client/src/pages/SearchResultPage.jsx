"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Search, TrendingUp, Clock, X } from "lucide-react"
import { searchProducts, getSearchSuggestions, getTrendingSearches } from "../store/slices/searchSlice"
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice"
import { addToCart } from "../store/slices/cartSlice"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const query = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  const { results, suggestions, trendingSearches, isLoading, totalResults, searchTime } = useSelector(
    (state) => state.search,
  )
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (query) {
      dispatch(searchProducts({ query, page: 1, limit: 20 }))
      // Add to recent searches
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]")
      const updated = [query, ...recent.filter((item) => item !== query)].slice(0, 5)
      localStorage.setItem("recentSearches", JSON.stringify(updated))
      setRecentSearches(updated)
    }
  }, [dispatch, query])

  useEffect(() => {
    dispatch(getTrendingSearches())
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]")
    setRecentSearches(recent)
  }, [dispatch])

  useEffect(() => {
    if (searchInput.length > 2) {
      const debounceTimer = setTimeout(() => {
        dispatch(getSearchSuggestions(searchInput))
      }, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [dispatch, searchInput])

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchInput)
    }
  }

  const clearRecentSearch = (searchTerm) => {
    const updated = recentSearches.filter((item) => item !== searchTerm)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
    setRecentSearches(updated)
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

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }

    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url,
      }),
    )
    toast.success("Added to cart!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8 mx-auto">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for products, brands, categories..."
                className="w-full py-4 pl-12 pr-4 text-lg transition-colors border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={() => handleSearch(searchInput)}
                className="absolute px-6 py-2 text-white transition-colors transform -translate-y-1/2 bg-orange-500 rounded-lg right-2 top-1/2 hover:bg-orange-600"
              >
                Search
              </button>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions &&
                (searchInput.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 z-50 mt-2 overflow-y-auto bg-white border border-gray-200 shadow-lg top-full rounded-xl max-h-96"
                  >
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="p-4 border-b">
                        <h4 className="mb-2 text-sm font-medium text-gray-500">Suggestions</h4>
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(suggestion)}
                            className="block w-full px-3 py-2 text-left transition-colors rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Search className="w-4 h-4 mr-3 text-gray-400" />
                              <span>{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="p-4 border-b">
                        <h4 className="flex items-center mb-2 text-sm font-medium text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Recent Searches
                        </h4>
                        {recentSearches.map((search, index) => (
                          <div key={index} className="flex items-center justify-between group">
                            <button
                              onClick={() => handleSearch(search)}
                              className="flex-1 px-3 py-2 text-left transition-colors rounded-lg hover:bg-gray-50"
                            >
                              {search}
                            </button>
                            <button
                              onClick={() => clearRecentSearch(search)}
                              className="p-1 transition-all rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Trending Searches */}
                    {trendingSearches.length > 0 && (
                      <div className="p-4">
                        <h4 className="flex items-center mb-2 text-sm font-medium text-gray-500">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Trending
                        </h4>
                        {trendingSearches.map((trend, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(trend)}
                            className="block w-full px-3 py-2 text-left transition-colors rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 font-medium text-orange-500">#{index + 1}</span>
                              <span>{trend}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Results */}
        {query && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Search Results for "{query}"</h1>
                {!isLoading && (
                  <p className="mt-1 text-gray-600">
                    {totalResults} results found {searchTime && `in ${searchTime}ms`}
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner message="Searching products..." />
              </div>
            )}

            {/* No Results */}
            {!isLoading && results.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800">No results found for "{query}"</h2>
                <p className="max-w-md mx-auto mb-8 text-gray-600">
                  Try different keywords or check out our trending searches below
                </p>

                {/* Trending Suggestions */}
                {trendingSearches.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <h3 className="mb-4 text-lg font-medium">Try these popular searches:</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {trendingSearches.slice(0, 6).map((trend, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(trend)}
                          className="px-4 py-2 text-orange-600 transition-colors bg-orange-100 rounded-full hover:bg-orange-200"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Results Grid */}
            {!isLoading && results.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {results.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCard
                        product={product}
                        isInWishlist={wishlistItems.some((item) => item._id === product._id)}
                        onWishlistToggle={() => handleWishlistToggle(product)}
                        onAddToCart={() => handleAddToCart(product)}
                        onQuickView={() => navigate(`/product/${product._id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Default State - No Search Query */}
        {!query && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full">
              <Search className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Discover Amazing Products</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-600">
              Search through thousands of products to find exactly what you're looking for
            </p>

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <h3 className="flex items-center justify-center mb-6 text-lg font-medium">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Trending Searches
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {trendingSearches.map((trend, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSearch(trend)}
                      className="p-4 text-left transition-all bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 font-bold text-orange-500">#{index + 1}</span>
                        <span className="font-medium">{trend}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default SearchResultsPage
