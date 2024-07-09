const axios = require("axios");
const serviceAccount = process.env.FIREBASE_CONFIG;

const sendNotificationToFCM = async (fcmToken, mssg) => {
  // const fcmURL = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
  const fcmURL = `https://fcm.googleapis.com/fcm/send`;

  const payload = {
    to: 'fvX102prafk0jxQQiyVOF6:APA91bF2JNFDni_N8ADQZyBWpZzUhuPld-tmLuTNRNpbKpqmTOwVfsq8yL1gqYwy6DQ88FnOwD_5DHOHWbOp4l7zTkb7e00vbBHkxvNFZ5mrqdgRPFnfYhqaRoq1zHXoMRt8UTjhhaMc',
    notification: {
      title: "Budget Buddu",
      body: mssg,
    },
  };

  try {
    const response = await axios.post(fcmURL, payload, {
      headers: {
        Authorization: `key=${process.env.SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("FCM Response:", response.data);
  } catch (error) {
    console.error(
      "Error sending FCM message:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = { sendNotificationToFCM };
