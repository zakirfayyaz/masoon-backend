const express = require("express");
const { protect } = require("../middleware/auth");
const { createTransactions,
    viewTransactions,
    viewTransactionsByExpense,
    viewTransactionsByIncome,
    viewTransactionsByCategory,
    viewTransactionsById,
    viewTransactionsByTags,
    deleteTransactions,
    editTransaction,
    viewTransactionsByMonth,
    viewTransactionsByDate,
    uuudd,
    transactionByRange } = require("../controllers/transaction");

const router = express.Router();
const multer = require("multer");
const parse = multer();

router.route("/add").post(protect, parse.any(), createTransactions);
router.route('/get').get(protect, parse.any(), viewTransactions);
router.route('/get/Income').get(protect, parse.any(), viewTransactionsByIncome);
router.route('/get/Expense').get(protect, parse.any(), viewTransactionsByExpense);
router.route('/get/category-name').put(protect, parse.any(), viewTransactionsByCategory);
router.route('/get-id').put(protect, parse.any(), viewTransactionsById);
router.route('/tags-id').put(protect, parse.any(), viewTransactionsByTags);
router.route('/remove-id').put(protect, parse.any(), deleteTransactions);
router.route('/update-id').put(protect, parse.any(), editTransaction);
router.route('/month-year').put(protect, viewTransactionsByMonth);
router.route('/view-transactions-by-date').put(protect, viewTransactionsByDate);
router.route('/range').post(protect, transactionByRange);
router.route('/uuuu/:id').put(uuudd);

module.exports = router;