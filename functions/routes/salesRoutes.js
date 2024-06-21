const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const db = require('../../config/db');

const router = express.Router();

router.use(express.json());

// GET /api/sales
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM sales');
        const salesWithItems = await Promise.all(rows.map(async (sale) => {
            const [itemsRows] = await db.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.sale_id]);
            return {
                ...sale,
                items: itemsRows
            };
        }));
        res.json(salesWithItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/sales/{sale_id}
router.get('/:sale_id', async (req, res) => {
    const { sale_id } = req.params;
    try {
        const [salesRows] = await db.query('SELECT * FROM sales WHERE sale_id = ?', [sale_id]);
        if (salesRows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const [itemsRows] = await db.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale_id]);

        const saleDetails = {
            sale_id: salesRows[0].sale_id,
            customer_id: salesRows[0].customer_id,
            sale_date: salesRows[0].sale_date,
            total_amount: salesRows[0].total_amount,
            items: itemsRows // Include sale items in the response
        };

        res.json(saleDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/sales
router.post('/', async (req, res) => {
    const { customer_id, total_amount, items } = req.body;

    try {
        // Begin transaction to ensure atomicity
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into sales table
            const [result] = await connection.query('INSERT INTO sales (customer_id, total_amount) VALUES (?, ?)', [customer_id, total_amount]);
            const saleId = result.insertId;

            // Process sale items and update inventory
            for (const item of items) {
                // Insert into sale_items table
                await connection.query('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                    [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]);

                // Update inventory table - reduce stock quantity
                await connection.query('UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [item.quantity, item.product_id]);
            }

            // Commit transaction
            await connection.commit();
            connection.release();

            res.json({ message: 'Sale created successfully', sale_id: saleId });
        } catch (err) {
            // Rollback transaction on error
            await connection.rollback();
            connection.release();
            throw err; // Throw error to outer catch block
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/sales/{sale_id}/refund
router.post('/:sale_id/refund', async (req, res) => {
    const { sale_id } = req.params;

    try {
        // Fetch sale details
        const [saleRows] = await db.query('SELECT * FROM sales WHERE sale_id = ?', [sale_id]);
        if (saleRows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Perform refund operation (for demonstration purposes, not implemented here)

        res.json({ message: 'Refund initiated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/customers/{customer_id}/sales
router.get('/customers/:customer_id', async (req, res) => {
    const { customer_id } = req.params;

    try {
        const [rows, fields] = await db.query('SELECT * FROM sales WHERE customer_id = ?', [customer_id]);
        const salesWithItems = await Promise.all(rows.map(async (sale) => {
            const [itemsRows] = await db.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.sale_id]);
            return {
                ...sale,
                items: itemsRows
            };
        }));
        res.json(salesWithItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
