const { Invoice } = require('./models/invoiceModel');
const db = require('./config/db');

async function testFullFlow() {
    try {
        console.log('--- Testing Full Invoice Controller Flow ---');
        
        const req_body = {
            customer_name: 'Test Customer',
            customer_email: 'test@example.com',
            customer_address: '123 Test St',
            customer_gstin: '24AAAAA0000A1Z5',
            subtotal: 1000.00,
            gst_rate: 18,
            gst_amount: 180.00,
            total: 1180.00,
            status: 'draft',
            due_date: '2026-04-30',
            notes: 'Test invoice',
            // customer_id is missing as it is on the frontend
            items: [
                { description: 'Test Item 1', hsn_code: '8480', quantity: 1, unit_price: 1000.00, amount: 1000.00 }
            ]
        };

        const { items, ...invoiceData } = req_body;
        
        // Match Controller logic
        const timestamp = Date.now().toString().slice(-6);
        invoiceData.invoice_number = `INV-TEST-${timestamp}`;
        const mock_user_id = 8; // Valid user ID 

        console.log('Invoice Data to be saved:', invoiceData);

        const id = await Invoice.create(invoiceData, items || [], mock_user_id);
        console.log('SUCCESS: Invoice created with ID:', id);
        
    } catch (err) {
        console.error('FAILURE:', err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

testFullFlow();
