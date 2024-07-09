const connectDB = require("../config/db");


const fcmTokenController = async (req, res) => {
    try {
        const { role, userId, registrationId, newFcmToken } = req.body;

        let table, idColumn;
        switch (role.toLowerCase()) {
            case "user":
                table = "user";
                idColumn = "userId";
                break;
            case "hospital":
                table = "hospital";
                idColumn = "registrationId";
                break;
            case "organisation":
                table = "organisation";
                idColumn = "registrationId";
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid role specified",
                });
        }

        // Update FCM token in the corresponding table
        const query = `UPDATE ${table} SET fcmToken = ? WHERE ${idColumn} = ?`;
        connectDB.query(query, [newFcmToken, userId || registrationId], (err, result) => {
            if (err) {
                console.error("Error updating FCM token:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error updating FCM token in server",
                    error: err,
                });
            }
            console.log(`FCM token updated for ${role}`);
            return res.status(200).json({
                success: true,
                message: `FCM token updated for ${role}`,
            });
        });
    } catch (error) {
        console.error("Error in Update FCM Controller:", error);
        res.status(500).json({
            success: false,
            message: "Error in Update FCM Controller API",
            error: error,
        });
    }
};

module.exports =  fcmTokenController ;


