let usersData = require('./jsonFiles/users');
let cashflowsData = require('./jsonFiles/cashflows');
let categoriesData = require('./jsonFiles/categories');
let sub_categoriesData = require('./jsonFiles/sub_categories');
let packagesData = require('./jsonFiles/packages');
let merchantsData = require('./jsonFiles/merchants');
const mongoose = require('mongoose');

exports.createUsersSeeder = async (req, res, next) => {
    try {
        let UserModel = require('../../models/users_model');
        let Cashflow = require('../../models/Cashflow');
        let Category = require('../../models/categories');
        let SubCategory = require('../../models/sub_categories');
        let Package = require('../../models/packages');
        let Account = require('../../models/accounts')
        let Income = require('../../models/Income');
        // await removeDecimals()

        let months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        let years = [2020, 2021];

        let failed = false;
        let cahsFlowEntry = await Cashflow.create(cashflowsData[0]);
        const account = await Account.create({
            name: "Habib Metro",
            url: 'www.google.com'
        });
        for (let package of packagesData) {
            let packageCheck = await Package.findOne({ name: package.name });
            if (packageCheck) {
                // cdajs
            } else {
                let newPackage = await Package.create(package);
                if (newPackage) {
                    failed = false
                } else {
                    failed = true;
                }
            }
        }
        for (let user of usersData) {
            let categoriesData2 = await Category.find();
            let checkUser = await UserModel.findOne({ email: user.email })
            if (checkUser) {
                // 
            } else {
                let newUsers = await UserModel.create(user);
                if (newUsers && newUsers.roll == 'User' && newUsers.email == 'masoonuser@gmail.com') {
                    let Bank = require('../../models/Banks');
                    const linkAccount = await Bank.create({
                        user_id: newUsers.id,
                        bank_id: account.id,
                        account_no: '111111111',
                        bank_name: account.name,
                        user_name: newUsers.firstname + ' ' + newUsers.lastname,
                        user_phone: newUsers.phone_number,
                        bank_logo: null,
                        bank_url: account.url
                    })
                    if (linkAccount) {

                        for (let year of years) {
                            for (let l = 0; l < months.length; l++) {
                                if (year == 2021 && l > 2) {
                                    // failed = true;
                                } else {
                                    var incomeAmounts = [20000, 30000, 10000, 50000, 5000, 4000, 1000];
                                    let incomeTitles = ['Income1', 'Income2', 'Income3'];
                                    for (let i = 0; i < 3; i++) {
                                        let randomAmount = incomeAmounts[Math.floor(Math.random() * incomeAmounts.length)];
                                        let income = await Income.create({
                                            title: incomeTitles[i],
                                            user_id: newUsers.id,
                                            month: months[l],
                                            year: year,
                                            amount: randomAmount,
                                            createdAt: new Date()
                                        })
                                        if (income) {

                                        } else {
                                            failed = true;
                                        }
                                    }
                                    if (failed != true) {
                                        const Budget = require('../../models/budgets');
                                        let income_ = await Income.find({ user_id: newUsers.id, month: months[l], year: year });
                                        let totalIncomeForThisMonth = income_.reduce((n, { amount }) => n + amount, 0);
                                        let budgetAmounts = [
                                            totalIncomeForThisMonth * 0.12,
                                            totalIncomeForThisMonth * 0.10,
                                            totalIncomeForThisMonth * 0.11,
                                            totalIncomeForThisMonth * 0.13,
                                            totalIncomeForThisMonth * 0.11,
                                            totalIncomeForThisMonth * 0.11,
                                            totalIncomeForThisMonth * 0.14,
                                            totalIncomeForThisMonth * 0.12];
                                        for (let i = 0; i < 7; i++) {
                                            // var randomAmount = incomeAmounts[Math.floor(Math.random() * incomeAmounts.length)];
                                            const budget = await Budget.create({
                                                user_id: newUsers.id,
                                                month: months[l],
                                                year,
                                                category_id: categoriesData2[i].name,
                                                amount: budgetAmounts[i],
                                                remaining_amount: budgetAmounts[i]
                                            });
                                            if (budget) {
                                                let Merchant = await require('../../models/merchant');
                                                for (let k = 0; k < merchantsData.length; k++) {
                                                    let merchCheck = await Merchant.findOne({ user_id: newUsers.id, name: merchantsData[k] });
                                                    if (merchCheck) {
                                                        // 
                                                    } else {
                                                        let newMerchant = await Merchant.create({
                                                            name: merchantsData[k],
                                                            user_id: newUsers.id
                                                        });
                                                        console.log(k, 'created')
                                                        if (newMerchant) {
                                                            // 
                                                        } else {
                                                            failed = true;
                                                        }
                                                    }
                                                }
                                                if (failed != true) {
                                                    let Transaction = require('../../models/transactions');
                                                    // let transactionAmounts = [budget.amount * 0.41, budget.amount * 0.48];
                                                    let subCategoriesArray = await SubCategory.find({ category_id: categoriesData2[i].id });
                                                    let merchantsArray = await Merchant.find({ user_id: newUsers.id })
                                                    if (subCategoriesArray.length > 0) {
                                                        let datesArray = [4, 6, 12, 13, 17, 19, 22, 29]
                                                        let monthNumber = 0;
                                                        if (months[l] == 'january') {
                                                            monthNumber = 0
                                                        } else if (months[l] == 'february') {
                                                            monthNumber = 1
                                                        } else if (months[l] == 'march') {
                                                            monthNumber = 2
                                                        } else if (months[l] == 'april') {
                                                            monthNumber = 3
                                                        } else if (months[l] == 'may') {
                                                            monthNumber = 4
                                                        } else if (months[l] == 'june') {
                                                            monthNumber = 5
                                                        } else if (months[l] == 'july') {
                                                            monthNumber = 6
                                                        } else if (months[l] == 'august') {
                                                            monthNumber = 7
                                                        } else if (months[l] == 'september') {
                                                            monthNumber = 8
                                                        } else if (months[l] == 'october') {
                                                            monthNumber = 9
                                                        } else if (months[l] == 'november') {
                                                            monthNumber = 10
                                                        } else if (months[l] == 'december') {
                                                            monthNumber = 11
                                                        }
                                                        for (let j = 0; j < 2; j++) {
                                                            let randomValue = Math.random() * (0.48 - 0.40) + 0.40;
                                                            const transaction = await Transaction.create({
                                                                category_id: categoriesData2[i].name,
                                                                sub_category_id: subCategoriesArray[0].id,
                                                                budget_id: budget.id,
                                                                type: 'Expense',
                                                                payment_type: 'Cash',
                                                                amount: Math.ceil(budget.amount * randomValue),
                                                                date: new Date(year, monthNumber, datesArray[i]),
                                                                description: `expense from ${subCategoriesArray[0].name}`,
                                                                merchant: merchantsArray[i].name,
                                                                user_id: newUsers.id
                                                            });
                                                            if (transaction) {
                                                                // update budget
                                                                let updateBudget = await Budget.findByIdAndUpdate(
                                                                    {
                                                                        _id: budget.id
                                                                    },
                                                                    {
                                                                        remaining_amount: Math.ceil(budget.remaining_amount - transaction.amount)
                                                                    },
                                                                    { new: true, useFindAndModify: false }
                                                                )
                                                                if (updateBudget) {
                                                                    // 
                                                                } else {
                                                                    failed = true
                                                                }
                                                            } else {
                                                                failed = true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (failed == false) {
            let rem = await removeDecimals()
            if (rem.error) {
                res.status(200).json({
                    message: 'failed'
                })
            } else {
                res.status(200).json({
                    message: 'added'
                })
            }

        } else {
            res.status(400).json({
                message: 'failed'
            })
        }
    } catch (err) {
        next(err);
    }
}

exports.deleteUsersSeeder = async (req, res, next) => {
    try {
        let UserModel = require('../../models/users_model');
        let Cashflow = require('../../models/Cashflow');
        let Category = require('../../models/categories');
        let SubCategory = require('../../models/sub_categories');
        let Package = require('../../models/packages');
        let Account = require('../../models/accounts')
        let Income = require('../../models/Income');
        let Bank = require('../../models/Banks');
        let Budget = require('../../models/budgets');
        let Transaction = require('../../models/transactions');
        let Merchants = require('../../models/merchant');

        const transactions = await Transaction.deleteMany({});
        if (transactions) {
            const accnts = await Account.deleteMany({});
            if (accnts) {
                const pckg = await Package.deleteMany({});
                if (pckg) {
                    const incms = await Income.deleteMany({});
                    if (incms) {
                        const usrs = await UserModel.deleteMany({});
                        if (usrs) {
                            const bnks = await Bank.deleteMany({});
                            if (bnks) {
                                const bdgts = await Budget.deleteMany({});
                                if (bdgts) {
                                    const mrchnts = await Merchants.deleteMany({});
                                    if (mrchnts) {
                                        res.status(200).json({
                                            message: 'added'
                                        })
                                    } else {
                                        res.status(200).json({
                                            message: 'failed'
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        next(err);
    }
}

let removeDecimals = async () => {
    let Budget = require('../../models/budgets');
    let budgets = await Budget.find();

    for (let i = 0; i < budgets.length; i++) {
        if (budgets[i].amount % 1 != 0 || budgets[i].remaining_amount % 1 != 0) {

            let updated = await Budget.findByIdAndUpdate(
                { _id: budgets[i].id },
                { amount: Math.ceil(budgets[i].amount), remaining_amount: Math.ceil(budgets[i].remaining_amount) },
                { new: true, useFindAndModify: false }
            )

        }
    }
}