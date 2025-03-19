import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex-shrink-0">
      <img src={icon} alt={title} className="w-12 h-12 object-contain" />
    </div>
    <div>
      <h3 className="text-gray-900 font-semibold text-lg">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </motion.div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Feature cards data
  const features = [
    {
      icon: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742374097/icon-1_ie7wn5.svg",
      title: "Best Prices & Offers",
      description: "Orders $50 or more"
    },
    {
      icon: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742374096/icon-2_cws23h.svg",
      title: "Free Delivery",
      description: "24/7 amazing services"
    },
    {
      icon: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742374096/icon-3_ykiv6a.svg",
      title: "Great Daily Deal",
      description: "When you sign up"
    },
    {
      icon: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742374096/icon-4_wey4zc.svg",
      title: "Wide Assortment",
      description: "Mega Discounts"
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Feature Cards Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="mb-6 text-gray-400">
              Stay updated with our latest products, offers, and tech news
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 flex-grow max-w-md"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <h4 className="text-white text-lg font-semibold mb-6">About Us</h4>
            <div className="mb-6">
              <img
                src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1740786122/logo-copy_px8c0w.png"
                alt="Company Logo"
                className="h-12 mb-4"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted destination for quality electronics and tech accessories. 
                We provide the latest gadgets and exceptional customer service.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to={"/"} className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaFacebookF className="w-5 h-5" />
              </Link>
              <Link to={"/"} className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link to={"/"} className="text-gray-400 hover:text-pink-500 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link to={"/"} className="text-gray-400 hover:text-blue-600 transition-colors">
                <FaLinkedinIn className="w-5 h-5" />
              </Link>
              <Link to={"/"} className="text-gray-400 hover:text-red-600 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <h4 className="text-white text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about us" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact us" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            <h4 className="text-white text-lg font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Warranty Information
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
          >
            <h4 className="text-white text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-500 mt-1" />
                <span className="text-gray-400">
                  123 Tech Street, Digital City,
                  <br />
                  Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhoneAlt className="w-5 h-5 text-blue-500" />
                <a href="tel:+923173336141" className="text-gray-400 hover:text-white transition-colors">
                  +92 317 3336141
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="w-5 h-5 text-blue-500" />
                <a href="mailto:support@techstore.com" className="text-gray-400 hover:text-white transition-colors">
                  support@techstore.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white text-sm font-semibold mb-3">Business Hours</h5>
              <p className="text-gray-400 text-sm">
                Monday - Friday: 9:00 AM - 10:00 PM
                <br />
                Saturday - Sunday: 10:00 AM - 8:00 PM
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* <div className="flex items-center space-x-4">
              <img src="/payment-methods/visa.png" alt="Visa" className="h-8" />
              <img src="/payment-methods/mastercard.png" alt="Mastercard" className="h-8" />
              <img src="/payment-methods/paypal.png" alt="PayPal" className="h-8" />
              <img src="/payment-methods/cod.png" alt="Cash on Delivery" className="h-8" />
            </div> */}
            <div className="text-gray-400 text-sm mx-auto">
              © {currentYear} Chinar Trading Corporation. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
