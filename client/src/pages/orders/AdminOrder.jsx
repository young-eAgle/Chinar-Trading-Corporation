import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";
import { fetchAllOrders, fetchPendingOrders } from "../../Service/Order.Service.jsx";
import { useAdmin } from "../../Context/adminContext.jsx";
import { toast } from "react-toastify";
import { FaSearch, FaFilter, FaSort, FaEye, FaDownload, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import OrderTimeline from '../../components/OrderTimeline';
import ShippingTracking from '../../components/ShippingTracking';
import CustomerCommunication from '../../components/CustomerCommunication';
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const { admin } = useAdmin();
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    recentOrders: []
  });
  const [selectedTab, setSelectedTab] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function subscribe() {
      await OneSignal.registerForPushNotifications();
    }
    subscribe();
  }, []);

  useEffect(() => {
    if (admin && admin.token) {
      loadOrders();
      fetchDashboardStats();
    } else {
      setError("Authentication token not found. Please log in as an admin.");
      setLoading(false);
    }
  }, [admin]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!admin) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      
      const allOrders = await fetchAllOrders(admin);
      const recentOrders = await fetchPendingOrders(admin);
      setOrders(allOrders);
      setLatestOrders(recentOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to fetch orders. Please try again later.");
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!admin || !admin.token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      console.log("Updating order status:", orderId, newStatus);
      
      const response = await fetch(`${API_URL}/orders/admin/update/${orderId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${admin.token}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      const data = await response.json();
      toast.success(data.message || "Order status updated successfully");
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      await Promise.all(
        selectedOrders.map(orderId => updateOrderStatus(orderId, newStatus))
      );
      setSelectedOrders([]);
      toast.success("Selected orders updated successfully");
    } catch (error) {
      toast.error("Failed to update some orders");
    }
  };

  const handleViewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    await loadOrderTimeline(order._id);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
        headers: {
          "Authorization": `Bearer ${admin.token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleUpdateTracking = async (trackingInfo) => {
    try {
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/${trackingInfo.orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(trackingInfo),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update tracking information");
      }
      
      toast.success("Tracking information updated successfully");
      loadOrders();
    } catch (error) {
      console.error("Error updating tracking:", error);
      toast.error("Failed to update tracking information");
    }
  };

  const handleUpdateTrackingStatus = async (statusInfo) => {
    try {
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/${statusInfo.orderId}/tracking-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(statusInfo),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update tracking status");
      }
      
      toast.success("Tracking status updated successfully");
      loadOrders();
    } catch (error) {
      console.error("Error updating tracking status:", error);
      toast.error("Failed to update tracking status");
    }
  };

  const handleSendCommunication = async (communication) => {
    try {
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/${communication.orderId}/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(communication),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to send communication");
      }
      
      toast.success("Communication sent successfully");
    } catch (error) {
      console.error("Error sending communication:", error);
      toast.error("Failed to send communication");
    }
  };

  const loadOrderTimeline = async (orderId) => {
    try {
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/admin/order-timeline/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to load order timeline");
      }
      
      const data = await response.json();
      setTimeline(data);
    } catch (error) {
      console.error("Error loading timeline:", error);
      toast.error('Failed to load order timeline');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      if (!admin) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const handleExportOrders = async () => {
    try {
      setExportLoading(true);
      
      if (!admin) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/orders/admin/export`, {
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export orders: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Failed to export orders:', error);
      toast.error('Failed to export orders');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderTrackingId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return b.totalPrice - a.totalPrice;
        case "price-low":
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-22 ">
        <div className="text-red-500 text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <p className="text-xl mb-4">{error}</p>
          {error.includes("Authentication") ? (
            <div>
              <p className="mb-4 text-gray-600">Please make sure you are logged in as an admin. If you are already logged in, try logging out and logging back in.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => navigate('/admin/login')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go to Admin Login
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={loadOrders}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen mt-22">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 text-center">Admin Orders Management</h1>
        <p className="text-gray-600 text-center mt-2">Manage and track all orders</p>
      </motion.div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalOrders}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pendingOrders}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">Rs.{dashboardStats.revenue.toLocaleString()}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
          <p className="text-3xl font-bold text-purple-600">{dashboardStats.recentOrders.length}</p>
        </motion.div>
      </div>

      {/* Order Management Tabs */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="border-b overflow-x-auto">
          <div className="flex flex-nowrap min-w-full">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                selectedTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                selectedTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedTab('processing')}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                selectedTab === 'processing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setSelectedTab('shipped')}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                selectedTab === 'shipped'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Shipped
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={sortBy}
                onChange={handleSort}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
              <button
                onClick={handleExportOrders}
                disabled={exportLoading}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FaDownload />
                <span className="hidden sm:inline">{exportLoading ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-700">
                  {selectedOrders.length} orders selected
                </p>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                    className="px-3 py-1 border rounded bg-white"
                  >
                    <option value="">Update Status</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => setSelectedOrders([])}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 sm:p-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(currentOrders.map(order => order._id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      checked={selectedOrders.length === currentOrders.length}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-2 sm:p-4 text-left">Order ID</th>
                  <th className="p-2 sm:p-4 text-left">Customer</th>
                  <th className="p-2 sm:p-4 text-left">Total</th>
                  <th className="p-2 sm:p-4 text-left">Status</th>
                  <th className="p-2 sm:p-4 text-left">Date</th>
                  <th className="p-2 sm:p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2 sm:p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleOrderSelect(order._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-2 sm:p-4 font-mono text-xs sm:text-sm">{order._id}</td>
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{order.shippingAddress.email}</p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 font-semibold text-green-600 text-sm sm:text-base">Rs.{order.totalPrice.toLocaleString()}</td>
                    <td className="p-2 sm:p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          className="p-1 sm:p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Download Invoice"
                        >
                          <FaDownload />
                        </button>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="p-1 sm:p-2 text-xs sm:text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <nav className="flex gap-2">
              {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white z-10 py-2 border-b">
                <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Order Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-800">Order Information</h3>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Order ID:</span> {selectedOrder._id}</p>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Tracking ID:</span> {selectedOrder.orderTrackingId}</p>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Status:</span> {selectedOrder.orderStatus}</p>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-800">Customer Information</h3>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Name:</span> {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Email:</span> {selectedOrder.shippingAddress.email}</p>
                    <p className="text-sm sm:text-base"><span className="text-gray-600">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Shipping & Tracking */}
                <ShippingTracking
                  order={selectedOrder}
                  onUpdateTracking={handleUpdateTracking}
                  onUpdateStatus={handleUpdateTrackingStatus}
                />

                {/* Customer Communication */}
                <CustomerCommunication
                  order={selectedOrder}
                  onSendCommunication={handleSendCommunication}
                />

                {/* Order Timeline */}
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Timeline</h3>
                  <OrderTimeline timeline={timeline} />
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-800">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                          {item.imageUrl && (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm sm:text-base">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs.{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm sm:text-base">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>Rs.{selectedOrder.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-end mt-2">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <FaDownload disabled />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
