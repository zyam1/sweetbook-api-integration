const client = require('./sweetbook');

const creditService = {
  getBalance() {
    return client.credits.getBalance();
  },

  getTransactions(params) {
    return client.credits.transactions(params);
  },
};

module.exports = creditService;
