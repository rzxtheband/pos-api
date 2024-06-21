const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const db = require('../../config/db');

const router = express.Router();

router.use(express.json());

// GET /api/sales
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM sales');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/sales/{sale_id}
router.get('/:sale_id', async (req, res) => {
    const { sale_id } = req.params;
    try {
        const [rows, fields] = await db.query('SELECT * FROM sales WHERE sale_id = ?', [sale_id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Sale not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/sales
router.post('/', async (req, res) => {
    const { customer_id, sale_items } = req.body;

    // Validate stock availability for each item in the sale
    const validationQueries = sale_items.map(item => {
        return db.query('SELECT stock_quantity FROM products WHERE product_id = ?', [item.product_id]);
    });

    try {
        // Execute all validation queries in parallel
        const validations = await Promise.all(validationQueries);

        // Check if all products have sufficient stock
        const insufficientStock = validations.some(([rows]) => {
            const { stock_quantity } = rows[0];
            const requestedQuantity = sale_items.find(item => item.product_id === rows[0].product_id).quantity;
            return stock_quantity < requestedQuantity;
        });

        if (insufficientStock) {
            return res.status(400).json({ error: 'Insufficient stock for one or more products' });
        }

        // Start transaction to ensure atomicity
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into sales table
            const [result] = await connection.query('INSERT INTO sales (customer_id, total_amount) VALUES (?, ?)', [customer_id, total_amount]);

            // Insert into sale_items table
            const sale_id = result.insertId;
            const itemInsertPromises = sale_items.map(async item => {
                const { product_id, quantity, unit_price } = item;
                await connection.query('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                    [sale_id, product_id, quantity, unit_price, quantity * unit_price]);

                // Update stock quantity in products table
                await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [quantity, product_id]);
            });

            // Execute all item insert and stock update queries
            await Promise.all(itemInsertPromises);

            // Commit transaction
            await connection.commit();

            res.status(201).json({ message: 'Sale created successfully', sale_id });
        } catch (err) {
            await connection.rollback();
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/sales/{sale_id}/refund
router.post('/:sale_id/refund', async (req, res) => {
    const { sale_id } = req.params;

    // Fetch sale details
    try {
        const [saleRows] = await db.query('SELECT * FROM sales WHERE sale_id = ?', [sale_id]);

        // Check if sale exists
        if (saleRows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Start transaction to ensure atomicity
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert refund transaction
            await connection.query('INSERT INTO transactions (transaction_type, sale_id, amount) VALUES (?, ?, ?)',
                ['refund', sale_id, saleRows[0].total_amount]);

            // Refund stock to inventory
            const [saleItems] = await connection.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale_id]);
            const refundPromises = saleItems.map(async item => {
                await connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
                    [item.quantity, item.product_id]);
            });

            // Execute all refund queries
            await Promise.all(refundPromises);

            // Commit transaction
            await connection.commit();

            res.json({ message: 'Refund processed successfully' });
        } catch (err) {
            await connection.rollback();
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/customers/{customer_id}/sales
router.get('/customers/:customer_id/sales', async (req, res) => {
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
