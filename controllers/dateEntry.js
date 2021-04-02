const asyncHandler = require("../middleware/async");
const Budget = require("../models/budgets");
const Bills = require("../models/bills");
const Transaction = require("../models/transactions");
const Income = require("../models/Income");
const User = require("../models/users_model");
const Payment = require("../models/payment");
const Tag_transaction = require("../models/tag_transaction");

exports.dataEntry = asyncHandler(async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user_id: req.user.id,
      month: "december",
      year: "2020",
    });
    for (let i = 0; i < budgets.length; i++) {
      let date = budgets[i].createdAt;
      const budgets_ = await Budget.findByIdAndUpdate(
        { _id: budgets[i].id },
        {
          month: "december",
          year: "2019",
          createdAt: date.setMonth(11),
          createdAt: date.setYear(2019),
        },
        { new: true, useFindAndModify: false }
      );
    }

    const this_month_transactions = await Transaction.find({
      user_id: req.user.id,
    });
    for (let i = 0; i < this_month_transactions.length; i++) {
      if (this_month_transactions[i].date.getMonth() == 11) {
        const update_this_transaction = await Transaction.findByIdAndUpdate(
          { _id: this_month_transactions[i].id },
          {
            date: this_month_transactions[i].date.setMonth(11),
            date: this_month_transactions[i].date.setYear(2019),
          },
          { new: true, useFindAndModify: false }
        );
      }
    }

    let update_income = await Income.findOne({
      user_id: req.user.id,
      month: "december",
    });
    let update_income_ = await Income.findByIdAndUpdate(
      { _id: update_income.id },
      {
        month: "december",
        year: "2019",
        createdAt: update_income.createdAt.setMonth(11),
        createdAt: update_income.createdAt.setYear(2019),
      },
      { new: true, useFindAndModify: false }
    );
    res.status(200).json({
      status: 200,
      message: "Done",
    });
  } catch (err) {
    next(err);
  }
});
