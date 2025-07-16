"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store/store"
import NetworkStatus from "./components/NetworkStatus"
import { validateEnvironment, debugEnvironment } from "./utils/envValidation"

// Import pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import ProfilePage from "./pages/ProfilePage"
import MyOrdersPage from "./pages/MyOrdersPage"
import WishlistPage from "./pages/WishlistPage"
import AboutUsPage from "./pages/Aboutus"
import ContactUsPage from "./pages/ContactUsPage"
import FAQPage from "./pages/FAQPage"
import PrivacyPage from "./pages/PrivacyPage"
import TermsPage from "./pages/TermsPage"
import SearchResultsPage from "./pages/SearchResultPage"
import ProductListingPage from "./pages/ProductListingPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"

// Import admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import DigitalMarketerDashboard from "./pages/digitalMarketer/DigitalMarketerDashboard"

// Import components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

// Import styles
import "./App.css"

function App() {
  useEffect(() => {
    // Validate environment variables on app startup
    const isValidEnvironment = validateEnvironment()
    if (!isValidEnvironment) {
      console.error("❌ Application cannot start due to missing environment variables")
      return
    }
    // Debug environment in development
    debugEnvironment()
    console.log("🚀 Fashion E-commerce App started successfully")
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <NetworkStatus />
          <main className="main-content pt-28">
            {" "}
            {/* Added pt-28 here */}
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:category" element={<ProductListingPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />
              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Digital Marketer Routes */}
              <Route
                path="/marketer/*"
                element={
                  <ProtectedRoute requiredRole="digitalMarketer">
                    <DigitalMarketerDashboard />
                  </ProtectedRoute>
                }
              />
              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
                      <p className="mb-4 text-gray-600">Page not found</p>
                      <a href="/" className="text-blue-600 hover:text-blue-800">
                        Go back to home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  )
}

export default App
