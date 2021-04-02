const Ads = require('../../models/ads/ads')
const asyncHandler = require("../../middleware/async")
exports.getAds = asyncHandler(async (req, res, next) => {
    try {
        const get_ads = await Ads.find({ status: "Approved" });
        res.status(201).json({
            status: 200,
            Ads: get_ads
        });
    }
    catch (err) {
        res.status(201).json({
            status: 200,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        });
    }

})