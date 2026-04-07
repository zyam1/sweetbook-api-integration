// Phase 1.2 — templates 서비스
// SDK 미지원이라 BaseClient의 _get을 빌려 직접 호출
const client = require('./sweetbook');

const templateService = {
  list(params) {
    // params: { bookSpecUid, templateKind, category, limit, offset }
    return client.books._get('/templates', params);
  },

  get(templateUid) {
    return client.books._get(`/templates/${templateUid}`);
  },
};

module.exports = templateService;
