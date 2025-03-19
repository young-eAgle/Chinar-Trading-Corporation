import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { FaHeart } from 'react-icons/fa';
import { CiHeart } from 'react-icons/ci';
import { Link } from 'react-router-dom';

const WishlistContext = createContext();

// Wishlist reducer to handle state updates
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_WISHLIST':
      return action.payload;
    case 'ADD_TO_WISHLIST':
      const newState = [...state, action.payload];
      localStorage.setItem('wishlistItems', JSON.stringify(newState));
      return newState;
    case 'REMOVE_FROM_WISHLIST':
      const updatedState = state.filter(item => item._id !== action.payload);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedState));
      return updatedState;
    case 'CLEAR_WISHLIST':
      localStorage.removeItem('wishlistItems');
      return [];
    default:
      return state;
  }
};

const ToastNotification = ({ type, product }) => (
  <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
    <div className="flex-1 w-0 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 pt-0.5">
          {type === 'add' ? (
            <FaHeart className="h-10 w-10 text-red-500" />
          ) : (
            <CiHeart className="h-10 w-10 text-gray-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {type === 'add' ? 'Added to Wishlist' : 'Removed from Wishlist'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {product.name}
          </p>
        </div>
      </div>
    </div>
    {type === 'add' && (
      <div className="flex border-l border-gray-200">
        <Link
          to="/wishlist"
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          View Wishlist
        </Link>
      </div>
    )}
  </div>
);

export const WishlistProvider = ({ children }) => {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [], () => {
    try {
      const savedWishlist = localStorage.getItem('wishlistItems');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  });

  // Initialize wishlist from localStorage on mount
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlistItems');
        if (savedWishlist) {
          dispatch({ type: 'INIT_WISHLIST', payload: JSON.parse(savedWishlist) });
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };

    loadWishlist();

    // Listen for storage events from other tabs
    window.addEventListener('storage', loadWishlist);
    return () => window.removeEventListener('storage', loadWishlist);
  }, []);

  const addToWishlist = (product) => {
    try {
      if (!wishlist.some(item => item._id === product._id)) {
        dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
        toast.custom(
          (t) => <ToastNotification type="add" product={product} />,
          { duration: 3000, position: 'bottom-right' }
        );
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = (productId) => {
    try {
      const product = wishlist.find(item => item._id === productId);
      if (product) {
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
        toast.custom(
          (t) => <ToastNotification type="remove" product={product} />,
          { duration: 3000, position: 'bottom-right' }
        );
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = () => {
    try {
      dispatch({ type: 'CLEAR_WISHLIST' });
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider 
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
