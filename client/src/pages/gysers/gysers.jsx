import React, { useEffect, useState, useRef, memo, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowsFullscreen } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { useCart } from "../cart/cartContext";
import { useWishlist } from "../Wishlist/WishlistContext";
import { useNotification } from "../../features/notifications/context/NotificationContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Dialog, Transition } from "@headlessui/react";


const SimpleModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>
            
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{product.name}</h3>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold">{product.name}</h2>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-2xl font-bold">₨{product.price.toLocaleString()}</span>
                    {product.discount > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₨{product.actualPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Link
                    //  to=`/products/${category_id}`
                    to={`/products/${product._id}`}
                    >
                    <button
                      type="button"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      onClick={onClose}
                    >
                      View Details
                    </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// // Loading skeleton for product card
// const ProductCardSkeleton = () => (
//   <div className="animate-pulse">
//     <div className="w-full max-w-[260px] h-[380px] bg-gray-200 rounded-lg"></div>
//     <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
//     <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
//   </div>
// );

// Loading skeleton for product card
const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full max-w-[260px] h-[380px] bg-gray-200 rounded-lg"></div>
    <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  if (hasError) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error?.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return children;
};

// Memoized ProductCard component
const ProductCard = memo(({ product, openModal, isActive, onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const { dispatch, cart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { handleNewNotification } = useNotification();
  const [showLocalNotification, setShowLocalNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const isInWishlist = wishlist?.some(item => item._id === product._id);
  
  // Get the parent component's notification state setter
  const [_, setParentShowNotification] = useState(false);
  const [__, setParentNotificationMessage] = useState('');
  
  // Access the parent component's notification state
  const setGlobalNotification = (message) => {
    // Set local notification
    setNotificationMessage(message);
    setShowLocalNotification(true);
    setTimeout(() => setShowLocalNotification(false), 3000);
    
    // Try to set parent notification if available
    try {
      if (typeof window.setGlobalNotificationMessage === 'function') {
        window.setGlobalNotificationMessage(message);
      }
      if (typeof window.setGlobalShowNotification === 'function') {
        window.setGlobalShowNotification(true);
        setTimeout(() => window.setGlobalShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error setting global notification:', error);
    }
  };

  useEffect(() => {
    if (product && product._id) {
      const itemInCart = cart.find((item) => item._id === product._id);
      if (itemInCart) {
        setCartItems((prev) => ({
          ...prev,
          [product._id]: itemInCart.quantity,
        }));
      }
    }
  }, [cart, product]);

  const handleAddToCart = () => {
    try {
      dispatch({ type: "ADD_TO_CART", payload: product });
      setCartItems((prev) => ({
        ...prev,
        [product._id]: 1,
      }));
      
      // Set notification message
      const message = `"${product.name}" has been added to your cart.`;
      setGlobalNotification(message);
      
      // Create system notification
      const notificationPayload = {
        notification: {
          title: "Item Added to Cart",
          body: `${product.name} has been added to your cart.`
        },
        data: {
          type: "cart_update",
          url: "/cart",
          productId: product._id,
          orderId: Date.now().toString()
        }
      };
      
      handleNewNotification(notificationPayload);
      
      // Keep the toast for immediate visual feedback
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Added to Cart
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {product.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <Link
              to="/cart"
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              View Cart
            </Link>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleIncrease = (id) => {
    try {
      const existingItem = cartItems[id] || 0;
      const newQuantity = existingItem + 1;
      
      setCartItems((prev) => ({
        ...prev,
        [id]: newQuantity,
      }));
      
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { _id: id, quantity: newQuantity },
      });
      
      // Set notification message
      const message = `Quantity of "${product.name}" increased to ${newQuantity}.`;
      setGlobalNotification(message);
      
      // Create system notification for quantity update
      const notificationPayload = {
        notification: {
          title: "Cart Updated",
          body: `Quantity of ${product.name} increased to ${newQuantity}.`
        },
        data: {
          type: "cart_update",
          url: "/cart",
          productId: id,
          orderId: Date.now().toString()
        }
      };
      
      handleNewNotification(notificationPayload);
      toast.success('Quantity increased');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleDecrease = (id) => {
    try {
      const existingItem = cartItems[id];
      if (existingItem) {
        if (existingItem > 1) {
          const newQuantity = existingItem - 1;
          
          setCartItems((prev) => ({
            ...prev,
            [id]: newQuantity,
          }));
          
          dispatch({
            type: "UPDATE_QUANTITY",
            payload: { _id: id, quantity: newQuantity },
          });
          
          // Set notification message
          const message = `Quantity of "${product.name}" decreased to ${newQuantity}.`;
          setGlobalNotification(message);
          
          // Create system notification for quantity update
          const notificationPayload = {
            notification: {
              title: "Cart Updated",
              body: `Quantity of ${product.name} decreased to ${newQuantity}.`
            },
            data: {
              type: "cart_update",
              url: "/cart",
              productId: id,
              orderId: Date.now().toString()
            }
          };
          
          handleNewNotification(notificationPayload);
          toast.success('Quantity decreased');
        } else {
          setCartItems((prev) => {
            const updatedCart = { ...prev };
            delete updatedCart[id];
            return updatedCart;
          });
          
          dispatch({ type: "REMOVE_FROM_CART", payload: id });
          
          // Set notification message
          const message = `"${product.name}" has been removed from your cart.`;
          setGlobalNotification(message);
          
          // Create system notification for item removal
          const notificationPayload = {
            notification: {
              title: "Item Removed",
              body: `${product.name} has been removed from your cart.`
            },
            data: {
              type: "cart_update",
              url: "/cart",
              productId: id,
              orderId: Date.now().toString()
            }
          };
          
          handleNewNotification(notificationPayload);
          toast.success('Removed from cart');
        }
      }
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleWishList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let notificationPayload;
      
      if (isInWishlist) {
        removeFromWishlist(product._id);
        
        // Set notification message
        const message = `"${product.name}" has been removed from your wishlist.`;
        setGlobalNotification(message);
        
        // Create system notification for wishlist removal
        notificationPayload = {
          notification: {
            title: "Item Removed from Wishlist",
            body: `${product.name} has been removed from your wishlist.`
          },
          data: {
            type: "wishlist_update",
            url: "/wishlist",
            productId: product._id,
            orderId: Date.now().toString()
          }
        };
        
        toast.success('Removed from wishlist');
      } else {
        addToWishlist(product);
        
        // Set notification message
        const message = `"${product.name}" has been added to your wishlist.`;
        setGlobalNotification(message);
        
        // Create system notification for wishlist addition
        notificationPayload = {
          notification: {
            title: "Item Added to Wishlist",
            body: `${product.name} has been added to your wishlist.`
          },
          data: {
            type: "wishlist_update",
            url: "/wishlist",
            productId: product._id,
            orderId: Date.now().toString()
          }
        };
        
        toast.success('Added to wishlist');
      }
      
      // Send system notification
      handleNewNotification(notificationPayload);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const calculateAdjustedProduct = (product) => {
    let updatedProduct = { ...product };
    if (!updatedProduct.discount || updatedProduct.discount === 0) {
      updatedProduct.discount = 5;
      updatedProduct.actualPrice = Math.round(updatedProduct.price * 1.05);
    }
    return updatedProduct;
  };

  const adjustedProduct = calculateAdjustedProduct(product);

  const handleQuickView = (e) => {
    try {
      if (!e || !e.preventDefault) {
        console.error('Invalid event object:', e);
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof openModal !== 'function') {
        console.error('openModal is not a function', openModal);
        return;
      }
      
      // Ensure we have a valid product before attempting to open modal
      if (!product || typeof product !== 'object') {
        console.error('Invalid product object:', product);
        return;
      }
      
      const productToShow = calculateAdjustedProduct(product);
      console.log('Opening modal with product:', productToShow);
      openModal(productToShow);
    } catch (error) {
      console.error('Error in handleQuickView:', error);
      toast.error('Failed to open quick view');
    }
  };

  // const handleQuickView = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   openModal(adjustedProduct);
  // };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center justify-center"
      >
        <div
          className={`card pointer-events-auto  relative w-full max-w-[260px] sm:max-w-[280px] lg:max-w-[300px] 
                      border border-gray-300 bg-gray-100 hover:bg-white active:bg-white rounded-lg 
                      shadow-md transition-all duration-300 flex-shrink-0 hover:shadow-lg 
                      group hover:z-50 overflow-hidden 
                      h-[380px] sm:h-[340px] lg:h-[340px] 
                      ${isHovered || isActive ? "h-[320px] sm:h-[360px] lg:h-[400px]" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onClick={() => onActivate(null)}
        >
          {/* Discount Badge */}
          {adjustedProduct.discount && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white rounded-md"
            >
              {adjustedProduct.discount}% OFF
            </motion.div>
          )}

          {/* Floating Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            className="absolute right-0 xl:right-[5px] top-3 flex flex-col gap-2 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-black rounded-full cursor-pointer hover:bg-blue-500 hover:text-white text-xl"
            >
              <BsArrowsFullscreen />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishList}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-black rounded-full cursor-pointer hover:bg-red-500 hover:text-white text-xl"
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500 hover:text-white transition-colors" />
              ) : (
                <CiHeart className="hover:text-white transition-colors" />
              )}
            </motion.button>
          </motion.div>

          {/* Product Image */}
          <Link className="" to={`/products/${adjustedProduct._id}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex justify-center my-4"
            >
              <img
                src={adjustedProduct.imageUrl || "fallback-image-url.png"}
                alt={adjustedProduct.name}
                className="w-36 h-36 object-contain cursor-pointer rounded transition-transform duration-300 
                hover:scale-105 bg-gray-100"
                onError={(e) => (e.target.src = "fallback-image-url.png")}
                loading="lazy"
              />
            </motion.div>
          </Link>

          {/* Brand */}
          <div className="text-gray-400 text-sm text-center my-1">
            <h4>{adjustedProduct.brand}</h4>
          </div>

          {/* Product Name */}
          <Link to={`/products/${adjustedProduct._id}`}>
            <div className="text-center px-4 my-3 flex justify-center items-center text-wrap text-gray-700 group-active:text-black group-hover:text-black">
              <h3 className="text-lg font-medium">{adjustedProduct.name}</h3>
            </div>
          </Link>

          {/* Pricing */}
          <div className="flex gap-3 justify-center items-center my-3">
            <h4 className="line-through text-gray-400 text-sm">
              Rs.{adjustedProduct.actualPrice.toLocaleString()}
            </h4>
            <h2 className="text-green-600 group-hover:text-blue-600 font-semibold">
              Rs.{adjustedProduct.price.toLocaleString()}
            </h2>
          </div>

          {/* Add to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-2 left-0 w-full text-center"
          >
            {cartItems[adjustedProduct._id] ? (
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDecrease(adjustedProduct._id)}
                  className="px-4 py-2 bg-gray-200 rounded-l-full cursor-pointer hover:bg-gray-300"
                >
                  -
                </motion.button>
                <span className="px-4 font-medium">{cartItems[adjustedProduct._id]}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleIncrease(adjustedProduct._id)}
                  className="px-4 py-2 bg-yellow-400 rounded-r-full cursor-pointer hover:bg-yellow-500"
                >
                  +
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white 
                        px-12 py-2 rounded-full text-sm transition hover:bg-blue-700"
              >
                Add to Cart
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Notification */}
      <AnimatePresence>
        {showLocalNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <p className="mb-2">{notificationMessage}</p>
            {notificationMessage.includes("cart") && (
              <Link to="/cart" className="underline hover:text-white transition-colors">
                View cart
              </Link>
            )}
            {notificationMessage.includes("wishlist") && (
              <Link to="/wishlist" className="underline hover:text-white transition-colors">
                View wishlist
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

// Main Gyser component
const Gyser = ({ title, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [activeProduct, setActiveProduct] = useState(null);
  const { handleNewNotification } = useNotification();

  // Expose notification setters to window for child components
  useEffect(() => {
    window.setGlobalNotificationMessage = (message) => {
      setNotificationMessage(message);
    };
    
    window.setGlobalShowNotification = (show) => {
      setShowNotification(show);
    };
    
    return () => {
      // Clean up
      delete window.setGlobalNotificationMessage;
      delete window.setGlobalShowNotification;
    };
  }, []);

  const openModal = (product) => {
    try {
      console.log("Opening modal with product:", product);
      
      if (!product) {
        console.error("Cannot open modal: product is undefined");
        return;
      }
      
      setSelectedProduct(product);
      setIsModalOpen(true);
      setActiveCard(null);
    } catch (error) {
      console.error("Error in openModal:", error);
      toast.error("Failed to open product details");
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/products/category/${categoryId}`);
        setProducts(response.data);
      } catch (error) {
        setError(error.message);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to load products</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-extrabold text-gray-800 uppercase tracking-wider">
            {title}
          </h1>
          <div className="h-[2px] w-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-500 my-4"></div>
        </motion.div>

        <div className="w-full container mx-auto px-14 py-5">
          <div className="relative min-h-[400px]">
            {/* Navigation Arrows - Fixed Distance Positioning */}
            <div className="absolute inset-0 pointer-events-none">
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="pointer-events-auto absolute left-[-40px] md:left-[-40px] top-[180px] z-10 
                  bg-gray-800 text-white p-3 rounded-full shadow-lg opacity-80 hover:opacity-100 
                  transition-all duration-300 hover:scale-110"
                aria-label="Previous slide"
              >
                <MdArrowBack size={24} />
              </button>

              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="pointer-events-auto absolute right-[-40px] md:right-[-40px] top-[180px] z-10 
                  bg-gray-800 text-white p-3 rounded-full shadow-lg opacity-80 hover:opacity-100 
                  transition-all duration-300 hover:scale-110"
                aria-label="Next slide"
              >
                <MdArrowForward size={24} />
              </button>
            </div>

            {/* Products Slider */}
            <div id="slider" className="overflow-hidden">
              <Slider ref={sliderRef} {...settings}>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                    {[...Array(4)].map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  products.map((product) => {
                    const isInWishlist = wishlist?.some(item => item._id === product._id);
                    
                    return (
                      <div key={product._id} className="relative">
                        {/* Wishlist Button */}
                        {/* <div className="whishlist-quickview-container absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100 z-20">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleWishList(e, product)}
                            className="wish-list hover:bg-red-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
                            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            {isInWishlist ? (
                              <FaHeart className="text-red-500" size={16} />
                            ) : (
                              <CiHeart size={18} className="text-gray-700" />
                            )}
                          </motion.button>
                        </div> */}

                        <div className="w-full px-4  py-5">
                          <ProductCard
                            product={product}
                            openModal={openModal}
                            isActive={activeCard === product._id}
                            onActivate={(id) => setActiveCard(id)}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </Slider>
            </div>
          </div>
        </div>

        {/* Modal rendering - cleaned up */}
        {selectedProduct && isModalOpen && (
          <SimpleModal
              key={selectedProduct._id || "modal"}
            isOpen={isModalOpen}
            onClose={closeModal}
            product={selectedProduct}
          />
        )}
        
        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
            >
              <p className="mb-2">{notificationMessage}</p>
              {notificationMessage.includes("cart") && (
                <Link to="/cart" className="underline hover:text-white transition-colors">
                  View cart
                </Link>
              )}
              {notificationMessage.includes("wishlist") && (
                <Link to="/wishlist" className="underline hover:text-white transition-colors">
                  View wishlist
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default Gyser;

