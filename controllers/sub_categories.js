const asyncHandler = require("../middleware/async");
const Sub_categories = require('../models/sub_categories');
const decrypt = require("../middleware/GenerateRSAKeys");
const encrypt = require("../middleware/GenerateAESKeys");

exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, category_id } = req.body;
  const category = await Sub_categories.find();
  const count = category.length;
  let _id;
  if (!count === 0) { _id = count + 1 }
  else { _id = count }

  try {
    const sub_category = await Sub_categories.create({
      name,
      _id,
      category_id
    });
    res.status(201).json({
      success: [true, "SubCategory Created"],
      data: sub_category,
    });
  } catch (err) {
    next(err);
  }
});
exports.viewSubCategories = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body
    let cred = JSON.parse(decrypt(name))
    const sub_categories = await Sub_categories.find({ category_id: cred.name });

    if (sub_categories.length == 0) {
      let resp = {
        status: 200,
        count: 0,
        data: []
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        status: 200,
        count: sub_categories.length,
        data: sub_categories
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data"
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});

