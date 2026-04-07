// JWT 인증 미들웨어
const jwt = require('jsonwebtoken');

// Authorization 헤더에서 Bearer 토큰 추출
function extractToken(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

// 토큰 검증 후 req.user 세팅 (성공 시 true, 실패 시 false)
function verifyAndAttach(req, token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email };
    return true;
  } catch (err) {
    return false;
  }
}

// 인증 필수 - 토큰 없거나 invalid면 401
function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  if (!verifyAndAttach(req, token)) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  return next();
}

// 인증 선택 - 토큰 있으면 검증, 없거나 invalid면 그대로 통과
function authOptional(req, res, next) {
  const token = extractToken(req);
  if (token) {
    verifyAndAttach(req, token);
  }
  return next();
}

module.exports = { authRequired, authOptional };
