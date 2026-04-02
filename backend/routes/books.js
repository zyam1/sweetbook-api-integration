const { Router } = require('express');
const bookService = require('../services/bookService');

const router = Router();

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

module.exports = router;
