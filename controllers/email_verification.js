const asyncHandler = require('../middleware/async');
const User = require('../models/users_model');

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      let user = await User.findById({ _id: req.params.id });
      if (user) {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, { status: 'Approved' }, { new: true, useFindAndModify: false });
        res.status(200).json({
          status: 200,
          message: "Email successfully verified"
        })
      }
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while verifying email"
      })
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while verifying email"
    })
  }
});