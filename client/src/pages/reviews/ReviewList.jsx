import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Rating, Avatar, Typography } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [filterOption, setFilterOption] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/reviews");
        console.log("Reviews data received:", response.data);
        setReviews(response.data);
        setFilteredReviews(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Apply sorting and filtering
  useEffect(() => {
    let result = [...reviews];
    
    // Apply filter
    if (filterOption !== 'all') {
      const ratingFilter = parseInt(filterOption);
      result = result.filter(review => Math.floor(review.rating) === ratingFilter);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    setFilteredReviews(result);
  }, [reviews, sortOption, filterOption]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  // Add control panel above the slider
  const renderControlPanel = () => {
    return (
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-500">
          {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2 text-sm font-medium text-gray-700">
              Filter:
            </label>
            <select
              id="filter"
              value={filterOption}
              onChange={handleFilterChange}
              className="py-1 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
              Sort By:
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="py-1 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "30px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px",
        },
      },
    ],
  };

  return (
    <>
      <h1 className="text-center text-3xl md:text-4xl font-extrabold text-gray-800 uppercase tracking-wider mb-4 mt-10">
        Let Customers Speak For Us
      </h1>
      <div className="h-[3px] w-24 mx-auto bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full my-6"></div>
      <div className="flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 min-h-[70vh] outline-none">
        <div className="w-full max-w-5xl">
          {renderControlPanel()}
          
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews found</h3>
              <p className="mt-1 text-sm text-gray-500">Try changing your filter settings.</p>
            </div>
          ) : (
            <Slider {...settings}>
              {filteredReviews.map((review) => (
                <div key={review._id} className="flex justify-center p-4">
                  <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-90 shadow-xl rounded-3xl p-6 sm:p-10 text-center w-full min-h-72 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl border border-gray-100">
                    <div className="absolute -top-4 right-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {review.rating.toFixed(1)}
                    </div>
                    
                    <Rating
                      value={review.rating}
                      precision={0.5}
                      readOnly
                      className="mb-4"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#FFAB00',
                        },
                        '& .MuiRating-iconEmpty': {
                          color: '#E0E0E0',
                        },
                      }}
                    />

                    <div className="flex justify-center items-center mb-6">
                      {review.images && review.images.length > 0 ? (
                        <div className="relative">
                          <Avatar
                            src={review.images[0]}
                            alt={review.reviewer || review.userName || "Anonymous"}
                            sx={{
                              width: { xs: 80, sm: 100, md: 120 },
                              height: { xs: 80, sm: 100, md: 120 },
                              border: '4px solid #fff',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                              }
                            }}
                          />
                          {review.images.length > 1 && (
                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                              +{review.images.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Avatar
                          src=""
                          alt={review.reviewer || review.userName || "Anonymous"}
                          sx={{
                            width: { xs: 80, sm: 100, md: 120 },
                            height: { xs: 80, sm: 100, md: 120 },
                            border: '4px solid #fff',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            bgcolor: 'primary.main',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                            }
                          }}
                        />
                      )}
                    </div>

                    <Typography
                      variant="h6"
                      className="font-semibold text-lg sm:text-xl mt-3 text-gray-800"
                    >
                      {review.reviewer || review.userName}
                      <span className="text-gray-500"> {review.role || "Customer"}</span>
                    </Typography>

                    <Typography
                      variant="body1"
                      className="text-gray-600 mt-4 italic text-sm sm:text-base px-4 sm:px-8"
                    >
                      "{review.text}"
                    </Typography>

                    {/* Display all images in a gallery if there are more than one */}
                    {review.images && review.images.length > 1 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-4 gap-2">
                          {review.images.slice(1).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Additional ${idx + 1}`}
                              className="w-full h-16 object-cover rounded-md shadow"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewSlider;




// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaStar, FaUser, FaEdit, FaTrash, FaThumbsUp, FaFilter, FaSort } from 'react-icons/fa';

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: 'http://localhost:5000/api'
// });

// const ReviewList = ({ selectReview }) => {
//   const [sortBy, setSortBy] = useState('recent');
//   const [filterRating, setFilterRating] = useState(0);
//   const [showFilters, setShowFilters] = useState(false);

//   const { data: reviewsData, isLoading, error } = useQuery({
//     queryKey: ['reviews', sortBy, filterRating],
//     queryFn: async () => {
//       const response = await api.get(`/reviews`, {
//         params: {
//           sort: sortBy,
//           rating: filterRating
//         }
//       });
//       return response.data;
//     }
//   });

//   const handleSort = (value) => {
//     setSortBy(value);
//   };

//   const handleFilterRating = (rating) => {
//     setFilterRating(rating === filterRating ? 0 : rating);
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map((index) => (
//           <div key={index} className="animate-pulse">
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <div className="flex items-center space-x-4">
//                 <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
//                 <div className="flex-1">
//                   <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
//                   <div className="h-3 bg-gray-200 rounded w-1/3"></div>
//                 </div>
//               </div>
//               <div className="mt-4 space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-full"></div>
//                 <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-red-600 text-lg mb-4">
//           {error.response?.status === 404 
//             ? "No reviews found. The review system might not be properly configured."
//             : "Failed to load reviews"}
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   const reviews = reviewsData?.reviews || [];
//   const pagination = reviewsData?.pagination;

//   return (
//     <div>
//       <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//         >
//           <FaFilter className="mr-2" />
//           Filters
//         </button>
//         <div className="flex items-center space-x-2">
//           <FaSort className="text-gray-400" />
//           <select
//             value={sortBy}
//             onChange={(e) => handleSort(e.target.value)}
//             className="border-0 bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-0"
//           >
//             <option value="recent">Most Recent</option>
//             <option value="helpful">Most Helpful</option>
//             <option value="rating">Highest Rating</option>
//           </select>
//         </div>
// </div>

//       <AnimatePresence>
//         {showFilters && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="mb-6 overflow-hidden"
//           >
//             <div className="bg-white p-4 rounded-lg shadow-sm">
//               <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Rating</h3>
//               <div className="flex flex-wrap gap-2">
//                 {[5, 4, 3, 2, 1].map((rating) => (
//                   <button
//                     key={rating}
//                     onClick={() => handleFilterRating(rating)}
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
//                       filterRating === rating
//                         ? 'bg-blue-100 text-blue-800'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     {rating} <FaStar className="ml-1 text-yellow-400" />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="space-y-6">
//         {reviews.length > 0 ? (
//           reviews.map((review, index) => (
//             <motion.div
//               key={review._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//               className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
//             >
//               <Link to={`/reviews/${review._id}`} className="block p-6">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start space-x-4">
//                     <div className="flex-shrink-0">
//                       {review.userImage ? (
//                         <img
//                           src={review.userImage}
//                           alt={review.userName}
//                           className="h-12 w-12 rounded-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
//                           <FaUser className="text-gray-400 text-xl" />
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <h4 className="text-lg font-semibold text-gray-900">{review.userName}</h4>
//                       <div className="flex items-center mt-1">
//                         <div className="flex items-center">
//                           {[...Array(5)].map((_, i) => (
//                             <FaStar
//                               key={i}
//                               className={`w-4 h-4 ${
//                                 i < review.rating ? 'text-yellow-400' : 'text-gray-300'
//                               }`}
//                             />
//                           ))}
//                         </div>
//                         <span className="ml-2 text-sm text-gray-500">
//                           {new Date(review.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         selectReview(review);
//                       }}
//                       className="text-gray-400 hover:text-blue-600 transition-colors"
//                     >
//                       <FaEdit className="w-5 h-5" />
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         // Handle delete
//                       }}
//                       className="text-gray-400 hover:text-red-600 transition-colors"
//                     >
//                       <FaTrash className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <p className="text-gray-600 line-clamp-3">{review.comment}</p>
//                   {review.images?.length > 0 && (
//                     <div className="mt-4 flex space-x-2 overflow-x-auto">
//                       {review.images.slice(0, 3).map((image, i) => (
//                         <img
//                           key={i}
//                           src={image}
//                           alt={`Review image ${i + 1}`}
//                           className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
//                         />
//                       ))}
//                       {review.images.length > 3 && (
//                         <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
//                           +{review.images.length - 3}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4 flex items-center justify-between">
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         // Handle helpful
//                       }}
//                       className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
//                     >
//                       <FaThumbsUp className="w-4 h-4 mr-1" />
//                       <span className="text-sm">Helpful ({review.helpfulCount || 0})</span>
//                     </button>
//                   </div>
//                   {review.purchaseVerified && (
//                     <span className="text-sm text-green-600 flex items-center">
//                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       Verified Purchase
//                     </span>
//                   )}
//                 </div>
//               </Link>
//             </motion.div>
//           ))
//         ) : (
//           <div className="text-center py-12">
//             <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
//             <h3 className="text-xl font-medium text-gray-900 mb-2">No Reviews Yet</h3>
//             <p className="text-gray-500">Be the first to share your experience!</p>
//           </div>
//         )}
//               </div>

//       {pagination && pagination.pages > 1 && (
//         <div className="mt-8 flex justify-center">
//           <nav className="flex items-center space-x-2">
//             {[...Array(pagination.pages)].map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setPage(index + 1)}
//                 className={`px-3 py-1 rounded ${
//                   pagination.page === index + 1
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {index + 1}
//               </button>
//             ))}
//           </nav>
//         </div>
//       )}
//       </div>
//   );
// };

// export default ReviewList;














// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Slider from "react-slick";
// import { Rating, Avatar, Typography } from "@mui/material";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const ReviewSlider = () => {
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/reviews");
//         setReviews(response.data);
//       } catch (error) {
//         console.error("Error fetching reviews:", error);
//       }
//     };

//     fetchReviews();
//   }, []);

//   // Slick Slider settings
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 800,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     arrows: false,
//     centerMode: true,
//     centerPadding: "20px",
//   };

//   return (
//     <>

// <h1 className="text-center text-3xl font-extrabold text-gray-800 uppercase tracking-wider">
//        Let Customer Speak For Us
//       </h1>
//       <div className="h-[2px] w-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-500 my-4"></div>
//     <div className="flex justify-center items-center min-h-[60vh] bg-gray-100 py-16 px-8">







//       <div className="w-full max-w-3xl">
//         <Slider {...settings}>
//           {reviews.map((review) => (
//             <div key={review._id} className="flex justify-center">
//               <div className="bg-white shadow-xl rounded-3xl p-8 text-center w-full min-h-64 transition-transform duration-300 hover:scale-105  py-10">
//                 {/* Star Rating */}
//                 <Rating
//                   value={review.rating}
//                   precision={0.5}
//                   readOnly
//                   className="mb-3 text-yellow-500"
//                 />

//                 {/* Profile Image */}
//                 <div className="flex justify-center">
//                   <Avatar
//                     src={review.image || "https://via.placeholder.com/80"}
//                     alt={review.reviewer}
//                     className="w-20 h-20 border-4 border-white shadow-md"
//                   />
//                 </div>

//                 {/* Reviewer Name */}
//                 <Typography variant="h6" className="font-semibold mt-4 text-gray-800">
//                   {review.reviewer}, <span className="text-gray-500">{review.role || "Customer"}</span>
//                 </Typography>

//                 {/* Review Text */}
//                 <Typography variant="body1" className="text-gray-600 mt-3 italic">
//                   "{review.text}"
//                 </Typography>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>
//     </div>
//   </>
//   )
// };

// export default ReviewSlider;













// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Slider from "react-slick";
// import { Rating, Avatar, Typography } from "@mui/material";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const ReviewSlider = () => {
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/reviews");
//         setReviews(response.data);
//       } catch (error) {
//         console.error("Error fetching reviews:", error);
//       }
//     };

//     fetchReviews();
//   }, []);

//   // Slick Slider settings
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 1000,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     arrows: false, // Hide left/right arrows
//     centerMode: true, // Enable centering
//     centerPadding: "0", // Ensure full centering
//   };

//   return (
//     <div className="flex justify-center items-center min-h-[50vh] bg-gray-100 py-10">
//       <div className="w-full max-w-lg px-4">
//         <Slider {...settings}>
//           {reviews.map((review) => (
//             <div key={review._id} className="flex justify-center">
//               <div className="bg-white shadow-lg rounded-3xl p-6 text-center w-full min-h-60">
//                 {/* Star Rating */}
//                 <Rating value={review.rating} precision={0.5} readOnly className="mb-2 text-yellow-500" />

//                 {/* Profile Image */}
//                 <div className="flex justify-center ">
//                   <Avatar
//                     src={review.image || "https://via.placeholder.com/80"}
//                     alt={review.reviewer}
//                     className="w-30 h-30 border-4 border-white shadow-lg"
//                   />
//                 </div>

//                 {/* Reviewer Name */}
//                 <Typography variant="h6" className="font-bold mt-3">
//                   {review.reviewer}, {review.role || "Customer"}
//                 </Typography>

//                 {/* Review Text */}
//                 <Typography variant="body1" className="text-gray-600 mt-3 px-4">
//                   "{review.text}"
//                 </Typography>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>
//     </div>
//   );
// };

// export default ReviewSlider;



