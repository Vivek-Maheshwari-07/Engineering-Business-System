import api from './api';

export const getReportSummary       = ()            => api.get('/reports/summary');
export const getMonthlyRevenue      = ()            => api.get('/reports/monthly-revenue');
export const getTopProducts         = (limit = 10)  => api.get(`/reports/top-products?limit=${limit}`);
export const getGSTReport           = ()            => api.get('/reports/gst');
export const getInventoryReport     = ()            => api.get('/reports/inventory');
export const getOrderStatusReport   = ()            => api.get('/reports/order-status');
