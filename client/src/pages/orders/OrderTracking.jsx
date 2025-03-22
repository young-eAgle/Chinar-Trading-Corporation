import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTruck, FaBox, FaCheckCircle, FaTimesCircle, FaSpinner, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [reference, setReference] = useState(orderId || "");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrder = async (orderReference) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/orders/order/${orderReference}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();
            
            if (response.ok) {
                setOrder(data);
                toast.success("Order found!");
            } else {
                setError(data.message || "Order not found");
                toast.error("Order not found");
            }
        } catch (err) {
            setError("Failed to fetch order details");
            toast.error("Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder(orderId);
        }
    }, [orderId]);

    const handleTrackOrder = (e) => {
        e.preventDefault();
        if (reference.trim()) {
            fetchOrder(reference);
        } else {
            toast.error("Please enter an order reference");
        }
    };

    const handleWhatsappSupport = () => {
        // Replace with your WhatsApp business number
        const whatsappNumber = "your_whatsapp_number";
        const message = `Hi, I need help tracking my order ${order?._id || reference}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getStatusColor = (status) => {
        if (!status) return <FaBox className="text-gray-500" />; // Default if status is undefined or null
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500';
            case 'processing':
                return 'bg-blue-500';
            case 'shipped':
                return 'bg-purple-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };
    

    const getStatusIcon = (status) => {
        if (!status) return <FaBox className="text-gray-500" />;
        switch (status.toLowerCase()) {
            case 'delivered':
                return <FaCheckCircle className="text-green-500" />;
            case 'processing':
                return <FaSpinner className="text-blue-500 animate-spin" />;
            case 'shipped':
                return <FaTruck className="text-purple-500" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaBox className="text-gray-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6  mt-30">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
                <p className="text-gray-600">Enter your order reference to track your order status</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleTrackOrder}
                className="mb-8"
            >
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Enter order reference"
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <FaSearch />
                        {loading ? "Tracking..." : "Track Order"}
                    </motion.button>
                </div>
            </motion.form>

            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center py-8"
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                    >
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={handleWhatsappSupport}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <FaWhatsapp className="mr-2" />
                            Contact Support
                        </button>
                    </motion.div>
                )}

                {order && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-lg shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800">Order #{order._id}</h2>
                                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full ${getStatusColor(order.orderStatus)} text-white`}>
                                {order.orderStatus}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">
                                    {getStatusIcon(order.orderStatus)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Current Status</h3>
                                    <p className="text-gray-600">{order.orderStatus}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-lg mb-4">Order Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Total Amount</p>
                                        <p className="font-semibold">Rs.{order.totalPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Status</p>
                                        <p className="font-semibold text-green-600">{order.paymentStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Items</p>
                                        <p className="font-semibold">{order.orderItems.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-4">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="text-gray-600">Rs.{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-6 flex justify-between items-center">
                                <button
                                    onClick={() => navigate('/my-orders')}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View All Orders
                                </button>
                                <button
                                    onClick={handleWhatsappSupport}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <FaWhatsapp className="mr-2" />
                                    Need Help?
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderTracking;
