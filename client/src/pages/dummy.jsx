// import React, { useState } from "react";
// import { BsArrowsFullscreen } from "react-icons/bs";
// import { CiHeart } from "react-icons/ci";
// import { FaHeart } from "react-icons/fa";

// const Card = () => {
//   const [wishListed, setWishListed] = useState(false);

//   const handleWishList = () => {
//     setWishListed(!wishListed);
//     console.log("Wishlisted!");
//   };

//   return (
//     <div className="card-container flex bg-gray-400   mx-auto w-[90%]">
//       {/* Card Start */}
//       <div className="card border relative border-gray-300 w-65 h-100  bg-gray-200 hover:bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group hover:z-500 overflow-hidden">
//         {/* Discount Badge */}
//         <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
//           23%
//         </div>

//         {/* Wishlist and Quick View */}
//         <div className="whishlist-quickview-container  absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100 ">
//           {/* Quick View */}
//           <div className="quick-view hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
//             <BsArrowsFullscreen />
//           </div>

//           {/* Wishlist */}
//           <div
//             onClick={handleWishList}
//             className="wish-list hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
//           >
//             {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
//           </div>
//         </div>

//         {/* Product Image */}
//         <div className="product-img flex justify-center my-4 ">
//           <img 
//             src="./src/assets/products/Ac.jpg"
//             alt="Product"
//             className="w-45 h-45 object-contain cursor-pointer"
//           />
//         </div>

//         {/* Company Name */}
//         <div className="company_name text-gray-400 text-sm text-center">
//           <h4>Dawlance</h4>
//         </div>

//         {/* Product Name */}
//         <div className="product-name text-center px-4">
//           <h3 className="text-lg font-medium cursor-pointer">
//             Kenwood Split AC Inverter 1.5 Ton KEA-1864S
//           </h3>
//         </div>

//         {/* Price Section */}
//         <div className="price flex gap-3 justify-center items-center my-2">
//           <h4 className="line-through text-gray-400 text-sm">Rs 28,500.00</h4>
//           <h2 className="text-red-600 font-semibold ">Rs 23,500.00</h2>
//         </div>

//         {/* Add to Cart Button */}
//         <div className="addToCart-Btn flex justify-center my-3">
//           <button className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
//             Add to Cart
//           </button>
//         </div>
//       </div>
//       {/* Card End */}
//       {/* Card Start */}
//       <div className="card border relative border-gray-300 w-65 h-100  bg-gray-200 hover:bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group hover:z-500 overflow-hidden">
//         {/* Discount Badge */}
//         <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
//           23%
//         </div>

//         {/* Wishlist and Quick View */}
//         <div className="whishlist-quickview-container  absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100 ">
//           {/* Quick View */}
//           <div className="quick-view hover:bg-blue-500 bg-white text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
//             <BsArrowsFullscreen />
//           </div>

//           {/* Wishlist */}
//           <div
//             onClick={handleWishList}
//             className="wish-list hover:bg-blue-500 bg-white text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
//           >
//             {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
//           </div>
//         </div>

//         {/* Product Image */}
//         <div className="product-img flex justify-center my-4 ">
//           <img 
//             src="./src/assets/products/Ac.jpg"
//             alt="Product"
//             className="w-45 h-45 object-contain cursor-pointer"
//           />
//         </div>

//         {/* Company Name */}
//         <div className="company_name text-gray-400 text-sm text-center">
//           <h4>Dawlance</h4>
//         </div>

//         {/* Product Name */}
//         <div className="product-name text-center px-4">
//           <h3 className="text-lg font-medium cursor-pointer">
//             Kenwood Split AC Inverter 1.5 Ton KEA-1864S
//           </h3>
//         </div>

//         {/* Price Section */}
//         <div className="price flex gap-3 justify-center items-center my-2">
//           <h4 className="line-through text-gray-400 text-sm">Rs 28,500.00</h4>
//           <h2 className="text-red-600 font-semibold ">Rs 23,500.00</h2>
//         </div>

//         {/* Add to Cart Button */}
//         <div className="addToCart-Btn flex justify-center my-3">
//           <button className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
//             Add to Cart
//           </button>
//         </div>
//       </div>
//       {/* Card End */}
//     </div>
//   );
// };

// export default Card;











// Multiple Cards


import React, { useState } from "react";
import { BsArrowsFullscreen } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const [wishListed, setWishListed] = useState(false);

  const handleWishList = () => {
    setWishListed(!wishListed);
    console.log("Wishlisted!");
  };

  return (
    <div className="card border relative border-gray-300 bg-gray-200 hover:bg-white rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group hover:z-50 overflow-hidden w-full sm:w-[48%] lg:w-[30%] xl:w-[23%] mx-auto">
      {/* Discount Badge */}
      {product.discount && (
        <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
          {product.discount}%
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
      <div className="product-img flex justify-center my-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-36 h-36 sm:w-40 sm:h-40 object-contain cursor-pointer"
        />
      </div>

      {/* Company Name */}
      <div className="company_name text-gray-400 text-sm text-center">
        <h4>{product.company}</h4>
      </div>

      {/* Product Name */}
      <div className="product-name text-center px-4">
        <h3 className="text-lg font-medium cursor-pointer">{product.name}</h3>
      </div>

      {/* Price Section */}
      <div className="price flex gap-3 justify-center items-center my-2">
        {product.originalPrice && (
          <h4 className="line-through text-gray-400 text-sm">
            Rs {product.originalPrice.toLocaleString()}
          </h4>
        )}
        <h2 className="text-red-600 font-semibold">
          Rs {product.discountedPrice.toLocaleString()}
        </h2>
      </div>

      {/* Add to Cart Button */}
      <div className="addToCart-Btn flex justify-center my-3">
        <button className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-8 sm:px-12 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const Card = () => {
  const products = [
    {
      company: "Dawlance",
      name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
      originalPrice: 28500,
      discountedPrice: 23500,
      discount: 23,
      image: "./src/assets/products/Ac.jpg",
    },
    {
      company: "Samsung",
      name: "Samsung 4K UHD Smart TV",
      originalPrice: 120000,
      discountedPrice: 100000,
      discount: 17,
      image: "./src/assets/products/led tv.jpg",
    },
    {
      company: "Apple",
      name: "Apple iPhone 13 Pro Max",
      originalPrice: 270000,
      discountedPrice: 250000,
      discount: 8,
      image: "./src/assets/products/Refrigator.jpg",
    },
  ];

  return (
    <div className="card-container flex flex-wrap gap-6 justify-center bg-gray-400 mx-auto p-4">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
};

// export default Card;














import React, { act } from "react";
import { Button, Rating } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown, FaChevronUp, FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { IoMdHeartEmpty } from "react-icons/io";
import { RxShuffle } from "react-icons/rx";
import { BsCart3 } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import Gyser from "../gysers/gysers";
import { useCart } from "../cart Page/cartContext";



const DetailsPage = () => {
  const [wishListed, setWishListed] = useState(false);
  const [product, setProduct] = useState(null);
  const [countValue, setCountValue] = useState(1);
  const [activeTab, SetActiveTab] = useState(0);
  const { id } = useParams();
  // Add To Cart Functionality..
  const [showNotification, setShowNotification] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const {dispatch, cart} = useCart();

    useEffect(() => {
      // Ensure product is defined before accessing product._id
      if (product && product._id) {
        const itemInCart = cart.find((item) => item._id === product._id);
        if (itemInCart) {
          setCartItems((prev) => ({ ...prev, [product._id]: itemInCart.quantity }));
        }
      }
    }, [cart, product]);
    
  

    const handleAddToCart = () => {
      const quantity = cartItems[product._id] ?? 1;
      
      console.log("Adding to cart:", product._id, "Quantity:", quantity); // Debugging
      
      dispatch({ 
        type: "ADD_TO_CART", 
        payload: { ...product, quantity } 
      });
    
      setCartItems((prev) => ({
        ...prev,
        [product._id]: quantity, 
      }));
    
      onClose();
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleIncrease = (id) => {
      // const existingItem = cartItems[id] || 0;
      setCartItems((prev) => {
        const updatedQuantity = (prev[id] || 1) + 1;
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { _id: id, quantity: updatedQuantity },
        });
        return { ...prev, [id]: updatedQuantity };
      });
    };
  
    const handleDecrease = (id) => {
      setCartItems((prev) => {
        const updatedQuantity = Math.max((prev[id] || 1) - 1, 1);
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { _id: id, quantity: updatedQuantity },
        });
        return { ...prev, [id]: updatedQuantity };
      });
    };
  

  // Add to Cart Functionality End Here..

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((response) =>{
        console.log("This is Response:",response);
        return response.json();
      })
      .then((data) =>{

        console.log("This is Data:",data);
        setProduct(data);

      })
      .catch((error) => console.error("Error fetching product details:", error));
  }, [id]);

  if (!product) {
    return <div>Loading product details...</div>;
  }

  const handleActive = (number) => {
    SetActiveTab(number);
  };

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
    <>
      <section className="detailsPage">
        <div className="detail-container">
          <div className="breadCrumbWrapper  ">
            {/* <hr className="mt-2 text-gray-300" /> */}

            <ul className="breadCrumb flex gap-4 ml-16 py-4 -mt-2 ">
              <li>
                {" "}
                <a href="" className="text-gray-500">
                  Home
                </a>
              </li>
              <li>
                {" "}
                <a href="" className="text-gray-500">
                  <span className="pr-3">/</span>{product.categoryId.name}
                </a>
              </li>
              <li>
                {" "}
                <a href="">
                  <span className="pr-3">/</span>{product.subcategoryId.name}
                </a>
              </li>
            </ul>
          </div>
          <hr className="text-gray-300" />
          {/* Detail Page start Here! */}
          <div className="details">
            <div className="detail-left flex justify-center gap-16 mt-5  ">
              {/* Product Zoom Start Here  */}

              <div className="left-part1 product-zoom  w-[480px] h-auto   border border-gray-200 rounded-xl">
                {/* <img
                  className="w-120"
                  src="./src/assets/Product-detail/LG.jpg"
                  alt=""
                /> */}
                <InnerImageZoom
                  className="rounded-xl w-full h-full object-cover bg-green-400"
                  zoomType="hover"
                  src={product.imageUrl}
                  zoomSrc={product.imageUrl}
                />
                {/* <InnerImageZoom
                  className="rounded-xl w-full h-full  bg-green-400"
                  zoomType="hover"
                  src="../src/assets/Product-detail/dell.jpg"
                  zoomSrc="../src/assets/Product-detail/dell.jpg"
                />
 */}
              </div>
              {/* Product Zoom End Here  */}

              {/* Product Info Start  */}
              <div className="left-part2 product-info w-[45vw] pl-3  mt-2 gr  ">
                <div className="product-name text-wrap text-xl  font-bold ">
                  <h3>
                   {product.name}
                  </h3>
                </div>
                {/* Price Section */}
                <div className="product-price">
                  <div className="price flex gap-10  items-center my-3">
                    <h2 className="line-through text-black text-5xl">
                      Rs.{product.actualPrice}
                    </h2>

                    <h2 className="text-red-600 font-bold text-5xl">
                      Rs.{product.price}
                    </h2>
                  </div>
                </div>
                {/* Rating */}
                <div className="product-rating py-3 flex gap-3 ">
                  <Rating value={3.5} precision={0.5} readOnly />{" "}
                  <span className="text-gray-400">(24 reviews)</span>
                </div>
                {/* Save Amount */}
                <div className="savePercentage ">
                  <div className="">
                    <span className="discount pb-[6px] cursor-pointer rounded-md  bg-blue-600 px-6 py-1 text-xl font-semibold text-white">
                      {" "}
                      Save {product.discount} %
                    </span>
                  </div>
                </div>

                {/* Brand */}
                <div className="brand text-xl  pt-3">
                  Brand: <span className=" font-bold">{product.brand}</span>
                </div>

                {/* AvailAblilty */}
                <div className="brand text-xl pt-2  p">
                  Availability: <span className=" font-bold">{product.available ==true ? "In Stock" : "Out of Stock"}</span>
                </div>
                {/* Cart Buttons */}
                <div className="buttons flex items-center gap-6 mt-5">
                  {/* Quantity button */}
                  <div className="quantity flex gap-8 items-center justify-center border-2 border-blue-300 px-8 py-2 rounded  ">
                    <div className="number text-xl ">
                    <input
                    type="number"
                    value={cartItems[product._id] ?? 1}
                    className="outline-none w-5 quantity-count"
                    onChange={(e) => {
                      const newQuantity = Math.max(Number(e.target.value), 1); // Prevent negative values
                      setCartItems((prev) => ({
                        ...prev,
                        [product._id]: newQuantity,
                      }));
                    }}
                  />
                    </div>

                    <div className="updown-btns flex flex-col gap-2 text-blue-700 ">
                      <FaChevronUp
                        onClick={()=>handleIncrease(product._id)}
                        className="cursor-pointer"
                        size={12}
                      />
                      <FaChevronDown
                        onClick={()=>handleDecrease(product._id)}
                        className="cursor-pointer"
                        size={12}
                      />
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div onClick={handleAddToCart} className="addToCart-Btn   cursor-pointer transition duration-1000 flex items-center gap-2   my-3 border-blue-300 border-2 hover:border-white text-blue-700 font-semibold hover:text-white px-23 py-3 rounded   hover:bg-blue-700">
                    <BsCart3 size={25} />
                    <button className="">Add to Cart</button>
                  </div>
                  {/* Wisht List Button */}

                  <div
                    onClick={handleWishList}
                    className="wishList-btn  flex items-center justify-center py-2 rounded border-2 hover:text-white border-blue-300 w-20 hover:bg-blue-700 hover:border-white cursor-pointer transition duration-1000 "
                  >
                    {wishListed ? (
                      <FaHeart className="text-black" size={31} />
                    ) : (
                      <IoMdHeartEmpty size={31} />
                    )}
                  </div>
                  {/* Compare Section */}
                  <div className="compare-btn flex items-center justify-center py-2   rounded border-2 hover:text-white hover:bg-blue-700 hover:border-white border-blue-300 w-20 cursor-pointer transition duration-1000 ">
                    <RxShuffle size={31} />
                  </div>
                </div>

                {/* Buy it Now Button */}
                <div className="addToCart-Btn flex items-center justify-center transition duration-1000  bottom-2 my-3 border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-3 rounded-3xl text-sm  hover:bg-blue-700">
                  <button className="  font-bold">Buy It Now</button>
                </div>

                {/* Order On Whatsapp Button */}
                <div className="addToCart-Btn flex items-center justify-center gap-2 transition duration-1000  bottom-2 my-3 border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-16 py-3 rounded-3xl text-sm hover:border-white  hover:bg-green-700">
                  <FaWhatsapp size={22} />
                  <button className="">Order On Whatsapp</button>
                </div>
              </div>
              {/* Product Info End!  */}
            </div>

            <div className="detail-right"></div>
          </div>
          {/* Detail Page End Here! */}

          <div className="description w-[92vw] mt-5 mx-auto h-auto border-2 border-gray-300 rounded py-4">
            <div className="description-tabs">
              <div className="customTabs w-[70vw] flex   ">
                <ul className="flex  gap-20">
                  <li>
                    <Button onClick={() => handleActive(0)}>Description</Button>
                  </li>
                  <li>
                    <Button onClick={() => handleActive(1)}>
                      Additional Info
                    </Button>
                  </li>
                  <li>
                    <Button onClick={() => handleActive(2)}>Reviews(3)</Button>
                  </li>
                </ul>
              </div>
              {/* First Tab */}

              {activeTab === 0 && (
                <div className="description pl-10 py-5 pr-8">
                  <p className="">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ipsa, nobis vitae consequuntur minima doloribus odio ea
                    facilis architecto perferendis dolore exercitationem nostrum
                    tempore suscipit, qui, recusandae dicta! Quos maiores sint
                    ipsa dolore est quam. Autem voluptas ab suscipit est ullam
                    magni tenetur doloremque debitis sit laudantium, harum quos
                    excepturi in! Quod atque fugit, harum quibusdam obcaecati
                    facere, quis quasi nisi blanditiis saepe impedit! Nam iusto
                    soluta sapiente repudiandae eos unde incidunt in labore
                    necessitatibus modi! Deserunt amet distinctio nisi, placeat
                    alias deleniti, obcaecati sapiente accusantium blanditiis at
                    laudantium quo, asperiores quibusdam quod? Iusto tempora ea
                    magnam quis laborum obcaecati repellendus quos neque
                    deserunt perferendis sequi perspiciatis at, sapiente
                    asperiores a sunt aspernatur maiores libero aperiam dolor
                    quasi temporibus incidunt. Quisquam, doloremque ex corporis
                    culpa numquam nisi totam aliquid doloribus beatae modi nam
                    enim, veritatis excepturi maiores alias ea fuga ad deleniti
                    minima vel aut quis dolorum facilis eaque. Deleniti, fugiat
                    nemo ut, beatae molestiae atque similique quisquam
                    voluptatem maxime nihil, alias veritatis inventore velit
                    minima dolores necessitatibus molestias totam recusandae.
                    Repudiandae earum soluta similique illo. Fuga, ex eos.
                    Tempore sed, perspiciatis perferendis nesciunt provident
                    omnis optio reiciendis culpa sequi vitae amet cumque alias
                    nihil odit
                  </p>
                  <h2 className="text-3xl">Custom Information</h2>
                  <p>
                    inventore similique hic, quasi molestias dicta commodi nulla
                    asperiores. Beatae sapiente omnis consequuntur accusamus
                    excepturi, temporibus cum suscipit natus fugiat eaque
                    tempora libero maiores, sint placeat aliquid optio, dolorum
                    velit modi? Voluptate molestiae quos suscipit animi
                    consectetur voluptatum est nesciunt soluta nulla, enim iure
                    eum, autem ea quasi doloremque commodi ipsum, corrupti
                    debitis sequi architecto veritatis obcaecati tempore
                    explicabo ratione! Quas rem culpa enim. Sed similique
                    veritatis beatae expedita mollitia id aperiam reprehenderit
                    temporibus pariatur, quia voluptas. Animi natus unde officia
                    possimus illo, aliquid fugiat minima repudiandae incidunt
                    earum magnam doloremque, quia consectetur similique ea non
                    perferendis qui expedita, dolorum quas? Fugiat reprehenderit
                    fuga a architecto eligendi. Reiciendis sunt sequi facilis
                    debitis quam distinctio ipsa ad, harum officia assumenda
                    illo iste esse dignissimos dolorum voluptas. Iste facere
                    aliquid vel alias animi minima fugiat iure enim odit nulla
                    accusamus, dignissimos harum libero asperiores quos
                    laboriosam quaerat fuga magni officia velit. Enim
                    repellendus perferendis asperiores voluptas quasi dolor, ut
                    vel voluptates? Molestiae culpa harum, exercitationem in
                    suscipit voluptates corporis, natus, sit doloremque
                    consectetur voluptatem maiores dolor! Harum beatae iure
                    tenetur quo quae error, et perspiciatis maxime sint esse,
                    sit necessitatibus corrupti, doloribus veritatis quibusdam
                    eligendi odio? Ratione nesciunt ullam odio consequatur odit,
                    nihil rem nemo eveniet, numquam nisi tempora sit deserunt
                    dicta optio voluptates dolore soluta perspiciatis accusamus
                    ad veniam. Quia repellendus doloremque debitis aut,
                    laboriosam asperiores facilis amet, aliquam laborum fuga
                    nobis aperiam harum accusantium obcaecati minus eligendi
                    nostrum saepe? Assumenda sint vel repellat debitis, velit
                    enim saepe corrupti qui dicta earum ipsum vitae ad rem
                    perspiciatis quia eius sed tempore.
                  </p>
                </div>
              )}

              {/* Second Tab */}
              {activeTab === 1 && (
                <div className="description pl-10 py-5 pr-8">
                  <div className="table-responsive">
                    <table className="table-auto border-collapse border border-gray-300 w-full">
                      <tbody>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">Brand</th>
                          <td className="border border-gray-300 p-2">
                            <p>LG</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Model Name
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>FHB1208Z2M</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">SKU</th>
                          <td className="border border-gray-300 p-2">
                            <p>32.5″L x 24″W x 18.5″H</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Capacity
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>8 Kg</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">Type</th>
                          <td className="border border-gray-300 p-2">
                            <p>Fully Automatic Front Load Washing Machine</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Display Type
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>Dial + Full Touch Buttons & LED Display</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">Color </th>
                          <td className="border border-gray-300 p-2">
                            <p>Middle Black</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Other Body Features
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>
                              Black Tinted Round PC Cover| Door Lock Indications
                            </p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">Spin</th>
                          <td className="border border-gray-300 p-2">
                            <p>1200/1000/800/600/400/No Spin</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Country OF Origin{" "}
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>Pakistan</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Country Of Manufacturer
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>Pakistan</p>
                          </td>
                        </tr>
                        <tr className="border border-gray-300">
                          <th className="border border-gray-300 p-2">
                            Manufacturer Details
                          </th>
                          <td className="border border-gray-300 p-2">
                            <p>
                              LG Electronics Pakistan Pvt.Ltd.Plot No-90
                              Raiwaind Road Lahore Pakistan
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Third Tab */}

              {activeTab === 2 && (
                <div className="description pl-10 py-5 pr-8">
                  <h2 className="text-3xl">Let The Customers Speak For Us</h2>
                  <p className="">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ipsa, nobis vitae consequuntur minima doloribus odio ea
                    facilis architecto perferendis dolore exercitationem nostrum
                    tempore suscipit.
                  </p>
                  <h2 className="text-3xl">Customer Reviews</h2>

                  <div className="review-container flex justify-between gap-20 p-4 mx-auto">
                    <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
                      <div className="title">
                        <h1 className=" text-xl font-bold">
                          Electronics Store
                        </h1>
                      </div>
                      <div className="text-container py-1">
                        <p className="text-lg">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Sit quas ea sint iste libero fuga, in officia
                          inventore, qui, quis harum laudantium.
                        </p>
                      </div>

                      <div className="rating-review flex gap-5  py-2">
                        <Rating value={4.5} precision={0.5} />
                        <h1 className="text-gray-400">(4.5 Out of 5)</h1>
                      </div>

                      <div className="name-photo bg-white p-2 rounded flex items-center gap-1">
                        <div className="img w-15 h-15 border rounded-full">
                          <img src="" alt="" />
                        </div>
                        <div className="name    text-xl font-semibold">
                          <h1 className="text-center">Muhammad Zammad</h1>
                        </div>
                      </div>
                    </div>
                    <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
                      <div className="title">
                        <h1 className=" text-xl font-bold">
                          Electronics Store
                        </h1>
                      </div>
                      <div className="text-container py-1">
                        <p className="text-lg">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Sit quas ea sint iste libero fuga, in officia
                          inventore, qui, quis harum laudantium.
                        </p>
                      </div>

                      <div className="rating-review flex gap-5  py-2">
                        <Rating value={4.5} precision={0.5} />
                        <h1 className="text-gray-400">( 4.5 Out of 5)</h1>
                      </div>

                      <div className="name-photo bg-white p-2 rounded flex items-center gap-1">
                        <div className="img w-15 h-15 border rounded-full">
                          <img src="" alt="" />
                        </div>
                        <div className="name    text-xl font-semibold">
                          <h1 className="text-center">Muhammad Zammad</h1>
                        </div>
                      </div>
                    </div>
                    <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
                      <div className="title">
                        <h1 className=" text-xl font-bold">
                          Electronics Store
                        </h1>
                      </div>
                      <div className="text-container py-1">
                        <p className="text-lg">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Sit quas ea sint iste libero fuga, in officia
                          inventore, qui, quis harum laudantium.
                        </p>
                      </div>

                      <div className="rating-review flex gap-5  py-2">
                        <Rating value={4.5} precision={0.5} />
                        <h1 className="text-gray-400">(4.5 Out of 5)</h1>
                      </div>

                      <div className="name-photo bg-white p-2 rounded flex items-center gap-1">
                        <div className="img w-15 h-15 border rounded-full">
                          <img src="" alt="" />
                        </div>
                        <div className="name    text-xl font-semibold">
                          <h1 className="text-center">Muhammad Zammad</h1>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Add A Reveiw Section Start Here */}

                  <div className="add-review-section pl-10 py-5 pr-8">
                      <div className="add-review-container">
                        <div className="addReview-heading">
                          <h1 className="text-xl font-bold"> Add a Review</h1>
                          <Rating readOnly />
                        </div>

                        <div className="text-area  mt-5 ">

                          <textarea className="w-full border rounded p-4"placeholder="Write Comment.." name="" id=""></textarea>
                        </div>


                        <div className="name-email-input flex mt-5 gap-14  w-full">
                          <div className="name ">
                            <input type="text" placeholder="Name" className="border rounded p-[15px] w-[25vw] " />
                          </div>
                          <div className="email">
                            <input type="text" placeholder="Email" className="border rounded p-[15px] w-[25vw] " />
                          </div>
                          <div className="website">
                            <input type="text" placeholder="Website" className="border rounded p-[15px] w-[25vw]" />
                          </div>


                        </div>

                        <div className="submit-review-btn-container flex items-center justify-center w-full mt-12">
                          <Button className="submit-review-btn w-80">Submit Review</Button>
                        </div>
                      </div>
                    </div>

                    {/* Add A Reveiw Section Start Here */}
                </div>
              )}
            </div>
          </div>
    <h2></h2>
          <Gyser title={'Related Products'}/>

        </div>
      </section>

     {/* Notification Popup */}
     {showNotification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white p-3 rounded-lg shadow-lg">
          <p>“{product.name}” has been added to your cart.</p>
          <a href="/cart" className="underline">
            View cart
          </a>
        </div>
      )}

    </>
  );
};

export default DetailsPage;










const Dropdown = ({ isOpen, setIsOpen }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(0);
  const [categoryId, setCategoryId] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const submenuRef = useRef(null);
  const hoverTimeout = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch categories on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));

    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 40);
    });

    return () => window.removeEventListener("scroll", () => {});
  }, []);

  // ✅ Fetch subcategories when a category is hovered
  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(`http://localhost:5000/subcategories/category/${categoryId}`)
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

      let calculatedTop = hoveredRect.top - dropdownRect.top;

      // Prevent submenu overflow at bottom
      const screenBottom = window.innerHeight;
      if (hoveredRect.bottom + submenuHeight > screenBottom) {
        calculatedTop = Math.max(screenBottom - dropdownRect.top - submenuHeight - 10, 0);
      }

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

  // ✅ Click-away listener (Works anytime dropdown is open)
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]); // Ensure it runs whenever `isOpen` changes


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
   
        <div
          className={` fixed  left-[37px] bg-white shadow-xl rounded-[1px]    z-50 flex flex-col border border-gray-300 p-1 transition-all duration-300 text-sm ${
            scrolled ? "top-28.5" : "top-36"
          }`}
          onMouseLeave={handleMouseLeave}
          ref={dropdownRef}
        ></div>
        </>)












return (
  <div className="flex justify-center p-4 md:p-6 bg-gray-300 min-h-screen">
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left Side - Form */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Contact</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={shippingAddress.email}
          onChange={handleShippingChange}
          className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
          <span className="text-sm">Email me with news and offers</span>
        </label>

        <h2 className="text-xl font-semibold mb-4">Delivery</h2>
        <select className="w-full p-2 border rounded">
          <option>Pakistan</option>
        </select>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={shippingAddress.firstName}
            onChange={handleShippingChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={shippingAddress.lastName}
            onChange={handleShippingChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
          />
        </div>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={shippingAddress.address}
          onChange={handleShippingChange}
          className="w-full p-2 border rounded mt-3 focus:ring focus:ring-blue-300"
        />

        <input
          type="text"
          placeholder="Apartment, suite, etc. (optional)"
          className="w-full p-2 border rounded mt-3"
        />

        {/* City & Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <input type="text" name="city" value={shippingAddress.city} onChange={handleShippingChange} placeholder="City" className="p-2 border rounded focus:ring focus:ring-blue-300" />
          <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleShippingChange} placeholder="Postal Code (Optional)" className="p-2 border rounded focus:ring focus:ring-blue-300" />
        </div>

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={shippingAddress.phone}
          onChange={handleShippingChange}
          className="w-full p-2 border rounded mt-3 focus:ring focus:ring-blue-300"
        />

        {/* Billing Address */}
        <h2 className="text-xl font-semibold mt-6">Billing Address</h2>
        <label className="flex items-center gap-2 mt-2">
          <input type="radio" checked={billingSameAsShipping} onChange={() => setBillingSameAsShipping(true)} className="form-radio text-blue-600" />
          <span>Same as shipping address</span>
        </label>
        <label className="flex items-center gap-2 mt-2">
          <input type="radio" checked={!billingSameAsShipping} onChange={() => setBillingSameAsShipping(false)} className="form-radio text-blue-600" />
          <span>Use a different billing address</span>
        </label>

        {/* Conditional Billing Address Fields */}
        {!billingSameAsShipping && (
          <div className="border rounded p-4 bg-gray-100 mt-4">
            <select name="country" value={billingAddress.country} onChange={handleBillingChange} className="w-full p-2 border rounded">
              <option>Pakistan</option>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <input type="text" name="firstName" placeholder="First name" value={billingAddress.firstName} onChange={handleBillingChange} className="p-2 border rounded" />
              <input type="text" name="lastName" placeholder="Last name" value={billingAddress.lastName} onChange={handleBillingChange} className="p-2 border rounded" />
            </div>
            <input type="email" name="email" placeholder="Email" value={billingAddress.email} onChange={handleBillingChange} className="w-full p-2 border rounded mt-3" />
          </div>
        )}

        {/* Complete Order Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition">
          Complete Order
        </button>
      </div>

      {/* Right Side - Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.length === 0 ? (
          <p className="text-center text-gray-500">No items in the cart.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                <div className="flex-1">
                  <p className="font-medium text-xs">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.brand}</p>
                </div>
                <span className="font-semibold text-sm">
                  Rs {(parseFloat(item.price) * (item.quantity ?? 1)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)};
