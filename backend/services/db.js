// Prisma Client 싱글톤
// 참조: services/sweetbook.js 패턴
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
