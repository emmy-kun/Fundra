import api from './api';

export const getMyWallet = async () => {
  return api.get('/api/wallets/my_wallet/');
};

export const addFunds = async (payload) => {
  return api.post('/api/wallets/add_funds/', payload);
};
