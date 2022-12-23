const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const sendMail = require('../utilits/nodeMailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

const userRegister = asyncHandler(async (req, res) => {
    //Validation
    const { name, email, password, photo, bio } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Fill all required fields');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must contains at least 6 characters');
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
        res.status(400);
        throw new Error('User with this email already exist');
    }

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        photo,
        bio,
    });

    //Generate token
    const token = generateToken(user._id);

    //Set token in cookies
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 1000,
        sameSite: 'none',
    });

    if (user) {
        const { _id, name, email, photo, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Something went wrong!');
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No user with this email');
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if ((user, comparePassword)) {
        const { _id, name, email, photo, bio } = user;

        const token = generateToken(_id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 1000,
            sameSite: 'none',
        });

        res.status(200).json({
            _id,
            name,
            email,
            photo,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Wrong password');
    }
});

const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        maxAge: 0,
        sameSite: 'none',
    });
    return res.status(200).json({ message: 'Successfully logged out!' });
});

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { _id, name, email, photo, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            bio,
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

const getLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
        res.json(true);
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const newData = req.body;

    if (user) {
        const { name, photo, bio } = user;

        user.name = newData.name || name;
        user.photo = newData.photo || photo;
        user.bio = newData.bio || bio;

        const updatedUser = await user.save();

        if (updatedUser) {
            const { _id, name, email, photo, bio } = updatedUser;
            res.status(200).json({
                _id,
                name,
                email,
                photo,
                bio,
            });
        } else {
            res.status(400);
            throw new Error('Update failed.');
        }
    } else {
        res.status(404);
        throw new Error("User don't found.");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User don't found.");
    }

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (user && isOldPasswordCorrect) {
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            message: 'Pssword successfully changed!',
        });
    } else {
        res.status(400);
        throw new Error('Old password is incorrect');
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        res.status(404)
        throw new Error("User with this email is not exist.")
    }

    const token = crypto.randomBytes(32).toString("hex") + user._id
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    await new Token({
        userID: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
    }).save()

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${hashedToken}`

    const message = `
    <h2>Hello, ${user.name}!</h2>
    <p>Please use link below to reset your password.</p>
    <p>Reset link is valid only 30 minutes.</p>
    <p>This is your link:</p>
    <a href='${resetUrl}' clicktracking=off>${resetUrl}</a>
    <hr>
    <p>Good Luck!</p>
    `

    const subject = 'Reset Password Email.'

    try {
        sendMail(
            form = process.env.EMAIL_USER,
            to = user.email,
            subject,
            html = message
        )
        res.status(200).json({ success: true, message: "Email sent!" })
    } catch (error) {
        res.status(400)
        throw new Error("Email not sent. Please try again.")
    }

});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { resetToken } = req.params
    const token = await Token.findOne({ token: resetToken, expiresAt: { $gt: Date.now() } })

    if (!token) {
        res.status(400)
        throw new Error('Invalid token.')
    }

    const user = await User.findOne({ _id: token.userID })

    if (!user) {
        res.status(404)
        throw new Error('Invalid user data.')
    }

    user.password = password
    await user.save()

    res.status(200).json({ message: 'Password successfully chancged!' })

})

module.exports = {
    userRegister,
    login,
    logout,
    getUser,
    getLoginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
};
