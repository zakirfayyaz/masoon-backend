const express = require("express");
const { protect } = require("../../middleware/auth");
const { createAd,
    getAds,
    views,
    clicks,
    getAdsOfCurrnetUser,
    blockAds,
    unblockAds,
    suspendAd,
    createUserPackage,
    getUserPackage,
    getUserPackageById,
    suspendUserPackage,
    approveUserPackage,
    requestRenewalOfUserPackage,
    totalAds_count,
    upgradePackage,
    adRenewRequest,
    impressions,
    getAdInsights,
    suspendUserPackageByExpiryDate,
    expireAdOnPackageExpired,
    getAdInsightsForExpiredAds
} = require("../../controllers/ads/ads");
const multer = require("multer");

const currentDate = new Date();
const currentTime = currentDate.getTime();

// upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './posts');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${currentTime}-${(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});

const router = express.Router();
router.route("/user-packages").post(protect, createUserPackage);
router.route("/user-packages/expire-by-date").put(protect, suspendUserPackageByExpiryDate);
// router.route("/user-packages/expire-ad-by-date").put(protect, expireAdOnPackageExpired);
router.route("/user-packages").get(protect, getUserPackage);
router.route("/remaining-ads").get(protect, totalAds_count);
router.route("/user-packages/upgrade-id").put(protect, upgradePackage);
router.route("/user-packages/:id").get(protect, getUserPackageById);
router.route("/user-packages/suspend-id").put(protect, suspendUserPackage);
router.route("/user-packages/approve-id").put(protect, approveUserPackage);
router.route("/user-packages/renew-id").put(protect, requestRenewalOfUserPackage);
router.route("/").post(protect, upload.single('file'), createAd);
router.route('/').get(protect, getAds);
router.route('/view-id').put(protect, views);
router.route('/click-id').put(protect, clicks);
router.route('/impression-id').put(protect, impressions);
router.route('/myposts').get(protect, getAdsOfCurrnetUser);
router.route('/ad-insights-id').put(protect, getAdInsights);
router.route('/expired/ad-insights-id').put(protect, getAdInsightsForExpiredAds);
router.route('/block-id').put(protect, blockAds);
router.route('/suspend-ad').put(protect, suspendAd);
router.route('/renew-ad-id').put(protect, adRenewRequest);
router.route('/unblock-id').put(protect, unblockAds);

module.exports = router;