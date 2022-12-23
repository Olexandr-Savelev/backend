const asyncHandler = require('express-async-handler')
const Product = require('../models/productModel')
const User = require('../models/userModel')
const { humanFileSize } = require('../utilits/imageUpload')
const cloudinary = require('cloudinary').v2

const createProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const file = req.file
    const { name, category, price, quantity, description, } = req.body
    const user = await User.findOne({ _id: userId })

    if (!user) {
        res.status(404)
        throw new Error('Please login.')
    }

    if (!name || !category || !price || !quantity) {
        res.status(400)
        throw new Error('Please fill all required fields.')
    }

    let fileData = {}
    if (file) {
        let imageUrl

        try {
            const uploadedImage = await cloudinary.uploader.upload(file.path, { folder: "Inventory", resource_type: 'image' })
            imageUrl = uploadedImage.secure_url
        } catch (error) {
            res.status(400)
            throw new Error("Image upload failed.")
        }

        fileData = {
            fileName: file.originalname,
            filePath: imageUrl,
            fileType: file.mimetype,
            fileSize: humanFileSize(file.size),
        }

    }

    const product = await Product.create({
        userId, name, category, price, quantity, description, image: fileData
    })
    res.status(201).json(product)
})

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ userId: req.user._id }).sort('-createdAt')
    if (!products) {
        res.status(404)
        throw new Error('User not autorized.')
    }
    res.status(200).json(products)
})

const getSingleProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found.')
    }

    if (product.userId.toString() !== req.user.id) {
        res.status(400)
        throw new Error('User not autorized.')
    }
    res.status(200).json(product)
})

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found.')
    }

    if (product.userId.toString() !== req.user.id) {
        res.status(400)
        throw new Error('User not autorized.')
    }

    product.remove()
    res.status(200).json({ message: "Product successfully deleted." })
})

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    const file = req.file
    const { name, category, price, quantity, description, } = req.body
    const product = await Product.findById(id)

    if (!product) {
        res.status(404)
        throw new Error('Product don\'t exist')
    }

    if (product.userId.toString() !== req.user.id) {
        res.status(400)
        throw new Error('User not autorized.')
    }

    let fileData = {}
    if (file) {
        let imageUrl

        try {
            const uploadedImage = await cloudinary.uploader.upload(file.path, { folder: "Inventory", resource_type: 'image' })
            imageUrl = uploadedImage.secure_url
        } catch (error) {
            res.status(400)
            throw new Error("Image upload failed.")
        }

        fileData = {
            fileName: file.originalname,
            filePath: imageUrl,
            fileType: file.mimetype,
            fileSize: humanFileSize(file.size),
        }

    }

    product.name = name || product.name
    product.category = category || product.category
    product.price = price || product.price
    product.quantity = quantity || product.quantity
    product.description = description || product.description
    product.image = Object.keys(fileData).length === 0 ? product.image : fileData

    try {
        await product.save()
        res.status(200).json({ message: "Product successfully updated." })
    } catch (error) {
        res.status(500)
        throw new Error('Update failed.')
    }
})

module.exports = { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct }