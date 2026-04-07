const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const anthologyService = require('../services/anthologyService');

const router = Router();

// 내 앤솔로지 목록 조회 (role=owner | contributor)
router.get('/', authRequired, async (req, res, next) => {
  try {
    const { role } = req.query;
    if (role === 'owner') {
      const data = await anthologyService.listOwned(req.user.id);
      return res.json(data);
    }
    if (role === 'contributor') {
      const data = await anthologyService.listJoined(req.user.id);
      return res.json(data);
    }
    return res.status(400).json({ error: 'INVALID_ROLE' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
