"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchPromoBanners } from "../store/slices/bannerSlice"
import LoadingSpinner from "./LoadingSpinner"

const PromoBanners = () => {
  const dispatch = useDispatch()
  const { promoBanners, isLoading } = useSelector((state) => state.banners)

  useEffect(() => {
    dispatch(fetchPromoBanners())
  }, [dispatch])

  if (isLoading) {
    return <LoadingSpinner />
  }

  const activeBanners = promoBanners?.filter((banner) => banner.isActive)?.slice(0, 2) || []

  if (activeBanners.length === 0) {
    // Default promo banners if none exist
    const defaultBanners = [
      {
        _id: "default-1",
        title: "Summer Sale",
        subtitle: "Up to 50% Off",
        description: "Get the best deals on summer collection",
        image: "/placeholder.jpg",
        buttonText: "Shop Now",
        buttonLink: "/products?sale=true",
      },
      {
        _id: "default-2",
        title: "New Collection",
        subtitle: "Fresh Arrivals",
        description: "Discover the latest fashion trends",
        image: "/placeholder.jpg",
        buttonText: "Explore",
        buttonLink: "/products?filter=new",
      },
    ]

    return (
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {defaultBanners.map((banner) => (
              <div key={banner._id} className="relative overflow-hidden rounded-lg shadow-lg group">
                <div className="bg-gray-200 aspect-w-16 aspect-h-9">
                  <img
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    className="object-cover object-center w-full h-64 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-6 text-center text-white">
                    <h3 className="mb-2 text-3xl font-bold">{banner.title}</h3>
                    <p className="mb-2 text-xl">{banner.subtitle}</p>
                    <p className="mb-6 text-sm opacity-90">{banner.description}</p>
                    <Link
                      to={banner.buttonLink}
                      className="inline-flex items-center px-6 py-3 font-medium text-black transition-colors duration-200 bg-white rounded-md hover:bg-gray-100"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {activeBanners.map((banner) => (
            <div key={banner._id} className="relative overflow-hidden rounded-lg shadow-lg group">
              <div className="bg-gray-200 aspect-w-16 aspect-h-9">
                <img
                  src={banner.image || "/placeholder.jpg"}
                  alt={banner.title}
                  className="object-cover object-center w-full h-64 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-6 text-center text-white">
                  <h3 className="mb-2 text-3xl font-bold">{banner.title}</h3>
                  {banner.subtitle && <p className="mb-2 text-xl">{banner.subtitle}</p>}
                  {banner.description && <p className="mb-6 text-sm opacity-90">{banner.description}</p>}
                  <Link
                    to={banner.buttonLink || "/products"}
                    className="inline-flex items-center px-6 py-3 font-medium text-black transition-colors duration-200 bg-white rounded-md hover:bg-gray-100"
                  >
                    {banner.buttonText || "Shop Now"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PromoBanners
