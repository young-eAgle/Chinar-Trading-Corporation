import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
// import CloudinaryStorage from "multer-storage-cloudinary";
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
import Product from "../models/model.product.js";
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

const router = express.Router();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




// ✅ Multer setup for image uploads
// Multer Storage Setup for Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "product_images", // Cloudinary folder name
//     format: async (req, file) => "jpg", // Convert to JPG
//     public_id: (req, file) => file.originalname.split(".")[0], // Keep original name
//   },
// });
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Route to upload images first
router.post("/bulk-images", upload.array("images", 20), async (req, res) => {
  try {


    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" }); 
    }

    let uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "Products" },
        (error, result) => {
          if (error) {
            console.error("Image upload failed:", error);
            return res.status(500).json({ error: "Image upload failed" });
          }
          uploadedImages.push({ filename: file.originalname, url: result.secure_url });

          if (uploadedImages.length === req.files.length) {
            return res.status(200).json({ images: uploadedImages });
          }
        }
      );
      result.end(file.buffer);
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ✅ Route to upload products JSON
router.post("/bulk-products", async (req, res) => {
  try {
    const products = req.body;
    console.log(products)
    console.log("Received bulk upload request:", req.body);

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }

    const savedProducts = await Product.insertMany(products);
    res.status(201).json({ message: "Products added successfully", products: savedProducts });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

export default router;













// import express from "express";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import Product from "../models/model.product.js";
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times
// import fs from "fs";
// import { error } from "console";
// import { deflate } from "zlib";

// const router = express.Router();

// // ✅ Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ✅ Multer setup to handle file uploads
// const storage = multer.diskStorage({
//   destination: "uploads/", // Temporary storage before Cloudinary upload
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });

// // Normalize SKU

// const normalizeSKU = (sku) => {
//   return String(sku)
//     .replace(/[^0-9a-zA-Z]/g, "")
//     .trim();
// };

// let uploadImages = {};

// // Route to Upload Images First (Step 1)

// router.post("/upload-images", upload.array("images", 10), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No images uploaded" });
//     }

//     let imageUrls = [];

//     // Upload images to Cloudinary

//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path);
//       imageUrls.push({
//         filename: file.originalname,
//         url: result.secure_url,
//       });

//       fs.unlinkSync(file.path);
//     }

//     return res
//       .status(200)
//       .json({ message: "Images uploaded successfully", images: imageUrls });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Image upload failed", details: error.message });
//   }
// });

// router.post("/add-products", async (req, res) => {
//   try {
//     const productsData = req.body.products;

//     if (!Array.isArray(productsData) || productsData.length === 0) {
//       return res.status(400).json({ error: "Invalid product data" });
//     }

//     let productEntries = [];

//     for (const product of productsData) {
//       const productId = normalizeSKU(product.sku);

//       const productImages = product.images || [];

//       const productEntry = {
//         name: product.name || "Unamed Product",
//         sku: productId,
//         price: parseFloat(product.price) || 0,
//         actualPrice:
//           parseFloat(product.price) || parseFloat(product.price) || 0,
//         available: product.available?.toLowerCase() === "true",
//         categoryId: product.categoryId || null,
//         subcategoryId: product.subcategoryId || null,
//         brand: product.brand || "Unknown",
//         imageUrl: productImages.length > 0 ? productImages[0] : null, // First image as primary
//         images: productImages,
//       };


//       productEntries.push(productEntry);
//     }

//     // Save to MongoDB
    
//     const savedProducts = await Product.insertMany(productEntries);
//     return res.status(201).json({message:"Products added successfully", products: savedProducts})
     
//   } catch (error) {
//     return res.status(500).json({ error: "Database error", details: error.message });
//   }
// });


// export default router;