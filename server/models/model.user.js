import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            maxLength: [30, 'Name cannot exceed 30 characters'],
            minLength: [4, 'Name should have more than 4 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            validate: {
                validator: function (v) {
                    return /\S+@\S+\.\S+/.test(v);
                },
                message: 'Please enter a valid email',
            },
        },
        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minLength: [6, 'Password should be greater than 6 characters'],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
                
            },
            url: {
                type: String,
               
            },
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["customer", "admin", "guest", "seller", "delivery"],
            default: "customer"
        },
        customerType: {
            type: String,
            enum: ["registered", "guest"],
            default: "registered"
        },
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }],
        tokens: [{
            token: {
                type: String,
                required: true
            },
            deviceInfo: {
                type: String,
                default: 'Unknown'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        refreshTokens: [{
            token: {
                type: String,
                required: true
            },
            deviceInfo: {
                type: String,
                default: 'Unknown'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                required: true
            }
        }],
        lastLogin: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        emailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationExpires: Date,
        pushToken: {
            type: String,
            default: null
        },
        pushEnabled: {
            type: Boolean,
            default: false
        },
        notificationPreferences: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            orderUpdates: {
                type: Boolean,
                default: true
            },
            promotions: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.matchPassword = async function(enterPassword) {
    try {
        return await bcrypt.compare(enterPassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = async function(deviceInfo = 'Unknown') {
    try {
        const token = jwt.sign(
            {
                id: this._id.toString(),
                role: this.role,
                email: this.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "1h"
            }
        );

        // Save token with device info
        this.tokens.push({
            token,
            deviceInfo
        });

        // Keep only last 5 tokens
        if (this.tokens.length > 5) {
            this.tokens = this.tokens.slice(-5);
        }

        await this.save();
        return token;
    } catch (error) {
        throw new Error('Error generating token');
    }
};

// Generate refresh token
userSchema.methods.generateRefreshToken = async function(deviceInfo = 'Unknown') {
    try {
        const refreshToken = jwt.sign(
            {
                id: this._id.toString(),
                tokenType: 'refresh'
            },
            process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d"
            }
        );
        
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
        
        // Save refresh token
        this.refreshTokens.push({
            token: refreshToken,
            deviceInfo,
            expiresAt
        });
        
        // Keep only last 5 refresh tokens
        if (this.refreshTokens.length > 5) {
            this.refreshTokens = this.refreshTokens.slice(-5);
        }
        
        await this.save();
        return refreshToken;
    } catch (error) {
        throw new Error('Error generating refresh token');
    }
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await this.save();
    return resetToken;
};

// Generate email verification token
userSchema.methods.getVerificationToken = async function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await this.save();
    return verificationToken;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.tokens;
    delete obj.passwordResetToken;
    delete obj.verificationToken;
    return obj;
};

const User = mongoose.model("User", userSchema);
export default User;