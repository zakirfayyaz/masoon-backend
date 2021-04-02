const express = require("express");
const { createIncome,
    updateIncome,
    getIncome,
    budgetVsExpense,
    savingsVsIncome,
    savingVsBudgets,
    spendingBehaviorBYBudget,
    spendingBehaviorBYCategory,
    spendingBehaviorBYMerchant,
    spendingBehaviorBYCategory02,
    overAllExpenseAndSavings,
    overAllSpendings,
    viewTransactionsByCategoryForIncome,
    spendingByCategoriesByMonth
} = require("../controllers/income");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route('/bycategory/spendings-category').put(protect, spendingByCategoriesByMonth);
router.route('/category/spendings-id').put(protect, viewTransactionsByCategoryForIncome);
router.route('/').post(protect, createIncome);
router.route('/savings/:id').get(protect, savingsVsIncome);
router.route('/update-id').put(protect, updateIncome);
router.route('/:month/:year').get(protect, getIncome);
router.route('/savings/budget-id').put(protect, savingVsBudgets);
router.route('/all/savings/budget/all/:month/:year').get(protect, overAllSpendings);
router.route('/spendings/budgets-admin').get(protect, spendingBehaviorBYBudget);
router.route('/spendings/categories-admin').put(protect, spendingBehaviorBYCategory);
router.route('/spendings/merchants-admin').put(protect, spendingBehaviorBYMerchant);
router.route('/spendings/overall/admin').get(protect, overAllExpenseAndSavings);
module.exports = router;
