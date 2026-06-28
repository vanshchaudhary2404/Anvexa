const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure multer to store uploaded files in the 'uploads' directory



const router = express.Router();

// @desc    Get all products
router.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);

//specific product routes
router.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);


module.exports = router;

// C- Create
// R - Read
// U - Update
// D - Delete