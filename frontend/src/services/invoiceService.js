import api from './api';

// Invoices are auto-generated atomically during order creation.
// This fetches the invoice using the parent order_id.
export const getInvoiceByOrderId = (order_id) => api.get(`/invoice/${order_id}`);
