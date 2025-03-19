
// backend/routes/productRoutes.js
import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage setup for temporary file storage
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Bulk Product Upload Route
router.post("/bulk-upload", upload.fields([{ name: "csvFile" }, { name: "images" }]), async (req, res) => {
    try {
        const csvFilePath = req.files["csvFile"][0].path;
        const imageFiles = req.files["images"] || [];
        
        let productsData = [];
        let productImageMap = {};
        
        // Upload images to Cloudinary first
        for (const file of imageFiles) {
            const result = await cloudinary.uploader.upload(file.path);
            const fileName = file.originalname.split("_")[0]; // Extract SKU or Name
            if (!productImageMap[fileName]) productImageMap[fileName] = [];
            productImageMap[fileName].push(result.secure_url);
            fs.unlinkSync(file.path); // Remove local file after upload
        }
        
        // Read CSV and map images to products
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on("data", (data) => {
                const productId = data.sku ? String(data.sku) : data.name;
                productsData.push({
                    ...data,
                    images: productImageMap[productId] || [],
                });
            })
            .on("end", async () => {
                // Save products to DB
                const savedProducts = await Product.insertMany(productsData);
                fs.unlinkSync(csvFilePath);
                res.status(201).json(savedProducts);
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/category/:categoryId", async (req, res) => {
    try {
      const products = await Product.find({ category: req.params.categoryId }).populate("subcategory");
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });




export default router;






// import React, { useState } from "react";
// import { BsArrowsFullscreen } from "react-icons/bs";
// import { CiHeart } from "react-icons/ci";
// import { FaHeart } from "react-icons/fa";

// const ProductCard = ({ product }) => {
//   const [wishListed, setWishListed] = useState(false);

//   const handleWishList = () => {
//     setWishListed(!wishListed);
//     console.log("Wishlisted!");
//   };

//   return (
//     <div className="card border relative bg-gray-900 border-gray-300  hover:bg-white rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group hover:z-50 overflow-hidden w-full sm:w-[48%] lg:w-[24%] xl:w-[22%] ">
//       {/* Discount Badge */}
//       {product.discount && (
//         <div className="discount cursor-pointer rounded-md absolute left-4 top-4 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
//           {product.discount}%
//         </div>
//       )}

//       {/* Wishlist and Quick View */}
//       <div className="whishlist-quickview-container absolute right-[-30px] top-3 flex flex-col gap-2 transition-transform duration-300 transform group-hover:translate-x-[-40px] opacity-0 group-hover:opacity-100">
//         <div className="quick-view hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer">
//           <BsArrowsFullscreen />
//         </div>
//         <div
//           onClick={handleWishList}
//           className="wish-list hover:bg-blue-500 bg-gray-100 text-black flex justify-center items-center w-9 h-9 hover:text-white text-xl p-2 rounded-full cursor-pointer"
//         >
//           {wishListed ? <FaHeart className="text-black" /> : <CiHeart />}
//         </div>
//       </div>

//       {/* Product Image */}
//       <div className="product-img flex justify-center my-4">
//         <img
//           src={product.image}
//           alt={product.name}
//           className="w-36 h-36 object-contain cursor-pointer"
//         />
//       </div>

//       {/* Company Name */}
//       <div className="company_name text-gray-400 text-sm text-center">
//         <h4>{product.company}</h4>
//       </div>

//       {/* Product Name */}
//       <div className="product-name text-center px-4">
//         <h3 className="text-lg font-medium cursor-pointer">{product.name}</h3>
//       </div>

//       {/* Price Section */}
//       <div className="price flex gap-3 justify-center items-center my-2">
//         {product.originalPrice && (
//           <h4 className="line-through text-gray-400 text-sm">
//             Rs {product.originalPrice.toLocaleString()}
//           </h4>
//         )}
//         <h2 className="text-red-600 font-semibold">
//           Rs {product.discountedPrice.toLocaleString()}
//         </h2>
//       </div>

//       {/* Add to Cart Button */}
//       <div className="addToCart-Btn flex justify-center my-3">
//         <button className="border-blue-600 border-2 text-blue-600 font-semibold hover:text-white px-8 py-2 rounded-3xl text-sm transition hover:bg-blue-700">
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// };

// const Card = () => {
//   const products = [
//     {
//       company: "Dawlance",
//       name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
//       originalPrice: 28500,
//       discountedPrice: 23500,
//       discount: 23,
//       image: "./src/assets/products/Ac.jpg",
//     },
//     {
//       company: "Samsung",
//       name: "Samsung 4K UHD Smart TV",
//       originalPrice: 120000,
//       discountedPrice: 100000,
//       discount: 17,
//       image: "./src/assets/products/led tv.jpg",
//     },
//     {
//       company: "Apple",
//       name: "Apple iPhone 13 Pro Max",
//       originalPrice: 270000,
//       discountedPrice: 250000,
//       discount: 8,
//       image: "./src/assets/products/Refrigator.jpg",
//     },
//     {
//       company: "Sony",
//       name: "Sony Noise Cancelling Headphones",
//       originalPrice: 35000,
//       discountedPrice: 31000,
//       discount: 11,
//       image: "./src/assets/products/washing_machine.jpg",
//     },
//     {
//       company: "Dawlance",
//       name: "Kenwood Split AC Inverter 1.5 Ton KEA-1864S",
//       originalPrice: 28500,
//       discountedPrice: 23500,
//       discount: 23,
//       image: "./src/assets/products/Ac.jpg",
//     },
//     {
//       company: "Samsung",
//       name: "Samsung 4K UHD Smart TV",
//       originalPrice: 120000,
//       discountedPrice: 100000,
//       discount: 17,
//       image: "./src/assets/products/led tv.jpg",
//     },
//     {
//       company: "Apple",
//       name: "Apple iPhone 13 Pro Max",
//       originalPrice: 270000,
//       discountedPrice: 250000,
//       discount: 8,
//       image: "./src/assets/products/Refrigator.jpg",
//     },
//     {
//       company: "Sony",
//       name: "Sony Noise Cancelling Headphones",
//       originalPrice: 35000,
//       discountedPrice: 31000,
//       discount: 11,
//       image: "./src/assets/products/washing_machine.jpg",
//     },
//   ];

//   return (
//     <div className="card-container flex flex-wrap gap-2 justify-center bg-white mx-auto px-4 pb-[10px]">
//       {products.map((product, index) => (
//         <ProductCard key={index} product={product} />
//       ))}
//     </div>
//   );
// };

// export default Card;





// backend/routes/productRoutes.js
// import express from "express";
// import multer from "multer";
// import csvParser from "csv-parser";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import Product from "../models/Product.js";
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// const router = express.Router();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer storage setup for temporary file storage
// const storage = multer.diskStorage({
//     destination: "uploads/",
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({ storage });

// // Bulk Product Upload Route
// router.post("/bulk-upload", upload.fields([{ name: "csvFile" }, { name: "images" }]), async (req, res) => {
//     try {
//         const csvFilePath = req.files["csvFile"][0].path;
//         const imageFiles = req.files["images"] || [];
        
//         let productsData = [];
//         let productImageMap = {};
        
//         // Upload images to Cloudinary first
//         for (const file of imageFiles) {
//             const result = await cloudinary.uploader.upload(file.path);
//             const productId = file.originalname.split("_")[0]; // Extract product identifier (e.g., SKU or ID)
//             if (!productImageMap[productId]) productImageMap[productId] = [];
//             productImageMap[productId].push(result.secure_url);
//             fs.unlinkSync(file.path); // Remove local file after upload
//         }
        
//         // Read CSV and map images to products
//         fs.createReadStream(csvFilePath)
//             .pipe(csvParser())
//             .on("data", (data) => {
//                 const productId = data.sku || data.name;
//                 productsData.push({
//                     ...data,
//                     images: productImageMap[productId] || [],
//                 });
//             })
//             .on("end", async () => {
//                 // Save products to DB
//                 const savedProducts = await Product.insertMany(productsData);
//                 fs.unlinkSync(csvFilePath);
//                 res.status(201).json(savedProducts);
//             });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default router;


















// // backend/routes/productRoutes.js
// import express from "express";
// import multer from "multer";
// import csvParser from "csv-parser";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import Product from "../models/Product.js";
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// const router = express.Router();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer storage setup for temporary file storage
// const storage = multer.diskStorage({
//     destination: "uploads/",
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({ storage });

// // Bulk Product Upload Route
// router.post("/bulk-upload", upload.fields([{ name: "csvFile" }, { name: "images" }]), async (req, res) => {
//     try {
//         const csvFilePath = req.files["csvFile"][0].path;
//         const imageFiles = req.files["images"] || [];
        
//         let productsData = [];
//         let productImageMap = {};
        
//         // Upload images to Cloudinary first
//         for (const file of imageFiles) {
//             const result = await cloudinary.uploader.upload(file.path);
//             const productId = file.originalname.split("_")[0]; // Extract product identifier (e.g., SKU or ID)
//             if (!productImageMap[productId]) productImageMap[productId] = [];
//             productImageMap[productId].push(result.secure_url);
//             fs.unlinkSync(file.path); // Remove local file after upload
//         }
        
//         // Read CSV and map images to products
//         fs.createReadStream(csvFilePath)
//             .pipe(csvParser())
//             .on("data", (data) => {
//                 const productId = data.sku || data.name;
//                 productsData.push({
//                     ...data,
//                     images: productImageMap[productId] || [],
//                 });
//             })
//             .on("end", async () => {
//                 // Save products to DB
//                 const savedProducts = await Product.insertMany(productsData);
//                 fs.unlinkSync(csvFilePath);
//                 res.status(201).json(savedProducts);
//             });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default router;








// import express from "express";
// import Product from "../models/model.product.js";
// import multer from "multer";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// const router = express.Router();

// // Cloudinary Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer Configuration (Disk Storage)
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads");
//     },
//     filename: function (req, file, cb) {
//         const uniqueName = `${Date.now()}_${file.originalname}`;
//         cb(null, uniqueName);
//     },
// });

// const upload = multer({ storage: storage });

// // Add Multiple Products with Images
// router.post("/add-products", upload.any(), async (req, res) => {
//     try {
//         let products = JSON.parse(req.body.products); // Parse product array
//         let savedProducts = [];

//         for (let i = 0; i < products.length; i++) {
//             let productData = products[i];
//             let imageUrls = [];

//             // Filter files that belong to this product
//             let productFiles = req.files.filter(file => file.fieldname === `product_${i}_images`);

//             if (productFiles.length > 0) {
//                 for (const file of productFiles) {
//                     const result = await cloudinary.uploader.upload(file.path);
//                     imageUrls.push(result.secure_url);
//                     fs.unlinkSync(file.path); // Remove from local storage
//                 }
//             }

//             const product = new Product({
//                 name: productData.name,
//                 brand: productData.brand,
//                 price: productData.price,
//                 discount: productData.discount,
//                 actualPrice: productData.actualPrice,
//                 category: productData.categoryId,
//                 subcategory: productData.subcategoryId,
//                 imageUrl: imageUrls,
//                 company: productData.company,
//             });

//             const savedProduct = await product.save();
//             savedProducts.push(savedProduct);
//         }

//         res.status(201).json({ message: "Products added successfully", products: savedProducts });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Delete Product & Images
// router.delete("/delete-product/:id", async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // Delete images from Cloudinary
//         for (const imageUrl of product.imageUrl) {
//             const publicId = imageUrl.split("/").pop().split(".")[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         await Product.findByIdAndDelete(req.params.id);
//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default router;


















// import express from "express";
// import Product from "../models/model.product.js";
// import multer from "multer";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// const router = express.Router();

// // Cloudinary Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer Configuration (Disk Storage)
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads");
//     },
//     filename: function (req, file, cb) {
//         const uniqueName = `${Date.now()}_${file.originalname}`;
//         cb(null, uniqueName);
//     },
// });

// const upload = multer({ storage: storage });

// // Add Product with Single/Multiple Image Upload
// router.post("/add-product", upload.array("images", 5), async (req, res) => {
//     try {
//         let imageUrls = [];

//         if (req.files && req.files.length > 0) {
//             for (const file of req.files) {
//                 const result = await cloudinary.uploader.upload(file.path);
//                 imageUrls.push(result.secure_url);
//                 fs.unlinkSync(file.path); // Remove image from local storage after upload
//             }
//         }

//         const product = new Product({
//             name: req.body.name,
//             brand: req.body.brand,
//             price: req.body.price,
//             discount: req.body.discount,
//             actualPrice: req.body.actualPrice,
//             category: req.body.categoryId,
//             subcategory: req.body.subcategoryId,
//             imageUrl: imageUrls,
//             company: req.body.company,
//         });

//         await product.save();
//         res.status(201).json(product);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Delete Product & Images
// router.delete("/delete-product/:id", async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id);
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         // Delete images from Cloudinary
//         for (const imageUrl of product.imageUrl) {
//             const publicId = imageUrl.split("/").pop().split(".")[0];
//             await cloudinary.uploader.destroy(publicId);
//         }

//         await Product.findByIdAndDelete(req.params.id);
//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// export default router;









// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: false, // Not required for guest users
//     },
//     guestUser: {
//       email: { type: String, required: false }, 
//       firstName: { type: String, required: false },
//       lastName: { type: String, required: false },
//       phone: { type: String, required: false },
//     },
//     shippingAddress: {
//       country: { type: String, required: true },
//       firstName: { type: String, required: true },
//       lastName: { type: String, required: true },
//       address: { type: String, required: true },
//       apartment: { type: String, required: false }, // Optional
//       city: { type: String, required: true },
//       postalCode: { type: String, required: false }, // Optional
//       phone: { type: String, required: true },
//     },
//     billingAddress: {
//       country: { type: String, required: true },
//       firstName: { type: String, required: true },
//       lastName: { type: String, required: true },
//       address: { type: String, required: true },
//       apartment: { type: String, required: false }, // Optional
//       city: { type: String, required: true },
//       postalCode: { type: String, required: false }, // Optional
//       phone: { type: String, required: true },
//     },
//     orderItems: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         name: String,
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },
//         imageUrl: String,
//       },
//     ],
//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Paid"],
//       default: "Pending",
//     },
//     orderStatus: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending",
//     },
//     totalPrice: { type: Number, required: true },
//     orderTrackingId: { type: String, unique: true }, // Unique tracking ID for guest users
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;












// import express from "express";
// import Order from "../models/Order.js";
// import { v4 as uuidv4 } from "uuid"; // For generating unique tracking IDs

// const router = express.Router();

// // Create a new order
// router.post("/create", async (req, res) => {
//   try {
//     const { userId, guestUser, shippingAddress, billingAddress, orderItems, totalPrice } = req.body;

//     let orderData = {
//       shippingAddress,
//       billingAddress,
//       orderItems,
//       totalPrice,
//       orderStatus: "Pending",
//       orderTrackingId: uuidv4(), // Unique tracking ID
//     };

//     if (userId) {
//       // If user is logged in, link the order to their account
//       orderData.user = userId;
//     } else {
//       // If guest user, store their details
//       if (!guestUser || !guestUser.email || !guestUser.firstName || !guestUser.phone) {
//         return res.status(400).json({ message: "Guest user details are required" });
//       }
//       orderData.guestUser = guestUser;
//     }

//     const newOrder = new Order(orderData);
//     await newOrder.save();

//     res.status(201).json({ message: "Order placed successfully", order: newOrder });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//export default router;//


///

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerType: {
      type: String,
      enum: ["guest", "registered"],
      required: true,
    },
    orderReference: {
      type: String, // Stores userId for registered users or guest email for guest users
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.customerType === "registered";
      }, // Only required for logged-in users
    },
    guestUser: {
      email: { type: String, required: function () { return this.customerType === "guest"; } },
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      phone: { type: String, required: false },
    },
    shippingAddress: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      apartment: { type: String, required: false },
      city: { type: String, required: true },
      postalCode: { type: String, required: false },
      phone: { type: String, required: true },
    },
    billingAddress: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      apartment: { type: String, required: false },
      city: { type: String, required: true },
      postalCode: { type: String, required: false },
      phone: { type: String, required: true },
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: String,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true },
    orderTrackingId: { type: String, unique: true, required: true },
    adminNote: { type: String, default: "" }, // Optional notes for admins
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
// export default Order;






const express = require("express");
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, getOrderByReference } = require("../controllers/orderController");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// 1. Place an order (Guest or Logged-in)
router.post("/place-order", placeOrder);

// 2. Get orders of a logged-in user
router.get("/my-orders", isAuthenticated, getUserOrders);

// 3. Get all orders (Admin)
router.get("/admin/orders", isAuthenticated, isAdmin, getAllOrders);

// 4. Update order status (Admin)
router.put("/admin/orders/:orderId", isAuthenticated, isAdmin, updateOrderStatus);

// 5. Get order by reference (Guest or Admin)
router.get("/order/:reference", getOrderByReference);

module.exports = router;










import React, { useState } from "react";
import { useCart } from "../cart Page/cartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null); // Replace with actual user authentication logic

  const [billingAddress, setBillingAddress] = useState({
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const navigate = useNavigate();
  const shippingCost = 3000;

  const subtotal = cart.reduce((acc, item) => {
    const price = parseFloat(item.price.toString().replace(/,/g, "")) || 0;
    const quantity = item.quantity ?? 1;
    return acc + price * quantity;
  }, 0);

  const total = subtotal + shippingCost;

  // Validate form
  const validateForm = () => {
    let tempErrors = {};
    if (!billingAddress.firstName.trim()) tempErrors.firstName = "First name is required.";
    if (!billingAddress.lastName.trim()) tempErrors.lastName = "Last name is required.";
    if (!billingAddress.address.trim()) tempErrors.address = "Address is required.";
    if (!billingAddress.phone.trim()) tempErrors.phone = "Phone number is required.";
    if (!user && !email.trim()) tempErrors.email = "Email is required for guest checkout.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompleteOrder = () => {
    if (!validateForm()) return;
    setShowModal(true);
  };

  const confirmOrder = async () => {
    setShowModal(false);

    const orderData = {
      cartItems: cart,
      totalAmount: total,
      shippingAddress: billingSameAsShipping ? billingAddress : null,
      billingAddress: billingSameAsShipping ? billingAddress : billingAddress,
      customerType: user ? "registered" : "guest",
      orderReference: user ? user.id : email, // Store user ID if registered, email if guest
    };

    try {
      const response = await fetch("/api/orders/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        navigate(`/order-success/${data.order.orderReference}`);
      }
    } catch (error) {
      console.error("Order placement failed:", error);
    }
  };

  return (
    <div className="flex justify-center p-6 bg-gray-300 min-h-screen mt-30">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl w-full grid grid-cols-4 gap-6">
        {/* Left Side - Form */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <input
            type="email"
            placeholder="Email or mobile phone number"
            className={`w-full p-2 border rounded mb-4 ${errors.email ? "border-red-500" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          <label className="flex items-center mb-4">
            <input type="checkbox" className="mr-2" /> Email me with news and offers
          </label>

          <h2 className="text-xl font-semibold mb-4">Delivery</h2>
          <select className="w-full p-2 border rounded mb-4">
            <option>Pakistan</option>
          </select>
          <div className="grid grid-cols-2 gap-x-4">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={billingAddress.firstName}
              onChange={handleBillingChange}
              className={`w-full p-2 border rounded ${errors.firstName ? "border-red-500" : ""}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={billingAddress.lastName}
              onChange={handleBillingChange}
              className={`w-full p-2 border rounded ${errors.lastName ? "border-red-500" : ""}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
          </div>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={billingAddress.address}
            onChange={handleBillingChange}
            className={`w-full p-2 border rounded mt-3 ${errors.address ? "border-red-500" : ""}`}
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

          <h2 className="text-xl font-semibold mt-6 mb-4">Billing address</h2>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={() => setBillingSameAsShipping(!billingSameAsShipping)}
              className="mr-2"
            />
            Same as shipping address
          </label>

          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-6"
            onClick={handleCompleteOrder}
          >
            Complete order
          </button>
        </div>

        {/* Right Side - Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full col-span-2">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">No items in the cart.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-wrap text-xs">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                  </div>
                  <span className="font-semibold text-sm">Rs {item.price}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-xl">Rs {total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Your Order</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={confirmOrder}>
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;












// <div className="grid grid-cols-2 gap-x-4">
// <input
//   type="text"
//   name="firstName"
//   placeholder="First name"
//   value={billingAddress.firstName}
//   onChange={handleBillingChange}
//   className={`w-full p-2 border rounded ${errors.firstName ? "border-red-500" : ""}`}
// />
// {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}


// <input
//   type="text"
//   name="lastName"
//   placeholder="Last name"
//   value={billingAddress.lastName}
//   onChange={handleBillingChange}
//   className={`w-full p-2 border rounded ${errors.lastName ? "border-red-500" : ""}`}
// />
// {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
// </div>

// <input
//   type="text"
//   name="address"
//   placeholder="Address"
//   value={billingAddress.address}
//   onChange={handleBillingChange}
//   className={`w-full p-2 mt-1 md:mt-3 border rounded ${errors.address ? "border-red-500" : ""}`}
// />
// {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
// <input
//   type="text"
//   placeholder="Apartment, suite, etc. (optional)"
//   className="w-full p-2 mt-1 md:mt-3 border rounded mb-4"
// />
// <div className="grid grid-cols-2 gap-4">
//   <input type="text" placeholder="City" className="p-2  border rounded" />
//   <input type="text" placeholder="Postal code (optional)" className="p-2 border rounded" />
// </div>
// <input
//   type="text"
//   name="phone"
//   placeholder="Phone"
//   value={billingAddress.phone}
//   onChange={handleBillingChange}
//   className={`w-full p-2 mt-1 md:mt-3 border rounded ${errors.phone ? "border-red-500" : ""}`}
// />
// {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}




export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, orderItems, totalPrice } = req.body;

    if (!billingAddress || !shippingAddress || !orderItems.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let customerType = req.user ? "registered" : "guest";
    let orderReference = req.user ? req.user._id : billingAddress.email;

    let user = null;
    if (customerType === "registered") {
      user = await User.findById(orderReference);
      if (!user) return res.status(404).json({ message: "User not found." });
    }

    const orderTrackingId = uuidv4();

    const newOrder = new Order({
      customerType,
      orderReference,
      user: user ? user._id : null,
      guestUser: customerType === "guest" ? { email: billingAddress.email } : null,
      shippingAddress,
      billingAddress,
      orderItems,
      totalPrice,
      orderTrackingId,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1]; // Bearer Token

  if (!token) return next(); // No token = Guest user

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.log("Invalid token:", error);
    next(); // Continue as guest user
  }
};





import express from "express";
import User from "../models/model.user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { protect2, adminProtect } from "../middleware/auth.js";

const router = express.Router();

// Utility function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register User (Handles all roles)
router.post("/signup", async (req, res) => {
  try {
    console.log("Received Signup Request:", req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const validRoles = ["customer", "admin", "guest", "seller", "delivery person"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup Backend Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login User (Handles all roles)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





const createSendToken = (user,statusCode, res)=>{

  const token = signToken(user._id);

  const cookieOptions = {
    expires:new Date( Date.now() + 90 *24 *60*60*1000),
    // secure:false,
    httpOnly:true

  }

  res.cookie("jwt", token, cookieOptions)


  res.status(statusCode).json({
    status:"Success",
    token,
    data:{
      user,
    },
  });
};

