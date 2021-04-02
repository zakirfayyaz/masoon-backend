const express = require("express");
const { truncateUser } = require("../../controllers/truncateDB/truncateData");
const { protect } = require("../../middleware/auth");

const router = express.Router();
router.route('/').post(truncateUser);

module.exports = router;
