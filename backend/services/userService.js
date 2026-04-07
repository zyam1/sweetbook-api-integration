// 사용자 서비스 - 회원가입/자격증명 검증
const bcrypt = require('bcryptjs');
const prisma = require('./db');

const userService = {
  async createUser({ name, email, password }) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: { id: true, email: true, name: true, createdAt: true },
      });
      return user;
    } catch (err) {
      if (err && err.code === 'P2002') {
        const e = new Error('EMAIL_EXISTS');
        e.code = 'EMAIL_EXISTS';
        throw e;
      }
      throw err;
    }
  },

  async verifyCredentials({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email, name: user.name };
  },
};

module.exports = userService;
