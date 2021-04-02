const asyncHandler = require("../middleware/async");
const Categories = require("../models/categories");
const Transaction = require("../models/transactions");
const { numberToArabic } = require('number-to-arabic');
const encrypt = require("../middleware/GenerateAESKeys");

exports.viewCashFlow = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        const transactions = await Transaction.find({ user_id: id });
        let total_expense = 0;
        let total_income = 0;
        let len_ = transactions.length;
        let array = [];
        let array_of_merchants = [];

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
                        amount: array_4[j].amount,
                        ar_amount: numberToArabic(array_4[j].amount)
                    });
                }
            }
        }

        let resp = {
            status: 200,
            Categories: another_array,
            Merchants: array_41
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: `خطأ أثناء جلب البيانات`
        }
        res.status(400).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});

