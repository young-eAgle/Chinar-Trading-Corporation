
import React from "react";
import { useNavigate } from "react-router-dom";

const KitchenBanner = () => {
   const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/products/category/${categoryId}`);
 
  };

  const handleSubCategoryClick = (subcategoryId) => {
    navigate(`/products/subcategory/${subcategoryId}`);
  
  };



  return (
    <>
      {/* Title Section */}
      <h1 className="text-center text-3xl font-extrabold text-gray-800 uppercase tracking-wider">
        Kitchen Appliances
      </h1>
      <div className="h-[2px] w-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-500 my-4"></div>

      {/* Banner Section */}
      <div className="relative container w-full overflow-hidden">
        <img
          className="w-full object-cover"
          src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1742373169/Kitchen_Banner_w3gghm.webp"
          alt="Kitchen Appliances"
        />

        {/* Dot Container - Positioned Correctly */}
        <div className="absolute top-0 left-0 w-full h-full">
          <li onClick={()=>handleSubCategoryClick("67bdbdd24ef0ac7a003e936a")  }><Dot top="12%" left="62%"  /></li> {/* Kitchen Hood */}
          <li onClick={()=>handleCategoryClick("67afffa3e4667bfb97e2b258")}        ><Dot top="46%" left="46.2%"      /> </li>       {/* Built-In Oven */}
          <li onClick={()=>handleSubCategoryClick("67bdbdd24ef0ac7a003e936a")}     ><Dot top="53%" left="62%"        /> </li>      {/* Kitchen Hob */}
          <li onClick={()=>handleCategoryClick("67afffa3e4667bfb97e2b258")}        ><Dot top="73%" left="62%"        /> </li>     {/* Built-in Microwave */}
          <li onClick={()=>handleCategoryClick("67affa77cf40bd9eb2b13285") }       ><Dot top="52%" left="79%"        /> </li>             {/* Refrigerator */}
        </div>
      </div>

      {/* Animation for Dots */}
      <style>
        {`
          @keyframes slowPing {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.8); opacity: 0.3; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `}
      </style>
    </>
  );
};

const Dot = ({ top, left }) => {
  return (
    <>
      {/* Wrapper for Proper Positioning */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: top, // Using % instead of vh
          left: left, // Using % instead of vw
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer Glow Effect - Now Centered */}
        <div
          className="bg-gray-100 opacity-50 rounded-full"
          style={{
            animation: "slowPing 2s infinite ease-out",
            width: "3vw",
            height: "3vw",
            minWidth: "20px",
            minHeight: "20px",
          }}
        ></div>

        {/* White Clickable Dot */}
        <div
          className="absolute bg-white rounded-full cursor-pointer"
          style={{
            width: "1vw",
            height: "1vw",
            minWidth: "10px",
            minHeight: "10px",
          }}
        ></div>
      </div>
    </>
  );
};

export default KitchenBanner;


























// import React from "react";

// const KitchenBanner = () => {
//   return (
//     <>
//       {/* Title Section */}
//       <div className="title my-5 flex gap-3 items-center justify-center">
//         <div className="left-slide h-1 w-44 bg-gray-900 rounded"></div>
//         <h1 className="text-3xl font-bold">Kitchen Appliances</h1>
//         <div className="right-slide h-1 w-44 bg-gray-900 rounded"></div>
//       </div>

//       {/* Banner Section */}
//       <div className="relative container w-full  overflow-hidden ">
//         <img
//           className=" w-full  object-cover"
//           src="../src/assets/Kitchen_Banner.jpg"
//           alt="Kitchen Appliances"
//         />

//         {/* Dot Container - Positioned Correctly */}
//         <div className="absolute top-0 left-0 w-full h-full">
//           <Dot top="12" left="61" /> {/* Kitchen Hood */}
//           <Dot top="47" left="46" /> {/* Built-In Oven */}
//           <Dot top="53" left="61" /> {/* Kitchen Hob */}
//           <Dot top="73" left="61" /> {/* Built-in Microwave */}
//           <Dot top="52" left="78" /> {/* Refrigerator */}
//         </div>
//       </div>

//       {/* Animation for Dots */}
//       <style>
//         {`
//           @keyframes slowPing {
//             0% { transform: scale(1); opacity: 0.6; }
//             50% { transform: scale(1.8); opacity: 0.3; }
//             100% { transform: scale(2.2); opacity: 0; }
//           }
//         `}
//       </style>
//     </>
//   );
// };

// const Dot = ({ top, left }) => {
//   return (
//     <>
//       {/* Wrapper for Proper Positioning */}
//       <div
//         className="absolute flex items-center justify-center"
//         style={{
//           top: `calc(${top} * 1vh)`,
//           left: `calc(${left} * 1vw)`,
//           transform: "translate(-50%, -50%)",
//         }}
//       >
//         {/* Outer Glow Effect - Now Centered */}
//         <div
//           className="bg-gray-100 opacity-50 rounded-full"
//           style={{
//             animation: "slowPing 2s infinite ease-out",
//             width: "3vw",
//             height: "3vw",
//             minWidth: "20px",
//             minHeight: "20px",
//           }}
//         ></div>

//         {/* White Clickable Dot */}
//         <div
//           className="absolute bg-white rounded-full cursor-pointer"
//           style={{
//             width: "1vw",
//             height: "1vw",
//             minWidth: "10px",
//             minHeight: "10px",
//           }}
//         ></div>
//       </div>
//     </>
//   );
// };


// export default KitchenBanner;
















// import react from "react";

// const Kitchen_banner = () => {
//   {
//     /* Keyframes inside a style tag */
//   }

//   return (
//     <>
//       {/* Heading */}
//       <div className="title my-5 flex gap-3 items-center justify-center">
//         <div className="left-slide h-1 w-44 bg-gray-900 rounded "></div>
//         <div className="heading">
//           <h1 className="text-3xl font-bold">Kitchen Appliances</h1>
//         </div>
//         <div className="right-slide h-1 w-44 bg-gray-900 rounded"></div>
//       </div>

//       {/* Banner Container */}

//       <div className=" relative banner_container flex justify-center w-full bg-amber-900 mx-auto">
//         <div className="banner_container w-full">
//           <img
//             className="w-full"
//             src="../src/assets/Kitchen_Banner.jpg"
//             alt="thenga"
//           />
//         </div>

//          {/* Kitchen Hood Dot */}
//         <div
//           className="absolute top-14 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>
//         {/* White Dot */}
//         <div className="absolute top-16 left-[61.5%] w-4 h-4 bg-white rounded-full"></div>
//          <div
//           className="absolute top-14 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>

//  {/* Built In Oven Dot */}
//  <div
//           className="absolute top-76 left-[45%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>
//         {/* White Dot */}
//         <div className="absolute top-78 left-[45.6%] w-4 h-4 bg-white rounded-full"></div>
//          <div
//           className="absolute top-76 left-[45%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>

//  {/* Kitchen Hob Dot */}
//  <div
//           className="absolute top-89 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>
//         {/* White Dot */}
//         <div className="absolute top-91 left-[61.5%] w-4 h-4 bg-white rounded-full"></div>
//          <div
//           className="absolute top-89 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>

//         {/* Built in Microwave Dot */}
//         <div
//           className="absolute top-124 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>
//         {/* White Dot */}
//         <div className="absolute top-126 left-[61.5%] w-4 h-4 bg-white rounded-full"></div>
//          <div
//           className="absolute top-124 left-[61%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>

//  {/* Refrigator Dot */}
//  <div
//           className="absolute top-76 left-[78%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>
//         {/* White Dot */}
//         <div className="absolute top-78 left-[78.5%] w-4 h-4 bg-white rounded-full"></div>
//          <div
//           className="absolute top-76 left-[78%] w-8 h-8 bg-gray-100 opacity-99 rounded-full  "
//           style={{
//             animation: "slowPing 1.7s infinite ease-out ",
//           }}
//         ></div>

//         <style>
//           {`
//       @keyframes slowPing {
//         0% {
//           transform: scale(1);
//           opacity: 0.6;
//         }
//         50% {
//           transform: scale(1.8);
//           opacity: 0.3;
//         }
//         100% {
//           transform: scale(2.2);
//           opacity: 0;
//         }
//       }
//     `}
//         </style>
//       </div>
//     </>
//   );
// };

// export default Kitchen_banner;
