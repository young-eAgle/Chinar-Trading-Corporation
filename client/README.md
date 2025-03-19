# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"; // To get the product ID from the URL
import { Button, Rating } from "@mui/material";
import { FaChevronDown, FaChevronUp, FaHeart } from "react-icons/fa";
import { BsCart3 } from "react-icons/bs";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";

const ProductDetail = () => {
  const { id } = useParams(); // Get the product ID from URL params
  const [product, setProduct] = useState(null);
  const [wishListed, setWishListed] = useState(false);
  const [countValue, setCountValue] = useState(1);
  const [activeTab, SetActiveTab] = useState(0);

    const handleActive = (number) => {
      SetActiveTab(number);
    };

  // Fetch product details on component mount
  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((response) => response.json())
      .then((data) => setProduct(data))
      .catch((error) => console.error("Error fetching product details:", error));
  }, [id]);

  if (!product) {
    return <div>Loading product details...</div>;
  }

  const handleWishList = () => {
    setWishListed(!wishListed);
    console.log("Wishlisted!");
  };

  const plushandle = () => {
    setCountValue(countValue + 1);
  };

  const minushandle = () => {
    if (countValue > 1) {
      setCountValue(countValue - 1);
    }
  };

  return (
    <section className="detailsPage">
      <div className="detail-container">
        {/* Breadcrumbs */}
        <div className="breadCrumbWrapper">
          <ul className="breadCrumb flex gap-4 ml-16 py-4 -mt-2">
            <li>
              <a href="" className="text-gray-500">
                Home
              </a>
            </li>
            <li>
              <a href="" className="text-gray-500">
                {product.categoryId.name}
              </a>
            </li>
            <li>
              <a href="">
                {product.subcategoryId.name}
              </a>
            </li>
          </ul>
        </div>

        <div className="details">
          <div className="detail-left flex justify-center gap-16 mt-5">
            {/* Product Zoom */}
           
            <div className="left-part1 product-zoom w-120 h-auto border border-gray-200 rounded-xl">
              <InnerImageZoom
                className="rounded-xl w-full h-full"
                zoomType="hover"
                src={product.imageUrl}
                zoomSrc={product.imageUrl}
              />
            </div>

            {/* Product Info */}
            <div className="left-part2 product-info w-[45vw] pl-3 mt-2">
              <h3 className="text-xl font-bold">{product.name}</h3>
              <div className="product-price">
                <h2 className="line-through text-black text-5xl">Rs.{product.actualPrice}</h2>
                <h2 className="text-red-600 font-bold text-5xl">Rs.{product.discountedPrice}</h2>
              </div>

              {/* Product Rating */}
              <div className="product-rating py-3 flex gap-3">
                <Rating value={3.5} precision={0.5} readOnly />
                <span className="text-gray-400">(24 reviews)</span>
              </div>

              {/* Product Brand */}
              <div className="brand text-xl pt-3">
                Brand: <span className="font-bold">{product.brand}</span>
              </div>

              {/* Product Availability */}
              <div className="availability text-xl pt-2">
                Availability: <span className="font-bold">{product.available ? "In Stock" : "Out of Stock"}</span>
              </div>

              {/* Quantity and Add to Cart Button */}
              <div className="buttons flex items-center gap-6 mt-5">
                <div className="quantity flex gap-8 items-center justify-center border-2 border-blue-300 px-8 py-2 rounded">
                  <input type="number" value={countValue} className="outline-none w-5 quantity-count" />
                  <div className="updown-btns flex flex-col gap-2 text-blue-700">
                    <FaChevronUp onClick={plushandle} size={12} />
                    <FaChevronDown onClick={minushandle} size={12} />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="addToCart-Btn cursor-pointer">
                  <BsCart3 size={25} />
                  <button>Add to Cart</button>
                </div>

                {/* Wishlist Button */}
                <div onClick={handleWishList} className="wishList-btn cursor-pointer">
                  {wishListed ? <FaHeart size={31} /> : <FaHeart size={31} />}
                </div>
              </div>
            </div>
          </div>

          {/* Description Tabs */}
          <div className="description-tabs w-[70vw] flex">
            <ul className="flex gap-20">
              <li><Button onClick={() => setActiveTab(0)}>Description</Button></li>
              <li><Button onClick={() => setActiveTab(1)}>Additional Info</Button></li>
              <li><Button onClick={() => setActiveTab(2)}>Reviews(3)</Button></li>
            </ul>
          </div>

          {/* Tab Contents */}
          <div className="description-content">
            {activeTab === 0 && <p>{product.description}</p>}
            {activeTab === 1 && <p>{product.details}</p>}
            {activeTab === 2 && <p>Reviews will go here...</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;



  {/* Location Dropdown */}
        <div className="mb-6  border rounded-md px-4 ">
            <label className="block text-[12px] pt-1 font-medium text-gray-300 ">
              Your Location
            </label>
            <select
              className="block w-full  pb-1  text-[#223994] "
            >
              <option className="   "  >Select a Location</option>
              <option>Location 1</option>
              <option>Location 2</option>
            </select>
          </div>











          