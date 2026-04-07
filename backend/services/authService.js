// 인증 서비스 - JWT 발급
const jwt = require('jsonwebtoken');

const authService = {
  signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    return jwt.sign(
      { sub: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );
  },
};

module.exports = authService;
