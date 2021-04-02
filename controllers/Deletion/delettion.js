const User = require('../../models/users_model');
const Transaction = require('../../models/transactions');
const TagTransaction = require('../../models/tag_transaction');
const Tags = require('../../models/tags');
const Merchants = require('../../models/merchant');
const Bills = require('../../models/bills');
const Payment = require('../../models/payment');
const Budget = require('../../models/budgets');
const Income = require('../../models/Income');
const Logger = require('../../models/Logger');
const Banks = require('../../models/Banks');
const BankTransaction = require('../../models/BankTransactions');
const Message = require('../../models/message');
const Notification = require('../../models/Notifications');
const Rating = require('../../models/Ratings');
const UserEmails = require('../../models/User_email');
const Clicks = require('../../models/ads/Clicks');
const Views = require('../../models/ads/Views');
const Impressions = require('../../models/ads/Impressions');
const Ads = require('../../models/ads/ads'); // for publisher only
const Revenue = require('../../models/ads/Revenue'); // for publisher only
const UserPackage = require('../../models/UserPackage'); // for publisher only

exports.deleteUserByAdmin = asyncHandler(async (req, res, next) => {
    try {
        let { user_id } = req.body;
        const user = await User.findById({ _id: user_id });
        if (user.roll == 'User') {
            // 1. delete all transactions of given user
            const transactions = await Transaction.find({ user_id: user_id });
            for (let i = 0; i < transactions.length; i++) {
                const transaction = await Transaction.findByIdAndDelete({ _id: transactions[i].id });
            }

            // 2. delete transaction tags of the user
            const tag_transactions = await TagTransaction.find({ user_id: user_id });
            for (let i = 0; i < tag_transactions.length; i++) {
                const tag_transaction = await TagTransaction.findByIdAndDelete({ _id: tag_transactions[i].id });
            }

            // 3. delete all tags of the user
            const tags = await Tags.find({ user_id: user_id });
            for (let i = 0; i < tags.length; i++) {
                const tag = await Tags.findByIdAndDelete({ _id: tags[i].id });
            }

            // 4. delete merchants of given user
            const merchants = await Merchants.find({ user_id: user_id })
            for (let i = 0; i < merchants.length; i++) {
                const merchant = await Merchants.findByIdAndDelete({ _id: merchants[i].id });
            }

            // 5. delete all bills of given user
            const bills = await Bills.find({ user_id: user_id });
            for (let i = 0; i < bills.length; i++) {
                const bill = await Bills.findByIdAndDelete({ _id: bills[i].id });
            }

            // 6. delete all the payments record of given user
            const payments = await Payment.find({ user_id: user_id });
            for (let i = 0; i < payments.length; i++) {
                const payment = await Payment.findByIdAndDelete({ _id: payments[i].id })
            }

            // 7. delete all the budgets of the given user
            const budgets = await Budget.find({ user_id: user_id });
            for (let i = 0; i < budgets.length; i++) {
                const budget = await Budget.findByIdAndDelete({ _id: budgets[i].id })
            }

            // 8. delete all the incomes of the given user
            const incomes = await Income.find({ user_id: user_id });
            for (let i = 0; i < incomes.length; i++) {
                const income = await Income.findByIdAndDelete({ _id: incomes[i].id })
            }

            // 9. delete all the logging records of the given user
            const loggers = await Logger.find({ user_id: user_id });
            for (let i = 0; i < loggers.length; i++) {
                const logger = await Logger.findByIdAndDelete({ _id: loggers[i].id })
            }

            // 10. delete all the linked bansk of the given user
            const banks = await Banks.find({user_id: user_id});
            for(let i = 0; i < banks.length; i++) {
                const bank = await Banks.findByIdAndDelete({ _id: banks[i].id });
            }

            // 11. delet all the Bank Transaction of the given user
            const bankTransactions = await BankTransaction.find({user_id: user_id});
            for(let i = 0; i < bankTransactions.length; i++){
                const bankTransaction = await BankTransaction.findByIdAndDelete({ _id: bankTransactions[i].id })
            }

            // 12. delete all the messages of given user 
            const messages = await Message.find({ user_id: user_id});
            for(let i = 0; i < messages.length; i++){
                const message = await Message.findByIdAndDelete({ _id: messages[i].id })
            }

            // 13. delete all the notifications of given user
            const notifications = await Notification.find({ user_id: user_id });
            for (let i = 0; i < notifications.length; i++) {
                const notification = await Notification.findByIdAndDelete({ _id: notifications[i].id })
            }

            // 14. delete all the ratings of given user
            const ratings = await Rating.find({ user_id: user_id})
            for(let i = 0; i < ratings.length; i++){
                const rating = await Rating.findByIdAndDelete({ _id: ratings[i].id });
            }

            // 15. delete all the contact emails of given user
            const delete_user_emails = await UserEmails.find({ user_id: user_id });
            for (let i = 0; i < delete_user_emails.length; i++) {
                const email = await UserEmails.findByIdAndDelete({ _id: delete_user_emails[i].id })
            }

            // 16. delete all the clicks of given user
            const clicks = await Clicks.find({ user_id: user_id});
            for (let i = 0; i < clicks.length; i++){
                const click = await Clicks.findByIdAndDelete({ _id: clicks[i].id });
            }

            // 17. delete all the views of given user
            const views = await Views.find({ user_id: user_id});
            for(let i = 0; i < views.length; i++){
                const view = await Views.findByIdAndDelete({ _id: views[i].id})
            }

            // 18. delete all the impressions of the given user
            const impressions = await Impressions.find({ user_id: user_id});
            for(let i = 0; i < impressions.length; i++){
                const impression = await Impressions.findByIdAndDelete({ _id: impressions[i].id })
            }
            res.status(200).json({
                status: 200,
                message: `${user.roll} named ${user.firstname + ' ' + user.lastname} is deleted`
            })

        } else if(user.roll == 'Advertiser'){
            // 19. delete all the ads of the given user
            const ads = await Ads.find({ user_id: user_id });
            for(let i = 0; i < ads.length; i++){
                const ad = await Ads.findByIdAndDelete({ _id: ads[i].id });
            }

            // 20. delete all the user packages
            const user_packages = await UserPackage.find({user_id: user_id});
            for(let i = 0; i < user_packages.length; i++){
                const package = await UserPackage.findByIdAndDelete({ _id : user_packages[i].id})
            }

            // 21. delete all Revenues of given user
            const revenues = await Revenue.find({ user_id: user_id });
            for(let i = 0; i < revenues.length; i++){
                const revenue = await Revenue.findByIdAndDelete({ _id: revenues[i].id })
            }

            res.status(200).json({
                status: 200,
                message: `${user.roll} named ${user.firstname + ' ' + user.lastname} is deleted`
            })
        }
    } catch (err) {
        next(err);
    }
})