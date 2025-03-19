import { useState } from "react";
import axios from "axios";

export default function BulkProductUpload() {
  const [jsonFile, setJsonFile] = useState(null);

  const handleFileChange = (event) => {
    setJsonFile(event.target.files[0]);
  };

  const uploadJSON = async () => {
    if (!jsonFile) {
      alert("Please select a file!");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(jsonFile);
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await axios.post("http://localhost:5000/bulk/bulk-products", jsonData);
        alert("Products uploaded successfully!");
      } catch (error) {
        console.error("Error uploading products:", error);
      }
    };
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md flex flex-col rounded-lg">
      <input type="file" accept=".json" onChange={handleFileChange} className="mb-4 w-60 h-60 border rounded" />
      <button
        onClick={uploadJSON}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Upload JSON
      </button>
    </div>
  );
}
