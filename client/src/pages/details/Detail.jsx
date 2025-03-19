import React, { useState, useEffect, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { FaChevronDown, FaChevronUp, FaHeart, FaWhatsapp, FaShare, FaTruck, FaShieldAlt, FaExchangeAlt, FaCheckCircle } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import { RxShuffle } from "react-icons/rx";
import { BsCart3 } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { useCart } from "../cart/cartContext";
import TabComponent from "./TabComponent";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
// import ImageMagnifier from "../../components/zoom";
// import FeaturedSection from "../../components/FeaturedSection";
import { api, endpoints } from "../../api";

const DetailsPage = () => {
  const [wishListed, setWishListed] = useState(false);
  const [product, setProduct] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch, cart } = useCart();

  const fetchRelatedProducts = async (category) => {
    if (!category) return [];
    
    try {
      const relatedResponse = await api.get(`/products/related/${category}`);
      if (!relatedResponse.data) {
        console.warn('Failed to fetch related products');
        return [];
      }
      return relatedResponse.data.products || [];
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        if (!response.data) {
          throw new Error('Product not found');
        }
        const data = response.data;
        setProduct(data);
        
        // Only fetch related products if we have a category
        if (data.category) {
          const relatedProducts = await fetchRelatedProducts(data.category);
          setRelatedProducts(relatedProducts);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (product && product._id) {
      const itemInCart = cart.find((item) => item._id === product._id);
      if (itemInCart) {
        setCartItems((prev) => ({ ...prev, [product._id]: itemInCart.quantity }));
      }
    }
  }, [cart, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    const quantity = cartItems[product._id] ?? 1;
    dispatch({ type: "ADD_TO_CART", payload: { ...product, quantity } });
    setCartItems((prev) => ({ ...prev, [product._id]: quantity }));
    toast.success("Added to cart successfully!");
  };

  const handleIncrease = (id) => {
    setCartItems((prev) => {
      const updatedQuantity = (prev[id] || 1) + 1;
      dispatch({ type: "UPDATE_QUANTITY", payload: { _id: id, quantity: updatedQuantity } });
      return { ...prev, [id]: updatedQuantity };
    });
  };

  const handleDecrease = (id) => {
    setCartItems((prev) => {
      const updatedQuantity = Math.max((prev[id] || 1) - 1, 1);
      dispatch({ type: "UPDATE_QUANTITY", payload: { _id: id, quantity: updatedQuantity } });
      return { ...prev, [id]: updatedQuantity };
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: window.location.href
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Product</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4 md:p-8 mt-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Product Images */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 flex justify-center items-center bg-white">
            <InnerImageZoom
              src={product.imageUrl}
              zoomSrc={product.imageUrl}
              className="rounded-lg max-w-full h-auto object-contain"
            />
          </div>
          {product.gallery && product.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border rounded-lg p-2 transition ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 text-xl">
                <span className="line-through text-gray-500">Rs.{product.actualPrice?.toLocaleString()}</span>
                <span className="text-red-600 font-bold">Rs.{product.price.toLocaleString()}</span>
              </div>
              {product.discount && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Rating value={product.rating || 3.5} precision={0.5} readOnly />
              <span className="text-gray-600">({product.reviewCount || 24} reviews)</span>
            </div>
          </motion.div>

          {/* Product Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <FaTruck className="text-blue-500" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaShieldAlt className="text-blue-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaExchangeAlt className="text-blue-500" />
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaCheckCircle className="text-blue-500" />
              <span>Authentic Product</span>
            </div>
          </motion.div>

          {/* Product Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded px-4 py-2">
                <input
                  type="number"
                  value={cartItems[product._id] ?? 1}
                  className="w-12 text-center outline-none counter-btn"
                  onChange={(e) => {
                    const newQuantity = Math.max(Number(e.target.value), 1);
                    setCartItems((prev) => ({ ...prev, [product._id]: newQuantity }));
                  }}
                />
                <div className="flex flex-col">
                  <FaChevronUp className="cursor-pointer" onClick={() => handleIncrease(product._id)} />
                  <FaChevronDown className="cursor-pointer" onClick={() => handleDecrease(product._id)} />
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <BsCart3 size={20} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => setWishListed(!wishListed)}
                className="p-3 border rounded-lg hover:bg-red-50 hover:border-red-200 transition"
              >
                {wishListed ? (
                  <FaHeart className="text-red-500" size={20} />
                ) : (
                  <IoMdHeartEmpty size={20} />
                )}
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <FaShare size={20} />
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-10"
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => {
                          window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                      >
                        Share on WhatsApp
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
            >
              Buy Now
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I'm interested in ${product.name}`)}`)}
              className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-600 hover:text-white font-bold"
            >
              <FaWhatsapp size={22} />
              Order On WhatsApp
            </button>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="text-xl">
              Brand: <span className="font-bold">{product.brand}</span>
            </div>
            <div className="text-xl">
              Availability:{" "}
              <span className={`font-bold ${product.available ? "text-green-600" : "text-red-600"}`}>
                {product.available ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            {product.sku && (
              <div className="text-xl">
                SKU: <span className="font-bold">{product.sku}</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Product Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <TabComponent product={product} />
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={relatedProduct.imageUrl}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{relatedProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-red-600 font-bold">₹{relatedProduct.price.toLocaleString()}</span>
                    {relatedProduct.actualPrice && (
                      <span className="text-gray-500 line-through text-sm">
                        ₹{relatedProduct.actualPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default DetailsPage;
