import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../cart/cartContext';
import { useNotification } from '../../features/notifications/context/NotificationContext';

const SpecialOffers = () => {
  const { dispatch: cartDispatch, cart } = useCart();
  const { handleNewNotification } = useNotification();
  const [cartItems, setCartItems] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const { data: specialOffers, isLoading, error } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const response = await axios.get('http://46.202.166.65/api/home/special-offers');
      return response.data;
    }
  });
  
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
      <Link to="/cart" className="underline hover:text-white transition-colors">
        View cart
      </Link>
    </motion.div>
  );
  
  const handleAddToCart = (offer) => {
    try {
      // Create a product object from the offer
      const product = {
        _id: offer._id,
        name: offer.name,
        price: offer.discountedPrice,
        actualPrice: offer.actualPrice,
        imageUrl: offer.imageUrl,
        discount: offer.discount,
        quantity: 1
      };
      
      cartDispatch({ type: "ADD_TO_CART", payload: product });
      setCartItems((prev) => ({
        ...prev,
        [offer._id]: 1,
      }));
      
      // Set notification message and show it
      setNotificationMessage(`"${offer.name}" has been added to your cart.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Create system notification
      const notificationPayload = {
        notification: {
          title: "Special Offer Added to Cart",
          body: `${offer.name} has been added to your cart.`
        },
        data: {
          type: "cart_update",
          url: "/cart",
          productId: offer._id,
          orderId: Date.now().toString()
        }
      };
      
      handleNewNotification(notificationPayload);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load special offers. Please try again later.
      </div>
    );
  }

  if (!specialOffers?.length) {
    return null;
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            <span className="text-blue-600">Special</span> Offers
          </h2>
          <p className="mt-2 text-gray-600">
            Limited time deals with exclusive discounts. Grab them before they're gone!
          </p>
        </div>

        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialOffers.map((offer) => (
            <div key={offer._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <Link to={`/product/${offer._id}`} className="block">
                <div className="relative">
                  <img
                    src={offer.imageUrl}
                    alt={offer.name}
                    className="w-full h-48 object-contain p-4"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md">
                    {offer.discount}% OFF
                  </div>
                </div>
              </Link>
              
              <div className="p-4 border-t border-gray-100">
                <Link to={`/product/${offer._id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {offer.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-500 line-through text-sm">
                      Rs.{offer.actualPrice.toLocaleString()}
                    </span>
                    <div className="text-xl font-bold text-red-600">
                      Rs.{Math.round(offer.discountedPrice).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(offer)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
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

export default SpecialOffers; 