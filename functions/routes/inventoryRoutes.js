const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const db = require('../../config/db');

const router = express.Router();

router.use(express.json());

// GET /api/inventory
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM inventory');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/inventory/{product_id}
router.get('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        const [rows, fields] = await db.query('SELECT * FROM inventory WHERE product_id = ?', [product_id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Product not found in inventory' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/inventory/{product_id}/adjust
router.post('/:product_id/adjust', async (req, res) => {
    const { product_id } = req.params;
    const { adjustment } = req.body;

    try {
        const [currentStockRows] = await db.query('SELECT stock_quantity FROM inventory WHERE product_id = ?', [product_id]);

        if (currentStockRows.length === 0) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        const currentStock = currentStockRows[0].stock_quantity;
        const newStock = currentStock + adjustment;

        if (newStock < 0) {
            return res.status(400).json({ error: 'Cannot adjust stock to a negative value' });
        }

        await db.query('UPDATE inventory SET stock_quantity = ? WHERE product_id = ?', [newStock, product_id]);
        res.json({ message: 'Stock quantity adjusted successfully', new_stock_quantity: newStock });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/inventory/{product_id}/order
router.post('/:product_id/order', async (req, res) => {
    const { product_id } = req.params;
    const { quantity } = req.body;

    try {
        // Fetch current stock
        const [currentStockRows] = await db.query('SELECT stock_quantity FROM inventory WHERE product_id = ?', [product_id]);

        if (currentStockRows.length === 0) {
            return res.status(404).json({ error: 'Product not found in inventory' });
        }

        const currentStock = currentStockRows[0].stock_quantity;

        // Update inventory with ordered quantity
        const newStock = currentStock + quantity;
        await db.query('UPDATE inventory SET stock_quantity = ? WHERE product_id = ?', [newStock, product_id]);

        res.json({ message: 'Order placed successfully', new_stock_quantity: newStock });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;