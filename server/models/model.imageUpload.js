import mongoose from "mongoose";

const imageUploadSchema = mongoose.Schema({
    images:[
        {
        type:String,
        required:true
        }
    ]
})

export default mongoose.model('imageUpload', imageUploadSchema);