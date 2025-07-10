"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Star, ThumbsUp, MessageCircle, Filter } from "lucide-react"
import { fetchProductReviews, createReview, likeReview } from "../store/slices/reviewSlice"
import { formatDistanceToNow } from "date-fns"

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch()
  const { currentProductReviews, reviewStats, loading } = useSelector((state) => state.review)
  const { user } = useSelector((state) => state.auth)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterRating, setFilterRating] = useState(0)
  const [sortBy, setSortBy] = useState("newest")
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    pros: "",
    cons: "",
  })

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews(productId))
    }
  }, [dispatch, productId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      alert("Please login to submit a review")
      return
    }

    try {
      await dispatch(
        createReview({
          productId,
          ...reviewForm,
        }),
      ).unwrap()

      setShowReviewForm(false)
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
        pros: "",
        cons: "",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const handleLikeReview = (reviewId) => {
    if (!user) {
      alert("Please login to like reviews")
      return
    }
    dispatch(likeReview(reviewId))
  }

  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`${size} ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    const { ratingDistribution, totalReviews } = reviewStats

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const filteredAndSortedReviews = currentProductReviews
    .filter((review) => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        case "helpful":
          return (b.likes?.length || 0) - (a.likes?.length || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return <div className="py-8 text-center">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="p-6 rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900">{reviewStats.averageRating}</div>
            {renderStars(Math.round(reviewStats.averageRating), "w-6 h-6")}
            <div className="mt-2 text-gray-600">Based on {reviewStats.totalReviews} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="mb-3 font-semibold">Rating Distribution</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {user && (
        <div className="text-center">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="p-6 space-y-4 bg-white border rounded-lg">
          <h3 className="text-lg font-semibold">Write Your Review</h3>

          {/* Rating */}
          <div>
            <label className="block mb-2 text-sm font-medium">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm font-medium">Review Title</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Summarize your experience"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block mb-2 text-sm font-medium">Your Review</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts about this product"
              required
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">Pros (Optional)</label>
              <textarea
                value={reviewForm.pros}
                onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did you like?"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Cons (Optional)</label>
              <textarea
                value={reviewForm.cons}
                onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What could be improved?"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value={0}>All ratings</option>
              <option value={5}>5 stars</option>
              <option value={4}>4 stars</option>
              <option value={3}>3 stars</option>
              <option value={2}>2 stars</option>
              <option value={1}>1 star</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {filterRating > 0
              ? `No reviews with ${filterRating} stars found.`
              : "No reviews yet. Be the first to review this product!"}
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review._id} className="p-6 bg-white border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-sm font-medium">{review.user?.name?.charAt(0) || "U"}</span>
                  </div>
                  <div>
                    <div className="font-medium">{review.user?.name || "Anonymous"}</div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <h4 className="mb-2 font-semibold">{review.title}</h4>
              <p className="mb-4 text-gray-700">{review.comment}</p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                  {review.pros && (
                    <div className="p-3 rounded bg-green-50">
                      <div className="mb-1 font-medium text-green-800">Pros:</div>
                      <div className="text-sm text-green-700">{review.pros}</div>
                    </div>
                  )}
                  {review.cons && (
                    <div className="p-3 rounded bg-red-50">
                      <div className="mb-1 font-medium text-red-800">Cons:</div>
                      <div className="text-sm text-red-700">{review.cons}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLikeReview(review._id)}
                  className="flex items-center space-x-1 text-gray-500 transition-colors hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Helpful ({review.likes?.length || 0})</span>
                </button>

                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{review.replies?.length || 0} replies</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductReviews
