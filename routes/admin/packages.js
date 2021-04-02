const express = require("express");
const { protect } = require('../../middleware/auth');
const { createPakcage, getPakcage, getPakcagebyId, getPakcagebyIdAndDelete, getPakcagebyIdAndUpdate } = require("../../controllers/admin/packages");

const router = express.Router();
router.route('/add').post(protect, createPakcage);
router.route('/retrive').get(protect, getPakcage);
router.route('/retrive-id').put(protect, getPakcagebyId);
router.route('/delete-id').put(protect, getPakcagebyIdAndDelete);
router.route('/update-id').put(protect, getPakcagebyIdAndUpdate);
module.exports = router;