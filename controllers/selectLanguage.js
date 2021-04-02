const asyncHandler = require('../middleware/async');
const decrypt = require('../middleware/GenerateRSAKeys');
const User = require('../models/users_model')

exports.language = asyncHandler(async (req, res, next) => {
    try {
        const user_ = await User.findById({ _id: req.user.id });
        if (user_.language == 'ar') {
            const user = await User.findByIdAndUpdate(
                { _id: req.user.id },
                { language: "en" },
                { new: true, useFindAndModify: false }
            );
            res.status(200).json({
                status: 200,
                lang: user.language,
                message: "language changed successfully",
                armessage: 'تغيرت اللغة بنجاح'
            })
        } else if (user_.language === "en") {
            const user = await User.findByIdAndUpdate(
                { _id: req.user.id },
                { language: "ar" },
                { new: true, useFindAndModify: false }
            );
            res.status(200).json({
                status: 200,
                lang: user.language,
                message: "language changed successfully",
                armessage: 'تغيرت اللغة بنجاح'
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        })

    }
});
exports.languageChangeForAnyUser = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const user_ = await User.findById({ _id: cred.user_id });
        if (user_.language == 'ar') {
            const user = await User.findByIdAndUpdate(
                { _id: cred.user_id },
                { language: "en" },
                { new: true, useFindAndModify: false }
            );
            res.status(200).json({
                status: 200,
                lang: user.language,
                message: "language changed successfully",
                armessage: 'تغيرت اللغة بنجاح'
            })
        } else if (user_.language === "en") {
            const user = await User.findByIdAndUpdate(
                { _id: cred.user_id },
                { language: "ar" },
                { new: true, useFindAndModify: false }
            );
            let resp = {

            }
            res.status(200).json({
                status: 200,
                lang: user.language,
                message: "language changed successfully",
                armessage: 'تغيرت اللغة بنجاح'
            });
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        })
    }
});
exports.languageChange = asyncHandler(async (req, res, next) => {
    try {
        const users = await User.find();
        for (let i = 0; i < users.length; i++) {
            const user = await User.findByIdAndUpdate({ _id: users[i].id }, { language: 'en' }, { new: true, useFindAndModify: false })
        }
        res.status(200).json({
            status: 200,
            message: "language changed successfully",
            armessage: 'تغيرت اللغة بنجاح'
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        })
    }
});