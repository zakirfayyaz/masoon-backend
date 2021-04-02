const asyncHandler = require("../../middleware/async");
const Transaction = require("../../models/transactions");
const Categories = require("../../models/categories");
const Tags = require("../../models/tags");
const { numberToArabic } = require('number-to-arabic');
const encrypt = require("../../middleware/GenerateAESKeys");

exports.income = asyncHandler(async (req, res, next) => {
    try {
        let currentMonth = new Date().getMonth() + 1;
        // Income Over Time
        if (req.params.status == 0) {

            let date = new Date();
            let current_day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;

            const transaction = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let months_names = ['january', 'february', 'march', 'april', 'may', 'june'
                , 'july', 'august', 'september', 'october', 'november', 'december'];

            for (let j = 1; j <= current_day; j++) {

                let total_amount = 0;
                for (let i = 0; i < transaction.length; i++) {
                    if (j == transaction[i].date.getDate()) {
                        numbered_amount = Number(transaction[i].amount)
                        total_amount = total_amount + numbered_amount
                    }
                }
                trannsactions_list.push({
                    month: new Date(`${year}, ${month}, ${j} `), amount: total_amount
                });
                if (total_amount !== 0) {
                    active_transactions.push({ month: new Date(`${year}, ${month}, ${j} `), amount: total_amount })
                }
                total_income = total_income + total_amount
            }

            let average = (total_income) / current_day;

            res.status(200).json({
                status: 200,
                transactions: trannsactions_list,
                total: total_income,
                average: average,
                active_transactions: active_transactions
            });
        }

        // Income by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id == categories_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                categories: categories_with_total_amount,
                total: total_income
            });
        }

        // Income by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            });
        }

        // Income by tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Income'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }
            res.status(200).json({
                status: 200,
                tags,
                total: total
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            res.status(200).json({
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            });
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        });
    }
});
exports.incomeByMonth = asyncHandler(async (req, res, next) => {
    try {

        let currentMonth = new Date().getMonth() + 1;
        let currentMonth_ = req.params.month

        var date = new Date();
        // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), req.params.month, 0);

        // Income Over Time
        if (req.params.status == 0) {

            let date = new Date();
            let current_day = date.getDate();
            let month = req.params.month;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;

            const transaction = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let months_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'
                , 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

            for (let j = 1; j <= lastDay.getDate(); j++) {

                let total_amount = 0;
                for (let i = 0; i < transaction.length; i++) {
                    if (j == transaction[i].date.getDate()
                        && transaction[i].date.getFullYear() == req.params.year
                        && transaction[i].date.getMonth() + 1 == req.params.month) {
                        numbered_amount = Number(transaction[i].amount)
                        total_amount = total_amount + numbered_amount
                    }
                }
                trannsactions_list.push({
                    month: new Date(`${year}, ${month}, ${j} `),
                    amount: total_amount
                });
                if (total_amount !== 0) {
                    active_transactions.push({
                        month: new Date(`${year}, ${month}, ${j} `), amount: total_amount
                    })
                }
                total_income = total_income + total_amount
            }

            let average = (total_income) / current_day;

            res.status(200).json({
                status: 200,
                transactions: trannsactions_list,
                total: total_income,
                average: average,
                active_transactions: active_transactions
            });
        }

        // Income by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id == categories_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                categories: categories_with_total_amount,
                total: total_income
            });
        }

        // Income by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            });
        }

        // Income by tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Income'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth_
                            && transactions_by_tags[j].date.getFullYear() == req.params.year) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }
            res.status(200).json({
                status: 200,
                tags,
                total: total
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            res.status(200).json({
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            });
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        });
    }
});
exports.Expense = asyncHandler(async (req, res, next) => {
    try {
        let currentMonth = new Date().getMonth() + 1;
        // Expense Over Time
        if (req.params.status == 0) {
            console.log(1);
            let date = new Date();
            // console.log(date.lastDay());
            let current_day = date.getDate();
            console.log(current_day);
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;
            var lastDay = new Date(year, month, 0);
            let lastDay_ = lastDay.getDate();
            let transaction = [];

            const transaction_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            if (transaction_.length == 0) {
                res.status(200).json({
                    status: 200,
                    transactions: [],
                    active_transactions: []
                })
            } else {
                for (let i = 0; i < transaction_.length; i++) {
                    if (transaction_[i].date.getMonth() + 1 == month && transaction_[i].date.getFullYear() == year) {
                        transaction.push(transaction_[i]);
                    }
                }
                let months_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'
                    , 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                let total_amount_1 = 0;
                let total_amount_2 = 0;
                let total_amount_3 = 0;
                let total_amount_4 = 0;

                for (let i = 0; i < transaction.length; i++) {
                    if (transaction[i].date.getDate() < 7) {
                        total_amount_1 += transaction[i].amount
                    } else if (transaction[i].date.getDate() >= 7 && transaction[i].date.getDate() <= 14) {
                        total_amount_2 += transaction[i].amount
                    } else if (transaction[i].date.getDate() >= 14 && transaction[i].date.getDate() < 21) {
                        total_amount_3 += transaction[i].amount
                    } else if (transaction[i].date.getDate() >= 21 && transaction[i].date.getDate() <= lastDay_) {
                        total_amount_4 += transaction[i].amount
                    }
                }
                trannsactions_list.push({
                    week: 1, amount: total_amount_1
                });
                trannsactions_list.push({
                    week: 2, amount: total_amount_2
                });
                trannsactions_list.push({
                    week: 3, amount: total_amount_3
                });
                trannsactions_list.push({
                    week: 4, amount: total_amount_4
                });

                let resp = {
                    status: 200,
                    transactions: trannsactions_list,
                    active_transactions: active_transactions
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }

        // Expense by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];
            // console.log(categories_list_unique)

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id === categories_list_unique[i] && transactions_[j].date.getMonth() + 1 === currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount });
                total_income = total_income + total_amount;
            }

            let y = 0;
            for (let i = 0; i < categories_with_total_amount.length; i++) {
                let max_amount = categories_with_total_amount[i]
                for (let j = i; j < categories_with_total_amount.length; j++) {
                    if (max_amount.amount < categories_with_total_amount[j].amount) {
                        max_amount = categories_with_total_amount[j];
                        categories_with_total_amount[j] = categories_with_total_amount[i]
                        categories_with_total_amount[i] = max_amount
                    }
                }
            }

            const categories_fromDb = await Categories.find();
            let another_array = [];

            for (let i = 0; i < categories_fromDb.length; i++) {
                for (let j = 0; j < categories_with_total_amount.length; j++) {
                    if (categories_with_total_amount[j].name == categories_fromDb[i].name) {
                        another_array.push({
                            name: categories_fromDb[i].name,
                            ar_name: categories_fromDb[i].arname,
                            ar_amount: numberToArabic(categories_with_total_amount[j].amount),
                            amount: categories_with_total_amount[j].amount
                        });
                    }
                }
            }

            let resp = {
                status: 200,
                categories: another_array,
                total: total_income
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < merchant_with_total_amount.length; i++) {
                let max_amount = merchant_with_total_amount[i]
                for (let j = i; j < merchant_with_total_amount.length; j++) {
                    if (max_amount.amount < merchant_with_total_amount[j].amount) {
                        max_amount = merchant_with_total_amount[j];
                        merchant_with_total_amount[j] = merchant_with_total_amount[i]
                        merchant_with_total_amount[i] = max_amount
                    }
                }
            }


            let resp = {
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by Tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Expense'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }

            for (let i = 0; i < tags.length; i++) {
                let max_amount = tags[i]
                for (let j = i; j < tags.length; j++) {
                    if (max_amount.count < tags[j].count) {
                        max_amount = tags[j];
                        tags[j] = tags[i]
                        tags[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                tags,
                total: total
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            let resp = {
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
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
        });
    }
});
exports.expenseByMonth = asyncHandler(async (req, res, next) => {
    try {
        let currentMonth = new Date().getMonth() + 1;
        let currentMonth_ = req.params.month
        var date = new Date();
        var lastDay = new Date(date.getFullYear(), req.params.month, 0);

        // Expense Over Time
        if (req.params.status == 0) {
            let date = new Date();
            let month = req.params.month;
            let year = req.params.year;
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;
            var lastDay = new Date(year, month, 0);
            let lastDay_ = lastDay.getDate();
            let current_day = lastDay_
            let transaction = [];

            const transaction_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            for (let i = 0; i < transaction_.length; i++) {
                if (transaction_[i].date.getMonth() + 1 == month && transaction_[i].date.getFullYear() == req.params.year) {
                    transaction.push(transaction_[i]);
                }
            }
            let months_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'
                , 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            let total_amount_1 = 0;
            let total_amount_2 = 0;
            let total_amount_3 = 0;
            let total_amount_4 = 0;

            for (let i = 0; i < transaction.length; i++) {
                if (transaction[i].date.getDate() < 7) {
                    total_amount_1 += transaction[i].amount
                } else if (transaction[i].date.getDate() >= 7 && transaction[i].date.getDate() <= 14) {
                    total_amount_2 += transaction[i].amount
                } else if (transaction[i].date.getDate() >= 14 && transaction[i].date.getDate() < 21) {
                    total_amount_3 += transaction[i].amount
                } else if (transaction[i].date.getDate() >= 21 && transaction[i].date.getDate() <= lastDay_) {
                    total_amount_4 += transaction[i].amount
                }
            }
            trannsactions_list.push({
                week: 1, amount: total_amount_1
            });
            trannsactions_list.push({
                week: 2, amount: total_amount_2
            });
            trannsactions_list.push({
                week: 3, amount: total_amount_3
            });
            trannsactions_list.push({
                week: 4, amount: total_amount_4
            });

            let resp = {
                status: 200,
                transactions: trannsactions_list,
                // total: total_income,
                // average: average,
                active_transactions: active_transactions
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            // console.log(`u_month : ${currentMonth_}`)
            // console.log(`u_month : ${transactions_}`)
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];
            console.log(categories_list_unique);
            // console.log(categories_list_unique)

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    // console.log(`u_month : ${currentMonth_}`)
                    // console.log(`u_month : ${transactions_[j].date.getMonth() + 1}`)
                    if (transactions_[j].category_id === categories_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            // console.log(categories_with_total_amount)

            for (let i = 0; i < categories_with_total_amount.length; i++) {
                let max_amount = categories_with_total_amount[i]
                for (let j = i; j < categories_with_total_amount.length; j++) {
                    if (max_amount.amount < categories_with_total_amount[j].amount) {
                        max_amount = categories_with_total_amount[j];
                        categories_with_total_amount[j] = categories_with_total_amount[i]
                        categories_with_total_amount[i] = max_amount
                    }
                }
            }

            let categories_fromDb = await Categories.find();
            let final_array = [];
            for (let i = 0; i < categories_with_total_amount.length; i++) {
                for (let j = 0; j < categories_fromDb.length; j++) {
                    if (categories_with_total_amount[i].name == categories_fromDb[j].name) {
                        final_array.push({
                            name: categories_with_total_amount[i].name,
                            ar_name: categories_fromDb[j].arname,
                            amount: categories_with_total_amount[i].amount,
                            ar_amount: numberToArabic(categories_with_total_amount[i].amount),
                        })
                    }
                }
            }

            let resp = {
                status: 200,
                categories: final_array,
                total: total_income
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < merchant_with_total_amount.length; i++) {
                let max_amount = merchant_with_total_amount[i]
                for (let j = i; j < merchant_with_total_amount.length; j++) {
                    if (max_amount.amount < merchant_with_total_amount[j].amount) {
                        max_amount = merchant_with_total_amount[j];
                        merchant_with_total_amount[j] = merchant_with_total_amount[i]
                        merchant_with_total_amount[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by Tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Expense'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth_
                            && transactions_by_tags[j].date.getFullYear() == req.params.year) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }

            for (let i = 0; i < tags.length; i++) {
                let max_amount = tags[i]
                for (let j = i; j < tags.length; j++) {
                    if (max_amount.count < tags[j].count) {
                        max_amount = tags[j];
                        tags[j] = tags[i]
                        tags[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                tags,
                total: total
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            let resp = {
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
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
        });
    }
});
exports.expenseByDate = asyncHandler(async (req, res, next) => {
    try {
        let currentMonth_ = req.params.month

        // Expense by categories
        if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            // console.log(`u_month : ${currentMonth_}`)
            // console.log(`u_month : ${transactions_}`)
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];
            // console.log(categories_list_unique)

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id === categories_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year
                        && transactions_[j].date.getDate() == req.params.date - 1) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < categories_with_total_amount.length; i++) {
                let max_amount = categories_with_total_amount[i]
                for (let j = i; j < categories_with_total_amount.length; j++) {
                    if (max_amount.amount < categories_with_total_amount[j].amount) {
                        max_amount = categories_with_total_amount[j];
                        categories_with_total_amount[j] = categories_with_total_amount[i]
                        categories_with_total_amount[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                categories: categories_with_total_amount,
                total: total_income
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year
                        && transactions_[j].date.getDate() == req.params.date - 1) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < merchant_with_total_amount.length; i++) {
                let max_amount = merchant_with_total_amount[i]
                for (let j = i; j < merchant_with_total_amount.length; j++) {
                    if (max_amount.amount < merchant_with_total_amount[j].amount) {
                        max_amount = merchant_with_total_amount[j];
                        merchant_with_total_amount[j] = merchant_with_total_amount[i];
                        merchant_with_total_amount[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Expense by Tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Expense'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth_
                            && transactions_by_tags[j].date.getFullYear() == req.params.year
                            && transactions_by_tags[j].date.getDate() == req.params.date - 1) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }

            for (let i = 0; i < tags.length; i++) {
                let max_amount = tags[i]
                for (let j = i; j < tags.length; j++) {
                    if (max_amount.count < tags[j].count) {
                        max_amount = tags[j];
                        tags[j] = tags[i];
                        tags[i] = max_amount
                    }
                }
            }

            let resp = {
                status: 200,
                tags,
                total: total
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {

            let resp = {
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.incomeByDate = asyncHandler(async (req, res, next) => {
    try {

        let currentMonth = new Date().getMonth() + 1;
        let currentMonth_ = req.params.month
        var date = new Date();
        var lastDay = new Date(date.getFullYear(), req.params.month, 0);

        // Expense Over Time
        if (req.params.status == 0) {

            let date = new Date();
            // let current_day = date.getDate();
            let current_day = lastDay.getDate();
            let month = req.params.month;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;

            const transaction = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            let months_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'
                , 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];


            for (let j = 1; j <= current_day; j++) {

                let total_amount = 0;
                for (let i = 0; i < transaction.length; i++) {
                    if (j == transaction[i].date.getDate()
                        && transaction[i].date.getFullYear() == req.params.year
                        && transaction[i].date.getMonth() + 1 == req.params.month) {
                        total_amount = total_amount + Number(transaction[i].amount)
                    }
                }
                trannsactions_list.push({
                    month: new Date(`${year}, ${month}, ${j} `),
                    amount: total_amount
                });
                if (total_amount !== 0) {
                    active_transactions.push(
                        {
                            month: new Date(`${year}, ${month}, ${j} `),
                            amount: total_amount
                        })
                }
                total_income = total_income + total_amount
            }

            let average = (total_income) / current_day;

            res.status(200).json({
                status: 200,
                transactions: trannsactions_list,
                total: total_income,
                average: average,
                active_transactions: active_transactions
            });
        }

        // Expense by categories
        if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            // console.log(`u_month : ${currentMonth_}`)
            // console.log(`u_month : ${transactions_}`)
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];
            // console.log(categories_list_unique)

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id === categories_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year
                        && transactions_[j].date.getDate() == req.params.date) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                categories: categories_with_total_amount,
                total: total_income
            });
        }

        // Expense by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i]
                        && transactions_[j].date.getMonth() + 1 == currentMonth_
                        && transactions_[j].date.getFullYear() == req.params.year
                        && transactions_[j].date.getDate() == req.params.date) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }
            res.status(200).json({
                status: 200,
                merchants: merchant_with_total_amount,
                total: total_income
            });
        }

        // Expense by Tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Income'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth_
                            && transactions_by_tags[j].date.getFullYear() == req.params.year
                            && transactions_by_tags[j].date.getDate() == req.params.date) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }
            res.status(200).json({
                status: 200,
                tags,
                total: total
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            res.status(200).json({
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            });
        }

    } catch (err) {
        next(err);
    }
});
exports.ExpenseReport = asyncHandler(async (req, res, next) => {
    try {
        let currentMonth = new Date().getMonth() + 1;
        // Expense Over Time
        if (req.params.status == 0) {
            let date = new Date();
            let current_day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;

            const transaction = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            let months_names = ['january', 'february', 'march', 'april', 'may', 'june'
                , 'july', 'august', 'september', 'october', 'november', 'december'];

            if (transaction.length === 0) {
                res.status(200).json({
                    status: 200,
                    transactions: [],
                    total: 0,
                    average: 0,
                    active_transactions: []
                });
            } else {


                for (let j = 1; j <= current_day; j++) {

                    let total_amount = 0;
                    for (let i = 0; i < transaction.length; i++) {
                        if (j == transaction[i].date.getDate()) {
                            total_amount = total_amount + Number(transaction[i].amount)
                        }
                    }
                    trannsactions_list.push({
                        month: `${months_names[month - 1]} ${j},${year}`, amount: total_amount
                    });
                    if (total_amount !== 0) {
                        active_transactions.push({ month: `${months_names[month - 1]} ${j},${year}`, amount: total_amount })
                    }
                    total_income = total_income + total_amount
                }

                let average = (total_income) / current_day;

                let resp = {
                    status: 200,
                    transactions: trannsactions_list,
                    total: total_income,
                    average: Math.round(average),
                    active_transactions: active_transactions
                }

                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }

        // Expense by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_expense = 0;
            let total_income_previous_month = 0;
            let param_month = req.params.month
            let param_year = req.params.year



            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });
            // console.log(transactions_)
            if (transactions_.length == 0) {
                res.status(200).json({
                    status: 200,
                    transactions: [],
                    total: 0,
                    total_previous_month: 0,
                    highest: [],
                    lowest: [],
                    highest_percentage: 0,
                    lowest_percentage: 0
                });
            } else {

                let new_array = [];
                let currentMonthTransactions = [];
                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getMonth() + 1 == param_month && transactions_[i].date.getFullYear() == param_year) {
                        //    console.log(1);
                        categories_list.push(transactions_[i].category_id);
                        currentMonthTransactions.push(transactions_[i]);
                        total_expense = total_expense + transactions_[i].amount
                    }
                }

                if (categories_list.length > 0) {

                    categories_list_unique = [...new Set(categories_list)];
                    // console.log(categories_list_unique)
                    // console.log(categories_list_unique)

                    // for current month
                    for (let i = 0; i < categories_list_unique.length; i++) {
                        total_amount = 0
                        for (let j = 0; j < currentMonthTransactions.length; j++) {
                            if (currentMonthTransactions[j].category_id == categories_list_unique[i]) {
                                total_amount = total_amount + Number(currentMonthTransactions[j].amount)
                                // console.log(currentMonthTransactions[j].date)
                            }
                        }
                        categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                    }

                    // for previous month
                    if (param_month == 1) {
                        param_month = 12;
                        param_year = param_year - 1;
                        for (let j = 0; j < transactions_.length; j++) {
                            if (transactions_[j].date.getMonth() + 1 == param_month && transactions_[j].date.getFullYear() == param_year) {
                                // console.log(12, transactions_[j].date, transactions_[j].amount);
                                total_income_previous_month = total_income_previous_month + transactions_[j].amount;
                            }
                        }
                    } else {
                        for (let j = 0; j < transactions_.length; j++) {
                            if (transactions_[j].date.getMonth() + 1 == param_month - 1 && transactions_[j].date.getFullYear() == param_year) {
                                // console.log(3, transactions_[j].date, transactions_[j].amount);
                                total_income_previous_month = total_income_previous_month + transactions_[j].amount;
                            }
                        }
                    }


                    categories_with_total_amount.sort((a, b) => a.amount - b.amount);
                    let categories_with_total_amount_length = categories_with_total_amount.length
                    let highest_spending_category = categories_with_total_amount[categories_with_total_amount_length - 1];
                    let lowest_spending_category = categories_with_total_amount[0];
                    let highest_spending_category_percentage = (highest_spending_category.amount * 100) / (total_expense)
                    let lowest_spending_category_percentage = (lowest_spending_category.amount * 100) / (total_expense)


                    const categories_fromDb = await Categories.find();
                    let another_array = [];

                    for (let i = 0; i < categories_fromDb.length; i++) {
                        for (let j = 0; j < categories_with_total_amount.length; j++) {
                            if (categories_with_total_amount[j].name == categories_fromDb[i].name) {
                                another_array.push({
                                    category: categories_fromDb[i].name,
                                    ar_category: categories_fromDb[i].arname,
                                    ar_amount: numberToArabic(categories_with_total_amount[j].amount),
                                    amount: categories_with_total_amount[j].amount
                                });
                            }
                        }
                    }


                    let resp = {
                        status: 200,
                        transactions: another_array,
                        total: total_expense,
                        total_previous_month: total_income_previous_month,
                        highest: highest_spending_category,
                        lowest: lowest_spending_category,
                        highest_percentage: Math.round(highest_spending_category_percentage),
                        lowest_percentage: Math.round(lowest_spending_category_percentage)
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                } else {
                    let resp = {
                        status: 200,
                        transactions: [],
                        total: 0,
                        total_previous_month: 0,
                        highest: [],
                        lowest: [],
                        highest_percentage: 0,
                        lowest_percentage: 0
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }
            }
        }
        // Expense by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_expense = 0;
            let total_income_previous_month = 0;
            let param_month = req.params.month
            let param_year = req.params.year

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Expense" });

            if (transactions_.length == 0) {
                res.status(200).json({
                    status: 200,
                    transactions: [],
                    total: 0,
                    total_previous_month: 0,
                    highest: [],
                    lowest: [],
                    highest_percentage: 0,
                    lowest_percentage: 0
                });
            } else {
                let currentMonthTransactions = [];
                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getMonth() + 1 == param_month && transactions_[i].date.getFullYear() == param_year) {
                        merchants_list.push(transactions_[i].merchant);
                        currentMonthTransactions.push(transactions_[i]);
                        total_expense = total_expense + transactions_[i].amount;
                    }
                }

                if (merchants_list.length > 0) {

                    merchant_list_unique = [...new Set(merchants_list)];

                    for (let i = 0; i < merchant_list_unique.length; i++) {
                        total_amount = 0
                        for (let j = 0; j < currentMonthTransactions.length; j++) {
                            if (currentMonthTransactions[j].merchant == merchant_list_unique[i]
                                && currentMonthTransactions[j].date.getMonth() + 1 == param_month
                                && currentMonthTransactions[j].date.getFullYear() == param_year) {
                                total_amount = total_amount + Number(currentMonthTransactions[j].amount)
                            }
                        }
                        merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                    }

                    let merchant_with_total_amount_ = [];
                    if (param_month == 1) {
                        param_month = 12;
                        param_year = param_year - 1;
                        for (let j = 0; j < transactions_.length; j++) {
                            if (transactions_[j].date.getMonth() + 1 == param_month && transactions_[j].date.getFullYear() == param_year) {
                                total_income_previous_month = total_income_previous_month + transactions_[j].amount;
                            }
                        }
                    } else {
                        for (let j = 0; j < transactions_.length; j++) {
                            if (transactions_[j].date.getMonth() + 1 == param_month - 1 && transactions_[j].date.getFullYear() == param_year) {
                                total_income_previous_month = total_income_previous_month + transactions_[j].amount;
                            }
                        }
                    }
                    merchant_with_total_amount.sort((a, b) => a.amount - b.amount);
                    let merchant_with_total_amount_length = merchant_with_total_amount.length
                    let highest_spending_merchant = merchant_with_total_amount[merchant_with_total_amount_length - 1];
                    let lowest_spending_merchant = merchant_with_total_amount[0];
                    let highest_spending_merchant_percentage = (highest_spending_merchant.amount * 100) / (total_expense)
                    let lowest_spending_merchant_percentage = (lowest_spending_merchant.amount * 100) / (total_expense)

                    let resp = {
                        status: 200,
                        transactions: merchant_with_total_amount,
                        total: total_expense,
                        total_previous_month: total_income_previous_month,
                        highest: highest_spending_merchant,
                        lowest: lowest_spending_merchant,
                        highest_percentage: Math.round(highest_spending_merchant_percentage),
                        lowest_percentage: Math.round(lowest_spending_merchant_percentage)
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                } else {
                    let resp = {
                        status: 200,
                        transactions: [],
                        total: 0,
                        total_previous_month: 0,
                        highest: [],
                        lowest: [],
                        highest_percentage: 0,
                        lowest_percentage: 0
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }
            }
        }
        // Expense by Tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });

            if (user_tags.length == 0) {
                res.status(200).json({
                    status: 200,
                    tags: [],
                    total: 0,
                    highest_spending_tag: [],
                    lowest_spending_tag: []
                });
            } else {

                for (let i = 0; i < user_tags.length; i++) {
                    const transactions_by_tags = await Transaction.find({
                        user_id: req.user.id,
                        tags: { $all: [user_tags[i].id] },
                        type: 'Expense'
                    });
                    let total_by_evry_tag = 0;
                    for (let j = 0; j < transactions_by_tags.length; j++) {
                        if (transactions_by_tags) {
                            if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth) {
                                total_by_evry_tag += Number(transactions_by_tags[j].amount)
                            }
                        }
                    }
                    tags.push({
                        name: user_tags[i].name,
                        count: total_by_evry_tag,
                    });
                    total += total_by_evry_tag;
                }

                tags.sort((a, b) => a.count - b.count);
                let tags_length = tags.length
                let highest_spending_tag = tags[tags_length - 1];
                let lowest_spending_tag = tags[0];

                let resp = {
                    status: 200,
                    tags,
                    total: total,
                    highest_spending_tag,
                    lowest_spending_tag
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            let resp = {
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.incomeReport = asyncHandler(async (req, res, next) => {
    try {

        let currentMonth = req.params.month;

        // Income Over Time
        if (req.params.status == 0) {

            let date = new Date();
            let current_day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let trannsactions_list = [];
            let active_transactions = [];
            let total_income = 0;

            const transaction = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let months_names = ['january', 'february', 'march', 'april', 'may', 'june'
                , 'july', 'august', 'september', 'october', 'november', 'december'];

            for (let j = 1; j <= current_day; j++) {

                let total_amount = 0;
                for (let i = 0; i < transaction.length; i++) {
                    if (j == transaction[i].date.getDate()) {
                        numbered_amount = Number(transaction[i].amount)
                        total_amount = total_amount + numbered_amount
                    }
                }
                trannsactions_list.push({
                    month: `${months_names[month - 1]} ${j},${year}`, amount: total_amount
                });
                if (total_amount !== 0) {
                    active_transactions.push({ month: `${months_names[month - 1]} ${j},${year}`, amount: total_amount })
                }
                total_income = total_income + total_amount
            }

            let average = (total_income) / current_day;

            let resp = {
                status: 200,
                transactions: trannsactions_list,
                total: total_income,
                average: average,
                active_transactions: active_transactions
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Income by categories
        else if (req.params.status == 1) {
            let categories_list = [];
            let categories_list_unique = [];
            let categories_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;
            let total_income_previous_month = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            let new_array = [];
            for (let i = 0; i < transactions_.length; i++) {
                categories_list.push(transactions_[i].category_id)
            }

            categories_list_unique = [...new Set(categories_list)];

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id == categories_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < categories_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].category_id == categories_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth - 1) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                categories_with_total_amount.push({ name: categories_list_unique[i], amount: total_amount })
                total_income_previous_month = total_income_previous_month + total_amount;
            }

            categories_with_total_amount.sort((a, b) => a.amount - b.amount);
            let categories_with_total_amount_length = categories_with_total_amount.length
            let highest_spending_category = categories_with_total_amount[categories_with_total_amount_length - 1];
            let lowest_spending_category = categories_with_total_amount[0];
            // let highest_spending_category_percentage = (highest_spending_category.amount * 100)/total_amount
            let highest_spending_category_percentage = (highest_spending_category.amount * 100) / (total_income)
            let lowest_spending_category_percentage = (lowest_spending_category.amount * 100) / (total_income)


            let resp = {
                status: 200,
                transactions: categories_with_total_amount,
                total: total_income,
                total_previous_month: total_income_previous_month,
                highest_percentage: highest_spending_category_percentage,
                lowest_percentage: lowest_spending_category_percentage
            }
            console.log(resp)

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Income by merchants
        else if (req.params.status == 2) {
            let merchants_list = [];
            let merchant_list_unique = [];
            let merchant_with_total_amount = [];
            let total_amount = 0;
            let total_income = 0;
            let total_income_previous_month = 0;

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: "Income" });
            for (let i = 0; i < transactions_.length; i++) {
                merchants_list.push(transactions_[i].merchant)
            }

            merchant_list_unique = [...new Set(merchants_list)];

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income = total_income + total_amount;
            }

            for (let i = 0; i < merchant_list_unique.length; i++) {
                total_amount = 0
                for (let j = 0; j < transactions_.length; j++) {
                    if (transactions_[j].merchant == merchant_list_unique[i] && transactions_[j].date.getMonth() + 1 == currentMonth - 1) {
                        total_amount = total_amount + Number(transactions_[j].amount)
                    }
                }
                merchant_with_total_amount.push({ name: merchant_list_unique[i], amount: total_amount })
                total_income_previous_month = total_income_previous_month + total_amount;
            }

            merchant_with_total_amount.sort(function (a, b) { return (a.amount - b.amount) })
            let merchant_with_total_amount_length = merchant_with_total_amount.length;
            let highest_earning_merchant = merchant_with_total_amount[merchant_with_total_amount_length - 1];
            let lowest_earning_merchant = merchant_with_total_amount[0];


            let resp = {
                status: 200,
                transactions: merchant_with_total_amount,
                total: total_income,
                total_previous_month: total_income_previous_month,
                highest: highest_earning_merchant,
                lowest: lowest_earning_merchant
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

        // Income by tags
        else if (req.params.status == 3) {
            let tags = [];
            let total = 0;
            const user_tags = await Tags.find({ user_id: req.user.id });
            for (let i = 0; i < user_tags.length; i++) {
                const transactions_by_tags = await Transaction.find({
                    user_id: req.user.id,
                    tags: { $all: [user_tags[i].id] },
                    type: 'Income'
                });
                let total_by_evry_tag = 0;
                for (let j = 0; j < transactions_by_tags.length; j++) {
                    if (transactions_by_tags) {
                        if (transactions_by_tags[j].date.getMonth() + 1 == currentMonth) {
                            total_by_evry_tag += Number(transactions_by_tags[j].amount)
                        }
                    }
                }
                tags.push({
                    name: user_tags[i].name,
                    count: total_by_evry_tag,
                });
                total += total_by_evry_tag;
            }

            tags.sort((a, b) => a.count - b.count);
            let tags_length = tags.length
            let highest_earning_tag = tags[tags_length - 1];
            let lowest_earning_tag = tags[0];

            let resp = {
                status: 200,
                tags,
                total: total,
                highest_earning_tag,
                lowest_earning_tag
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else if (req.params.status < 0 || req.params.status > 3) {
            let resp = {
                status: 200,
                message: 'Not found',
                armessage: 'غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.yearlyReport = asyncHandler(async (req, res, next) => {
    try {
        if (req.params.status == 0) {

            let yearly_expense = [];
            const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
            // console.log(transactions_)

            for (let i = 0; i < transactions_.length; i++) {
                if (transactions_[i].date.getFullYear() == req.params.year) {
                    yearly_expense.push(transactions_[i]);
                }
            }
            if (yearly_expense.length !== 0) {
                let total_by_month = [];
                let total = 0;
                let total_income = 0;

                for (let i = 1; i <= 12; i++) {
                    total = 0;
                    // console.log(yearly_expense[i].date.getMonth());
                    for (let j = 0; j < yearly_expense.length; j++) {
                        if (yearly_expense[j].date.getMonth() + 1 == i) {
                            total = total + yearly_expense[j].amount
                        }
                    }
                    total_by_month.push({ month: i, amount: total });
                    total_income = total_income + total;
                }
                let resp = {
                    status: 200,
                    total_by_month,
                    total_income
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
            else {
                let resp = {
                    status: 400,
                    total_by_month: [],
                    total_income: 0
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }
        else if (req.params.status == 1) {
            let yearly_income = [];

            const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Income' });

            for (let i = 0; i < transactions_.length; i++) {
                if (transactions_[i].date.getFullYear() == req.params.year) {
                    yearly_income.push(transactions_[i]);
                }
            }
            if (yearly_income.length !== 0) {

                let total_by_month = [];
                let total = 0;
                let total_income = 0;

                for (let i = 1; i < 13; i++) {
                    total = 0;
                    // console.log(yearly_income[i].date.getMonth());
                    for (let j = 0; j < yearly_income.length; j++) {
                        if (yearly_income[j].date.getMonth() + 1 == i) {
                            // console.log(yearly_income[j].date.getMonth());
                            total = total + yearly_income[j].amount
                        }
                    }
                    total_by_month.push({ month: i, amount: total });
                    total_income = total_income + total;
                }
                let resp = {
                    status: 200,
                    total_by_month,
                    total_income
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
            else {
                let resp = {
                    status: 400,
                    message: 'No record for this year',
                    armessage: 'لا يوجد سجل لهذا العام'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.quarterlyReport = asyncHandler(async (req, res, next) => {
    try {
        if (req.params.status == 0) {
            if (req.params.quarter == 1) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 1; i < 4; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }

                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            total_by_month: []
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        total_by_month: []
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 2) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 4; i < 7; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            total_by_month: []
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        total_by_month: []
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 3) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 7; i < 10; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            total_by_month: []
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        total_by_month: []
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 4) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Expense' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 10; i < 13; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            total_by_month: []
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        total_by_month: []
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
        }
        if (req.params.status == 1) {
            if (req.params.quarter == 1) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Income' });

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 1; i < 4; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }

                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            message: 'No record for this quarter',
                            armessage: 'لا يوجد سجل لهذا الربع'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        message: 'No record for this year',
                        armessage: 'لا يوجد سجل لهذا العام'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 2) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Income' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 4; i < 7; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            message: 'No record for this quarter',
                            armessage: 'لا يوجد سجل لهذا الربع'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        message: 'No record for this year',
                        armessage: 'لا يوجد سجل لهذا العام'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 3) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Income' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 7; i < 10; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            message: 'No record for this quarter',
                            armessage: 'لا يوجد سجل لهذا الربع'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        message: 'No record for this year',
                        armessage: 'لا يوجد سجل لهذا العام'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
            else if (req.params.quarter == 4) {

                let yearly_expense = [];

                const transactions_ = await Transaction.find({ user_id: req.user.id, type: 'Income' });
                // console.log(transactions_)

                for (let i = 0; i < transactions_.length; i++) {
                    if (transactions_[i].date.getFullYear() == req.params.year) {
                        yearly_expense.push(transactions_[i]);
                    }
                }
                if (yearly_expense.length !== 0) {

                    let total_by_month = [];
                    let total = 0;

                    for (let i = 10; i < 13; i++) {
                        total = 0;
                        // console.log(yearly_expense[i].date.getMonth());
                        for (let j = 0; j < yearly_expense.length; j++) {
                            if (yearly_expense[j].date.getMonth() + 1 == i) {
                                // console.log(yearly_expense[j].date.getMonth());
                                total = total + yearly_expense[j].amount
                            }
                        }
                        total_by_month.push({ month: i, amount: total });
                    }
                    if (total_by_month.length > 0) {

                        let resp = {
                            status: 200,
                            total_by_month
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        let resp = {
                            status: 200,
                            message: 'No record for this quarter',
                            armessage: 'لا يوجد سجل لهذا الربع'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                }
                else {
                    let resp = {
                        status: 200,
                        message: 'No record for this year',
                        armessage: 'لا يوجد سجل لهذا العام'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            }
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
