import React, { useState, useEffect, memo } from "react";
import { FaChevronDown, FaChevronUp, FaHeart, FaWhatsapp, FaShoppingCart, FaBolt } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { Rating } from "@mui/material";
import { useCart } from "../cart Page/cartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../Wishlist/WishlistContext";
import { toast } from "react-hot-toast";

// Loading skeleton for product details
const ProductSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="bg-gray-200 h-64 rounded-lg"></div>
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Notification component
const Notification = memo(({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white z-50`}
  >
    {message}
  </motion.div>
));

Notification.displayName = 'Notification';

// Quantity controls component
const QuantityControls = memo(({ value, onIncrease, onDecrease, onChange }) => (
  <div className="quantity flex gap-3 items-center border border-blue-300 px-4 py-2 rounded">
    <input
      type="number"
      value={value}
      className="outline-none w-12 text-center counter-btn"
      onChange={(e) => {
        const newValue = Math.max(Number(e.target.value), 1);
        onChange(newValue);
      }}
      min="1"
    />
    <div className="flex flex-col gap-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        className="cursor-pointer text-blue-700"
      >
        <FaChevronUp size={12} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        className="cursor-pointer text-blue-700"
      >
        <FaChevronDown size={12} />
      </motion.button>
    </div>
  </div>
));

QuantityControls.displayName = 'QuantityControls';

// Product images gallery component
const ProductGallery = memo(({ images, currentImage, onImageSelect }) => (
  <div className="space-y-4">
    <div className="relative aspect-square rounded-lg overflow-hidden">
      <img
        src={currentImage}
        alt="Product"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {images.map((image, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onImageSelect(image)}
          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
            currentImage === image ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <img
            src={image}
            alt={`Product view ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.button>
      ))}
    </div>
  </div>
));

ProductGallery.displayName = 'ProductGallery';

const ProductPreviewModal = memo(({ isOpen, onClose, product }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch, cart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();

  useEffect(() => {
    if (product) {
      setIsLoading(true);
      try {
        setCurrentImage(product.imageUrl);
        const itemInCart = cart.find((item) => item._id === product._id);
        if (itemInCart) {
          setCartItems((prev) => ({
            ...prev,
            [product._id]: itemInCart.quantity,
          }));
        }
      } catch (err) {
        setError("Failed to load product details");
        console.error("Error loading product:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [cart, product]);

  const handleAddToCart = () => {
    try {
      const quantity = cartItems[product._id] ?? 1;
      dispatch({ 
        type: "ADD_TO_CART", 
        payload: { ...product, quantity } 
      });
      setCartItems((prev) => ({
        ...prev,
        [product._id]: quantity, 
      }));
      onClose();
      toast.success('Added to cart successfully!');
    } catch (err) {
      toast.error('Failed to add to cart');
      console.error("Error adding to cart:", err);
    }
  };

  const handleIncrease = (id) => {
    setCartItems((prev) => {
      const updatedQuantity = (prev[id] || 1) + 1;
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { _id: id, quantity: updatedQuantity },
      });
      return { ...prev, [id]: updatedQuantity };
    });
  };

  const handleDecrease = (id) => {
    setCartItems((prev) => {
      const updatedQuantity = Math.max((prev[id] || 1) - 1, 1);
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { _id: id, quantity: updatedQuantity },
      });
      return { ...prev, [id]: updatedQuantity };
    });
  };

  const handleQuantityChange = (newQuantity) => {
    setCartItems((prev) => ({
      ...prev,
      [product._id]: newQuantity,
    }));
  };

  const handleWishlistToggle = () => {
    if (wishlist.some(item => item._id === product._id)) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  if (!product) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="absolute right-4 top-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✖
                </motion.button>
              </div>

              {isLoading ? (
                <ProductSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Product Images */}
                  <div className="w-full md:w-1/2">
                    <ProductGallery
                      images={[product.imageUrl, ...(product.additionalImages || [])]}
                      currentImage={currentImage}
                      onImageSelect={setCurrentImage}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleWishlistToggle}
                        className={`p-2 rounded-full ${
                          wishlist.some(item => item._id === product._id)
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      >
                        <FaHeart size={24} />
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Rating
                        precision={0.5}
                        value={product.rating || 4}
                        readOnly
                        size="small"
                      />
                      <span className="text-gray-500 text-sm">
                        ({product.reviews || 0} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-red-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.actualPrice && (
                        <span className="text-gray-500 line-through">
                          ₹{product.actualPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600">{product.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Brand:</span> {product.brand}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Availability:</span>{" "}
                        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <QuantityControls
                        value={cartItems[product._id] ?? 1}
                        onIncrease={() => handleIncrease(product._id)}
                        onDecrease={() => handleDecrease(product._id)}
                        onChange={handleQuantityChange}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart />
                        Add to Cart
                      </motion.button>
                    </div>

                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-green-600 text-white w-full py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <FaBolt />
                        Buy Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="border border-green-600 text-green-600 w-full py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <FaWhatsapp />
                        Order on WhatsApp
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>

      <AnimatePresence>
        {showNotification && (
          <Notification
            message="Added to cart successfully!"
            type="success"
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>
    </Transition>
  );
});

ProductPreviewModal.displayName = 'ProductPreviewModal';

export default ProductPreviewModal;
