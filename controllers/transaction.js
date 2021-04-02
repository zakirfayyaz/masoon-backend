const asyncHandler = require("../middleware/async");
const Tags = require("../models/tags");
const Tag_transaction = require("../models/tag_transaction");
const Transaction = require("../models/transactions");
const Merchant = require("../models/merchant");
const Categories = require("../models/categories")
const Budget = require("../models/budgets");
const Sub_categories = require("../models/sub_categories");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");

// done
exports.createTransactions = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    var {
        budget_id,
        category_id,
        sub_category_id,
        description,
        merchant, date,
        payment_type,
        tags,
        amount,
        type
    } = cred;
    // console.log(cred);
    amount = Number(amount);

    const budget_remaining_amount = await Budget.findById({ _id: budget_id });
    if (!budget_id || !category_id || !sub_category_id || !payment_type || !amount || !type || !date || !merchant) {
        let resp = {
            status: 400,
            message: 'Please provide all required credentials',
            armessage: 'يرجى تقديم جميع أوراق الاعتماد المطلوبة'
        }
        res.status(400).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    else if (type == 'Expense' && budget_remaining_amount.remaining_amount < amount) {
        let resp = {
            status: 202,
            message: 'Your budget balance is less than required amount',
            armessage: 'رصيد ميزانيتك أقل من المبلغ المطلوب'
        }
        res.status(400).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    else {
        if (tags === undefined || tags.length == 0 || tags == null || tags == " ") {
            try {
                const Uncategorized = true;
                const category_name = await Categories.findById({ _id: category_id });
                const categoryName = category_name.name

                const transaction = await Transaction.create({
                    category_id: categoryName,
                    sub_category_id,
                    budget_id,
                    type,
                    payment_type,
                    amount,
                    date,
                    description,
                    merchant,
                    user_id
                });
                resp = {
                    status: 200,
                    message: 'Transaction created',
                    armessage: `تم إنشاء العملية بنجاح`
                }
                res.status(201).json({
                    resp: encrypt(JSON.stringify(resp))
                });
                const merchants_check = await Merchant.find({ name: merchant });
                if (merchants_check.length === 0) {
                    const merchants = Merchant.create({
                        name: merchant,
                        user_id
                    });
                }
                else {
                    // console.log('merchant exists')
                }

                // Deduction from budget of following category
                if (type === 'Expense') {
                    const budget = await Budget.findById({ _id: budget_id });
                    if (budget) {
                        const updated_budget = await Budget.findByIdAndUpdate({ _id: budget.id }, { remaining_amount: budget.remaining_amount - amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                    }
                    else {
                        // console.log('Budget Not found of month, ' + current_month);
                    }
                }
            } catch (err) {
                next(err);
                let resp = {
                    status: 400,
                    message: 'Error while creating transaction',
                    armessage: `خطأ أثناء إنشاء العملية`
                }
                res.status(400).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }

        else if (tags) {
            try {
                const category_name = await Categories.findById({ _id: category_id });
                const categoryName = category_name.name
                const merchants = await Merchant.find({ name: merchant });
                const transaction = await Transaction.create({
                    category_id: categoryName,
                    sub_category_id,
                    budget_id,
                    type,
                    payment_type,
                    amount,
                    date,
                    description,
                    merchant,
                    tags,
                    user_id
                });
                resp = {
                    status: 200,
                    message: 'Transaction created',
                    armessage: `تم إنشاء العملية بنجاح`
                }
                res.status(201).json({
                    resp: encrypt(JSON.stringify(resp))
                });

                const merchants_check = await Merchant.find({ user_id: req.user.id, name: merchant });
                if (merchants_check.length === 0) {
                    const merchants = Merchant.create({
                        name: merchant,
                        user_id
                    });
                }

                for (i = 0; i < tags.length; i++) {
                    const tag_transaction = await Tag_transaction.create({
                        transaction_id: transaction._id,
                        tags_id: tags[i],
                        user_id
                    });
                }

                // Deduction from budget of following category
                if (type === 'Expense') {
                    const budget = await Budget.findById({ _id: budget_id });
                    // console.log(budget);
                    if (budget) {
                        const updated_budget = await Budget.findByIdAndUpdate({ _id: budget.id }, { remaining_amount: budget.remaining_amount - amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                    }
                    else {
                        // console.log('Budget Not found with ID: , ' + budget_id);
                    }
                }
            } catch (err) {
                next(err);
                let resp = {
                    status: 400,
                    message: 'Error while creating transaction',
                    armessage: `خطأ أثناء إنشاء العملية`
                }
                res.status(201).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }
    }
});
exports.viewTransactions = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        const transactions_ = await Transaction.find({ user_id: id });
        const transactions = transactions_.filter(t => t.date.getMonth() == new Date().getMonth());
        const categories = await Categories.find();
        let categories_array = [];
        let categories_array_2 = [];
        let categories_array_3 = [];
        let categories_array_4 = [];

        for (let i = 0; i < transactions.length; i++) {
            categories_array.push(transactions[i].category_id);
        }
        categories_array_2 = [...new Set(categories_array)];
        for (let i = 0; i < categories_array_2.length; i++) {
            for (let j = 0; j < categories.length; j++) {
                if (categories_array_2[i] === categories[j].name) {
                    categories_array_3.push({ id: categories[j].id, name: categories[j].name })
                }
            }
        }
        for (let i = 0; i < categories_array_3.length; i++) {
            let count = 0;
            for (let j = 0; j < transactions.length; j++) {
                if (categories_array_3[i].name === transactions[j].category_id) {
                    count++;
                }
            }
            categories_array_4.push({ id: categories_array_3[i].id, name: categories_array_3[i].name, count: count });
        }
        let tags = []
        const user_tags = await Tags.find({ user_id: id });
        for (let i = 0; i < user_tags.length; i++) {
            const transactions_by_tags = await Transaction.find({
                user_id: id,
                tags: { $all: [user_tags[i].id] }
            });
            tags.push({
                id: user_tags[i].id,
                name: user_tags[i].name,
                count: transactions_by_tags.length,
            });
        }

        let budget_categories = [];
        let month_of_budget = new Date().getMonth();
        let month_array = ['january', 'february', 'march', 'april'
            , 'may', 'june', 'july', 'august'
            , 'september', 'october', 'november', 'december'];

        const budget_categories_2 = await Budget.find({ user_id: req.user.id, month: month_array[month_of_budget], year: new Date().getFullYear() });
        if (budget_categories_2) {
            for (let i = 0; i < budget_categories_2.length; i++) {
                budget_categories.push({ id: budget_categories_2[i].id, name: budget_categories_2[i].category_id })
            }
        }

        const categories_fromDb = await Categories.find();
        let another_array = [];

        for (let i = 0; i < categories_fromDb.length; i++) {
            for (let j = 0; j < categories_array_4.length; j++) {
                if (categories_array_4[j].name == categories_fromDb[i].name) {
                    another_array.push({
                        id: categories_array_4[j].id,
                        name: categories_array_4[j].name,
                        ar_name: categories_fromDb[i].arname,
                        count: categories_array_4[j].count
                    });
                }
            }
        }

        let another_array_ = [];
        for (let i = 0; i < categories_fromDb.length; i++) {
            for (let j = 0; j < budget_categories.length; j++) {
                if (budget_categories[j].name == categories_fromDb[i].name) {
                    another_array_.push({
                        id: budget_categories[j].id,
                        name: budget_categories[j].name,
                        ar_name: categories_fromDb[i].arname,
                    });
                }
            }
        }
        let resp = {
            status: 200,
            count: transactions.length,
            transactions: transactions,
            categories: another_array,
            tags,
            budget_categories: another_array_
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByMonth = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let month = cred.month;
        let year = cred.year;
        // console.log(cred)

        const transactions_ = await Transaction.find({ user_id: id });
        let transactions = [];
        for (let i = 0; i < transactions_.length; i++) {
            let t_month = transactions_[i].date.getMonth() + 1;
            console.log(t_month)
            if (t_month === month && transactions_[i].date.getFullYear() === year)
                transactions.push(transactions_[i])
        }
        // console.log(transactions)
        if (transactions.length > 0) {
            const categories = await Categories.find();
            let categories_array = [];
            let categories_array_2 = [];
            let categories_array_3 = [];
            let categories_array_4 = [];

            for (let i = 0; i < transactions.length; i++) {
                categories_array.push(transactions[i].category_id);
            }
            categories_array_2 = [...new Set(categories_array)];
            for (let i = 0; i < categories_array_2.length; i++) {
                for (let j = 0; j < categories.length; j++) {
                    if (categories_array_2[i] === categories[j].name) {
                        categories_array_3.push({ id: categories[j].id, name: categories[j].name })
                    }
                }
            }
            for (let i = 0; i < categories_array_3.length; i++) {
                let count = 0;
                for (let j = 0; j < transactions.length; j++) {
                    if (categories_array_3[i].name == transactions[j].category_id) {
                        count++;
                    }
                }
                categories_array_4.push({ id: categories_array_3[i].id, name: categories_array_3[i].name, count: count });
            }
            let tags = []
            let user_tags = [];

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].tags.length > 0) {
                    for (let j = 0; j < transactions[i].tags.length; j++) {
                        user_tags.push(transactions[i].tags[j].toString());
                    }
                }
            }
            const all_tags = await Tags.find({ user_id: req.user.id });
            let name = await Tags.find({ user_id: req.user.id });

            user_tags = [...new Set(user_tags)];
            for (let i = 0; i < user_tags.length; i++) {
                // console.log(user_tags[i])
                const ttt = await Transaction.find({ user_id: req.user.id, tags: { $all: [user_tags[i]] } });
                // console.log(ttt.length)
                const ttt_ = await ttt.filter(t => t.date.getMonth() + 1 == month && t.date.getFullYear() == year);
                let name_ = await name.filter(t => t.id == user_tags[i]);
                tags.push({ id: user_tags[i], count: ttt_.length, name: name_[0].name });
            }

            let budget_categories = [];
            let month_of_budget = new Date().getMonth();
            let month_array = ['january', 'february', 'march', 'april'
                , 'may', 'june', 'july', 'august'
                , 'september', 'october', 'november', 'december'];

            const budget_categories_2 = await Budget.find({ user_id: req.user.id, month: month_array[month_of_budget] })
            if (budget_categories_2) {
                for (let i = 0; i < budget_categories_2.length; i++) {
                    budget_categories.push({ id: budget_categories_2[i].id, name: budget_categories_2[i].category_id })
                }
            }

            let resp = {
                status: 200,
                count: transactions.length,
                transactions: transactions,
                categories: categories_array_4,
                tags,
                budget_categories
            }

            res.status(200).json(
                {
                    resp: encrypt(JSON.stringify(resp))
                }
            );
        } else {
            let resp = {
                status: 200,
                count: 0,
                transactions: [],
                categories: [],
                tags: [],
                budget_categories: []
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByDate = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        // console.log(req.body);
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { month, year, date } = cred
        // console.log(month)
        // console.log(year)
        // console.log(date)

        const transactions_ = await Transaction.find({ user_id: id });
        const transactions = transactions_.filter(t => t.date.getMonth() + 1 == month
            && t.date.getFullYear() == year
            && t.date.getDate() == date - 1);
        if (transactions.length > 0) {
            const categories = await Categories.find();
            let categories_array = [];
            let categories_array_2 = [];
            let categories_array_3 = [];
            let categories_array_4 = [];

            for (let i = 0; i < transactions.length; i++) {
                categories_array.push(transactions[i].category_id);
            }
            categories_array_2 = [...new Set(categories_array)];
            for (let i = 0; i < categories_array_2.length; i++) {
                for (let j = 0; j < categories.length; j++) {
                    if (categories_array_2[i] === categories[j].name) {
                        categories_array_3.push({ id: categories[j].id, name: categories[j].name })
                    }
                }
            }
            for (let i = 0; i < categories_array_3.length; i++) {
                let count = 0;
                for (let j = 0; j < transactions.length; j++) {
                    if (categories_array_3[i].name == transactions[j].category_id) {
                        count++;
                    }
                }
                categories_array_4.push({ id: categories_array_3[i].id, name: categories_array_3[i].name, count: count });
            }
            let tags = []
            let user_tags = [];

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].tags.length > 0) {
                    for (let j = 0; j < transactions[i].tags.length; j++) {
                        user_tags.push(transactions[i].tags[j].toString());
                    }
                }
            }
            const all_tags = await Tags.find({ user_id: req.user.id });
            let name = await Tags.find({ user_id: req.user.id });

            user_tags = [...new Set(user_tags)];
            for (let i = 0; i < user_tags.length; i++) {
                // console.log(user_tags[i])
                const ttt = await Transaction.find({ user_id: req.user.id, tags: { $all: [user_tags[i]] } });
                // console.log(ttt.length)
                const ttt_ = await ttt.filter(t => t.date.getMonth() + 1 == month
                    && t.date.getFullYear() == year
                    && t.date.getDate() == date);
                let name_ = await name.filter(t => t.id == user_tags[i]);
                tags.push({ id: user_tags[i], count: ttt_.length, name: name_[0].name });
            }

            let budget_categories = [];
            let month_of_budget = new Date().getMonth();
            let month_array = ['january', 'february', 'march', 'april'
                , 'may', 'june', 'july', 'august'
                , 'september', 'october', 'november', 'december'];

            const budget_categories_2 = await Budget.find({ user_id: req.user.id, month: month_array[month_of_budget] })
            if (budget_categories_2) {
                for (let i = 0; i < budget_categories_2.length; i++) {
                    budget_categories.push({ id: budget_categories_2[i].id, name: budget_categories_2[i].category_id })
                }
            }

            let resp = {
                status: 200,
                count: transactions.length,
                transactions: transactions,
                categories: categories_array_4,
                tags,
                budget_categories
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            let resp = {
                status: 200,
                count: 0,
                transactions: [],
                categories: [],
                tags: [],
                budget_categories: []
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByTags = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { tag } = cred;
        const transactions = await Transaction.find({
            tags: { $all: [tag] },
            user_id: id
        });

        let resp = {
            success: "Transaction(s) by tag Found",
            count: transactions.length,
            status: 200,
            transactions: transactions
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByIncome = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    try {
        const transactions = await Transaction.find({ user_id: id, type: 'Income' });
        if (transactions.length > 0) {
            res.status(201).json({
                success: "Transaction(s) Found",
                count: transactions.length,
                status: 200,
                transactions: transactions
            });
        } else {
            res.status(201).json({
                success: "Transaction(s) Found",
                count: 0,
                status: 200,
                transactions: []
            });
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByExpense = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    try {
        const transactions = await Transaction.find({ user_id: id, type: 'Expense' });
        let resp = {
            success: "Transaction(s) Found",
            count: transactions.length,
            status: 200,
            transactions: transactions
        }

        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(500).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsByCategory = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let { category } = cred;
    try {
        const transactions = await Transaction.find({ user_id: id, category_id: category });
        let resp = {
            success: "Transaction(s) Found",
            count: transactions.length,
            status: 200,
            transactions: transactions
        }

        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTransactionsById = asyncHandler(async (req, res, next) => {
    // const id = req.user.id;
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let transaction = cred.id;
        console.log(cred)
        console.log(transaction)
        const transactions = await Transaction.findById({ _id: transaction });
        const budget = await Budget.find({ _id: transactions.budget_id });
        console.log(budget)
        const categories = await Categories.find({ name: transactions.category_id });
        const subcategories = await Sub_categories.find({ _id: transactions.sub_category_id });
        const ar_cat_for_budget = await Categories.find({ name: budget[0].category_id })

        let resp = {
            status: 200,
            transactions: transactions,
            budget: budget[0].category_id,
            ar_budget: ar_cat_for_budget[0].arname,
            category: categories[0].name,
            ar_category: categories[0].arname,
            cat_id: categories[0].id,
            subcategy: subcategories[0].name,
            ar_subcategy: subcategories[0].arname
        }
        console.log(resp)
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.editTransaction = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { amount, tags, payment_type, type, description, merchant, date, sub_category_id, budget_id, category_id, transaction_id } = cred;
        let update_budget;
        const transaction = await Transaction.findById({ _id: transaction_id });
        const categories = await Categories.findById({ _id: category_id });
        if (transaction) {
            update_budget = await Budget.findById({ _id: budget_id });
            update_budget_previous_ = await Budget.findById({ _id: transaction.budget_id });

            if (budget_id != transaction.budget_id) {
                if (amount > transaction.amount) {
                    if (amount > update_budget.remaining_amount) {
                        let resp = {
                            status: 200,
                            message: "Transaction amount cannot exceed budget limit",
                            armessage: `لا يمكن أن يتجاوز مبلغ العملية حد الميزانية`
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    } else {
                        const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                            { remaining_amount: update_budget.remaining_amount - amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                        const budget_1 = await Budget.findByIdAndUpdate({ _id: update_budget_previous_.id },
                            { remaining_amount: update_budget_previous_.remaining_amount + transaction.amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                        const transaction_ = await Transaction.findByIdAndUpdate(
                            { _id: transaction_id },
                            {
                                amount: amount,
                                category_id: categories.name,
                                budget_id: budget_id,
                                date: date,
                                description: description,
                                merchant: merchant,
                                payment_type: payment_type,
                                sub_category_id: sub_category_id,
                                type: type,
                                tags: tags
                            },
                            {
                                new: true,
                                runValidator: true,
                                useFindAndModify: false
                            }
                        );
                        let resp = {
                            status: 200,
                            message: "Transaction updated",
                            armessage: `تم تحديث العملية`,
                            account: transaction_
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    }
                } else if (amount < transaction.amount) {
                    if (amount > update_budget.remaining_amount) {
                        let resp = {
                            status: 200,
                            message: "Transaction amount cannot exceed budget limit",
                            armessage: `لا يمكن أن يتجاوز مبلغ العملية حد الميزانية`
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    } else {
                        const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                            { remaining_amount: update_budget.remaining_amount - amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                        const budget_1 = await Budget.findByIdAndUpdate({ _id: update_budget_previous_.id },
                            { remaining_amount: update_budget_previous_.remaining_amount + transaction.amount }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                        const transaction_ = await Transaction.findByIdAndUpdate(
                            { _id: transaction_id },
                            {
                                amount: amount,
                                category_id: categories.name,
                                budget_id: budget_id,
                                date: date,
                                description: description,
                                merchant: merchant,
                                payment_type: payment_type,
                                sub_category_id: sub_category_id,
                                type: type,
                                tags: tags
                            },
                            {
                                new: true,
                                runValidator: true,
                                useFindAndModify: false
                            }
                        );
                        let resp = {
                            status: 200,
                            message: "Transaction updated",
                            armessage: `تم تحديث العملية`,
                            account: transaction_
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    }
                } else if (amount == transaction.amount) {
                    const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                        { remaining_amount: update_budget.remaining_amount - amount }, {
                        new: true,
                        runValidator: true,
                        useFindAndModify: false
                    });
                    const budget_1 = await Budget.findByIdAndUpdate({ _id: update_budget_previous_.id },
                        { remaining_amount: update_budget_previous_.remaining_amount + amount }, {
                        new: true,
                        runValidator: true,
                        useFindAndModify: false
                    });
                    const transaction_ = await Transaction.findByIdAndUpdate(
                        { _id: transaction_id },
                        {
                            amount: amount,
                            category_id: categories.name,
                            budget_id: budget_id,
                            date: date,
                            description: description,
                            merchant: merchant,
                            payment_type: payment_type,
                            sub_category_id: sub_category_id,
                            type: type,
                            tags: tags
                        },
                        {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        }
                    );
                    let resp = {
                        status: 200,
                        message: "Transaction updated",
                        armessage: `تم تحديث العملية`,
                        account: transaction_
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }

            }
            else if (budget_id == transaction.budget_id) {
                if (amount < transaction.amount) {
                    let amnt_diff = transaction.amount - amount;
                    const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                        { remaining_amount: update_budget.remaining_amount + amnt_diff }, {
                        new: true,
                        runValidator: true,
                        useFindAndModify: false
                    });
                    const transaction_ = await Transaction.findByIdAndUpdate(
                        { _id: transaction_id },
                        {
                            amount: amount,
                            category_id: categories.name,
                            budget_id: budget_id,
                            date: date,
                            description: description,
                            merchant: merchant,
                            payment_type: payment_type,
                            sub_category_id: sub_category_id,
                            type: type,
                            tags: tags
                        },
                        {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        }
                    );
                    let resp = {
                        status: 200,
                        message: "Transaction updated",
                        armessage: `تم تحديث العملية`,
                    }

                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }
                else if (amount > transaction.amount) {
                    let amnt_diff = amount - transaction.amount;
                    if (amnt_diff > update_budget.remaining_amount) {
                        let resp = {
                            status: 200,
                            message: "Transaction amount cannot exceed budget limit",
                            armessage: `لا يمكن أن يتجاوز مبلغ العملية حد الميزانية`
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    } else {
                        const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                            { remaining_amount: update_budget.remaining_amount - amnt_diff }, {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        });
                        const transaction_ = await Transaction.findByIdAndUpdate(
                            { _id: transaction_id },
                            {
                                amount: amount,
                                category_id: categories.name,
                                date: date,
                                description: description,
                                merchant: merchant,
                                payment_type: payment_type,
                                sub_category_id: sub_category_id,
                                type: type,
                                tags: tags
                            },
                            {
                                new: true,
                                runValidator: true,
                                useFindAndModify: false
                            }
                        );
                        let resp = {
                            status: 200,
                            message: "Transaction updated",
                            armessage: `تم تحديث العملية`,
                            account: transaction_
                        }

                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    }
                }
                else if (amount == transaction.amount) {
                    const budget = await Budget.findByIdAndUpdate({ _id: update_budget.id },
                        { remaining_amount: update_budget.remaining_amount }, {
                        new: true,
                        runValidator: true,
                        useFindAndModify: false
                    });
                    const transaction_ = await Transaction.findByIdAndUpdate(
                        { _id: transaction_id },
                        {
                            amount: amount,
                            category_id: categories.name,
                            date: date,
                            description: description,
                            merchant: merchant,
                            payment_type: payment_type,
                            sub_category_id: sub_category_id,
                            type: type,
                            tags: tags
                        },
                        {
                            new: true,
                            runValidator: true,
                            useFindAndModify: false
                        }
                    );
                    let resp = {
                        status: 200,
                        message: "Transaction updated",
                        armessage: `تم تحديث العملية`,
                        account: transaction_
                    }

                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }
            }
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: `Error while updating transaction`,
            armessage: `خطأ أثناء تحديث العملية`,
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.deleteTransactions = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let transaction_id = cred.id
        const transaction_with_given_id = await Transaction.findById({ _id: transaction_id });
        if (transaction_with_given_id) {
            // let budget_in_this_transaction = await Budget.findById({ _id: transaction_with_given_id.budget_id});
            if (transaction_with_given_id.type == 'Expense') {
                let currentDate = new Date();
                let current_month = currentDate.getMonth();
                let current_year = currentDate.getFullYear();
                let month_array = ['january', 'february', 'march', 'april'
                    , 'may', 'june', 'july', 'august'
                    , 'september', 'october', 'november', 'december'];

                const budget = await Budget.findById({ _id: transaction_with_given_id.budget_id });
                if (budget) {
                    const updated_budget = await Budget.findByIdAndUpdate({ _id: budget.id }, { remaining_amount: budget.remaining_amount + transaction_with_given_id.amount }, {
                        new: true,
                        runValidator: true,
                        useFindAndModify: false
                    });
                }
                else {
                    // console.log('Budget Not found of month, ' + current_month);
                }
            }
        }
        const transaction = await Transaction.findByIdAndDelete(transaction_id);
        if (transaction) {
            resp = {
                status: 200,
                message: "Transaction deleted",
                armessage: `تم حذف العملية`
            }
            res.status(201).json({
                resp: encrypt(JSON.stringify(resp))
            });

        } else {
            let resp = {
                status: 400,
                message: "Error while deleting transaction",
                armessage: `خطأ أثناء حذف العملية`

            }
            res.status(201).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while deleting transaction",
            armessage: `خطأ أثناء حذف العملية`
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.uuudd = asyncHandler(async (req, res, next) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate({ _id: req.params.id }, { tags: [] });
        res.status(200).json({
            status: 'ok'
        })
    } catch (err) {
        next(err);
    }
});
exports.transactionByRange = asyncHandler(async (req, res, next) => {
    try {
        let { from, to } = req.body;
        const transactions_ = await Transaction.find({
            user_id: req.user.id, type: "Expense", date: {
                $gte: new Date(from),
                $lte: new Date(to)
            }
        });

        let resp = {
            status: 200,
            count: transactions_.length,
            transactions: transactions_,
            categories: [],
            tags: [],
            budget_categories: []
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

