const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { upload } = require('../utilits/imageUpload');
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct } = require('../controllers/productController');

router.post("/create", protect, upload.single('image'), createProduct)
router.get("/getproducts", protect, getProducts)
router.get("/:id", protect, getSingleProduct)
router.delete("/:id", protect, deleteProduct)
router.put("/update/:id", protect, upload.single('image'), updateProduct)

module.exports = router