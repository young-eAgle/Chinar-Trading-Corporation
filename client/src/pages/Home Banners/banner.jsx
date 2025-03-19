import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import DiscountCards from "./DiscountCard";

const settings = {
  dots: false, // Show navigation dots
  infinite: true, // Infinite loop
  speed: 500, // Animation speed
  slidesToShow:  1, // Number of visible slides
  slidesToScroll: 1, // Number of slides to scroll per action
  autoplay: true, // Enable autoplay
  autoplaySpeed: 2000, // Time between slides
};
const Banner = () => {
  return (
    <>
    <div className="banner-slider banner-container bg-red-300 xl:h-[520px] mt-15  xl:mt-28 mx-auto overflow-hidden" 
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <Slider {...settings}>
        {/* Image One */}
        <div className=" z-[-900]  xl:h-[520px] w-full flex justify-center items-center bg-black outline-none ">
          <img className=" w-full h-full object-fit outline-none " src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372450/b2_x7uu3e.jpg" alt="" />
        </div>
        {/* Image Two */}
        <div className=" z-[-900] xl:h-[520px] w-full flex items-center justify-center outline-none ">
          <img className="   h-full w-full object-fit  border-yellow-400  outline-none" src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372449/b5_ercdgv.jpg" alt="" />
        </div>
        {/* Third Image  */}
        <div className=" z-[-900] xl:h-[520px] w-full flex items-center justify-center bg-black outline-none ">
          <img  className=" h-full w-full object-fit outline-none" src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372449/b4_anrkup.jpg" alt="" />
        </div>
        {/*  Fourth Image  */}
        <div className=" z-[-900] xl:h-[520px]  w-full flex items-center justify-center outline-none">
          <img className="w-full h-full object-fit outline-none" src="https://res.cloudinary.com/dvn45bv4m/image/upload/v1742372448/banner3_uy3ooy.jpg" alt="" />
        </div>

        {/* Fourth Image */}
{/* 
        <div
        className=" z-[-900] bg-black h-[70vh]  relative flex flex-col  lg:flex-row items-center bg-cover bg-center py-10 px-6 lg:px-16"
        style={{ backgroundImage: "url('./src/assets/slider-banner-1.jpg')" }}
      >
        <div className=" bg-opacity-80 p-6 rounded-lg  lg:w-1/2 text-center lg:text-left space-y-4">
          <span className="inline-block bg-yellow-400 text-xs uppercase font-bold px-3 py-1 rounded-full text-gray-800">
            Weekend Discount
          </span>
          <h3 className="text-4xl font-bold text-gray-800 leading-snug">
            Enhance Your <strong className="text-primary">Entertainment</strong>
          </h3>
          <p className="text-gray-600 text-lg">
            Last call for up to{" "}
            <span className="text-red-500 font-bold">%20</span> off!
          </p>
          <a
            href="#"
            className="inline-block bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-full hover:bg-blue-700 transition"
          >
            Shop Now
          </a>
        </div>
      </div> */}

    

      </Slider>
      </div>

        {/* Discount Banners */}
      {/* className="w-[100vw] h-[40vh]  object-cover"  */}
      {/* className="container mx-auto mt-6 grid grid-cols-1 gap-6 md:grid-cols-2" */}

      {/* <div className="discount-banner flex justify-center my-1 gap-1 xl:gap-8   xl:my-5">
        <div className="banner-1 ">
          <img className="  " src="./src/assets/domestic_discount.jpg" alt="" />
        </div>
        <div className="banner2   bg-yellow-300">
          <img className=" " src="./src/assets/products.jpg" alt="" />
        </div>
      </div> */}

   <DiscountCards/>
    </>
  );
};

export default Banner;
