const asyncHandler = require("../../middleware/async");
const encrypt = require("../../middleware/GenerateAESKeys");
const Cashflow = require("../../models/Cashflow");

exports.checkCashFlow = asyncHandler(async (req, res, next) => {
    try {
        const cashflow = await Cashflow.find();
        if (cashflow[0].enabled == "false") {
            let resp = {
                status: 200,
                message: "false"
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 200,
                message: "true"
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
exports.toggleCashFlow = asyncHandler(async (req, res, next) => {
    try {
        const cashflow = await Cashflow.find();
        if (cashflow[0].enabled == "false") {
            const updateCashFlow = await Cashflow.findByIdAndUpdate(
                { _id: cashflow[0].id },
                { enabled: "true" },
                { new: true, useFindAndModify: false }
            )
            if (updateCashFlow) {
                let resp = {
                    status: 200,
                    message: "Cashflow section enabled",
                    armessage: `تم تمكين قسم التدفق النقدي`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while updating Cashflow",
                    armessage: `خطأ أثناء تحديث التدفق المالي`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        } else {
            const updateCashFlow = await Cashflow.findByIdAndUpdate(
                { _id: cashflow[0].id },
                { enabled: "false" },
                { new: true, useFindAndModify: false }
            )
            if (updateCashFlow) {
                let resp = {
                    status: 200,
                    message: "Cashflow section disabled",
                    armessage: `قسم التدفق النقدي معطل`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while updating Cashflow",
                    armessage: 'خطأ أثناء تحديث التدفق المالي'
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
            message: "Error while updating Cashflow",
            armessage: 'خطأ أثناء تحديث التدفق المالي'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});

