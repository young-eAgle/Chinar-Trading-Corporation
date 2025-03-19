import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../cart/cartContext';
import { useNotification } from '../../features/notifications/context/NotificationContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const FeaturedProducts = () => {
  const { dispatch: cartDispatch, cart } = useCart();
  const { handleNewNotification } = useNotification();
  const [cartItems, setCartItems] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [error, setError] = useState(null);
  
  const { data: products, isLoading, error: queryError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/home/featured');
      console.log('Featured products from API:', response.data);
      console.log('Number of featured products:', response.data.length);
      return response.data;
    },
  });

  // Log products whenever they change
  useEffect(() => {
    if (products) {
      console.log('Products in state:', products);
      console.log('Number of products in state:', products.length);
    }
  }, [products]);

  // Load cart items
  useEffect(() => {
    if (cart && cart.length > 0) {
      const cartMap = {};
      cart.forEach(item => {
        cartMap[item._id] = item.quantity;
      });
      setCartItems(cartMap);
    }
  }, [cart]);
  
// Notification component
const Notification = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
  >
    <p className="mb-2">{message}</p>
    {message.includes("cart") && (
      <Link to="/cart" className="underline hover:text-white transition-colors">
        View cart
      </Link>
    )}
    {message.includes("wishlist") && (
      <Link to="/wishlist" className="underline hover:text-white transition-colors">
        View wishlist
      </Link>
    )}
  </motion.div>
);

  const handleAddToCart = (product) => {
    try {
      cartDispatch({ type: "ADD_TO_CART", payload: product });
      setCartItems((prev) => ({
        ...prev,
        [product._id]: 1,
      }));
      
      // Set notification message and show it
      setNotificationMessage(`"${product.name}" has been added to your cart.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
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
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart");
    }
  };

  const handleIncrease = (id, productName) => {
    try {
      const existingItem = cartItems[id] || 0;
      const newQuantity = existingItem + 1;
      
      setCartItems((prev) => ({
        ...prev,
        [id]: newQuantity,
      }));

      cartDispatch({
        type: "UPDATE_QUANTITY",
        payload: { _id: id, quantity: newQuantity },
      });
      
      // Set notification message and show it
      setNotificationMessage(`Quantity of "${productName}" increased to ${newQuantity}.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Create system notification
      const notificationPayload = {
        notification: {
          title: "Cart Updated",
          body: `Quantity of ${productName} increased to ${newQuantity}.`
        },
        data: {
          type: "cart_update",
          url: "/cart",
          productId: id,
          orderId: Date.now().toString()
        }
      };
      
      handleNewNotification(notificationPayload);
    } catch (error) {
      console.error("Error increasing quantity:", error);
      setError("Failed to update quantity");
    }
  };

  const handleDecrease = (id, productName) => {
    try {
      const existingItem = cartItems[id];
      if (existingItem) {
        if (existingItem > 1) {
          const newQuantity = existingItem - 1;
          
          setCartItems((prev) => ({
            ...prev,
            [id]: newQuantity,
          }));
          
          cartDispatch({
            type: "UPDATE_QUANTITY",
            payload: { _id: id, quantity: newQuantity },
          });
          
          // Set notification message and show it
          setNotificationMessage(`Quantity of "${productName}" decreased to ${newQuantity}.`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          
          // Create system notification
          const notificationPayload = {
            notification: {
              title: "Cart Updated",
              body: `Quantity of ${productName} decreased to ${newQuantity}.`
            },
            data: {
              type: "cart_update",
              url: "/cart",
              productId: id,
              orderId: Date.now().toString()
            }
          };
          
          handleNewNotification(notificationPayload);
        } else {
          setCartItems((prev) => {
            const updatedCart = { ...prev };
            delete updatedCart[id];
            return updatedCart;
          });
          
          cartDispatch({ type: "REMOVE_FROM_CART", payload: id });
          
          // Set notification message and show it
          setNotificationMessage(`"${productName}" has been removed from your cart.`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          
          // Create system notification
          const notificationPayload = {
            notification: {
              title: "Item Removed",
              body: `${productName} has been removed from your cart.`
            },
            data: {
              type: "cart_update",
              url: "/cart",
              productId: id,
              orderId: Date.now().toString()
            }
          };
          
          handleNewNotification(notificationPayload);
        }
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      setError("Failed to update quantity");
    }
  };

  // Quantity Controls component
  const QuantityControls = ({ product, quantity }) => (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            handleDecrease(product._id, product.name);
          }}
          className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
          aria-label="Decrease quantity"
        >
          -
        </motion.button>
        <span className="w-4 text-center font-medium text-gray-700 text-xs">{quantity}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            handleIncrease(product._id, product.name);
          }}
          className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
          aria-label="Increase quantity"
        >
          +
        </motion.button>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (queryError || error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg text-red-600">Error loading featured products</h3>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <div className="flex justify-between items-center mb-8">
      <div className="text-center mb-8 mx-auto">
          <h2 className="text-3xl font-bold">
            <span className="text-blue-600">Featured</span> Products
          </h2>
          {/* <p className="mt-2 text-gray-600">
            Limited time deals with exclusive discounts. Grab them before they're gone!
          </p> */}
        </div>
        <Link 
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {products?.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className=" rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/products/${product._id}`}>
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-contain bg-gray-50"
                />
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={12}
                        className={i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs text-gray-600">
                    ({product.reviewCount || 0})
                  </span>
                </div>
                <div className="flex items-center gap-5 justify-center">
                  <div>
                    <span className="text-sm font-bold text-blue-600">
                      Rs.{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="discount">
                  {product.discount > 0 && (
                      <span className="ml-1 text-xs text-gray-500 line-through">
                        Rs.{product.actualPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                </div>
                <div className=' flex justify-center mt-2'>
                <button
                      className="px-1 py-1 cursor-pointer w-full text-xs md:text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                {/* {cartItems[product._id] ? (
                    <QuantityControls 
                      product={product}
                      quantity={cartItems[product._id]}
                    />
                  ) : (
                    <button
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  )} */}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <Notification
            message={notificationMessage}
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedProducts; 