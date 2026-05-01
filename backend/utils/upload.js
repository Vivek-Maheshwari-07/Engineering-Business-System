const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the `uploads/` directory exists natively so multer doesn't crash on the first call
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Map storage structure configurations
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Appends UNIX timestamp cleanly mapping unique iterations avoiding namespace collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

// File validation natively blocking arbitrary payloads 
const fileFilter = (req, file, cb) => {
    // Check against explicit MIME structural types
    const allowedTypes = /jpeg|jpg|png/;
    // Check both extname and mimetype
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // Form a hard boundary error rejected natively inside the routing cycle
        return cb(new multer.MulterError('LIMIT_FILE_TYPES', 'Only standard image files (jpeg/jpg/png) are allowed natively!'), false);
    }
};

// Map export configuration bounds restricting 2MB structurally
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB ceiling limit
    fileFilter: fileFilter
});

module.exports = upload;
