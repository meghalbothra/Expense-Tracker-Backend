const connectDB = require('../config/db');
const axios = require('axios');
const cron = require('node-cron');

// Function to send FCM notification
const sendNotification = async (fcmToken, message) => {
    try {
        await axios.post('http://localhost:8000/api/v1/auth/sendnotification', {
            fcmToken,
            message,
        });
        console.log('Notification sent successfully:', message);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

// Function to check and send reminders
const checkAndSendReminders = () => {
    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 19).replace('T', ' ');

    const query = 'SELECT * FROM reminders WHERE date <= ? AND notified = 0';
    connectDB.query(query, [formattedNow], (err, results) => {
        if (err) {
            console.error('Error fetching reminders:', err);
            return;
        }
        console.log('Current Time:', formattedNow);
        console.log('Reminders to notify:', results);

        results.forEach(async (reminder) => {
            if (reminder.completed === 1) {
                return; // Skip completed reminders
            }

            const fetchTokenQuery = 'SELECT fcmToken FROM users WHERE userId = ?';
            connectDB.query(fetchTokenQuery, [reminder.userId], async (err, result) => {
                if (err) {
                    console.error('Error in fetchTokenQuery:', err);
                    return;
                }

                if (result.length === 0) {
                    console.error('FCM token not found for userId:', reminder.userId);
                    return;
                }

                const fcmToken = String(result[0].fcmToken);
                console.log('FCM Token:', fcmToken);

                if (!fcmToken || fcmToken.trim() === '') {
                    console.error('Invalid FCM token for userId:', reminder.userId);
                    return;
                }

                const dateOnly = new Date(reminder.date).toISOString().split('T')[0];
                const message = `Reminder: ${reminder.title}\nDate: ${dateOnly}`;
                console.log('Sending notification:', message);

                // Flag to ensure notification is sent only once per reminder
                let notificationSent = false;

                if (!notificationSent) {
                    await sendNotification(fcmToken, message);
                    notificationSent = true;

                    // Update reminder as notified
                    const updateQuery = 'UPDATE reminders SET notified = 1 WHERE id = ?';
                    connectDB.query(updateQuery, [reminder.id], (err, result) => {
                        if (err) {
                            console.error('Error updating reminder as notified:', err);
                        } else {
                            console.log('Reminder marked as notified:', reminder.id);
                        }
                    });
                } else {
                    console.log('Notification already sent for reminder id:', reminder.id);
                }
            });
        });
    });
};

// Schedule the task to run every minute
cron.schedule('* * * * *', () => {
    console.log('Checking for reminders to notify...');
    checkAndSendReminders();
});

// Add a new reminder for the authenticated user
const addReminder = async (req, res) => {
    try {
        const { title, date } = req.body;
        let reminderDate;

        // Check if date includes time, otherwise append default time '12:03:00'
        if (date.includes('T')) {
            reminderDate = date; // Date already includes time
        } else {
            reminderDate = `${date} 04:00:00`; // Append default time '12:03:00'
        }

        const userId = req.userId;
        const query = 'INSERT INTO reminders (title, date, userId, notified, completed) VALUES (?, ?, ?, 0, 0)';
        connectDB.query(query, [title, reminderDate, userId], (err, results) => {
            if (err) {
                console.error('Error adding reminder:', err);
                return res.status(500).json({ message: 'Server Error' });
            }
            res.json({ id: results.insertId, title, date: reminderDate, userId, completed: false });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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
