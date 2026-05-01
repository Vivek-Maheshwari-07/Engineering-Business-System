const pool = require('../config/database'); // FIXED: was '../config/db' (wrong path)

const productModel = {
    // 1. Create Product & Variants inside a transaction
    createProduct: async (productData, variantsData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [productResult] = await connection.execute(
                'INSERT INTO products (name, category, gst_percentage, image_url) VALUES (?, ?, ?, ?)',
                [productData.name, productData.category, productData.gst_percentage || 0, productData.image_url || null]
            );

            const productId = productResult.insertId;

            for (const variant of variantsData) {
                await connection.execute(
                    'INSERT INTO product_variants (product_id, size, quantity, unit, price) VALUES (?, ?, ?, ?, ?)',
                    [productId, variant.size, variant.quantity, variant.unit, variant.price]
                );
            }

            await connection.commit();
            return productId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 2. Get all products with variants + inventory stock (PROBLEM 1 FIX)
    getAllProducts: async (filters = {}) => {
        const { search, category, page = 1, limit = 10, includeInactive } = filters;
        const offset = (page - 1) * limit;

        let queryParams = [];
        let whereClauses = [];

        if (!includeInactive) {
            whereClauses.push("p.status = 'active'");
        }
        if (search) {
            whereClauses.push("p.name LIKE ?");
            queryParams.push(`%${search}%`);
        }
        if (category) {
            whereClauses.push("p.category = ?");
            queryParams.push(category);
        }

        const whereString = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

        const countQuery = `SELECT COUNT(*) AS total FROM products p ${whereString}`;
        const [[{ total }]] = await pool.execute(countQuery, queryParams);

        if (total === 0) {
            return { total: 0, page: Number(page), limit: Number(limit), data: [] };
        }

        const limitNum  = Number(limit)  || 10;
        const offsetNum = Number(offset) || 0;

        const productQuery = `
            SELECT p.id, p.name, p.category, p.gst_percentage, p.image_url, p.status, p.created_at
            FROM products p
            ${whereString}
            ORDER BY p.id DESC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
        const [products] = await pool.execute(productQuery, queryParams);
        const productIds  = products.map(p => p.id);

        // PROBLEM 1 FIX: JOIN inventory so quantity_available travels with each variant
        const [variants] = await pool.query(
            `SELECT
                v.id, v.product_id, v.size, v.quantity, v.unit, v.price,
                COALESCE(i.quantity_available, 0) AS quantity_available
             FROM product_variants v
             LEFT JOIN inventory i ON i.variant_id = v.id
             WHERE v.product_id IN (?)`,
            [productIds]
        );

        const productMap = {};
        for (const p of products) {
            productMap[p.id] = { ...p, variants: [] };
        }

        for (const v of variants) {
            if (productMap[v.product_id]) {
                productMap[v.product_id].variants.push({
                    id:                 v.id,
                    size:               v.size,
                    quantity:           v.quantity,       // original stock defined on variant
                    unit:               v.unit,
                    price:              v.price,
                    quantity_available: Number(v.quantity_available), // live inventory stock
                    in_stock:           Number(v.quantity_available) > 0
                });
            }
        }

        return {
            total: Number(total),
            page:  Number(page),
            limit: Number(limit),
            data:  Object.values(productMap)
        };
    },

    // 3. Get single product with variants + inventory stock (PROBLEM 1 FIX)
    getProductById: async (id, includeInactive = false) => {
        let sql = `
            SELECT
                p.id, p.name, p.category, p.gst_percentage, p.image_url, p.status, p.created_at,
                v.id   AS variant_id,
                v.size, v.quantity, v.unit, v.price,
                COALESCE(i.quantity_available, 0) AS quantity_available
            FROM products p
            LEFT JOIN product_variants v ON p.id = v.product_id
            LEFT JOIN inventory        i ON i.variant_id = v.id
            WHERE p.id = ?
        `;
        if (!includeInactive) {
            sql += ` AND p.status = 'active'`;
        }

        const [rows] = await pool.execute(sql, [id]);
        if (rows.length === 0) return null;

        const product = {
            id:             rows[0].id,
            name:           rows[0].name,
            category:       rows[0].category,
            gst_percentage: rows[0].gst_percentage,
            image_url:      rows[0].image_url,
            status:         rows[0].status,
            created_at:     rows[0].created_at,
            variants:       []
        };

        for (const row of rows) {
            if (row.variant_id) {
                product.variants.push({
                    id:                 row.variant_id,
                    size:               row.size,
                    quantity:           row.quantity,
                    unit:               row.unit,
                    price:              row.price,
                    quantity_available: Number(row.quantity_available),
                    in_stock:           Number(row.quantity_available) > 0
                });
            }
        }

        return product;
    },

    // 4. Update product (drop-and-replace variant strategy)
    updateProduct: async (id, productData, variantsData) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (productData.image_url) {
                await connection.execute(
                    'UPDATE products SET name = ?, category = ?, gst_percentage = ?, image_url = ? WHERE id = ?',
                    [productData.name, productData.category, productData.gst_percentage, productData.image_url, id]
                );
            } else {
                await connection.execute(
                    'UPDATE products SET name = ?, category = ?, gst_percentage = ? WHERE id = ?',
                    [productData.name, productData.category, productData.gst_percentage, id]
                );
            }

            await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);

            for (const variant of variantsData) {
                await connection.execute(
                    'INSERT INTO product_variants (product_id, size, quantity, unit, price) VALUES (?, ?, ?, ?, ?)',
                    [id, variant.size, variant.quantity, variant.unit, variant.price]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 5. Delete product (CASCADE handles variants + inventory rows)
    deleteProduct: async (id) => {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = productModel;
