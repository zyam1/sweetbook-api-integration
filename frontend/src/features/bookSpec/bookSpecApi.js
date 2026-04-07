import client from '../../api/client';

export const bookSpecApi = {
  list(params) {
    return client.get('/book-specs', { params });
  },
  get(bookSpecUid) {
    return client.get(`/book-specs/${bookSpecUid}`);
  },
};
