import mongoose from 'mongoose';

const featuredSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['featured', 'special_offer'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  bannerImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
featuredSchema.index({ type: 1, isActive: 1, startDate: 1, endDate: 1 });
featuredSchema.index({ productId: 1 });

// Virtual populate to get product details
featuredSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

// Method to check if the featured item is currently active
featuredSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now;
};

const Featured = mongoose.model('Featured', featuredSchema);

export default Featured; 