const Categories = require('../../models/categories');
const Sub_categories = require('../../models/sub_categories')
const asyncHandler = require("../../middleware/async");
const decrypt = require('../../middleware/GenerateRSAKeys');
const encrypt = require('../../middleware/GenerateAESKeys');

exports.createCategory = asyncHandler(async (req, res, next) => {
    let { cat } = req.body;
    let cred = JSON.parse(decrypt(cat));
    const { name, arname, icon_link } = cred;
    try {
        const cat = await Categories.find({ name });
        if (cat.length > 0) {
            let resp = {
                status: 400,
                message: 'Category exists',
                armessage: 'الفئة موجودة'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            const category = await Categories.create({
                name,
                arname,
                icon_link
            });

            if (category) {

                let resp = {
                    status: 200,
                    message: 'Category created',
                    armessage: 'تم إنشاء الفئة',
                    category
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while creating category",
                    armessage: 'خطأ أثناء إنشاء الفئة'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while creating category',
            armessage: 'خطأ أثناء إنشاء الفئة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.createSubCategory = asyncHandler(async (req, res, next) => {
    let { sub_cat } = req.body;
    let cred = JSON.parse(decrypt(sub_cat));

    const { name, category_id, arname } = cred;
    try {

        let check_existance = await Sub_categories.find({ name: name, category_id: category_id });
        if (check_existance.length == 0) {
            const category = await Sub_categories.create({
                name,
                category_id,
                arname
            });

            if (category) {
                let resp = {
                    status: 200,
                    message: 'Subcategory created',
                    armessage: 'تم إنشاء فئة فرعية',
                    category
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while creating subcategory",
                    armessage: 'خطأ أثناء إنشاء فئة فرعية'
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        } else {
            let resp = {
                status: 400,
                message: 'Subcategory already exists',
                armessage: 'الفئة الفرعية موجودة بالفعل'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while creating subcategory',
            armessage: 'خطأ أثناء إنشاء فئة فرعية'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.updateCategory = asyncHandler(async (req, res, next) => {
    try {
        let { cat_id } = req.body;
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let id = JSON.parse(decrypt(cat_id));
        const updated_category = await Categories.findByIdAndUpdate({ _id: id.id }, cred, { new: true, useFindAndModify: false });
        if (updated_category) {
            let resp = {
                status: 200,
                updated_category
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 400,
                message: "Error while updating category",
                armessage: 'خطأ أثناء تحديث الفئة'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while updating category",
            armessage: 'خطأ أثناء تحديث الفئة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
    try {
        let { subcat_id } = req.body;
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let id = JSON.parse(decrypt(subcat_id));
        const updated_sub_category = await Sub_categories.findByIdAndUpdate({ _id: id.id }, cred, { new: true, useFindAndModify: false });
        if (updated_sub_category) {
            let resp = {
                status: 200,
                updated_sub_category
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            let resp = {
                status: 400,
                message: "Error while updating subcategory",
                armessage: 'خطأ أثناء تحديث الفئة الفرعية'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while updating subcategory",
            armessage: 'خطأ أثناء تحديث الفئة الفرعية'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    try {
        const sub_categories = await Sub_categories.find();
        for (let i = 0; i < sub_categories.length; i++) {
            if (sub_categories[i].category_id == req.params.id) {
                const delete_sub_category = await Sub_categories.findByIdAndDelete({ _id: sub_categories[i].id });
            }
        }
        const delted_category = await Categories.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({
            status: 200,
            delted_category
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while deleting category",
            armessage: 'خطأ أثناء حذف الفئة'
        })
    }
});
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
    try {
        const delete_sub_category = await Sub_categories.findByIdAndDelete({ _id: req.params.id });
        if (delete_sub_category) {
            res.status(200).json({
                status: 200,
                delete_sub_category
            })
        } else {
            let resp = {
                status: 400,
                message: "Error while deleting subcategory",
                armessage: 'خطأ أثناء حذف الفئة الفرعية'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while deleting subcategory",
            armessage: 'خطأ أثناء حذف الفئة الفرعية'
        })
    }
});