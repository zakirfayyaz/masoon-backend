const express = require("express");
const { protect } = require("../middleware/auth");
const { createMerchant, viewMerchants } = require("../controllers/merchant");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route("/add").post(protect, parse.any(), createMerchant);
router.route('/get').get(protect, parse.any(), viewMerchants);
// router.route("/:id").get(protect, viewBill).put(protect, editBills).delete(protect, deleteBill);

module.exports = router;