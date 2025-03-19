import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter, FaSearch, FaHistory, FaUser, FaWhatsapp, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { fetchUserOrders, fetchGuestOrders } from "../../Service/Order.Service.jsx";
import { useAuth } from "../../Context/authContext.jsx";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [isGuestTracking, setIsGuestTracking] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestEmail, setGuestEmail] = useState("");
    const [guestOrderId, setGuestOrderId] = useState("");
    const [hasGuestOrders, setHasGuestOrders] = useState(false);

    // Check for guest email in localStorage
    useEffect(() => {
        const storedGuestEmail = localStorage.getItem("guestEmail");
        if (storedGuestEmail && storedGuestEmail.trim() !== '') {
            setGuestEmail(storedGuestEmail.trim());
            setHasGuestOrders(true);
        } else {
            // If no valid email in localStorage, show the guest form
            setShowGuestForm(!user);
        }
    }, [user]);

    // Fetch orders on component mount
    useEffect(() => {
        const getOrders = async () => {
            setLoading(true);
            setError(null);
            
            try {
                let fetchedOrders = [];
                
                // If logged in user, fetch their orders
                if (user && token) {
                    console.log("Fetching orders for logged-in user:", user.name || user.email);
                    fetchedOrders = await fetchUserOrders(user._id, token);
                } 
                // If guest email is available (from localStorage), fetch guest orders
                else if (guestEmail && guestEmail.trim() !== '') {
                    console.log("Fetching orders for guest email:", guestEmail);
                    fetchedOrders = await fetchGuestOrders(guestEmail.trim());
                    
                    if (fetchedOrders && fetchedOrders.length > 0) {
                        setHasGuestOrders(true);
                        console.log(`Found ${fetchedOrders.length} orders for guest email`);
                    } else {
                        console.log("No orders found for guest email:", guestEmail);
                    }
                } else {
                    console.log("No user or guest email available");
                    setShowGuestForm(true);
                }
                
                setOrders(fetchedOrders || []);
            } catch (error) {
                console.error("Error fetching orders:", error);
                
                // Handle specific errors differently
                if (error.response) {
                    // The request was made and the server responded with an error status
                    console.error("Response error:", error.response.data);
                    
                    if (error.response.status === 400 && error.response.data?.message === "Email is required") {
                        setShowGuestForm(true);
                        toast.error("Please enter your email to view your orders");
                    } else if (error.response.status === 401) {
                        // Unauthorized - either user token expired or not provided
                        localStorage.removeItem("token");
                        toast.error("Please log in to view your orders");
                        setShowGuestForm(true);
                    } else {
                        setError("Failed to fetch orders: " + (error.response.data?.message || "Server error"));
                        toast.error("Failed to fetch your orders");
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error("Request error - no response received");
                    setError("Network error. Please check your connection and try again.");
                    toast.error("Network error");
                } else {
                    // Something happened in setting up the request
                    setError("Failed to fetch orders. Please try again.");
                    toast.error("Error fetching your orders");
                }
            } finally {
                setLoading(false);
            }
        };

        if (user || (guestEmail && !showGuestForm)) {
        getOrders();
        } else {
            setLoading(false);
        }
    }, [user, token, guestEmail, showGuestForm]);

    // Function to fetch guest orders when submitted
    const handleGuestOrdersFetch = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!guestEmail || guestEmail.trim() === '') {
            toast.error("Please enter your email address");
            return;
        }
        
        setLoading(true);
        try {
            const cleanEmail = guestEmail.trim();
            console.log("Fetching guest orders for email:", cleanEmail);
            
            // Save email to localStorage for future reference
            localStorage.setItem("guestEmail", cleanEmail);
            
            const guestOrders = await fetchGuestOrders(cleanEmail);
            
            if (guestOrders && guestOrders.length > 0) {
                console.log(`Found ${guestOrders.length} orders for guest email`);
                setOrders(guestOrders);
                setHasGuestOrders(true);
                setShowGuestForm(false);
                toast.success(`Found ${guestOrders.length} orders for your email`);
            } else {
                console.log("No orders found for guest email:", cleanEmail);
                toast.error("No orders found for this email");
                setOrders([]);
                setError("We couldn't find any orders associated with this email address.");
            }
        } catch (error) {
            console.error("Error fetching guest orders:", error);
            
            // Handle different error types
            if (error.response) {
                // The server responded with an error
                const errorMessage = error.response.data?.message || "Server error";
                toast.error(errorMessage);
                setError(`Failed to find orders: ${errorMessage}`);
            } else if (error.request) {
                // The request was made but no response received
                toast.error("Network error. Please check your connection.");
                setError("Network error. Please check your connection and try again.");
            } else {
                // Error in request setup
                toast.error("Failed to find orders for this email");
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsappSupport = (orderId) => {
        // Replace with your WhatsApp business number
        const whatsappNumber = "917760052800"; // Update this with your actual business number
        const message = `Hi, I need help with my order ${orderId}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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
        switch (status?.toLowerCase()) {
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

    const handleTrackOrder = (orderId) => {
        navigate(`/track-order/${orderId}`);
    };

    const handleGuestTrackOrder = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/orders/guest/${guestOrderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: guestEmail }),
            });
            
            if (response.ok) {
                navigate(`/track-order/${guestOrderId}`);
            } else {
                toast.error("Invalid order ID or email");
            }
        } catch (error) {
            toast.error("Failed to track order");
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleClearGuestData = () => {
        localStorage.removeItem("guestEmail");
        setGuestEmail("");
        setOrders([]);
        setHasGuestOrders(false);
        setShowGuestForm(true);
        toast.success("Guest data cleared");
    };

    const filteredOrders = orders
        .filter(order => {
            const matchesFilter = filter === "all" || order.orderStatus?.toLowerCase() === filter.toLowerCase();
            const matchesSearch = 
                order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.orderItems?.some(item => 
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case "oldest":
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case "price-high":
                    return (b.totalPrice || 0) - (a.totalPrice || 0);
                case "price-low":
                    return (a.totalPrice || 0) - (b.totalPrice || 0);
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Guest order form
    if (showGuestForm || (!user && !hasGuestOrders)) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg mt-40"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Your Orders</h2>
                <form onSubmit={handleGuestOrdersFetch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Find My Orders
                    </button>
                </form>
                <div className="mt-6 text-center">
                <button
                        onClick={() => setIsGuestTracking(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                >
                        Track a specific order
                </button>
            </div>
            </motion.div>
        );
    }

    // Guest order tracking form
    if (isGuestTracking) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-lg mt-40"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Order</h2>
                <form onSubmit={handleGuestTrackOrder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                        <input
                            type="text"
                            value={guestOrderId}
                            onChange={(e) => setGuestOrderId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your order ID"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Track Order
                    </button>
                </form>
                <button
                    onClick={() => setIsGuestTracking(false)}
                    className="mt-4 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                    Back
                </button>
            </motion.div>
        );
    }

    // Error state
    if (error && !orders.length) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Orders</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 mt-35">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex justify-between items-center">
                    <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {user ? "My Orders" : "My Guest Orders"}
                </h1>
                <p className="text-gray-600">
                            {user ? `Welcome back, ${user.name}` : `Orders for ${guestEmail}`}
                        </p>
                    </div>
                    
                    {!user && (
                        <button
                            onClick={handleClearGuestData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Clear Guest Data
                        </button>
                    )}
                </div>
            </motion.div>

                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaFilter className="text-gray-500" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="price-low">Price: Low to High</option>
                                </select>
                            </div>
                        </div>
                    </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <FaBox className="mx-auto text-gray-300 text-6xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
                    <p className="text-gray-500 mb-6">
                        {searchQuery ? "Try a different search term" : "You haven't placed any orders yet"}
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <div className="p-6 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order._id}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)} text-white text-sm`}>
                                                {order.orderStatus}
                                            </div>
                                            {expandedOrderId === order._id ? <FaAngleUp /> : <FaAngleDown />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedOrderId === order._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t"
                                        >
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                                                        <div className="space-y-2">
                                                        <p><span className="text-gray-600">Total Amount:</span> Rs.{order.totalPrice.toLocaleString()}</p>
                                                            <p><span className="text-gray-600">Payment Status:</span> {order.paymentStatus}</p>
                                                            <p><span className="text-gray-600">Items:</span> {order.orderItems.length}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                                                        <div className="space-y-2">
                                                        <p>{order.shippingAddress?.street}</p>
                                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                                        <p>{order.shippingAddress?.postalCode}</p>
                                                    </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                                                    <div className="space-y-4">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={`${order._id}-${idx}`} className="flex items-center gap-4">
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    className="w-16 h-16 object-cover rounded"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/150?text=Product';
                                                                }}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-sm text-gray-600">
                                                                    Quantity: {item.quantity} × Rs.{item.price.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <p className="font-semibold">
                                                                Rs.{(item.price * item.quantity).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                </div>
                                                </div>

                                                <div className="mt-6 flex justify-between items-center">
                                                    <button
                                                        onClick={() => handleTrackOrder(order._id)}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        <FaTruck className="mr-2" />
                                                        Track Order
                                                    </button>
                                                    <button
                                                        onClick={() => handleWhatsappSupport(order._id)}
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
                            </motion.div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default UserOrders; 