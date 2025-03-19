import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    // Basic review information
    text: {
        type: String,
        required: [true, 'Review text is required'],
        minlength: [10, 'Review text must be at least 10 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must not exceed 5']
    },
    
    // User information
    reviewer: {
        type: String,
        required: [true, 'Reviewer name is required']
    },
    userEmail: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    
    // Store information
    store: String,
    
    // Media
    images: [String],
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    
    // Additional fields for moderation and interaction
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Automatically create and manage createdAt and updatedAt
});

// Update index without productId
ReviewSchema.index({ createdAt: -1 });

export default mongoose.model("Reviews", ReviewSchema);

// import mongoose from 'mongoose';

// const reviewSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: false // Make userId completely optional
//     },
//     // Guest user fields
//     isGuest: {
//       type: Boolean,
//       default: true // Default to guest reviews
//     },
//     guestName: {
//       type: String,
//       required: true, // Make name required
//       trim: true
//     },
//     guestEmail: {
//       type: String,
//       required: true, // Make email required
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
//     },
//     rating: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 5
//     },
//     comment: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 10
//     },
//     images: [{
//       type: String
//     }],
//     helpfulCount: {
//       type: Number,
//       default: 0
//     },
//     helpfulUsers: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }],
//     purchaseVerified: {
//       type: Boolean,
//       default: false
//     },
//     edited: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
//   }
// );

// Indexes for better query performance
// reviewSchema.index({ productId: 1, createdAt: -1 });
// reviewSchema.index({ userId: 1, createdAt: -1 });
// reviewSchema.index({ rating: -1 });
// reviewSchema.index({ helpfulCount: -1 });

// // Virtual for calculating the time since the review was posted
// reviewSchema.virtual('timeSince').get(function() {
//   const now = new Date();
//   const diff = now - this.createdAt;
//   const seconds = Math.floor(diff / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);
//   const months = Math.floor(days / 30);
//   const years = Math.floor(months / 12);

//   if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
//   if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
//   if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
//   if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//   if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
//   return 'Just now';
// });

// // Static method to get review statistics for a product
// reviewSchema.statics.getProductStats = async function(productId) {
//   const stats = await this.aggregate([
//     {
//       $match: { productId: mongoose.Types.ObjectId(productId) }
//     },
//     {
//       $group: {
//         _id: null,
//         avgRating: { $avg: '$rating' },
//         totalReviews: { $sum: 1 },
//         ratings: {
//           $push: '$rating'
//         }
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         avgRating: { $round: ['$avgRating', 1] },
//         totalReviews: 1,
//         ratingDistribution: {
//           5: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 5] } } } },
//           4: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 4] } } } },
//           3: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 3] } } } },
//           2: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 2] } } } },
//           1: { $size: { $filter: { input: '$ratings', cond: { $eq: ['$$this', 1] } } } }
//         }
//       }
//     }
//   ]);

//   return stats[0] || {
//     avgRating: 0,
//     totalReviews: 0,
//     ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
//   };
// };

// // Middleware to update product rating when a review is added/updated/deleted
// reviewSchema.post('save', async function() {
//   const stats = await this.constructor.getProductStats(this.productId);
//   await mongoose.model('Product').findByIdAndUpdate(this.productId, {
//     rating: stats.avgRating,
//     numReviews: stats.totalReviews
//   });
// });

// reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
//   const stats = await this.constructor.getProductStats(this.productId);
//   await mongoose.model('Product').findByIdAndUpdate(this.productId, {
//     rating: stats.avgRating,
//     numReviews: stats.totalReviews
//   });
// });

// const Review = mongoose.model('Review', reviewSchema);

// export default Review;