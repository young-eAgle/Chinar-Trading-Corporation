import jwt from 'jsonwebtoken';
import User from '../models/model.user.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};





export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as admin' });
    }
}; ''


export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If token exists, verify it and set req.user
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
            } catch (error) {
                // If token verification fails, just continue without setting req.user
                console.log('Token verification failed, continuing as guest:', error.message);
            }
        }

        // Check for guest email in cookies or headers
        const guestEmail = req.cookies?.guestEmail || req.headers['guest-email'];
        
        // If user is not authenticated but we have a guest email, set up a guest user object
        if (!req.user && guestEmail) {
            req.user = {
                guestEmail: guestEmail,
                isGuest: true
            };
        } else if (!req.user) {
            // If there's no authenticated user and no guest email, set a minimal guest user object
            req.user = {
                isGuest: true
            };
        }

        // Continue to the next middleware regardless of authentication status
        next();
    } catch (error) {
        console.error('Error in optionalAuth middleware:', error);
        // Set default user object to avoid undefined errors
        req.user = { isGuest: true };
        // Continue anyway, treating as unauthenticated
        next();
    }
};