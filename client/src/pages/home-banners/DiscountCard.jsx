import React from "react";
import { Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Percent } from "@mui/icons-material";
import { motion } from "framer-motion";

const DiscountCards = () => {
  const navigate = useNavigate();
  const cardsData = [
    {
      title: "Small Domestic Appliances",
      price: "Under 15,000 PKR",
      icon: <Percent sx={{ fontSize: 60, color: "#fbbf24" }} />, // Yellow-500
      description: "Top-quality appliances for your home at unbeatable prices.",
      bgColor: "linear-gradient(135deg, #fef08a 30%, #fff7ed 90%)",
      priceColor: "#d97706", // Yellow-600
      titleColor: "#b45309", // Yellow-700
      maxPrice:15000,
    },
    {
      title: "Premium Products",
      price: "Under 50,000 PKR",
      icon: <ShoppingBag sx={{ fontSize: 60, color: "#60a5fa" }} />, // Blue-500
      description: "Explore premium products designed to make life easier.",
      bgColor: "linear-gradient(135deg, #bfdbfe 30%, #eff6ff 90%)",
      priceColor: "#2563eb", // Blue-600
      titleColor: "#1d4ed8", // Blue-700
      maxPrice: 50000,
    },
  ];

  const handleMaxPrice = (maxPrice)=>{

    navigate(`/products/filters?maxPrice=${maxPrice}`)

  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
      gap={4}
      my={4}
      px={{ xs: 2, sm: 4 }}
    >
      {cardsData.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: card.bgColor,
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            height: "100%",
          }}
        >
          <Card
            sx={{
              height: "100%",
              boxShadow: "none",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 100,
                  height: 100,
                  bgcolor: "white",
                  borderRadius: "50%",
                  boxShadow: 3,
                  mb: 2,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "rotate(15deg)" },
                }}
              >
                {card.icon}
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: card.titleColor,
                  mb: 1,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {card.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: card.priceColor,
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  mb: 1,
                }}
              >
                {card.price}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 2 }}
              >
                {card.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button
               onClick={()=>handleMaxPrice(card.maxPrice)}
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "30px",
                  backgroundImage:
                    "linear-gradient(to right, #374151, #1f2937)",
                  color: "#fff",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(to right, #4b5563, #374151)",
                  },
                }}
              >
                Shop Now
              </Button>
            </CardActions>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

export default DiscountCards;





// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import { BadgePercent, ShoppingBag } from "lucide-react";

// const DiscountCards = () => {
//   const cardsData = [
//     {
//       title: "Small Domestic Appliances",
//       price: "Under 15,000 PKR",
//       icon: <BadgePercent className="h-16 w-16 md:h-20 md:w-20 text-yellow-500" />,
//       description: "Top-quality appliances for your home at unbeatable prices.",
//       bgColor: "bg-gradient-to-br from-yellow-300 via-yellow-100 to-white",
//       priceColor: "text-yellow-600",
//       titleStyle: "text-3xl md:text-4xl font-extrabold text-yellow-700",
//     },
//     {
//       title: "Premium Products",
//       price: "Under 50,000 PKR",
//       icon: <ShoppingBag className="h-16 w-16 md:h-20 md:w-20 text-blue-500" />,
//       description: "Explore premium products designed to make life easier.",
//       bgColor: "bg-gradient-to-br from-blue-300 via-blue-100 to-white",
//       priceColor: "text-blue-600",
//       titleStyle: "text-3xl md:text-4 font-bold text-blue-700",
//     },
//   ];

//   return (
//     <div className="discount-banner grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 my-6 sm:my-8 px-2 sm:px-4">
//       {cardsData.map((card, index) => (
//         <motion.div
//           key={index}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className={`rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 ${card.bgColor} transition-all duration-300`}
//         >
//           <Card className="border-0 bg-transparent shadow-none h-full">
//             <CardContent className="flex flex-col items-center text-center gap-4 sm:gap-5 md:gap-6 h-full justify-between">
//               <div className="p-4 sm:p-5 bg-white rounded-full shadow-lg hover:rotate-12 transition-transform duration-300">
//                 {card.icon}
//               </div>
//               <h2 className={`${card.titleStyle} tracking-wide leading-snug text-center`}>{card.title}</h2>
//               <p className={`text-xl sm:text-2xl font-extrabold ${card.priceColor} drop-shadow-md`}>
//                 {card.price}
//               </p>
//               <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-sm">
//                 {card.description}
//               </p>
//               <Button className="mt-3 sm:mt-4 px-6 sm:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:from-gray-700 hover:to-gray-500 shadow-lg transition-all">
//                 Shop Now
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// export default DiscountCards;







// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import { BadgePercent, Package } from "lucide-react";

// const DiscountCards = () => {
//   const cardsData = [
//     {
//       title: "Small Domestic Appliances",
//       price: "Under 15,000 PKR",
//       icon: <BadgePercent className="h-12 w-12 text-yellow-500" />,
//       description: "Top-quality appliances for your home at unbeatable prices.",
//       bgColor: "bg-gradient-to-r from-yellow-100 to-yellow-300",
//     },
//     {
//       title: "Premium Products",
//       price: "Under 50,000 PKR",
//       icon: <Package className="h-12 w-12 text-blue-500" />,
//       description: "Explore premium products designed to make life easier.",
//       bgColor: "bg-gradient-to-r from-blue-100 to-blue-300",
//     },
//   ];

//   return (
//     <div className="discount-banner grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
//       {cardsData.map((card, index) => (
//         <motion.div
//           key={index}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className={`rounded-2xl shadow-lg p-6 ${card.bgColor}`}
//         >
//           <Card className="border-0 bg-transparent shadow-none">
//             <CardContent className="flex flex-col items-center text-center gap-4">
//               <div className="p-4 bg-white rounded-full shadow-md">{card.icon}</div>
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 {card.title}
//               </h2>
//               <p className="text-lg font-bold text-red-600">{card.price}</p>
//               <p className="text-gray-600">{card.description}</p>
//               <Button className="mt-4 px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-all">
//                 Shop Now
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// export default DiscountCards;
