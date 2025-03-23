import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../Context/adminContext';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaList } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const CategoryManagement = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // For add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    images: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchCategories();
    fetchSubcategories();
  }, [admin, navigate]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubcategories = async () => {
    try {
      const response = await fetch(`${API_URL}/subcategories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      
      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  };
  
  const deleteCategory = async (categoryId) => {
    // Check if category has subcategories
    const hasSubcategories = subcategories.some(subcat => subcat.categoryId === categoryId);
    
    if (hasSubcategories) {
      toast.error('Cannot delete category with subcategories. Remove subcategories first.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      toast.success('Category deleted successfully');
      fetchCategories(); // Refresh categories list
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  const openAddModal = () => {
    setModalType('add');
    setFormData({
      name: '',
      images: []
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };
  
  const openEditModal = (category) => {
    setModalType('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      images: category.images || []
    });
    setImagePreview(category.images && category.images.length > 0 ? category.images[0] : '');
    setShowModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const url = modalType === 'add' 
        ? `${API_URL}/categories/add-category` 
        : `${API_URL}/categories/${selectedCategory._id}`;
      
      const method = modalType === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${admin?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: formData.name })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${modalType} category`);
      }
      
      toast.success(`Category ${modalType === 'add' ? 'added' : 'updated'} successfully`);
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error(`Error ${modalType}ing category:`, error);
      toast.error(`Failed to ${modalType} category`);
    }
  };
  
  const getSubcategoryCount = (categoryId) => {
    return subcategories.filter(subcat => {
      // Handle different possible data structures
      if (subcat.category && typeof subcat.category === 'object') {
        return subcat.category._id === categoryId;
      } else if (subcat.category) {
        return subcat.category === categoryId;
      } else if (subcat.categoryId) {
        return subcat.categoryId === categoryId;
      }
      return false;
    }).length;
  };
  
  // Function to get subcategories for a specific category
  const getCategorySubcategories = (categoryId) => {
    return subcategories.filter(subcat => {
      // Handle different possible data structures
      if (subcat.category && typeof subcat.category === 'object') {
        return subcat.category._id === categoryId;
      } else if (subcat.category) {
        return subcat.category === categoryId;
      } else if (subcat.categoryId) {
        return subcat.categoryId === categoryId;
      }
      return false;
    });
  };
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
          <div className="flex gap-4">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlus />
              Add New Category
            </button>
            <button
              onClick={() => navigate('/admin/subcategories')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaList />
              Manage Subcategories
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <div key={category._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200">
                {category.images && category.images.length > 0 ? (
                  <img 
                    src={category.images[0]} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getSubcategoryCount(category._id)} Subcategories
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      disabled={getSubcategoryCount(category._id) > 0}
                      title={getSubcategoryCount(category._id) > 0 ? "Delete subcategories first" : "Delete category"}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {/* Display subcategories */}
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                  {getCategorySubcategories(category._id).length > 0 ? (
                    <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                      {getCategorySubcategories(category._id).map(subcat => (
                        <li key={subcat._id} className="flex items-center justify-between">
                          <span>{subcat.name}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(`/admin/subcategories?edit=${subcat._id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit subcategory"
                            >
                              <FaEdit size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No subcategories</p>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedCategory(category._id);
                      navigate(`/admin/subcategories?category=${category._id}`);
                    }}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add subcategory
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">No categories found. Try a different search term or add a new category.</p>
          </div>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                    {modalType === 'add' ? 'Add New Category' : 'Edit Category'}
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {imagePreview && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Image Preview</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {modalType === 'add' ? 'Add Category' : 'Update Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 