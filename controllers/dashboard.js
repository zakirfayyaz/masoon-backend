const asyncHandler = require("../middleware/async");
const Merchant = require("../models/merchant");
const Categories = require("../models/categories");
const Transaction = require("../models/transactions");
const Bill = require("../models/bills");
const Income = require("../models/Income");
const Budget = require("../models/budgets");
const { numberToArabic } = require('number-to-arabic');
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");

exports.viewTotalExpense = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        const transactions_ = await Transaction.find({ user_id: id });
        const transactions = transactions_.filter(
            t => t.date.getMonth() == new Date().getMonth()
                && t.date.getFullYear() == new Date().getFullYear());
        let count_of_transactions = transactions.length;
        const recenttransactions = await Transaction.find({ user_id: id }).sort({ date: -1 }).limit(5);
        const recent_Bills = await Bill.find({ user_id: id });

        let date_ = new Date();
        let today = date_.getDate();
        let month_ = date_.getMonth() + 1;
        let bills_of_current_month = [];

        for (let i = 0; i < recent_Bills.length; i++) {
            if (recent_Bills[i].due_date.getMonth() + 1 == month_ && recent_Bills[i].due_date.getDate() > today) {
                bills_of_current_month.push(recent_Bills[i]);
            }
        }
        bills_of_current_month.sort(function (a, b) {
            var c = new Date(a.due_date);
            var d = new Date(b.due_date);
            return c - d;
        });

        let total_expense = 0;
        let total_income = 0;

        let len_ = transactions.length;
        let array = [];
        let array_of_merchants = [];

        let date = new Date();
        let current_month = date.getMonth();
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];
        let month = month_names[current_month];

        const income_ = await Income.find({ user_id: req.user.id, month: month, year: date.getFullYear() });
        let income = income_.reduce((n, { amount }) => n + amount, 0);
        const budget = await Budget.find({ user_id: req.user.id, month: month, year: date.getFullYear() });

        var total_budget = 0;
        if (budget.length > 0) {
            for (let i = 0; i < budget.length; i++) {
                total_budget += budget[i].amount
            }
        }

        let total_remaining_amount = 0;
        let total_budget_amount = 0;
        total_remaining_amount = budget.reduce((n, { remaining_amount }) => n + remaining_amount, 0);
        total_budget_amount = budget.reduce((n, { amount }) => n + amount, 0);
        // for (let i = 0; i < budget.length; i++) {
        //     total_remaining_amount = total_remaining_amount + budget[i].remaining_amount
        //     total_budget_amount = total_budget_amount + budget[i].amount
        // }
        // console.log(total_remaining_amount)

        let savings = 0;

        let total_utilized = total_budget_amount - total_remaining_amount
        if (income == 0) {
            savings = 0
        }
        else {
            savings = income - total_utilized
        }
        if (savings < 0) {
            savings = 0
        }

        for (let i = 0; i < len_; i++) {

            array.push({ category: transactions[i].category_id, amount: transactions[i].amount });
            array_of_merchants.push({ merchant: transactions[i].merchant, amount: transactions[i].amount })

            if (transactions[i].type === 'Expense') {
                total_expense = total_expense + transactions[i].amount
            }
            else if (transactions[i].type === 'Income') {
                total_income = total_income + transactions[i].amount
            }
        }


        // FOR CATEGORIES

        let exists = 0
        let exists2 = 0
        let array_1 = [];
        let array_2 = [];
        let array_3 = {};
        let array_4 = [];
        let length = array.length;

        // console.log(array_of_cats);

        for (let i = 0; i < length; i++) {
            let total_by_categories = 0;
            array_1.push(array[i]);
            for (let j = 0; j < length; j++) {
                if (array_1[i].category === array[j].category) {
                    total_by_categories += array[j].amount
                }
            }
            array_2.push({ category: array_1[i].category, amount: total_by_categories });
        }


        for (let k = 0; k < array_2.length; k++) {
            exists == 0
            array_3 = array_2[k];
            for (let j = 0; j < array_2.length; j++) {
                if (array_3.category == array_2[j].category) {
                    exists++
                }
            }
            if (exists > 1) {
                exists2 = 0;
                for (let l = 0; l < array_4.length; l++) {
                    if (array_3.category == array_4[l].category) {
                        exists2++;
                    }
                }
                if (exists2 == 0) {
                    array_4.push(array_3);
                }
            }
            else {
                array_4.push(array_3);
            }
        }

        // FOR MERCHANTS

        let exists_3 = 0
        let exists_4 = 0
        let array_11 = [];
        let array_21 = [];
        let array_31 = {};
        let array_41 = [];
        let _length = array_of_merchants.length;

        for (let i = 0; i < _length; i++) {
            let total_by_merchants = 0;
            array_11.push(array_of_merchants[i]);
            for (let j = 0; j < _length; j++) {
                if (array_11[i].merchant === array_of_merchants[j].merchant) {
                    total_by_merchants += array_of_merchants[j].amount
                }
            }
            array_21.push({ merchant: array_11[i].merchant, amount: total_by_merchants });
        }


        for (let k = 0; k < array_21.length; k++) {
            exists_3 == 0
            array_31 = array_21[k];
            for (let j = 0; j < array_21.length; j++) {
                if (array_31.merchant == array_21[j].merchant) {
                    exists_3++
                }
            }
            if (exists_3 > 1) {
                exists_4 = 0;
                for (let l = 0; l < array_41.length; l++) {
                    if (array_31.merchant == array_41[l].merchant) {
                        exists_4++;
                    }
                }
                if (exists_4 == 0) {
                    array_41.push(array_31);
                }
            }
            else {
                array_41.push(array_31);
            }
        }

        const categories_fromDb = await Categories.find();
        let another_array = [];

        for (let i = 0; i < categories_fromDb.length; i++) {
            for (let j = 0; j < array_4.length; j++) {
                if (array_4[j].category == categories_fromDb[i].name) {
                    another_array.push({
                        category: categories_fromDb[i].name,
                        ar_category: categories_fromDb[i].arname,
                        ar_amount: numberToArabic(array_4[j].amount),
                        amount: array_4[j].amount
                    });
                }
            }
        }
        let arrayPrint = another_array;
        // console.log(encrypt(JSON.stringify(arrayPrint)));
        let resp = {
            status: 200,
            Spent: total_expense,
            Income: savings,
            category: another_array,
            merchant: array_41,
            recent_transactions: recenttransactions,
            upcoming_bills: bills_of_current_month,
            total_budget
        }

        let enres = encrypt(JSON.stringify(resp));
        res.status(200).json({
            resp: enres
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: `خطأ أثناء جلب البيانات`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});