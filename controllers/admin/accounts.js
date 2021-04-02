const fs = require('fs');
const Account = require('../../models/accounts')
const asyncHandler = require("../../middleware/async");
const encrypt = require('../../middleware/GenerateAESKeys');
const decrypt = require('../../middleware/GenerateRSAKeys');
// const e = require('express');
const checkEmpty = require('../../middleware/validation');
const e = require('express');


exports.createAccount = asyncHandler(async (req, res, next) => {
    const { name, url } = req.body;
    try {
        // if (checkEmpty(name) || checkEmpty(url)) {
        //     let resp = {
        //         status: 400,
        //         message: 'Please fill all required fields',
        //         armessage: `يرجى تعبئة جميع الحقول المطلوبة`
        //     }
        //     res.status(200).json({
        //         resp: encrypt(JSON.stringify(resp))
        //     })
        // } else {
        const account = await Account.create({
            name: JSON.parse(decrypt(name)),
            url: JSON.parse(decrypt(url)),
            logo: req.file.path.replace("\\", "/")
        });

        if (account) {
            let resp = {
                status: 200,
                message: 'Account created successfully',
                armessage: `تم إنشاء الحساب`,
                account
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 400,
                message: 'Error while creating account',
                armessage: `خطأ أثناء إنشاء الحساب`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        // }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while creating account',
            armessage: `خطأ أثناء إنشاء الحساب`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getAccounts = asyncHandler(async (req, res, next) => {
    try {
        const accounts = await Account.find();
        if (accounts) {
            let resp = {
                status: 200,
                accounts
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else {
            let resp = {
                status: 200,
                accounts: []
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }


});
exports.getAccountbyId = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const account = await Account.findById({ _id: cred.bank_id });
        if (account) {
            let resp = {
                status: 200,
                account
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            let resp = {
                status: 200,
                message: 'Account not found',
                armessage: 'الحساب غير موجود'
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
exports.getAccountbyIdAndUpdate = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        if (cred.name == " " || cred.name == null || cred.name == undefined || cred.url == undefined || cred.url == null || cred.url == " ") {
            let resp = {
                status: 400,
                message: 'Please fill all required fields',
                armessage: `يرجى تعبئة جميع الحقول المطلوبة`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            const updated_account = await Account.findByIdAndUpdate(
                { _id: cred.bank_id },
                { name: cred.name, url: cred.url },
                { new: true, useFindAndModify: false });
            if (updated_account) {
                let resp = {
                    status: 200,
                    updated_account
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
            else {
                let resp = {
                    status: 200,
                    message: `Error while updating bank information`,
                    armessage: `خطأ أثناء تحديث معلومات البنك`
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
            message: 'Error while updating bank information',
            armessage: `خطأ أثناء تحديث معلومات البنك`
        }
        res.status(200).json({

        })
    }
});
exports.getAccountbyIdAndDelete = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        const updated_account = await Account.findByIdAndDelete({ _id: cred.bank_id });
        if (updated_account) {
            let resp = {
                status: 200,
                message: 'Account deleted successfully.',
                armessage: 'تم حذف الحساب بنجاح'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 400,
                message: 'Error while deleting bank account',
                armessage: `خطأ أثناء حذف الحساب المصرفي`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while deleting bank account',
            armessage: `خطأ أثناء حذف الحساب المصرفي`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.addLogo = asyncHandler(async (req, res, next) => {
    try {
        let { bank_id } = req.body
        let cred = JSON.parse(decrypt(bank_id));
        // console.log(cred)
        const account = await Account.findById({ _id: cred.id });
        const path = account.logo
        // console.log(path);
        if (path === req.file.path) {
            let resp = {
                status: 200,
                message: 'File updated',
                armessage: 'تمت إزالة الملف بنجاح وتحديثه'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            if (fs.existsSync(path)) {
                await fs.unlink(path, async (err) => {
                    if (err) {
                        console.log(err)
                        let resp = {
                            status: 400,
                            message: `Error while updating bank information`,
                            armessage: `خطأ أثناء تحديث معلومات البنك`
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                    else {
                        await Account.findByIdAndUpdate({ _id: cred.id }, { logo: req.file.path.replace("\\", "/") }, { new: true, useFindAndModify: false }).then((account) => {
                            account
                        }).catch((err) => {
                            console.log(err)
                        })
                        let resp = {
                            status: 200,
                            message: 'File updated'
                        }
                        res.status(200).json({
                            resp: encrypt(JSON.stringify(resp))
                        })
                    }
                })
            } else {
                await Account.findByIdAndUpdate({ _id: cred.id }, { logo: req.file.path.replace("\\", "/") }, { new: true, useFindAndModify: false }).then((account) => {
                    account
                }).catch((err) => {
                    console.log(err)
                })
                let resp = {
                    status: 200,
                    message: 'File updated'
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
            message: 'Error while updating bank logo',
            armessage: `خطأ أثناء تحديث شعار البنك`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.activateBank = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const account = await Account.findByIdAndUpdate(
            { _id: cred.bank_id },
            { status: "Active" },
            { new: true, useFindAndModify: false }
        );

        if (account) {
            let resp = {
                status: 200,
                message: "Bank activated",
                armessage: 'تفعيل الارتباط البنكي'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            let resp = {
                status: 400,
                message: "Error while activating bank account",
                armessage: 'خطأ أثناء تفعيل البنك'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while activating bank account",
            armessage: 'خطأ أثناء تفعيل البنك'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.deActivateBank = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const account = await Account.findByIdAndUpdate(
            { _id: cred.bank_id },
            { status: "Blocked" },
            { new: true, useFindAndModify: false }
        );
        if (account) {
            let resp = {
                status: 200,
                message: "Bank Suspended",
                armessage: 'تم إيقاف الارتباط البنكي'
            }

            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            let resp = {
                status: 400,
                message: "Error while deactivating bank account",
                armessage: `خطأ أثناء إيقاف تفعيل البنك`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while deactivating bank account",
            armessage: `خطأ أثناء إيقاف تفعيل البنك`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});

