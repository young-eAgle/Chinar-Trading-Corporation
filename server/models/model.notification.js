import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestEmail: {
      type: String,
      required: false,
    },
    recipientType: {
      type: String,
      enum: ['user', 'guest', 'admin'],
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order_update", "promotion", "shipping", "system"],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    metadata: {
      deviceType: String,
      browser: String,
      platform: String,
      pushToken: String
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ guestEmail: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Methods
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save();
};

notificationSchema.methods.markAsClicked = function () {
  this.clicked = true;
  return this.save();
};

// Statics
notificationSchema.statics.getUnreadCount = function (identifier) {
  if (typeof identifier === 'string') {
    // For guest users (email)
    return this.countDocuments({ guestEmail: identifier, read: false });
  }
  // For registered users (userId)
  return this.countDocuments({ userId: identifier, read: false });
};

notificationSchema.statics.markAllAsRead = function (identifier) {
  if (typeof identifier === 'string') {
    // For guest users (email)
    return this.updateMany(
      { guestEmail: identifier, read: false },
      { $set: { read: true } }
    );
  }
  // For registered users (userId)
  return this.updateMany(
    { userId: identifier, read: false },
    { $set: { read: true } }
  );
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; 