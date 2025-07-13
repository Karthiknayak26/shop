const express = require('express');
const app = express.Router();
const Product = require('../models/Product');

// GET all products
app.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json(products); // Return the list of products
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// GET a product by ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
app.post('/', async (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl } = req.body;
    const product = new Product({ name, price, description, category, stock, imageUrl });
    await product.save();
    res.status(201).json(product); // Return the created product
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// PUT update a product by ID
app.put('/:id', async (req, res) => {
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
app.delete('/:id', async (req, res) => {
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


const router = express.Router();
const ProductService = require('../services/ProductService');

router.get('/products/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const products = await ProductService.searchProducts(query, page);
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductDetails(id);
    res.json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
module.exports = app;

