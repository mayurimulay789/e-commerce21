"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion" // Import motion for animations

const AboutBrand = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <section className="py-16 bg-gray-50">
      {" "}
      {/* Changed background to a lighter gray for contrast */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Section: Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6"
          >
            <motion.h2
              variants={textVariants}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ksauni-red to-ksauni-dark-red md:text-5xl"
            >
              About Our Brand
            </motion.h2>
            <motion.p variants={textVariants} className="text-lg leading-relaxed text-gray-700">
              We are passionate about bringing you the latest fashion trends and timeless pieces that make you feel
              confident and stylish. Our carefully curated collection features high-quality garments from emerging
              designers and established brands.
            </motion.p>
            <motion.p variants={textVariants} className="leading-relaxed text-gray-700">
              Since our founding, we've been committed to sustainable fashion practices and ethical sourcing. Every
              piece in our collection is selected with care, ensuring that you get the best value for your investment in
              style.
            </motion.p>
            <div className="grid grid-cols-2 gap-6 py-6">
              <motion.div variants={textVariants} className="text-center">
                <div className="mb-2 text-3xl font-bold text-ksauni-red">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </motion.div>
              <motion.div variants={textVariants} className="text-center">
                <div className="mb-2 text-3xl font-bold text-ksauni-red">500+</div>
                <div className="text-gray-600">Products</div>
              </motion.div>
              <motion.div variants={textVariants} className="text-center">
                <div className="mb-2 text-3xl font-bold text-ksauni-red">50+</div>
                <div className="text-gray-600">Brands</div>
              </motion.div>
              <motion.div variants={textVariants} className="text-center">
                <div className="mb-2 text-3xl font-bold text-ksauni-red">5★</div>
                <div className="text-gray-600">Average Rating</div>
              </motion.div>
            </div>
            <motion.div
              variants={textVariants}
              className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-colors duration-300 rounded-full shadow-lg bg-ksauni-red hover:bg-ksauni-dark-red"
              >
                Learn More
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 font-medium transition-colors duration-300 border-2 rounded-full shadow-lg text-ksauni-red border-ksauni-red hover:bg-ksauni-red hover:text-white"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Section: Image Collage */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Image (Books) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl shadow-xl h-[492px] bg-cover bg-center"
                style={{ backgroundImage: `url('https://veirdo.in/cdn/shop/files/4_1441956f-dec6-4902-b012-52e5bbeb4bce.jpg?v=1726657006')`, backgroundPosition: "left center" }}
              >
                <span className="sr-only">Stack of colorful books</span>
              </motion.div>

              {/* Right Images (Camera and Woman) */}
              <div className="grid grid-cols-1 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-3xl shadow-xl h-[240px] bg-cover bg-center"
                  style={{ backgroundImage: `url('/images/about-brand-collage.png')`, backgroundPosition: "right top" }}
                >
                  <span className="sr-only">Camera with pink and blue lighting</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-3xl shadow-xl h-[240px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://res.cloudinary.com/dlqh7mjvo/image/upload/v1735025680/deals/y5f3b2w1apdkcd02a5yd.jpg')`,
                    backgroundPosition: "right bottom",
                  }}
                >
                  <span className="sr-only">Smiling woman holding shopping bags</span>
                </motion.div>
              </div>
            </div>
            {/* Decorative elements - updated colors */}
            <div className="absolute w-24 h-24 rounded-full bg-ksauni-red/10 -top-4 -right-4 -z-10 animate-pulse-slow" />
            <div className="absolute w-32 h-32 delay-500 rounded-full -bottom-4 -left-4 bg-ksauni-dark-red/10 -z-10 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBrand
