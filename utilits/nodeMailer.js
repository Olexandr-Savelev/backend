const nodemailer = require('nodemailer');

const sendMail = (from, to, subject, html, reply) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
        secure: false,
    });

    const options = {
        from,
        to,
        subject,
        html,
        replyTo: reply
    };

    transporter.sendMail(options, function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log(success);
        }
    });
};

module.exports = sendMail;
