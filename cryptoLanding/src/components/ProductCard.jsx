"use client"

import { motion } from "framer-motion"
import { Heart, ShoppingBag, Eye, Star } from "lucide-react"
import { Link } from "react-router-dom"

const ProductCard = ({
  product,
  viewMode = "grid",
  isInWishlist = false,
  onWishlistToggle,
  onAddToCart,
  onQuickView,
}) => {
  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md hover:shadow-lg"
      >
        <div className="flex">
          {/* Product Image */}
          <div className="relative flex-shrink-0 w-48 h-48 overflow-hidden">
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images[0]?.url || "/placeholder.svg?height=192&width=192"}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Badges */}
            <div className="absolute flex flex-col space-y-2 top-3 left-3">
              {product.tags?.includes("new-arrival") && (
                <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">NEW</span>
              )}
              {discountPercentage > 0 && (
                <span className="px-2 py-1 text-xs text-white bg-orange-500 rounded-full">-{discountPercentage}%</span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute flex flex-col space-y-2 transition-opacity opacity-0 top-3 right-3 group-hover:opacity-100">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onWishlistToggle}
                className={`p-2 rounded-full shadow-md transition-colors ${
                  isInWishlist
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onQuickView}
                className="p-2 text-gray-600 transition-colors bg-white rounded-full shadow-md hover:bg-orange-50 hover:text-orange-500"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-2">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-800 transition-colors hover:text-orange-500 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
            </div>

            {/* Category */}
            {product.category && <p className="mb-2 text-sm text-gray-500">{product.category.name}</p>}

            {/* Rating */}
            {product.rating && product.rating.average > 0 && (
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating.average) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">({product.rating.count} reviews)</span>
              </div>
            )}

            {/* Description */}
            <p className="mb-4 text-sm text-gray-600 line-clamp-2">{product.description}</p>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              <button
                onClick={onAddToCart}
                disabled={product.stock === 0}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
              </button>
            </div>

            {/* Stock Status */}
            {product.stock > 0 && product.stock < 5 && (
              <p className="mt-2 text-sm text-orange-600">Only {product.stock} left in stock!</p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md group hover:shadow-xl"
    >
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
          {product.tags?.includes("new-arrival") && (
            <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">NEW</span>
          )}
          {discountPercentage > 0 && (
            <span className="px-2 py-1 text-xs text-white bg-orange-500 rounded-full">-{discountPercentage}%</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute flex flex-col space-y-2 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWishlistToggle}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isInWishlist
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onQuickView}
            className="p-2 text-gray-600 transition-colors bg-white rounded-full shadow-md hover:bg-orange-50 hover:text-orange-500"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Quick Add Button */}
        <div className="absolute transition-opacity duration-300 opacity-0 bottom-3 left-3 right-3 group-hover:opacity-100">
          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center w-full py-2 space-x-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.stock === 0 ? "Out of Stock" : "Quick Add"}</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="mb-2 font-semibold text-gray-800 transition-colors line-clamp-2 hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        {product.category && <p className="mb-2 text-sm text-gray-500">{product.category.name}</p>}

        {/* Rating */}
        {product.rating && product.rating.average > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating.average) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">({product.rating.count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center mb-3 space-x-2">
          <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock === 0 ? (
          <div className="text-sm font-medium text-red-600">Out of Stock</div>
        ) : product.stock < 5 ? (
          <div className="text-sm text-orange-600">Only {product.stock} left!</div>
        ) : null}
      </div>
    </motion.div>
  )
}

export default ProductCard
