const client = require('./sweetbook');
const db = require('./db');

const bookService = {
  list(params) {
    return client.books.list(params);
  },

  get(bookUid) {
    return client.books._get(`/books/${bookUid}`);
  },

  async create(data) {
    const book = await client.books.create(data);

    // SweetBook 책 생성 성공 시 로컬 DB에 Project 기록
    await db.project.create({
      data: {
        bookUid: book.bookUid,
        title: data.title,
        bookSpecUid: data.bookSpecUid,
        externalRef: data.externalRef ?? null,
        status: 'DRAFT',
      },
    });

    return book;
  },

  async finalize(bookUid) {
    // SDK 우회: SweetbookApiError가 response body를 lock된 ReadableStream으로만 반환해
    // 실제 사유가 손실되는 문제를 회피하기 위해 fetch로 직접 호출.
    const baseUrl = process.env.SWEETBOOK_API_BASE_URL;
    const apiKey = process.env.SWEETBOOK_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new Error('SWEETBOOK_API_BASE_URL/SWEETBOOK_API_KEY 환경변수 누락');
    }
    const url = `${baseUrl.replace(/\/$/, '')}/books/${bookUid}/finalization`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const bodyText = await resp.text();
    console.log('[bookService.finalize] status:', resp.status, 'body:', bodyText);
    if (!resp.ok) {
      const err = new Error(`FINALIZE_FAILED: ${resp.status} ${bodyText}`);
      err.statusCode = 400;
      throw err;
    }
    let result;
    try {
      result = JSON.parse(bodyText);
    } catch {
      result = bodyText;
    }

    // 최종화 성공 시 로컬 상태 갱신
    await db.project.updateMany({
      where: { bookUid },
      data: { status: 'FINALIZED' },
    });

    return result;
  },

  async delete(bookUid) {
    const result = await client.books.delete(bookUid);
    await db.project.deleteMany({ where: { bookUid } });
    return result;
  },

  // Phase 1.3 — 사진 업로드 (SDK 우회: fetch 직접 호출해서 본문 확인)
  async uploadPhotos(bookUid, files) {
    const results = [];
    for (const f of files) {
      console.log('[uploadPhotos] file:', f.filename, f.contentType, f.buffer?.length, 'bytes');
      const fd = new FormData();
      const blob = new Blob([f.buffer], { type: f.contentType });
      fd.append('file', blob, f.filename);

      const url = `${process.env.SWEETBOOK_API_BASE_URL}/Books/${bookUid}/photos`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SWEETBOOK_API_KEY}`,
          'Idempotency-Key': require('crypto').randomUUID(),
        },
        body: fd,
      });
      const text = await res.text();
      console.log('[uploadPhotos] status:', res.status, 'body:', text);
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}: ${text}`);
        err.statusCode = res.status;
        throw err;
      }
      results.push(JSON.parse(text));
    }
    return results;
  },

  listPhotos(bookUid) {
    return client.photos.list(bookUid);
  },

  // Phase 1.4 — 표지 설정
  setCover(bookUid, { templateUid, parameters, files } = {}) {
    return client.covers.create(bookUid, templateUid, parameters || {}, files);
  },

  getCover(bookUid) {
    return client.covers.get(bookUid);
  },

  // Phase 1.5 — 내지 추가
  insertContent(bookUid, { templateUid, parameters, files, breakBefore } = {}) {
    return client.contents.insert(bookUid, templateUid, parameters || {}, { files, breakBefore });
  },

  clearContents(bookUid) {
    return client.contents.clear(bookUid);
  },
};

module.exports = bookService;
