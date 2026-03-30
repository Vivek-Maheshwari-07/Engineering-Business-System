const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function populateInventory() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('📦 Populating default inventory items...');
        
        const items = [
            ['ALLOY STEEL P-20 (1.2311)', 'AS-P20-12311', 'Alloy Steel', 100, 260, 'KG', '84802000', 'ALLOY STEEL P-20 (1.2311) for mould base'],
            ['EN-31 ROUND BAR', 'EN31-RB-001', 'Round Bar', 500, 75, 'KG', '7228', 'High Carbon Alloy Steel EN-31'],
            ['WPS ROUND BAR', 'WPS-RB-002', 'Round Bar', 300, 320, 'KG', '7228', 'WPS Grade High Speed Steel'],
            ['S S BRIGHT BARS/FLATE', 'SS-BB-003', 'Bright Bar', 200, 180, 'KG', '7222', 'Stainless Steel 304 Grade'],
            ['P-20 (1.2738)', 'P20-12738', 'Alloy Steel', 50, 480, 'KG', '8480', 'Premium Mould Steel']
        ];

        for (const item of items) {
            // Check if already exists
            const [exists] = await connection.query('SELECT id FROM inventory WHERE sku = ?', [item[1]]);
            if (exists.length === 0) {
                await connection.query(
                    'INSERT INTO inventory (name, sku, category, quantity, price, unit, hsn_code, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    item
                );
                console.log(`Added: ${item[0]}`);
            }
        }

        console.log('✅ Inventory population complete!');
    } catch (err) {
        console.error('❌ Error populating inventory:', err.message);
    } finally {
        await connection.end();
        process.exit();
    }
}

populateInventory();
