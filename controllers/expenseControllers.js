const connectDB = require('../config/db');

exports.getExpenses = (req, res) => {
    const userId = req.userId; // Assume `userId` is set by your authentication middleware
    const query = 'SELECT id, title, amount, category, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM expenses WHERE userId = ?';
    connectDB.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};

exports.addExpense = (req, res) => {
    const userId = req.userId; // Assume `userId` is set by your authentication middleware
    const { title, amount, category } = req.body;
    const query = 'INSERT INTO expenses (userId, title, amount, category, date) VALUES (?, ?, ?, ?, CURDATE())';
    connectDB.query(query, [userId, title, amount, category], (err, results) => {
        if (err) {
            console.error('Error adding expense:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        const insertedId = results.insertId;
        const insertedDate = new Date().toISOString().split('T')[0];
        res.status(201).json({ id: insertedId, title, amount, category, date: insertedDate });
    });
};

exports.deleteExpense = (req, res) => {
    const userId = req.userId; // Assume `userId` is set by your authentication middleware
    const { id } = req.params;
    const query = 'DELETE FROM expenses WHERE id = ? AND userId = ?';
    connectDB.query(query, [id, userId], (err) => {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    });
};

exports.getTransactions = (req, res) => {
    const userId = req.userId; // Assume `userId` is set by your authentication middleware
    const query = 'SELECT id, title, amount, category, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM expenses WHERE userId = ? ORDER BY date DESC';
    connectDB.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching expense transactions:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};
