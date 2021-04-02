const express = require("express");
const { protect } = require("../../middleware/auth");
const { getAds } = require("../../controllers/ads/allAds");

const router = express.Router();

router.route('/get').get(protect ,  getAds);

module.exports = router;
