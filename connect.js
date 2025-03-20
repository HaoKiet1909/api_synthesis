require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
    max: 20, // Số lượng kết nối tối đa trong pool
    query_timeout: 0,
});

pool.on('connect', () => {
    //console.log('Đã kết nối đến PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Lỗi kết nối đến PostgreSQL:', err.stack);
});

module.exports = {
    pool,
};
