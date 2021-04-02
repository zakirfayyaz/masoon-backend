const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createBudget,
  viewBudgets,
  copyBudget,
  getBudgetsAndCopy,
  editBudget,
  deleteBudget,
  a,
} = require("../controllers/budget");
const multer = require("multer");
const parse = multer();

const router = express.Router();
// router.route('/copy/:month').get(protect, parse.any(), getBudgetsAndCopy)
router.route('/add').post(protect, parse.any(), createBudget);
// router.route('/delete-budget').delete(protect, a)
router.route('/month-year').put(protect, viewBudgets);
router.route('/copy').get(protect, copyBudget);
router.route('/update-id').put(protect, editBudget);
// router.route('/delete/kami').delete(protect, a);
router.route('/delete').delete(protect, deleteBudget);
module.exports = router;