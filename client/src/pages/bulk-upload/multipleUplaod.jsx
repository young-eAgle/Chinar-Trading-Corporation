import React from 'react'
import BulkImageUpload from '../multipleData/bulkimageUpload'
import BulkJsonUpload  from  '../multipleData/bulkJson'
 
const multipleUplaod = () => {
  return (
    <div className='flex gap-5 mt-50'>

      <BulkImageUpload/>
      <BulkJsonUpload/>

    </div>
  )
}

export default multipleUplaod




// import React, { useState } from "react";
// import axios from "axios";

// const ProductUpload = () => {
//   const [products, setProducts] = useState([
//     { name: "", sku: "", price: "", categoryId: "", brand: "", images: [] },
//   ]);
//   const [selectedImages, setSelectedImages] = useState([]);

//   // 📌 Handle Image Selection
//   const handleImageChange = (event, productIndex) => {
//     const files = Array.from(event.target.files);
//     let updatedProducts = [...products];
//     updatedProducts[productIndex].images = files; // Attach images to the product
//     setProducts(updatedProducts);
//   };

//   // 📌 Upload Images and Get URLs
//   const uploadImages = async (productIndex) => {
//     const formData = new FormData();
//     products[productIndex].images.forEach((file) => formData.append("images", file));

//     try {
//       const response = await axios.post("http://localhost:5000/api/upload-images", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       // Update product data with received image URLs
//       let updatedProducts = [...products];
//       updatedProducts[productIndex].images = response.data.imageUrls;
//       setProducts(updatedProducts);

//       alert("Images uploaded successfully!");
//     } catch (error) {
//       console.error("Image upload failed:", error);
//     }
//   };

//   // 📌 Handle Input Change for Product Fields
//   const handleInputChange = (event, index) => {
//     const { name, value } = event.target;
//     const updatedProducts = [...products];
//     updatedProducts[index][name] = value;
//     setProducts(updatedProducts);
//   };

//   // 📌 Add New Product Row
//   const addNewProduct = () => {
//     setProducts([...products, { name: "", sku: "", price: "", categoryId: "", brand: "", images: [] }]);
//   };

//   // 📌 Submit All Products to Backend
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       const response = await axios.post("http://localhost:5000/api/products", { products });
//       alert("Products uploaded successfully!");
//       console.log(response.data);
//     } catch (error) {
//       console.error("Product upload failed:", error);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
//       <h2 className="text-2xl font-bold mb-4 text-center">Bulk Product Upload</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {products.map((product, index) => (
//           <div key={index} className="border-b pb-4">
//             <h3 className="text-lg font-semibold mb-2">Product {index + 1}</h3>

//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 name="name"
//                 value={product.name}
//                 placeholder="Product Name"
//                 onChange={(e) => handleInputChange(e, index)}
//                 className="p-2 border rounded w-full"
//                 required
//               />
//               <input
//                 type="text"
//                 name="sku"
//                 value={product.sku}
//                 placeholder="SKU"
//                 onChange={(e) => handleInputChange(e, index)}
//                 className="p-2 border rounded w-full"
//                 required
//               />
//               <input
//                 type="number"
//                 name="price"
//                 value={product.price}
//                 placeholder="Price"
//                 onChange={(e) => handleInputChange(e, index)}
//                 className="p-2 border rounded w-full"
//                 required
//               />
//               <input
//                 type="text"
//                 name="categoryId"
//                 value={product.categoryId}
//                 placeholder="Category ID"
//                 onChange={(e) => handleInputChange(e, index)}
//                 className="p-2 border rounded w-full"
//               />
//               <input
//                 type="text"
//                 name="brand"
//                 value={product.brand}
//                 placeholder="Brand"
//                 onChange={(e) => handleInputChange(e, index)}
//                 className="p-2 border rounded w-full"
//               />
//             </div>

//             {/* Image Upload Section */}
//             <div className="mt-4">
//               <label className="block font-semibold">Upload Images:</label>
//               <input
//                 type="file"
//                 multiple
//                 onChange={(e) => handleImageChange(e, index)}
//                 className="block w-full p-2 border rounded"
//               />
//               <button
//                 type="button"
//                 onClick={() => uploadImages(index)}
//                 className="mt-2 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
//               >
//                 Upload Images
//               </button>
//             </div>
//           </div>
//         ))}

//         {/* Add New Product Button */}
//         <button
//           type="button"
//           onClick={addNewProduct}
//           className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
//         >
//           Add Another Product
//         </button>

//         {/* Submit Button */}
//         <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
//           Upload Products
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ProductUpload;
