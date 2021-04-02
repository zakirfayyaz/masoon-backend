const asyncHandler = require("../middleware/async");
const Budget = require('../models/budgets');
const Categories = require("../models/categories");
const User = require("../models/users_model");
const Income = require("../models/Income");
const { numberToArabic } = require('number-to-arabic');
const decrypt = require("../middleware/GenerateRSAKeys");
const encrypt = require("../middleware/GenerateAESKeys");
const mongoose = require("mongoose");


exports.createBudget = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    var { category_id, amount, month, year } = cred;
    amount = Number(amount);
    var month_ = month.toLowerCase()
    var amount_ = Number(amount);

    const categoryName = await Categories.findById({ _id: category_id });
    const budgets = await Budget.findOne({ user_id, category_id: categoryName.name, month: month_, year: year });
    const budgets_ = await Budget.find({ user_id: req.user.id, month: month_, year: year });
    const income_ = await Income.find({ user_id: req.user.id, month: month_, year: parseInt(year) });
    let income = 0;
    income = income_.reduce((n, { amount }) => n + amount, 0)
    let total = 0;
    const total_of_all_budgets = budgets_.filter((budget) => total = total + budget.amount);
    if (income == 0) {
        let resp = {
            status: 201,
            message: "Please add your income first and then add budget",
            armessage: 'الرجاء إضافة دخلك أولا ثم إضافة الميزانية'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } else if (income < total + amount_) {
        let resp = {
            status: 202,
            message: `You are exceeding your income limit, please add a budget lower than ${income}`,
            armessage: `لقد تجاوزت حد الدخل الخاص بك، يرجى إضافة ميزانية أقل من ${income} ريال`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } else {
        let remaining_amount = amount_
        if (!budgets) {
            try {
                const budget = await Budget.create({
                    user_id,
                    month: month_,
                    year,
                    category_id: categoryName.name,
                    amount: amount_,
                    remaining_amount
                });

                let resp = {
                    status: 200,
                    message: "Budget Created",
                    armessage: 'تم إنشاء الميزانية'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            } catch (err) {
                let resp = {
                    status: 400,
                    message: 'Error while creating budget',
                    armessage: 'خطأ أثناء إنشاء الميزانية'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }
        else {
            try {
                const budget = await Budget.findByIdAndUpdate({ _id: budgets.id },
                    { amount: budgets.amount + amount_, remaining_amount: budgets.remaining_amount + amount_ });
                let resp = {
                    status: 200,
                    message: "Budget details updated",
                    armessage: 'تم تحديث تفاصيل الميزانية'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            } catch (err) {
                let resp = {
                    status: 400,
                    message: 'Error while creating budget',
                    armessage: 'خطأ أثناء إنشاء الميزانية'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }
    }
});
exports.viewBudgets = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let cur_month = cred.month;
        let cur_year = cred.year;
        // let cur_month = req.body.month;
        // let cur_year = req.body.year;

        // console.log(`year : ${req.params.year}`);
        let Date_joined = new Date;

        const user = await User.findById(id);
        Date_joined = user.createdAt;
        let month = Date_joined.getMonth() + 1;
        let year = Date_joined.getFullYear();

        let month_ = cur_month;
        // month_ = month_.toLowerCase();

        // const budgets = await Budget.find({ user_id: id, month: month_, year: cur_year });
        let budgets = await Budget.aggregate([
            { $match: { "user_id": mongoose.Types.ObjectId(id), "month": cur_month, "year": parseInt(cur_year) } },
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

        if (budgets.length === 0) {
            let resp_ = {
                status: "200",
                count: 0,
                Budget: [],
                Date_joined_Month: month,
                Date_joined_Year: year
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp_)),
            });
        }
        else {
            let resp_ = {
                status: "200",
                count: budgets.length,
                Budget: budgets,
                Date_joined_Month: month,
                Date_joined_Year: year
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp_)),
            });
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching data',
            armessage: `خطأ أثناء جلب البيانات`

        });
    }
});
exports.copyBudget = asyncHandler(async (req, res, next) => {
    try {
        let month_array = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const length = month_array.length;
        const date = new Date();
        let previousMonth = date.getMonth();
        let current_year = date.getFullYear();

        let income = await Income.find({ user_id: req.user.id, month: month_array[previousMonth], year: current_year });
        if (income.length > 0) {
            const budget_in_this_month = await Budget.find({ user_id: req.user.id, month: month_array[previousMonth], year: current_year })
            if (budget_in_this_month.length == 0) {
                // console.log('1')
                if (previousMonth == 0) {
                    // console.log('2');
                    const budget = await Budget.find({ user_id: req.user.id, month: month_array[11], year: current_year - 1 });
                    // console.log(budget);
                    if (budget.length > 0) {
                        for (let i = 0; i < budget.length; i++) {
                            const create_budget = await Budget.create({
                                user_id: req.user.id,
                                month: month_array[previousMonth],
                                year: current_year,
                                amount: budget[i].amount,
                                remaining_amount: budget[i].amount,
                                category_id: budget[i].category_id
                            })
                        }
                    }
                    let resp = {
                        status: 200,
                        message: 'Budget copied successfully',
                        armessage: 'تم نسخ الميزانية بنجاح'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                } else {
                    const budget = await Budget.find({ user_id: req.user.id, month: month_array[previousMonth - 1], year: current_year })
                    // console.log(budget);

                    if (budget.length > 0) {
                        for (let i = 0; i < budget.length; i++) {
                            const create_budget = await Budget.create({
                                user_id: req.user.id,
                                month: month_array[previousMonth],
                                year: budget[i].year,
                                amount: budget[i].amount,
                                remaining_amount: budget[i].amount,
                                category_id: budget[i].category_id
                            })
                        }
                    }

                    let resp = {
                        status: 200,
                        message: 'Budget copied successfully',
                        armessage: 'تم نسخ الميزانية بنجاح'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    })
                }
            } else {
                let resp = {
                    status: 200,
                    message: 'Budget exists',
                    armessage: `تم إضافة الميزانية مُسبقاً`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        } else {
            let resp = {
                status: 400,
                message: 'Add income first for this month',
                armessage: `أضف الدخل لهذا الشهر أولاً`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    }
    catch (err) {
        let resp = {
            status: 200,
            message: "Error while processing request",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.deleteBudget = asyncHandler(async (req, res, next) => {
    try {

        const budget = await Budget.find();

        let total = 0;
        for (let i = 0; i < budget.length; i++) {
            if (budget[i].remaining_amount < 0) {
                const delete_budget = await Budget.findByIdAndDelete({ _id: budget[i].id });
                total++
            }
        }
        res.status(200).json({
            status: 200,
            budget: total
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: "Error while processing request",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.editBudget = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { category_id, amount, id } = cred
        let input_amount = amount
        let month_array = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        let totalOfAllBudgets = 0;
        let totalOfAllIncomes = 0;
        let allBudgets = await Budget.find(
            {
                user_id: req.user.id,
                month: month_array[new Date().getMonth()],
                year: new Date().getFullYear()
            });
        let allIncomes = await Income.find(
            {
                user_id: req.user.id,
                month: month_array[new Date().getMonth()],
                year: new Date().getFullYear()
            });
        if (allBudgets.length > 0 && allIncomes.length > 0) {
            let total = 0
            totalOfAllBudgets = allBudgets.filter((budget) => {
                budget.id !== id ?
                    total = total + budget.amount : null
            }
            );
            totalOfAllIncomes = allIncomes.reduce((n, { amount }) => n + amount, 0)
            if (totalOfAllIncomes < total + amount) {
                let resp = {
                    status: 400,
                    message: `You are exceeding your income limit, please add a budget lower than ${totalOfAllIncomes}`,
                    armessage: `لقد تجاوزت حد الدخل الخاص بك، يرجى إضافة ميزانية أقل من دخلك`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            } else {
                const category = await Categories.findById({ _id: category_id });
                if (category) {
                    const budget_ = await Budget.findById({ _id: id });
                    if (budget_) {
                        if (budget_.category_id == category.name) {
                            if (budget_.amount == budget_.remaining_amount) {
                                console.log('222222222')
                                let updated_amount = input_amount - budget_.amount
                                const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                    category_id: category.name,
                                    amount: input_amount,
                                    remaining_amount: input_amount
                                }, {
                                    new: true,
                                    runValidator: true,
                                    useFindAndModify: false
                                });

                                let checkUpdatedBudget = await Budget.findById({ _id: budget_.id });
                                if ((checkUpdatedBudget.remaining_amount / checkUpdatedBudget.amount) * 100 > 30) {
                                    let updateForHalfNotified = await Budget.findByIdAndUpdate(
                                        { _id: checkUpdatedBudget.id },
                                        { notified_for_quarter: false, notified_for_half: false },
                                        { new: true, useFindAndModify: false }
                                    )
                                } else if ((checkUpdatedBudget.remaining_amount / checkUpdatedBudget.amount) * 100 > 50) {
                                    let updateForHalfNotified = await Budget.findByIdAndUpdate(
                                        { _id: checkUpdatedBudget.id },
                                        { notified_for_quarter: false, notified_for_half: false },
                                        { new: true, useFindAndModify: false }
                                    )
                                }

                                let resp = {
                                    status: 200,
                                    message: "Budget updated",
                                    armessage: 'تم تحديث الميزانية'
                                }
                                res.status(200).json({
                                    resp: encrypt(JSON.stringify(resp))
                                });
                            } else if (budget_.amount > budget_.remaining_amount) {
                                if (input_amount > budget_.amount) {
                                    let updated_amount = input_amount - budget_.amount
                                    const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                        amount: input_amount,
                                        remaining_amount: budget_.remaining_amount + updated_amount
                                    }, {
                                        new: true,
                                        runValidator: true,
                                        useFindAndModify: false
                                    });
                                } else if (input_amount == budget_.amount) {
                                    const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                        amount: input_amount
                                    }, {
                                        new: true,
                                        runValidator: true,
                                        useFindAndModify: false
                                    });
                                } else if (input_amount < budget_.amount) {
                                    let updated_amount = budget_.amount - input_amount;
                                    const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                        amount: input_amount,
                                        remaining_amount: budget_.remaining_amount - updated_amount
                                    }, {
                                        new: true,
                                        runValidator: true,
                                        useFindAndModify: false
                                    });
                                }
                                let resp = {
                                    status: 200,
                                    message: "Budget updated",
                                    armessage: 'تم تحديث الميزانية'
                                }
                                res.status(200).json({
                                    resp: encrypt(JSON.stringify(resp))
                                });
                            }
                        } else {
                            let date = new Date();
                            let month = month_array[date.getMonth()];
                            let year = date.getFullYear();
                            let checkIfCategoryExists = await Budget.find({ user_id: req.user.id, category_id: category.name, month: month, year: year });
                            if (checkIfCategoryExists.length > 0) {
                                let resp = {
                                    status: 200,
                                    message: "Budget already exists for this category",
                                    armessage: `تم إضافة الميزانية مُسبقاً لهذه الفئة`
                                }
                                res.status(200).json({
                                    resp: encrypt(JSON.stringify(resp))
                                });
                            } else {
                                if (budget_.amount == budget_.remaining_amount) {
                                    console.log('222222222')
                                    let updated_amount = input_amount - budget_.amount
                                    const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                        category_id: category.name,
                                        amount: input_amount,
                                        remaining_amount: input_amount
                                    }, {
                                        new: true,
                                        runValidator: true,
                                        useFindAndModify: false
                                    });
                                    let resp = {
                                        status: 200,
                                        message: "Budget updated",
                                        armessage: 'تم تحديث الميزانية'
                                    }
                                    res.status(200).json({
                                        resp: encrypt(JSON.stringify(resp))
                                    });
                                } else if (budget_.amount > budget_.remaining_amount) {
                                    if (input_amount > budget_.amount) {
                                        let updated_amount = input_amount - budget_.amount
                                        const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                            category_id: category.name,
                                            amount: input_amount,
                                            remaining_amount: budget_.remaining_amount + updated_amount
                                        }, {
                                            new: true,
                                            runValidator: true,
                                            useFindAndModify: false
                                        });
                                    } else if (input_amount == budget_.amount) {
                                        const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                            category_id: category.name,
                                            amount: input_amount
                                        }, {
                                            new: true,
                                            runValidator: true,
                                            useFindAndModify: false
                                        });
                                    } else if (input_amount < budget_.amount) {
                                        let updated_amount = budget_.amount - input_amount;
                                        const budget = await Budget.findByIdAndUpdate({ _id: budget_.id }, {
                                            category_id: category.name,
                                            amount: input_amount,
                                            remaining_amount: budget_.remaining_amount - updated_amount
                                        }, {
                                            new: true,
                                            runValidator: true,
                                            useFindAndModify: false
                                        });
                                    }
                                    let resp = {
                                        status: 200,
                                        message: "Budget updated",
                                        armessage: 'تم تحديث الميزانية'
                                    }
                                    res.status(200).json({
                                        resp: encrypt(JSON.stringify(resp))
                                    });
                                }
                            }
                        }
                    } else {
                        let resp = {
                            status: 400,
                            message: "Error while updating budget",
                            armessage: 'خطأ أثناء تحديث الميزانية'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        });
                    }
                } else {
                    let resp = {
                        status: 400,
                        message: "Error while updating budget",
                        armessage: 'خطأ أثناء تحديث الميزانية'
                    }
                    res.status(200).json({
                        resp: encrypt(JSON.stringify(resp))
                    });
                }
            }


        } else {
            let resp = {
                status: 400,
                message: "Error while updating budget",
                armessage: 'خطأ أثناء تحديث الميزانية'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while updating budget",
            armessage: 'خطأ أثناء تحديث الميزانية'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});