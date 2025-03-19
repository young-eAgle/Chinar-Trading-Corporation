import jwt from 'jsonwebtoken';
import User from '../models/model.user.js';
import asyncHandler from "express-async-handler";
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

 export const verifyToken = (req, res, next)=>{
    const token = req.cookies.token;
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


export const AdminProtect = async (req, res, next) => {
  console.log("🛡️ AdminProtect Middleware Running...");

  try {
    // Check for token in cookies
    let token = req.cookies?.token;
    
    // If no cookie token, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log("🔹 Using token from Authorization header");
    }
    
    if (!token) {
      console.log("❌ No token found in AdminProtect middleware");
      return res.status(401).json({ message: "Access denied, no token provided" });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        console.log("❌ User not found with token ID");
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check if user is admin
      if (user.role !== "admin" && !user.isAdmin) {
        console.log("❌ User is not an admin:", user.email);
        return res.status(403).json({ message: "Access denied, admin only" });
      }
      
      // Set user in request
      req.user = user;
      console.log("✅ Admin verified:", user.email);
      next();
    } catch (error) {
      console.error("❌ Token verification error:", error.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("❌ AdminProtect middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



// Protect Routes (Authenticated Users Only)


export const protect_Order = async (req, res, next) => {

  try {

    console.log("🛡️ Order Protection Middleware Running...");

    const token = req.cookies?.token;
    console.log("🔹 Auth Middleware - Token:", token || "No token found");

    if (token) {
      // ✅ Authenticate as registered user
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.error("🔹 Token Verification Error:", error.message);
        
        // Check if it's a token expiration error and if refresh token exists
        if (error.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
          // Let it pass as a guest order for now
          // The frontend should handle token refresh separately
          console.log("🔹 Token expired but refresh token exists, continuing as guest");
          const guestEmail = req.body.shippingAddress?.email;
          req.guest = { email: guestEmail };
          req.user = null;
          return next();
        }
        
        return res.status(401).json({ 
          success: false,
          message: "Invalid or expired token" 
        });
      }

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "User not found, authorization denied" 
        });
      }

      req.user = user; // ✅ Attach user to request
      req.token = token; // Store token for potential invalidation
      console.log("🔹 Registered User Authenticated:", user.email);
      
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
export const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication"
    });
  }
};



export const UserProtect = async (req, res, next) => {
  try {
    console.log("🛡️ User Protect Middleware Running...");

    // Get token from cookies or Authorization header
    let token = req.cookies?.token;
    
    // If no cookie token, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log("🔹 Using token from Authorization header");
    }

    console.log("🔹 Auth Middleware - Token:", token ? "Token found" : "No token found");

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. Please log in." 
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("🔹 Token Verification Error:", error.message);
      
      // Check if it's a token expiration error
      if (error.name === 'TokenExpiredError') {
        // Check if refresh token exists
        const refreshToken = req.cookies?.refreshToken;
        
        if (refreshToken) {
          try {
            // Verify refresh token is valid before proceeding
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
            
            console.log("🔹 Access token expired, but refresh token found");
            // Store this information for potential auto-refresh in the future
            req.tokenExpired = true;
            
            // Continue to the next middleware only if we have a valid user ID from the expired token
            if (decoded && decoded.id) {
              // Try to get user from expired token
              const user = await User.findById(decoded.id).select("-password");
              if (user) {
                req.user = user;
                req.token = token;
                console.log("🔹 Using expired token's user info temporarily");
                return next();
              }
            }
            
            // If we can't get a valid user, return 401
            return res.status(401).json({ 
              success: false,
              message: "Token expired. Please refresh your token.",
              code: "TOKEN_EXPIRED"
            });
          } catch (refreshTokenError) {
            // Refresh token is also invalid
            return res.status(401).json({ 
              success: false,
              message: "All tokens expired. Please log in again.",
              code: "ALL_TOKENS_EXPIRED"
            });
          }
        } else {
          return res.status(401).json({ 
            success: false,
            message: "Token expired. Please log in again.",
            code: "TOKEN_EXPIRED"
          });
        }
      } else {
        return res.status(401).json({ 
          success: false,
          message: "Invalid token. Please log in again." 
        });
      }
    }

    // Fetch user from database
    const user = await User.findById(decoded?.id).select("-password");
    
    if (!user) {
      console.log("🔹 User not found with token ID");
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Store token in request for potential token invalidation during logout
    req.token = token;
    
    // Set user info in request
    req.user = user;
    console.log("🔹 User authenticated:", user.email || user.name || user._id);
    
    // Continue to the next middleware
    next();
  } catch (error) {
    console.error("🔹 Auth Middleware Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error during authentication" 
    });
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
    console.log("🛡️ RoleProtect Middleware Running...");
    console.log("🔍 Checking User:", req.user ? req.user.email : "Guest User");

    // Allow guest users if the route permits it
    if (!req.user) {
      if (allowedRoles.includes("guest")) {
        console.log("✅ Guest User Allowed");
        return next();
      }
      console.log("❌ Access Denied! User not authenticated.");
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user's role is permitted
    if (!allowedRoles.includes(req.user.role)) {
      console.log("❌ Access Denied! Role not permitted.");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("✅ Access Granted:", req.user.email, "Role:", req.user.role);
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

export const optionalAuth = async (req, res, next) => {
    try {
        // Check for token
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // If token exists, verify it
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                userId: decoded.userId,
                role: decoded.role
            };
        } else {
            // Check for guest email
            const guestEmail = req.headers['x-guest-email'];
            if (guestEmail) {
                req.user = {
                    guestEmail,
                    role: 'guest'
                };
            } else {
                return res.status(401).json({ message: 'Authentication required' });
            }
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};