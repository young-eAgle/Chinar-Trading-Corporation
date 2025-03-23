import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../Context/adminContext';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

const ProductManagement = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, [admin, navigate]);
  
  useEffect(() => {
    // Update filtered subcategories when category is selected
    if (selectedCategory) {
      const categorySubcategories = subcategories.filter(
        subcat => {
          // Handle both possible data structures
          return (subcat.category && subcat.category._id === selectedCategory) || 
                 (subcat.category === selectedCategory) ||
                 (subcat.categoryId === selectedCategory);
        }
      );
      setFilteredSubcategories(categorySubcategories);
      
      // Reset subcategory selection if it doesn't belong to the selected category
      const subcategoryExists = categorySubcategories.some(
        subcat => subcat._id === selectedSubcategory
      );
      
      if (!subcategoryExists) {
        setSelectedSubcategory('');
      }
    } else {
      setFilteredSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory, subcategories, selectedSubcategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/products', {
        headers: {
          'Authorization': `Bearer ${admin?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Products data:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Categories data:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/subcategories');
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      console.log('Subcategories data:', data);
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Unknown Category';
    
    // If categoryId is already a string (direct ID reference)
    if (typeof categoryId === 'string') {
      const category = categories.find(cat => cat._id === categoryId);
      if (category) return category.name;
    }
    
    // If categoryId is an object with _id
    if (typeof categoryId === 'object' && categoryId !== null) {
      // If it has a name property, use that directly
      if (categoryId.name) return categoryId.name;
      
      // Otherwise look up by _id
      if (categoryId._id) {
        const category = categories.find(cat => cat._id === categoryId._id);
        if (category) return category.name;
      }
    }
    
    return 'Unknown Category';
  };

  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return 'Unknown Subcategory';
    
    // If subcategoryId is already a string (direct ID reference)
    if (typeof subcategoryId === 'string') {
      const subcategory = subcategories.find(subcat => subcat._id === subcategoryId);
      if (subcategory) return subcategory.name;
    }
    
    // If subcategoryId is an object with _id
    if (typeof subcategoryId === 'object' && subcategoryId !== null) {
      // If it has a name property, use that directly
      if (subcategoryId.name) return subcategoryId.name;
      
      // Otherwise look up by _id
      if (subcategoryId._id) {
        const subcategory = subcategories.find(subcat => subcat._id === subcategoryId._id);
        if (subcategory) return subcategory.name;
      }
    }
    
    return 'Unknown Subcategory';
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchTerm('');
  };

  const filteredProducts = products.filter(product => {
    // Handle search term matching
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                     getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle category matching - check both object and direct ID references
    let categoryMatch = true;
    if (selectedCategory) {
      const productCategoryId = typeof product.categoryId === 'object' 
        ? product.categoryId?._id 
        : product.categoryId;
      categoryMatch = productCategoryId === selectedCategory;
    }
    
    // Handle subcategory matching - check both object and direct ID references
    let subcategoryMatch = true;
    if (selectedSubcategory) {
      const productSubcategoryId = typeof product.subcategoryId === 'object' 
        ? product.subcategoryId?._id 
        : product.subcategoryId;
      subcategoryMatch = productSubcategoryId === selectedSubcategory;
    }
    
    return nameMatch && categoryMatch && subcategoryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 mt-32 pb-32">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus />
            Add New Product
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaFilter /> Filter Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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
            
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Subcategories</option>
              {filteredSubcategories.map(subcategory => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
          
          {(selectedCategory || selectedSubcategory || searchTerm) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <img 
                        src={product.imageUrl || 'https://via.placeholder.com/50'} 
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                        {product.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.sku || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs.{product.price}</div>
                      {product.actualPrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">Rs.{product.actualPrice}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate" title={getCategoryName(product.categoryId)}>
                        {getCategoryName(product.categoryId)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate" title={getSubcategoryName(product.subcategoryId)}>
                        {getSubcategoryName(product.subcategoryId)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.available ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
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
          
          {filteredProducts.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              No products found. Try different filters or add a new product.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement; 