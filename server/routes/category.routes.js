
import express from "express";
import CategoryModel from '../models/model.category.js';
import mongoose from "mongoose";
const router = express.Router();


// Add Category


router.post("/add-category", async(req,res)=>{
    try {
        
        const category = new CategoryModel({name:req.body.name});
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({error:error.message});
    }

});


// Get all Categories
router.get("/", async(req, res)=>{
    try {
        
        const categories = await CategoryModel.find();
        res.json(categories);
    } catch (error) {
        
        res.status(500).json({error:error.message});
    }
});


// Get a single Category
router.get("/:categoryId", async(req, res)=>{

  try {
      const {categoryId} = req.params;
      if(!mongoose.Types.ObjectId.isValid(categoryId)){
        return res.status(400).json({error:"Invalide Category ID format"})
      }
      const category = await CategoryModel.findById(categoryId);
      if (!category) return res.status(404).json({ message: "Category not found" })
      console.log(req.params);
      res.json(category);
  } catch (error) {
    
    res.status(500).json({ error: error.message });
  }

})



export default router;











// import Category from '../models/model.category.js';
// import express from 'express';
// import pLimit from 'p-limit';
// import { v2 as cloudinary } from "cloudinary";   
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// const router = express.Router(); 

// // Log environment variables to check if they are loaded
// console.log("Cloudinary Config:", {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET ? "Exists" : "Missing",
// });


// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });





// // const images = [ 
// //     'https://www.jiomart.com/images/products/original/rvydqrdlkv/glamhood'
// // ]

// router.get('/', async(req, res)=>{


//     const categoryList = await Category.find();
//     if(!categoryList){
//         res.status(500).json({success:false})
//     }
//     res.send(categoryList);

// });

// // GET BY ID Route.

// router.get('/:id', async(req,res)=>{

//     const category = await Category.findById(req.params.id);

//     if(!category){

//         res.status(500).json({message:"The category with the given ID was not found"});
//     }
//     return res.status(200).send(category);



// })

// // Delete By ID Route

// router.delete('/:id', async(req, res)=>{

//     const deletedUser = await Category.findByIdAndDelete  (req.params.id);

//     if(!deletedUser){
//         res.status(404).json({message:'Category not find!',
//             success:false

//         })
//     }
//     res.status(200).json({
//         success:true,
//         message:'Category Deleted!'
//     })

// })



// // POST Route updated Code
// router.post("/create", async (req, res) => {
//     try {
//         console.log("Received Request Body:", req.body);

//         // Validate request
//         if (!req.body || !req.body.images || !Array.isArray(req.body.images)) {
//             return res.status(400).json({ error: "Invalid request body" });
//         }

//         let uploadedImages = [];

//         // Upload all images concurrently
//         await Promise.all(
//             req.body.images.map(async (imageUrl) => {
//                 try {
//                     let result = await cloudinary.uploader.upload(imageUrl);
//                     uploadedImages.push(result.secure_url);
//                 } catch (uploadError) {
//                     console.error("Cloudinary Upload Error:", uploadError);
//                 }
//             })
//         );

//         // If no images were uploaded, return an error
//         if (uploadedImages.length === 0) {
//             return res.status(500).json({ error: "No images were uploaded!" });
//         }

//         // Save category in DB
//         let category = new Category({
//             name: req.body.name,
//             images: uploadedImages,
//         });

//         category = await category.save();
//         return res.status(201).json(category);
//     } catch (error) {
//         console.error("Upload Error:", error);
//         return res.status(500).json({ error: error.message, success: false });
//     }
// });



// // router.post('/create', async(req,res)=>{

// //     console.log("===== DEBUGGING REQUEST =====");
// //     console.log("Headers:", req.headers); // Should include Content-Type
// //     console.log("Content-Type:", req.get('Content-Type')); // Should be application/json
// //     console.log("Raw Request Body:", req.body); // Check if body is undefined
// //     console.log("================================");

// //     if (!req.body.images || !Array.isArray(req.body.images)) {
// //         return res.status(400).json({ error: "Images array is required" });
// //     }


// //     res.json({ message: "Request received", body: req.body });

// //     const limit = pLimit(2);

// //     const imagesToUpload = req.body.images.map((image)=>{
// //         return limit(async ()=>{
// //             const result = await cloudinary.uploader.upload(image);
// //             console.log(`Successfully uploaded ${image}`);
// //             console.log(`Result: ${result.secure_url}`);
// //             return result;

// //         })

// //     });


  

// // try {
    
// //         const uploadStatus = await Promise.all(imagesToUpload);
    
// //         const imgurl = uploadStatus.map((item)=>{
// //             return item.secure_url
    
// //         });
    
    
// //         if(!uploadStatus){
// //             return res.status(500).json({
// //                 error:"images are not uploaded!",
// //                 status:false    
// //             })
// //         }
    
// //         let category = new Category({
// //             name:req.body.name,
// //             images:imgurl
// //         });
    
// //         if(!category){
// //             res.status(500).json({
// //                 error:err,
// //                 success:false
// //             })
// //         }
     
// //         category = await category.save();
    
// //         res.status(201).json(category);
// // } catch (error) {
// //     console.error("Upload Error:", error);
// //         res.status(500).json({ error: error.message, success: false });
// // }


// // })




// router.put('/:id', async (req,res)=>{



//     // const limit = pLimit(2);

//     // const imagesToUpload = req.body.images.map((image)=>{
//     //     return limit(async ()=>{
//     //         const result = await cloudinary.uploader.upload(image);
//     //         console.log(`Successfully uploaded ${image}`);
//     //         console.log(`Result: ${result.secure_url}`);
//     //         return result;

//     //     })

//     // });

//     // const uploadStatus = await Promise.all(imagesToUpload);
    
//     // const imgurl = uploadStatus.map((item)=>{
//     //     return item.secure_url

//     // });


//     // if(!uploadStatus){
//     //     return res.status(500).json({
//     //         error:"images are not uploaded!",
//     //         status:false    
//     //     })
//     // }

//     let uploadedImages = [];

//     await Promise.all(

//         req.body.images.map(async(imageUrl)=>{

//             try{

//                 let result =await cloudinary.uploader.upload(imageUrl);
//                 uploadedImages.push(result.secure_url);

//             }catch(uploadError){
//                 console.error("Cloudinary Upload Error:", uploadError);

//             }
//         })
//     ); 

//     // when no images are uploaded

//     if(uploadedImages.length===0){
//         return res.status(500).json({error:"No images were uploaded"})
//     }



//     const category = await Category.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             images: uploadedImages,

//         },
//         {new:true}
//     )
//     if(!category){
//         return res.status(500).json({
//             message:"Category cannot be updated",
//             success:false
//         })
//     }
//     res.send(category);


// })


// export default router;