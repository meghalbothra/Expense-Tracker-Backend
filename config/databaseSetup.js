const connectDB = require('./db');

function setupDatabase() {
    // Database connection
    connectDB.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL successfully...');
        
        // Checks if the database exists, if not, create it
        connectDB.query("CREATE DATABASE IF NOT EXISTS expense_tracker", (err) => {
            if (err) {
                console.error("Error creating database: ", err);
                return;
            }
            console.log("Database 'expense_tracker' created successfully");
            
            // Connect to the 'expense_tracker' database
            connectDB.query("USE expense_tracker", (err) => {
                if (err) {
                    console.error("Error selecting database: ", err);
                    return;
                }
                console.log("Connected to database 'expense_tracker'");
                
                // Create tables
                createTables();
            });
        });
    });
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
        console.error('Error in setupDatabase:', err);
    }
}

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connectDB.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', query);
                return reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = setupDatabase;
