import express from 'express';
import { 
    placeOrder, 
    getOrderById, 
    GuestOrders, 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder,
    getLast24HoursOrders,
    getOrderByReference,
    getPendingOrders, 
    UserOrders,
    trackOrder,
    getOrderTimeline,
    getDashboardStats,
    exportOrders
} from "../Controllers/order.controller.js";
import { protect,protect_Order, UserProtect,  roleProtect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post("/place-order", protect_Order, placeOrder);
router.get("/order/:id", getOrderById);
router.get("/reference/:reference", getOrderByReference);
router.get("/track/:orderId", trackOrder);

// User routes - separate endpoints for user and guest orders
router.get("/user", UserProtect, UserOrders);
router.get("/guest", GuestOrders);  // No auth needed, using email query parameter

// Admin routes
router.get("/admin/all-orders",  getAllOrders);
router.get("/admin/latest-orders",  getLast24HoursOrders);
router.get("/admin/pending-orders",  getPendingOrders);
router.put("/admin/update/:orderId",  updateOrderStatus);
router.get("/admin/order-timeline/:orderId",  getOrderTimeline);
router.get("/admin/stats",  getDashboardStats);
router.get("/admin/export",  exportOrders);

export default router;