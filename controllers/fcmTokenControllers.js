const connectDB = require("../config/db");

const fcmTokenController = async (req, res) => {
    try {
        const { userId, newFcmToken } = req.body;

        // Validate input fields
        if (!userId || !newFcmToken) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Query to update FCM token in the users table
        const query = 'UPDATE users SET fcmToken = ? WHERE userId = ?';
        connectDB.query(query, [newFcmToken, userId], (err, result) => {
            if (err) {
                console.error("Error updating FCM token:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error updating FCM token on the server",
                    error: err,
                });
            }

            if (result.affectedRows === 0) {
                // No rows affected means userId was not found
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            console.log('FCM token updated for user:', userId);
            return res.status(200).json({
                success: true,
                message: 'FCM token updated successfully',
            });
        });
    } catch (error) {
        console.error("Error in FCM Token Controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error,
        });
    }
};

module.exports = fcmTokenController;
