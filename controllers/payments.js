const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bills = require('../models/bills');
const Payment = require('../models/payment');
const Bill = require('../models/bills');
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");


exports.viewPayment = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  const payment = await (await Payment.find({ user_id: id })).reverse();

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with the id : ${id}`, 200)
    );
  }
  res.status(200).json({
    status: 200,
    data: payment
  });
});
exports.viewPaymentByMonth = asyncHandler(async (req, res, next) => {
  try {
    const payment = await (await Payment.find({ user_id: req.user.id }));
    if (payment.length > 0) {
      let month = req.params.month;
      let year = req.params.year;
      let payments = [];

      for (let i = 0; i < payment.length; i++) {
        if (!(payment[i].createdAt == null || payment[i].createdAt == undefined || !payment[i].createdAt)) {
          if (payment[i].createdAt.getFullYear() == year
            && payment[i].createdAt.getMonth() + 1 == month) {
            payments.push(payment[i]);
          }
        }
      }

      let resp = {
        status: 200,
        data: payments
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        status: 200,
        data: []
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
exports.viewPaymentByDate = asyncHandler(async (req, res, next) => {
  try {
    const payment = await (await Payment.find({ user_id: req.user.id }));
    if (payment.length > 0) {
      let month = req.params.month;
      let year = req.params.year;
      let date = req.params.date - 1;
      let payments = [];

      for (let i = 0; i < payment.length; i++) {
        if (!(payment[i].createdAt == null || payment[i].createdAt == undefined || !payment[i].createdAt)) {
          if (payment[i].createdAt.getFullYear() == year
            && payment[i].createdAt.getMonth() + 1 == month
            && payment[i].createdAt.getDate() == date) {
            payments.push(payment[i]);
          }
        }
      }
      let resp = {
        status: 200,
        data: payments
      }

      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        status: 200,
        data: []
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
exports.unPayBill = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    var { payment_id } = cred;
    const payment = await Payment.findById({ _id: payment_id });
    const bill = await Bill.findById({ _id: payment.bill_id });
    const updateBill = await Bills.findByIdAndUpdate({ _id: payment.bill_id }, { status: 'Due', amount: payment.amount + bill.amount });
    const delPayment = await Payment.findByIdAndDelete({ _id: payment_id });

    let resp = {
      status: 200,
      message: 'Bill unpaid',
      armessage: 'فاتورة غير مدفوعة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while processing request",
      armessage: 'خطأ أثناء المعالجة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});

