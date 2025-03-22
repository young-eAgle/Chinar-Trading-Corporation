import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { useCart } from '../../pages/cart/cartContext';
import { useWishlist } from '../../pages/Wishlist/WishlistContext';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaShoppingCart, FaHeart, FaBox, FaHistory, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { AiFillDashboard } from 'react-icons/ai';
import { MdCategory, MdLocalOffer, MdHelp, MdContactSupport } from 'react-icons/md';
import { BiStore } from 'react-icons/bi';
import { BsFillBagCheckFill } from 'react-icons/bs';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const NavbarSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Home',
      icon: <BiStore />,
      path: '/',
      show: true
    },
    // {
    //   title: 'Categories',
    //   icon: <MdCategory />,
    //   path: '/categories',
    //   show: true
    // },
    {
      title: 'My Orders',
      icon: <FaHistory />,
      path: '/orders',
      show: !!user
    },
    {
      title: 'Wishlist',
      icon: <FaHeart />,
      path: '/wishlist',
      show: !!user,
      badge: wishlist.length
    },
    {
      title: 'Cart',
      icon: <FaShoppingCart />,
      path: '/cart',
      show: true,
      badge: cart.length
    },
    {
      title: 'Offers',
      icon: <MdLocalOffer />,
      path: '/offers',
      show: true
    },
    {
      title: 'Track Order',
      icon: <BsFillBagCheckFill />,
      path: '/track-order',
      show: !!user
    },
    {
      title: 'Help & Support',
      icon: <MdHelp />,
      path: '/help',
      show: true
    },
    {
      title: 'Contact Us',
      icon: <MdContactSupport />,
      path: '/contact',
      show: true
    },
    {
      title: 'Settings',
      icon: <FaCog />,
      path: '/settings',
      show: !!user
    },
    {
      title: 'Admin Dashboard',
      icon: <AiFillDashboard />,
      path: '/admin-order',
      show: role === 'admin'
    }
  ];

  const userMenuItems = [
    {
      title: 'Profile',
      icon: <FaUser />,
      path: '/profile',
      show: !!user
    },
    {
      title: 'My Orders',
      icon: <FaBox />,
      path: '/orders',
      show: !!user
    },
    {
      title: 'Logout',
      icon: <FaSignOutAlt />,
      onClick: handleLogout,
      show: !!user
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* User Section */}
            {user ? (
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/signup');
                  }}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login / Sign Up
                </button>
              </div>
            )}

            {/* Main Menu */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Menu</h3>
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  item.show && (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                      onClick={() => {
                        onClose();
                        navigate(item.path);
                      }}
                    >
                      <span className="text-gray-600">{item.icon}</span>
                      <span className="flex-1 text-gray-700">{item.title}</span>
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.li>
                  )
                ))}
              </ul>
            </div>

            {/* Categories Section */}
            <div className="p-4 border-t">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Categories</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <motion.li
                      key={category._id}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                      onClick={() => {
                        onClose();
                        navigate(`/products/category/${category._id}`);
                      }}
                    >
                      <span className="text-gray-600">{category.icon || <MdCategory />}</span>
                      <span className="text-gray-700">{category.name}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* User Menu */}
            {user && (
              <div className="p-4 border-t">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Account</h3>
                <ul className="space-y-1">
                  {userMenuItems.map((item, index) => (
                    item.show && (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick();
                          } else {
                            onClose();
                            navigate(item.path);
                          }
                        }}
                      >
                        <span className="text-gray-600">{item.icon}</span>
                        <span className="text-gray-700">{item.title}</span>
                      </motion.li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavbarSidebar; 