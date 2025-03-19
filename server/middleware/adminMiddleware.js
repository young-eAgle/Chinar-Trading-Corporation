import jwt from 'jsonwebtoken';
import Admin from '../models/model.admin.js';
import User from '../models/model.user.js';
import asyncHandler from 'express-async-handler';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first (preferred method)
  if (req.cookies.adminJwt) {
    token = req.cookies.adminJwt;
  } 
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      // Check if it's a user with admin role
      const user = await User.findOne({ 
        _id: decoded.id,
        $or: [{ isAdmin: true }, { role: 'admin' }]
      });
      
      if (!user) {
        res.status(401);
        throw new Error('Not authorized as admin');
      }
      
      // Attach user to request
      req.admin = user;
      req.isUserAdmin = true;
    } else {
      // Attach admin to request
      req.admin = admin;
      req.isUserAdmin = false;
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Check for specific permissions
export const hasPermission = (permission) => {
  return (req, res, next) => {
    // Skip permission check for super admins
    if (req.admin.role === 'admin' && req.admin.isAdmin) {
      return next();
    }
    
    // Check if admin has the required permission
    if (req.admin.permissions && req.admin.permissions.includes(permission)) {
      next();
    } else {
      res.status(403);
      throw new Error(`Not authorized: Missing ${permission} permission`);
    }
  };
};

// Super admin middleware - only true admins, not users with admin role
export const superAdmin = asyncHandler(async (req, res, next) => {
  if (!req.isUserAdmin && req.admin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a super admin');
  }
}); 