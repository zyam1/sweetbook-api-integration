// Phase 1.2 — templates 서비스
// SDK 미지원이라 BaseClient의 _get을 빌려 직접 호출
const client = require('./sweetbook');

const CACHE_TTL_MS = 3600 * 1000;
const cache = new Map(); // key: bookSpecUid, value: { ts, items }

function unwrapList(resp) {
  const candidates = [
    resp?.data?.data,
    resp?.data?.items,
    resp?.data?.templates,
    resp?.data,
    resp?.items,
    resp?.templates,
    resp,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function extractDefinitions(detail) {
  return (
    detail?.data?.parameters?.definitions ||
    detail?.parameters?.definitions ||
    {}
  );
}

function extractLayout(detail) {
  return detail?.data?.layout || detail?.layout;
}

const templateService = {
  list(params) {
    // params: { bookSpecUid, templateKind, category, limit, offset }
    return client.books._get('/templates', params);
  },

  get(templateUid) {
    return client.books._get(`/templates/${templateUid}`);
  },

  async listContentPhotoCapable(bookSpecUid) {
    const cached = cache.get(bookSpecUid);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.items;
    }

    const listResp = await templateService.list({
      bookSpecUid,
      templateKind: 'content',
      limit: 100,
    });
    const templates = unwrapList(listResp);

    const details = await Promise.all(
      templates.map((t) =>
        templateService.get(t.templateUid || t.uid).catch((err) => {
          console.warn(
            '[listContentPhotoCapable] detail fetch failed',
            t.templateUid || t.uid,
            err?.message
          );
          return null;
        })
      )
    );

    const items = [];
    templates.forEach((tpl, idx) => {
      const detail = details[idx];
      if (!detail) return;
      const definitions = extractDefinitions(detail);
      const layout = extractLayout(detail);
      const hasFileBinding = Object.values(definitions).some(
        (d) => d?.binding === 'file'
      );
      const hasElements = Array.isArray(layout?.elements) && layout.elements.length > 0;
      if (hasFileBinding && hasElements) {
        items.push(tpl);
      }
    });

    cache.set(bookSpecUid, { ts: Date.now(), items });
    return items;
  },
};

module.exports = templateService;
