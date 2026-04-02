import client from '../../api/client';

export const bookApi = {
  getList(params) {
    return client.get('/books', { params });
  },

  get(bookUid) {
    return client.get(`/books/${bookUid}`);
  },

  create(data) {
    return client.post('/books', data);
  },

  finalize(bookUid) {
    return client.post(`/books/${bookUid}/finalization`);
  },

  delete(bookUid) {
    return client.delete(`/books/${bookUid}`);
  },
};
