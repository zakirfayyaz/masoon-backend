const express = require("express");
const { protect } = require("../middleware/auth");
const { createPhone_sms, getPhoneSms, categorizeSms, readSms, getCategorizeSms, getCategorizedSmsById, deleteAllPhoneSms } = require("../controllers/phoneSms");
const multer = require("multer");
const parse = multer();

const router = express.Router();
router.route('/body').post(protect, createPhone_sms);
router.route('/body/categorize').post(protect, categorizeSms);
router.route('/:sms_id').put(protect, readSms);
router.route('/body').get(protect, getPhoneSms);
router.route('/body/categorize/all').get(protect, getCategorizeSms);
router.route('/body/categorize/all/:id').get(protect, getCategorizedSmsById);
router.route('/body').delete(protect, deleteAllPhoneSms);
module.exports = router;