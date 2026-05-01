import api from './api';

export const getInventory = () => api.get('/inventory');
export const getInventoryLogs = () => api.get('/inventory/logs');
export const addStock = (data) => api.post('/inventory/add', data);
export const reduceStock = (data) => api.post('/inventory/reduce', data);
