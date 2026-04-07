// Phase 1.7 — templates 라우트
const { Router } = require('express');
const templateService = require('../services/templateService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await templateService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:templateUid', async (req, res, next) => {
  try {
    const data = await templateService.get(req.params.templateUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
