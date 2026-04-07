// Phase 1.1 — book-specs (판형) 서비스
// SDK 미지원이라 BaseClient의 _get을 빌려 직접 호출
const client = require('./sweetbook');

const bookSpecService = {
  list(params) {
    return client.books._get('/book-specs', params);
  },

  get(bookSpecUid) {
    return client.books._get(`/book-specs/${bookSpecUid}`);
  },
};

module.exports = bookSpecService;
