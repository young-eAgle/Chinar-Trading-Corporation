
// Ensure environment variables are loaded before other imports
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Determine file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct file
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' 
  ? join(__dirname, '..', '.env.production')
  : join(__dirname, '..', '.env.development');

const fallbackEnvFile = join(__dirname, '..', '.env');

// Load environment variables from the correct file
if (fs.existsSync(envFile)) {
  console.log(`OrderController: Loading environment from ${envFile}`);
  dotenv.config({ path: envFile });
} else if (fs.existsSync(fallbackEnvFile)) {
  console.log(`OrderController: Loading environment from ${fallbackEnvFile}`);
  dotenv.config({ path: fallbackEnvFile });
}

import Order from "../models/model.order.js";
import User from "../models/model.user.js";
import asyncHandler from "express-async-handler";
import Product from "../models/model.product.js";
import sendOrderConfirmationEmail from "../Services/emailService.js";
import { createNotification, sendEmailNotification } from "../Services/notificationService.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import OneSignal from "react-onesignal";
import { compareSync } from "bcryptjs";
import { notifyUser, notifyAdmins } from "../utils/pushNotification.js";
import { sendOrderNotification } from "../Controllers/notification.controller.js";

// Generate unique order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Place Order (for both guest and registered users)
export const placeOrder = async (req, res) => {
  try {
    console.log("Order data received:", JSON.stringify(req.body, null, 2));
    
    // Get order data from request body
    const { 
      orderItems, items, products, 
      totalPrice, totalAmount, 
      shippingAddress, 
      billingAddress 
    } = req.body;
    
    // Determine which field has the item data (handle different formats)
    const itemsData = orderItems || items || products || [];
    
    // Use appropriate price field (handle different formats)
    const orderTotal = totalPrice || totalAmount || 0;
    
    // Get user ID if authenticated
    const userId = req.user?._id;

    // Validate required fields
    if (!itemsData || !Array.isArray(itemsData) || itemsData.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order items are required and must be an array", 
        received: itemsData
      });
    }
    
    if (!orderTotal) {
      return res.status(400).json({ 
        success: false,
        message: "Total price is required" 
      });
    }
    
    if (!shippingAddress || (!shippingAddress.email && !shippingAddress.firstName)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid shipping address is required",
        received: shippingAddress
      });
    }
    
    // Ensure shipping address has an email (required for guest orders)
    if (!shippingAddress.email && shippingAddress.firstName) {
      // Try to construct email from user data if available
      if (req.user && req.user.email) {
        shippingAddress.email = req.user.email;
      } else {
        return res.status(400).json({
          success: false,
          message: "Shipping address must include an email address"
        });
      }
    }

    // Format order items to include product reference
    const formattedOrderItems = itemsData.map(item => ({
      product: item._id || item.productId, // Handle different field names
      name: item.name,
      quantity: item.quantity || 1,
      price: item.price,
      imageUrl: item.imageUrl || item.image
    }));

    // Create order data
    const orderData = {
      orderItems: formattedOrderItems,
      totalPrice: orderTotal,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      orderStatus: "Pending",
      orderNumber: generateOrderNumber(),
      orderTrackingId: uuidv4(),
      paymentStatus: "Pending",
      customerType: userId ? "registered" : "guest",
      orderReference: userId || shippingAddress.email, // Use user ID for registered users, email for guests
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Processed order data:", JSON.stringify(orderData, null, 2));

    // Add user reference if logged in
    if (userId) {
      orderData.user = userId;
    } else {
      // For guest users, store their details
      orderData.guestUser = {
        email: shippingAddress.email,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone
      };
    }

    // Create order
    const order = await Order.create(orderData);

    // Send email notification to customer
    await sendEmailNotification(shippingAddress.email, order, 'order_placed');

    // Send email notification to admin
    await sendEmailNotification(process.env.ADMIN_EMAIL, order, 'admin_order_placed');

    // Send push notifications to both admin and customer
    const notificationData = {
      title: 'New Order Placed',
      body: `Order #${order.orderNumber} has been placed successfully!`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        type: 'order_placed'
      }
    };

    // Send push notification to admin
    await notifyAdmins(notificationData);

    // Send push notification to customer (if they have a push token)
    if (order.customerType === "registered") {
      await notifyUser(order.user, notificationData);
    } else {
      // For guest users, try to find their push token by email
      const guestUser = await User.findOne({ email: shippingAddress.email });
      if (guestUser && guestUser.pushToken) {
        await notifyUser(guestUser.pushToken, notificationData);
      }
    }

    // Create in-app notification for both registered and guest users
    try {
      console.log('Creating notification with data:', {
        userId,
        orderNumber: order.orderNumber,
        customerType: order.customerType
      });

      await createNotification({
        userId: userId || undefined,
        guestEmail: userId ? undefined : shippingAddress.email,
        type: 'order_update',
        title: 'Order Placed Successfully',
        body: `Order #${order.orderNumber || order._id} has been placed successfully!`,
        recipientType: userId ? 'user' : 'guest',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber || order._id,
          email: shippingAddress.email,
          status: 'placed'
        }
      });

      // Log successful notification creation
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't throw the error, just log it and continue
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      redirectUrl: userId ? `/order-success/${order._id}` : `/guest-orders?email=${shippingAddress.email}`
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

  // Get All Orders (Admin)
  export const getAllOrders = async (req, res) => {
    try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

    // Get orders from the last 24 hours (Admin)
export const getLast24HoursOrders = async (req, res) => {
  try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const orders = await Order.find({ 
      createdAt: { $gte: twentyFourHoursAgo } 
    }).sort({ createdAt: -1 });
    
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Pending Orders (Admin)
export const getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ orderStatus: "Pending" })
      .sort({ createdAt: -1 });
    res.json(pendingOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending orders" });
  }
};

  // Update order status (Admin)
  export const updateOrderStatus = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      const oldStatus = order.orderStatus;
      order.orderStatus = status;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      await order.save();
  
      // Get customer email from the most reliable source
      let customerEmail;
      if (order.customerType === "registered" && order.user && typeof order.user === 'object' && order.user.email) {
        customerEmail = order.user.email;
      } else if (order.customerType === "guest" && order.guestUser && order.guestUser.email) {
        customerEmail = order.guestUser.email;
      } else if (order.shippingAddress && order.shippingAddress.email) {
        customerEmail = order.shippingAddress.email;
      } else {
        console.warn("Could not determine customer email for order:", orderId);
        customerEmail = null;
      }

      console.log("Customer Email:", customerEmail);

      try {
        // Send email notification to customer if we have their email
        if (customerEmail) {
          await sendEmailNotification(customerEmail, order, `order_${status.toLowerCase()}`);
        }

        // Send email notification to admin
        if (process.env.ADMIN_EMAIL) {
          await sendEmailNotification(process.env.ADMIN_EMAIL, order, `admin_order_${status.toLowerCase()}`);
        }

        // Prepare notification data
        const notificationData = {
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          body: `Order #${order.orderNumber || order._id} has been ${status.toLowerCase()}`,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber || order._id,
            type: `order_${status.toLowerCase()}`
          }
        };

        // Send push notification to admin
        await notifyAdmins(notificationData);

        // Send push notification to customer
        if (order.customerType === "registered" && order.user) {
          await notifyUser(order.user, notificationData);
        } else if (customerEmail) {
          // For guest users, try to find their push token by email
          const guestUser = await User.findOne({ email: customerEmail });
          if (guestUser && guestUser.pushToken) {
            await notifyUser(guestUser.pushToken, notificationData);
          }
        }

        // Create in-app notification for both registered and guest users
        try {
          await createNotification({
            userId: order.customerType === "registered" && order.user ? order.user : undefined,
            guestEmail: order.customerType === "registered" ? undefined : customerEmail,
            type: 'order_update',
            title: `Order ${status}`,
            body: `Your order #${order.orderNumber || order._id} has been ${status.toLowerCase()}`,
            recipientType: order.customerType === "registered" ? 'user' : 'guest',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber || order._id,
              status: status.toLowerCase()
            }
          });
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Don't throw the error, just log it and continue
        }
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Don't throw the error, just log it and continue
      }

      res.status(200).json({ 
        success: true, 
        message: "Order status updated successfully",
        order
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server Error", 
        error: error.message 
      });
    }
  };

// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  // Get Orders for a User or Guest
export const GuestOrders = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        console.log("Finding orders for guest email:", email);
        
        // Use a proper query that checks both user fields and guest user fields
        // without forcing MongoDB to cast the email to ObjectId
        const orders = await Order.find({
            $or: [
                { "guestUser.email": email },
                { "shippingAddress.email": email },
                { "billingAddress.email": email }
            ]
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${orders.length} orders for guest email: ${email}`);
        
        res.json(orders);
    } catch (error) {
        console.error("Error in GuestOrders:", error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// Get User Orders (for logged-in users)
export const UserOrders = async (req, res) => {
    try {
        // Make sure we have a user in the request
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized. User not authenticated." 
            });
        }

        console.log(`Finding orders for user ID: ${req.user._id}`);
        
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${orders.length} orders for user ID: ${req.user._id}`);
        
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error in UserOrders:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Track Order
export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;
    const userId = req.user?._id;

    let query = { _id: orderId };
    if (!userId) {
      query["guestUser.email"] = email;
    }

    const order = await Order.findOne(query)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track order'
    });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      await order.remove();
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

export const getOrderByReference = async (req, res) => {
    try {
        const { reference } = req.params;
        const order = await Order.findOne({ orderReference: reference }).populate("items.productId");

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add communication to order
export const addCommunication = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type, subject, content } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const communication = {
      type,
      subject,
      content,
      sentBy: req.user._id,
      status: "sent"
    };

    order.communications.push(communication);
    await order.save();

    // Send communication based on type
    if (type === "email") {
      await sendOrderConfirmationEmail(
        order.shippingAddress.email,
        subject,
        content
      );
    } else if (type === "sms") {
      // Implement SMS sending logic here
      // await sendSMS(order.shippingAddress.phone, content);
    }

    res.json({
      message: "Communication added successfully",
      communication
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update shipping tracking information
export const updateShippingTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      carrier,
      trackingNumber,
      estimatedDelivery,
      shippingCost,
      shippingMethod
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.shipping = {
      ...order.shipping,
      carrier,
      trackingNumber,
      estimatedDelivery,
      shippingCost,
      shippingMethod
    };

    // Add tracking history entry
    order.shipping.trackingHistory.push({
      status: "Tracking number assigned",
      location: "Order Processing Center",
      timestamp: new Date()
    });

    await order.save();

    // Send notification to customer
    const notificationContent = `
      Your order #${order.orderTrackingId} has been shipped!
      Carrier: ${carrier}
      Tracking Number: ${trackingNumber}
      Estimated Delivery: ${new Date(estimatedDelivery).toLocaleDateString()}
    `;

    await sendOrderConfirmationEmail(
      order.shippingAddress.email,
      "Order Shipped - Tracking Information",
      notificationContent
    );

    res.json({
      message: "Shipping information updated successfully",
      shipping: order.shipping
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update tracking status
export const updateTrackingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.shipping.trackingHistory.push({
      status,
      location,
      timestamp: new Date()
    });

    // Update order status if delivered
    if (status === "Delivered") {
      order.orderStatus = "Delivered";
      order.shipping.actualDelivery = new Date();
    }

    await order.save();

    res.json({
      message: "Tracking status updated successfully",
      trackingHistory: order.shipping.trackingHistory
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get order timeline
export const getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("timeline.updatedBy", "name email")
      .populate("communications.sentBy", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Combine timeline and communications into a single timeline
    const combinedTimeline = [
      ...order.timeline.map(item => ({
        type: "status",
        ...item.toObject()
      })),
      ...order.communications.map(item => ({
        type: "communication",
        ...item.toObject()
      }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    res.json(combinedTimeline);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create new order
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    user,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    user,
  });

  // Create notification for order placement
  await createNotification(
    user,
    order._id,
    "order_placed",
    "Your order has been placed successfully"
  );

  // Send email notification
  await sendEmailNotification(user.email, order, "order_placed");

  res.status(201).json(order);
});

// Get Dashboard Stats (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });

    // Calculate total revenue
    const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
    const revenue = orders.reduce((total, order) => total + order.totalPrice, 0);

    // Get recent orders (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const recentOrders = await Order.find({ 
      createdAt: { $gte: twentyFourHoursAgo } 
    }).sort({ createdAt: -1 });

    res.json({
      totalOrders,
      pendingOrders,
      revenue,
      recentOrders
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// Export Orders (Admin)
export const exportOrders = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error exporting orders:", error);
    res.status(500).json({ message: "Failed to export orders" });
  }
};

// export default router; 