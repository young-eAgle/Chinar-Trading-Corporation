import Admin from '../models/model.admin.js';
import User from '../models/model.user.js';
import Order from '../models/model.order.js';
import Product from '../models/model.product.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Super Admin
export const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, permissions, adminSecretKey } = req.body;

    // Verify admin secret key
    if (!adminSecretKey || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        res.status(401);
        throw new Error('Unauthorized: Invalid admin secret key');
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    // Create admin
    const admin = await Admin.create({
        name,
        email,
        password,
        permissions: permissions || ["manage_orders", "view_analytics"],
        avatar: {
            public_id: 'default',
            url: 'https://res.cloudinary.com/your-cloud/image/upload/v1/admin/default'
        }
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            permissions: admin.permissions,
            token: admin.getSignedJwtToken()
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
});

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Update last active
    admin.lastActive = Date.now();
    await admin.save();

    // Generate token
    const token = admin.getSignedJwtToken();

    // Set JWT as HTTP-Only cookie
    res.cookie('adminJwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
        token
    });
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });

    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
    const revenue = orders.reduce((total, order) => total + order.totalPrice, 0);

    // Get recent orders (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const recentOrders = await Order.find({ 
        createdAt: { $gte: twentyFourHoursAgo } 
    }).sort({ createdAt: -1 }).limit(5);

    // Get recent users
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');

    res.json({
        totalOrders,
        pendingOrders,
        totalUsers,
        totalProducts,
        revenue,
        recentOrders,
        recentUsers
    });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('user', 'name email');

    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.orderStatus = req.body.status || order.orderStatus;
    order.updatedAt = Date.now();

    // Add to timeline
    order.timeline.push({
        status: order.orderStatus,
        timestamp: Date.now(),
        note: req.body.note || `Status updated to ${order.orderStatus}`,
        updatedBy: req.admin._id
    });

    const updatedOrder = await order.save();

    res.json(updatedOrder);
});

// @desc    Export orders as CSV
// @route   GET /api/admin/orders/export
// @access  Admin
export const exportOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .lean();

    // Convert orders to CSV format
    const csvRows = [];
    
    // Add headers
    csvRows.push([
        'Order ID',
        'Order Number',
        'Customer Name',
        'Email',
        'Total Price',
        'Status',
        'Payment Status',
        'Date',
        'Shipping Address',
        'Items'
    ].join(','));

    // Add data rows
    for (const order of orders) {
        const customerName = order.customerType === 'registered' 
            ? `${order.user?.firstName} ${order.user?.lastName}` 
            : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
        
        const email = order.customerType === 'registered'
            ? order.user?.email
            : order.shippingAddress.email;

        const shippingAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}`;
        
        const items = order.orderItems.map(item => 
            `${item.name}(${item.quantity})`
        ).join('; ');

        csvRows.push([
            order._id,
            order.orderNumber,
            customerName,
            email,
            order.totalPrice,
            order.orderStatus,
            order.paymentStatus,
            new Date(order.createdAt).toLocaleString(),
            shippingAddress,
            items
        ].map(field => `"${field}"`).join(','));
    }

    const csvContent = csvRows.join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Admin
export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
        lastActive: admin.lastActive,
        notificationPreferences: admin.notificationPreferences
    });
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Admin
export const updateAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.notificationPreferences = req.body.notificationPreferences || admin.notificationPreferences;

    if (req.body.password) {
        admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        permissions: updatedAdmin.permissions,
        notificationPreferences: updatedAdmin.notificationPreferences
    });
});

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Admin
export const logoutAdmin = asyncHandler(async (req, res) => {
    res.cookie('adminJwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.json({ message: 'Logged out successfully' });
}); 