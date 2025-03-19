import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customerType: {
      type: String,
      enum: ["guest", "registered"],
      required: true,
    },
    orderReference: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return this.customerType === "registered"
            ? mongoose.Types.ObjectId.isValid(value)
            : /\S+@\S+\.\S+/.test(value);
        },
        message: "Invalid order reference format",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.customerType === "registered";
      },
    },
    guestUser: {
      email: {
        type: String,
        required: function () {
          return this.customerType === "guest";
        },
      },
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      phone: { type: String, required: false },
    },
    shippingAddress: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      apartment: { type: String, required: false },
      city: { type: String, required: true },
      postalCode: { type: String, required: false },
      phone: { type: String, required: true },
    },
    billingAddress: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      apartment: { type: String, required: false },
      city: { type: String, required: true },
      postalCode: { type: String, required: false },
      phone: { type: String, required: true },
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: String,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true },
    orderTrackingId: { type: String, unique: true, required: true },
    adminNote: { type: String, default: "" },
    
    // New fields for timeline and communication
    timeline: [{
      status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        required: true
      },
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],
    
    communications: [{
      type: {
        type: String,
        enum: ["email", "sms", "system"],
        required: true
      },
      subject: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      status: {
        type: String,
        enum: ["sent", "delivered", "failed"],
        default: "sent"
      }
    }],
    
    shipping: {
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      trackingHistory: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now }
      }],
      shippingCost: Number,
      shippingMethod: String
    }
  },
  {
    timestamps: true,
  }
);

// Validate guest email matches shipping email (only for guests)
OrderSchema.pre("validate", function (next) {
  if (this.customerType === "guest" && this.guestUser?.email !== this.shippingAddress?.email) {
    return next(new Error("Guest email must match shipping email"));
  }
  next();
});

// Add timeline entry when order status changes
OrderSchema.pre("save", function(next) {
  if (this.isModified("orderStatus")) {
    this.timeline.push({
      status: this.orderStatus,
      note: `Order status changed to ${this.orderStatus}`,
      updatedBy: this.updatedBy
    });
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
