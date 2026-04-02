import client from '../../api/client';

export const orderApi = {
  getList(params) {
    return client.get('/orders', { params });
  },

  get(orderUid) {
    return client.get(`/orders/${orderUid}`);
  },

  create(data) {
    return client.post('/orders', data);
  },

  estimate(data) {
    return client.post('/orders/estimate', data);
  },

  cancel(orderUid, cancelReason) {
    return client.post(`/orders/${orderUid}/cancel`, { cancelReason });
  },
};
