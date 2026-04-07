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

  uploadPhotos(bookUid, files) {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    return client.post(`/books/${bookUid}/photos`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listPhotos(bookUid) {
    return client.get(`/books/${bookUid}/photos`);
  },

  setCover(bookUid, data) {
    return client.post(`/books/${bookUid}/cover`, data);
  },

  insertContent(bookUid, data) {
    return client.post(`/books/${bookUid}/contents`, data);
  },

  clearContents(bookUid) {
    return client.delete(`/books/${bookUid}/contents`);
  },
};
