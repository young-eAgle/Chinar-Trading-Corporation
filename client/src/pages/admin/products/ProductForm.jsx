import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../../Context/adminContext';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const ProductForm = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    actualPrice: '',
    discount: '',
    discountedPrice: '',
    description: '',
    available: true,
    categoryId: '',
    subcategoryId: '',
    brand: '',
    imageUrl: '',
    images: []
  });
  
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchCategories();
    
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [admin, id, isEditMode, navigate]);
  
  useEffect(() => {
    if (formData.categoryId) {
      // Filter subcategories based on the selected category
      const categorySubcategories = subcategories.filter(
        subcat => {
          // Log subcategory data structure for debugging
          console.log('Checking subcategory:', subcat);
          
          // Handle different possible data structures
          // Case 1: subcat.category is an object with _id
          if (subcat.category && typeof subcat.category === 'object' && subcat.category._id) {
            return subcat.category._id === formData.categoryId;
          }
          // Case 2: subcat.category is a direct ID string
          else if (subcat.category && typeof subcat.category === 'string') {
            return subcat.category === formData.categoryId;
          }
          // Case 3: subcat.categoryId is a direct ID string
          else if (subcat.categoryId && typeof subcat.categoryId === 'string') {
            return subcat.categoryId === formData.categoryId;
          }
          // Case 4: subcat.categoryId is an object with _id
          else if (subcat.categoryId && typeof subcat.categoryId === 'object' && subcat.categoryId._id) {
            return subcat.categoryId._id === formData.categoryId;
          }
          return false;
        }
      );
      
      console.log('Selected category ID:', formData.categoryId);
      console.log('Filtered subcategories:', categorySubcategories);
      setFilteredSubcategories(categorySubcategories);
      
      // Reset subcategory if it doesn't belong to the selected category
      const subcategoryExists = categorySubcategories.some(
        subcat => subcat._id === formData.subcategoryId
      );
      
      if (!subcategoryExists) {
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);
  
  const fetchCategories = async () => {
    try {
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/subcategories`)
      ]);
      
      if (!categoriesResponse.ok || !subcategoriesResponse.ok) {
        throw new Error('Failed to fetch categories or subcategories');
      }
      
      const categoriesData = await categoriesResponse.json();
      const subcategoriesData = await subcategoriesResponse.json();
      
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      
      console.log('Categories:', categoriesData);
      console.log('Subcategories:', subcategoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };
  
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const product = await response.json();
      console.log('Product details:', product);
      
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || '',
        actualPrice: product.actualPrice || '',
        discount: product.discount || '',
        discountedPrice: product.discountedPrice || '',
        description: product.description || '',
        available: product.available !== undefined ? product.available : true,
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        brand: product.brand || '',
        imageUrl: product.imageUrl || '',
        images: product.images || []
      });
      
      setPreviewImages(product.images || []);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle special field calculations
    if (name === 'price' || name === 'actualPrice' || name === 'discount') {
      const newFormData = { ...formData, [name]: value };
      
      // Auto-calculate discount if actualPrice and price are set
      if (name === 'price' || name === 'actualPrice') {
        const price = parseFloat(name === 'price' ? value : newFormData.price) || 0;
        const actualPrice = parseFloat(name === 'actualPrice' ? value : newFormData.actualPrice) || 0;
        
        if (actualPrice > 0 && price > 0 && actualPrice > price) {
          const calculatedDiscount = ((actualPrice - price) / actualPrice) * 100;
          newFormData.discount = calculatedDiscount.toFixed(2);
          newFormData.discountedPrice = price;
        } else {
          // If no actual discount, set discountedPrice = price
          newFormData.discountedPrice = price;
        }
      }
      
      // Auto-calculate price if actualPrice and discount are set
      if (name === 'discount') {
        const discount = parseFloat(value) || 0;
        const actualPrice = parseFloat(newFormData.actualPrice) || 0;
        
        if (actualPrice > 0 && discount > 0) {
          const calculatedPrice = actualPrice - (actualPrice * discount / 100);
          newFormData.price = calculatedPrice.toFixed(2);
          newFormData.discountedPrice = calculatedPrice.toFixed(2);
        }
      }
      
      setFormData(newFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Preview selected images
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    // Store files for upload
    setImagesToUpload(prev => [...prev, ...files]);
  };
  
  const removeImage = (index, isNewImage = false) => {
    if (isNewImage) {
      // Remove from preview and upload lists
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
      setImagesToUpload(prev => prev.filter((_, i) => i !== index));
    } else {
      // For existing images, mark for deletion and remove from preview
      const imageUrl = formData.images[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
      
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }));
      
      setPreviewImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare form data for submission with updated values
      const productData = new FormData();
      
      // Create a copy of formData with potential adjustments
      const submissionData = { ...formData };
      
      // If SKU is empty, set to "N/A" for display purposes
      if (!submissionData.sku) {
        submissionData.sku = "N/A";
      }
      
      // Always set discountedPrice equal to price if they're the same
      if (!submissionData.discountedPrice || parseFloat(submissionData.discountedPrice) === 0) {
        submissionData.discountedPrice = submissionData.price;
      }
      
      // Add text fields using adjusted data
      Object.keys(submissionData).forEach(key => {
        if (key !== 'images') {
          productData.append(key, submissionData[key]);
        }
      });
      
      // Add existing images that weren't deleted
      if (formData.images && formData.images.length > 0) {
        formData.images
          .filter(img => !imagesToDelete.includes(img))
          .forEach(img => productData.append('existingImages', img));
      }
      
      // Add new images
      imagesToUpload.forEach(file => {
        productData.append('images', file);
      });
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(img => productData.append('imagesToDelete', img));
      }
      
      // For debugging - log the form data
      console.log('Submitting product data:');
      for (let [key, value] of productData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Send request
      const url = isEditMode 
        ? `${API_URL}/products/${id}` 
        : `${API_URL}/products`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${admin.token}`
        },
        body: productData
      });
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-6 mt-32 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <FaArrowLeft />
            Back to Products
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                  Product is Available
                </label>
              </div>
            </div>
            
            {/* Pricing & Categories */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Pricing & Categories</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price (Rs.)
                  </label>
                  <input
                    type="number"
                    name="actualPrice"
                    value={formData.actualPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Discount is automatically calculated if you set both price and regular price</p>
              </div>
              
              {/* Hidden field for discountedPrice - we'll calculate this automatically */}
              <input
                type="hidden"
                name="discountedPrice"
                value={formData.discountedPrice}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.categoryId || filteredSubcategories.length === 0}
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubcategories.map(subcategory => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {/* Images */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Product Images</h2>
            
            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <span className="block text-gray-700">Click to upload images</span>
              <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            
            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-28 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, !formData.images.includes(image))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <FaSave />
              )}
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 