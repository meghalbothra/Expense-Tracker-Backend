const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD 
});

module.exports = connectDB