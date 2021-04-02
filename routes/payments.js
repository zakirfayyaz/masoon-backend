const express = require("express");
const { protect } = require("../middleware/auth");
const {
    viewPayment,
    unPayBill,
    viewPaymentByMonth,
    viewPaymentByDate
} = require("../controllers/payments");
const multer = require("multer");
const parse = multer();

const router = express.Router();

router.route('/unPay-id').put(protect, parse.any(), unPayBill);
router.route('/get').get(protect, viewPayment);
router.route('/:month/:year').get(protect, viewPaymentByMonth);
router.route('/:date/:month/:year').get(protect, viewPaymentByDate);
module.exports = router;