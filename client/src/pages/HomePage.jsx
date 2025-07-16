"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import Navbar from "../components/Navbar"
import HeroBanner from "../components/HeroBanner"
import FeaturedCategories from "../components/FeaturedCategories"
import TrendingProducts from "../components/TrendingProducts"
import NewArrivals from "../components/NewArrivals"
import PromoBanners from "../components/PromoBanners"
import AboutBrand from "../components/AboutBrand"
import FeaturedHighlight from '../components/FeaturedHighlight'
import Testimonials from "../components/Testimonials"
import Footer from "../components/Footer"

import {
  fetchTrendingProducts,
  fetchNewArrivals,
} from "../store/slices/productSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import {
  fetchHeroBanners,
  fetchPromoBanners,
} from "../store/slices/bannerSlice"

const HomePage = () => {
  const dispatch = useDispatch()

  // Get necessary slices of state
  const {
    trendingProducts,
    newArrivals,
  } = useSelector((state) => state.products)

  const { categories } = useSelector((state) => state.categories)
  const { heroBanners, promoBanners } = useSelector((state) => state.banners)

  // Fetch hero and promo banners only if not already loaded
  useEffect(() => {
    if (!heroBanners.length) {
      dispatch(fetchHeroBanners())
    }

    if (!promoBanners.length) {
      dispatch(fetchPromoBanners())
    }
  }, [dispatch, heroBanners.length, promoBanners.length])

  // Fetch categories only if not already loaded
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories({ showOnHomepage: true }))
    }
  }, [dispatch, categories.length])

  // Fetch trending & new arrival products only if not already loaded
  useEffect(() => {
    if (!trendingProducts.length) {
      dispatch(fetchTrendingProducts())
    }

    if (!newArrivals.length) {
      dispatch(fetchNewArrivals())
    }
  }, [dispatch, trendingProducts.length, newArrivals.length])

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
        <FeaturedHighlight/>
        <Testimonials />
        {/* <InstagramFeed /> */}
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
