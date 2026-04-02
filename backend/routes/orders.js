const { Router } = require('express');
const orderService = require('../services/orderService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await orderService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:orderUid', async (req, res, next) => {
  try {
    const data = await orderService.get(req.params.orderUid);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await orderService.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/estimate', async (req, res, next) => {
  try {
    const data = await orderService.estimate(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/:orderUid/cancel', async (req, res, next) => {
  try {
    const data = await orderService.cancel(req.params.orderUid, req.body.cancelReason);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
