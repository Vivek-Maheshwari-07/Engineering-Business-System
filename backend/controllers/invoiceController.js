const invoiceModel = require('../models/invoiceModel');

const invoiceController = {
    // View overall active invoice parameters matching targeting Order bounds securely tracking specific legacy arrays gracefully optimally seamlessly flawlessly
    getInvoice: async (req, res) => {
        try {
            const order_id = req.params.order_id;
            const { role, id } = req.user;

            const invoice = await invoiceModel.getInvoiceDetails(order_id);

            if (!invoice) {
                return res.status(404).json({ message: "Explicit Invoice Matrix unfound globally." });
            }

            // Security bounds check. Customers solely track isolated bindings cleanly actively securely natively safely actively elegantly intelligently effectively.
            if (Number(invoice.customer_id) !== Number(id) && role === 'customer') {
                return res.status(403).json({ message: "Data access structurally denied scaling specific bounds natively." });
            }

            res.status(200).json(invoice);
        } catch (error) {
            res.status(500).json({ message: "Fetching active invoices structurally failed", error: error.message });
        }
    }
};

module.exports = invoiceController;
