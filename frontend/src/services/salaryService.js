import api from './api';

export const getEmployees        = ()        => api.get('/salary/employees');
export const upsertProfile       = (data)    => api.post('/salary/profiles', data);
export const getAllSalaryRecords  = (params)  => api.get('/salary/records', { params });
export const generateSalary      = (data)    => api.post('/salary/generate', data);
export const getMySalary         = ()        => api.get('/salary/my-salary');
export const getEmployeeHistory  = (user_id) => api.get(`/salary/history/${user_id}`);
