const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductService = require('../services/productService');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json(products); // Return the list of products
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// GET products search
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const products = await ProductService.searchProducts(query, page);
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET a product by ID (This must come AFTER specific routes like /search if /search was /:id, but here /search is distinct so it's fine. However, /:id will match 'search' if not careful. 'search' is not a valid mongo ID so it might fail casting, but better to keep specific routes first)
// Actually /search is /products/search in the original code?
// Original code: router.get('/products/search', ...) inside productRoutes.js
// If productRoutes is mounted at /api/products, then this becomes /api/products/products/search.
// That looks like a mistake in the original code too.
// I will assume the intention was /api/products/search.
// So I will change '/products/search' to '/search'.

// GET a product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if it's a valid mongo ID to avoid casting error for 'search' if it falls through
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Invalid Product ID' });
    }

    const product = await Product.findById(id); // Find product by ID
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product); // Return product details
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl, unit, unitSize } = req.body;
    const product = new Product({ name, price, description, category, stock, imageUrl, unit, unitSize });
    await product.save();
    res.status(201).json(product); // Return the created product
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// PUT update a product by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true }); // Update product
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct); // Return the updated product
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
});

// DELETE a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id); // Delete product
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error });
  }
});

module.exports = router;

