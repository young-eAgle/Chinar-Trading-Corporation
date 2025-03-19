// Replace the dotenv/config import with a comment
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times
// Environment variables should already be loaded by the main application

import nodemailer from "nodemailer";
import Notification from "../models/model.notification.js";

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const emailTemplates = {
  order_placed: (order) => ({
    subject: "Order Placed Successfully",
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${order._id}</p>
      <p>We have received your order and will process it shortly.</p>
      <p>You can track your order status at: ${process.env.CLIENT_URL}/orders/${order._id}</p>
    `,
  }),
  order_confirmed: (order) => ({
    subject: "Order Confirmed",
    html: `
      <h2>Your order has been confirmed!</h2>
      <p>Order ID: ${order._id}</p>
      <p>We are preparing your order for shipping.</p>
      <p>Track your order at: ${process.env.CLIENT_URL}/orders/${order._id}</p>
    `,
  }),
  order_shipped: (order) => ({
    subject: "Order Shipped",
    html: `
      <h2>Your order has been shipped!</h2>
      <p>Order ID: ${order._id}</p>
      <p>Tracking Number: ${order.trackingNumber}</p>
      <p>Track your order at: ${process.env.CLIENT_URL}/orders/${order._id}</p>
    `,
  }),
  order_delivered: (order) => ({
    subject: "Order Delivered",
    html: `
      <h2>Your order has been delivered!</h2>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for shopping with us!</p>
      <p>View your order at: ${process.env.CLIENT_URL}/orders/${order._id}</p>
    `,
  }),
  order_cancelled: (order) => ({
    subject: "Order Cancelled",
    html: `
      <h2>Your order has been cancelled</h2>
      <p>Order ID: ${order._id}</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
  }),
};

export const sendEmailNotification = async (email, order, type) => {
    try {
        const template = emailTemplates[type] || emailTemplates.order_placed;
        const { subject, html } = template(order);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html
        });

        console.log(`Email notification sent to ${email} for order ${order._id}`);
    } catch (error) {
        console.error('Email notification error:', error);
        throw error;
    }
};

export const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create({
            userId: notificationData.userId,
            guestEmail: notificationData.guestEmail,
            type: notificationData.type,
            title: notificationData.title,
            body: notificationData.body,
            recipientType: notificationData.recipientType,
            data: notificationData.data || {},
            read: false,
            clicked: false
        });

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

export const getUserNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ user: userId })
            .populate("order")
            .sort({ createdAt: -1 });
        return notifications;
    } catch (error) {
        console.error("Error getting user notifications:", error);
        throw error;
    }
};