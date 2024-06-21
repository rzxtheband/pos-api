const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version for async/await
const db = require('../../config/db');

const router = express.Router();

router.use(express.json());

// GET /api/customers
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM customers');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/customers/{customer_id}
router.get('/:customer_id', async (req, res) => {
    const { customer_id } = req.params;
    try {
        const [rows, fields] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [customer_id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/customers
router.post('/', async (req, res) => {
    const { first_name, last_name, email, phone, address } = req.body;
    try {
        const [result] = await db.query('INSERT INTO customers (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, address]);
        res.status(201).json({ message: 'Customer added successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/customers/{customer_id}
router.put('/:customer_id', async (req, res) => {
    const { customer_id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;
    try {
        await db.query('UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ?',
            [first_name, last_name, email, phone, address, customer_id]);
        res.json({ message: 'Customer updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/customers/{customer_id}
router.delete('/:customer_id', async (req, res) => {
    const { customer_id } = req.params;
    try {
        await db.query('DELETE FROM customers WHERE customer_id = ?', [customer_id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
