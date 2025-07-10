import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchNewArrivals } from '../store/slices/productSlice'
import LoadingSpinner from './LoadingSpinner'

const NewArrivals = () => {
  const dispatch = useDispatch()
  const { newArrivals, isLoading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchNewArrivals())
  }, [dispatch])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">New Arrivals</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Discover the latest fashion trends and must-have pieces that just landed in our collection
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals?.slice(0, 8).map((product) => (
            <div key={product._id} className="relative overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md group hover:shadow-xl">
              <div className="w-full overflow-hidden bg-gray-200 aspect-w-1 aspect-h-1">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="object-cover object-center w-full h-64 transition-transform duration-300 group-hover:scale-105"
                />
                {product.isNew && (
                  <div className="absolute px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded top-2 left-2">
                    NEW
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="absolute px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded top-2 right-2">
                    -{product.discount}%
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{Math.round(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex mt-4 space-x-2">
                  <Link
                    to={`/product/${product._id}`}
                    className="flex-1 px-4 py-2 text-sm font-medium text-center text-white transition-colors duration-200 bg-black rounded-md hover:bg-gray-800"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      // Add to cart functionality
                      console.log('Add to cart:', product._id)
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-center text-black transition-colors duration-200 border border-black rounded-md hover:bg-black hover:text-white"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/products?filter=new"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-colors duration-200 bg-black border border-transparent rounded-md hover:bg-gray-800"
          >
            View All New Arrivals
            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewArrivals
