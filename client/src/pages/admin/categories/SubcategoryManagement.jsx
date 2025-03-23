import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../../Context/adminContext';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const SubcategoryManagement = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryId = queryParams.get('category') || '';
  const editSubcategoryId = queryParams.get('edit');
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  
  // For add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: initialCategoryId,
    description: ''
  });
  
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchCategories();
    fetchSubcategories();
  }, [admin, navigate]);
  
  // Handle edit parameter in URL
  useEffect(() => {
    if (editSubcategoryId && subcategories.length > 0) {
      const subcategoryToEdit = subcategories.find(
        subcat => subcat._id === editSubcategoryId
      );
      
      if (subcategoryToEdit) {
        openEditModal(subcategoryToEdit);
      }
    }
  }, [editSubcategoryId, subcategories]);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };
  
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/subcategories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      
      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }
      
      toast.success('Subcategory deleted successfully');
      fetchSubcategories(); // Refresh subcategories list
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };
  
  const openAddModal = () => {
    setModalType('add');
    setFormData({
      name: '',
      categoryId: selectedCategory || '',
      description: ''
    });
    setShowModal(true);
  };
  
  const openEditModal = (subcategory) => {
    setModalType('edit');
    setEditSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      description: subcategory.description || ''
    });
    setShowModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId) {
      toast.error('Subcategory name and category are required');
      return;
    }
    
    try {
      const url = modalType === 'add' 
        ? `${API_URL}/subcategories/add-subcategory` 
        : `${API_URL}/subcategories/${editSubcategory._id}`;
      
      const method = modalType === 'add' ? 'POST' : 'PUT';
      
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId
      };
      
      console.log('Sending subcategory data:', payload);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${admin?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${modalType} subcategory`);
      }
      
      toast.success(`Subcategory ${modalType === 'add' ? 'added' : 'updated'} successfully`);
      setShowModal(false);
      fetchSubcategories();
    } catch (error) {
      console.error(`Error ${modalType}ing subcategory:`, error);
      toast.error(error.message || `Failed to ${modalType} subcategory`);
    }
  };
  
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Unknown Category';
    
    // Find by direct ID match
    const category = categories.find(cat => cat._id === categoryId);
    if (category) return category.name;
    
    // If categoryId is an object with _id
    if (typeof categoryId === 'object' && categoryId._id) {
      const categoryById = categories.find(cat => cat._id === categoryId._id);
      if (categoryById) return categoryById.name;
      
      // If it has a name property, use that
      if (categoryId.name) return categoryId.name;
    }
    
    return 'Unknown Category';
  };
  
  const filteredSubcategories = subcategories.filter(subcategory => {
    const nameMatch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle different possible data structures for category filtering
    let categoryMatch = true;
    if (selectedCategory) {
      if (subcategory.category && typeof subcategory.category === 'object') {
        categoryMatch = subcategory.category._id === selectedCategory;
      } else if (subcategory.category) {
        categoryMatch = subcategory.category === selectedCategory;
      } else if (subcategory.categoryId) {
        categoryMatch = subcategory.categoryId === selectedCategory;
      } else {
        categoryMatch = false;
      }
    }
    
    return nameMatch && categoryMatch;
  });
  
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
          <h1 className="text-3xl font-bold text-gray-800">Subcategory Management</h1>
          <div className="flex gap-4">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlus />
              Add New Subcategory
            </button>
            <button
              onClick={() => navigate('/admin/categories')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <FaArrowLeft />
              Back to Categories
            </button>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubcategories.map(subcategory => (
                  <tr key={subcategory._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getCategoryName(subcategory.categoryId)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {subcategory.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(subcategory)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteSubcategory(subcategory._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubcategories.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              No subcategories found. Try a different search term or add a new subcategory.
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for adding/editing subcategory */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === 'add' ? 'Add New Subcategory' : 'Edit Subcategory'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                  Parent Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalType === 'add' ? 'Add Subcategory' : 'Update Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryManagement; 