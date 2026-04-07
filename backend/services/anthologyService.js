// 합본(Anthology) 조회 서비스
// 참조: prisma/schema.prisma Anthology / Contributor 모델
const db = require('./db');

const anthologyService = {
  // 내가 소유(주최)한 합본 목록 (마감일 빠른 순)
  async listOwned(userId) {
    if (!userId) return [];

    return db.anthology.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        bookSpecUid: true,
        deadline: true,
        status: true,
        createdAt: true,
        _count: {
          select: { contributors: true },
        },
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  // 내가 참여(contributor)한 합본 목록
  async listJoined(userId) {
    if (!userId) return [];

    const rows = await db.contributor.findMany({
      where: { userId },
      select: {
        id: true,
        handle: true,
        allocatedPages: true,
        status: true,
        anthology: {
          select: {
            id: true,
            title: true,
            bookSpecUid: true,
            deadline: true,
            status: true,
            ownerId: true,
          },
        },
      },
      orderBy: [
        { anthology: { deadline: 'asc' } },
      ],
    });

    return rows.map((c) => ({
      ...c.anthology,
      contributor: {
        id: c.id,
        handle: c.handle,
        allocatedPages: c.allocatedPages,
        status: c.status,
      },
    }));
  },
};

module.exports = anthologyService;
