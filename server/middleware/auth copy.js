import jwt from 'jsonwebtoken';
import User from '../models/model.user.js';
import asyncHandler from "express-async-handler";
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

 export const verifyToken = (req, res, next)=>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(404).json({message:"Unauthorized, no token"});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        res.status(401).json({message:"Unauthorized, invalid token"});
        
    }
};


export const AdminProtect = (req, res, next) => {
  console.log("🛡️ AdminProtect Middleware Running...");

  if (!req.user) {
    return res.status(403).json({ message: "Access denied, admin only" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }

  console.log("🔹 Admin Verified:", req.user.email);
  next();
};



// Protect Routes (Authenticated Users Only)

export const protect = async (req, res, next) => {

  try {

    console.log("🛡️ My Protect Middleware Running...");

    const token = req.cookies?.jwt;
    console.log("🔹 Auth Middleware - Token:", token || "No token found");

    if (token) {
      // ✅ Authenticate as registered user
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.error("🔹 Token Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found, authorization denied" });
      }

      req.user = user; // ✅ Attach user to request
      console.log("🔹 Registered User Authenticated:",user.email);
      
    } else {
      // ✅ Authenticate as guest user
      const guestEmail = req.body.shippingAddress?.email; // Ensure email is provided
      // if (!guestEmail) {
      //   return res.status(400).json({ message: "Guest users must provide an email" });
      // }

      req.guest = { email: guestEmail }; // ✅ Attach guest data
      req.user = null;
      console.log("🔹 Guest User Identified:", guestEmail);
    }

    next(); // Move to next middleware or route handler

  } catch (error) {
    console.error("🔹 Auth Middleware - Error:", error.message);
    res.status(500).json({ message: "Server error during authentication" });
  }
};






// export const protect = async (req, res, next) => {
//   try {
//       // ✅ Extract token from cookies
//       const token = req.cookies.jwt;
//       console.log("This is Protect middleware Token:",token);

//       if (!token) {
//         console.log("No Token Found in Protect")
//           return res.status(401).json({ message: "Not authorized, token missing" });
//       }

//       // ✅ Verify JWT token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // ✅ Fetch user from database
//       const user = await User.findById(decoded.id).select("-password"); // Exclude password

//       if (!user) {
//           return res.status(401).json({ message: "User not found, authorization denied" });
//       }

//       // ✅ Attach user to request object
//       req.user = user;
//       next(); // Move to next middleware or route handler
//   } catch (error) {
//       console.error("Authentication Error:", error);
//       res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// };
// export const protect = asyncHandler(async (req,res, next)=>{

//   console.log("🔹 Headers:", req.headers);
//   console.log("🔹 Cookies:", req.cookies);
//   console.log("🔹 Authorization Header:", req.headers.authorization);

//   let token = req.cookies.jwt;
//   console.log("We have Received the Token Value:", token);
  
//   // let token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization?.split(" ")[1]);

//   if(!token){
//     console.log("❌ No token received in protect middleware");
//     return res.status(401).json({message:"Not authorized, no token "});
//   }

//   try {

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     if(!req.user){
//       console.log("Protect Error :No User");
//       return res.status(401).json({message:"User not found"});
      
//     }
//     console.log("✅ User authenticated:", req.user.email);
//     next();
    
//   } catch (error) {
//     console.log("❌ Invalid token:", error.message);
//     res.status(401).json({message:"Invalid token "});
    
//   }
// });


// //Role-Based Protection
export const roleProtect = (allowedRoles) => {
  return (req, res, next) => {
    console.log("🔹 roleProtect Middleware Running...");
    // console.log("🔍 Checking User:", req.user ? req.user.email : "No user found");

    // if (!req.user) {
    //   console.log("❌ Access Denied! User not authenticated.");
    //   return res.status(403).json({ message: "Access denied" });
    // }

    if (!allowedRoles === "admin"){
      console.log("❌ Access Denied! Role not permitted.");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("✅ Access Granted");
    next();
  };
};


// Guest User Middleware (Allows Guests & Customers);

export const guestProtect = (req, res, next) => {
  // If user is logged in, reject the guest middleware
  if (req.user) {
    return res.status(403).json({ message: "Guests only, registered users cannot access this route" });
  }

  // Check if guest details exist in the request (email in shipping address)
  if (!req.body.shippingAddress || !req.body.shippingAddress.email) {
    return res.status(401).json({ message: "Unauthorized, guest email required" });
  }

  // Guest is valid, proceed
  next();
};



// export const guestProtect = (req, res, next) => {
//   if (!req.user) {
//     console.log("Guest Protect Error:" ,res.error);
//       return res.status(401).json({ message: "Unauthorized, please log in" });
//   }

//   if (req.user.role !== "guest" && req.user.role !== "customer") {
//       return res.status(403).json({ message: "Guests & customers only" });
//   }

//   next();
// };




// export const guestProtect = (req, res, next)=>{
//   if(!req.user || (req.user.role !== "guest" && req.user.role !== "customer" )){

//     return res.status(403).json({messsage:"Guests & customers only"});
//   }
//   next();
// };



export const allowedGuestOrAuth = asyncHandler (async(req, res, next)=>{

  let token = req.cookies.token || req.headers.authorization?.split("")[1];

  if(token){
    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if(!req.user){
        return res.status(401).json({message:"User not found"});
      }
      
    } catch (error) {
      
      return res.status(401).json({message:"Invalid token"});
    }
  }else {
    req.user = {role:"guest"};
  }
  next();
});

// export default verifyToken;

// export const protect = async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1]; // Bearer Token

//   if (!token) return next(); // No token = Guest user

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     next();
//   } catch (error) {
//     console.log("Invalid token:", error);
//     next(); // Continue as guest user
//   }
// };

export const protect2 = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
          token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id).select("-password");
          next();
      } catch (error) {
          res.status(401).json({ message: "Not authorized, token failed" });
      }
  } else {
      res.status(401).json({ message: "Not authorized, no token" });
  }
};


// export const adminOnly = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//       next();
//   } else {
//       res.status(403).json({ message: "Admin access only" });
//   }
// };

// export const adminProtect = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//       next();
//   } else {
//       res.status(403).json({ message: "Access denied, admin only" });
//   }
// };