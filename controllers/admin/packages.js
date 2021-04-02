const Package = require('../../models/packages')
const UserPackage = require('../../models/UserPackage');
const asyncHandler = require("../../middleware/async")
const checkEmpty = require("../../middleware/validation");
const encrypt = require('../../middleware/GenerateAESKeys');
const decrypt = require('../../middleware/GenerateRSAKeys');

exports.createPakcage = asyncHandler(async (req, res, next) => {
    let { package } = req.body;
    let cred = JSON.parse(decrypt(package));
    const {
        name,
        arname,
        description,
        views,
        clicks,
        duration,
        amount,
        ads_per_package,
        arDescription
    } = cred;

    try {
        if (checkEmpty(arname) == true || checkEmpty(name) == true
            || checkEmpty(description) == true || checkEmpty(views) == true
            || checkEmpty(clicks) == true || checkEmpty(duration) == true || checkEmpty(amount) == true
            || checkEmpty(ads_per_package) == true || checkEmpty(arDescription) == true) {

            let resp = {
                status: 400,
                message: 'Please fill all required fields',
                armessage: `يرجى تعبئة جميع الحقول المطلوبة`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            const package = await Package.create({
                description,
                arDescription,
                duration,
                views,
                clicks,
                name,
                arname,
                amount,
                ads_per_package
            });
            if (package) {
                let resp = {
                    status: 200,
                    message: 'Package created',
                    armessage: `تم إنشاء الباقة`,
                    package
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {
                let resp = {
                    status: 400,
                    message: "Error while creating package",
                    armessage: `خطأ أثناء إنشاء الباقة`
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
            message: 'Error while creating package',
            armessage: `خطأ أثناء إنشاء الباقة`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getPakcage = asyncHandler(async (req, res, next) => {
    try {
        const packages = await Package.find();
        if (packages.length > 0) {
            let resp = {
                status: 200,
                packages
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            let resp = {
                status: 200,
                packages,
                message: 'Package not found',
                armessage: `الباقة غير موجودة`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }


});
exports.getPakcagebyId = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const package = await Package.findById({ _id: cred.package_id });
        if (package) {
            let resp = {
                status: 200,
                package
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            let resp = {
                status: 200,
                message: 'Package not found',
                armessage: `الباقة غير موجودة`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getPakcagebyIdAndUpdate = asyncHandler(async (req, res, next) => {
    try {
        let { name, package } = req.body;
        let cred = JSON.parse(decrypt(name));
        let package_id_ = JSON.parse(decrypt(package));
        const updated_package = await Package.findByIdAndUpdate({ _id: package_id_.package_id }, cred, { new: true, useFindAndModify: false });
        if (updated_package) {
            let resp = {
                status: 200,
                updated_package
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
        else {
            let resp = {
                status: 400,
                message: 'Error while updating package',
                armessage: 'خطأ أثناء تحديث الباقة'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: 'Error while updating package',
            armessage: 'خطأ أثناء تحديث الباقة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getPakcagebyIdAndDelete = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { package_id } = cred
        const user_packages = await UserPackage.find({ package_id: package_id });
        if (user_packages.length > 0) {
            let resp = {
                status: 400,
                message: 'Package cannot be deleted because it has already been utilized by some advertisers',
                armessage: `لا يمكن حذف الباقة لأن بعض المعلنين قد استخدموها مُسبقاً`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            const delete_package = await Package.findByIdAndDelete({ _id: package_id });
            if (delete_package) {
                let resp = {
                    status: 200,
                    message: 'Package deleted successfully',
                    armessage: `تم حذف الباقة بنجاح`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            } else {
                let resp = {
                    status: 400,
                    message: 'Error while deleting package',
                    armessage: `خطأ أثناء حذف الباقة`
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                });
            }
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while deleting package',
            armessage: `خطأ أثناء حذف الباقة`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.createUser1 = asyncHandler(async (req, res, next) => {
    try {
        const checkEmail = await User.find({ email: req.body.email, roll: req.body.roll });
        const checkPhone = await User.find({ phone_number: req.body.phone_number, roll: req.body.roll });
        if (checkPhone.length > 0) {
            res.status(200).json({
                status: 200,
                message: "Phone number already exists, please select another different Phone number"
            })
        } else if (checkEmail.length > 0) {
            res.status(200).json({
                status: 200,
                message: "Email already exists, please choose a different email"
            });
        } else {

            const user_1 = await User.create({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password,
                phone_number: req.body.phone_number,
                role: req.body.role
            });
            res.status(200).json({
                status: 200,
                message: "User created successfully"
            });
        }
    } catch (err) {
        next(err);
    }
});

