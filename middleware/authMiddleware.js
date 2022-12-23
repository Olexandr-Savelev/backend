const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(402);
        throw new Error('Not autorized! Please login.');
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id);

        req.user = user;
        return next();
    } catch {
        res.status(401);
        throw new Error('Invalid request!');
    }
});

module.exports = protect;
