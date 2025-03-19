import express from 'express';
import Categories from '../models/model.drop-category.js';

const router = express.Router();


router.get('/categories', async(req, res)=>{
    try {

        const categories = await Categories.find();

        res.json(categories);
        
    } catch (error) {

        res.status(500).json({message:"Server error"})
        
    }
})

export default router;

