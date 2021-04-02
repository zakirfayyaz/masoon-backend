const asyncHandler = require("../middleware/async");
exports.verifyUser = asyncHandler(async (req, res, next) => {
    try {
        if (!req.user.id) {
            res.status(200).json({
                status: 400,
                message: false
            })
        }
        else if (req.user.id) {
            res.status(200).json({
                status: 200,
                message: true
            })
        }
    } catch (err) {
        next(err);
    }
})