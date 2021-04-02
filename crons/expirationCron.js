var cron = require('node-cron');
const users_model = require('../models/users_model');
const Logger = require('../models/Logger');
const UserPackage = require('../models/UserPackage');
const Ads = require('../models/ads/ads');
const pushNot = require('../middleware/pushNotification');
const sendEmail = require('../middleware/mails');
const Bill = require('../models/bills');
const Notification = require('../models/Notifications');

// OTP Expiration Crons
exports.cron = cron.schedule('* * * * *', async () => {
    const users = await users_model.find();
    const loggers = await Logger.find();
    for (let i = 0; i < users.length; i++) {
        if (users[i].otp_expires != null && users[i].otp_expires != undefined) {
            if (users[i].otp_expires.getTime() <= new Date().getTime()) {
                const expire_otp = await users_model.findByIdAndUpdate({ _id: users[i].id }, { otp: "", otp_expires: "" }, { new: true, useFindAndModify: false });
            }
        }
    }
});