import api from './api';

export const createTransaction = async (payload) => {
  return api.post('/api/transactions/', payload);
};

export const getMyTransactions = async () => {
  return api.get('/api/transactions/my_transactions/');
};

export const getTransactionById = async (id) => {
  return api.get(`/api/transactions/${id}/`);
};

export const updateTransactionStatus = async (id, payload) => {
  return api.post(`/api/transactions/${id}/update_status/`, payload);
};

export const cancelTransaction = async (id) => {
  return api.post(`/api/transactions/${id}/cancel/`);
};

export const confirmDelivery = async (id) => {
  return api.post(`/api/transactions/${id}/confirm_delivery/`);
};
