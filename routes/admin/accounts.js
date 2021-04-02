const express = require("express");
const { protect } = require('../../middleware/auth');

const multer = require("multer");
const parse = multer();
const path = require("path");
const { createAccount, getAccounts, getAccountbyIdAndDelete, getAccountbyIdAndUpdate, getAccountbyId, addLogo, activateBank, deActivateBank } = require("../../controllers/admin/accounts");


let date = new Date();
let current_date = date.getTime();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './logo');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});


const router = express.Router();
router.route('/add').post(protect, upload.single('logo'), createAccount);
router.route('/update-logo-id').put(protect, upload.single('logo'), addLogo);
router.route('/retrieve').get(protect, getAccounts);
router.route('/remove-id').put(protect, getAccountbyIdAndDelete)
router.route('/update-id').put(protect, parse.any(), getAccountbyIdAndUpdate)
router.route('/retrieve-id').put(protect, getAccountbyId)
router.route('/activate-id').put(protect, activateBank)
router.route('/deactivate-id').put(protect, deActivateBank)

module.exports = router;