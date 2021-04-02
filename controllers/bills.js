const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bills = require('../models/bills');
const Categories = require('../models/categories');
const SubCategory = require('../models/sub_categories');
const Payment = require('../models/payment');
const Transaction = require('../models/transactions');
const Merchant = require('../models/merchant');
const Budget = require('../models/budgets');
const encrypt = require('../middleware/GenerateAESKeys');
const decrypt = require('../middleware/GenerateRSAKeys');
const checkEmpty = require("../middleware/validation");
const mongoose = require("mongoose");

exports.createBill = asyncHandler(async (req, res, next) => {
  let { f_name } = req.body;
  let cred = JSON.parse(decrypt(f_name))
  const user_id = req.user.id;
  var { name, budget_id, category_id, amount, sub_category_id, due_date } = cred;
  amount = Number(amount);
  category_id = category_id;
  sub_category_id = sub_category_id;

  const budget_remaining_amount = await Budget.findById({ _id: budget_id });
  if (!name || !budget_id || category_id === null || !amount || sub_category_id === null || !due_date) {
    let resp = {
      status: 400,
      message: 'Please fill all required fields',
      armessage: `يرجى تعبئة جميع الحقول المطلوبة`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
  else if (budget_remaining_amount.remaining_amount < amount) {
    let resp = {
      status: 400,
      message: 'Your budget balance is less than required bill amount',
      armessage: 'رصيد ميزانيتك أقل من مبلغ الفاتورة المطلوب'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
  else {
    try {
      const bill = await Bills.create({
        name,
        user_id,
        budget_id,
        category_id,
        sub_category_id,
        amount,
        actual_amount: amount,
        due_date
      });
      let resp = {
        status: 200,
        message: 'Bill added successfully',
        armessage: 'تمت إضافة الفاتورة بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    } catch (err) {
      next(err);
      let resp = {
        status: 400,
        message: 'Error while creating bill',
        armessage: 'خطأ أثناء إنشاء الفاتورة'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    }
  }
});
exports.viewBills = asyncHandler(async (req, res, next) => {
  try {
    const id = req.user.id;
    const bills = await Bills.find({ user_id: id });
    const Paid_bills_ = await Bills.find({ user_id: id, status: 'Paid' }).sort('-createdAt');
    const Due_bills_ = await Bills.find({ user_id: id, status: 'Due' }).sort('-createdAt');
    const Paid_bills = Paid_bills_.filter(b => b.due_date.getMonth() == new Date().getMonth());
    const Due_bills = Due_bills_.filter(b => b.due_date.getMonth() == new Date().getMonth());

    const payments_paid_count_ = await Payment.find({ user_id: id });
    let payments_paid_count = [];

    for (let i = 0; i < payments_paid_count_.length; i++) {
      for (let j = 0; j < Paid_bills.length; j++) {
        if (Paid_bills[j].id == payments_paid_count_[i].bill_id) {
          payments_paid_count.push(payments_paid_count_[i]);
        }
      }
    }

    const count_Of_Due_Bills = Due_bills.reduce((total, item) => {
      return total + item.amount
    }, 0);

    const count_Of_Paid_Bills = payments_paid_count.reduce((total, item) => {
      return total + item.amount
    }, 0);

    let paid_bills__ = [];
    for (let i = 0; i < Paid_bills.length; i++) {
      let total_paid_amount = 0;
      for (let j = 0; j < payments_paid_count.length; j++) {
        if (payments_paid_count[j].bill_id == Paid_bills[i].id) {
          total_paid_amount += payments_paid_count[j].amount
        }
      }
      paid_bills__.push({
        amount_paid: total_paid_amount,
        amount: Paid_bills[i].amount,
        status: Paid_bills[i].status,
        _id: Paid_bills[i].id,
        name: Paid_bills[i].name,
        user_id: Paid_bills[i].user_id,
        budget_id: Paid_bills[i].budget_id,
        category_id: Paid_bills[i].category_id,
        sub_category_id: Paid_bills[i].sub_category_id,
        actual_amount: Paid_bills[i].actual_amount,
        due_date: Paid_bills[i].due_date,
        createdAt: Paid_bills[i].createdAt,
        Paid_On: Paid_bills[i].Paid_On
      })
    }
    let resp = {
      status: '200',
      Paid_bills: paid_bills__,
      Due_bills: Due_bills,
      Due_bills_count: count_Of_Due_Bills,
      Paid_bills_count: count_Of_Paid_Bills,
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while fetching data',
      armessage: "خطأ أثناء جلب البيانات"
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.viewBillsByMonth = asyncHandler(async (req, res, next) => {
  try {
    console.log('111111111111')
    let month = parseInt(req.params.month);
    let nextMonth = parseInt(req.params.month) + 1
    let year = parseInt(req.params.year);
    let allb = await Bills.find({ user_id: req.user.id });

    console.log(new Date(year + "/" + month + "/1"));
    console.log(new Date(year + "/" + nextMonth + "/1"));
    let due_bills = await Bills.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.user.id), due_date: {
            $gte: new Date(year + "/" + month + "/1"),
            $lte: new Date(year + "/" + nextMonth + "/1"),
          },
          status: "Due"
        }
      },
      {
        $lookup: {
          from: 'sub_categories',
          as: 'sub_category',
          let: { sub_category_id: '$sub_category_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sub_category_id'] },
                  ]
                }
              }
            }
          ]
        }
      },
    ])


    let paid_bills = await Bills.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.user.id), due_date: {
            $gte: new Date(year + "/" + month + "/1"),
            $lte: new Date(year + "/" + nextMonth + "/1"),
          },
          status: "Paid"
        }
      },
      {
        $lookup: {
          from: 'sub_categories',
          as: 'sub_category',
          let: { sub_category_id: '$sub_category_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sub_category_id'] },
                  ]
                }
              }
            }
          ]
        }
      },
    ])

    let resp = {
      status: "200",
      Due_bills: due_bills,
      Due_bills_count: 0,
      Paid_bills: paid_bills,
      Paid_bills_count: 0
    }
    // console.log(resp)
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp)),
    });
    // }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while fetching data',
      armessage: `خطأ أثناء جلب البيانات`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.viewBillsByDate = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.params)
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    let pastDate = parseInt(req.params.date)
    let currentDate = parseInt(req.params.date) + 2

    let due_bills = await Bills.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.user.id), due_date: {
            $gt: new Date(year + "/" + month + "/" + pastDate),
            $lt: new Date(year + "/" + month + "/" + currentDate),
          },
          status: "Due"
        }
      },
      {
        $lookup: {
          from: 'sub_categories',
          as: 'sub_category',
          let: { sub_category_id: '$sub_category_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sub_category_id'] },
                  ]
                }
              }
            }
          ]
        }
      },
    ])

    let paid_bills = await Bills.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(req.user.id), due_date: {
            $gte: new Date(year + "/" + month + "/2"),
            $lte: new Date(year + "/" + month + "/2"),
          },
          status: "Paid"
        }
      },
      {
        $lookup: {
          from: 'sub_categories',
          as: 'sub_category',
          let: { sub_category_id: '$sub_category_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sub_category_id'] },
                  ]
                }
              }
            }
          ]
        }
      },
    ])


    // let due_bills = await Bills.find({
    //   user_id: req.user.id, due_date: {
    //     $gt: new Date(year + "/" + month + "/" + pastDate),
    //     $lt: new Date(year + "/" + month + "/" + currentDate),
    //   },
    //   status: "Due"
    // });
    // let paid_bills = await Bills.find({
    //   user_id: req.user.id, due_date: {
    //     $gte: new Date(year + "/" + month + "/2"),
    //     $lte: new Date(year + "/" + month + "/2"),
    //   },
    //   status: "Paid"
    // });

    // let DUE_BILLS = [];

    // for (let bill of due_bills) {
    //   let sub_cat = await SubCategory.findById({ _id: bill.sub_category_id });
    //   if (sub_cat) {
    //     DUE_BILLS.push({
    //       bill: bill,
    //       ar_subcategy: sub_cat.arname,
    //       subcategy: sub_cat.name,
    //     })
    //   }
    // }
    // let PAID_BILLS = [];
    // for (let bill of paid_bills) {
    //   let sub_cat = await SubCategory.findById({ _id: bill.sub_category_id });
    //   if (sub_cat) {
    //     PAID_BILLS.push({
    //       bill: bill,
    //       ar_subcategy: sub_cat.arname,
    //       subcategy: sub_cat.name,
    //     })
    //   }
    // }
    let resp = {
      status: "200",
      Due_bills: due_bills,
      Due_bills_count: 0,
      Paid_bills: paid_bills,
      Paid_bills_count: 0
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp)),
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data",
      armessage: `خطأ أثناء جلب البيانات`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.payBill = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    var { bill_id, amount } = cred;
    const date = Date.now();
    const bill = await Bills.findById(bill_id);
    const category = await Categories.findById({ _id: bill.category_id });

    const create_payment = (bill_id, bill_name, amount, status) => {
      const payment = Payment.create({
        bill_id,
        bill_name,
        amount,
        status,
        user_id: req.user.id
      })
    }
    // console.log(`${bill.amount} = ${amount}`);
    if (bill.amount == amount) {
      amount = bill.amount;
      const updated_bill = await Bills.findByIdAndUpdate({ _id: bill_id }, { status: 'Paid', amount: 0, Paid_On: date }, {
        new: true,
        runValidator: true,
        useFindAndModify: false
      });
      console.log('bill update done')
      if (!updated_bill) {
        let resp = {
          status: 404,
          message: 'bill not found',
          armessage: 'فاتورة غير موجودة'
        }
        return res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      } else {
        const budget = await Budget.findById({ _id: bill.budget_id });
        if (budget) {
          const updated_budget = await Budget.findByIdAndUpdate({ _id: budget.id }, { remaining_amount: budget.remaining_amount - bill.amount }, {
            new: true,
            runValidator: true,
            useFindAndModify: false
          });
          if (updated_budget) {
            console.log('budget update done')
            create_payment(updated_bill.id, updated_bill.name, amount, updated_bill.status);
            const bill_transaction = await Transaction.create({
              user_id: req.user.id,
              amount,
              category_id: category.name,
              sub_category_id: bill.sub_category_id,
              merchant: bill.name,
              description: 'Bill paid',
              budget_id: bill.budget_id,
              payment_type: 'Credit',
              type: 'Expense',
              date: date
            });
            if (bill_transaction) {
              const merchants_check = await Merchant.findOne({ user_id: req.user.id, name: bill.name });
              if (merchants_check) {
                // console.log('merchant exists');
              }
              else {
                const createMerchant = Merchant.create({
                  name: bill.name,
                  user_id: req.user.id
                });
                if (createMerchant) {
                  console.log('done')
                  let resp = {
                    status: 200,
                    message: "Bill Paid",
                    armessage: 'فاتورة مدفوعة'
                  }
                  res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                  });
                } else {
                  let resp = {
                    status: 400,
                    message: "Error while making payment",
                    armessage: 'خطأ أثناء إجراء الدفع'
                  }
                  res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                  });
                }
              }
            } else {
              let resp = {
                status: 400,
                message: "Error while making payment",
                armessage: 'خطأ أثناء إجراء الدفع'
              }
              res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
              });
            }
          } else {
            let resp = {
              status: 400,
              message: "Error while making payment",
              armessage: 'خطأ أثناء إجراء الدفع'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            });
          }
        } else {
          let resp = {
            status: 400,
            message: "Error while making payment",
            armessage: 'خطأ أثناء إجراء الدفع'
          }
          res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
          });
        }

      }
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while making payment",
      armessage: 'خطأ أثناء إجراء الدفع'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.viewBill = asyncHandler(async (req, res, next) => {
  try {
    const bill = await Bills.findById(req.params.id);
    if (!bill) {
      return next(
        new ErrorResponse(`bill not found with the id : ${req.params.id}`, 404)
      );
    }
    res.status(201).json({
      success: [true, "Bill found"],
      data: bill
    });
  } catch (err) {
    next(err);
  }
});
exports.editBills = asyncHandler(async (req, res, next) => {
  try {
    let { f_name } = req.body;
    let cred = JSON.parse(decrypt(f_name));
    let { bill_id } = cred
    const bill = await Bills.findById({ _id: bill_id });
    let { name, budget_id, category_id, amount, sub_category_id, due_date } = cred;
    if (bill.name !== name) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: bill_id },
        { name: name },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.budget_id !== budget_id) {
      let budget = await Budget.findById({ _id: budget_id });
      let deducted_amount = budget.remaining_amount - amount
      if (deducted_amount >= 0) {
        const update_bill = await Bills.findByIdAndUpdate(
          { _id: bill_id },
          { budget_id: budget_id },
          { new: true, useFindAndModify: false }
        );
      } else {
        let resp = {
          status: 200,
          message: "This budget does not have enough balance required for this bill",
          armessage: 'لا تحتوي هذه الميزانية على رصيد كافٍ مطلوب لهذه الفاتورة'
        }
        res.status(201).json({
          resp: encrypt(JSON.stringify(resp))
        });
      }
    }

    if (bill.category_id !== category_id) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: bill_id },
        { category_id: category_id, sub_category_id: sub_category_id },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.amount !== amount) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: bill_id },
        { amount: amount, actual_amount: amount },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.due_date !== due_date) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: bill_id },
        { due_date: due_date },
        { new: true, useFindAndModify: false }
      );
    }
    let resp = {
      status: 200,
      message: "Bill details updated",
      armessage: 'تم تحديث تفاصيل الفاتورة'
    }
    res.status(201).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while updating bill",
      armessage: 'خطأ أثناء تحديث الفاتورة'
    }
    res.status(201).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.deleteBill = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let { bill_id } = cred
    const bill = await Bills.findByIdAndDelete(bill_id);
    let resp = {
      status: 200,
      message: "Bill deleted",
      armessage: 'تم حذف الفاتورة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while deleting bill",
      armessage: 'خطأ أثناء حذف الفاتورة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.editBillsNewScenario = asyncHandler(async (req, res, next) => {
  try {
    const bill = await Bills.findById({ _id: req.params.id });
    let { name, budget_id, category_id, amount, sub_category_id, due_date } = req.body;

    if (bill.name !== name) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: req.params.id },
        { name: name },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.budget_id !== budget_id) {

      const previous_budget = await Budget.findById({ _id: bill.id })

      const update_bill = await Bills.findByIdAndUpdate(
        { _id: req.params.id },
        { budget_id: budget_id },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.category_id !== category_id) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: req.params.id },
        { category_id: category_id, sub_category_id: sub_category_id },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.amount !== amount) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: req.params.id },
        { amount: amount, actual_amount: amount },
        { new: true, useFindAndModify: false }
      );
    }

    if (bill.due_date !== due_date) {
      const update_bill = await Bills.findByIdAndUpdate(
        { _id: req.params.id },
        { due_date: due_date },
        { new: true, useFindAndModify: false }
      );
    }
    res.status(201).json({
      status: 200,
      message: "Bill details updated"
    });
  } catch (err) {
    next(err);
  }
});