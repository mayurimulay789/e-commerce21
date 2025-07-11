"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Navbar from "../components/Navbar"
import HeroBanner from "../components/HeroBanner"
import FeaturedCategories from "../components/FeaturedCategories"
import TrendingProducts from "../components/TrendingProducts"
import NewArrivals from "../components/NewArrivals"
import PromoBanners from "../components/PromoBanners"
import AboutBrand from "../components/AboutBrand"
import Testimonials from "../components/Testimonials"
// import InstagramFeed from "../components/InstagramFeed"
import Footer from "../components/Footer"
import LoadingSpinner from "../components/LoadingSpinner"
import { fetchTrendingProducts, fetchNewArrivals } from "../store/slices/productSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import { fetchHeroBanners, fetchPromoBanners } from "../store/slices/bannerSlice"

const HomePage = () => {
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.products)

  useEffect(() => {
    // Fetch all homepage data
    dispatch(fetchHeroBanners())
    dispatch(fetchCategories({ showOnHomepage: true }))
    dispatch(fetchTrendingProducts())
    dispatch(fetchNewArrivals())
    dispatch(fetchPromoBanners())
  }, [dispatch])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroBanner />
        <FeaturedCategories />
        <TrendingProducts />
        <NewArrivals />
        <PromoBanners />
        <AboutBrand />
        <Testimonials />
        {/* <InstagramFeed /> */}
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
