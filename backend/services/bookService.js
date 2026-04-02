const client = require('./sweetbook');

const bookService = {
  list(params) {
    return client.books.list(params);
  },

  get(bookUid) {
    return client.books.get(bookUid);
  },

  create(data) {
    return client.books.create(data);
  },

  finalize(bookUid) {
    return client.books.finalize(bookUid);
  },

  delete(bookUid) {
    return client.books.delete(bookUid);
  },
};

module.exports = bookService;
