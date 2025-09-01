const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'liter', 'ml', 'piece', 'packet', 'box', 'dozen'],
    required: true
  },
  unitSize: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  minStock: {
    type: Number,
    default: 5,
    min: 0
  },
  maxStock: {
    type: Number,
    default: 1000
  },
  imageUrl: {
    type: String,
    default: '/images/placeholder.jpg'
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  nutritionalInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String
  },
  expiryDate: Date,
  batchNumber: String,
  supplier: {
    name: String,
    contact: String,
    address: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  collection: 'products',
  timestamps: true
});

// Indexes for better performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'ratings.average': -1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discounted price
ProductSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

// Pre-save middleware
ProductSchema.pre('save', function (next) {
  // Auto-generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.name;
  }
  if (!this.seoDescription) {
    this.seoDescription = this.description.substring(0, 160);
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
