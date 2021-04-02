const express = require("express");
const { protect } = require("../../middleware/auth");
const {
    income, Expense, expenseByMonth, incomeByMonth, expenseByDate, incomeByDate, ExpenseReport, incomeReport, yearlyReport, quarterlyReport
} = require("../../controllers/trends/trends");

// const multer = require("multer");
// const parse = multer();

const router = express.Router();
router.route('/income/:status').get(protect, income);
router.route('/expense/:status').get(protect, Expense); // 1
router.route('/expense/:month/:year/:status').get(protect, expenseByMonth); // 2
router.route('/income/:month/:year/:status').get(protect, incomeByMonth);
router.route('/expense/:date/:month/:year/:status').get(protect, expenseByDate);
router.route('/income/:date/:month/:year/:status').get(protect, incomeByDate);
router.route('/expenseReport/:month/:year/:status').get(protect, ExpenseReport);
router.route('/incomeReport/:month/:year/:status').get(protect, incomeReport);
router.route('/yearlyReport/:year/:status').get(protect, yearlyReport);
router.route('/quarterlyReport/:quarter/:year/:status').get(protect, quarterlyReport);
module.exports = router;