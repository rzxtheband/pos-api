// db.js
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'srv922.hstgr.io',
    user: 'u832555779_pos_api',
    password: 'PosApiAdmin@123',
    database: 'u832555779_pos_api',
    connectionLimit: 50 // Adjust as per your requirements
});

module.exports = pool.promise();
