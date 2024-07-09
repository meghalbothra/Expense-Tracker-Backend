const connectDB = require('../config/db');

const getExpenseLimit = (req, res) => {
  const userId = req.userId; // Assuming userId is set by your auth middleware
  const query = `SELECT expenseLimit FROM users WHERE userId = ?`;

  connectDB.query(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching expense limit:', err);
      return res.status(500).json({ error: 'Failed to fetch expense limit' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expense limit not set for this user' });
    }

    res.json({ expenseLimit: rows[0].expenseLimit });
  });
};

const setExpenseLimit = (req, res) => {
  const userId = req.userId; // Assuming userId is set by your auth middleware
  const { expenseLimit } = req.body;

  // Validate expenseLimit (assuming it's a number)
  if (isNaN(expenseLimit)) {
    return res.status(400).json({ error: 'Expense limit must be a valid number' });
  }

  const updateQuery = `UPDATE users SET expenseLimit = ? WHERE userId = ?`;

  connectDB.query(updateQuery, [expenseLimit, userId], (err, result) => {
    if (err) {
      console.error('Error updating expense limit:', err);
      return res.status(500).json({ error: 'Failed to update expense limit' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or expense limit not updated' });
    }

    res.status(200).json({ success: true, message: 'Expense limit updated successfully' });
  });
};

module.exports = {
  getExpenseLimit,
  setExpenseLimit
};
