import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaImage, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://46.202.166.65/api',
  withCredentials: true
});

const AddReview = ({ selectedReview, fetchReviews, clearSelection }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    images: [],
    userName: '',
    userEmail: ''
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedReview) {
      setFormData({
        rating: selectedReview.rating,
        comment: selectedReview.comment || selectedReview.text,
        images: selectedReview.images || [],
        userName: selectedReview.userName || selectedReview.reviewer,
        userEmail: selectedReview.userEmail
      });
      setPreviewImages(selectedReview.images || []);
    }
  }, [selectedReview]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Please ensure all files are images under 5MB.');
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.rating) {
      setError('Please select a rating');
      return false;
    }
    if (!formData.comment || formData.comment.length < 10) {
      setError('Please write a review with at least 10 characters');
      return false;
    }
    if (!formData.userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      setError('Please provide a valid email address');
      return false;
    }
    if (!formData.userName) {
      setError('Please provide your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a regular JSON object first
      const reviewData = {
        rating: formData.rating,
        comment: formData.comment,
        userName: formData.userName,
        userEmail: formData.userEmail
      };

      console.log('Submitting review with data:', reviewData);
      
      const response = await fetch('http://46.202.166.65/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.message || 'Failed to submit review');
      }

      // If there are images, send them in a separate request
      if (formData.images && formData.images.length > 0) {
        const imageForm = new FormData();
        formData.images.forEach((image, index) => {
          imageForm.append('images', image);
        });
        imageForm.append('reviewId', responseData.reviewId); // Use reviewId from the response data
        
        try {
          console.log('Uploading images for review:', responseData.reviewId);
          const imageResponse = await fetch('http://46.202.166.65/api/reviews/upload-images', {
            method: 'POST',
            credentials: 'include',
            body: imageForm
          });
          
          const imageResponseData = await imageResponse.json();
          
          if (!imageResponse.ok) {
            console.error('Image upload response:', imageResponseData);
            toast.warning('Review saved but image upload failed');
          } else {
            console.log('Images uploaded successfully:', imageResponseData);
            // Force refresh of reviews to show the new images
            queryClient.invalidateQueries(['reviews']);
          }
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          toast.warning('Review saved but image upload failed');
        }
      }

      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries(['reviews']);
      clearSelection();
      setFormData({ rating: 0, comment: '', images: [], userName: '', userEmail: '' });
      setPreviewImages([]);
    } catch (error) {
      console.error('Full error details:', error);
      toast.error(error.message || 'Failed to submit review');
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto mb-10"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-4 relative">
        {selectedReview ? 'Edit Your Review' : 'Share Your Experience'}
        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 absolute -bottom-0.5 left-0 rounded-full"></div>
      </h2>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Rate Your Experience</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="focus:outline-none transform transition duration-200 hover:scale-110"
              >
                <FaStar
                  className={`h-8 w-8 ${
                    formData.rating >= star
                      ? 'text-yellow-400 transition-all duration-300 ease-in-out'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-4 text-sm text-gray-500">
              {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select a rating'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="userName" className="block text-gray-700 text-sm font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="userEmail" className="block text-gray-700 text-sm font-semibold mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="userEmail"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 text-sm font-semibold mb-2">
            Your Review
          </label>
          <div className="relative">
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="Share your experience with this product..."
            ></textarea>
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {formData.comment.length}/500
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.comment.length < 10 ? 
              `Please write at least 10 characters (${10 - formData.comment.length} more needed)` : 
              '✓ Good to go!'}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Add Photos (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg transition duration-200 hover:border-indigo-400">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload images</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    multiple
                    onChange={handleImageChange} 
                    className="sr-only" 
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>

          {previewImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Images ({previewImages.length})
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewImages.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={typeof src === 'string' ? src : URL.createObjectURL(src)}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-lg shadow border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={clearSelection}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : selectedReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddReview;

















// import { useState, useEffect } from "react";
// import { TextField, Button, Rating, Typography } from "@mui/material";
// import axios from "axios";

// const AddReviewForm = ({ selectedReview, fetchReviews, clearSelection }) => {
//   const [name, setName] = useState("");
//   const [store, setStore] = useState("");
//   const [rating, setRating] = useState(5);
//   const [feedback, setFeedback] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (selectedReview) {
//       setName(selectedReview.reviewer);
//       setStore(selectedReview.store);
//       setRating(selectedReview.rating);
//       setFeedback(selectedReview.text);
//       setPreview(selectedReview.image || "");
//     }
//   }, [selectedReview]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name || !store || !feedback) {
//       setError("All fields are required.");
//       return;
//     }
//     setError("");

//     const formData = new FormData();
//     formData.append("store", store);
//     formData.append("text", feedback);
//     formData.append("rating", rating);
//     formData.append("reviewer", name);
//     if (image) formData.append("image", image);

//     try {
//       if (selectedReview) {
//         await axios.put(`http://localhost:5000/reviews/${selectedReview._id}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         clearSelection();
//       } else {
//         await axios.post("http://localhost:5000/reviews/add-review", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       fetchReviews();
//       setName("");
//       setStore("");
//       setRating(5);
//       setFeedback("");
//       setImage(null);
//       setPreview("");
//     } catch (error) {
//       console.error("Error submitting review:", error);
//     }
//   };

//   return (
//     <>
//     <h1 className="text-center text-3xl font-extrabold text-gray-800 uppercase tracking-wider mt-10">
//         Share Your Experience
//       </h1>
//       <div className="h-[2px] w-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-500 my-4"></div>
//     <div className="max-w-2xl mx-auto p-8  bg-white shadow-lg rounded-lg">
//       {/* <Typography
//         variant="h4"
//         className="text-center font-bold text-gray-800 mb-10 pb-6 "
//         style={{
//           background: "linear-gradient(to right, #4b6cb7, #182848)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//         }}
//       >
//         {selectedReview ? "Edit Your Review" : "Share Your Experience"}
//       </Typography> */}
//       {error && <p className="text-red-500 text-center">{error}</p>}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="flex flex-col md:flex-row md:space-x-4  gap-5">
//           <TextField
//             label="Your Name"
//             fullWidth
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="mb-4 md:mb-0"
//           />
//           <TextField
//             label="Store Name"
//             fullWidth
//             value={store}
//             onChange={(e) => setStore(e.target.value)}
//           />
//         </div>
//         <div className="flex items-center space-x-2">
//           <Typography className="text-gray-700">Rating:</Typography>
//           <Rating
//             value={rating}
//             precision={0.5}
//             onChange={(e, newValue) => setRating(newValue)}
//           />
//         </div>
//         <TextField
//           label="Your Feedback"
//           fullWidth
//           multiline
//           rows={4}
//           value={feedback}
//           onChange={(e) => setFeedback(e.target.value)}
//         />
//         <div className="flex flex-col space-y-2">
//           <label className="text-gray-700">Upload Image:</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             className="p-2 border rounded-lg bg-white shadow-sm cursor-pointer"
//           />
//           {preview && (
//             <img
//               src={preview}
//               alt="Preview"
//               className="w-32 h-32 rounded-lg border object-cover shadow-md"
//             />
//           )}
//         </div>
//         <div className="flex justify-center">
//           <Button
//             type="submit"
//             variant="contained"
//             className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-lg shadow-md transform transition-transform hover:scale-105"
//           >
//             {selectedReview ? "Update Review" : "Submit Review"}
//           </Button>
//         </div>
//       </form>
//     </div>
//     </>
//   );
// };

// export default AddReviewForm;







