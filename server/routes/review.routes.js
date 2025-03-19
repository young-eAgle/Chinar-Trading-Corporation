import express from "express";
import { Router } from "express";
import Reviews from "../models/model.review.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";

const router = Router();

// Configure Multer for file uploads (store in memory)
const upload = multer({ dest: "uploads/" });

// Validation middleware
const validateReviewInput = (req, res, next) => {
  const { rating, comment, userName, userEmail } = req.body;
  const errors = {};

  // Validate required fields
  if (!rating) errors.rating = "Rating is required";
  if (!comment) errors.comment = "Review comment is required";
  if (!userName) errors.userName = "Name is required";
  
  // Validate email format
  if (!userEmail) {
    errors.userEmail = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      errors.userEmail = "Please provide a valid email address";
    }
  }

  // Validate rating value
  if (rating && (rating < 1 || rating > 5)) {
    errors.rating = "Rating must be between 1 and 5";
  }

  // Validate comment length
  if (comment && comment.length < 10) {
    errors.comment = "Review comment must be at least 10 characters";
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Cloudinary Upload Function
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "reviews", // Store images in "reviews" folder in Cloudinary
    });
    fs.unlinkSync(filePath); // Remove temp file after upload
    return result.secure_url; // Return Cloudinary URL
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};

// ✅ Fetch all reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Reviews.find().sort({ createdAt: -1 });
    console.log("Returning reviews with images:", reviews.map(r => ({
      id: r._id,
      hasImages: r.images && r.images.length > 0,
      imageCount: r.images ? r.images.length : 0,
      firstImage: r.images && r.images.length > 0 ? r.images[0] : 'none'
    })));
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ✅ Add a new review
router.post("/reviews", validateReviewInput, async (req, res) => {
  try {
    const { rating, comment, userName, userEmail, store } = req.body;

    const newReview = new Reviews({
      rating,
      text: comment,
      reviewer: userName,
      userEmail,
      store: store || "",
      createdAt: new Date(),
    });

    const savedReview = await newReview.save();
    res.status(201).json({ 
      success: true, 
      message: "Review added successfully",
      reviewId: savedReview._id 
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create review", 
      error: error.message 
    });
  }
});

// ✅ Upload images for a review
router.post("/reviews/upload-images", upload.array("images", 5), async (req, res) => {
  try {
    const { reviewId } = req.body;
    
    if (!reviewId) {
      return res.status(400).json({ 
        success: false, 
        message: "Review ID is required for image upload" 
      });
    }

    console.log("Processing image upload for reviewId:", reviewId);
    
    const imageUrls = [];
    
    // Upload each image to Cloudinary
    for (const file of req.files) {
      console.log("Uploading file to Cloudinary:", file.path);
      const imageUrl = await uploadToCloudinary(file.path);
      console.log("Image uploaded successfully:", imageUrl);
      imageUrls.push(imageUrl);
    }

    console.log("All images uploaded, saving URLs to review:", imageUrls);

    // Update the review with image URLs
    const updatedReview = await Reviews.findByIdAndUpdate(
      reviewId, 
      { images: imageUrls },
      { new: true }
    );
    
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found with the provided ID"
      });
    }

    console.log("Review updated with images:", {
      reviewId: updatedReview._id,
      imagesCount: updatedReview.images.length,
      images: updatedReview.images
    });

    res.status(200).json({ 
      success: true, 
      message: "Images uploaded successfully",
      images: imageUrls,
      review: {
        _id: updatedReview._id,
        images: updatedReview.images
      }
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload images", 
      error: error.message 
    });
  }
});

// ✅ Update a review (optionally update image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path);
      updateData.image = imageUrl;
    }

    await Reviews.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ Delete a review
router.delete("/:id", async (req, res) => {
  try {
    await Reviews.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;


// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const router = express.Router();

// // Configure multer for image uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '.././uploads/reviews'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|webp/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Only image files are allowed!'));
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// // Import controllers
// import {
//   getReviews,
//   getReviewById,
//   createReview,
//   updateReview,
//   deleteReview,
//   markReviewHelpful
// } from '../Controllers/review.controller.js';

// // All routes are public for now
// router.get('/reviews', getReviews);
// router.get('/reviews/:id', getReviewById);
// router.post('/reviews', upload.array('images', 5), createReview);
// router.put('/reviews/:id', upload.array('images', 5), updateReview);
// router.delete('/reviews/:id', deleteReview);
// router.post('/reviews/:id/helpful', markReviewHelpful);

// export default router;








// import express from "express";
// import { Router } from "express";
// import Reviews from '../models/model.review.js';


// const router = Router();




// router.get("/", async (req, res) => {
//     const reviews = await Reviews.find();
//     res.json(reviews);
//   });
  
//   router.post("/add-review", async (req, res) => {
//     const newReview = new Reviews(req.body);
//     await newReview.save();
//     res.json(newReview);
//   });
  
//   router.put("/:id", async (req, res) => {
//     await Reviews.findByIdAndUpdate(req.params.id, req.body);
//     res.send("Updated");
//   });
  
//   router.delete("/:id", async (req, res) => {
//     await Reviews.findByIdAndDelete(req.params.id);
//     res.send("Deleted");
//   });


// export default router;


