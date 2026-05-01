const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); // Load .env from parent directory

// ==========================================
// ⚙️ DATABASE CONNECTION CONFIG
// ==========================================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'engineering_erp'
};

// ==========================================
// 📦 DEMO PRODUCTS DATA
// ==========================================
const demoProducts = [
    {
        name: "Industrial Steel Rod (20mm)",
        category: "Raw Materials",
        gst_percentage: 18,
        price: 1200.00,
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "20mm x 6m", unit: "pieces", price: 1200.00, stock: 500 }
        ]
    },
    {
        name: "Heavy-Duty Nut Bolt Set",
        category: "Fasteners",
        gst_percentage: 18,
        price: 150.00,
        image_url: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "M10", unit: "box", price: 150.00, stock: 200 },
            { size: "M12", unit: "box", price: 200.00, stock: 150 }
        ]
    },
    {
        name: "Aluminum Sheet (Grade A)",
        category: "Raw Materials",
        gst_percentage: 18,
        price: 800.00,
        image_url: "https://images.unsplash.com/photo-1516246843873-9d12356b6fab?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "4x8 ft", unit: "sheets", price: 800.00, stock: 100 }
        ]
    },
    {
        name: "Insulated Copper Wire (50m)",
        category: "Electrical",
        gst_percentage: 18,
        price: 250.00,
        image_url: "https://images.unsplash.com/photo-1558451838-89c0a6b2808c?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "1.5 sq mm", unit: "roll", price: 250.00, stock: 300 },
            { size: "2.5 sq mm", unit: "roll", price: 400.00, stock: 250 }
        ]
    },
    {
        name: "Brass Pipe Fitting (T-Joint)",
        category: "Plumbing",
        gst_percentage: 18,
        price: 300.00,
        image_url: "https://images.unsplash.com/photo-1584347781177-8ee969a23b97?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "1 inch", unit: "pieces", price: 300.00, stock: 80 }
        ]
    },
    {
        name: "High-Pressure Hydraulic Pump",
        category: "Machinery",
        gst_percentage: 18,
        price: 8500.00,
        image_url: "https://images.unsplash.com/photo-1590587845604-bb5dbb13b1fc?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "100 Bar", unit: "unit", price: 8500.00, stock: 15 }
        ]
    },
    {
        name: "Precision Ball Bearing Set",
        category: "Mechanical Parts",
        gst_percentage: 18,
        price: 600.00,
        image_url: "https://images.unsplash.com/photo-1620287467389-9fc0fa1e5c3e?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "Standard", unit: "set", price: 600.00, stock: 120 }
        ]
    },
    {
        name: "Arc Welding Rods (Pack of 50)",
        category: "Welding",
        gst_percentage: 18,
        price: 400.00,
        image_url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "3.15mm", unit: "pack", price: 400.00, stock: 200 }
        ]
    },
    {
        name: "Industrial Air Compressor",
        category: "Machinery",
        gst_percentage: 18,
        price: 15000.00,
        image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "50 Liters", unit: "unit", price: 15000.00, stock: 10 }
        ]
    },
    {
        name: "Thermal Safety Gloves",
        category: "Safety Gear",
        gst_percentage: 18,
        price: 350.00,
        image_url: "https://images.unsplash.com/photo-1620242273188-7e28a5daefdf?auto=format&fit=crop&q=80&w=500",
        variants: [
            { size: "Large", unit: "pair", price: 350.00, stock: 500 },
            { size: "Medium", unit: "pair", price: 350.00, stock: 300 }
        ]
    }
];

// ==========================================
// 🚀 SEEDING LOGIC
// ==========================================
const seedDatabase = async (resetExisting = false) => {
    let connection;
    try {
        console.log('--------------------------------------------------');
        console.log('📦 Starting Database Seeding (Demo Products)...');
        console.log('--------------------------------------------------');

        connection = await mysql.createConnection(dbConfig);
        console.log('[DB] Connected to database successfully.');

        // ⚠️ OPTIONAL: Reset/Delete existing demo products before seeding
        if (resetExisting) {
            console.log('[WARN] Deleting existing products from database...');
            // Due to ON DELETE CASCADE, deleting from products will also clear product_variants, inventory, order_items, etc.
            await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
            await connection.query(`TRUNCATE TABLE products;`);
            await connection.query(`TRUNCATE TABLE product_variants;`);
            await connection.query(`TRUNCATE TABLE inventory;`);
            await connection.query(`TRUNCATE TABLE inventory_logs;`);
            await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);
            console.log('[INFO] Existing products and inventory deleted.');
        }

        let createdProducts = 0;
        let createdVariants = 0;

        // Loop through each demo product
        for (const product of demoProducts) {
            // Check if product already exists (by name)
            const [existing] = await connection.query(`SELECT id FROM products WHERE name = ?`, [product.name]);
            
            if (existing.length > 0 && !resetExisting) {
                console.log(`[SKIP] Product already exists: ${product.name}`);
                continue;
            }

            // Insert into products table
            const [result] = await connection.query(
                `INSERT INTO products (name, category, gst_percentage, image_url, status) VALUES (?, ?, ?, ?, 'active')`,
                [product.name, product.category, product.gst_percentage, product.image_url]
            );

            const productId = result.insertId;
            console.log(`[OK] Created Product: ${product.name} | ID: ${productId}`);
            createdProducts++;

            // Insert variants
            for (const variant of product.variants) {
                const [varResult] = await connection.query(
                    `INSERT INTO product_variants (product_id, size, quantity, unit, price) VALUES (?, ?, ?, ?, ?)`,
                    [productId, variant.size, 1, variant.unit, variant.price]
                );
                
                const variantId = varResult.insertId;
                createdVariants++;

                // Add to inventory (simulate stock receiving)
                await connection.query(
                    `INSERT INTO inventory (variant_id, quantity_available) VALUES (?, ?)`,
                    [variantId, variant.stock]
                );

                // Add initial stock log
                await connection.query(
                    `INSERT INTO inventory_logs (variant_id, change_type, quantity, reference_type) VALUES (?, 'IN', ?, 'MANUAL')`,
                    [variantId, variant.stock]
                );
                
                console.log(`  -> Added Variant: ${variant.size} | Stock: ${variant.stock}`);
            }
        }

        console.log('--------------------------------------------------');
        console.log('✅ Seeding Complete!');
        console.log(`📊 Summary: Created Products = ${createdProducts}, Created Variants = ${createdVariants}`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ [ERROR] Database seeding failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('[DB] Connection closed.');
        }
    }
};

// ==========================================
// ⚡ EXECUTE SCRIPT
// ==========================================
// To reset existing products before seeding, pass `true` to seedDatabase
const shouldReset = process.argv.includes('--reset');
seedDatabase(shouldReset);
