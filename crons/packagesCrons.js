var cron = require('node-cron');
const users_model = require('../models/users_model');
const Logger = require('../models/Logger');
const UserPackage = require('../models/UserPackage');
const Ads = require('../models/ads/ads');
const pushNot = require('../middleware/pushNotification');
const sendEmail = require('../middleware/mails');
const Bill = require('../models/bills');
const Notification = require('../models/Notifications');
const { emailAlert, arEmailAlert } = require('../controllers/templates/enMail');

exports.cron = cron.schedule('0 0 * * *', async () => {
    const userPackages = await UserPackage.find({ status: { $ne: 'Expired' }, expiresAt: { $lt: new Date() } });
    if (userPackages.length > 0) {
        for (let i = 0; i < userPackages.length; i++) {
            let ads = await Ads.find({ user_package_id: userPackages[i].id, status: { $ne: 'Expired' } });
            if (ads.length > 0) {
                let adsUpdated = await Ads.updateMany({ user_package_id: userPackages[i].id }, { status: 'Expired' })
            }
            const user = await users_model.findOne({ _id: userPackages[i].user_id });
            let updateUser = await users_model.findByIdAndUpdate({ _id: userPackages[i].user_id }, { status: 'Pending' }, { new: true, useFindAndModify: false })
            // sendEmail()
            let arMessage = `انتهت صلاحية الباقة الخاصة بك ، يرجى طلب تجديد الإعلان`;
            let arSubject = `انتهت صلاحية الباقة`;
            let enMessage = 'Your package has expired, please renew your package and then request Ad renewal'
            let enSubject = 'Package Expired'
            if (user.language == "ar") {

                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'انتهت صلاحية الباقة',
                    html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject)
                };
                sendEmail(mailOptions);
                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    body: enMessage,
                    subject: enSubject,
                    arbody: arMessage,
                    arsubject: arSubject
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `انتهت صلاحية الباقة` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }
            } else {
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'Package expired',
                    html: emailAlert(user.firstname + ' ' + user.lastname, enMessage, enSubject)
                };
                sendEmail(mailOptions);
                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    body: enMessage,
                    subject: enSubject,
                    arbody: arMessage,
                    arsubject: arSubject
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `Package expired` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }
            }
            let updateUserPackage = await UserPackage.findByIdAndUpdate({ _id: userPackages[i].id }, { status: 'Expired' }, { new: true, useFindAndModify: false });
        }
    }
});