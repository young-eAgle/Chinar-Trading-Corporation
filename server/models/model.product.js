import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Product name is required"],
        trim: true,
        index: true 
    },
    brand: { 
        type: String, 
        required: [true, "Brand is required"],
        trim: true,
        index: true 
    },
    price: { 
        type: Number, 
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    discount: { 
        type: Number, 
        default: 5,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },
    actualPrice: { 
        type: Number, 
        required: [true, "Actual price is required"],
        min: [0, "Actual price cannot be negative"]
    },
    discountedPrice: { 
        type: Number,
        min: [0, "Discounted price cannot be negative"]
    },
    available: { 
        type: Boolean, 
        required: true, 
        default: true,
        index: true
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "CategoryModel", 
        required: [true, "Category is required"],
        index: true
    },
    subcategoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SubcategoryModel", 
        required: [true, "Subcategory is required"],
        index: true
    },
    imageUrl: { 
        type: String, 
        required: [true, "Main image is required"],
        trim: true
    },
    images: { 
        type: [String], 
        default: [],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.every(url => typeof url === 'string' && url.trim().length > 0);
            },
            message: 'Images must be an array of valid URLs'
        }
    },
    company: { 
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Automatically calculate `discountedPrice`
ProductSchema.pre("save", function(next) {
    if (this.isModified('actualPrice') || this.isModified('discount')) {
        this.discountedPrice = this.actualPrice - (this.actualPrice * (this.discount / 100));
    }
    next();
});

// Indexes for faster search
ProductSchema.index({ name: 'text', brand: 'text' }); // Text search index
ProductSchema.index({ price: 1 }); // Price sorting index
ProductSchema.index({ categoryId: 1, subcategoryId: 1 }); // Category/Subcategory filter index

// Virtual for product status
ProductSchema.virtual('status').get(function() {
    if (!this.available) return 'out_of_stock';
    if (this.discount > 0) return 'on_sale';
    return 'in_stock';
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function() {
    return this.available;
};

// Static method to find products by price range
ProductSchema.statics.findByPriceRange = function(min, max) {
    return this.find({
        price: {
            $gte: min,
            $lte: max
        }
    });
};

export default mongoose.model("Product", ProductSchema);




// import mongoose from "mongoose";
// import { availableMemory } from "process";



// const ProductSchema = new mongoose.Schema({

//     name:{type:String, required:true},
//     brand:{type:String, required:true},
//     price:{type:Number, required:true},
//     discount:{type:Number, default:5},
//     actualPrice:{type:Number,required:true},
//     discountedPrice:{type:Number},
//     available :{type:Boolean, required:true},
//     categoryId:{type:mongoose.Schema.Types.ObjectId, ref:"CategoryModel", required:true},
//     subcategoryId:{type:mongoose.Schema.Types.ObjectId, ref:"SubcategoryModel", required:true},
//     images: { type: [String], default: [] }, // ✅ Supports multiple images
//     imageUrl: { type: String, required:true  },
//     company:{type:String}
// });


// ProductSchema.pre("save", function(next){
//     this.discountedPrice = this.actualPrice - (this.actualPrice * this.discount)/100;
//     next();

// });

// export default mongoose.model("Product", ProductSchema);