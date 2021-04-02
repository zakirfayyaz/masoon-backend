const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const Payment_type = require("../models/payment_type");

exports.createPaymentType = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    const payment_type_count = await Payment_type.find();
    const count = payment_type_count.length;
    let _id;
    if (!count === 0) {
        _id = count + 1
    }
    else {
        _id = count
    }
    const { name } = req.body;
    try {
        const payment_type = await Payment_type.create({
            name,
            user_id,
            _id
        });
        res.status(201).json({
            status: 200,
            message: 'Payment type created!',
        });
    } catch (err) {
        next(err);
    }
});
exports.viewPaymentTypes = asyncHandler(async (req, res, next) => {
    const id = req.user.id;
    // console.log(owner_id);
    const payment_types = await Payment_type.find();
    res.status(200).json({
        status: 200,
        count: payment_types.length,
        data: payment_types
    });
});