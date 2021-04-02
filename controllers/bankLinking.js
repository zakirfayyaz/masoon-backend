const asyncHandler = require("../middleware/async");
const Bank = require("../models/Banks");
const Account = require("../models/accounts");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");

exports.linkAccount = asyncHandler(async (req, res, next) => {
    try {
        const { name } = req.body;
        let cred = decrypt(name)
        let credentials = JSON.parse(cred);
        let { account_id, account_no } = credentials;
        const account = await Account.findById({ _id: account_id })
        const user_banks = await Bank.find({ bank_id: account_id, user_id: req.user.id });
        if (user_banks.length > 0) {
            let resp = {
                status: 400,
                message: "Bank Already Linked",
                armessage: `تم ربط البنك مُسبقاً`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else {
            const bank = await Bank.create({
                user_id: req.user.id,
                bank_id: account.id,
                account_no,
                bank_name: account.name,
                user_name: req.user.firstname + ' ' + req.user.lastname,
                user_phone: req.user.phone_number,
                bank_logo: account.logo,
                bank_url: account.url
            })
            let resp = {
                status: 200,
                message: "Bank Account Linked",
                armessage: `تم ربط الحساب البنكي`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while linking bank",
            armessage: 'خطأ أثناء ربط البنك'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.getBanks = asyncHandler(async (req, res, next) => {
    try {
        const banks = await Bank.find({ user_id: req.user.id });
        let resp = {
            status: 200,
            banks
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: `خطأ أثناء جلب البيانات`
        }
        res.status(400).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.deleteBank = asyncHandler(async (req, res, next) => {
    try {
        const banks = await Bank.findByIdAndDelete({ _id: req.params.id });
        console.log(banks);
        res.status(200).json({
            status: 200,
            message: 'Bank successfully deleted',
            armessage: `تم حذف الارتباط البنكي بنجاح`
        });
    } catch (err) {
        next(err);
        res.status(400).json({
            status: 200,
            message: 'Error while deleting bank',
            armessage: `خطأ أثناء حذف الحساب المصرفي`
        });
    }
});
