const BankTransaction = require('../models/BankTransactions');
const asyncHandler = require("../middleware/async");
const Transaction = require("../models/transactions");
const Budget = require("../models/budgets");
const Categories = require("../models/categories")

exports.createBankTransaction = asyncHandler(async (req, res, next) => {
    try {
        let { bank_id, amount, type, payment_type, description, merchant } = req.body;

        const transaction = await BankTransaction.create({
            bank_id,
            amount,
            type,
            payment_type,
            description,
            merchant
        });
        res.status(201).json({
            status: 200,
            message: 'Transaction created successfully',
            armessage: `تم إنشاء العملية بنجاح`
        });
    } catch (err) {
        next(err);
    }
});
exports.categorizeBankTransaction = asyncHandler(async (req, res, next) => {
    try {
        let {
            category_id,
            sub_category_id,
            budget_id,
            amount } = req.body;

        let date = new Date();

        const bankTransaction = await BankTransaction.findById({ _id: req.params.id });
        const category = await Categories.findById({ _id: category_id });
        const budget = await Budget.findById({ _id: budget_id });
        const transaction = await Transaction.create({
            bank_transaction_id: bankTransaction.id,
            amount,
            user_id: req.user.id,
            type: bankTransaction.type,
            payment_type: bankTransaction.payment_type,
            description: bankTransaction.description,
            merchant: bankTransaction.merchant,
            category_id: category.name,
            sub_category_id,
            budget_id,
            date
        });

        const update_budget = await Budget.findByIdAndUpdate({ _id: budget.id, },
            { remaining_amount: budget.remaining_amount - amount },
            { new: true, useFindAndModify: false });

        // const update_bank_transaction = await BankTransaction.findByIdAndUpdate({ _id: req.params.id, },
        //     { amount: bankTransaction.amount - amount },
        //     { new: true, useFindAndModify: false });

        res.status(201).json({
            status: 200,
            message: 'Transaction categorized successfully',
            armessage: `تم تصنيف العملية بنجاح`
        });
    } catch (err) {
        next(err);
    }
});
exports.getBankTransactions = asyncHandler(async (req, res, next) => {
    try {
        const transactions = await BankTransaction.find({ bank_id: req.params.id });
        res.status(201).json({
            status: 200,
            message: transactions
        });
    } catch (err) {
        next(err);
    }
});
