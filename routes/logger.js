const express = require("express");
const { protect } = require("../middleware/auth");
const { getLoggerByDate } = require("../controllers/logger");

const router = express.Router();
// const multer = require("multer");
// const parse = multer();
router.route("/:status/:date").post(protect, getLoggerByDate);

module.exports = router;