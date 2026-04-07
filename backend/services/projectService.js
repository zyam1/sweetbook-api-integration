// 내 프로젝트(책) 조회 서비스
// 참조: prisma/schema.prisma Project 모델
const db = require('./db');

const projectService = {
  // 내 프로젝트 목록 (최근 편집순)
  async listMyProjects({ userId, status, limit } = {}) {
    if (!userId) return [];

    const where = { userId };
    if (status) where.status = status;

    return db.project.findMany({
      where,
      orderBy: { lastEditedAt: 'desc' },
      take: limit ?? undefined,
    });
  },

  // 가장 최근 편집한 프로젝트 1건 (Hero "이어서 작업"용)
  async getLastEditedProject(userId) {
    if (!userId) return null;

    return db.project.findFirst({
      where: { userId },
      orderBy: { lastEditedAt: 'desc' },
    });
  },
};

module.exports = projectService;
