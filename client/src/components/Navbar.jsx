import React, { useState, useEffect } from "react";
import { useCart } from "../pages/cart/cartContext";
import { useAuth } from "../Context/authContext";
import { useWishlist } from "../pages/Wishlist/WishlistContext";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiFillDashboard } from "react-icons/ai";
import { FaRegUser, FaRegHeart } from "react-icons/fa";
import { BsHandbag } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import NavbarSidebar from "./Navbar/NavbarSidebar";
import Dropdown2 from "./dropdown/dropdown2";
// import { useQuery } from "react-query";
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
);

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { role, user } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const { data: specialOffers } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/home/special-offers`);
      return response.data;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const navBottom = document.getElementById("nav-bottom");
      if (navBottom) {
        const isVisible = navBottom.getBoundingClientRect().top < window.innerHeight;
        setShowBottomBar(!isVisible);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      setIsLoading(true);
      try {
        await navigate(`/products/search?query=${searchTerm.trim()}`);
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledropDown = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  return (
    <nav className="relative">
      {/* Top Strip */}
      <div className="bg-gray-900 text-white  text-center text-sm md:text-base">
        Shipping All Over Pakistan
      </div>

      {/* Navbar Center */}
      <div className={`nav-center fixed left-0 w-full h-18 bg-white shadow-lg md:shadow-none z-50 flex items-center justify-between py-2 px-4 md:px-8 transition-all duration-300 ${
        scrolled ? "top-0" : "top-[25px]"
      }`}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hamburger text-2xl md:text-3xl flex xl:hidden items-center justify-center hover:text-blue-600 transition-colors"
          aria-label="Toggle menu"
        >
          <RxHamburgerMenu />
        </button>

        <div className="logo ml-2 sm:ml-4 md:ml-0">
          <a href="/" className="block">
            <img
              className="w-[120px] sm:w-[150px] md:w-[180px] transition-all duration-300"
              src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1740786122/logo-copy_px8c0w.png"
              alt="Company Logo"
              loading="lazy"
            />
          </a>
        </div>

        <div className="country-section hidden xl:flex">
          <div className="country-btn w-38 border-2 border-gray-300 hover:border-blue-500 h-14 rounded-md p-1 flex justify-around gap-2 items-center transition-all duration-300">
            <div className="location">
              <label className="text-gray-500 text-sm">Your Location</label>
              <select className="outline-none pr-4 cursor-pointer font-medium text-base focus:ring-2 focus:ring-blue-500 rounded">
                <option value="">Lahore</option>
                <option value="">Karachi</option>
                <option value="">Islamabad</option>
              </select>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="search-bar hidden md:flex w-1/2 bg-gray-100 hover:bg-gray-200 px-4 items-center justify-between gap-4 py-2 rounded-full transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="border-0 w-full bg-transparent p-2 focus:outline-none text-gray-700 placeholder-gray-500"
          />
          <button 
            type="submit" 
            className="text-xl cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : <i className="fa-solid fa-magnifying-glass"></i>}
          </button>
        </form>

        <div className="user-cart flex items-center gap-4 md:gap-6">
          <span className="text-2xl text-gray-700 hover:text-blue-600 transition-colors">
            {role === 'admin' ? (
              <a href="/admin/dashboard" className="hover:scale-110 transition-transform">
                <AiFillDashboard className="text-xl sm:text-2xl" />
              </a>
            ) : (
              <a href="/signup" className="hover:scale-110 transition-transform">
                <FaRegUser className="text-xl sm:text-2xl" />
              </a>
            )}
          </span>

          <div className="cart-container flex items-center gap-4">
            <a href="/wishlist" className="hover:scale-110 transition-transform">
              <div className="wishList-container hidden md:block relative">
                <FaRegHeart className="text-2xl text-gray-700 hover:text-red-500 transition-colors" />
                {wishlist.length > 0 && (
                  <div className="number absolute -right-2 -top-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {wishlist.length}
                    </span>
                  </div>
                )}
              </div>
            </a>
            <a href="/cart" className="hover:scale-110 transition-transform">
              <div className="cart relative">
                <BsHandbag className="cart-icon text-xl sm:text-2xl text-gray-700 hover:text-blue-600 transition-colors" />
                {cart.length > 0 && (
                  <div className="number absolute -right-2 -top-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {cart.length}
                    </span>
                  </div>
                )}
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Navbar Bottom */}
      <div 
        id="nav-bottom" 
        className={`nav-bottom fixed left-0 w-full lg:h-10 lg:py-1 xl:h-auto bg-gray-100 shadow-md z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${
          scrolled ? "top-[70px]" : "top-[100px]"
        }`}
      >
        {/* Categories Button - Only visible on xl screens */}
        <div
          onClick={handledropDown}
          className="category-btn hidden xl:flex cursor-pointer ml-4 bg-blue-600 hover:bg-blue-700 w-[265px] h-10 items-center justify-center rounded-md gap-3 text-white transition-colors duration-300"
        >
          <div className="bars text-sm">
            <i className="fa-solid fa-bars"></i>
          </div>
          <div className="text mx-2">
            <h2 className="text-[16px] font-medium">ALL CATEGORIES</h2>
          </div>
          <div className="drop-btn text-sm">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>

        <div className="rolling-names flex items-center">
          <ul className="list gap-6 hidden lg:flex">
            <a href="/" className="hover:text-blue-600 transition-colors">
              <li className="cursor-pointer">Home</li>
            </a>
            <a href="/about us" className="hover:text-blue-600 transition-colors">
              <li className="cursor-pointer">About Us</li>
            </a>
            <a href="https://www.google.com/maps/place/Chinar+Trading+Corporation/@33.5609529,73.0113553,19z/data=!4m14!1m7!3m6!1s0x38df936be0066fb1:0x542c11aca8300f8f!2sChinar+Trading+Corporation!8m2!3d33.5609663!4d73.0118998!16s%2Fg%2F11kwr6mgxx!3m5!1s0x38df936be0066fb1:0x542c11aca8300f8f!8m2!3d33.5609663!4d73.0118998!16s%2Fg%2F11kwr6mgxx?entry=ttu&g_ep=EgoyMDI1MDMxOS4xIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D " target="blank"><li className="hover:text-blue-600 cursor-pointer transition-colors">
              Store Location
            </li></a>
            <a href="/contact us" className="hover:text-blue-600 transition-colors">
              <li className="cursor-pointer">Contact Us</li>
            </a>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">
              Corporate Sales
            </li>
          </ul>
        </div>

        <div className="help hidden lg:flex items-center gap-2">
          <h4 className="text-gray-500">Need help? Call Us:</h4>
          <a 
            href="tel:+923173336141" 
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            +92 317 3336141
          </a>
        </div>
      </div>

      {/* Dropdown Container - Only visible on xl screens */}
      <div className="dropdown-container hidden xl:block absolute">
        {isDropDownOpen && (
          <Dropdown2 isOpen={isDropDownOpen} setIsOpen={setIsDropDownOpen} />
        )}
      </div>

      {/* Dynamic Sidebar - Only visible on mobile/tablet */}
      <NavbarSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;






