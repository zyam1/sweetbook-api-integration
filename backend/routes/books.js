const { Router } = require('express');
const multer = require('multer');
const bookService = require('../services/bookService');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res, next) => {
  try {
    const data = await bookService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookUid', async (req, res, next) => {
  try {
    const data = await bookService.get(req.params.bookUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await bookService.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookUid/finalization', async (req, res, next) => {
  try {
    const data = await bookService.finalize(req.params.bookUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:bookUid', async (req, res, next) => {
  try {
    await bookService.delete(req.params.bookUid);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Phase 1.3 — 사진 업로드
router.post('/:bookUid/photos', upload.array('files'), async (req, res, next) => {
  try {
    const files = (req.files || []).map((f) => ({
      buffer: f.buffer,
      filename: f.originalname,
      contentType: f.mimetype,
    }));
    const data = await bookService.uploadPhotos(req.params.bookUid, files);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookUid/photos', async (req, res, next) => {
  try {
    const data = await bookService.listPhotos(req.params.bookUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Phase 1.4 — 표지 설정
router.post('/:bookUid/cover', async (req, res, next) => {
  try {
    const data = await bookService.setCover(req.params.bookUid, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookUid/cover', async (req, res, next) => {
  try {
    const data = await bookService.getCover(req.params.bookUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Phase 1.5 — 내지 추가
router.post('/:bookUid/contents', async (req, res, next) => {
  try {
    const data = await bookService.insertContent(req.params.bookUid, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:bookUid/contents', async (req, res, next) => {
  try {
    await bookService.clearContents(req.params.bookUid);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
