const { Invoice } = require('../models/invoiceModel');

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.getAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching invoices' });
    }
};

const getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.getByCustomer(req.user.id);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching invoices' });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.getById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching invoice' });
    }
};

const createInvoice = async (req, res) => {
    try {
        const { items, ...invoiceData } = req.body;
        // Generate invoice number
        const timestamp = Date.now().toString().slice(-6);
        invoiceData.invoice_number = `INV-${new Date().getFullYear()}-${timestamp}`;
        const id = await Invoice.create(invoiceData, items || [], req.user.id);
        res.status(201).json({ message: 'Invoice created', id, invoice_number: invoiceData.invoice_number });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating invoice' });
    }
};

const updateInvoiceStatus = async (req, res) => {
    try {
        const updated = await Invoice.updateStatus(req.params.id, req.body.status);
        if (!updated) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating invoice' });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const deleted = await Invoice.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting invoice' });
    }
};

const getRevenueReport = async (req, res) => {
    try {
        const data = await Invoice.getReportData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error generating report' });
    }
};

module.exports = { getAllInvoices, getMyInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, deleteInvoice, getRevenueReport };
