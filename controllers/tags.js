const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const Tags = require("../models/tags")
const Transaction = require("../models/transactions");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");

exports.createTags = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    // const { name } = req.body;
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));

    if (name == " " || name == null || name == undefined) {
        let resp = {
            status: 400,
            message: 'Please add tag name',
            armessage: 'الرجاء إضافة اسم العلامة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    try {
        const check_tag = await Tags.find({ user_id: req.user.id, name: cred.name });
        if (check_tag.length > 0) {
            let resp = {
                status: 400,
                message: 'Tag already exists',
                armessage: 'العلامة موجودة بالفعل'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            const tag = await Tags.create({
                name: cred.name,
                user_id
            });
            let resp = {
                status: 200,
                message: 'Tag created',
                armessage: 'تم إنشاء العلامة'
            }
            res.status(201).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while creating tag',
            armessage: 'خطأ أثناء إنشاء العلامة'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.viewTags = asyncHandler(async (req, res, next) => {
    const tags = await Tags.find();
    let resp = {
        success: "Tag(s) Found",
        count: tags.length,
        status: 200,
        tags: tags
    }

    res.status(201).json({
        resp: encrypt(JSON.stringify(resp))
    });
});
exports.viewTagsofCurrentUser = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    const tags = await Tags.find({ user_id: id });
    let resp = {
        success: "Tag(s) Found",
        count: tags.length,
        status: 200,
        tags: tags
    }
    res.status(201).json({
        resp: encrypt(JSON.stringify(resp))
    });
});
exports.deleteTag = asyncHandler(async (req, res, next) => {
    const tags = await Tags.findByIdAndDelete(req.params.id);
    const transaction = await Transaction.find({ user_id: req.user.id });
    if (transaction.length > 0) {
        for (let i = 0; i < transaction.length; i++) {
            for (let j = 0; j < tags.length; j++) {
                if (tags[j] === transaction[i].tags[j]) {
                    transaction[i].tags[j].splice(j, 1)
                }
            }
        }
    }
    if (!tags) {
        return next(
            res.status(201).json({
                status: 200,
                success: `Tag Not found with given ID :${req.params.id}`
            }))
    }
    res.status(201).json({
        status: 200,
        success: "Tag deleted"
    });
});

