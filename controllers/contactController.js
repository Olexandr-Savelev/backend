const { text } = require('body-parser');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const sendMail = require('../utilits/nodeMailer');

const contactUs = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    if (!subject || !message) {
        res.status(400);
        throw new Error('Please enter subject and message.');
    }

    try {
        sendMail(
            (form = process.env.EMAIL_USER),
            (to = process.env.EMAIL_USER),
            subject,
            (html = `<p>${message}</p>`),
            (reply = user.email)
        );
        res.status(200).json({ success: true, message: 'Email sent!' });
    } catch (error) {
        res.status(400);
        throw new Error('Email not sent. Please try again.');
    }
});

module.exports = { contactUs };
