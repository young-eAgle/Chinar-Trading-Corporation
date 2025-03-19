import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaList, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../Context/authContext.jsx";
import { useNotification } from "../../features/notifications/context/NotificationContext";

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { requestPermission, permission } = useNotification();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`http://46.202.166.65/orders/order/${orderId}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                const data = await response.json();
                
                if (response.ok) {
                    setOrder(data);
                    // Request notification permission if not already granted
                    if (permission !== 'granted') {
                        const granted = await requestPermission();
                        if (granted) {
                            toast.success("You'll receive notifications about your order status!");
                        }
                    }
                } else {
                    setError(data.message || "Failed to fetch order details.");
                    toast.error("Failed to fetch order details");
                }
            } catch (err) {
                setError("An error occurred while fetching order details.");
                toast.error("An error occurred while fetching order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, permission, requestPermission]);

    const handleTrackOrder = () => {
        navigate(`/track-order/${orderId}`);
    };

    const handleViewOrders = () => {
        navigate('/my-orders');
    };

    const handleWhatsappSupport = () => {
        // Replace with your WhatsApp business number
        const whatsappNumber = "your_whatsapp_number";
        const message = `Hi, I need help with my order ${orderId}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg text-center border border-red-300 mt-50"
            >
                <FaCheckCircle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-600">Order Error</h2>
                <p className="mt-3 text-gray-700">{error || "Order not found"}</p>
                <div className="mt-6 flex justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        Go to Homepage
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWhatsappSupport}
                        className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition shadow-md flex items-center gap-2"
                    >
                        <FaWhatsapp className="text-xl" />
                        Contact Support
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg border border-gray-300 mt-35"
        >
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                </motion.div>
                <h2 className="text-4xl font-bold text-green-600">Order Placed Successfully!</h2>
                <p className="mt-3 text-gray-700">Thank you for your purchase. Your order is being processed!</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-lg"><strong>Order ID:</strong> {order._id}</p>
                        <p className="text-lg"><strong>Total Amount:</strong> Rs.{order.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-lg"><strong>Payment Status:</strong> <span className="text-green-500 font-semibold">{order.paymentStatus}</span></p>
                        <p className="text-lg"><strong>Order Status:</strong> <span className="text-blue-500 font-semibold">{order.status}</span></p>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
            >
                <h3 className="text-2xl font-semibold border-b pb-3">Order Summary</h3>
                <ul className="mt-4 divide-y border border-gray-200 rounded-lg p-4">
                    {order.orderItems.map((item) => (
                        <motion.li 
                            key={item.productId} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="py-4 flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                    <span className="text-lg">{item.name}</span>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-semibold text-lg">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTrackOrder}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                    <FaTruck className="text-xl" />
                    Track Order
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewOrders}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition shadow-md"
                >
                    <FaList className="text-xl" />
                    View My Orders
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition shadow-md"
                >
                    <FaHome className="text-xl" />
                    Continue Shopping
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsappSupport}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    <FaWhatsapp className="text-xl" />
                    Need Help?
                </motion.button>
            </motion.div>

            {permission !== 'granted' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                    <p className="text-blue-700 text-sm">
                        Enable notifications to get real-time updates about your order status.
                    </p>
                    <button
                        onClick={requestPermission}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Enable Notifications
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default OrderSuccess;
