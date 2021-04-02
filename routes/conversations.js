const express = require("express");
const { getConversation, sentByUser, sentByAdmin, getChatsFromRoomId } = require("../controllers/conversation");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route('/chats-id').put(protect, getChatsFromRoomId);
router.route('/').get(protect, getConversation);
router.route('/').post(protect, sentByUser);
router.route('/admin-id').post(protect, sentByAdmin);

module.exports = router;
