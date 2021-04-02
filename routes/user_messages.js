const express = require("express");
const { protect } = require("../middleware/auth");
const {
    getMessage,
    getNotifications,
    markNotificationsRead,
    markMessagesRead
} = require("../controllers/user_messages");

const router = express.Router();
router.route('/message').get(protect, getMessage);
router.route('/notification').get(protect, getNotifications);
router.route('/notification/read-id').put(protect, markNotificationsRead);
router.route('/message/read-id').put(protect, markMessagesRead);
module.exports = router;