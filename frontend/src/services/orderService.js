import api from './api';

export const createOrder = (data) => api.post('/orders', data);
export const getAllOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}`, { status });

