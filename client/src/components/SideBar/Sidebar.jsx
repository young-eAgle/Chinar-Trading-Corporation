import React, { useState, useEffect,useRef, memo, useMemo } from "react";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import { IoFilterSharp, IoClose, IoSearch } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";
import PropTypes from 'prop-types';


// Loading component for filters
const LoadingFilters = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="bg-gray-50 p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-5/6"></div>
        ))}
      </div>
    </div>
  </div>
);

// Price Filter component - modified to automatically apply changes
const PriceFilter = memo(({ value = [0, 1000], priceRange = [0, 1000], onChange }) => {
  // Ensure numeric values for price range
  const sanitizePriceRange = (range) => {
    if (!Array.isArray(range)) return [0, 1000];
    const min = Number.isFinite(Number(range[0])) ? Number(range[0]) : 0;
    const max = Number.isFinite(Number(range[1])) ? Number(range[1]) : 1000;
    return [min, max];
  };

  const safeValue = sanitizePriceRange(value);
  const safePriceRange = sanitizePriceRange(priceRange);
  
  const [localValue, setLocalValue] = useState(safeValue);
  const [inputMin, setInputMin] = useState(safeValue[0].toString());
  const [inputMax, setInputMax] = useState(safeValue[1].toString());
  
  // Add debounce ref to prevent too frequent updates
  const debounceTimeout = useRef(null);
  
  // Update local state when props change
  useEffect(() => {
    try {
      if (Array.isArray(value)) {
        const safeVal = sanitizePriceRange(value);
        setLocalValue(safeVal);
        setInputMin(safeVal[0].toString());
        setInputMax(safeVal[1].toString());
      }
    } catch (err) {
      console.error("Error updating price range:", err);
    }
  }, [value]);

  // This function calls onChange after debouncing
  const debouncedOnChange = (newValue) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onChange(newValue);
    }, 300); // 300ms debounce time
  };

  // Handle slider change - now automatically calls onChange after debounce
  const handleSliderChange = (event, newValue) => {
    try {
      setLocalValue(newValue);
      setInputMin(newValue[0].toString());
      setInputMax(newValue[1].toString());
      
      // Automatically trigger filter with debounce
      debouncedOnChange(newValue);
    } catch (err) {
      console.error("Error handling slider change:", err);
    }
  };

  // Handle input changes
  const handleMinInputChange = (e) => {
    setInputMin(e.target.value);
  };

  const handleMaxInputChange = (e) => {
    setInputMax(e.target.value);
  };

  // Apply input values immediately
  const applyInputChange = () => {
    try {
      // Parse and validate values
      let min = parseInt(inputMin, 10) || safePriceRange[0];
      let max = parseInt(inputMax, 10) || safePriceRange[1];
      
      // Ensure values are within range and min <= max
      min = Math.max(safePriceRange[0], Math.min(min, safePriceRange[1]));
      max = Math.max(min, Math.min(max, safePriceRange[1]));
      
      const newValue = [min, max];
      console.log(`Applying price range: ${min} - ${max}`);
      
      // Update local state
      setLocalValue(newValue);
      setInputMin(min.toString());
      setInputMax(max.toString());
      
      // Call parent's onChange handler directly
      onChange(newValue);
    } catch (err) {
      console.error("Error applying price range:", err);
    }
  };

  // Handle enter key press to apply input changes
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyInputChange();
    }
  };
  
  // Handle input blur to apply changes when focus is lost
  const handleInputBlur = () => {
    applyInputChange();
  };

  // Handle reset to full range
  const handleResetClick = () => {
    const fullRange = [...safePriceRange];
    setLocalValue(fullRange);
    setInputMin(fullRange[0].toString());
    setInputMax(fullRange[1].toString());
    
    // Call parent's onChange handler directly
    onChange(fullRange);
  };

  // Check if current selection is full range
  const isFullRange = 
    Math.abs(localValue[0] - safePriceRange[0]) < 1 && 
    Math.abs(localValue[1] - safePriceRange[1]) < 1;

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Price Range</h2>
      
      {/* Price range display */}
      <div className="flex justify-between mb-2 text-sm">
        <span>Range: Rs.{safePriceRange[0].toLocaleString()} - Rs.{safePriceRange[1].toLocaleString()}</span>
        <div className="flex items-center">
          {/* <span className="font-medium">
            Selected: Rs.{localValue[0].toLocaleString()} - Rs.{localValue[1].toLocaleString()}
          </span> */}
          {!isFullRange && (
            <button 
              onClick={handleResetClick}
              className="ml-2 text-xs text-red-600 hover:text-red-800 cursor-pointer"
              title="Reset to full range"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {/* Slider */}
      <Slider
        value={localValue}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={safePriceRange[0]}
        max={safePriceRange[1]}
        // marks={[
        //   { value: safePriceRange[0], label: `Rs.${safePriceRange[0].toLocaleString()}` },
        //   { value: safePriceRange[1], label: `Rs.${safePriceRange[1].toLocaleString()}` }
        // ]}
      />
      
      {/* Input fields */}
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rs.</span>
            <input
              type="number"
              value={inputMin}
              onChange={handleMinInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={safePriceRange[0]}
              max={parseInt(inputMax) - 1}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rs.</span>
            <input
              type="number"
              value={inputMax}
              onChange={handleMaxInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={parseInt(inputMin) + 1}
              max={safePriceRange[1]}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PriceFilter.displayName = 'PriceFilter';

// Brand Filter component with search
const BrandFilter = memo(({ brands, selectedBrands = [], onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter By Brand</h2>
      <div className="relative mb-4">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="max-h-60 overflow-y-auto">
        <ul className="space-y-2">
          {Array.isArray(filteredBrands) && filteredBrands.length > 0 ? (
            filteredBrands.map((brand, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md transition-colors"
            >
              <Checkbox
                color="success"
                  checked={Array.isArray(selectedBrands) && selectedBrands.includes(brand)}
                onChange={() => onChange(brand)}
                className="hover:bg-gray-200 rounded"
              />
              <span className="text-gray-700">{brand}</span>
            </motion.li>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No brands available</p>
          )}
        </ul>
      </div>
    </div>
  );
});

BrandFilter.displayName = 'BrandFilter';

// Rating Filter component
const RatingFilter = memo(({ selectedRating = 0, onChange }) => {
  // Ensure selectedRating is a number
  const rating = typeof selectedRating === 'number' ? selectedRating : 0;
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center">
          <input
            type="radio"
            id={`rating-${star}`}
            checked={rating === star}
            onChange={() => onChange(star)}
            className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
          />
          <label htmlFor={`rating-${star}`} className="ml-2 flex items-center">
            {[...Array(star)].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            {[...Array(5 - star)].map((_, i) => (
              <span key={i} className="text-gray-300">★</span>
            ))}
            <span className="ml-1 text-sm text-gray-600">{star} & above</span>
          </label>
          </div>
      ))}
      {rating > 0 && (
        <button 
          onClick={() => onChange(0)} 
          className="text-sm text-green-600 hover:text-green-700 mt-2"
        >
          Clear rating filter
        </button>
      )}
    </div>
  );
});

RatingFilter.displayName = 'RatingFilter';

// Availability Filter component
const AvailabilityFilter = memo(({ selectedAvailability = [], onChange }) => {
  const availabilityOptions = ['In Stock', 'Out of Stock'];
  
  const handleChange = (option) => {
    if (!Array.isArray(selectedAvailability)) {
      onChange([option]);
      return;
    }
    
    if (selectedAvailability.includes(option)) {
      onChange(selectedAvailability.filter(item => item !== option));
    } else {
      onChange([...selectedAvailability, option]);
    }
  };
  
  return (
    <div className="space-y-2">
      {availabilityOptions.map((option) => (
        <div key={option} className="flex items-center">
          <input
            type="checkbox"
            id={`availability-${option}`}
            checked={Array.isArray(selectedAvailability) && selectedAvailability.includes(option)}
            onChange={() => handleChange(option)}
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label
            htmlFor={`availability-${option}`}
            className="ml-2 block text-sm text-gray-700"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
});

AvailabilityFilter.displayName = 'AvailabilityFilter';

const Sidebar = ({
  priceRange = [0, 1000],
  selectedPrice = [0, 1000],
  brands = [],
  selectedBrands = [],
  selectedRating = 0,
  selectedAvailability = [],
  onPriceChange = () => {},
  onBrandChange = () => {},
  onRatingChange = () => {},
  onAvailabilityChange = () => {},
  onClearAllFilters = () => {},
  showBar = true,
  setShowBar = () => {}
}) => {
  // Ensure numeric values for price range
  const sanitizePriceRange = (range) => {
    if (!Array.isArray(range)) return [0, 1000];
    const min = Number.isFinite(Number(range[0])) ? Number(range[0]) : 0;
    const max = Number.isFinite(Number(range[1])) ? Number(range[1]) : 1000;
    return [min, max];
  };

  const safePriceRange = sanitizePriceRange(priceRange);
  const safeSelectedPrice = sanitizePriceRange(selectedPrice);
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brands: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSelectedBrands = (brand) => {
    if (!Array.isArray(selectedBrands)) {
      // Initialize with empty array if undefined
      onBrandChange([brand]);
      return;
    }
    
    const isSelected = selectedBrands.includes(brand);
    if (isSelected) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
      } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  // Update clearAllFilters to use the passed-in handler
  const clearAllFilters = () => {
    console.log("Sidebar: Clearing all filters");
    onClearAllFilters();  // Call the parent's clear function
  };

  // Fix the showClearButton logic to accurately determine if filters are applied
  const showClearButton = 
    selectedRating > 0 || 
    (Array.isArray(selectedBrands) && selectedBrands.length > 0) || 
    (safeSelectedPrice[0] > safePriceRange[0] || safeSelectedPrice[1] < safePriceRange[1]) ||
    (Array.isArray(selectedAvailability) && selectedAvailability.length > 0);

  return (
        <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`transition-all duration-300 bg-white shadow-md rounded-lg overflow-hidden ${
        showBar ? 'max-h-[calc(100vh-6rem)] overflow-y-auto' : 'max-h-0 lg:max-h-[calc(100vh-6rem)] overflow-hidden'
      }`}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button onClick={() => setShowBar(false)} className="text-2xl">
          &times;
        </button>
            </div>

      <div className="p-4">
        {/* Clear All Filters Button */}
        {showClearButton && (
          <div className="mb-4">
            <button
              onClick={clearAllFilters}
              className="w-full py-2 text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Price Filter Section */}
        <div className="mb-4 border-b border-gray-200 pb-4">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2" 
            onClick={() => toggleSection('price')}
          >
            <h3 className="text-lg font-semibold text-gray-700">Price Range</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSections.price ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
                </div>
          
          <AnimatePresence>
            {expandedSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <PriceFilter
                  value={safeSelectedPrice} 
                  priceRange={safePriceRange} 
                  onChange={onPriceChange} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Filter Section */}
        <div className="mb-4 border-b border-gray-200 pb-4">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('brands')}
          >
            <h3 className="text-lg font-semibold text-gray-700">Brands</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSections.brands ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <AnimatePresence>
            {expandedSections.brands && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <BrandFilter
                    brands={brands}
                    selectedBrands={selectedBrands}
                  onChange={handleSelectedBrands} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Filter Section */}
        <div className="mb-4 border-b border-gray-200 pb-4">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('rating')}
          >
            <h3 className="text-lg font-semibold text-gray-700">Rating</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSections.rating ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <AnimatePresence>
            {expandedSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <RatingFilter
                    selectedRating={selectedRating}
                  onChange={onRatingChange} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Availability Filter Section */}
        <div className="mb-4">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('availability')}
          >
            <h3 className="text-lg font-semibold text-gray-700">Availability</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSections.availability ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <AnimatePresence>
            {expandedSections.availability && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <AvailabilityFilter
                    selectedAvailability={selectedAvailability}
                  onChange={onAvailabilityChange} 
                  />
              </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
        </motion.div>
  );
};

Sidebar.propTypes = {
  priceRange: PropTypes.array,
  selectedPrice: PropTypes.array,
  brands: PropTypes.array,
  selectedBrands: PropTypes.array,
  selectedRating: PropTypes.number,
  selectedAvailability: PropTypes.array,
  onPriceChange: PropTypes.func,
  onBrandChange: PropTypes.func,
  onRatingChange: PropTypes.func,
  onAvailabilityChange: PropTypes.func,
  onClearAllFilters: PropTypes.func,
  showBar: PropTypes.bool,
  setShowBar: PropTypes.func
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
