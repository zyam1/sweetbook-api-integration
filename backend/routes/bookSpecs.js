// Phase 1.8 — book-specs (판형) 라우트
const { Router } = require('express');
const bookSpecService = require('../services/bookSpecService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await bookSpecService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookSpecUid', async (req, res, next) => {
  try {
    const data = await bookSpecService.get(req.params.bookSpecUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
