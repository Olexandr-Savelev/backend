const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Please add name."],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Please add category."],
    },
    image: {
        type: Object,
        default: {}
    },
    price: {
        type: String,
        required: [true, "Please add price."],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, "Please add quantity."],
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
module.exports = Product