const admin = require("firebase-admin");
const serviceAccount = require("../masoon-fcm.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://masoon-bfe0b.firebaseio.com"
});

exports.fcmNotification_ = async (payload, token) => {
    console.log('Push Notifications sent')
    const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24
    }
    const fcmNotification = await admin.messaging().sendToDevice(token, payload, options)
}