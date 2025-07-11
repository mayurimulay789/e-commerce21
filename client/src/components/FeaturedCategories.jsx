"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
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
    <section className="py-16 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Explore our curated collection of fashion categories designed for every style and occasion
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="relative overflow-hidden transition-shadow duration-300 rounded-lg shadow-lg group hover:shadow-xl"
            >
              <div className="bg-gray-200 aspect-w-16 aspect-h-9">
                <img
                  src={category.image || "/placeholder.jpg"}
                  alt={category.name}
                  className="object-cover object-center w-full h-64 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-black bg-opacity-40 group-hover:bg-opacity-50" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="mb-2 text-2xl font-bold">{category.name}</h3>
                  <p className="mb-4 text-sm opacity-90">{category.description}</p>
                  <span className="inline-flex items-center px-4 py-2 font-medium text-black transition-colors duration-200 bg-white rounded-md group-hover:bg-gray-100">
                    Shop Now
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 font-medium text-black transition-colors duration-200 border border-black rounded-md hover:bg-black hover:text-white"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
