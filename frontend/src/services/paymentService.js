import api from './api';

export const addPayment        = (data)     => api.post('/payments', data);
export const getPaymentsByOrder = (order_id) => api.get(`/payments/${order_id}`);
