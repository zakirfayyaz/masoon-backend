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
    const bills = await Bill.find();
    for (let bill of bills) {
        if (bill.due_date.getDate() == new Date().getDate() && bill.due_date.getMonth() == new Date().getMonth()
            && bill.due_date.getFullYear() == new Date().getFullYear()) {
            // console.log(bill.due_date.getDate(), "   ", new Date().getDate())
            if (bill.notified_for_last_Date == false) {
                const update_notify = await Bill.findByIdAndUpdate({ _id: bill.id },
                    { notified_for_last_Date: true },
                    { new: true, useFindAndModify: false });
                const user = await users_model.findById({ _id: bill.user_id });
                let enMessage = `Today is the last date for your bill of ${bill.name}`
                let arMessage = `اليوم هو آخر موعد لدفع فاتورة ${bill.name}`
                let enSubject = `Bill Alert`
                let arSubject = `تنبيه الفاتورة`

                if (user.language == 'ar') {
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: enSubject,
                        html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject)
                    };
                    sendEmail(mailOptions);
                    if (user.playerId !== null && user.playerId !== "disabled") {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: arMessage },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                } else {
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: enSubject,
                        html: emailAlert(user.firstname + ' ' + user.lastname, enMessage, enSubject)
                    };
                    sendEmail(mailOptions);
                    if (user.playerId !== null && user.playerId !== "disabled") {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: `Last date for bill payment of ${bill.name}` },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                }
                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    body: `Due date has passed for the the bill of ${bill.name}`,
                    subject: 'Overdue',
                    arbody: arMessage,
                    arsubject: arSubject
                });

            }
        } else if (bill.due_date.getDate() < new Date().getDate() && bill.due_date.getMonth() == new Date().getMonth()
            && bill.due_date.getFullYear() == new Date().getFullYear()) {
            if (bill.notified_for_last_date_passed == false) {
                const update_notify = await Bill.findByIdAndUpdate({ _id: bill.id },
                    { notified_for_last_date_passed: true },
                    { new: true, useFindAndModify: false });

                const user = await users_model.findById({ _id: bill.user_id });
                let enMessage = `Today is the last date for your bill of ${bill.name}`
                let arMessage = `انقضى تاريخ استحقاق فاتورة ${bill.name}`
                let enSubject = `Bill Alert`
                let arSubject = `تنبيه الفاتورة`

                if (user.language == 'ar') {
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: enSubject,
                        html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject)
                    };
                    sendEmail(mailOptions);
                    if (user.playerId !== null && user.playerId !== "disabled") {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: arMessage },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                } else {
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: enSubject,
                        html: emailAlert(user.firstname + ' ' + user.lastname, enMessage, enSubject)
                    };
                    sendEmail(mailOptions);
                    if (user.playerId !== null && user.playerId !== "disabled") {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: `Due date has passed for the the bill of ${bill.name}` },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                }

                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    body: `Due date has passed for the the bill of ${bill.name}`,
                    subject: 'Overdue',
                    arbody: arMessage,
                    arsubject: arSubject
                });

                console.log("Done");
            }
        }
    }
});