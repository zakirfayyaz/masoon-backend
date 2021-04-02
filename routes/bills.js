const express = require("express");
const { protect } = require("../middleware/auth");
const { createBill, viewBills, payBill, viewBillsByMonth, viewBillsByDate, editBills, deleteBill } = require("../controllers/bills");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route('/get').get(protect, parse.any(), viewBills);
router.route('/update-id').put(protect, parse.any(), editBills);
router.route('/add').post(protect, createBill);
router.route('/pay-bill').post(protect, parse.any(), payBill);
router.route('/:month/:year').get(protect, viewBillsByMonth);
router.route('/:date/:month/:year').get(protect, viewBillsByDate);
router.route('/delete-id').put(protect, deleteBill);

module.exports = router;