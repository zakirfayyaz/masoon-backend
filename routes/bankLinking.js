const express = require("express");
const { protect } = require("../middleware/auth");
const { linkAccount, getBanks, deleteBank } = require("../controllers/bankLinking");
const { createBankTransaction, getBankTransactions, categorizeBankTransaction } = require("../controllers/bankTransactions");

const router = express.Router();
router.route('/').post(protect, linkAccount);
router.route('/').get(protect, getBanks);
router.route('/remove/:id').delete(protect, deleteBank);
router.route('/transactions').post(protect, createBankTransaction);
router.route('/transactions/:id').get(protect, getBankTransactions);
router.route('/transactions/categorize/:id').post(protect, categorizeBankTransaction);

module.exports = router;
