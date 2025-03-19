import mongoose from "mongoose";


const SubCategorySchema = new mongoose.Schema({
    name:{type:String, required:true},
    category:{type:mongoose.Schema.Types.ObjectId, ref:"CategoryModel", required:true}
});

export default mongoose.model("SubcategoryModel", SubCategorySchema);
