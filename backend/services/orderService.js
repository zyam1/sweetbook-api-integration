const client = require('./sweetbook');

const orderService = {
  list(params) {
    return client.orders.list(params);
  },

  get(orderUid) {
    return client.orders.get(orderUid);
  },

  create(data) {
    return client.orders.create(data);
  },

  estimate(data) {
    return client.orders.estimate(data);
  },

  cancel(orderUid, cancelReason) {
    return client.orders.cancel(orderUid, cancelReason);
  },
};

module.exports = orderService;
