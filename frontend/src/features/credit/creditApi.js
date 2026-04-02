import client from '../../api/client';

export const creditApi = {
  getBalance() {
    return client.get('/credits');
  },

  getTransactions(params) {
    return client.get('/credits/transactions', { params });
  },
};
