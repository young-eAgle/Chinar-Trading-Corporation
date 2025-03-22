import React, { useState, useEffect, useRef, memo } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

// Loading component for categories
const LoadingCategories = () => (
  <div className="w-[252px] bg-white p-3 space-y-2">
    {[1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15].map((i) => (
      <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

// Loading component for subcategories
const LoadingSubcategories = () => (
  <div className="p-3 space-y-2">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-6 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    ))}
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="p-4 text-center">
    <p className="text-red-600 mb-2">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Retry
    </button>
  </div>
);

// Category Item component
const CategoryItem = memo(({ category, onMouseEnter, onClick }) => (
  <motion.li
    whileHover={{ x: 5 }}
    className="px-3 bg-gray-100 py-2 flex items-center justify-between hover:bg-blue-100 cursor-pointer transition-all duration-200 rounded"
    onMouseEnter={(event) => onMouseEnter(category, event)}
    onClick={onClick}
  >
    <span className="font-medium text-gray-700">{category.name}</span>
    <FaChevronRight className="text-gray-500 text-xs" />
  </motion.li>
));

CategoryItem.displayName = 'CategoryItem';

// Subcategory Item component
const SubcategoryItem = memo(({ subcategory, onClick }) => (
  <motion.li
    whileHover={{ x: 5 }}
    className="p-2 hover:bg-blue-100 rounded cursor-pointer transition-all duration-200"
    onClick={onClick}
  >
    <span className="text-gray-700">{subcategory.name}</span>
  </motion.li>
));

SubcategoryItem.displayName = 'SubcategoryItem';

const Dropdown = memo(({ isOpen, setIsOpen }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(0);
  const [categoryId, setCategoryId] = useState(null);
  const [scrolled, setScrolled] = useState(window.scrollY > 40);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const submenuRef = useRef(null);
  const hoverTimeout = useRef(null);
  const navigate = useNavigate();

  // Fetch categories on mount
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update scroll state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setScrolled(window.scrollY > 40);
    }
  }, [isOpen]);

  // Fetch subcategories when a category is hovered
  const fetchSubcategories = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/subcategories/category/${id}`);
      setSubcategories(response.data);
    } catch (err) {
      setError("Failed to load subcategories. Please try again.");
      console.error("Error fetching subcategories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    }
  }, [categoryId]);

  // Handle category hover
  const handleMouseEnter = (category, event) => {
    clearTimeout(hoverTimeout.current);
    setActiveCategory(category);
    setCategoryId(category._id);

    if (dropdownRef.current && submenuRef.current) {
      const hoveredItem = event.target;
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const hoveredRect = hoveredItem.getBoundingClientRect();
      const submenuHeight = submenuRef.current.offsetHeight;

      let calculatedTop = hoveredRect.top - dropdownRect.top;

      // Prevent submenu overflow at bottom
      const screenBottom = window.innerHeight;
      if (hoveredRect.bottom + submenuHeight > screenBottom) {
        calculatedTop = Math.max(screenBottom - dropdownRect.top - submenuHeight - 10, 0);
      }

      setSubmenuPosition(calculatedTop);
    }
  };

  // Delayed closing to prevent flickering
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  // Prevent submenu from closing when hovered
  const handleSubmenuEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  // Click-away listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products/category/${categoryId}`);
    setIsOpen(false);
  };

  const handleSubCategoryClick = (subcategoryId) => {
    navigate(`/products/subcategory/${subcategoryId}`);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`fixed left-[37px] bg-white shadow-xl rounded-lg z-50 flex flex-col border border-gray-300 p-1 transition-all duration-300 text-sm ${
            scrolled ? "top-28.5" : "top-36"
          }`}
          onMouseLeave={handleMouseLeave}
          ref={dropdownRef}
        >
          {/* Categories List */}
          <div className="w-[252px] bg-white">
            {isLoading ? (
              <LoadingCategories />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchCategories} />
            ) : (
              <ul className="space-y-1">
                {categories.map((category) => (
                  <CategoryItem
                    key={category._id}
                    category={category}
                    onMouseEnter={handleMouseEnter}
                    onClick={() => handleCategoryClick(category._id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Subcategories Panel */}
          <AnimatePresence>
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                ref={submenuRef}
                className="absolute left-full bg-white p-3 shadow-lg min-w-[270px] border border-gray-200 rounded-lg"
                style={{ top: `${submenuPosition}px` }}
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleMouseLeave}
              >
                <h3 className="text-lg font-semibold text-blue-600 border-b pb-2 mb-2">
                  {activeCategory.name}
                </h3>
                {isLoading ? (
                  <LoadingSubcategories />
                ) : error ? (
                  <ErrorMessage message={error} onRetry={() => fetchSubcategories(categoryId)} />
                ) : (
                  <ul className="space-y-1">
                    {subcategories.length > 0 ? (
                      subcategories.map((sub) => (
                        <SubcategoryItem
                          key={sub._id}
                          subcategory={sub}
                          onClick={() => handleSubCategoryClick(sub._id)}
                        />
                      ))
                    ) : (
                      <li className="text-gray-400 text-sm p-2">No subcategories</li>
                    )}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;



// import React, { useState, useEffect, useRef } from "react";
// import { FaChevronRight } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Dropdown = ({ isOpen, setIsOpen }) => {
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [submenuPosition, setSubmenuPosition] = useState(0);
//   const [categoryId, setCategoryId] = useState(null);

//   const dropdownRef = useRef(null);
//   const submenuRef = useRef(null);
//   const hoverTimeout = useRef(null); // Track hover timeout
//   const navigate = useNavigate();

//   // ✅ Fetch categories
//   useEffect(() => {
//     axios.get("http://localhost:5000/categories")
//       .then((response) => setCategories(response.data))
//       .catch((error) => console.error("Error fetching categories:", error));
//   }, []);

//   // ✅ Fetch subcategories when category changes
//   useEffect(() => {
//     if (!categoryId) return;
//     axios.get(`http://localhost:5000/subcategories/category/${categoryId}`)
//       .then((response) => setSubcategories(response.data))
//       .catch((error) => console.error("Error fetching subcategories:", error));
//   }, [categoryId]);

//   // ✅ Handle category hover
//   const handleMouseEnter = (category, event) => {
//     clearTimeout(hoverTimeout.current);
//     setActiveCategory(category);
//     setCategoryId(category._id);

//     if (dropdownRef.current && submenuRef.current) {
//       const hoveredItem = event.target;
//       const dropdownRect = dropdownRef.current.getBoundingClientRect();
//       const hoveredRect = hoveredItem.getBoundingClientRect();
//       const submenuHeight = submenuRef.current.offsetHeight;

//       let calculatedTop = hoveredRect.top - dropdownRect.top;

//       // Prevent submenu overflow
//       const screenBottom = window.innerHeight;
//       if (hoveredRect.bottom + submenuHeight > screenBottom) {
//         calculatedTop = Math.max(
//           screenBottom - dropdownRect.top - submenuHeight - 10,
//           0
//         );
//       }

//       setSubmenuPosition(calculatedTop);
//     }
//   };

//   // ✅ Handle mouse leave (delayed to prevent flickering)
//   const handleMouseLeave = () => {
//     hoverTimeout.current = setTimeout(() => {
//       setActiveCategory(null);
//     }, 500);
//   };

//   // ✅ Prevent submenu from closing when hovering over it
//   const handleSubmenuEnter = () => {
//     clearTimeout(hoverTimeout.current);
//   };

//   // ✅ Click away listener
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target) &&
//         submenuRef.current &&
//         !submenuRef.current.contains(event.target)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleCategoryClick = (categoryId) => {
//     navigate(`/products/category/${categoryId}`);
//     setIsOpen(false);
//   };

//   const handleSubCategoryClick = (subcategoryId) => {
//     navigate(`/products/subcategory/${subcategoryId}`);
//     setIsOpen(false);
//   };

//   return (
//     <>
//       {isOpen && (
//         <div
//           className="absolute top-12 left-16 bg-white shadow-lg rounded-lg z-50 flex flex-col border"
//           onMouseLeave={handleMouseLeave}
//           ref={dropdownRef}
//         >
//           {/* ✅ Categories List */}
//           <div className="w-[260px] h-auto bg-white p-2">
//             <ul className="space-y-1">
//               {categories.map((category) => (
//                 <li
//                   key={category._id}
//                   onMouseEnter={(event) => handleMouseEnter(category, event)}
//                   className="p-3 flex items-center justify-between hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
//                   onClick={() => handleCategoryClick(category._id)}
//                 >
//                   {category.name}
//                   <FaChevronRight className="text-gray-500" />
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* ✅ Subcategories Panel */}
//           {activeCategory && (
//             <div
//               ref={submenuRef}
//               className="absolute left-full bg-white p-4 shadow-lg rounded-md min-w-[260px] border transition-all duration-200"
//               style={{ top: `${submenuPosition}px` }}
//               onMouseEnter={handleSubmenuEnter}
//               onMouseLeave={handleMouseLeave}
//             >
//               <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
//                 {activeCategory.name}
//               </h3>
//               <ul className="space-y-1">
//                 {subcategories.map((sub) => (
//                   <li
//                     key={sub._id}
//                     className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
//                     onClick={() => handleSubCategoryClick(sub._id)}
//                   >
//                     {sub.name}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default Dropdown;












