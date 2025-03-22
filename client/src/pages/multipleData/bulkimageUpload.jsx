import { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

export default function BulkImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const uploadImages = async () => {
    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append("images", file);
      console.log(uploadedImages);
    }

    try {
      const response = await axios.post(`${API_URL}/bulk/bulk-images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedImages(response.data.images);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col">
      <input type="file" multiple onChange={handleFileChange} className="mb-4 w-60 h-60 border-2 rounded cursor-pointer m-3" />
      <button
        onClick={uploadImages}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Upload Images
      </button>
      <div className="mt-4">
        {uploadedImages.map((img, index) => (
          <div key={index} className="border p-2">
            <p className="text-sm">{img.filename}</p>
            <img src={img.url} alt={img.filename} className="h-16" />
            <p className="text-xs break-all">{img.url}</p> {/* Display full URL */}
          </div>
        ))}
      </div>

      {/* <div className="mt-4">
        {uploadedImages.map((img) => (
          <div key={img.filename} className="border p-2">
            <img src={img.url} alt={img.filename} className="h-16" />
          </div>
        ))}
      </div> */}
    </div>
  );
}
