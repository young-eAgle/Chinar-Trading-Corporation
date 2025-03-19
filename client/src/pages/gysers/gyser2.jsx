

import React, { useEffect, useState } from "react";
import { BsArrowsFullscreen } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaChevronCircleRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "../gysers/gyser.css";
import { useCart } from "../cart Page/cartContext";
import axios from "axios";
import { Co2Sharp } from "@mui/icons-material";

const ProductCard = ({ item }) => {
  const [wishListed, setWishListed] = useState(false);
  const { addToCart } = useCart();

  const handleWishList = () => {
    setWishListed(!wishListed);
    console.log("Wishlisted!");
  };
  {
    /* w-full h-full inline-block overflow-x-scroll scroll whitespace-nowrap scroll-smooth */
  }
  return (
    <div className="card-container card-slider flex items-center justify-center   ">
      {/* hover:bg-white transition-transform  duration-300 transform   will-change-transform  */}

      <div className="card  w-[220px] sm:w-[240px] lg:w-[260px]  border border-gray-300 bg-gray-950 hover:bg-white rounded-lg shadow-md transition-transform  duration-300 transform   will-change-transform flex-shrink-0 hover:shadow-lg group hover:z-50 overflow-hidden h-[340px] hover:h-[400px] ">
        {/* Discount Badge */}
        {item.discount && (
          <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            {item.discount}%
          </div>
        )}

        {/* Wishlist and Quick View */}
        <div className="whishlist-quickview-container absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100">
          <div className="quick-view hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
            <BsArrowsFullscreen />
          </div>
          <div
            onClick={handleWishList}
            className="wish-list hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
          >
            {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
          </div>
        </div>

        {/* Product Image */}
        <div className="product-img bg-white flex justify-center my-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-36 h-36 object-contain cursor-pointer rounded bg-transparent"
          />
        </div>

        {/* Company Name */}
        <div className="company_name text-gray-400 text-sm text-center my-1">
          <h4>{item.brand}</h4>
        </div>

        {/* Product Name */}
        <div className="product-name text-center px-4 my-3 flex justify-center items-center text-wrap text-white group-hover:text-black ">
          <h3 className="text-lg font-medium cursor-pointer  ">{item.name}</h3>
        </div>

        {/* Price Section */}
        <div className="price flex gap-3 justify-center items-center my-3">
          { (
            <h4 className="line-through text-gray-400 text-sm">
              Rs {item.actualPrice}
            </h4>
          )}
          <h2 className=" text-amber-300 group-hover:text-red-600 font-semibold">
            Rs {item.price}
          </h2>
        </div>

        {/* Add to Cart Button */}
        <div className="addToCart-Btn absolute transition-opacity duration-1000 hidden group-hover:block bottom-2 left-[27px]  my-3">
          <button
            onClick={() => addToCart({ ...item, quantity: 1 })}
            className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-2 rounded-3xl text-sm transition hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const Gyser = ({ title }) => {
  const [products, setProducts] = useState([]);
  const slideLeft = () => {
    let slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 1100;
  };

  const slideRight = () => {
    let slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 1100;
  };

  useEffect(() => {
    axios
      .get("http://46.202.166.65/products/category/67afffa3e4667bfb97e2b24e")
      .then((response) => {
        setProducts(response.data);
        console.log("This is Response:", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    //  console.log("These are our Products:",products);

    //  This is Second Method to Fetch dAta
    //  async function fetchProducts() {

    //   const products = await axios.get("http://localhost:5000/products/category/67afffa3e4667bfb97e2b24e")
    //    console.log("Async Function data:", products);

    //  }
    //  fetchProducts();
  }, []);

  // ✅ Log after state updates
  useEffect(() => {
    console.log("Updated products:", products);
  }, [products]); // Runs whenever `products` changes

  // const products = [
  //   {
  //     company: "Dawlance",
  //     name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
  //     originalPrice: 28500,
  //     discountedPrice: 23500,
  //     discount: 23,
  //     image: "./src/assets/products/Ac.jpg",
  //   },
  //   {
  //     company: "Samsung",
  //     name: "Samsung 4K UHD Smart TV",
  //     originalPrice: 120000,
  //     discountedPrice: 100000,
  //     discount: 17,
  //     image: "./src/assets/products/led tv.jpg",
  //   },
  //   {
  //     company: "Apple",
  //     name: "Apple iPhone 13 Pro Max",
  //     originalPrice: 270000,
  //     discountedPrice: 250000,
  //     discount: 8,
  //     image: "./src/assets/products/Refrigator.jpg",
  //   },
  //   {
  //     company: "Sony",
  //     name: "Sony Noise Cancelling Headphones",
  //     originalPrice: 35000,
  //     discountedPrice: 31000,
  //     discount: 11,
  //     image: "./src/assets/products/washing_machine.jpg",
  //   },
  //   {
  //     company: "Dawlance",
  //     name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
  //     originalPrice: 28500,
  //     discountedPrice: 23500,
  //     discount: 23,
  //     image: "./src/assets/products/Ac.jpg",
  //   },
  //   {
  //     company: "Samsung",
  //     name: "Samsung 4K UHD Smart TV",
  //     originalPrice: 120000,
  //     discountedPrice: 100000,
  //     discount: 17,
  //     image: "./src/assets/products/led tv.jpg",
  //   },
  //   {
  //     company: "Apple",
  //     name: "Apple iPhone 13 Pro Max",
  //     originalPrice: 270000,
  //     discountedPrice: 250000,
  //     discount: 8,
  //     image: "./src/assets/products/Refrigator.jpg",
  //   },
  //   {
  //     company: "Sony",
  //     name: "Sony Noise Cancelling Headphones",
  //     originalPrice: 35000,
  //     discountedPrice: 31000,
  //     discount: 11,
  //     image: "./src/assets/products/washing_machine.jpg",
  //   },
  // ];

  const settings = {
    dots: false, // Show navigation dots
    infinite: true, // Infinite loop
    speed: 500, // Animation speed
    slidesToShow: 5, // Number of visible slides
    slidesToScroll: 1, // Number of slides to scroll per action
    autoplay: true, // Enable autoplay
    autoplaySpeed: 2000, // Time between slides
  };

  return (
    <>
      <div className="title my-5 flex gap-3 items-center justify-center  p-8 mb-9">
        <div className="left-slide h-1 w-24 bg-gray-900 rounded "></div>
        <div className="heading">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="right-slide h-1 w-24 bg-gray-900 rounded"></div>
      </div>

      {/* <div className="slider-container w-full h-auto  flex items-center bg-gray-500"
      > */}
      {/* <div className="left text-4xl cursor-pointer px-3">
        <  FaChevronCircleLeft onClick={slideLeft} />
        </div> */}

      {/* <div
          id="slider"
          className="slider     "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        > */}

      <div
        className="card-slider-container slider-container ml-19 w-[90.5%] h-[400px]   "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Slider {...settings}>
          {products.map((product, index) => (
            <ProductCard key={index} item={product} />
          ))}

          {/* {products.map((product, index)=>{

            return(
              <div key={index} className="product">
                {product}
              </div>
            )

          })} */}

          {/* 
            <div className="  h-120 bg-amber-500  border-2 border-purple-600">
              <h1 className="text-black">One</h1>
            </div>

            
            <div className="  h-120 bg-amber-500  border-2 border-green-600">
              <h1 className="text-black">TWO</h1>
            </div>
            
            <div className="  h-120 bg-amber-500 border-2 border-gray-700">
              <h1 className="text-black">Three</h1>
            </div>
            <div className="  h-120 bg-amber-500  border-2 border-purple-600">
              <h1 className="text-black">One</h1>
            </div>

            
            <div className="  h-120 bg-amber-500  border-2 border-green-600">
              <h1 className="text-black">TWO</h1>
            </div>
            
            <div className="  h-120 bg-amber-500  border-2 border-gray-700">
              <h1 className="text-black">Three</h1>
            </div> */}
        </Slider>
      </div>

      {/* </div> */}

      {/* <div className="right text-4xl cursor-pointer px-3">
            <FaChevronCircleRight onClick={slideRight} />
        </div> */}

      {/* </div> */}
    </>
  );
};

// export default Gyser;



























// import React, { useState } from "react";
// import { BsArrowsFullscreen } from "react-icons/bs";
// import { CiHeart } from "react-icons/ci";
// import { FaHeart } from "react-icons/fa";
// import { FaChevronCircleLeft } from "react-icons/fa";
// import { FaChevronCircleRight } from "react-icons/fa";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import Slider from "react-slick";

// const ProductCard = ({ item }) => {
//   const [wishListed, setWishListed] = useState(false);

//   const handleWishList = () => {
//     setWishListed(!wishListed);
//     console.log("Wishlisted!");
//   };
//   {
//     /* w-full h-full inline-block overflow-x-scroll scroll whitespace-nowrap scroll-smooth */
//   }
//   return (
//     <div className="card-container card-slider    ">

     

//       <div className="card  w-[220px] sm:w-[240px] lg:w-[260px]  border border-gray-300 bg-gray-950 hover:bg-white rounded-lg shadow-md transition-transform  duration-300 transform   will-change-transform flex-shrink-0 hover:shadow-lg group hover:z-50 overflow-hidden h-[340px] hover:h-[400px]  ">
//         {/* Discount Badge */}
//         {item.discount && (
//           <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
//             {item.discount}%
//           </div>
//         )}

//         {/* Wishlist and Quick View */}
//         <div className="whishlist-quickview-container absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100">
//           <div className="quick-view hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
//             <BsArrowsFullscreen />
//           </div>
//           <div
//             onClick={handleWishList}
//             className="wish-list hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
//           >
//             {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
//           </div>
//         </div>

//         {/* Product Image */}
//         <div className="product-img flex justify-center my-4">
//           <img
//             src={item.image}
//             alt={item.name}
//             className="w-36 h-36 object-contain cursor-pointer"
//           />
//         </div>

//         {/* Company Name */}
//         <div className="company_name text-gray-400 text-sm text-center my-1">
//           <h4>{item.company}</h4>
//         </div>

//         {/* Product Name */}
//         <div className="product-name text-center px-4 my-3 flex justify-center items-center text-wrap text-white group-hover:text-black ">
//           <h3 className="text-lg font-medium cursor-pointer  ">{item.name}</h3>
//         </div>

//         {/* Price Section */}
//         <div className="price flex gap-3 justify-center items-center my-3">
//           {item.originalPrice && (
//             <h4 className="line-through text-gray-400 text-sm">
//               Rs {item.originalPrice.toLocaleString()}
//             </h4>
//           )}
//           <h2 className=" text-amber-300 group-hover:text-red-600 font-semibold">
//             Rs {item.discountedPrice.toLocaleString()}
//           </h2>
//         </div>

//         {/* Add to Cart Button */}
//         <div className="addToCart-Btn absolute transition-opacity duration-1000 hidden group-hover:block bottom-2 left-[27px]  my-3">
//           <button className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
//             Add to Cart
//           </button>
//         </div>
//       </div>
    

//     </div>
//   );
// };

// const Gyser = () => {
//   const slideLeft = () => {
//     let slider = document.getElementById("slider");
//     slider.scrollLeft = slider.scrollLeft - 1100;
//   };

//   const slideRight = () => {
//     let slider = document.getElementById("slider");
//     slider.scrollLeft = slider.scrollLeft + 1100;
//   };

//   const products = [
//     {
//       company: "Dawlance",
//       name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
//       originalPrice: 28500,
//       discountedPrice: 23500,
//       discount: 23,
//       image: "./src/assets/products/Ac.jpg",
//     },
//     {
//       company: "Samsung",
//       name: "Samsung 4K UHD Smart TV",
//       originalPrice: 120000,
//       discountedPrice: 100000,
//       discount: 17,
//       image: "./src/assets/products/led tv.jpg",
//     },
//     {
//       company: "Apple",
//       name: "Apple iPhone 13 Pro Max",
//       originalPrice: 270000,
//       discountedPrice: 250000,
//       discount: 8,
//       image: "./src/assets/products/Refrigator.jpg",
//     },
//     {
//       company: "Sony",
//       name: "Sony Noise Cancelling Headphones",
//       originalPrice: 35000,
//       discountedPrice: 31000,
//       discount: 11,
//       image: "./src/assets/products/washing_machine.jpg",
//     },
//     {
//       company: "Dawlance",
//       name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
//       originalPrice: 28500,
//       discountedPrice: 23500,
//       discount: 23,
//       image: "./src/assets/products/Ac.jpg",
//     },
//     {
//       company: "Samsung",
//       name: "Samsung 4K UHD Smart TV",
//       originalPrice: 120000,
//       discountedPrice: 100000,
//       discount: 17,
//       image: "./src/assets/products/led tv.jpg",
//     },
//     {
//       company: "Apple",
//       name: "Apple iPhone 13 Pro Max",
//       originalPrice: 270000,
//       discountedPrice: 250000,
//       discount: 8,
//       image: "./src/assets/products/Refrigator.jpg",
//     },
//     {
//       company: "Sony",
//       name: "Sony Noise Cancelling Headphones",
//       originalPrice: 35000,
//       discountedPrice: 31000,
//       discount: 11,
//       image: "./src/assets/products/washing_machine.jpg",
//     },
//   ];

//   const settings = {
//     dots: true, // Show navigation dots
//     infinite: true, // Infinite loop
//     speed: 500, // Animation speed
//     slidesToShow: 10, // Number of visible slides
//     slidesToScroll: 1, // Number of slides to scroll per action
//     autoplay: true, // Enable autoplay
//     autoplaySpeed: 2000, // Time between slides
//   };

//   return (
//     <>
//       <div className="title my-5 flex gap-3 items-center justify-center">
//         <div className="left-slide h-1 w-24 bg-gray-900 rounded "></div>
//         <div className="heading">
//           <h1 className="text-3xl font-bold">Geysers</h1>
//         </div>
//         <div className="right-slide h-1 w-24 bg-gray-900 rounded"></div>
//       </div>

//       <div className="slider-container relative flex items-center">
//         {/* <div className="left text-4xl cursor-pointer px-3">
//         <  FaChevronCircleLeft onClick={slideLeft} />
//         </div> */}

//         <div
//           id="slider"
//           className="slider flex items-center w-full h-full gap-4 overflow-x-auto whitespace-nowrap scroll-smooth p-4 "
//           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//         >
//           <Slider {...settings}>
//           {products.map((item, index) => (
//             <div className="w-[220px] sm:w-[240px] lg:w-[260px]  mx-[1px]">
//               {" "}
//               {/* Keep same width */}
//                 <ProductCard key={index} item={item} />
//             </div>
//           ))}
//           </Slider>
//         </div>

//         {/* <div className="right text-4xl cursor-pointer px-3">
//             <FaChevronCircleRight onClick={slideRight} />
//         </div> */}
//       </div>
//     </>
//   );
// };

// export default Gyser;



import React, { useState, useEffect, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dropdown = ({ isOpen, setIsOpen }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(0);
  const [categoryId, setCategoryId] = useState(null);

  const dropdownRef = useRef(null);
  const submenuRef = useRef(null);
  const hoverTimeout = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch categories
  useEffect(() => {
    axios
      .get("http://46.202.166.65/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // ✅ Fetch subcategories when a category is hovered
  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(`http://46.202.166.65/subcategories/category/${categoryId}`)
      .then((response) => {
        setSubcategories(response.data);
      })
      .catch((error) => console.error("Error fetching subcategories:", error));
  }, [categoryId]);

  // ✅ Handle category hover
  const handleMouseEnter = (category, event) => {
    clearTimeout(hoverTimeout.current);
    setActiveCategory(category);
    setCategoryId(category._id);

    if (dropdownRef.current && submenuRef.current) {
      const hoveredItem = event.target;
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const hoveredRect = hoveredItem.getBoundingClientRect();
      const submenuHeight = submenuRef.current.offsetHeight;
      const screenHeight = window.innerHeight;

      let calculatedTop = hoveredRect.top - dropdownRect.top;

      // ✅ Prevent submenu from going off-screen at bottom
      if (hoveredRect.bottom + submenuHeight > screenHeight) {
        calculatedTop = Math.max(screenHeight - dropdownRect.top - submenuHeight - 10, 0);
      }

      // ✅ Prevent submenu from going off-screen at right
      const submenuWidth = submenuRef.current.offsetWidth;
      const screenWidth = window.innerWidth;
      let leftPosition = dropdownRect.right;

      if (leftPosition + submenuWidth > screenWidth) {
        leftPosition = dropdownRect.left - submenuWidth - 10;
      }

      submenuRef.current.style.left = `${leftPosition}px`;
      setSubmenuPosition(calculatedTop);
    }
  };

  // ✅ Delayed closing to prevent flickering
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  // ✅ Prevent submenu from closing when hovered
  const handleSubmenuEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  // ✅ Click-away listener (Works ANYTIME dropdown is open)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]); // Runs whenever `isOpen` changes

  const handleCategoryClick = (categoryId) => {
    navigate(`/products/category/${categoryId}`);
    setIsOpen(false);
  };

  const handleSubCategoryClick = (subcategoryId) => {
    navigate(`/products/subcategory/${subcategoryId}`);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed left-10 bg-white shadow-lg rounded-md z-50 flex flex-col border p-1 transition-all duration-300 text-sm"
          ref={dropdownRef}
        >
          {/* ✅ Categories List */}
          <div className="w-[220px] bg-white">
            <ul className="space-y-1">
              {categories.map((category) => (
                <li
                  key={category._id}
                  onMouseEnter={(event) => handleMouseEnter(category, event)}
                  className="px-3 py-1 flex items-center justify-between hover:bg-blue-100 rounded-md cursor-pointer transition-all duration-200 text-xs"
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <span className="font-medium">{category.name}</span>
                  <FaChevronRight className="text-gray-500 text-xs" />
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Subcategories Panel */}
          {activeCategory && (
            <div
              ref={submenuRef}
              className="absolute bg-white p-3 shadow-md rounded-md min-w-[180px] border transition-all duration-200 text-xs"
              style={{ top: `${submenuPosition}px` }}
              onMouseEnter={handleSubmenuEnter}
              onMouseLeave={handleMouseLeave}
            >
              <h3 className="text-sm font-semibold text-blue-600 border-b pb-1 mb-1">
                {activeCategory.name}
              </h3>
              <ul className="space-y-1">
                {subcategories.length > 0 ? (
                  subcategories.map((sub) => (
                    <li
                      key={sub._id}
                      className="p-1 hover:bg-blue-100 rounded-md cursor-pointer transition-all duration-200"
                      onClick={() => handleSubCategoryClick(sub._id)}
                    >
                      {sub.name}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-xs p-1">No subcategories</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Dropdown;
