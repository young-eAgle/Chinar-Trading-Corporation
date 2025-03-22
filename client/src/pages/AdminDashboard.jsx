import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../Context/adminContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaBox, FaUsers, FaShoppingCart, FaDollarSign, FaChartLine, FaListAlt } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const AdminDashboard = () => {
    const { admin, hasPermission } = useAdmin();
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        revenue: 0,
        recentOrders: [],
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not logged in
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        fetchDashboardStats();
    }, [admin, navigate]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_URL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${admin?.token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
            
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 mt-27">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {admin?.name}</span>
                        <button
                            onClick={() => navigate('/admin/profile')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Profile
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaShoppingCart className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FaBox className="text-yellow-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Pending Orders</h2>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaDollarSign className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
                                <p className="text-3xl font-bold text-green-600">Rs.{stats.revenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <FaUsers className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
                                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            {hasPermission('manage_orders') && (
                                <button
                                    onClick={() => navigate('/admin/order-management')}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FaListAlt />
                                    Manage Orders
                                </button>
                            )}
                            {hasPermission('manage_products') && (
                                <button
                                    onClick={() => navigate('/admin/products')}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <FaBox />
                                    Manage Products
                                </button>
                            )}
                            {hasPermission('view_analytics') && (
                                <button
                                    onClick={() => navigate('/admin/analytics')}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    <FaChartLine />
                                    View Analytics
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Orders */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
                        {stats.recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentOrders.map(order => (
                                    <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{order._id}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                    </motion.div>

                    {/* Recent Users */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Users</h2>
                        {stats.recentUsers.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentUsers.map(user => (
                                    <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent users</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 