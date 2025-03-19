import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AddReview from "./AddReviews";
import ReviewList from "./ReviewList";
import { FaStar, FaEdit, FaInfoCircle } from "react-icons/fa";

function Reviews() {
    const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Toggle the review form
  const toggleReviewForm = () => {
    setShowReviewForm(!showReviewForm);
    if (!showReviewForm) {
      setSelectedReview(null);
    }
  };

  // Function to fetch review statistics (to be implemented)
  const fetchReviewStats = async () => {
    // This would be implemented to fetch stats from API
    // For now using placeholder data
    setReviewStats({
      avgRating: 4.2,
      totalReviews: 24,
      ratingCounts: { 1: 1, 2: 2, 3: 3, 4: 8, 5: 10 }
    });
  };

  useEffect(() => {
    fetchReviewStats();
  }, []);

  // Calculate percentage for each rating
  const calculatePercentage = (count) => {
    return reviewStats.totalReviews > 0 
      ? (count / reviewStats.totalReviews) * 100 
      : 0;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Customer Reviews
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-indigo-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your experience and help others make informed decisions
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews Stats Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">{reviewStats.avgRating.toFixed(1)}</span>
                <div className="flex justify-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(reviewStats.avgRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{reviewStats.totalReviews} reviews</p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <span className="text-sm text-gray-600 w-8">{rating}</span>
                    <FaStar className="w-4 h-4 text-yellow-400 mr-2" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                        style={{ width: `${calculatePercentage(reviewStats.ratingCounts[rating])}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2 w-8">
                      {reviewStats.ratingCounts[rating]}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={toggleReviewForm}
                className="mt-8 w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FaEdit className="mr-2" />
                {showReviewForm ? 'Hide Review Form' : 'Write a Review'}
              </button>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-500" />
                  Review Guidelines
                </h3>
                <ul className="mt-2 space-y-2 text-xs text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Be honest and specific about your experience
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Keep it family-friendly and respectful
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Include photos if possible (max 5 images)
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Reviews Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-8"
          >
            {/* Review Form (Conditional) */}
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <AddReview
                  selectedReview={selectedReview}
                  fetchReviews={() => setSelectedReview(null)}
                  clearSelection={() => {
                    setSelectedReview(null);
                    setShowReviewForm(false);
                  }}
                />
              </motion.div>
            )}

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              <ReviewList selectReview={(review) => {
                setSelectedReview(review);
                setShowReviewForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;



// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FaStar, FaUser, FaEdit, FaTrash } from "react-icons/fa";
// import { useParams } from "react-router-dom";
// import AddReview from "./AddReviews";
// import ReviewList from "./ReviewList";

// const Reviews = () => {
//   const { productId } = useParams();
//   const [selectedReview, setSelectedReview] = useState(null);
//   const [showAddReview, setShowAddReview] = useState(false);

//   const handleAddReviewClick = () => {
//     setShowAddReview(true);
//     setSelectedReview(null);
//   };

//   const handleCloseAddReview = () => {
//     setShowAddReview(false);
//     setSelectedReview(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <motion.h1 
//             className="text-4xl font-bold text-gray-900  mb-4"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             Customer Reviews
//           </motion.h1>
//           <motion.p 
//             className="text-lg text-gray-600 max-w-2xl mx-auto"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Share your experience and help others make informed decisions
//           </motion.p>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           {/* Reviews List Section */}
//           <motion.div 
//             className="lg:col-span-8"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//           >
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-semibold text-gray-900">Recent Reviews</h2>
//                 <button
//                   onClick={handleAddReviewClick}
//                   className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   <FaEdit className="mr-2" />
//                   Write a Review
//                 </button>
//               </div>
//               <ReviewList 
//                 productId={productId}
//                 selectReview={(review) => {
//                   setSelectedReview(review);
//                   setShowAddReview(true);
//                 }}
//               />
//             </div>
//           </motion.div>

//           {/* Statistics and Info Section */}
//           <motion.div 
//             className="lg:col-span-4"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//           >
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Guidelines</h3>
//               <ul className="space-y-3 text-gray-600">
//                 <li className="flex items-start">
//                   <span className="mr-2">•</span>
//                   Be honest and specific about your experience
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">•</span>
//                   Keep it family-friendly and respectful
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">•</span>
//                   Include photos if possible (max 5 images)
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">•</span>
//                   Write at least 10 characters
//                 </li>
//                 <li className="flex items-start">
//                   <span className="mr-2">•</span>
//                   Rate your experience from 1 to 5 stars
//                 </li>
//               </ul>
//             </div>
//           </motion.div>
//         </div>

//         {/* Add/Edit Review Modal */}
//         <AnimatePresence>
//           {showAddReview && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             >
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
//               >
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-semibold text-gray-900">
//                       {selectedReview ? 'Edit Review' : 'Write a Review'}
//                     </h2>
//                     <button
//                       onClick={handleCloseAddReview}
//                       className="text-gray-400 hover:text-gray-500"
//                     >
//                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
//                   <AddReview
//                     selectedReview={selectedReview}
//                     productId={productId}
//                     clearSelection={() => {
//                       setShowAddReview(false);
//                       setSelectedReview(null);
//                     }}
//                   />
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default Reviews;










// import { Rating } from "@mui/material";

// const reviews = [
//   {
//     id: 1,
//     store: "Electronics Store",
//     text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit quas ea sint iste libero fuga, in officia inventore, qui, quis harum laudantium.",
//     rating: 4.5,
//     reviewer: "Muhammad Zammad",
//     image: "", // Add reviewer image URL here
//   },
//   {
//     id: 2,
//     store: "Tech World",
//     text: "Amazing quality and fast delivery! The products are top-notch.",
//     rating: 4,
//     reviewer: "Sarah Khan",
//     image: "", // Add reviewer image URL here
//   },
//   {
//     id: 3,
//     store: "Gadget Hub",
//     text: "Best customer service and great prices. Highly recommend!",
//     rating: 5,
//     reviewer: "Ali Raza",
//     image: "", // Add reviewer image URL here
//   },
// ];

// const ReviewCards = () => {
//   return (
//     <div className="flex gap-6 overflow-x-auto py-6 px-4">
//       {reviews.map((review) => (
//         <div
//           key={review.id}
//           className="review-card bg-amber-100 w-80 h-auto border rounded p-4 shadow-md flex-shrink-0"
//         >
//           <div className="title">
//             <h1 className="text-xl font-bold">{review.store}</h1>
//           </div>
//           <div className="text-container py-1">
//             <p className="text-lg">{review.text}</p>
//           </div>
//           <div className="rating-review flex gap-5 py-2 items-center">
//             <Rating value={review.rating} precision={0.5} readOnly />
//             <h1 className="text-gray-400">({review.rating} Out of 5)</h1>
//           </div>
//           <div className="name-photo bg-white p-2 rounded flex items-center gap-2">
//             <div className="img w-12 h-12 border rounded-full overflow-hidden">
//               <img
//                 src={review.image || "https://via.placeholder.com/40"}
//                 alt={review.reviewer}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="name text-xl font-semibold">
//               <h1>{review.reviewer}</h1>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ReviewCards;












// import { useState } from "react";
// import { Card, CardContent, Typography, TextField, Button, Rating } from "@mui/material";

// const CustomerReviews = () => {
//   // Sample reviews
//   const [reviews, setReviews] = useState([
//     { name: "John Doe", rating: 5, feedback: "Great product! Highly recommended." },
//     { name: "Jane Smith", rating: 4, feedback: "Good quality, but delivery was a bit late." },
//   ]);

//   // Form state
//   const [name, setName] = useState("");
//   const [rating, setRating] = useState(5);
//   const [feedback, setFeedback] = useState("");

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!name || !feedback) return;

//     const newReview = { name, rating, feedback };
//     setReviews([newReview, ...reviews]); // Add new review at the top
//     setName("");
//     setRating(5);
//     setFeedback("");
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <Typography variant="h4" className="text-center font-bold mb-4">
//         Customer Reviews
//       </Typography>

//       {/* Review Form */}
//       <Card className="p-4 mb-6">
//         <CardContent>
//           <Typography variant="h6">Leave a Review</Typography>
//           <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//             <TextField
//               label="Your Name"
//               variant="outlined"
//               fullWidth
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <Rating
//               name="rating"
//               value={rating}
//               onChange={(e, newValue) => setRating(newValue)}
//             />
//             <TextField
//               label="Write your feedback..."
//               variant="outlined"
//               fullWidth
//               multiline
//               rows={3}
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//             />
//             <Button type="submit" variant="contained" color="primary">
//               Submit Review
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Reviews List */}
//       <div className="space-y-4">
//         {reviews.length > 0 ? (
//           reviews.map((review, index) => (
//             <Card key={index} className="p-4">
//               <CardContent>
//                 <Typography variant="h6">{review.name}</Typography>
//                 <Rating value={review.rating} readOnly />
//                 <Typography className="text-gray-600 mt-1">{review.feedback}</Typography>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Typography className="text-gray-500 text-center">No reviews yet. Be the first to review!</Typography>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomerReviews;












// import React from 'react';
// import { Button, Rating } from "@mui/material";

// const reviews = () => {
//   return (
//     <div>

// <div className="title my-5 flex gap-3 items-center justify-center  p-8 mb-9">
//         <div className="left-slide h-1 w-24 bg-gray-900 rounded "></div>
//         <div className="heading">
//           <h1 className="text-3xl font-bold">Let the Customer Speak for Us</h1>
//         </div>
//         <div className="right-slide h-1 w-24 bg-gray-900 rounded"></div>
//       </div>


// <div className="review-container flex justify-between gap-20 px-8 mx-auto">
//   <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">(4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center justify-center gap-1">
//       {/* <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div> */}
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Ali Hamza</h1>
//       </div>
//     </div>
//   </div>
//   <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">(4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center justify-center gap-1">
//       {/* <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div> */}
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Ali Hamza</h1>
//       </div>
//     </div>
//   </div>
//   <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">(4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center justify-center gap-1">
//       {/* <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div> */}
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Ali Hamza</h1>
//       </div>
//     </div>
//   </div>
//   <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">(4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center justify-center gap-1">
//       {/* <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div> */}
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Ali Hamza</h1>
//       </div>
//     </div>
//   </div>
//   {/* <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">( 4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center gap-1">
//       <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div>
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Muhammad Iqbal</h1>
//       </div>
//     </div>
//   </div>
//   <div className="review-card  bg-amber-100  w-75 h-auto border rounded p-4">
//     <div className="title">
//       <h1 className=" text-xl font-bold">
//         Electronics Store
//       </h1>
//     </div>
//     <div className="text-container py-1">
//       <p className="text-lg">
//         Lorem ipsum dolor sit amet consectetur adipisicing
//         elit. Sit quas ea sint iste libero fuga, in officia
//         inventore, qui, quis harum laudantium.
//       </p>
//     </div>

//     <div className="rating-review flex gap-5  py-2">
//       <Rating value={4.5} precision={0.5} />
//       <h1 className="text-gray-400">(4.5 Out of 5)</h1>
//     </div>

//     <div className="name-photo bg-white p-2 rounded flex items-center gap-1">
//       <div className="img w-15 h-15 border rounded-full">
//         <img src="" alt="" />
//       </div>
//       <div className="name    text-xl font-semibold">
//         <h1 className="text-center">Muhammad Zammad</h1>
//       </div>
//     </div>
//   </div> */}

// </div>
      
//     </div>
//   )
// }

// export default reviews
