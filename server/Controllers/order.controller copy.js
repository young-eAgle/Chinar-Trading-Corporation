import Order from "../models/model.order.js";
import User from "../models/model.user.js";
import Product from "../models/model.product.js";
import sendOrderConfirmationEmail from "../Services/emailService.js";
import {sendOrderNotificationToAdmin,sendCustomerNotification} from "../Services/notificationService.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import OneSignal from "react-onesignal";
import { compareSync } from "bcryptjs";



// 1st 
export const placeOrder = async (req, res) => {
    try {
        const { orderItems, totalPrice, billingAddress, shippingAddress, guestPlayerId } = req.body;

        if( !billingAddress || !shippingAddress || !orderItems.length ){
            return res.status(400).json({message:"Missing required fields"});
        }

        let customerType = req.user ? "registered" : "guest";
        let orderReference = req.user ? req.user._id : shippingAddress.email;

        let user = null;
        if(customerType === "registered"){
            user = await User.findById(orderReference);
            if(!user) return res.status(404).json({message:"User not found."});
        }


          // Fix: Ensure orderItems includes `products` field
    const formattedOrderItems = orderItems.map(item => ({
        products: item._id, // <-- Mapping `_id` to `products`
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }));
        const orderTrackingId = uuidv4();

        let orderData = {
            customerType,
            orderReference,
            user: user? user._id : null,
            guestUser:customerType === 'guest' ? {email:shippingAddress.email}:null,
            shippingAddress,
            billingAddress,
            orderItems:formattedOrderItems,
            totalPrice,
            orderTrackingId,
        };

        console.log("Order Data Received:" , orderData);
        // If it's a registered user, store user ID, otherwise store guest email
        const newOrder = new Order(orderData);
        await newOrder.save();

        if(customerType ==="registered"){
          await sendOrderNotificationToAdmin(newOrder, user?.oneSignalPlayerId);
        }else{
          await sendOrderNotificationToAdmin(newOrder, guestPlayerId);
        }


        await sendCustomerNotification(newOrder);
        console.log("Admin & Customer Notified About Order");
        console.log(newOrder.shippingAddress.email);
        let newEmail = newOrder.shippingAddress.email;

      
        const customerEmailContent =`
             <h2>Thank you for your order!</h2>
            <p>Your order ID: <strong>${newOrder._id}</strong></p>
            <p>Total Amount: <strong>$${totalPrice}</strong></p>
            <p>Payment Status: <strong>${newOrder.paymentStatus}</strong></p>
            <p>Estimated Delivery: <strong>${newOrder.estimatedDelivery}</strong></p>
            <p>We will notify you when your order is shipped.</p>
        `


        const adminEmailContent = `
          <h2>New Order Received</h2>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Total Amount:</strong> $${totalPrice}</p>
            <p><strong>Customer Email:</strong> ${newEmail}</p>
            <p><a href="${process.env.ADMIN_PANEL_URL}/orders/${newOrder._id}">View Order</a></p>

        `

        await sendOrderConfirmationEmail( newEmail, "Order Confirmation - Your Order has been placed! ", customerEmailContent );
        await sendOrderConfirmationEmail( process.env.ADMIN_EMAIL, "New Order Received ", adminEmailContent );

      //  sendPushNotification(newOrder);
        // Send email notification to Admin
      //    await sendEmail(
      //     process.env.ADMIN_EMAIL, // Admin Email
      //     "New Order Received",
      //     `<h2>New Order Placed</h2>
      //     <p><strong>Order ID:</strong> ${newOrder._id}</p>
      //     <p><strong>Total Amount:</strong> $${totalAmount}</p>
      //     <p><strong>Customer Email:</strong> ${customerEmail}</p>
      //     <p><a href="${process.env.ADMIN_PANEL_URL}/orders/${newOrder._id}">View Order</a></p>`
      // );

      res.status(201).json({ success: true, message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.log(error);
    }
};



  // Get All Orders (Admin)
  export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find().populate("orderItems");
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

      const orders = await Order.find({ createdAt: { $gte: twentyFourHoursAgo } }).sort({ createdAt: -1 });
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Pending Orders;

export const getPendingOrders = async (req, res)=>{
  try {

    const newOrders = await Order.find({orderStatus:"Pending"}).sort({createdAt: -1});

    res.json(newOrders);
    
  } catch (error) {
    
    res.status(500).json({message:"Error fetching Pending Products"})
  }

}

  // Update order status (Admin)
  export const updateOrderStatus = async (req, res) => {
    try {
        
        const { status,id } = req.body;

        console.log(req.body);
  
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).json({ message: "Invalid Order ID" });
        // }
  
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
  
        order.orderStatus = status;
        await order.save();
  
        res.json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  






// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate("orderItems");
      // const order = await Order.findById(req.params.id).populate("orderItems.product", "name price");
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };


  // Get Orders for a User or Guest
export const getOrdersByUser = async (req, res) => {
    try {
    //   const { userId, email } = req.query;
      const { userId, email } = req.query;
      console.log("this is UserId:",userId,"This is email:",email);
      console.log("Query",req.query);
      console.log("Params",req.query.params);

      
      if (!userId && !email) {
          return res.status(400).json({ message: "Provide userId or email" });
      }

      let orders;
      if (userId) {
        orders = await Order.find({ orderReference: userId }).populate("orderItems.product", "name price");
      } else if (email) {
        orders = await Order.find({ orderReference: email });
      } else {
        return res.status(400).json({ message: "Provide userId or email" });
      }
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };











// export const updateOrderStatus = async (req, res) => {
//     try {
//       const { status } = req.body;
//       const order = await Order.findById(req.params.id);
//       if (!order) return res.status(404).json({ message: "Order not found" });
//       order.orderStatus = status;
//       await order.save();
//       res.json({ message: "Order updated successfully", order });
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error: error.message });
//     }
//   };


// 2nd

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
  


// // 3rd

// export const getAllOrders = async (req, res) => {
//     try {
//         const orders = await Order.find().populate("user").sort({ createdAt: -1 });
//         res.status(200).json({ success: true, orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// export default getAllOrders;

// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { status } = req.body;

//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//         order.status = status;
//         await order.save();

//         res.status(200).json({ success: true, message: "Order status updated successfully!", order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


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






// // Create Order
// export const createOrder = async (req, res) => {
//   try {
//     const { customerType, orderReference, shippingAddress, billingAddress, orderItems, totalPrice } = req.body;
    
//     if (!customerType || !orderReference || !shippingAddress || !orderItems.length) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     let user = null;
//     if (customerType === "registered") {
//       user = await User.findById(orderReference);
//       if (!user) return res.status(404).json({ message: "User not found." });
//     }

//     const orderTrackingId = uuidv4();

//     const newOrder = new Order({
//       customerType,
//       orderReference,
//       user: user ? user._id : null,
//       guestUser: customerType === "guest" ? { email: orderReference } : null,
//       shippingAddress,
//       billingAddress,
//       orderItems,
//       totalPrice,
//       orderTrackingId,
//     });

//     await newOrder.save();
//     res.status(201).json({ message: "Order placed successfully!", order: newOrder });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Get Order by ID
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("orderItems.product", "name price");
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Get Orders for a User or Guest
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId, email } = req.query;
//     let orders;
//     if (userId) {
//       orders = await Order.find({ orderReference: userId });
//     } else if (email) {
//       orders = await Order.find({ orderReference: email });
//     } else {
//       return res.status(400).json({ message: "Provide userId or email" });
//     }
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Update Order Status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     order.orderStatus = status;
//     await order.save();
//     res.json({ message: "Order updated successfully", order });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Delete Order
// export const deleteOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     await order.remove();
//     res.json({ message: "Order deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };




