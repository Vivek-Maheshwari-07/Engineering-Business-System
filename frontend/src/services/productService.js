import api from './api';

export const getAllProducts = async (params = {}) => {
  let url = '/products';
  const query = [];
  if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
  if (params.category) query.push(`category=${encodeURIComponent(params.category)}`);
  if (params.page) query.push(`page=${params.page}`);
  if (params.limit) query.push(`limit=${params.limit}`);
  if (query.length > 0) url += `?${query.join('&')}`;

  const response = await api.get(url);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  // formData inherently handles multipart headers via the api interceptors seamlessly
  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
