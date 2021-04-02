const express = require("express");
const { protect } = require("../middleware/auth");
const { saveRating, getRatings, contactUs, viewContactUs, replyContact } = require("../controllers/ratings");

const router = express.Router();
router.route("/").post(protect, saveRating);
router.route("/").get(protect, getRatings);
router.route("/contact").post(protect, contactUs);
router.route("/contact").get(protect, viewContactUs);
router.route("/contact/reply").post(protect, replyContact);

module.exports = router;