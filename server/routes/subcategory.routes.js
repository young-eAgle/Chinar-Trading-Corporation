import express from 'express';
import mongoose from 'mongoose';
import SubcategoryModel from '../models/model.subcategory.js';
import CategoryModel from '../models/model.category.js';
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

        // Ensure categoryId is converted to ObjectId
        const subcategoryByCatId = await SubcategoryModel.find({
            category: new mongoose.Types.ObjectId(categoryId)
        }).populate("category");

        res.json(subcategoryByCatId);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// router.get("/category/:categoryId", async(req, res)=>{

// try {
//         const {categoryId} = req.params;
//         const subcategoryByCatId = await SubcategoryModel.find({category:categoryId}).populate("category");
//         console.log(req.params);
//         res.json(subcategoryByCatId);
// } catch (error) {

//     res.status(500).json({error:error.message})
    
// }

// })



export default router;

