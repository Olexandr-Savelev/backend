const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter a user name'],
        },
        email: {
            type: String,
            required: [true, 'Please enter an email'],
            unique: [true, 'Email must be unique'],
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Enter valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please enter a password'],
            minLength: [6, 'Password must contain at least 6 charecters'],
        },
        photo: {
            type: String,
            required: false,
            default:
                'https://thumbs.dreamstime.com/z/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
        },
        bio: {
            type: String,
            required: false,
            maxLength: [250, "Bio can't be more than 250 characters"],
        },
    },
    {
        timestamps: true,
    }
);

//Bcrypt password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
