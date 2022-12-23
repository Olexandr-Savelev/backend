const { default: mongoose } = require('mongoose');
const mogoose = require('mongoose');

const tokenSchema = mogoose.Schema({
    userID: {
        type: mogoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
