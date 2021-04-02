var transport = nodemailer.createTransport({
    host: 'YOUR HOST',
    port: 'YOUR PORT',
    auth: {
        user: 'YOUR USER',
        pass: 'YOUR PASSWORD'
    },
    tls: {
        rejectUnauthorized: false
    }
});


transport.use('compile', hbs({
    viewPath: 'YOUR PATH where the files are, for example /app/view/email',
    extName: '.hbs'
}));



exports.sendEmail = function (from, to, subject, callback) {

    var email = {
        from: 'YOUR FROM FOR EXAMPLE YOU@GMAIL.COM',
        to: 'RECIPIENT',
        subject: 'SUBJECT',
        template: 'TEMPLATE NAME, DO NOT NEED TO PLACE  .HBS',
        context: {
            name: 'YOUR NAME',
            url: 'YOUR URL'
        }
    };

    transport.sendMail(email, function (err) {
        if (err) {
            return callback({ 'status': 'error', 'erro': err });
        }
        else {
            return callback({ 'status': 'success' });
        }
    })
};