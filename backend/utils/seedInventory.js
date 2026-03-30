const db = require('../config/db');

const initialProducts = [
    {
        name: 'ALLOY STEEL P-20 (1.2311)',
        category: 'Alloy Steel',
        sku: 'AS-P20-12311',
        hsn_code: '84802000',
        quantity: 100,
        unit: 'kg',
        price: 260.00,
        min_stock: 20,
        supplier: 'Default Supplier',
        description: 'ALLOY STEEL P-20 (1.2311) for mould base'
    },
    {
        name: 'ALLOY STEEL P-20 (1.2738)',
        category: 'Alloy Steel',
        sku: 'AS-P20-12738',
        hsn_code: '722830',
        quantity: 50,
        unit: 'kg',
        price: 200.00,
        min_stock: 10,
        supplier: 'Default Supplier',
        description: 'ALLOY STEEL P-20 (1.2738) for high polish moulds'
    },
    {
        name: 'S S BRIGHT BARS/FLATE',
        category: 'Raw Materials',
        sku: 'SS-BB-FLATE',
        hsn_code: '722220',
        quantity: 200,
        unit: 'kg',
        price: 400.00,
        min_stock: 30,
        supplier: 'Default Supplier',
        description: 'S S BRIGHT BARS/FLATE'
    },
    {
        name: 'CUTTING CHARGES',
        category: 'Services',
        sku: 'SVC-CUT',
        hsn_code: '8441',
        quantity: 999,
        unit: 'pcs',
        price: 557.00,
        min_stock: 0,
        supplier: 'Internal',
        description: 'Standard cutting charges'
    }
];

const seed = async () => {
    console.log('Starting inventory seeding...');
    for (const p of initialProducts) {
        try {
            const [existing] = await db.query('SELECT id FROM inventory WHERE sku = ?', [p.sku]);
            if (existing.length === 0) {
                const status = p.quantity <= 0 ? 'out_of_stock' : p.quantity <= p.min_stock ? 'low_stock' : 'in_stock';
                await db.query(
                    'INSERT INTO inventory (name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [p.name, p.category, p.sku, p.hsn_code, p.quantity, p.unit, p.price, p.min_stock, p.supplier, p.description, status]
                );
                console.log(`Added: ${p.name}`);
            } else {
                console.log(`Skipped (already exists): ${p.name}`);
            }
        } catch (error) {
            console.error(`Error adding ${p.name}:`, error.message);
        }
    }
    console.log('Seeding finished.');
    process.exit(0);
};

seed();
