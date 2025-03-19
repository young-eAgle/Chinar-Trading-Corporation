import express from 'express';
import { 
    registerAdmin, 
    loginAdmin, 
    getDashboardStats, 
    getAllOrders, 
    updateOrderStatus, 
    exportOrders, 
    getAdminProfile, 
    updateAdminProfile, 
    logoutAdmin 
} from '../Controllers/adminController.js';
import { protect, hasPermission, superAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect, logoutAdmin);

// Profile routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);

// Dashboard route
router.get('/dashboard', protect, getDashboardStats);

// Order management routes
router.get('/orders', protect, hasPermission('manage_orders'), getAllOrders);
router.put('/orders/:id', protect, hasPermission('manage_orders'), updateOrderStatus);
router.get('/orders/export', protect, hasPermission('manage_orders'), exportOrders);

export default router; 