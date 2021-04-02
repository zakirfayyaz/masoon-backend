const asyncHandler = require("../middleware/async");
const PhoneSms = require("../models/PhoneSms");
const SmsCategories = require("../models/SmsCategories");
const Categories = require('../models/categories')

exports.getCategorizedSmsById = asyncHandler(async (req, res, next) => {
    try {
        const sms = await SmsCategories.find({ user_id: req.user.id, categories: req.params.id });
        res.status(200).json({
            status: 200,
            sms
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            error: err.message
        })
    }
})
exports.createPhone_sms = asyncHandler(async (req, res, next) => {

    var body = req.body

    for (let i = 0; i < body.length; i++) {
        const phone_sms = await PhoneSms.create({
            sms_id: body[i].sms_id,
            _address: body[i]._address,
            _folderName: body[i]._folderName,
            _msg: body[i]._msg,
            _readState: body[i]._readState,
            _time: body[i]._time,
            user_id: req.user.id
        })
    }

    res.status(200).json({
        status: 200
    })
})
exports.categorizeSms = asyncHandler(async (req, res, next) => {

    var { sms_id, amount, categories, subcategories } = req.body;
    try {
        const phone_sms = await PhoneSms.findById({ _id: sms_id });
        const phone_sms_ = await SmsCategories.create({
            _address: phone_sms._address,
            _folderName: phone_sms._folderName,
            _msg: phone_sms._msg,
            _readState: phone_sms._readState,
            _time: phone_sms._time,
            user_id: req.user.id,
            categories: categories,
            subcategories: subcategories,
            amount: amount,
            sms_id: sms_id
        });
        res.status(200).json({
            status: 200,
            message: 'SMS categorized'
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            error: err.message
        })
    }
})
exports.getCategorizeSms = asyncHandler(async (req, res, next) => {
    try {
        let categories = [];
        const sms = await SmsCategories.find({ user_id: req.user.id });
        const cat = await Categories.find();
        for (let i = 0; i < sms.length; i++) {
            categories.push(sms[i].categories);
        }

        let unique_categories = [...new Set(categories)];
        let cat_with_name = [];

        for (let i = 0; i < cat.length; i++) {
            for (let j = 0; j < unique_categories.length; j++) {
                if (unique_categories[j] == cat[i].id) {
                    cat_with_name.push({ category: cat[i].name, id: unique_categories[j] });
                }
            }
        }

        let unique_sms = [];
        let total_ = 0;
        for (let i = 0; i < cat_with_name.length; i++) {
            total = 0;
            for (let j = 0; j < sms.length; j++) {
                if (sms[j].categories == cat_with_name[i].id) {
                    total++
                }
            }
            unique_sms.push({ id: cat_with_name[i].id, category: cat_with_name[i].category, count: total });
        }

        res.status(200).json({
            status: 200,
            unique_sms
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            error: err.message
        })
    }
})
exports.readSms = asyncHandler(async (req, res, next) => {
    const sms_id = req.params.sms_id
    try {
        const deleteSms = await PhoneSms.findByIdAndUpdate({ _id: sms_id }, { status: 'Read' }, { new: true, useFindAndModify: false });
        res.status(200).json({
            status: 200,
            message: 'SMS categorized'
        });
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            error: err.message
        })
    }
})
exports.getPhoneSms = asyncHandler(async (req, res, next) => {
    try {
        const phone_sms = await PhoneSms.find({ user_id: req.user.id });
        res.status(200).json({
            status: 200,
            phone_sms
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            error: err.message
        })
    }
})
exports.deleteAllPhoneSms = asyncHandler(async (req, res, next) => {
    try {
        const phone_sms = await PhoneSms.find({ user_id: req.user.id, status: 'Unread' });

        for (let i = 0; i < phone_sms.length; i++) {
            const delete_sms = await PhoneSms.findByIdAndDelete({ _id: phone_sms[i].id });
        }
        res.status(200).json({
            status: 200,
            message: 'Messages Removed'
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            error: err.message
        })
    }
})