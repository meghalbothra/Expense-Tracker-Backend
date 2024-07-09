const { sendNotificationToFCM } = require('../sendNotificationToFCM')

// POST /api/v1/auth/sendNotification
const notificationController = async (req, res) => {
  try {
    const { fcmToken, message } = req.body;

    
    if (!fcmToken || !message) {
      return res.status(400).json({ success: false, message: "FCM token and message are required" });
    }

    // Send the notification using a service or library like Firebase Admin SDK
    await sendNotificationToFCM(fcmToken, message);

    // Notification sent successfully
    res.status(200).json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = notificationController;