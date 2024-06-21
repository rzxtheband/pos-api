const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const db = require('../../config/db');

const router = express.Router();

router.use(express.json());

// GET /api/reports/sales
router.get('/sales', async (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    try {
        const [rows, fields] = await db.query('SELECT * FROM sales WHERE sale_date BETWEEN ? AND ?', [start_date, end_date]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/reports/top-selling-products
router.get('/top-selling-products', async (req, res) => {
    try {
        const [rows, fields] = await db.query(`
            SELECT p.product_id, p.name, SUM(si.quantity) AS total_quantity_sold
            FROM products p
            JOIN sale_items si ON p.product_id = si.product_id
            GROUP BY p.product_id
            ORDER BY total_quantity_sold DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/reports/customer-purchase-history/{customer_id}
router.get('/customer-purchase-history/:customer_id', async (req, res) => {
    const { customer_id } = req.params;

    try {
        const [rows, fields] = await db.query('SELECT * FROM sales WHERE customer_id = ?', [customer_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
