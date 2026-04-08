// Anthology Lazy Bind Flow
// 합본 데이터(anthology + contributors + submissions)를 SweetBook API 호출 순서에 따라
// 책 생성 → 사진 업로드 → 표지 → 내지 → 최종화 → 견적 까지 진행한다.
// 참조: .claude/rules/00-workflow.md, 03-book-creation.md, 04-image-upload.md, 05-order.md
const fs = require('fs');
const path = require('path');
const bookService = require('./bookService');
const orderService = require('./orderService');
const client = require('./sweetbook');
const {
  ANTHOLOGY_BOOK_SPEC_UID,
  ANTHOLOGY_CONTENT_TEMPLATE_UID,
  ANTHOLOGY_COVER_TEMPLATE_UID,
  formatDateRange,
} = require('./anthologyConstants');

function badReq(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}

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
  if (!anthology.coverFrontPhoto) {
    const err = new Error('COVER_FRONT_PHOTO_NOT_SET');
    err.statusCode = 400;
    throw err;
  }

  console.log('[anthology finalize] 입력 요약', {
    anthologyId: anthology.id,
    bookSpecUid: ANTHOLOGY_BOOK_SPEC_UID,
    coverTemplateUid: ANTHOLOGY_COVER_TEMPLATE_UID,
    contentTemplateUid: ANTHOLOGY_CONTENT_TEMPLATE_UID,
    contributorCount: contributors.length,
    submissionCount: allSubmissions.length,
  });

  // 1) POST /books
  const book = await bookService.create({
    title: anthology.title,
    bookSpecUid: ANTHOLOGY_BOOK_SPEC_UID,
    externalRef: `anthology:${anthology.id}`,
  });
  const bookUid = book.bookUid;

  // 2) POST /books/{id}/photos — 표지 + submissions 일괄 업로드
  const coverDir = path.join(__dirname, '..', 'uploads', 'anthology', String(anthology.id), 'cover');
  const coverFiles = [];
  for (const coverName of [anthology.coverFrontPhoto, anthology.coverBackPhoto]) {
    if (!coverName) continue;
    const fullPath = path.join(coverDir, coverName);
    if (!fs.existsSync(fullPath)) {
      const err = new Error('COVER_PHOTO_FILE_MISSING');
      err.statusCode = 400;
      throw err;
    }
    coverFiles.push({
      filename: coverName,
      contentType: guessContentType(coverName),
      buffer: fs.readFileSync(fullPath),
    });
  }
  const submissionFiles = allSubmissions.map((s) => ({
    filename: s.fileName,
    contentType: s.mimeType || guessContentType(s.fileName),
    buffer: fs.readFileSync(s.storedPath),
  }));
  const allItems = [...coverFiles, ...submissionFiles];
  const nameMap = new Map();
  if (allItems.length > 0) {
    const results = await bookService.uploadPhotos(bookUid, allItems);
    results.forEach((r, i) => {
      const sbName = r?.data?.fileName;
      if (!sbName) {
        const err = new Error('PHOTO_UPLOAD_NO_FILENAME');
        err.statusCode = 500;
        throw err;
      }
      nameMap.set(allItems[i].filename, sbName);
    });
  }

  // 3) POST /books/{id}/cover
  const coverParams = {
    coverPhoto: nameMap.get(anthology.coverFrontPhoto),
    title: anthology.title,
    dateRange: formatDateRange(anthology.createdAt),
  };
  await bookService.setCover(bookUid, {
    templateUid: ANTHOLOGY_COVER_TEMPLATE_UID,
    parameters: coverParams,
  });

  // 4) POST /books/{id}/contents — 제출물마다 1회씩 반복
  for (const c of contributors) {
    const subs = allSubmissions.filter((s) => s.contributorId === c.id);
    if (subs.length === 0) {
      console.log(`[insertContent] SKIP contributor ${c.id} (${c.handle}) — 제출물 0`);
      continue;
    }
    const dayLabel = c.handle || `contributor-${c.id}`;
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      const contentParams = {
        photo: nameMap.get(sub.fileName),
        dayLabel,
        hasDayLabel: true,
      };
      console.log(`[insertContent] contributor ${c.id} subIdx=${i + 1}/${subs.length} params=`, JSON.stringify(contentParams));
      try {
        const r = await bookService.insertContent(bookUid, {
          templateUid: ANTHOLOGY_CONTENT_TEMPLATE_UID,
          parameters: contentParams,
          breakBefore: 'page',
        });
        console.log(`[insertContent] contributor ${c.id} subIdx=${i + 1} OK ->`, JSON.stringify(r).slice(0, 300));
      } catch (err) {
        console.error(`[insertContent] contributor ${c.id} subIdx=${i + 1} FAILED`, {
          message: err?.message,
          status: err?.status ?? err?.statusCode,
          body: err?.body,
          response: err?.response,
        });
        throw err;
      }
    }
  }

  // 5) POST /books/{id}/finalization
  // 사전 진단: 실제 pageCount + bookSpec 조회해 페이지 검증 규칙 위반을 사전에 드러냄
  // (.claude/rules/03-book-creation.md, 01-book-spec.md 참조)
  try {
    const bookInfo = await bookService.get(bookUid);
    const bookData = bookInfo?.data || bookInfo;
    console.log('[anthology finalize] 사전 진단', {
      bookUid,
      pageCount: bookData?.pageCount,
      status: bookData?.status,
      bookSpecUid: ANTHOLOGY_BOOK_SPEC_UID,
    });

    const specResp = await client.books._get(`/book-specs/${ANTHOLOGY_BOOK_SPEC_UID}`);
    const s = specResp?.data || specResp;
    console.log('[anthology finalize] bookSpec', {
      pageMin: s?.pageMin,
      pageMax: s?.pageMax,
      pageIncrement: s?.pageIncrement,
    });

    const pc = bookData?.pageCount ?? 0;
    if (s?.pageMin != null && pc < s.pageMin) {
      throw badReq(`INSUFFICIENT_PAGES:${pc}/${s.pageMin}`);
    }
    if (s?.pageMax != null && pc > s.pageMax) {
      throw badReq(`TOO_MANY_PAGES:${pc}/${s.pageMax}`);
    }
    if (s?.pageIncrement && ((pc - s.pageMin) % s.pageIncrement !== 0)) {
      throw badReq(`PAGE_INCREMENT_VIOLATION:${pc}`);
    }
  } catch (e) {
    if (e?.statusCode === 400) throw e;
    console.warn('[anthology finalize] 사전 진단 실패(무시하고 finalize 시도)', e?.message);
  }

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
