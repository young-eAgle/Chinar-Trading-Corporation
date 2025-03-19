import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter admin name'],
            maxLength: [30, 'Name cannot exceed 30 characters'],
            minLength: [4, 'Name should have more than 4 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please enter admin email'],
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
            required: [true, 'Please enter password'],
            minLength: [6, 'Password should be greater than 6 characters'],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
        role: {
            type: String,
            default: "admin",
            immutable: true
        },
        permissions: [{
            type: String,
            enum: [
                "manage_orders",
                "manage_products",
                "manage_users",
                "manage_admins",
                "view_analytics",
                "manage_settings"
            ]
        }],
        lastActive: {
            type: Date,
            default: Date.now
        },
        pushToken: {
            type: String,
            default: null
        },
        pushEnabled: {
            type: Boolean,
            default: true
        },
        notificationPreferences: {
            orderUpdates: {
                type: Boolean,
                default: true
            },
            systemAlerts: {
                type: Boolean,
                default: true
            },
            userActivities: {
                type: Boolean,
                default: true
            }
        },
        deviceInfo: {
            type: Map,
            of: String,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
adminSchema.pre("save", async function(next) {
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
adminSchema.methods.matchPassword = async function(enterPassword) {
    try {
        return await bcrypt.compare(enterPassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Generate JWT token
adminSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
            email: this.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "24h"
        }
    );
};

// Update last active timestamp
adminSchema.methods.updateLastActive = function() {
    this.lastActive = Date.now();
    return this.save();
};

// Remove sensitive data when converting to JSON
adminSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.pushToken;
    return obj;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin; 