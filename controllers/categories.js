const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const Categories = require('../models/categories');
const ErrorResponse = require("../utils/errorResponse");
const encrypt = require("../middleware/GenerateAESKeys");

exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, sub_category_id } = req.body;

  const category = await Categories.find();
  const count = category.length;
  let _id;
  if (!count === 0) {
    _id = count + 1
  }
  else {
    _id = count
  }

  try {
    const category = await Categories.create({
      name,
      _id
    });
    res.status(201).json({
      success: [true, "Category Created"],
      data: category,
    });
  } catch (err) {
    next(err);
  }
});
exports.viewCategories = asyncHandler(async (req, res, next) => {
  try {
    let categories = await Categories.find();
    if (categories.length == 0) {
      let resp = {
        status: 400,
        data: categories,
        message: 'Categories not found'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        success: [true, "Categoty(s) found"],
        status: 200,
        data: categories
      }
      res.status(201).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    let resp = {
      message: "Error while fetching data",
      armessage: 'خطأ أثناء جلب البيانات',
      status: 400,
    }
    res.status(201).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});