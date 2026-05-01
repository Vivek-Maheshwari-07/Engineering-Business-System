const express = require('express');
const router = express.Router();

const { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../utils/upload');

// @route   POST /api/products
// @desc    Add Product structured with nested variants arrays
// @access  Owner natively
router.post('/', 
    protect, 
    checkRole('owner'), 
    upload.single('image'), 
    createProduct
);

// @route   GET /api/products
// @desc    Retrieve products mapping variants internally structurally
// @access  Private System (Owner, Employee, Customer logically grouped)
router.get('/', 
    protect, 
    getAllProducts
);

// @route   GET /api/products/:id
// @desc    Retrieve explicit products mapping natively
// @access  Private System
router.get('/:id', 
    protect, 
    getProductById
);

// @route   PUT /api/products/:id
// @desc    Overwrite existing bounds replacing Variants mapped inside structurally
// @access  Owner 
router.put('/:id', 
    protect, 
    checkRole('owner'), 
    upload.single('image'), 
    updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Trigger explicit cascading native execution structurally
// @access  Owner
router.delete('/:id', 
    protect, 
    checkRole('owner'), 
    deleteProduct
);

module.exports = router;
