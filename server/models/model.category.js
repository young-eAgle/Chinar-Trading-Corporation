import mongoose from "mongoose";


const CategorySchema = new mongoose.Schema({

    name:{type:String, required:true, unique:true},

});

export default mongoose.model("CategoryModel", CategorySchema);








// import mongoose from "mongoose";

// const categorySchema = mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     images:[
//     {

//         type:String,
//         required:true

//         }
//     ]
//     ,

// })

// export default mongoose.model('Category', categorySchema);
