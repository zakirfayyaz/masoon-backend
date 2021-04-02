const express = require("express");
const { languageChange, language, languageChangeForAnyUser } = require("../controllers/selectLanguage");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.route('/').put(protect, languageChange);
router.route('/change').put(protect, language);
router.route('/user/change-id').put(protect, languageChangeForAnyUser);

module.exports = router;
