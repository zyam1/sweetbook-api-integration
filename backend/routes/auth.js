const { Router } = require('express');
const userService = require('../services/userService');
const authService = require('../services/authService');

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: '필수 항목 누락' });
    }
    try {
      const user = await userService.createUser({ name, email, password });
      const token = authService.signToken(user);
      return res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      if (err && err.code === 'EMAIL_EXISTS') {
        return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다' });
      }
      return next(err);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '필수 항목 누락' });
    }
    const user = await userService.verifyCredentials({ email, password });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다',
      });
    }
    const token = authService.signToken(user);
    return res.status(200).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
