import { Link } from "react-router-dom"

const AboutBrand = () => {
  return (
    <section className="py-16 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">About Our Brand</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              We are passionate about bringing you the latest fashion trends and timeless pieces that make you feel
              confident and stylish. Our carefully curated collection features high-quality garments from emerging
              designers and established brands.
            </p>
            <p className="leading-relaxed text-gray-600">
              Since our founding, we've been committed to sustainable fashion practices and ethical sourcing. Every
              piece in our collection is selected with care, ensuring that you get the best value for your investment in
              style.
            </p>

            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">500+</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">50+</div>
                <div className="text-gray-600">Brands</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-black">5★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-black rounded-md hover:bg-gray-800"
              >
                Learn More
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 font-medium text-black transition-colors duration-200 border border-black rounded-md hover:bg-black hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg shadow-xl aspect-w-4 aspect-h-3">
              <img src="/placeholder.jpg" alt="About our brand" className="object-cover object-center w-full h-96" />
            </div>

            {/* Decorative elements */}
            <div className="absolute w-24 h-24 bg-gray-100 rounded-full -top-4 -right-4 -z-10"></div>
            <div className="absolute w-32 h-32 rounded-full -bottom-4 -left-4 bg-gray-50 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBrand
