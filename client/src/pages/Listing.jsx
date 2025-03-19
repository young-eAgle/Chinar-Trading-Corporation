import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const Listing = () => {
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All Sub Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrice, setSelectedPrice] = useState([0, 1000]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [initialPriceRange, setInitialPriceRange] = useState([0, 1000]);
  // Track if this is the first time we're loading the page
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Track if price range was explicitly changed by user - start with FALSE
  const [priceRangeChanged, setPriceRangeChanged] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [brands, setBrands] = useState([]);

  // Function to clear all filters
  const clearAllFilters = useCallback(() => {
    console.log("Clearing all filters");
    setSelectedPrice([...priceRange]);  // Reset to current full range
    setSelectedBrands([]);
    setSelectedRating(0);
    setSelectedAvailability([]);
    setPriceRangeChanged(false);  // Important: reset the price change flag
    
    // Force a refetch with cleared filters
    setTimeout(() => {
      fetchAllProducts();
    }, 0);
  }, [priceRange, fetchAllProducts]);

  // New function to fetch all products without price filtering
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching ALL products without price filtering");
      
      // Construct endpoint without price filters
      let endpoint = '/api/products?';
      endpoint += `page=${currentPage}&limit=${itemsPerPage}`;
      
      if (selectedCategory && selectedCategory !== 'All Categories') {
        endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      if (selectedSubCategory && selectedSubCategory !== 'All Sub Categories') {
        endpoint += `&subcategory=${encodeURIComponent(selectedSubCategory)}`;
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (selectedBrands.length > 0) {
        endpoint += `&brands=${encodeURIComponent(JSON.stringify(selectedBrands))}`;
      }
      
      if (selectedRating > 0) {
        endpoint += `&minRating=${selectedRating}`;
      }
      
      if (selectedAvailability.length > 0) {
        endpoint += `&availability=${encodeURIComponent(JSON.stringify(selectedAvailability))}`;
      }
      
      if (sortOption) {
        endpoint += `&sort=${encodeURIComponent(sortOption)}`;
      }
      
      console.log("Initial fetch endpoint (NO price filter):", endpoint);
      
      const response = await axios.get(endpoint);
      console.log("Initial API response, products:", response.data.products?.length || 0);
      
      // Update state with ALL products
      setProducts(response.data.products || []);
      setTotalItems(response.data.totalItems || 0);
      setTotalPages(response.data.totalPages || 1);
      
      // Update available brands based on returned data
      if (response.data.availableBrands) {
        setBrands(response.data.availableBrands);
      }
      
      // Update price range based on returned data
      if (response.data.priceRange) {
        const newPriceRange = response.data.priceRange;
        console.log("Setting initial price range:", newPriceRange);
        setPriceRange(newPriceRange);
        setSelectedPrice(newPriceRange);
        setInitialPriceRange(newPriceRange);
      }
      
      // We've completed the initial load
      setIsInitialLoad(false);
      
    } catch (error) {
      console.error("Error fetching all products:", error);
      setFetchError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage, itemsPerPage, selectedCategory, selectedSubCategory, 
    searchQuery, selectedBrands, selectedRating, selectedAvailability, sortOption
  ]);

  // Effects for initialization
  useEffect(() => {
    // On first component mount, fetch all products without price filtering
    fetchAllProducts();
  }, []);  // Empty dependency array so this only runs once on mount

  // Updated price range change handler with better debugging
  const handlePriceRangeChange = (newPriceRange) => {
    console.log("-------------------------------------------");
    console.log("Price Range Change Triggered!");
    console.log("New price range:", newPriceRange, "Current range:", priceRange);
    
    // Check if this is resetting to the full range
    const isFullRange = (
      Math.abs(newPriceRange[0] - priceRange[0]) < 1 && 
      Math.abs(newPriceRange[1] - priceRange[1]) < 1
    );
    
    // Always update the selected price
    setSelectedPrice(newPriceRange);
    
    if (isFullRange) {
      console.log("User selected full price range - clearing price filter");
      setPriceRangeChanged(false);  // Reset the flag when going back to full range
      
      // If going back to full range, fetch all products without filtering
      setTimeout(() => {
        console.log("Fetching ALL products (full range selected)");
        fetchAllProducts();
      }, 0);
    } else {
      console.log("User selected specific price range - applying filter");
      setPriceRangeChanged(true);
      
      // Force refetch products with the new price range
      setTimeout(() => {
        console.log("Fetching FILTERED products with price range:", newPriceRange);
        fetchProducts();
      }, 0);
    }
    console.log("-------------------------------------------");
  };

  // Debug function to log current filter state
  const logFilterState = () => {
    console.log({
      selectedPrice,
      priceRange,
      priceRangeChanged,
      isFullRange: (
        Math.abs(selectedPrice[0] - priceRange[0]) < 1 && 
        Math.abs(selectedPrice[1] - priceRange[1]) < 1
      ),
      productsCount: products.length,
      selectedCategory,
      selectedBrands,
      selectedRating,
      selectedAvailability
    });
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // Log the current filter state for debugging
      console.log("Filtered products fetch - current state:", {
        selectedPrice,
        priceRange,
        priceRangeChanged,
        isFullRange: (
          Math.abs(selectedPrice[0] - priceRange[0]) < 1 && 
          Math.abs(selectedPrice[1] - priceRange[1]) < 1
        )
      });
      
      // If we're not applying price filters, use the simpler function
      if (!priceRangeChanged) {
        console.log("No price filters active, redirecting to fetchAllProducts");
        fetchAllProducts();
        return;
      }
      
      // Construct the API endpoint for filtered results
      let endpoint = '/api/products?';
      
      // Always include pagination
      endpoint += `page=${currentPage}&limit=${itemsPerPage}`;
      
      // Add category filter if present
      if (selectedCategory && selectedCategory !== 'All Categories') {
        endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      // Add subcategory filter if present
      if (selectedSubCategory && selectedSubCategory !== 'All Sub Categories') {
        endpoint += `&subcategory=${encodeURIComponent(selectedSubCategory)}`;
      }
      
      // Add search query if present
      if (searchQuery && searchQuery.trim() !== '') {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      // Validate price range values
      const minPrice = Number(selectedPrice[0]);
      const maxPrice = Number(selectedPrice[1]);
      
      // Add price range parameters (we know price filter is active at this point)
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        endpoint += `&minPrice=${Math.floor(minPrice)}`;
        endpoint += `&maxPrice=${Math.ceil(maxPrice)}`;
        console.log(`Filtering with price range: ${minPrice} - ${maxPrice}`);
      }
      
      // Add other filters
      if (selectedBrands.length > 0) {
        endpoint += `&brands=${encodeURIComponent(JSON.stringify(selectedBrands))}`;
      }
      
      if (selectedRating > 0) {
        endpoint += `&minRating=${selectedRating}`;
      }
      
      if (selectedAvailability.length > 0) {
        endpoint += `&availability=${encodeURIComponent(JSON.stringify(selectedAvailability))}`;
      }
      
      if (sortOption) {
        endpoint += `&sort=${encodeURIComponent(sortOption)}`;
      }
      
      console.log("Fetching FILTERED products with endpoint:", endpoint);
      
      const response = await axios.get(endpoint);
      console.log("Filtered API response product count:", response.data.products?.length || 0);
      
      // Apply client-side filtering as a backup
      let filteredProducts = response.data.products || [];
      
      // Double-check the price filtering client-side if needed
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        const originalCount = filteredProducts.length;
        
        filteredProducts = filteredProducts.filter(product => {
          const productPrice = formatProductPrice(product.price);
          // Add small tolerance for floating point comparison
          const isInRange = productPrice >= (minPrice - 0.01) && productPrice <= (maxPrice + 0.01);
          
          if (!isInRange) {
            console.log(`Filtering out product with price ${productPrice}: ${product.name || product.title}`);
          }
          
          return isInRange;
        });
        
        console.log(`Client-side filtered products: ${originalCount} → ${filteredProducts.length}`);
      }
      
      // Update state with the filtered data
      setProducts(filteredProducts);
      setTotalItems(filteredProducts.length);
      setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
      
      // Update URL to reflect current filters without reloading the page
      updateURLWithoutReload();
      
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setFetchError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage, itemsPerPage, selectedCategory, selectedSubCategory, searchQuery, 
    selectedPrice, selectedBrands, selectedRating, selectedAvailability, 
    sortOption, priceRange, priceRangeChanged, fetchAllProducts
  ]);

  // Function to update URL with current filters without reloading the page
  const updateURLWithoutReload = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.set('page', currentPage.toString());
    
    // Add category filter if present
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.set('category', selectedCategory);
    }
    
    // Add subcategory filter if present
    if (selectedSubCategory && selectedSubCategory !== 'All Sub Categories') {
      params.set('subcategory', selectedSubCategory);
    }
    
    // Add search query if present
    if (searchQuery && searchQuery.trim() !== '') {
      params.set('search', searchQuery);
    }
    
    // Only add price filter to URL if it's been explicitly changed by user
    if (priceRangeChanged) {
      const minPrice = Number(selectedPrice[0]);
      const maxPrice = Number(selectedPrice[1]);
      
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        params.set('minPrice', Math.floor(minPrice).toString());
        params.set('maxPrice', Math.ceil(maxPrice).toString());
      }
    }
    
    // Add brand filter if present
    if (selectedBrands.length > 0) {
      params.set('brands', JSON.stringify(selectedBrands));
    }
    
    // Add rating filter if present
    if (selectedRating > 0) {
      params.set('minRating', selectedRating.toString());
    }
    
    // Add availability filter if present
    if (selectedAvailability.length > 0) {
      params.set('availability', JSON.stringify(selectedAvailability));
    }
    
    // Add sort parameter if present
    if (sortOption) {
      params.set('sort', sortOption);
    }
    
    // Create the new URL
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    console.log("Updating URL to:", newUrl);
    
    // Update URL without reloading the page
    window.history.replaceState({}, '', newUrl);
  }, [
    currentPage, selectedCategory, selectedSubCategory, searchQuery, 
    selectedPrice, selectedBrands, selectedRating, selectedAvailability, 
    sortOption, priceRangeChanged
  ]);

  // Function to reset price filter
  const resetPriceFilter = useCallback(() => {
    console.log("Resetting price filter to full range:", priceRange);
    setPriceRangeChanged(false);
    setSelectedPrice([...priceRange]);
    setTimeout(() => {
      fetchAllProducts();
    }, 0);
  }, [priceRange, fetchAllProducts]);

  // Effect to fetch products when URL parameters change
  useEffect(() => {
    // Parse URL parameters on initial load and when URL changes
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const subcategoryParam = urlParams.get('subcategory');
    const searchParam = urlParams.get('search');
    const pageParam = urlParams.get('page');
    const minPriceParam = urlParams.get('minPrice');
    const maxPriceParam = urlParams.get('maxPrice');
    const brandsParam = urlParams.get('brands');
    const ratingParam = urlParams.get('minRating');
    const availabilityParam = urlParams.get('availability');
    const sortParam = urlParams.get('sort');
    
    // Update state based on URL parameters
    let stateChanged = false;
    
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
      stateChanged = true;
    }
    
    if (subcategoryParam && subcategoryParam !== selectedSubCategory) {
      setSelectedSubCategory(subcategoryParam);
      stateChanged = true;
    }
    
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      stateChanged = true;
    }
    
    if (pageParam && parseInt(pageParam, 10) !== currentPage) {
      setCurrentPage(parseInt(pageParam, 10));
      stateChanged = true;
    }
    
    if (minPriceParam && maxPriceParam) {
      const minPrice = parseInt(minPriceParam, 10);
      const maxPrice = parseInt(maxPriceParam, 10);
      if (minPrice !== selectedPrice[0] || maxPrice !== selectedPrice[1]) {
        setSelectedPrice([minPrice, maxPrice]);
        stateChanged = true;
      }
    }
    
    if (brandsParam) {
      try {
        const brandsArray = JSON.parse(brandsParam);
        if (JSON.stringify(brandsArray) !== JSON.stringify(selectedBrands)) {
          setSelectedBrands(brandsArray);
          stateChanged = true;
        }
      } catch (error) {
        console.error("Error parsing brands parameter:", error);
      }
    }
    
    if (ratingParam) {
      const rating = parseInt(ratingParam, 10);
      if (rating !== selectedRating) {
        setSelectedRating(rating);
        stateChanged = true;
      }
    }
    
    if (availabilityParam) {
      try {
        const availabilityArray = JSON.parse(availabilityParam);
        if (JSON.stringify(availabilityArray) !== JSON.stringify(selectedAvailability)) {
          setSelectedAvailability(availabilityArray);
          stateChanged = true;
        }
      } catch (error) {
        console.error("Error parsing availability parameter:", error);
      }
    }
    
    if (sortParam && sortParam !== sortOption) {
      setSortOption(sortParam);
      stateChanged = true;
    }
    
    // If we're just loading the page and have URL parameters, fetch immediately
    if (!stateChanged) {
      fetchProducts();
    }
    // The fetchProducts will be called by other useEffects when state changes
  }, []);

  // Effect to fetch products when state changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add a helper function to handle product price formatting
  const formatProductPrice = (price) => {
    // Handle different price formats from the API
    if (typeof price === 'number') {
      return price;
    }
    
    if (typeof price === 'string') {
      // Remove any non-numeric characters except decimals
      const numericPrice = price.replace(/[^0-9.]/g, '');
      return parseFloat(numericPrice) || 0;
    }
    
    if (typeof price === 'object' && price !== null) {
      // Some APIs return price as an object with different formats
      if (price.value !== undefined) {
        return parseFloat(price.value) || 0;
      }
      if (price.amount !== undefined) {
        return parseFloat(price.amount) || 0;
      }
    }
    
    return 0; // Default fallback
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar with filters */}
        <div className="lg:w-1/4 mb-6 lg:mb-0 lg:mr-8">
          <button
            className="lg:hidden w-full py-2 mb-4 bg-green-600 text-white rounded-lg"
            onClick={() => setShowBar(true)}
          >
            Show Filters
          </button>
          <Sidebar
            priceRange={priceRange}
            selectedPrice={selectedPrice}
            brands={brands}
            selectedBrands={selectedBrands}
            selectedRating={selectedRating}
            selectedAvailability={selectedAvailability}
            onPriceChange={handlePriceRangeChange}
            onBrandChange={setSelectedBrands}
            onRatingChange={setSelectedRating}
            onAvailabilityChange={setSelectedAvailability}
            onClearAllFilters={clearAllFilters}
            showBar={showBar}
            setShowBar={setShowBar}
          />
        </div>

        {/* Main content */}
        <div className="lg:w-3/4">
          {/* Product listing header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-semibold text-gray-800">
                {selectedCategory !== 'All Categories' ? selectedCategory : 'All Products'}
                {selectedSubCategory !== 'All Sub Categories' && ` / ${selectedSubCategory}`}
              </h1>
              <p className="text-gray-600">
                Found <span className="font-semibold">{totalItems}</span> items
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={10}>Show: 10</option>
                  <option value={20}>Show: 20</option>
                  <option value={50}>Show: 50</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Rating: Highest</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applied filters display */}
          {(selectedBrands.length > 0 || selectedRating > 0 || selectedAvailability.length > 0 || priceRangeChanged) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
              <span className="text-gray-700 font-medium">Applied Filters:</span>
              
              {priceRangeChanged && (
                <div className="bg-green-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <span className="mr-1">Price: Rs.{selectedPrice[0].toLocaleString()} - Rs.{selectedPrice[1].toLocaleString()}</span>
                  <button 
                    onClick={resetPriceFilter}
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Remove filter"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {selectedBrands.map(brand => (
                <div key={brand} className="bg-green-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <span className="mr-1">{brand}</span>
                  <button 
                    onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Remove filter"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {selectedRating > 0 && (
                <div className="bg-green-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <span className="mr-1">Rating: {selectedRating}+</span>
                  <button 
                    onClick={() => setSelectedRating(0)}
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Remove filter"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {selectedAvailability.map(option => (
                <div key={option} className="bg-green-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <span className="mr-1">{option}</span>
                  <button 
                    onClick={() => setSelectedAvailability(selectedAvailability.filter(o => o !== option))}
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Remove filter"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button 
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-sm ml-auto"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : fetchError ? (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-red-600">{fetchError}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id || product._id} className="product-card">
                  {/* Replace with your actual product card component */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <img
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name || product.title}
                        className="object-cover w-full h-48"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {product.name || product.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-green-600 font-bold">
                          Rs.{formatProductPrice(product.price).toLocaleString()}
                        </p>
                        <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No products found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search criteria</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages).keys()].map(page => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page + 1
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listing; 