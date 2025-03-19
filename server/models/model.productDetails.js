const mongoose = require("mongoose");

const ProductDetailsSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    description: { type: String, required: true },
    specifications: [
        {
            key: { type: String, required: true },  // Example: "Display Size"
            value: { type: String, required: true }  // Example: "55 inches"
        }
    ],
    features: { type: [String] }, // Example: ["4K UHD", "Smart TV", "HDR Support"]
    additionalInfo: { type: String }, // Example: "Warranty: 2 Years"
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now },
        }
    ]
}, { timestamps: true });

// Indexing for better performance
ProductDetailsSchema.index({ productId: 1 });

module.exports = mongoose.model("ProductDetails", ProductDetailsSchema);












// const ProductSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     brand: { type: String, required: true },
//     price: { type: Number, required: true },
//     discount: { type: Number, default: 5 },
//     actualPrice: { type: Number, required: true },
//     discountedPrice: { type: Number },
//     available: { type: Boolean, required: true, default: true },
//     categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "CategoryModel", required: true },
//     subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubcategoryModel", required: true },
//     mainImage: { type: String, required: true },
//     images: { type: [String], default: [] },
//     description: { type: String, required: true },  // ✅ Product description
//     specifications: { type: Map, of: String },  // ✅ Key-value pair for specifications
//     features: { type: [String] },  // ✅ List of product features
//     additionalInfo: { type: String },  // ✅ Any extra information
//     reviews: [
//         {
//             userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
//             rating: { type: Number, min: 1, max: 5 },
//             comment: { type: String },
//             createdAt: { type: Date, default: Date.now },
//         }
//     ]
// });
