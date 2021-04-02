const express = require("express");
const { protect } = require("../../middleware/auth");
const { advDashBoard, ads_list } = require("../../controllers/ads/advDashBoard");
const multer = require("multer");
const parse = multer();

const router = express.Router();
router.route('/dashboard').get(protect, advDashBoard);
router.route('/ads-list').get(protect, ads_list);
module.exports = router;
