// import React from "react";
// import { useRef, useEffect } from "react";

// const RollingLogos = () => {

//   const scrollRef = useRef(null);

//   let logos = [
//     { id: 1, img_src: "./src/assets/Roll-up-images/gree_1.png" },
//     { id: 2, img_src: "./src/assets/Roll-up-images/dawlance_2.png" },
//     { id: 3, img_src: "./src/assets/Roll-up-images/kenwood_2.png" },
//     { id: 4, img_src: "./src/assets/Roll-up-images/philips.png" },
//     { id: 4, img_src: "./src/assets/Roll-up-images/snmsung.png" },
    
//   ];

//   useEffect(()=>{

//     const scrollContainer = scrollRef.current;

//     if(!scrollContainer) return;

//     // Duplicate items.

//     scrollContainer.innerHTML += scrollContainer.innerHTML;

//     const autoScroll = ()=>{
//       if(scrollContainer.scrollLeft >= scrollContainer.scrollWidth/2){

//         scrollContainer.scrollLeft = 0;
//       }else {
//         scrollContainer.scrollLeft +=2;
//       }
//     };

//     const interval = setInterval(autoScroll, 20);


//     return ()=>clearInterval(interval);

//   }, []);



//   return (
//     <>
    
//       <div ref={scrollRef} className="rolling-logos-container flex overflow-x-scroll scroll-auto mt-10   bg-gray-300 py-4 "  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
//         {logos.map((logo, index) =>  (
//             <div key={index} className="image1 flex items-center justify-center bg-amber-500  w-[80px] h-[80px] mx-4">
//               <img className="w-[80px] " src={logo.img_src} alt="Company 4"  />
//             </div>
//           )
//         )}
//       </div>
//     </>
//   );
// };

// export default RollingLogos;



import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const RollingLogos = () => {



    let logos = [
    { id: 1, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845545/gree_1_bfcgh8.webp" },
    { id: 2, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845545/reminton_i2kyaz.webp" },
    { id: 3, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845544/kenwood_2_c8roel.webp" },
    { id: 4, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845545/snmsung_l0gch4.webp" },
    { id: 5, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845545/philips_vm1aq0.webp" },
    { id: 6, img_src: "https://res.cloudinary.com/dvn45bv4m/image/upload/v1741845545/dawlance_2_o8jjeq.webp" },
    
  ];

  const settings = {
    dots: false, // Show navigation dots
    infinite: true, // Infinite loop
    speed: 1000, // Animation speed
    slidesToShow: 5, // Number of visible slides
    slidesToScroll: 1, // Number of slides to scroll per action
    autoplay: true, // Enable autoplay
    autoplaySpeed: 1600, // Time between slides
  };

  return (
    <div className='logos-container mx-auto mt-10  w-[95%] h-auto'>

      <Slider {...settings}  >
        {logos.map((logo, index)=>{

          return(
            <div key={index} className="image1 flex items-center justify-center mt-5 mx-4 gap-5">
              <img className="pt-5 w-[14vw] lg:w-[15vw]  mx-10 " src={logo.img_src} alt="Company 4"  />
            </div>
          )

        })}

      </Slider>

      
    </div>
  )
}

export default RollingLogos





