const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductService = require('../services/productService');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// ============================================
// PUBLIC ROUTES
// ============================================

// GET all products (public) — with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, sort } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const products = await Product.find(query)
      .select('name price mrp discount stock imageUrl images category subcategory')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching products', { error: error.message });
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET products search (public)
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const products = await ProductService.searchProducts(query, page);
    res.json(products);
  } catch (error) {
    logger.error('Search error', { error: error.message });
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET a product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid Product ID' });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// ============================================
// ADMIN-ONLY ROUTES
// ============================================

// POST create a new product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Whitelist allowed fields — prevent mass assignment
    const { name, price, description, category, stock, imageUrl, unit, unitSize, mrp, discount, brand, subcategory } = req.body;
    const product = new Product({ name, price, description, category, stock, imageUrl, unit, unitSize, mrp, discount, brand, subcategory });
    await product.save();
    logger.info('Product created', { productId: product._id, adminId: req.user._id });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// PUT update a product by ID (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Whitelist allowed update fields
    const allowedFields = ['name', 'price', 'description', 'category', 'stock', 'imageUrl', 'unit', 'unitSize', 'mrp', 'discount', 'brand', 'subcategory', 'isActive', 'isFeatured'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    logger.info('Product updated', { productId: id, adminId: req.user._id });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product' });
  }
});

// DELETE a product by ID (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    logger.info('Product deleted', { productId: id, adminId: req.user._id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
