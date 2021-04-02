const asyncHandler = require("../middleware/async");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");
const Message = require("../models/message");
const Notification = require("../models/Notifications");

exports.getMessage = asyncHandler(async (req, res, next) => {
    try {
        const messages = await Message.find({ user_id: req.user.id });
        let resp = {
            status: 200,
            messages: messages,
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.getNotifications = asyncHandler(async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id });
        let resp = {
            status: 200,
            notifications: notifications
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.markNotificationsRead = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        const updateNotificationStatus = await Notification.findByIdAndUpdate({ _id: cred.id },
            { status: 'Read' }, {
            new: true,
            useFindAndModify: false
        });

        let resp = {
            status: 200,
            message: `Notification marked as "Read"`,
            armessage: `تم قراءة الاشعار`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while processing',
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.markMessagesRead = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        const updateMessageStatus = await Message.findByIdAndUpdate({ _id: cred.id },
            { status: 'Read' }, {
            new: true,
            useFindAndModify: false
        });

        let resp = {
            status: 200,
            message: "Notification marked as Read"
        }

        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while processing',
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});

