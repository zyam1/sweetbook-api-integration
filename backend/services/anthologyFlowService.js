// Anthology Lazy Bind Flow
// 합본 데이터(anthology + contributors + submissions)를 SweetBook API 호출 순서에 따라
// 책 생성 → 사진 업로드 → 표지 → 내지 → 최종화 → 견적 까지 진행한다.
// 참조: .claude/rules/00-workflow.md, 03-book-creation.md, 04-image-upload.md, 05-order.md
const fs = require('fs');
const path = require('path');
const bookService = require('./bookService');
const orderService = require('./orderService');

// anthologyId -> bookUid (in-memory). createOrder에서 사용.
const bookUidCache = new Map();

function guessContentType(fileName) {
  const ext = path.extname(fileName || '').toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.bmp') return 'image/bmp';
  if (ext === '.heic' || ext === '.heif') return 'image/heic';
  return 'image/jpeg';
}

async function runFinalize(anthology, contributors, allSubmissions) {
  if (!anthology.coverTemplateUid || !anthology.coverFrontPhoto) {
    const err = new Error('COVER_NOT_CONFIGURED');
    err.statusCode = 400;
    throw err;
  }

  // 1) POST /books
  const book = await bookService.create({
    title: anthology.title,
    bookSpecUid: anthology.bookSpecUid,
    externalRef: `anthology:${anthology.id}`,
  });
  const bookUid = book.bookUid;

  // 2) POST /books/{id}/photos — submissions의 storedPath를 모두 업로드
  const files = allSubmissions.map((s) => ({
    filename: s.fileName,
    contentType: s.mimeType || guessContentType(s.fileName),
    buffer: fs.readFileSync(s.storedPath),
  }));
  if (files.length > 0) {
    await bookService.uploadPhotos(bookUid, files);
  }

  // 3) POST /books/{id}/cover
  await bookService.setCover(bookUid, {
    templateUid: anthology.coverTemplateUid,
    parameters: {
      frontPhoto: anthology.coverFrontPhoto,
      ...(anthology.coverBackPhoto ? { backPhoto: anthology.coverBackPhoto } : {}),
    },
  });

  // 4) POST /books/{id}/contents — contributor 단위 반복
  const contentTemplateUid = process.env.DEFAULT_CONTENT_TEMPLATE_UID;
  for (const c of contributors) {
    const subs = allSubmissions.filter((s) => s.contributorId === c.id);
    if (subs.length === 0) continue;
    await bookService.insertContent(bookUid, {
      templateUid: contentTemplateUid,
      parameters: {
        title: c.handle || `contributor-${c.id}`,
        photos: subs.map((s) => s.fileName),
      },
      breakBefore: 'page',
    });
  }

  // 5) POST /books/{id}/finalization
  await bookService.finalize(bookUid);

  // 6) POST /orders/estimate (수량 1, dummy shipping)
  const estimate = await orderService.estimate({
    items: [{ bookUid, quantity: 1 }],
    shipping: {
      recipientName: 'estimate',
      recipientPhone: '00000000000',
      postalCode: '00000',
      address1: 'estimate',
      address2: '',
    },
  });

  bookUidCache.set(anthology.id, bookUid);
  return { bookUid, estimate };
}

function getBookUid(anthologyId) {
  return bookUidCache.get(anthologyId);
}

module.exports = { runFinalize, getBookUid };
