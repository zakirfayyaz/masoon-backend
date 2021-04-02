const express = require("express");
const { createCategory, createSubCategory, updateCategory, updateSubCategory, deleteCategory, deleteSubCategory } = require("../../controllers/admin/categories");
const { protect } = require('../../middleware/auth');


const router = express.Router();
router.route('/').post(protect, createCategory);
router.route('/subcategory').post(protect, createSubCategory);
router.route('/update-id').put(protect, updateCategory);
router.route('/update/sub-id').put(protect, updateSubCategory);
router.route('/remove/:id').delete(protect, deleteCategory);
router.route('/remove/sub/:id').delete(protect, deleteSubCategory);

module.exports = router;