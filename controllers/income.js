const asyncHandler = require("../middleware/async");
let mongoose = require("mongoose")
const Income = require("../models/Income");
const Transaction = require("../models/transactions");
const Budget = require("../models/budgets");
const User = require("../models/users_model")
const Categories = require("../models/categories");
const Merchant = require("../models/merchant");
const { deleteOne } = require("../models/transactions");
const { numberToArabic } = require('number-to-arabic');
const decrypt = require("../middleware/GenerateRSAKeys");
const encrypt = require('../middleware/GenerateAESKeys');
const Bank = require('../models/Banks');
const moment = require('moment');
const { CURRENT_DATE, CUSTOM_DATE } = require('../middleware/dateOffset');
const checkEmpty = require("../middleware/validation");
// let GDate = moment().format();

exports.createIncome = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let { date, offset, amount, title } = cred
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];
        let month = month_names[date.split('-')[1] - 1];
        let year = date.split('-')[0];
        let day = date.split('-')[2];
        let month_number = parseInt(date.split('-')[1]) + 1


        const banks = await Bank.find({ user_id: req.user.id });
        console.log(month_number, year, day)
        // let date = new Date(date);
        if (banks.length > 0) {
            const income = await Income.create({
                user_id: req.user.id,
                title,
                amount: parseInt(amount),
                month: month,
                year: year,
                createdAt: new Date(year, month_number, day),
            });
            let resp = {
                status: 200,
                message: "Income added successfully",
                armessage: 'تم اضافة الدخل بنجاح'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 400,
                message: 'Please link a bank to add your income',
                armessage: 'الرجاء ربط بنك لإضافة دخلك'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while adding income',
            armessage: 'خطأ أثناء إضافة الدخل'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getIncome = asyncHandler(async (req, res, next) => {
    try {
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];
        let month = month_names[req.params.month - 1];

        const user = await User.findById(req.user.id);
        let Date_joined = user.createdAt;
        let month_of_joining = Date_joined.getMonth() + 1;
        let year_of_joining = Date_joined.getFullYear();
        const income_ = await Income.find({ user_id: req.user.id, month: month, year: parseInt(req.params.year) });
        let income = income_.reduce((n, { amount }) => n + amount, 0)
        if (income_.length > 0) {
            const budgets = await Budget.find({ user_id: req.user.id, month: month, year: req.params.year });
            let budgets_with_categories = await Budget.aggregate([
                { $match: { "user_id": mongoose.Types.ObjectId(req.user.id), "month": month, "year": parseInt(req.params.year) } },
                {
                    $lookup: {
                        from: 'categories',
                        as: 'category',
                        let: { category_id: '$category_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$name', '$$category_id'] },
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                },
            ])
            let total_remaining_amount = 0;
            let total_budget_amount = 0;
            total_budget_amount = budgets.reduce((n, { amount }) => n + amount, 0);
            total_remaining_amount = budgets.reduce((n, { remaining_amount }) => n + remaining_amount, 0);

            let total_utilized = total_budget_amount - total_remaining_amount
            let savings = income - total_utilized
            if (savings < 0) {
                savings = 0
            }

            let resp = {
                status: 200,
                income: income_,
                total_income: income,
                total_remaining_amount,
                total_budget_amount,
                savings,
                total_utilized,
                budgets: budgets_with_categories,
                Date_joined_Month: month_of_joining,
                Date_joined_Year: year_of_joining
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp)),
            })
        }
        else {
            let budget = [];
            let date = new Date();
            let resp = {
                status: 200,
                income: [],
                total_income: 0,
                total_remaining_amount: 0,
                total_budget_amount: 0,
                savings: 0,
                total_utilized: 0,
                budget,
                Date_joined_Month: month_of_joining,
                Date_joined_Year: year_of_joining
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: `خطأ أثناء جلب البيانات`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.viewIncomeById = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let { id } = cred
        if (checkEmpty(id)) {
            let resp = {
                status: 400,
                message: `Please fill all required fields`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let income = await Income.findById({ _id: id })
            if (income) {
                let resp = {
                    status: 200,
                    income
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while fetching data",
                    armessage: 'خطأ أثناء جلب البيانات'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }

    } catch (err) {
        next(err);
    }
});
exports.viewIncomeByIdAndDelete = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let { id } = cred
        if (checkEmpty(id)) {
            let resp = {
                status: 400,
                message: "Please fill all required fields",
                armessage: 'يرجى تقديم جميع الحقول المطلوبة'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let income = await Income.findByIdAndDelete({ _id: id })
            if (income) {
                let resp = {
                    status: 200,
                    message: "Income deleted successfully",
                    armessage: 'تم حذف الدخل بنجاح'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while fetching data",
                    armessage: `خطأ أثناء جلب البيانات`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }

    } catch (err) {
        next(err);
    }
});
exports.updateIncome = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let month = new Date().getMonth();
        let year = new Date().getFullYear();
        let income_id = cred.income_id
        let month_array = ['january', 'february', 'march', 'april'
            , 'may', 'june', 'july', 'august'
            , 'september', 'october', 'november', 'december'];
        let budgets = await Budget.find({ user_id: req.user.id, month: month_array[month], year: year });
        if (budgets.length > 0) {
            let totalOfAllBudgets = budgets.reduce((n, { amount }) => n + amount, 0);
            // console.log(totalOfAllBudgets)
            let allIncomes = await Income.find({ user_id: req.user.id, month: month_array[month], year: parseInt(year) });
            if (allIncomes.length > 0) {
                let tootal = 0
                for (let inc of allIncomes) {
                    if (inc.id != income_id) {
                        tootal += inc.amount
                    }
                }

                if (totalOfAllBudgets < tootal + parseInt(cred.amount)) {
                    let updatedDate = cred.date;
                    console.log(cred.date)
                    let month = month_array[parseInt(updatedDate.split('-')[1]) - 1];
                    let year = updatedDate.split('-')[0];
                    let day = updatedDate.split('-')[2];
                    console.log(day)
                    let month_number = parseInt(updatedDate.split('-')[1]) - 1
                    let newUpdatedDate = new Date(year, month_number, parseInt(day))
                    console.log(newUpdatedDate)
                    // console.log(updatedDate);
                    const income = await Income.findByIdAndUpdate(
                        { _id: cred.income_id },
                        {
                            amount: parseInt(cred.amount),
                            title: cred.title,
                            month: month,
                            year: year,
                            createdAt: newUpdatedDate
                        },
                        { new: true, useFindAndModify: false }
                    );
                    console.log(income)
                    let resp = {
                        status: 200,
                        message: "Income updated successfully",
                        armessage: 'تم تحديث الدخل بنجاح'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                } else {
                    let resp = {
                        status: 400,
                        message: "Income cannot be less than defined total budget",
                        armessage: `لا يمكن أن يكون الدخل أقل من إجمالي الميزانية المحددة`
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            } else {
                let resp = {
                    status: 400,
                    message: 'Error while updating income',
                    armessage: 'خطأ أثناء تحديث الدخل'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        } else {
            const income = await Income.findByIdAndUpdate(
                { _id: cred.income_id },
                { amount: Number(cred.amount) },
                { new: true, useFindAndModify: false }
            );
            let resp = {
                status: 200,
                message: "Income updated successfully",
                armessage: 'تم تحديث الدخل بنجاح'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }

    } catch (err) {
        let resp = {
            status: 400,
            message: 'Error while updating income',
            armessage: 'خطأ أثناء تحديث الدخل'
        }
        next(err);
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.budgetVsExpense = asyncHandler(async (req, res, next) => {
    try {
        let budget_with_amount = [];
        const budget = await Budget.find({ user_id: req.user.id, month: req.params.month, year: req.params.year });
        const transactions = await Transaction.find({ user_id: req.user.id });

        let total = 0;
        let overAll_total = 0;
        for (let i = 0; i < budget.length; i++) {
            total = 0
            for (let j = 0; j < transactions.length; j++) {
                overAll_total = overAll_total + transactions[j].amount
                if (transactions[j].budget_id == budget[i].id) {
                    total += transactions[j].amount
                }
            }
            budget_with_amount.push({ budget_id: budget[i].id, budget_category: budget[i].category_id, amount: total })
        }

        res.status(200).json({
            status: 200,
            budget_with_amount,
            over_all_total: overAll_total
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching income',
            armessage: 'خطأ أثناء جلب البيانات'
        })
    }
});
exports.savingsVsIncome = asyncHandler(async (req, res, next) => {
    try {
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];
        // let month = month_names[req.params.month - 1];

        const user = await User.findById(req.params.id);
        Date_joined = user.createdAt;
        let month_of_joining = Date_joined.getMonth() + 1;
        let year_of_joining = Date_joined.getFullYear();
        const income = await Income.find({ user_id: req.params.id });
        if (income) {
            // console.log(income);

            let saving_with_month = [];
            let total = 0;
            let over_all_total = 0;
            let utilized = 0;
            for (let i = 0; i < income.length; i++) {
                // console.log(income[0])
                const budget = await Budget.find({ user_id: req.params.id, month: income[i].month, year: '2020' });
                total = 0;
                over_all_total = 0
                utilized = 0;
                for (let j = 0; j < budget.length; j++) {
                    total = total + budget[j].remaining_amount
                    over_all_total += budget[j].amount
                }
                // console.log(over_all_total)
                utilized = over_all_total - total;

                let savings = income[i].amount - utilized
                let savings_percentage = (savings / income[i].amount) * 100

                saving_with_month.push({
                    budget: budget.id,
                    budget_category: budget.category_id,
                    month: income[i].month,
                    budget_remaining_amount: total,
                    budget_total: over_all_total,
                    income: income[i].amount,
                    savings: Math.round(savings_percentage)
                });
            }

            res.status(200).json({
                status: 200,
                savings: saving_with_month
            })
        }
        else {
            res.status(200).json({
                status: 200,
                message: "No income assigned for this month",
                armessage: 'لا دخل مخصص لهذا الشهر'
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching income',
            armessage: 'خطأ أثناء جلب البيانات'
        })
    }
});
exports.overAllSpendings = asyncHandler(async (req, res, next) => {
    try {
        const budget_over_all = await Budget.find({ month: req.params.month, year: req.params.year });
        const income_ = await Income.find({ month: req.params.month, year: req.params.year });

        if (!budget_over_all) {
            res.status(200).json({
                status: 200,
                total_income: 0,
                savings: []
            })
        }
        else if (!income_) {
            res.status(200).json({
                status: 200,
                total_income: 0,
                savings: []
            })
        }
        else {
            let income = 0;
            let total_budget = 0;
            for (let i = 0; i < income_.length; i++) {
                income = income + income_[i].amount
            }

            for (let i = 0; i < budget_over_all.length; i++) {
                total_budget += budget_over_all[i].amount
            }

            const budget_categories = [];
            for (let i = 0; i < budget_over_all.length; i++) {
                budget_categories.push(budget_over_all[i].category_id)
            }

            let unique_categories = [... new Set(budget_categories)]
            let budget_with_total_of_each_category = [];

            let total_by_each_category = 0;
            let total_remaining_by_each_category = 0;
            for (let i = 0; i < unique_categories.length; i++) {
                total_by_each_category = 0;
                total_remaining_by_each_category = 0;
                for (let j = 0; j < budget_over_all.length; j++) {
                    if (budget_over_all[j].category_id === unique_categories[i]) {
                        total_by_each_category = total_by_each_category + budget_over_all[j].amount
                        total_remaining_by_each_category = total_remaining_by_each_category + budget_over_all[j].remaining_amount
                    }
                }
                let utilization_over_all = total_by_each_category - total_remaining_by_each_category
                budget_with_total_of_each_category.push({
                    budget: unique_categories[i],
                    total_budget: total_by_each_category,
                    remaining_budget: total_remaining_by_each_category,
                    saving: total_remaining_by_each_category,
                    expense: total_by_each_category - total_remaining_by_each_category,
                    percentage_budget: Math.round((total_remaining_by_each_category / total_by_each_category) * 100),
                    percentage_income: Math.round((total_remaining_by_each_category / income) * 100),
                    percentage_expense: Math.round((utilization_over_all / total_by_each_category) * 100)
                })
            }
            let resp = {
                status: 200,
                // savings: budget_with_savings,
                // total_budget: over_all_total,
                total_income: income,
                // unique_categories,
                savings: budget_with_total_of_each_category,
                total_budget
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.savingVsBudgets = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];

        const budget = await Budget.find({ user_id: cred.user_id, month: cred.month, year: cred.year });
        const income_ = await Income.find({ user_id: cred.user_id, month: cred.month, year: cred.year });
        let income = 0;
        income = income_.reduce((n, { amount }) => n + amount, 0)

        if (budget.length < 0 || income == 0) {
            let resp = {
                status: 200,
                budget_with_savings: [],
                total_budget: 0,
                total_income: 0,
                // unique_categories,
                budget_with_total_of_each_category: []
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            let budget_with_savings = [];
            let saving = 0
            let over_all_total = 0;
            let over = budget.filter(budget => over_all_total += budget.amount)
            for (let i = 0; i < budget.length; i++) {
                saving = budget[i].remaining_amount
                let expense = budget[i].amount - budget[i].remaining_amount
                budget_with_savings.push({
                    budget: budget[i].category_id,
                    total_budget: budget[i].amount,
                    remaining_budget: budget[i].remaining_amount,
                    saving: saving,
                    expense: budget[i].amount - budget[i].remaining_amount,
                    percentage_budget: Math.round((budget[i].remaining_amount / budget[i].amount) * 100),
                    percentage_income: Math.round((budget[i].remaining_amount / income) * 100),
                    percentage_expense: Math.round((expense / budget[i].amount) * 100)
                })
            }
            const budget_over_all = await Budget.find({ month: req.params.month, year: req.params.year });
            const budget_categories = [];
            for (let i = 0; i < budget_over_all.length; i++) {
                budget_categories.push(budget_over_all[i].category_id)
            }

            let unique_categories = [... new Set(budget_categories)]
            let budget_with_total_of_each_category = [];

            let total_by_each_category = 0;
            let total_remaining_by_each_category = 0;
            let found = false;
            for (let i = 0; i < unique_categories.length; i++) {
                total_by_each_category = 0;
                total_remaining_by_each_category = 0;
                found = false;
                for (let j = 0; j < budget_over_all.length; j++) {
                    if (budget_over_all[i].category_id == unique_categories[j]) {
                        total_by_each_category += budget_over_all[i].amount
                        total_remaining_by_each_category += budget_over_all[i].remaining_amount
                        found = true
                    }
                }

                let utilization_over_all = total_by_each_category - total_remaining_by_each_category
                if (found === true) {
                    budget_with_total_of_each_category.push({
                        budget: budget_over_all[i].category_id,
                        total_budget: total_by_each_category,
                        remaining_budget: total_remaining_by_each_category,
                        saving: total_remaining_by_each_category,
                        expense: total_by_each_category - total_remaining_by_each_category,
                        percentage_budget: Math.round((total_remaining_by_each_category / total_by_each_category) * 100),
                        percentage_income: Math.round((total_remaining_by_each_category / income) * 100),
                        percentage_expense: Math.round((utilization_over_all / total_by_each_category) * 100)
                    })
                }
            }

            const categories_fromDb = await Categories.find();
            let another_array = [];

            for (let i = 0; i < categories_fromDb.length; i++) {
                for (let j = 0; j < budget_with_total_of_each_category.length; j++) {
                    if (budget_with_total_of_each_category[j].budget == categories_fromDb[i].name) {
                        another_array.push({
                            budget: budget_with_total_of_each_category[j].budget,
                            ar_budget: categories_fromDb[i].arname,
                            total_budget: budget_with_total_of_each_category[j].total_budget,
                            remaining_budget: budget_with_total_of_each_category[j].remaining_budget,
                            saving: budget_with_total_of_each_category[j].saving,
                            expense: budget_with_total_of_each_category[j].expense,
                            percentage_budget: budget_with_total_of_each_category[j].percentage_budget,
                            percentage_income: budget_with_total_of_each_category[j].percentage_income,
                            percentage_expense: budget_with_total_of_each_category[j].percentage_expense
                        });
                    }
                }
            }

            const categories_fromDb_ = await Categories.find();
            let another_array_ = [];

            for (let i = 0; i < categories_fromDb_.length; i++) {
                for (let j = 0; j < budget_with_savings.length; j++) {
                    if (budget_with_savings[j].budget == categories_fromDb_[i].name) {
                        another_array_.push({
                            budget: budget_with_savings[j].budget,
                            ar_budget: categories_fromDb_[i].arname,
                            total_budget: budget_with_savings[j].total_budget,
                            remaining_budget: budget_with_savings[j].remaining_budget,
                            saving: budget_with_savings[j].saving,
                            expense: budget_with_savings[j].expense,
                            percentage_budget: budget_with_savings[j].percentage_budget,
                            percentage_income: budget_with_savings[j].percentage_income,
                            percentage_expense: budget_with_savings[j].percentage_expense
                        });
                    }
                }
            }


            let resp = {
                status: 200,
                budget_with_savings: another_array_,
                total_budget: over_all_total,
                total_income: income,
                budget_with_total_of_each_category: another_array
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching income',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.spendingBehaviorBYBudget = asyncHandler(async (req, res, next) => {
    try {
        if (req.params.status == 1) {
            const budget = await Budget.find({ user_id: req.params.user_id });
            const transactions_ = await Transaction.find({ user_id: req.params.user_id });
            let month = req.params.month;
            let year = req.params.year;
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            let budget_names = [];
            for (let i = 0; i < budget.length; i++) {
                budget_names.push(budget[i].category_id);
            }

            let unique_budget_names = [...new Set(budget_names)]
            let budget_with_amount = [];

            let total = 0;
            let total_by_budget = 0;
            let total_transactions_by_merchants = 0;

            for (let i = 0; i < unique_budget_names.length; i++) {
                total = 0;
                total_by_budget = 0;
                total_transactions_by_merchants = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == unique_budget_names[i]) {
                        total_by_budget += transactions[j].amount
                        total_transactions_by_merchants++
                    }
                    total += transactions[j].amount
                }
                if (total_transactions_by_merchants > 0) {
                    budget_with_amount.push({ name: unique_budget_names[i], amount: total_by_budget, total_transactions: total_transactions_by_merchants })
                }
            }
            res.status(200).json({
                status: 200,
                budgets: budget_with_amount,
                total: total
            })
        }
        else if (req.params.status == 0) {
            const budget = await Budget.find({ user_id: req.user.id });
            const transactions_ = await Transaction.find({ user_id: req.user.id });
            let month = req.params.month;
            let year = req.params.year;
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            let budget_names = [];
            for (let i = 0; i < budget.length; i++) {
                budget_names.push(budget[i].category_id);
            }

            let unique_budget_names = [...new Set(budget_names)]
            let budget_with_amount = [];

            let total = 0;
            let total_by_budget = 0;
            let total_transactions_by_merchants = 0;

            for (let i = 0; i < unique_budget_names.length; i++) {
                total = 0;
                total_by_budget = 0;
                total_transactions_by_merchants = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == unique_budget_names[i]) {
                        total_by_budget += transactions[j].amount
                        total_transactions_by_merchants++
                    }
                    total += transactions[j].amount
                }
                if (total_transactions_by_merchants > 0) {
                    budget_with_amount.push({ name: unique_budget_names[i], amount: total_by_budget, total_transactions: total_transactions_by_merchants })
                }
            }
            res.status(200).json({
                status: 200,
                budgets: budget_with_amount,
                total: total
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        })
    }
});
exports.spendingBehaviorBYMerchant = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        if (cred.status == 1) {
            const merchants = await Merchant.find({ user_id: cred.user_id });
            const transactions_ = await Transaction.find({ user_id: cred.user_id });

            let month = cred.month;
            let year = cred.year;
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)

            let names = [];
            for (let i = 0; i < merchants.length; i++) {
                names.push(merchants[i].name);
            }

            let unique_merchant_names = [...new Set(names)]
            let merchants_with_spendings = [];
            let total_transactions_by_merchants = 0;

            let total = 0;
            let total_by_merchants = 0;

            for (let i = 0; i < unique_merchant_names.length; i++) {
                total = 0;
                total_by_merchants = 0
                total_transactions_by_merchants = 0;
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].merchant == unique_merchant_names[i]) {
                        total_by_merchants += transactions[j].amount
                        total_transactions_by_merchants++
                    }
                    total += transactions[j].amount
                }
                if (total_transactions_by_merchants > 0) {
                    merchants_with_spendings.push({ name: unique_merchant_names[i], amount: total_by_merchants, total_transactions: total_transactions_by_merchants })
                }
            }

            let resp = {
                status: 200,
                merchants: merchants_with_spendings,
                total
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else if (cred.status == 0) {
            const merchants = await Merchant.find({ user_id: cred.user_id });
            const transactions_ = await Transaction.find({ user_id: cred.user_id });

            let month = cred.month;
            let year = cred.year;
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)

            let names = [];
            for (let i = 0; i < merchants.length; i++) {
                names.push(merchants[i].name);
            }

            let unique_merchant_names = [...new Set(names)]
            let merchants_with_spendings = [];
            let total_transactions_by_merchants = 0;

            let total = 0;
            let total_by_merchants = 0;

            for (let i = 0; i < unique_merchant_names.length; i++) {
                total = 0;
                total_by_merchants = 0
                total_transactions_by_merchants = 0;
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].merchant == unique_merchant_names[i]) {
                        total_by_merchants += transactions[j].amount
                        total_transactions_by_merchants++
                    }
                    total += transactions[j].amount
                }
                if (total_transactions_by_merchants > 0) {
                    merchants_with_spendings.push({ name: unique_merchant_names[i], amount: total_by_merchants, total_transactions: total_transactions_by_merchants })
                }
            }
            let resp = {
                status: 200,
                merchants: merchants_with_spendings,
                total
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.spendingBehaviorBYCategory = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let month = cred.month;
        let year = cred.year;
        let total_amount = 0;
        let total_by_category = 0;
        let category_with_spendings = [];
        let total_transactions_by_category = 0;
        if (cred.status == 0) {
            const categories = await Categories.find();
            const transactions_ = await Transaction.find({ user_id: req.user.id });

            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            for (let i = 0; i < categories.length; i++) {
                total_amount = 0;
                total_by_category = 0
                total_transactions_by_category = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == categories[i].name) {
                        total_by_category += transactions[j].amount
                        total_transactions_by_category++
                    }
                    total_amount += transactions[j].amount
                }
                if (total_transactions_by_category > 0) {
                    category_with_spendings.push({ name: categories[i].name, amount: total_by_category, total_transactions: total_transactions_by_category })
                }
            }
        }
        else if (cred.status == 1) {
            const categories = await Categories.find();
            const transactions_ = await Transaction.find({ user_id: req.params.user_id });
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            for (let i = 0; i < categories.length; i++) {
                total_amount = 0;
                total_by_category = 0
                total_transactions_by_category = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == categories[i].name) {
                        total_by_category += transactions[j].amount
                        total_transactions_by_category++
                    }
                    total_amount += transactions[j].amount
                }
                if (total_transactions_by_category > 0) {
                    category_with_spendings.push({ name: categories[i].name, amount: total_by_category, total_transactions: total_transactions_by_category })
                }
            }
        }

        const categories_fromDb = await Categories.find();
        let another_array = [];

        for (let i = 0; i < categories_fromDb.length; i++) {
            for (let j = 0; j < category_with_spendings.length; j++) {
                if (category_with_spendings[j].name == categories_fromDb[i].name) {
                    another_array.push({
                        category: categories_fromDb[i].name,
                        ar_category: categories_fromDb[i].arname,
                        ar_amount: numberToArabic(category_with_spendings[j].amount),
                        amount: category_with_spendings[j].amount
                    });
                }
            }
        }

        let resp = {
            status: 200,
            categories: another_array,
            total: total_amount
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.spendingByCategoriesByMonth = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        console.log(cred)
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let { category } = cred;
        let months_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'
            , 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
        let transactions = [];
        for (let i = 1; i <= month; i++) {
            let total = 0;
            for (let j = 0; j < transactions_.length; j++) {
                if (transactions_[j].date.getMonth() + 1 == i
                    && transactions_[j].date.getFullYear() == year
                    && category == transactions_[j].category_id) {
                    total += transactions_[j].amount
                }
            }
            transactions.push({ month: months_names[i - 1], amount: total })
        }
        let resp = {
            status: 200,
            transactions
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.viewTransactionsByCategoryForIncome = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        if (cred.status == 0) {
            let date = new Date();
            let currentMonth = date.getMonth() + 1;
            let year = date.getFullYear();
            let category_id = cred.id;
            // const category = await Categories.findById({ _id: category_id });
            let transactions = await Transaction.find({ user_id: req.user.id });
            let total_this_month = 0;
            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].date.getMonth() + 1 == currentMonth && transactions[i].date.getFullYear() == year
                    && transactions[i].category_id == category_id) {
                    total_this_month += transactions[i].amount
                }
            }

            let total_previous_month = 0;

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].date.getMonth() + 1 == currentMonth - 1 && transactions[i].date.getFullYear() == year
                    && transactions[i].category_id == category_id) {
                    total_previous_month += transactions[i].amount
                }
            }
            // console.log(transactions.length);
            let transactions_this_month = transactions.filter(t => t.date.getMonth() + 1 == currentMonth
                && t.date.getFullYear() == date.getFullYear()
                && t.category_id == category_id);
            // console.log(transactions_this_month.length);
            let transactions_previous_month = transactions.filter(t => t.date.getMonth() + 1 == currentMonth - 1
                && t.date.getFullYear() == date.getFullYear()
                && t.category_id == category_id);
            // console.log(transactions_previous_month.length);     
            let resp = {
                status: 200,
                transactions_this_month,
                transactions_previous_month,
                total_this_month,
                total_previous_month
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else if (cred.status == 1) {
            let date = new Date();
            let currentMonth = date.getMonth() + 1;
            let year = date.getFullYear();
            let merchant = cred.id;
            // const merchant = await Merchant.findById({ _id: merchant_id });
            let transactions = await Transaction.find({ user_id: req.user.id });
            // console.log(transactions.length);
            let transactions_this_month = transactions.filter(t => t.date.getMonth() + 1 == currentMonth
                && t.date.getFullYear() == date.getFullYear()
                && t.merchant == merchant);
            // console.log(transactions_this_month.length);
            let transactions_previous_month = transactions.filter(t => t.date.getMonth() + 1 == currentMonth - 1
                && t.date.getFullYear() == date.getFullYear()
                && t.merchant == merchant);
            // console.log(transactions_previous_month.length);

            let total_this_month = 0;

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].date.getMonth() + 1 == currentMonth && transactions[i].date.getFullYear() == year
                    && transactions[i].merchant == merchant) {
                    total_this_month += transactions[i].amount
                }
            }

            let total_previous_month = 0;

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].date.getMonth() + 1 == currentMonth - 1 && transactions[i].date.getFullYear() == year
                    && transactions[i].merchant == merchant) {
                    total_previous_month += transactions[i].amount
                }
            }

            let resp = {
                status: 200,
                transactions_this_month,
                transactions_previous_month
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.spendingBehaviorBYCategory02 = asyncHandler(async (req, res, next) => {
    try {
        let month = req.params.month;
        let year = req.params.year;
        let total_amount = 0;
        let total_by_category = 0;
        let category_with_spendings = [];
        let total_transactions_by_category = 0;
        if (req.params.status == 0) {
            const categories = await Categories.find();
            const transactions_ = await Transaction.find({ user_id: req.user.id });

            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            for (let i = 0; i < categories.length; i++) {
                total_amount = 0;
                total_by_category = 0
                total_transactions_by_category = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == categories[i].name) {
                        total_by_category += transactions[j].amount
                        total_transactions_by_category++
                    }
                    total_amount += transactions[j].amount
                }
                if (total_transactions_by_category > 0) {
                    category_with_spendings.push({ name: categories[i].name, amount: total_by_category, total_transactions: total_transactions_by_category })
                }
            }
        }
        else if (req.params.status == 1) {
            const categories = await Categories.find();
            const transactions_ = await Transaction.find();
            const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year)
            for (let i = 0; i < categories.length; i++) {
                total_amount = 0;
                total_by_category = 0
                total_transactions_by_category = 0
                for (let j = 0; j < transactions.length; j++) {
                    if (transactions[j].category_id == categories[i].name) {
                        total_by_category += transactions[j].amount
                        total_transactions_by_category++
                    }
                    total_amount += transactions[j].amount
                }
                if (total_transactions_by_category > 0) {
                    category_with_spendings.push({ name: categories[i].name, amount: total_by_category, total_transactions: total_transactions_by_category })
                }
            }
        }
        res.status(200).json({
            status: 200,
            categories: category_with_spendings,
            total: total_amount
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        })
    }
});
exports.overAllExpenseAndSavings = asyncHandler(async (req, res, next) => {
    try {
        let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
            , 'july', 'august', 'september', 'october', 'november', 'december'];
        const date = new Date();
        let currentMonth = date.getMonth();
        let currentYear = date.getFullYear();

        const budgets = await Budget.find();
        const incomes = await Income.find();
        let total_of_all_budget = 0;
        let total_of_all_income = 0;
        const total = budgets.filter((budget) => {
            budget.month == month_names[currentMonth]
                && budget.year == currentYear ? total_of_all_budget += budget.amount : null
        })
        const total_of_income = incomes.filter((income) => {
            income.month == month_names[currentMonth]
                && income.year == currentYear ? total_of_all_income += income.amount : null
        })

        let total_utilized_budget = 0;
        // let savings = 0;
        for (let i = 0; i < budgets.length; i++) {
            let utilized = budgets[i].amount - budgets[i].remaining_amount
            total_utilized_budget += utilized;
        }

        let resp = {
            status: 200,
            budget: total_of_all_budget,
            income: total_of_all_income,
            expense: total_utilized_budget,
            savings: total_of_all_income - total_utilized_budget
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});

