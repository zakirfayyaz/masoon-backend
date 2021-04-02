const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const Ads = require("../../models/ads/ads");
const Clicks = require("../../models/ads/Clicks");
const Views = require("../../models/ads/Views");
const Impressions = require('../../models/ads/Impressions');
const encrypt = require("../../middleware/GenerateAESKeys");
const mongoose = require("mongoose")

exports.advDashBoard = asyncHandler(async (req, res, next) => {
    try {
        // const ads = await Ads.find({ user_id: req.user.id });
        // const recent_ads_ = await Ads.find({ user_id: req.user.id }).sort({ _id: -1 }).limit(5);

        // let recent_ads = [];
        // for (let i = 0; i < recent_ads_.length; i++) {
        //     const click_count = await Clicks.find({ ad_id: recent_ads_[i].id })
        //     const views_count = await Views.find({ ad_id: recent_ads_[i].id })
        //     recent_ads.push({ ad: recent_ads_[i], click_count: click_count.length, views_count: views_count.length })
        // }
        // const clicks = await Clicks.find();
        // const views = await Views.find();

        // let clicks_for_each_add = [];
        // let views_for_each_add = [];

        // let blocked_ads = [];

        // for (let i = 0; i < ads.length; i++) {
        //     if (ads[i].status === 'Blocked') {
        //         blocked_ads.push(ads[i]);
        //     }
        //     let total_clicks = 0;
        //     let total_views = 0;
        //     for (let j = 0; j < clicks.length; j++) {
        //         if (ads[i].id == clicks[j].ad_id) {
        //             total_clicks++;
        //         }
        //     }
        //     for (let j = 0; j < views.length; j++) {
        //         if (ads[i].id == views[j].ad_id) {
        //             total_views++;
        //         }
        //     }
        //     clicks_for_each_add.push({
        //         ad_id: ads[i].id.toString(),
        //         ad_user_id: ads[i].user_id,
        //         description: ads[i].description,
        //         title: ads[i].title,
        //         file: ads[i].file,
        //         link: ads[i].link,
        //         type: ads[i].type,
        //         total_clicks
        //     })
        //     views_for_each_add.push({
        //         ad_id: ads[i].id.toString(),
        //         ad_user_id: ads[i].user_id,
        //         description: ads[i].description,
        //         title: ads[i].title,
        //         file: ads[i].file,
        //         link: ads[i].link,
        //         type: ads[i].type,
        //         total_views
        //     })
        // }

        let ads__ = await Ads.aggregate([
            { "$match": { "user_id": mongoose.Types.ObjectId(req.user.id) } },
            {
                $lookup: {
                    from: "clicks",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "clicks"
                }
            },
            {
                $lookup: {
                    from: "views",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "views"
                }
            },
            {
                $lookup: {
                    from: "impressions",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "impressions"
                }
            },
        ]);

        let resp = {
            status: 200,
            ads: ads__
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.ads_list = asyncHandler(async (req, res, next) => {
    try {
        let ads__ = await Ads.aggregate([
            {
                $lookup: {
                    from: "clicks",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "clicks"
                }
            },
            {
                $lookup: {
                    from: "views",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "views"
                }
            },
            {
                $lookup: {
                    from: "impressions",
                    localField: "_id",
                    foreignField: "ad_id",
                    as: "impressions"
                }
            },
        ]);
        // const ads = await Ads.find();
        // let running_ads = [];
        // let blocked_ads = [];
        // let expired_ads = [];

        // const clicks = await Clicks.find()
        // const views = await Views.find()
        // const impressions = await Impressions.find()

        // for (let i = 0; i < ads.length; i++) {
        //     if (ads[i].status === 'Approved') {
        //         let total_clicks = await clicks.filter(m => m.ad_id == ads[i].id)
        //         let total_views = await views.filter(m => m.ad_id == ads[i].id)
        //         let total_impressions = await impressions.filter(m => m.ad_id == ads[i].id)
        //         running_ads.push({ ad: ads[i], total_views: total_views.length, total_impressions: total_impressions.length, total_clicks: total_clicks.length });
        //     } else if (ads[i].status === 'Blocked') {
        //         let total_clicks = await clicks.filter(m => m.ad_id == ads[i].id)
        //         let total_views = await views.filter(m => m.ad_id == ads[i].id)
        //         let total_impressions = await impressions.filter(m => m.ad_id == ads[i].id)
        //         blocked_ads.push({ ad: ads[i], total_views: total_views.length, total_impressions: total_impressions.length, total_clicks: total_clicks.length });
        //     } else if (ads[i].status === 'Expired') {
        //         let total_clicks = await clicks.filter(m => m.ad_id == ads[i].id)
        //         let total_views = await views.filter(m => m.ad_id == ads[i].id)
        //         let total_impressions = await impressions.filter(m => m.ad_id == ads[i].id)
        //         expired_ads.push({ ad: ads[i], total_views: total_views.length, total_impressions: total_impressions.length, total_clicks: total_clicks.length });
        //     }
        // }
        let resp = {
            status: 200,
            // running_ads,
            // blocked_ads,
            // expired_ads,
            ads: ads__
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    catch (err) {
        next(err);
        let resp = {
            status: 200,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }

});