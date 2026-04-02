const { Router } = require('express');
const creditService = require('../services/creditService');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await creditService.getBalance();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const data = await creditService.getTransactions(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
