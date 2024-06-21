const express = require('express');
const serverless = require('serverless-http');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportsRoutes = require('./routes/reportRoutes');

const app = express();

// Route all requests starting with /api
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);

// Export the serverless handler
module.exports.handler = serverless(app);
