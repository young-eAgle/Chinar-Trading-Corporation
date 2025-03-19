import React, { useState } from "react";
import axios from "axios";

const BulkUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === "csvFile") {
      setCsvFile(files[0]);  // Set CSV file
    } else if (name === "images") {
      setImages((prevImages) => [...prevImages, ...files]); // Ensure latest state is used
    }
  };

  const handleUpload = async () => {
    if (!csvFile) return alert("Please upload a CSV file");

    const formData = new FormData();
    formData.append("csvFile", csvFile);
    images.forEach((img) => formData.append("images", img));

    setUploading(true);
    try {
      const response = await axios.post(
        "http://46.202.166.65/products/bulk-upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("Upload successful!");
    } catch (error) {
      setMessage("Upload failed: " + error.message);
    }
    setUploading(false);
  };

  return (
    <div className="p-6 w-full mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Bulk Product Upload</h2>

      <div className="w-full container bg-red-400 flex justify-center">
        <div className="csv-image-upload w-200 flex justify-center gap-10 bg-yellow-100 p-5">
          
          {/* CSV INPUT */}
          <label htmlFor="csvUpload" className="w-[200px] h-[200px] text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center">
            Click to upload CSV
            <input
              id="csvUpload"
              type="file"
              name="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* IMAGES INPUT */}
          <label htmlFor="imageUpload" className="w-[200px] h-[200px] text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center">
            Click to upload Images
            <input
              id="imageUpload"
              type="file"
              multiple
              name="images"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

        </div>
      </div>

      {/* Uploaded File Preview */}
      <div>
        <p className="text-sm text-gray-700">Selected CSV: {csvFile ? csvFile.name : "No file selected"}</p>
        <p className="text-sm text-gray-700">Selected Images: {images.length > 0 ? images.map(img => img.name).join(", ") : "No images selected"}</p>
      </div>

      {/* Upload Button */}
      <div className="button-container w-lg mx-auto">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default BulkUpload;
