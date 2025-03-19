import express from "express";
import User from "../models/model.user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import modelReview from "../models/model.review.js";
import { protect, UserProtect, roleProtect, guestProtect, allowedGuestOrAuth } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../Services/emailService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 attempts in production, 100 in development
    message: { 
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'production' ? 3 : 100, // 3 attempts in production, 100 in development
    message: {
        success: false,
        message: 'Too many signup attempts, please try again after an hour'
    }
});

// Utility function to generate JWT token
// const generateToken = (res, user) => {
//     const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { 
//         expiresIn: "30d",
//     });

    // Store token in HTTP-Only cookie
    // res.cookie("jwt", token, {
    //     httpOnly: true,  // Prevent JavaScript access (secure) 
    //     sameSite: "Lax", // Prevent CSRF attacks
    //     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    //     path: "/",
    //     domain:"localhost",
    // });

//     console.log("Set-Cookie Header Sent:", res.getHeaders()["set-cookie"]); // Debugging

//     return token; // Return for optional use (e.g., in JSON response)
// };


// Register User
router.post("/signup", signupLimiter, async(req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "Email and password are required" 
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        
        if (user) {
            if (user.role !== "guest") {
                return res.status(400).json({
                    success: false,
                    message: "User already exists, please log in"
                });
            }
            
            // Update guest user
            user.name = name || user.name;
            user.password = password;
            user.role = role && role !== "guest" ? role : "customer";
            user.customerType = "registered";
        } else {
            // Create new user
            user = new User({
                name: name || "Guest User",
                email,
                password,
                role: password ? role || "customer" : "guest",
                customerType: password ? "registered" : "guest"
            });
        }

        // Generate verification token for new users
        if (!user.emailVerified) {
            const verificationToken = await user.getVerificationToken();
            await sendVerificationEmail(user.email, verificationToken);
        }

        await user.save();

        // Generate token for immediate login
        const token = await user.getSignedJwtToken(req.headers['user-agent']);

        res.status(201).json({
            success: true,
            message: user.role === "guest" ? 
                "Guest User registered successfully" : 
                "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            },
            token
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred during signup"
        });
    }
});

// Login User
router.post("/login", loginLimiter, async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token with device info
        const token = await user.getSignedJwtToken(req.headers['user-agent']);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Set secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000, // 1 hour, to match our JWT_EXPIRE
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            },
            token
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred during login"
        });
    }
});

// Verify Email
router.get("/verify-email/:token", async(req, res) => {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error verifying email"
        });
    }
});

// Forgot Password
router.post("/forgot-password", async(req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const resetToken = await user.getResetPasswordToken();
        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: "Password reset email sent"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error sending password reset email"
        });
    }
});

// Reset Password
router.post("/reset-password/:token", async(req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error resetting password"
        });
    }
});

// Get Current User
router.get("/me", UserProtect, async(req, res) => {
    try {
        if (!req.user) {
            return res.status(200).json({
                success: true,
                user: null,
                role: "guest"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                emailVerified: req.user.emailVerified
            },
            role: req.user.role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error fetching user data"
        });
    }
});

// Logout User
router.post("/logout", UserProtect, async(req, res) => {
    try {
        // Clear the JWT cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        // Clear the refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        // Remove the current token from user's tokens array
        if (req.user) {
            req.user.tokens = req.user.tokens.filter(
                token => token.token !== req.token
            );
            
            // Get the refresh token from cookies
            const refreshToken = req.cookies.refreshToken;
            
            // If refresh token exists, remove it from the user's refreshTokens array
            if (refreshToken) {
                req.user.refreshTokens = req.user.refreshTokens.filter(
                    token => token.token !== refreshToken
                );
            }
            
            await req.user.save();
        }

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error logging out"
        });
    }
});

// Admin Routes
router.get("/admin/users", roleProtect("admin"), async(req, res) => {
    try {
        const users = await User.find({}).select('-password -tokens');
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error fetching users"
        });
    }
});

// Role-specific routes
router.get("/seller/orders", roleProtect("seller"), async(req, res) => {
    try {
        res.json({
            success: true,
            message: "Seller Order management Coming Soon!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

router.get("/delivery/orders", roleProtect("delivery"), async(req, res) => {
    try {
        res.json({
            success: true,
            message: "Delivery order management coming soon!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

// Guest Checkout
router.post("/guest-checkout", async(req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and Email are required for guest checkout"
            });
        }

        let guestUser = await User.findOne({ email });

        if (!guestUser) {
            guestUser = new User({
                name,
                email,
                role: "guest",
                customerType: "guest"
            });
            await guestUser.save();
        }

        res.status(200).json({
            success: true,
            message: "Guest checkout successful",
            guestUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

// Save Player ID for Customers & Admins
router.post("/save-player-id",  async(req,res)=>{
    try {
        
        const {playerId, userId} = req.body;


        if(!playerId || !userId){
            return res.status(400).json({error:"Missing playerId or userId",
                received:{pla}
            });

        }
        // Update user with the OneSignal Player ID
        await User.findByIdAndUpdate(userId, {oneSignalPlayerId:playerId});
     

        res.status(200).json({message:"Player ID saved successfully!"});

    } catch (error) {
        
        console.error("Error saving Player ID:", error);
        res.status(500).json({ error: "Failed to save Player ID." });
    }
})

// Refresh Access Token
router.post("/refresh-token", async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }
        
        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if refresh token exists in user's refreshTokens array
        const tokenExists = user.refreshTokens && user.refreshTokens.some(
            token => token.token === refreshToken
        );
        
        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: "Refresh token has been revoked"
            });
        }
        
        // Generate new access token
        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "1h" }
        );
        
        // Set new access token cookie
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            token: accessToken
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred during token refresh"
        });
    }
});

export default router