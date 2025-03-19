// ================= Befor making it responsive ==============================
import React, { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../pages/cart/cartContext";
import { useWishlist } from "../pages/Wishlist/WishlistContext";
import { useNotification } from "../features/notifications/context/NotificationContext";
import { BsArrowsFullscreen } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Simple Modal component (like in gysers.jsx)
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
                    <Link to={`/products/${product._id}`}>
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

// Loading component
const LoadingCard = () => (
  <div className="card border relative bg-gray-900 border-gray-300 rounded-lg shadow-md animate-pulse">
    <div className="h-40 bg-gray-700 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-2/3 mx-auto"></div>
    </div>
  </div>
);

// Notification component
const Notification = ({ message, productName, onClose }) => (
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

// Quantity Controls component
const QuantityControls = ({ quantity, onIncrease, onDecrease }) => (
  <div className="flex items-center justify-center w-full">
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Decrease quantity"
      >
        -
      </motion.button>
      <span className="w-8 text-center font-medium text-gray-700">{quantity}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        aria-label="Increase quantity"
      >
        +
      </motion.button>
    </div>
  </div>
);

// Quick Actions component
const QuickActions = ({ onQuickView, onWishlist, isWishlisted }) => (
  <div className="absolute right-2 top-2 flex flex-col gap-2 z-10">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView(e);
      }}
      className="quick-view bg-white shadow-md text-gray-700 flex justify-center items-center w-8 h-8 rounded-full cursor-pointer hover:bg-blue-500 hover:text-white transition-colors"
      aria-label="Quick view"
    >
      <BsArrowsFullscreen size={16} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onWishlist(e);
      }}
      className="wish-list bg-white shadow-md flex justify-center items-center w-8 h-8 rounded-full cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
      aria-label="Add to wishlist"
    >
      {isWishlisted ? (
        <FaHeart className="text-black hover:text-white" size={16} />
      ) : (
        <CiHeart size={18} className="text-gray-700" />
      )}
    </motion.button>
  </div>
);

const Card = memo(({ product }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [cartItems, setCartItems] = useState({});
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dispatch: cartDispatch, cart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { handleNewNotification } = useNotification();

  // Check if product is in wishlist
  const isInWishlist = wishlist?.some(item => item._id === product._id);

  // Load cart items
  useEffect(() => {
    if (product && product._id) {
      const itemInCart = cart.find((item) => item._id === product._id);
      if (itemInCart) {
        setCartItems((prev) => ({ ...prev, [product._id]: itemInCart.quantity }));
      }
    }
  }, [cart, product]);

  const handleAddToCart = () => {
    try {
      cartDispatch({ type: "ADD_TO_CART", payload: product });
      setCartItems((prev) => ({
        ...prev,
        [product._id]: 1,
      }));
      
      // Set notification message for cart
      setNotificationMessage(`"${product.name}" has been added to your cart.`);
      
      // Show local notification
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

  const handleIncrease = (id) => {
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
      
      // Set notification message for cart update
      setNotificationMessage(`Quantity of "${product.name}" increased to ${newQuantity}.`);
      
      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
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
    } catch (error) {
      console.error("Error increasing quantity:", error);
      setError("Failed to update quantity");
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
          
          cartDispatch({
            type: "UPDATE_QUANTITY",
            payload: { _id: id, quantity: newQuantity },
          });
          
          // Set notification message for cart update
          setNotificationMessage(`Quantity of "${product.name}" decreased to ${newQuantity}.`);
          
          // Show notification
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          
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
        } else {
          setCartItems((prev) => {
            const updatedCart = { ...prev };
            delete updatedCart[id];
            return updatedCart;
          });
          
          cartDispatch({ type: "REMOVE_FROM_CART", payload: id });
          
          // Set notification message for cart removal
          setNotificationMessage(`"${product.name}" has been removed from your cart.`);
          
          // Show notification
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          
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
        }
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      setError("Failed to update quantity");
    }
  };

  const handleWishList = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      let notificationPayload;
      
      if (isInWishlist) {
        removeFromWishlist(product._id);
        
        // Set notification message for wishlist removal
        setNotificationMessage(`"${product.name}" has been removed from your wishlist.`);
        
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
      } else {
        addToWishlist(product);
        
        // Set notification message for wishlist addition
        setNotificationMessage(`"${product.name}" has been added to your wishlist.`);
        
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
      }
      
      // Show local notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Send system notification
      handleNewNotification(notificationPayload);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError('Failed to update wishlist');
    }
  };

  const openModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return <div className="text-gray-500 text-center p-4">Product not found</div>;

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative bg-gray-900 border border-gray-300 hover:bg-white rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg group hover:z-50 overflow-hidden h-[420px] flex flex-col"
        >
          {/* Quick Actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openModal}
              className="quick-view bg-white shadow-md text-gray-700 flex justify-center items-center w-8 h-8 rounded-full cursor-pointer hover:bg-blue-500 hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <BsArrowsFullscreen size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishList}
              className="wish-list bg-white shadow-md flex justify-center items-center w-8 h-8 rounded-full cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500" size={16} />
              ) : (
                <CiHeart size={18} className="text-gray-700" />
              )}
            </motion.button>
          </div>

          {/* Product Link */}
          <Link 
            to={`/products/${product._id}`} 
            className="flex flex-col flex-grow"
            onClick={(e) => {
              if (e.target.closest('.quick-view') || e.target.closest('.wish-list')) {
                e.preventDefault();
              }
            }}
          >
            {/* Discount Badge */}
            {product.discount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute left-2 top-2 bg-blue-600 px-2 py-1 text-xs font-semibold text-white rounded-md"
              >
                {product.discount}% OFF
              </motion.div>
            )}

            {/* Product Image */}
            <div className="block flex-shrink-0">
              <div className="product-img flex justify-center items-center h-48 p-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col flex-grow p-4">
              {/* Company Name */}
              <div className="company_name text-gray-400 text-sm mb-1">
                <h4>{product.brand}</h4>
              </div>

              {/* Product Name */}
              <div className="product-name text-white group-hover:text-black flex-grow">
                <h3 className="text-base font-medium cursor-pointer hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>

              {/* Price Section */}
              <div className="mt-auto">
                <div className="price flex items-center gap-2 my-2">
                  <span className="text-green-500 font-semibold text-lg">
                    Rs.{product.price.toLocaleString()}
                  </span>
                  {product.actualPrice && product.actualPrice > product.price && (
                    <span className="text-gray-400 line-through text-sm">
                      Rs.{product.actualPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Add to Cart Section */}
          <div className="p-4 pt-0">
            <div className="add-cart">
              {cartItems[product._id] ? (
                <QuantityControls
                  quantity={cartItems[product._id]}
                  onIncrease={() => handleIncrease(product._id)}
                  onDecrease={() => handleDecrease(product._id)}
                />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SimpleModal 
          product={selectedProduct} 
          onClose={closeModal}
          isOpen={isModalOpen}
        />
      )}

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <Notification
            message={notificationMessage}
            productName={product.name}
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

Card.displayName = 'Card';

export default Card;

















// import React, { useState } from "react";
// import { useCart } from "../pages/cart Page/cartContext";
// import { BsArrowsFullscreen } from "react-icons/bs";
// import { CiHeart } from "react-icons/ci";
// import { FaHeart } from "react-icons/fa";

// const Card = ({ product }) => {
//   const [wishListed, setWishListed] = useState(false);
//   const [showNotification, setShowNotification] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const { dispatch } = useCart();

//   const handleAddToCart = () => {
//     dispatch({ type: "ADD_TO_CART", payload: product });

//     setCartItems((prev) => ({
//       ...prev,
//       [product.id]: 1, // Set initial quantity to 1
//     }));

//     setShowNotification(true);
//     setTimeout(() => {
//       setShowNotification(false);
//     }, 3000);
//   };

//   // Increase Quantity 

//   const handleIncrease = (id) => {
//     const existingItem = cartItems[id] || 0;
//     console.log("handle Increase existingItem:",existingItem);
//     setCartItems((prev) => ({
//       ...prev,
//       [id]: existingItem + 1,
//     }));
//     dispatch({ type: "UPDATE_QUANTITY", payload: { _id: id, quantity: existingItem + 1 },
//      });
//     console.log("handle Increase payload:",payload);
//   };

// // Decrease Quantity 
//   const handleDecrease = (id) => {
//     // Check if the product exists in the cart
//     const existingItem = cartItems[id];
//     console.log("handle Decrease existingItem:",existingItem);

//     if (existingItem) {
//       if (existingItem > 1) {
//         // If quantity > 1, decrease it
//         setCartItems((prev) => ({
//           ...prev,
//           [id]: prev[id] - 1,
//         }));
//         dispatch({ type: "UPDATE_QUANTITY", payload: { _id: id, quantity: existingItem - 1 }, });
//         console.log("handle Decrease payload:",payload);
//       } else {
//         // If quantity is 1, remove the product from the cart
//         setCartItems((prev) => {
//           const updatedCart = { ...prev };
//           delete updatedCart[id];
//           return updatedCart;
//         });
//         dispatch({ type: "REMOVE_FROM_CART", payload: id });
//         console.log("handle Decrease REMOVE_FROM_CART payload:",payload);
//       }
//     }
//   };




//   const handleWishList = () => {
//     setWishListed(!wishListed);
//     console.log("Wishlisted!");
//   };
//   if (!product) return <div>Loading product...</div>;
//   return (
//     <>
//     <div className="card border relative bg-gray-900 border-gray-300 hover:bg-white rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group hover:z-50 overflow-hidden ">
//       {/* Discount Badge */}
//       {product.discount && (
//         <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
//           {product.discount}%
//         </div>
//       )}

//       {/* Wishlist and Quick View */}
//       <div className="whishlist-quickview-container absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100">
//         <div className="quick-view hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
//           <BsArrowsFullscreen />
//         </div>
//         <div
//           onClick={handleWishList}
//           className="wish-list hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
//         >
//           {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
//         </div>
//       </div>

//       {/* Product Image */}
//       <div className="product-img flex justify-center my-4">
//         <img
//           src={product.imageUrl}
//           alt={product.name}
//           className="w-36 h-36 object-contain cursor-pointer"
//         />
//       </div>

//       {/* Company Name */}
//       <div className="company_name text-gray-400 text-sm text-center">
//         <h4>{product.brand}</h4>
//       </div>

//       {/* Product Name */}
//       <div className="product-name text-white group-hover:text-black text-center px-4">
//         <h3 className="text-lg font-medium cursor-pointer">{product.name}</h3>
//       </div>

//       {/* Price Section */}
//       <div className="price flex gap-3 justify-center items-center my-2">
//         {product.actualPrice && (
//           <h4 className="line-through text-gray-400 text-sm">
//             Rs {product.actualPrice}
//           </h4>
//         )}
//         <h2 className="text-red-600 font-semibold">Rs {product.price}</h2>
//       </div>

//       {/* Add to Cart / Quantity Selector */}
//       <div className="addToCart-Btn flex justify-center my-3">
//         {cartItems[product.id] ? (
//           <div className="flex items-center border-2 border-blue-600 text-blue-600 font-semibold rounded-3xl text-sm">
//             <button
//               onClick={() => handleDecrease(product.id)}
//               className="px-3 py-2 bg-gray-200 rounded-l-3xl"
//             >
//               -
//             </button>
//             <span className="px-4">{cartItems[product.id]}</span>
//             <button
//               onClick={() => handleIncrease(product.id)}
//               className="px-3 py-2 bg-yellow-400 rounded-r-3xl"
//             >
//               +
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={handleAddToCart}
//             className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-8 py-2 rounded-3xl text-sm transition hover:bg-blue-700"
//           >
//             Add to Cart
//           </button>
//         )}
//       </div>

    

//       {/* Add to Cart Button */}

//       {/* <div className="addToCart-Btn flex justify-center my-3">
//         <button onClick={handleAddToCart} className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-8 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
//           Add to Cart
//         </button>
//       </div> */}
//     </div>
   
//       {/* Notification Popup */}
//       {showNotification && (
//         <div className="fixed bottom-5 right-5 bg-green-500 text-white p-3 rounded-lg shadow-lg">
//           <p>"{product.name}" has been added to your cart.</p>
//           <a href="/cart" className="underline">
//             View cart
//           </a>
//         </div>
//       )}
//     </>
//   );
// };

// export default Card;

