const connectDB = require('./db'); // Ensure you have correct database configuration in './db'

async function setupDatabase() {
    try {
        // Check MySQL connection
        await executeQuery('SELECT 1');
        console.log('Connected to MySQL successfully...');

        // Create database if it doesn't exist
        await executeQuery(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`);
        console.log(`Database ${process.env.MYSQL_DATABASE} created successfully`);

        // Use the created database
        await executeQuery(`USE ${process.env.MYSQL_DATABASE}`);
        console.log(`Connected to database ${process.env.MYSQL_DATABASE}`);

        // Create tables
        await createTables();
        console.log('All tables created successfully');
    } catch (err) {
        console.error('Error in setupDatabase:', err);
    }
}

async function createTables() {
    const createTableQueries = [
        `CREATE TABLE IF NOT EXISTS users (
            userId INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            joinedDate DATETIME NOT NULL,
            expenseLimit DECIMAL(10, 2) DEFAULT 0,
            fcmToken VARCHAR(255) NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS income (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            date DATE NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS goal_tracker (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT,
            name VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            allocation DECIMAL(10, 2) NOT NULL,
            achieved BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT,
            title VARCHAR(255) NOT NULL,
            date DATETIME NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            notified BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
        );`
    ];

    try {
        for (const query of createTableQueries) {
            await executeQuery(query);
            console.log('Table created successfully');
        }
    } catch (err) {
        console.error('Error creating tables:', err);
    }
}

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connectDB.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', query, 'Error:', err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = setupDatabase;
