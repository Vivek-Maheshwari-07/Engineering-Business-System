const productModel = require('../models/productModel');
const fs = require('fs');

// Orphan cleanup mapping helper 
const truncateUpload = (file) => {
    if (file) {
        try { fs.unlinkSync(file.path); } catch (e) {} // Silent skip if missing
    }
};

// @desc    Construct a product containing nested variants
// @route   POST /api/products
// @access  Private/Owner
const createProduct = async (req, res) => {
    try {
        const { name, category, gst_percentage } = req.body;
        let { variants } = req.body;

        // Native evaluation verifying core data bounds natively
        if (!name || !category || gst_percentage === undefined || !variants) {
            truncateUpload(req.file);
            return res.status(400).json({ success: false, message: 'Validation error: Please provide valid name, category, gst_percentage and bounds.' });
        }

        // Catch stringified JSON structurally injected from FormData bounds natively 
        if (typeof variants === 'string') {
            try {
                variants = JSON.parse(variants);
            } catch (err) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Invalid JSON structure mapping' });
            }
        }

        if (!Array.isArray(variants) || variants.length === 0) {
            truncateUpload(req.file);
            return res.status(400).json({ success: false, message: 'Validation error: Expected minimum 1 variant string mapping' });
        }

        // Validate variants struct content native properties
        const sizeSet = new Set();
        for (const v of variants) {
            if (!v.size || v.quantity === undefined || !v.unit || v.price === undefined) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Variant missing sizes, quantity, price or unit.' });
            }
            if (v.quantity <= 0 || v.price <= 0) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Restrictions require variant quantity and price strictly greater than 0.' });
            }
            const normSize = v.size.toString().toLowerCase().trim();
            if (sizeSet.has(normSize)) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: `Validation error: Duplicate variant size configuration structurally denied: ${v.size}` });
            }
            sizeSet.add(normSize);
        }

        // Assess attached image limits structurally mapping multer properties intrinsically
        let image_url = null;
        if (req.file) {
            // Natively constructs local `/uploads/fileName.jpg` structural strings
            image_url = `/uploads/${req.file.filename}`;
        }

        const productId = await productModel.createProduct({
            name,
            category,
            gst_percentage: parseFloat(gst_percentage) || 0,
            image_url
        }, variants);

        res.status(201).json({ success: true, message: 'Product constructed successfully', data: { productId } });
    } catch (error) {
        truncateUpload(req.file);
        console.error('[createProduct ERROR]', error);
        res.status(500).json({ success: false, message: 'Internal Server Error mutating Product generation logically' });
    }
};

// @desc    Retrieve structured product mappings inherently containing variants mapped out natively
// @route   GET /api/products
// @access  Private (Owner, Employee, Customer natively checked selectively)
const getAllProducts = async (req, res) => {
    try {
        const { search, category, page, limit } = req.query;
        
        const payload = await productModel.getAllProducts({
            search,
            category,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            includeInactive: false // Only active natively returned per explicit parameter requirements
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'Products fetched successfully',
            ...payload // Spread dynamically pushing paginated logic out
        });
    } catch (error) {
        console.error('[getAllProducts ERROR]', error);
        res.status(500).json({ success: false, message: 'Server boundary fault fetching specified array mappings.' });
    }
};

// @desc    Expose specific Product details mapping out internal variant boundaries structurally
// @route   GET /api/products/:id
// @access  Private 
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.getProductById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Target product functionally missing or intrinsically marked inactive.' });
        }

        res.status(200).json({ success: true, message: 'Product fetched successfully', data: product });
    } catch (error) {
        console.error('[getProductById ERROR]', error);
        res.status(500).json({ success: false, message: 'Server boundary fault fetching specified Product native configuration' });
    }
};

// @desc    Drop and replace historical product properties structurally mappings natively updating rows 
// @route   PUT /api/products/:id
// @access  Private/Owner
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, gst_percentage } = req.body;
        let { variants } = req.body;

        if (!name || !category || gst_percentage === undefined || !variants) {
            truncateUpload(req.file);
            return res.status(400).json({ success: false, message: 'Validation error: Missing core criteria natively mapping bounds.' });
        }

        if (typeof variants === 'string') {
            try {
                variants = JSON.parse(variants);
            } catch (err) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Invalid variant nested mapped string configuration' });
            }
        }

        if (!Array.isArray(variants) || variants.length === 0) {
            truncateUpload(req.file);
            return res.status(400).json({ success: false, message: 'Validation error: Variants array structurally denied tracking length.' });
        }

        const sizeSet = new Set();
        for (const v of variants) {
            if (!v.size || v.quantity === undefined || !v.unit || v.price === undefined) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Variant structurally lacking specific required mapped constraints' });
            }
            if (v.quantity <= 0 || v.price <= 0) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: 'Validation error: Restriction denied variant negative limits globally natively.' });
            }
            const normSize = v.size.toString().toLowerCase().trim();
            if (sizeSet.has(normSize)) {
                truncateUpload(req.file);
                return res.status(400).json({ success: false, message: `Validation error: Duplicate variant size uniquely denied constraint: ${v.size}` });
            }
            sizeSet.add(normSize);
        }

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        // Check if targeted target actually historically exists unconditionally even if locked
        const nativeProduct = await productModel.getProductById(id, true);
        if (!nativeProduct) {
            truncateUpload(req.file);
            return res.status(404).json({ success: false, message: 'Validation error: Structural record lacking completely from tables explicitly absent.' });
        }

        await productModel.updateProduct(id, {
            name,
            category,
            gst_percentage: parseFloat(gst_percentage) || 0,
            image_url 
        }, variants);

        res.status(200).json({ success: true, message: 'Product specifically overwritten cleanly securely.', data: null });
    } catch (error) {
        truncateUpload(req.file);
        console.error('[updateProduct ERROR]', error);
        res.status(500).json({ success: false, message: 'Internal logic configuration structurally faulted mutating explicitly' });
    }
};

// @desc    Natively purge target product triggering CASCADE rules securely
// @route   DELETE /api/products/:id
// @access  Private/Owner
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const nativeProduct = await productModel.getProductById(id);
        if (!nativeProduct) {
            return res.status(404).json({ success: false, message: 'Not found native mapping' });
        }

        await productModel.deleteProduct(id);
        
        res.status(200).json({ success: true, message: 'Database mapping and related nested variant cascades automatically deleted inherently' });
    } catch (error) {
        console.error('[deleteProduct ERROR]', error);
        res.status(500).json({ success: false, message: 'CASCADE failure structurally rejecting native bounds' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
