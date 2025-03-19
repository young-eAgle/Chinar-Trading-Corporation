import mongoose from "mongoose";



const category2Schema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    images:[
        {type:String}
    ],
    parentId :{
        type:String
    }
},{timestamps:true})

export default mongoose.model('Category2', category2Schema);