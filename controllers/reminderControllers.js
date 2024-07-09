const connectDB = require('../config/db');

// Fetch all reminders for the authenticated user
const getReminders = async (req, res) => {
    try {
        const userId = req.userId;
        const query = 'SELECT * FROM reminders WHERE userId = ?';
        connectDB.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching reminders:', err);
                return res.status(500).json({ message: 'Server Error' });
            }
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add a new reminder for the authenticated user
const addReminder = async (req, res) => {
    try {
        const { title, date } = req.body;
        const userId = req.userId;
        const query = 'INSERT INTO reminders (title, date, userId) VALUES (?, ?, ?)';
        connectDB.query(query, [title, date, userId], (err, results) => {
            if (err) {
                console.error('Error adding reminder:', err);
                return res.status(500).json({ message: 'Server Error' });
            }
            res.json({ id: results.insertId, title, date, userId, completed: false });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
    try {
        const reminderId = req.params.id;
        const userId = req.userId;
        const query = 'DELETE FROM reminders WHERE id = ? AND userId = ?';
        connectDB.query(query, [reminderId, userId], (err, results) => {
            if (err) {
                console.error('Error deleting reminder:', err);
                return res.status(500).json({ message: 'Server Error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Reminder not found' });
            }
            res.json({ message: 'Reminder deleted' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Toggle reminder completion status
const toggleReminderCompletion = async (req, res) => {
    try {
        const reminderId = req.params.id;
        const userId = req.userId;
        const querySelect = 'SELECT completed FROM reminders WHERE id = ? AND userId = ?';
        connectDB.query(querySelect, [reminderId, userId], (err, results) => {
            if (err) {
                console.error('Error fetching reminder:', err);
                return res.status(500).json({ message: 'Server Error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Reminder not found' });
            }
            const completed = results[0].completed;
            const queryUpdate = 'UPDATE reminders SET completed = ? WHERE id = ? AND userId = ?';
            connectDB.query(queryUpdate, [!completed, reminderId, userId], (err, results) => {
                if (err) {
                    console.error('Error updating reminder:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                res.json({ id: reminderId, completed: !completed });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getReminders,
    addReminder,
    deleteReminder,
    toggleReminderCompletion,
};
