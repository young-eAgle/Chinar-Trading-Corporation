import React, { useState, useEffect, memo } from "react";
import { useCart } from "./cartContext";
import {
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaHeart,
  FaShoppingBag,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../Wishlist/WishlistContext";
import { toast } from "react-hot-toast";

// Loading skeleton for cart items
const CartItemSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// Cart item component
const CartItem = memo(({ item, onRemove, onUpdateQuantity, onMoveToWishlist }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item._id);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b hover:bg-gray-50 transition-colors"
    >
      <td className="p-4">
        <div className="flex items-center space-x-4">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={item.imageUrl}
            className="w-16 h-16 rounded-md object-cover border"
            alt={item.name}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.brand}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-center">
        <span className="font-medium">Rs.{item.price.toLocaleString()}</span>
      </td>
      <td className="p-4">
        <div className="quantity flex gap-3 items-center justify-center border border-blue-300 px-4 py-2 rounded">
          <input
            type="number"
            min="1"
            value={item.quantity ?? 1}
            className="outline-none w-12 text-center counter-btn"
            onChange={(e) => {
              const newValue = Math.max(Number(e.target.value), 1);
              onUpdateQuantity(item._id, newValue);
            }}
          />
          <div className="flex flex-col gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item._id, (item.quantity ?? 1) + 1)}
              className="cursor-pointer text-blue-700"
            >
              <FaChevronUp size={12} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if ((item.quantity ?? 1) > 1) {
                  onUpdateQuantity(item._id, (item.quantity ?? 1) - 1);
                }
              }}
              className="cursor-pointer text-blue-700"
            >
              <FaChevronDown size={12} />
            </motion.button>
          </div>
        </div>
      </td>
      <td className="p-4 text-center">
        <span className="font-semibold text-green-600">
          Rs.{(parseFloat(item.price.toString().replace(/,/g, "")) * (item.quantity ?? 1)).toLocaleString()}
        </span>
      </td>
      <td className="p-4">
        <div className="flex justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
          >
            <FaTrash size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMoveToWishlist(item)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            <FaHeart size={18} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
});

CartItem.displayName = 'CartItem';

const Cart = () => {
  const { cart, dispatch } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRemoveFromCart = async (id) => {
    try {
      dispatch({ type: "REMOVE_FROM_CART", payload: id });
    } catch (err) {
      setError("Failed to remove item from cart");
      console.error("Error removing item:", err);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch({ type: "CLEAR_CART" });
      toast.success('Cart cleared successfully');
    }
  };

  const updateQuantity = (_id, quantity) => {
    try {
      dispatch({ type: "UPDATE_QUANTITY", payload: { _id, quantity } });
    } catch (err) {
      setError("Failed to update quantity");
      console.error("Error updating quantity:", err);
    }
  };

  const handleMoveToWishlist = (item) => {
    try {
      addToWishlist(item);
      handleRemoveFromCart(item._id);
      toast.success('Item moved to wishlist');
    } catch (err) {
      toast.error('Failed to move item to wishlist');
      console.error("Error moving to wishlist:", err);
    }
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = parseFloat(item.price.toString().replace(/,/g, "")) || 0;
    const quantity = item.quantity ?? 1;
    return acc + price * quantity;
  }, 0);

  const shipping = 3000;
  const total = subtotal + shipping;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 mt-30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                {cart.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearCart}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
                  >
                    <FaTrash />
                    Clear Cart
                  </motion.button>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <CartItemSkeleton />
                  <CartItemSkeleton />
                  <CartItemSkeleton />
                  <CartItemSkeleton />
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingBag className="text-gray-400 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left">Product</th>
                        <th className="p-4 text-center">Price</th>
                        <th className="p-4 text-center">Quantity</th>
                        <th className="p-4 text-center">Subtotal</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {cart.map((item) => (
                          <CartItem
                            key={item._id}
                            item={item}
                            onRemove={handleRemoveFromCart}
                            onUpdateQuantity={updateQuantity}
                            onMoveToWishlist={handleMoveToWishlist}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs.{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "3000" : `${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold text-green-600">
                      Rs.{total.toLocaleString() }
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/checkout")}
                disabled={cart.length === 0}
                className="w-full bg-green-500 text-white py-3 rounded-lg mt-6 flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <FaArrowRight />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;







