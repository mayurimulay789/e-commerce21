import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fashion Store</h3>
            <p className="text-sm text-gray-300">
              Your one-stop destination for trendy and affordable fashion. Discover the latest styles and express your
              unique personality.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
              <Twitter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
              <Instagram className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
              <Youtube className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-gray-300 hover:text-white">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-300 hover:text-white">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products?category=men" className="text-gray-300 hover:text-white">
                  Men's Fashion
                </a>
              </li>
              <li>
                <a href="/products?category=women" className="text-gray-300 hover:text-white">
                  Women's Fashion
                </a>
              </li>
              <li>
                <a href="/products?category=kids" className="text-gray-300 hover:text-white">
                  Kids' Fashion
                </a>
              </li>
              <li>
                <a href="/products?category=accessories" className="text-gray-300 hover:text-white">
                  Accessories
                </a>
              </li>
              <li>
                <a href="/products?category=shoes" className="text-gray-300 hover:text-white">
                  Shoes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">123 Fashion Street, Style City, SC 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">support@fashionstore.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-gray-800 md:flex-row">
          <p className="text-sm text-gray-400">© 2024 Fashion Store. All rights reserved.</p>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <a href="/privacy" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-white">
              Terms of Service
            </a>
            <a href="/cookies" className="text-sm text-gray-400 hover:text-white">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
