import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/model.product.js";
import Featured from "../models/model.featured.js";
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

const router = express.Router();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer storage for temporary file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Function to normalize SKU (to avoid scientific notation issues)
const normalizeSKU = (sku) => {
  return String(sku).replace(/[^0-9a-zA-Z]/g, "").trim();
};

const extractSkuFromFilename = (filename) => {
    return filename.split("-")[0].replace(/\D/g, ""); // Removes non-numeric characters
  };
  console.log('normalizeSku :', normalizeSKU);
  console.log("extractedSkuFromFileName:" ,extractSkuFromFilename)
// ✅ Bulk Product Upload Route
router.post(
    "/bulk-upload",
    upload.fields([{ name: "csvFile" }, { name: "images" }]),
    async (req, res) => {
      try {
        if (!req.files || !req.files["csvFile"]) {
          console.error("❌ No CSV file uploaded");
          return res.status(400).json({ error: "CSV file is required" });
        }
  
        const csvFilePath = req.files["csvFile"][0].path;
        const imageFiles = req.files["images"] || [];
        let productImageMap = {};
  
        console.log("✅ CSV file received:", csvFilePath);
        console.log("✅ Images received:", imageFiles.map((file) => file.originalname));
  
        // 🔹 Extract SKU from image filenames & map URLs
        for (const file of imageFiles) {
          try {
            const result = await cloudinary.uploader.upload(file.path);
            const fileName = extractSkuFromFilename(file.originalname);
            
            if (!productImageMap[fileName]) productImageMap[fileName] = [];
            productImageMap[fileName].push(result.secure_url);
            
            fs.unlinkSync(file.path); // Remove local file after upload
            console.log(`✅ Image uploaded: ${file.originalname} -> ${result.secure_url}`);
          } catch (imgError) {
            console.error("❌ Image upload failed:", imgError);
            return res.status(500).json({ error: "Image upload failed", details: imgError.message });
          }
        }
  
        let productsData = [];
        let missingImageProducts = [];
  
        // 🔹 Read CSV file and process product data
        fs.createReadStream(csvFilePath)
          .pipe(csvParser())
          .on("data", (data) => {
            let productId = normalizeSKU(data.sku).replace(/\D/g, ""); // Ensure SKU matches image mapping
  
            console.log("📌 Extracted SKU from CSV:", productId);
            console.log("📌 Available Image SKUs:", Object.keys(productImageMap));
  
            const productImages = productImageMap[productId] || [];
  
            const productEntry = {
              name: data.name || "Unnamed Product",
              sku: productId,
              price: parseFloat(data.price) || 0,
              actualPrice: parseFloat(data.actualPrice) || parseFloat(data.price) || 0,
              available: data.available?.toLowerCase() === "true",
              categoryId: data.categoryId || null,
              subcategoryId: data.subcategoryId || null,
              brand: data.brand || "Unknown",
              imageUrl: productImages.length > 0 ? productImages[0] : null,
              images: productImages,
            };
  
            if (!productEntry.imageUrl) {
              missingImageProducts.push(productEntry);
            } else {
              productsData.push(productEntry);
            }
          })
          .on("end", async () => {
            if (missingImageProducts.length > 0) {
              console.error("❌ Some products are missing images:", missingImageProducts);
              return res.status(400).json({
                error: "Some products are missing a valid image URL",
                missingProducts: missingImageProducts,
              });
            }
  
            try {
              console.log("✅ Saving products to DB...", productsData);
              const savedProducts = await Product.insertMany(productsData);
              console.log("✅ Products saved successfully");
  
              fs.unlinkSync(csvFilePath); // Delete CSV file
              res.status(201).json({ message: "Upload successful", products: savedProducts });
            } catch (dbError) {
              console.error("❌ Database error:", dbError);
              res.status(500).json({ error: "Database error", details: dbError.message });
            }
          });
      } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
      }
    }
  );
  


  // Get all products with category and subcategory data
router.get("/", async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    const products = await Product.find()
      .populate("categoryId")
      .populate("subcategoryId")
      .lean(); // Convert to plain JavaScript objects for better performance

    if (!products.length) {
      console.log('⚠️ No products found in database');
      return res.status(404).json({ message: "No products found" });
    }

    console.log(`✅ Successfully fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      error: "Failed to fetch products",
      details: error.message
    });
  }
});


// Get all products of a specific subcategory
router.get("/subcategory/:subcategoryId", async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    console.log(`📦 Fetching products for subcategory: ${subcategoryId}`);

    const products = await Product.find({ subcategoryId })
      .populate("categoryId")
      .populate("subcategoryId")
      .lean();

    if (!products.length) {
      console.log(`⚠️ No products found for subcategory: ${subcategoryId}`);
      return res.status(404).json({ message: "No products found for this SubCategory" });
    }

    console.log(`✅ Successfully fetched ${products.length} products for subcategory`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching subcategory products:', error);
    res.status(500).json({
      error: "Failed to fetch subcategory products",
      details: error.message
    });
  }
});



// Get All Products of Specific Category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`📦 Fetching products for category: ${categoryId}`);

    const products = await Product.find({ categoryId })
      .populate("categoryId")
      .populate("subcategoryId")
      .lean();

    if (!products.length) {
      console.log(`⚠️ No products found for category: ${categoryId}`);
      return res.status(404).json({ message: "No products found for this category" });
    }

    console.log(`✅ Successfully fetched ${products.length} products for category`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching category products:', error);
    res.status(500).json({
      error: "Failed to fetch category products",
      details: error.message
    });
  }
});


  router.get("/filters", async(req, res)=>{

    try {
      const {maxPrice} = req.query;
      console.log(req.query.maxPrice);
      let filter = {};
    
      if (maxPrice && !isNaN(maxPrice)) {
       filter.price = { $lte: parseInt(maxPrice, 10) };
     }
      const products = await Product.find(filter);
      res.json(products);
    
    } catch (error) {
     res.status(500).json({error:"Server error"})
     
    }
   });



  // Get products with search query 
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { brand: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err });
  }
});

// Get a Single Product from Id.

router.get("/:id", async(req, res)=>{
  try {


    const productId = req.params.id;
    console.log(productId);
    const product = await Product.findById(productId)
          .populate("categoryId") //
          .populate("subcategoryId");

    if(!product){
      return res.status(404).json({message:"Product not found"});
    }
    res.json(product);
    
  } catch (error) {

    res.status(500).json({error:error.message});
  }
});

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    console.log('📦 Fetching featured products...');
    const featuredProducts = await Featured.find({
      type: 'featured',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('product')
    .sort({ priority: -1, createdAt: -1 })
    .limit(8);

    if (!featuredProducts.length) {
      console.log('⚠️ No featured products found');
      return res.status(404).json({ message: "No featured products found" });
    }

    const products = featuredProducts.map(item => ({
      ...item.product.toObject(),
      featuredId: item._id,
      discount: item.discount,
      description: item.description,
      bannerImage: item.bannerImage
    }));

    console.log(`✅ Successfully fetched ${products.length} featured products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({
      error: "Failed to fetch featured products",
      details: error.message
    });
  }
});

// Get special offers
router.get("/special-offers", async (req, res) => {
  try {
    console.log('📦 Fetching special offers...');
    const specialOffers = await Featured.find({
      type: 'special_offer',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('product')
    .sort({ priority: -1, createdAt: -1 })
    .limit(4);

    if (!specialOffers.length) {
      console.log('⚠️ No special offers found');
      return res.status(404).json({ message: "No special offers found" });
    }

    const products = specialOffers.map(item => ({
      ...item.product.toObject(),
      featuredId: item._id,
      discount: item.discount,
      description: item.description,
      bannerImage: item.bannerImage,
      startDate: item.startDate,
      endDate: item.endDate
    }));

    console.log(`✅ Successfully fetched ${products.length} special offers`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching special offers:', error);
    res.status(500).json({
      error: "Failed to fetch special offers",
      details: error.message
    });
  }
});

// Get related products by category
router.get('/related/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Find products with the same category, excluding the current product
    const products = await Product.find({ 
      category,
      _id: { $ne: req.query.productId } // Exclude current product if productId is provided
    })
    .select('-description') // Exclude description for better performance
    .limit(4); // Limit to 4 related products

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: error.message
    });
  }
});

export default router;
