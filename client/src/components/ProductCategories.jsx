import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error component
const ErrorMessage = ({ message }) => (
  <div className="text-center py-8">
    <div className="text-red-600 text-xl mb-2">⚠️</div>
    <p className="text-gray-600">{message}</p>
  </div>
);

// Category Card component
const CategoryCard = ({ category, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl"
  >
    <div className="relative w-full h-40 bg-gray-50 p-4 overflow-hidden">
      <img
        src={category.img}
        alt={category.name}
        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
    </div>
    <h3 className="text-center text-md font-semibold py-4 text-gray-900 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
      {category.name}
    </h3>
  </motion.div>
);

const ProductCategories = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const defaultCategories = [
    { id: "67afffa3e4667bfb97e2b24d", name: "Air Conditioners", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372633/AC_k4c1uj.webp" },
    { id: "67afffa3e4667bfb97e2b24f", name: "LED TVs", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372634/led_tv_mcrr4k.webp" },
    { id: "67afffa3e4667bfb97e2b258", name: "Built in Ovens", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372635/Oven_hjsmlk.webp" },
    { id: "67affa77cf40bd9eb2b13285", name: "Refrigerators", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372635/Refrigators_dsr1m7.webp" },
    { id: "67afffa3e4667bfb97e2b252", name: "Washing Machines", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372636/washing_machine_we6haj.webp" },
    { id: "67afffa3e4667bfb97e2b250", name: "Water Dispensers", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372636/water_dispensar_aylvnv.webp" },
    { id: "67afffa3e4667bfb97e2b25c", name: "Deep Freezers", img: ".https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372633/deep_freezer_gmgbyx.webp" },
    { id: "67afffa3e4667bfb97e2b251", name: "Kitchen Appliances", img: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372634/k_app_hzanrp.webp" },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        // Here you would typically fetch categories from your API
        // For now, we'll use the default categories
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        setCategories(defaultCategories);
      } catch (err) {
        setError("Failed to load categories. Please try again later.");
        console.error("Error loading categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleGetCategory = (categoryId, name) => {
    try {
      navigate(`/products/category/${categoryId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to category. Please try again.");
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide mb-4">
            All Categories
          </h1>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>

        {/* Category Cards Grid */}
        <Suspense fallback={<LoadingSpinner />}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleGetCategory(category.id, category.name)}
                />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </section>
  );
};

export default ProductCategories;







// import React from "react";

// const ProductCategories = () => {
//   const categories = [
//     { name: "Air Conditioners", img: "./src/assets/category/AC.jpg" },
//     { name: "LED TVs", img: "./src/assets/category/led tv.jpg" },
//     { name: "Built in Ovens", img: "./src/assets/category/Oven.jpg" },
//     { name: "Refrigerators", img: "./src/assets/category/Refrigators.jpg" },
//     { name: "Washing Machines", img: "./src/assets/category/washing machine.jpg" },
//     { name: "Water Dispensers", img: "./src/assets/category/water dispensar.jpg" },
//     { name: "Air Coolers", img: "./src/assets/category/Air Cooler.jpg" },
//     { name: "Air Fryers", img: "./src/assets/category/Air Fryers.jpg" },
//     { name: "Deep Freezers", img: "./src/assets/category/deep freezer.jpg" },
//     { name: "Kitchen Hoods", img: "./src/assets/category/hood.jpg" },
//     { name: "Kitchen Hobs", img: "./src/assets/category/kichen hob.jpg" },
//     { name: "Kitchen Appliances", img: "./src/assets/category/k app.jpg" },
//   ];

//   return (
//     <>
//     <h1 className="flex justify-center text-2xl font-bold">ALL CATEGORIES</h1>
//     <div className="line h-[2px] w-[80%] mx-auto bg-gray-300 my-5  "></div>
   
//     <div className="container bg-gray-100 mx-auto px-4 py-8">
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//         {categories.map((category, index) => (
//           <div
//             key={index}
//             className="flex flex-col items-center text-center space-y-2"
//           >
//             <img
//               src={category.img}
//               alt={category.name}
//               className="w-34 h-34 object-contain"
//             />
//             <h3 className="text-sm font-medium">{category.name}</h3>
//           </div>
//         ))}
//       </div>
//     </div>
//     </>
//   );
// };

// export default ProductCategories;

