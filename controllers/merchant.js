const asyncHandler = require("../middleware/async");
const Merchant = require("../models/merchant");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");

exports.createMerchant = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let mer_name = cred.name;
        const merchants_existance_check = await Merchant.find({ name: mer_name, user_id: req.user.id });
        if (merchants_existance_check.length > 0) {
            let resp = {
                status: 400,
                message: 'Merchant already exists',
                armessage: `المتجر موجود بالفعل`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            const merchant = await Merchant.create({
                name: mer_name,
                user_id: req.user.id
            });

            let resp = {
                status: 200,
                message: 'Merchant created',
                armessage: 'تم إنشاء المتجر'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewMerchants = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        const merchants = await Merchant.find({ user_id: id });
        let resp = {
            status: 200,
            count: merchants.length,
            data: merchants
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
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});