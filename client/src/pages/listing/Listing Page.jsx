import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/SideBar/Sidebar";
import Card from "../../components/card";
import axios from "axios";
import { FaFilter, FaHome, FaChevronRight, FaSpinner } from "react-icons/fa";
import MenuIcon from "@mui/icons-material/Menu";
import Breadcrumb_Bar from "../Breadcrumb/BreadCrumb";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { IoClose } from "react-icons/io5";
import { api, endpoints } from "../../api";

// Loading skeleton for products
const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const Listing = () => {
  const { categoryId, subcategoryId } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([0, 100000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [showCount, setShowCount] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("query");
  const maxPrice = searchParams.get("maxPrice");
  console.log(maxPrice);
  console.log("Search Query:", searchQuery);

  // Debounced filter function
  const debouncedFilter = useCallback(
    debounce((products, filters) => {
      if (!products || products.length === 0) return [];
      
      let filtered = [...products];
      
      // Apply price filter
      if (filters.price && Array.isArray(filters.price)) {
        filtered = filtered.filter(
          (product) =>
            product.price >= filters.price[0] && product.price <= filters.price[1]
        );
      }

      // Apply brand filter
      if (filters.brands && filters.brands.length > 0) {
        filtered = filtered.filter((product) =>
          filters.brands.includes(product.brand)
        );
      }

      // Apply rating filter
      if (filters.rating > 0) {
        filtered = filtered.filter((product) => product.rating >= filters.rating);
      }

      // Apply availability filter
      if (filters.availability && filters.availability.length > 0) {
        filtered = filtered.filter((product) => {
          if (filters.availability.includes('inStock') && product.stock > 0) return true;
          if (filters.availability.includes('outOfStock') && product.stock === 0) return true;
          if (filters.availability.includes('comingSoon') && product.comingSoon) return true;
          return false;
        });
      }

      // Apply sorting
      switch (filters.sort) {
        case "price-low-high":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-high-low":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "rating-high-low":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          // Default sorting (featured)
          filtered.sort((a, b) => b.featured - a.featured);
      }

      return filtered;
    }, 300),
    []
  );

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [categoryId, subcategoryId, searchQuery, maxPrice]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = "";
      let params = {};

      if (searchQuery) {
        endpoint = endpoints.searchProducts(searchQuery);
      } else if (subcategoryId) {
        endpoint = endpoints.getProductsBySubcategory(subcategoryId);
      } else if (categoryId) {
        endpoint = endpoints.getProductsByCategory(categoryId);
      } else if(maxPrice) {
        endpoint = "/products/filters";
        params = { maxPrice };
      }

      const response = await api.get(endpoint, { params });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const productsData = Array.isArray(response.data) ? response.data : [];

      // Calculate price range from actual product prices
      if (productsData.length > 0) {
        const prices = productsData.map((p) => p.price).filter(Boolean);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        console.log('Price Range:', { minPrice, maxPrice, prices });
        
        setPriceRange([minPrice, maxPrice]);
        setSelectedPrice([minPrice, maxPrice]);
        
        // Reset other filters
        setSelectedBrands([]);
        setSelectedRating(0);
        setSelectedAvailability([]);
        setSortOption("featured");
        setActiveFilters([]);

        // Set brands
        const uniqueBrands = [...new Set(productsData.map((p) => p.brand))].filter(Boolean);
        setBrands(uniqueBrands);

        // Set category and subcategory names
        const firstProduct = productsData[0];
        setCategoryName(firstProduct.categoryId?.name || "");
        setSubCategoryName(firstProduct.subcategoryId?.name || "");
      }

      setProducts(productsData);
      setFilteredProducts(productsData);

    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to load products. Please try again later.");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter removal
  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'price':
        setSelectedPrice(priceRange);
        break;
      case 'brands':
        setSelectedBrands([]);
        break;
      case 'rating':
        setSelectedRating(0);
        break;
      case 'availability':
        setSelectedAvailability([]);
        break;
      default:
        break;
    }
    
    // Immediately update filtered products after removing a filter
    const updatedFilters = {
      price: filterType === 'price' ? priceRange : selectedPrice,
      brands: filterType === 'brands' ? [] : selectedBrands,
      rating: filterType === 'rating' ? 0 : selectedRating,
      availability: filterType === 'availability' ? [] : selectedAvailability,
      sort: sortOption
    };
    
    const filtered = debouncedFilter(products, updatedFilters);
    setFilteredProducts(filtered);
  };

  // Simplified handlePriceChange function without console logs
  const handlePriceChange = (newPriceRange) => {
    // Update the price state
    setSelectedPrice(newPriceRange);
    
    // Check if full range selected
    const isFullRange = 
      Math.abs(newPriceRange[0] - priceRange[0]) < 1 && 
      Math.abs(newPriceRange[1] - priceRange[1]) < 1;
    
    // Update the activeFilters
    if (isFullRange) {
      // Remove price filter
      setActiveFilters(prev => prev.filter(f => f.type !== 'price'));
    } else {
      // Add or update price filter
      const newPriceFilter = { 
        type: 'price', 
        label: `Price: Rs.${newPriceRange[0].toLocaleString()} - Rs.${newPriceRange[1].toLocaleString()}`
      };
      
      setActiveFilters(prev => {
        const withoutPrice = prev.filter(f => f.type !== 'price');
        return [...withoutPrice, newPriceFilter];
      });
    }
    
    // Apply the filter immediately to products
    if (products && products.length > 0) {
      // Start with all products
      let filtered = [...products];
      
      // Apply price filter
      if (!isFullRange) {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price);
          return price >= newPriceRange[0] && price <= newPriceRange[1];
        });
      }
      
      // Apply any other active filters
      if (selectedBrands.length > 0) {
        filtered = filtered.filter(product => selectedBrands.includes(product.brand));
      }
      
      if (selectedRating > 0) {
        filtered = filtered.filter(product => parseFloat(product.rating) >= selectedRating);
      }
      
      if (selectedAvailability.length > 0) {
        filtered = filtered.filter(product => {
          if (selectedAvailability.includes('In Stock') && product.stockStatus === 'in_stock') return true;
          if (selectedAvailability.includes('Out of Stock') && product.stockStatus === 'out_of_stock') return true;
          return false;
        });
      }
      
      // Apply sorting
      if (sortOption !== 'featured') {
        filtered = applySorting(filtered, sortOption);
      }
      
      // Update filtered products
      setFilteredProducts(filtered);
    }
  };

  // Add this new function to apply all filters
  const applyFilters = useCallback(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    console.log('Applying all filters...');
    
    // Start with all products
    let filtered = [...products];
    
    // Apply price filter
    if (selectedPrice[0] > priceRange[0] || selectedPrice[1] < priceRange[1]) {
      console.log(`Filtering by price: ${selectedPrice[0]} - ${selectedPrice[1]}`);
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        return price >= selectedPrice[0] && price <= selectedPrice[1];
      });
    }
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      console.log('Filtering by brands:', selectedBrands);
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Apply rating filter
    if (selectedRating > 0) {
      console.log(`Filtering by rating: ${selectedRating}+`);
      filtered = filtered.filter(product => parseFloat(product.rating) >= selectedRating);
    }
    
    // Apply availability filter
    if (selectedAvailability.length > 0) {
      console.log('Filtering by availability:', selectedAvailability);
      filtered = filtered.filter(product => {
        if (selectedAvailability.includes('In Stock') && product.stockStatus === 'in_stock') return true;
        if (selectedAvailability.includes('Out of Stock') && product.stockStatus === 'out_of_stock') return true;
        return false;
      });
    }
    
    // Apply sorting
    if (sortOption !== 'featured') {
      console.log('Applying sort:', sortOption);
      filtered = applySorting(filtered, sortOption);
    }
    
    console.log(`Filtered products: ${filtered.length} (from ${products.length} total)`);
    setFilteredProducts(filtered);
  }, [products, selectedPrice, selectedBrands, selectedRating, selectedAvailability, sortOption, priceRange]);

  // Call applyFilters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [selectedPrice, selectedBrands, selectedRating, selectedAvailability, applyFilters]);

  // Scroll to top on filter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filteredProducts]);

  // Add the missing applySorting function
  const applySorting = (products, sortOption) => {
    if (!products || products.length === 0) return [];
    
    const sortedProducts = [...products];
    
    switch (sortOption) {
      case 'price_asc':
        return sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price_desc':
        return sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'rating_desc':
        return sortedProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sortedProducts;
    }
  };

  // Add a function to remove all filters
  const removeAllFilters = () => {
    console.log('Removing all filters');
    setSelectedPrice([...priceRange]);
    setSelectedBrands([]);
    setSelectedRating(0);
    setSelectedAvailability([]);
    setActiveFilters([]);
    
    // Reset to all products
    setFilteredProducts([...products]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="listingPage container mx-auto px-4 sm:px-6 lg:px-8 mt-24 md:mt-32">
        {/* Breadcrumb UI */}
        <div className="w-full bg-white p-3 md:p-4 rounded-lg shadow-sm mb-4">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 text-gray-800 uppercase truncate">
            {categoryName || 'All Products'}
          </h1>
          <div className="flex items-center text-gray-600 space-x-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <FaHome className="text-gray-500 text-xs md:text-sm" />
            <span className="text-sm hover:text-blue-600 cursor-pointer">Home</span>

            {categoryName && (
              <>
                <FaChevronRight className="text-gray-500 text-xs md:text-sm" />
                <span className="text-sm hover:text-blue-600 cursor-pointer">{categoryName}</span>
              </>
            )}

            {subcategoryId && subCategoryName && (
              <>
                <FaChevronRight className="text-gray-500 text-xs md:text-sm" />
                <span className="text-sm hover:text-blue-600 cursor-pointer">{subCategoryName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4 mb-6 lg:mb-0 lg:pr-4">
            <button
              className="lg:hidden w-full py-2 mb-4 bg-blue-600 text-white rounded-lg"
              onClick={() => setShowFilterBar(true)}
            >
              <FaFilter className="inline mr-2" /> Show Filters
            </button>
            <div className="hidden lg:block">
              <Sidebar
                priceRange={priceRange}
                selectedPrice={selectedPrice}
                brands={brands}
                selectedBrands={selectedBrands}
                selectedRating={selectedRating}
                selectedAvailability={selectedAvailability}
                onPriceChange={handlePriceChange}
                onBrandChange={setSelectedBrands}
                onRatingChange={setSelectedRating}
                onAvailabilityChange={setSelectedAvailability}
                onClearAllFilters={removeAllFilters}
                showBar={true}
              />
            </div>
            
            {/* Mobile filter sidebar */}
            <AnimatePresence>
              {showFilterBar && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween" }}
                  className="fixed inset-0 z-50 lg:hidden"
                >
                  <div className="absolute inset-0 bg-opacity-50" onClick={() => setShowFilterBar(false)}></div>
                  <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-xl overflow-y-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Filters</h2>
                      <button onClick={() => setShowFilterBar(false)} className="text-gray-500 hover:text-gray-800">
                        <IoClose size={24} />
                      </button>
                    </div>
                    <Sidebar
                      priceRange={priceRange}
                      selectedPrice={selectedPrice}
                      brands={brands}
                      selectedBrands={selectedBrands}
                      selectedRating={selectedRating}
                      selectedAvailability={selectedAvailability}
                      onPriceChange={handlePriceChange}
                      onBrandChange={setSelectedBrands}
                      onRatingChange={setSelectedRating}
                      onAvailabilityChange={setSelectedAvailability}
                      onClearAllFilters={removeAllFilters}
                      showBar={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm md:text-base text-gray-600">
                    Found{" "}
                    <span className="text-green-600 font-semibold">
                      {filteredProducts?.length || 0}
                    </span>{" "}
                    items
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <select
                    className="border text-sm px-2 py-1.5 border-gray-300 rounded-md min-w-[120px]"
                    value={showCount}
                    onChange={(e) => setShowCount(parseInt(e.target.value))}
                  >
                    <option value={12}>Show: 12</option>
                    <option value={24}>Show: 24</option>
                    <option value={48}>Show: 48</option>
                  </select>

                  <select
                    className="border text-sm px-2 py-1.5 border-gray-300 rounded-md min-w-[140px]"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating-high-low">Rating: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                    >
                      {filter.label}
                      <button
                        // onClick={() => removeFilter(filter.type)}
                        onClick={() => removeAllFilters()}
                        className="hover:text-red-600 transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {!isLoading && filteredProducts?.length > 0 ? (
                filteredProducts
                  .slice(0, showCount)
                  .map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card product={product} />
                    </motion.div>
                  ))
              ) : !isLoading && (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSelectedPrice(priceRange);
                      setSelectedBrands([]);
                      setSelectedRating(0);
                      setSelectedAvailability([]);
                      setSortOption("featured");
                      setActiveFilters([]);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Listing;
