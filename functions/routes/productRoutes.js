const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const serverless = require('serverless-http');
const db = require('../../config/db'); // Assuming your db.js is in config folder

const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// GET /products
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /products/{product_id}
router.get('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        const [rows, fields] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /products
router.post('/', async (req, res) => {
    const { name, category, price, description, barcode, stock_quantity } = req.body;
    try {
        const [result] = await db.query('INSERT INTO products (name, category, price, description, barcode, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, price, description, barcode, stock_quantity]);
        res.status(201).json({ message: 'Product added successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /products/{product_id}
router.put('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    const { name, category, price, description, barcode, stock_quantity } = req.body;
    try {
        await db.query('UPDATE products SET name = ?, category = ?, price = ?, description = ?, barcode = ?, stock_quantity = ? WHERE product_id = ?',
            [name, category, price, description, barcode, stock_quantity, product_id]);
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /products/{product_id}
router.delete('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE product_id = ?', [product_id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /products/search?q={query}
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        const [rows, fields] = await db.query('SELECT * FROM products WHERE name LIKE ?', [`%${q}%`]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
