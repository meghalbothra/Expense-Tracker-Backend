const connectDB = require('../config/db');

exports.getIncomes = (req, res) => {
    const userId = req.userId; // Use req.userId instead of req.body.userId
    const query = 'SELECT id, title, amount, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM income WHERE userId = ?';
    connectDB.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching incomes:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};

exports.addIncome = (req, res) => {
    const userId = req.userId; // Use req.userId instead of req.body.userId
    const { title, amount } = req.body;
    const query = 'INSERT INTO income (userId, title, amount, date) VALUES (?, ?, ?, CURDATE())';
    connectDB.query(query, [userId, title, amount], (err, results) => {
        if (err) {
            console.error('Error adding income:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(201).json({ id: results.insertId, title, amount, date: new Date().toISOString().split('T')[0] });
    });
};

exports.deleteIncome = (req, res) => {
    const userId = req.userId; // Use req.userId instead of req.body.userId
    const { id } = req.params;
    const query = 'DELETE FROM income WHERE id = ? AND userId = ?';
    connectDB.query(query, [id, userId], (err) => {
        if (err) {
            console.error('Error deleting income:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json({ success: true, message: 'Income deleted successfully' });
    });
};

exports.getTransactions = (req, res) => {
    const userId = req.userId; // Use req.userId instead of req.body.userId
    const query = 'SELECT id, title, amount, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM income WHERE userId = ? ORDER BY date DESC';
    connectDB.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching income transactions:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};
