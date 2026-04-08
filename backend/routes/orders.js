const { Router } = require('express');
const { authRequired } = require('../middleware/auth');
const orderService = require('../services/orderService');

const router = Router();

// 내 주문 목록 조회
router.get('/', authRequired, async (req, res, next) => {
  try {
    const data = await orderService.listForUser(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// 내 주문 상세 조회
router.get('/:orderUid', authRequired, async (req, res, next) => {
  try {
    const data = await orderService.getDetailForUser(req.params.orderUid, req.user.id);
    if (!data) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
