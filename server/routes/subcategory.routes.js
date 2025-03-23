import express from 'express';
import mongoose from 'mongoose';
import SubcategoryModel from '../models/model.subcategory.js';
import CategoryModel from '../models/model.category.js';
import Product from '../models/model.product.js';
const router = express.Router();

// add subcategory

router.post("/add-subcategory", async(req, res)=>{

    try {

        const category = await CategoryModel.findById(req.body.categoryId);
        if(!category) return res.status(404).json({message:"Category not found"});

        const subcategory = new SubcategoryModel({name:req.body.name, category:category._id});
        await subcategory.save();
        res.status(201).json(subcategory);
        

    } catch (error) {

        res.status(500).json({error:error.message});
        
    }
});


// Api to get All Sub Categories
router.get("/", async(req, res)=>{

    try {

        const subcategories = await SubcategoryModel.find().populate("category");
        res.json(subcategories);
        
    } catch (error) {
        
        res.status(500).json({error:error.message});
    }

});

// Get all Subcategories of a specific category
router.get("/category/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({error:"Invalid Category ID format"});
        }
        // Ensure categoryId is converted to ObjectId
        const subcategoryByCatId = await SubcategoryModel.find({
            category: new mongoose.Types.ObjectId(categoryId)
        }).populate("category");

        res.json(subcategoryByCatId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get a single subcategory by ID
router.get("/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(subcategoryId)){
            return res.status(400).json({error:"Invalid Subcategory ID format"});
        }
        
        const subcategory = await SubcategoryModel.findById(subcategoryId).populate("category");
        
        if(!subcategory) {
            return res.status(404).json({message:"Subcategory not found"});
        }
        
        res.json(subcategory);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});

// Update a subcategory
router.put("/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const { name, categoryId } = req.body;
        
        if(!mongoose.Types.ObjectId.isValid(subcategoryId)){
            return res.status(400).json({error:"Invalid Subcategory ID format"});
        }
        
        // Validate input
        if(!name || name.trim() === '') {
            return res.status(400).json({error:"Subcategory name is required"});
        }
        
        const updateData = { name };
        
        // If category is being updated, verify the category exists
        if(categoryId) {
            if(!mongoose.Types.ObjectId.isValid(categoryId)){
                return res.status(400).json({error:"Invalid Category ID format"});
            }
            
            const category = await CategoryModel.findById(categoryId);
            if(!category) {
                return res.status(404).json({message:"Category not found"});
            }
            
            updateData.category = categoryId;
        }
        
        const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(
            subcategoryId,
            updateData,
            { new: true, runValidators: true }
        ).populate("category");
        
        if(!updatedSubcategory) {
            return res.status(404).json({message:"Subcategory not found"});
        }
        
        res.json(updatedSubcategory);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});

// Delete a subcategory
router.delete("/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(subcategoryId)){
            return res.status(400).json({error:"Invalid Subcategory ID format"});
        }
        
        // Check if there are products using this subcategory
        const products = await Product.find({ subcategoryId });
        if(products.length > 0) {
            return res.status(400).json({
                error: "Cannot delete subcategory with associated products",
                productCount: products.length
            });
        }
        
        const deletedSubcategory = await SubcategoryModel.findByIdAndDelete(subcategoryId);
        
        if(!deletedSubcategory) {
            return res.status(404).json({message:"Subcategory not found"});
        }
        
        res.json({
            success: true,
            message: "Subcategory deleted successfully",
            deletedSubcategory
        });
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});

// Search subcategories by name
router.get("/search/:query", async (req, res) => {
    try {
        const { query } = req.params;
        const subcategories = await SubcategoryModel.find({
            name: { $regex: query, $options: "i" }
        }).populate("category");
        
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});




export default router;

