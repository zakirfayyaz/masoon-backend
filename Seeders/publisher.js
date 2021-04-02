const asyncHandler = require('../middleware/async');
const User = require('../models/users_model');

exports.seedPublishers = asyncHandler(async (req, res, next) => {

    try {

    }
    catch (err) {
        next(err);
    }
})