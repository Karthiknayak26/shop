const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'category'
  },
  image: {
    type: String,
    default: '/images/categories/default.jpg'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
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
  displayOrder: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  colors: {
    primary: {
      type: String,
      default: '#1976d2'
    },
    secondary: {
      type: String,
      default: '#f5f5f5'
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
CategorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Auto-generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.name;
  }
  if (!this.seoDescription) {
    this.seoDescription = this.description || `Shop ${this.name} at Kandukuru Supermarket`;
  }

  next();
});

// Virtual for product count
CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Ensure virtual fields are serialized
CategorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', CategorySchema);
