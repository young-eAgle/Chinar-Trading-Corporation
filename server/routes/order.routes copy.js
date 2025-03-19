import express from 'express';
import Order from '../models/model.order.js';
import { placeOrder, getOrderById, 
    getOrdersByUser, 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder,
    getLast24HoursOrders,
    getOrderByReference,
    getPendingOrders, 
    getUserOrders} from "../Controllers/order.controller.js";



    // import { placeOrder,getAllOrders,updateOrderStatus,getLast24HoursOrders,getPendingOrders } from '../Controllers/order.controller.js';
// import  {placeOrder} from "../Controllers/order.controller.js";
import {protect,AdminProtect, guestProtect, roleProtect, }  from '../middleware/auth.js';
import {v4 as uuidv4} from 'uuid';
// import {isAuthenticated, isAdmin} from '../middleware/auth.js';

const router = express.Router();



// Create a new Order



// 1. Place an order (Guest or Registered Users)
// router.post(
//   "/place-order",
//   (req, res, next) => {
//     if (req.headers.authorization) {
//       return protect(req, res, next);  // Authenticated users
//     } else {
//       return guestProtect(req, res, next); // Guests
//     }
//   },
//   placeOrder
// );

router.get("/admin/all-orders", getAllOrders); 

router.post("/place-order", protect,  placeOrder);

// Get all orders (Admin only)
// router.get("/admin/all-orders", getAllOrders); 

// router.get("/admin/all-orders", protect,  (req, res) => {
  
// let data = res.json({ message: "Welcome, Admin!", adminData: {} });
// console.log("Response:",data);
// },getAllOrders);

// Get orders from the last 24 hours (Admin)
router.get("/admin/latest-orders",  getLast24HoursOrders);

// router.get("/admin/pending-orders",AdminProtect, roleProtect("admin"), getPendingOrders);
// router.get("/admin/latest-orders", protect, adminOnly, getLast24HoursOrders);

// Update Order Status(Admin Only)
// router.put("/admin/update/:orderId",updateOrderStatus)
// router.put("/admin/update/:orderId", AdminProtect, roleProtect("admin"), updateOrderStatus)
router.put("/admin/update/:orderId", updateOrderStatus)


// Get order by ID (Owner & Admin)
router.get("/order/:id",  getOrderById);


// Get User's Orders (Only for Registered Users)
// router.get("/user/my-orders", protect, getUserOrders);


// Update order status (Admin)
// router.put("/admin/orders/:id/status", protect, adminOnly, updateOrderStatus);






router.get("/guest/:email", async (req, res) => {
    try {
      const guestEmail = req.params.email;
  
      console.log("Fetching orders for guest email:", guestEmail); // Debugging Log
  
      // Ensure email is correctly used in the query
      const orders = await Order.find({ orderReference: guestEmail });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "No orders found for this email" });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching guest orders:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  

 // http:localhost:5000/orders/admin/all-orders
// Get all orders (Admin only)
// router.get("/admin", protect, isAdmin, getAllOrders);

// // Update order status
// router.put("/:id", protect, isAdmin, updateOrderStatus);

// // Delete order
// router.delete("/:id", protect, isAdmin, deleteOrder);

// 2. Get orders of a logged-in user
// router.get("/my-orders", isAuthenticated, getUserOrders);


// 3. Get all orders (Admin)
// router.get("/admin/orders", isAuthenticated, isAdmin, getAllOrders);

// 4. Update order status (Admin);
// router.get("/admin/orders/:orderId", isAuthenticated, isAdmin, updateOrderStatus);

// 5. Get order by reference(Guest or Admin)

router.get("/order/:reference", getOrderByReference);


// router.post("/create", async(req, res)=>{

//     try {
        

//         const{userId, guestUser, shippingAddress, billingAddress, orderItems,totalPrice} = req.body;
        
        

//         let orderData = {
//             shippingAddress,
//             billingAddress,
//             orderItems,
//             totalPrice,
//             orderStatus :"Pending",
//             orderTrackingId:uuidv4(),
//         }

//         if(userId){
//             // if user is logged in link the order to their account

//             orderData.user = userId;
//         }else{
//             // if guest user, store their details
//             if(!guestUser|| !guestUser.email  || !guestUser.firstName || !guestUser.phone){
//                 return res.status(400).json({message:"Guest user details are required"});
//             }
//             orderData.guestUser = guestUser;
//         }

//         const newOrder = new Order(orderData);
//         await newOrder.save();

//         res.status(201).json({message:"Order placed successfully", order:newOrder});


//     } catch (error) {
        
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }

// });

export default router;