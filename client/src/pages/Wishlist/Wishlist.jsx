import React, { useEffect, useState } from "react";
import { useWishlist } from "../Wishlist/WishlistContext";
import { useAuth } from "../../Context/authContext";
import { useCart } from "../cart/cartContext";
import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const { dispatch: cartDispatch, cart } = useCart();

  const handleAddToCart = (product) => {
    try {
      cartDispatch({ type: "ADD_TO_CART", payload: product });
      setCartItems((prev) => ({
        ...prev,
        [product._id]: 1,
      }));
      
      // Set notification message for cart
      // setNotificationMessage(`"${product.name}" has been added to your cart.`);
      
      // // Show local notification
      // setShowNotification(true);
      // setTimeout(() => setShowNotification(false), 3000);
      
      // Create system notification
      // const notificationPayload = {
      //   notification: {
      //     title: "Item Added to Cart",
      //     body: `${product.name} has been added to your cart.`
      //   },
      //   data: {
      //     type: "cart_update",
      //     url: "/cart",
      //     productId: product._id,
      //     orderId: Date.now().toString()
      //   }
      // };
      
      // handleNewNotification(notificationPayload);
      handleRemoveFromWishlist(product._id)
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart");
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Product removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove product from wishlist");
    }
  };

  const filteredWishlist = wishlist.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-26">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in your wishlist
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 "
        >
          <FaHeart className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Save items that you like in your wishlist. Review them anytime and easily move them to the cart.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWishlist.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative group">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    Rs.{product.price}
                  </span>
                  <div
                    // to={`/product/${product._id}`}
                    onClick={()=>handleAddToCart(product)}

                    className="inline-flex cursor-pointer items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredWishlist.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No items found matching your search. Try different keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
