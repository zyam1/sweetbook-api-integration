// 합본(Anthology) 서비스
// 참조: prisma/schema.prisma Anthology / Contributor / ContributorSubmission
//       .claude/rules/00-workflow.md (API 호출 순서)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const orderService = require('./orderService');
const anthologyFlowService = require('./anthologyFlowService');
const {
  ANTHOLOGY_BOOK_SPEC_UID,
  ANTHOLOGY_CONTENT_TEMPLATE_UID,
  ANTHOLOGY_COVER_TEMPLATE_UID,
} = require('./anthologyConstants');

const anthologyService = {
  // 내가 소유(주최)한 합본 목록 (마감일 빠른 순)
  async listOwned(userId) {
    if (!userId) return [];

    const rows = await db.anthology.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        bookSpecUid: true,
        deadline: true,
        status: true,
        createdAt: true,
        _count: { select: { contributors: true } },
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const refs = rows.map((a) => `anthology:${a.id}`);
    const orders = refs.length
      ? await db.order.findMany({ where: { externalRef: { in: refs } } })
      : [];
    const orderMap = new Map(orders.map((o) => [o.externalRef, o]));

    return rows.map((a) => ({
      ...a,
      latestOrder: orderMap.get(`anthology:${a.id}`) ?? null,
    }));
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
      orderBy: [{ anthology: { deadline: 'asc' } }],
    });

    const mapped = rows.map((c) => ({
      ...c.anthology,
      contributor: {
        id: c.id,
        handle: c.handle,
        allocatedPages: c.allocatedPages,
        status: c.status,
      },
    }));

    const refs = mapped.map((a) => `anthology:${a.id}`);
    const orders = refs.length
      ? await db.order.findMany({ where: { externalRef: { in: refs } } })
      : [];
    const orderMap = new Map(orders.map((o) => [o.externalRef, o]));

    return mapped.map((a) => ({
      ...a,
      latestOrder: orderMap.get(`anthology:${a.id}`) ?? null,
    }));
  },

  // 합본 생성
  async create(ownerId, { title, description, deadline, password }) {
    if (!password || !String(password).trim()) {
      const err = new Error('PASSWORD_REQUIRED');
      err.statusCode = 400;
      throw err;
    }
    const invitePasswordHash = await bcrypt.hash(password, 10);

    const data = {
      ownerId,
      title,
      description: description ?? null,
      bookSpecUid: ANTHOLOGY_BOOK_SPEC_UID,
      deadline: deadline ? new Date(deadline) : null,
      invitePasswordHash,
      contentTemplateUid: ANTHOLOGY_CONTENT_TEMPLATE_UID,
      coverTemplateUid: ANTHOLOGY_COVER_TEMPLATE_UID,
    };

    return db.anthology.create({ data });
  },

  // 합본 상세
  async getById(id) {
    const result = await db.anthology.findUnique({
      where: { id },
      include: {
        contributors: {
          include: { _count: { select: { submissions: true } } },
        },
        _count: { select: { contributors: true } },
      },
    });
    if (!result) return result;
    delete result.invitePasswordHash;
    result.contributorCount = result._count?.contributors ?? 0;
    result.pageCount = (result.contributors || []).reduce(
      (sum, c) => sum + (c._count?.submissions || 0),
      0
    );
    result.latestOrder = await orderService.syncByExternalRef(`anthology:${id}`);
    return result;
  },

  // 표지 정보 업데이트 (주최자 전용)
  async updateCover(id, ownerId, { frontPhoto, backPhoto }) {
    const anthology = await db.anthology.findUnique({ where: { id } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    const data = {};
    if (frontPhoto) data.coverFrontPhoto = frontPhoto;
    if (backPhoto) data.coverBackPhoto = backPhoto;
    return db.anthology.update({
      where: { id },
      data,
    });
  },

  // 표지 이미지 업로드 (주최자 전용) — multer가 디스크 저장 후 파일명만 반환
  async uploadCoverPhoto(id, ownerId, file) {
    const anthology = await db.anthology.findUnique({ where: { id } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    return { fileName: file.filename };
  },

  // contributor 추가 (초대)
  async addContributor(anthologyId, ownerId, { handle, allocatedPages, deadline }) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    const inviteToken = crypto.randomBytes(8).toString('hex');
    return db.contributor.create({
      data: {
        anthologyId,
        userId: null,
        handle: handle ?? null,
        allocatedPages: allocatedPages ?? 0,
        deadline: deadline ? new Date(deadline) : null,
        inviteToken,
      },
    });
  },

  // contributor 목록 (주최자 전용)
  async listContributors(anthologyId, ownerId) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    return db.contributor.findMany({
      where: { anthologyId },
      include: { _count: { select: { submissions: true } } },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  },

  // contributor 순서 변경 (주최자 전용)
  async reorderContributors(anthologyId, ownerId, orderedIds) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    return db.$transaction(
      orderedIds.map((cid, idx) =>
        db.contributor.update({
          where: { id: cid },
          data: { order: idx },
        })
      )
    );
  },

  // 주최자 대리 업로드 (특정 contributor에 파일 추가)
  async addOwnerSubmission(anthologyId, ownerId, contributorId, fileMeta) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    const contributor = await db.contributor.findUnique({ where: { id: contributorId } });
    if (!contributor || contributor.anthologyId !== anthologyId) {
      const err = new Error('CONTRIBUTOR_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    const { fileName, storedPath, mimeType, sizeBytes, dpi } = fileMeta;
    return db.contributorSubmission.create({
      data: {
        contributorId,
        fileName,
        storedPath,
        mimeType: mimeType ?? null,
        sizeBytes: sizeBytes ?? null,
        dpi: dpi ?? null,
      },
    });
  },

  // contributor 대시보드 (참여자 관점)
  async getContributorDashboard(contributorId) {
    const contributor = await db.contributor.findUnique({
      where: { id: contributorId },
      include: {
        anthology: {
          select: {
            id: true,
            title: true,
            bookSpecUid: true,
            deadline: true,
            status: true,
          },
        },
        _count: { select: { submissions: true } },
      },
    });
    if (!contributor) {
      const err = new Error('CONTRIBUTOR_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }

    const bookSpec = { pageMin: 24, pageMax: 130, pageIncrement: 2 };

    const minPhotos = contributor.allocatedPages && contributor.allocatedPages > 0
      ? contributor.allocatedPages
      : 24;

    const requirements = {
      handle: { ok: !!(contributor.handle && String(contributor.handle).trim()) },
      photoCount: {
        current: contributor._count.submissions,
        min: minPhotos,
      },
    };

    return {
      contributor: {
        id: contributor.id,
        handle: contributor.handle,
        allocatedPages: contributor.allocatedPages,
        status: contributor.status,
        deadline: contributor.deadline,
      },
      anthology: contributor.anthology,
      submissionCount: contributor._count.submissions,
      bookSpec,
      requirements,
    };
  },

  // contributor 인증 (초대 토큰 + 비밀번호)
  async authContributor(token, password) {
    const contributor = await db.contributor.findUnique({
      where: { inviteToken: token },
      include: { anthology: true },
    });
    if (!contributor) {
      const err = new Error('INVALID_TOKEN');
      err.statusCode = 401;
      throw err;
    }
    if (!contributor.anthology?.invitePasswordHash) {
      const err = new Error('PASSWORD_NOT_SET');
      err.statusCode = 401;
      throw err;
    }
    const ok = await bcrypt.compare(password ?? '', contributor.anthology.invitePasswordHash);
    if (!ok) {
      const err = new Error('INVALID_PASSWORD');
      err.statusCode = 401;
      throw err;
    }
    await db.contributor.update({
      where: { id: contributor.id },
      data: { tokenUsedAt: new Date() },
    });
    const jwtToken = jwt.sign(
      {
        contributorId: contributor.id,
        anthologyId: contributor.anthologyId,
        handle: contributor.handle,
      },
      process.env.CONTRIBUTOR_JWT_SECRET,
      { expiresIn: '7d' }
    );
    return { token: jwtToken, contributor };
  },

  async updateMyHandle(contributorId, handle) {
    if (!handle || !String(handle).trim()) {
      const err = new Error('HANDLE_REQUIRED');
      err.statusCode = 400;
      throw err;
    }
    return db.contributor.update({
      where: { id: contributorId },
      data: { handle: String(handle).trim() },
    });
  },

  // contributor 제출물 추가
  async addSubmission(contributorId, { fileName, storedPath, mimeType, sizeBytes, dpi, bindingKey }) {
    const contributor = await db.contributor.findUnique({ where: { id: contributorId } });
    if (!contributor) {
      const err = new Error('CONTRIBUTOR_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (contributor.status === 'SUBMITTED') {
      const err = new Error('이미 제출된 상태입니다. 취소 후 다시 업로드하세요.');
      err.statusCode = 409;
      throw err;
    }
    const created = await db.contributorSubmission.create({
      data: {
        contributorId,
        fileName,
        storedPath,
        mimeType: mimeType ?? null,
        sizeBytes: sizeBytes ?? null,
        dpi: dpi ?? null,
        bindingKey: bindingKey ?? null,
      },
    });
    if (contributor.status === 'PENDING') {
      await db.contributor.update({
        where: { id: contributorId },
        data: { status: 'DRAFT' },
      });
    }
    return created;
  },

  // contributor 제출 확정 (DRAFT → SUBMITTED)
  async submitContribution(contributorId) {
    const contributor = await db.contributor.findUnique({
      where: { id: contributorId },
      include: {
        _count: { select: { submissions: true } },
      },
    });
    if (!contributor) {
      const err = new Error('CONTRIBUTOR_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (contributor.status === 'SUBMITTED') {
      const err = new Error('이미 제출됨');
      err.statusCode = 409;
      throw err;
    }
    if (contributor._count.submissions === 0) {
      const err = new Error('업로드된 파일이 없습니다');
      err.statusCode = 400;
      throw err;
    }
    if (!contributor.handle || !String(contributor.handle).trim()) {
      const err = new Error('HANDLE_REQUIRED');
      err.statusCode = 400;
      throw err;
    }
    const updated = await db.contributor.update({
      where: { id: contributorId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
      select: {
        id: true,
        handle: true,
        allocatedPages: true,
        status: true,
        submittedAt: true,
      },
    });
    return updated;
  },

  // contributor 제출 취소 (SUBMITTED → DRAFT)
  async unsubmitContribution(contributorId) {
    const contributor = await db.contributor.findUnique({ where: { id: contributorId } });
    if (!contributor) {
      const err = new Error('CONTRIBUTOR_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (contributor.status !== 'SUBMITTED') {
      const err = new Error('제출되지 않은 상태');
      err.statusCode = 409;
      throw err;
    }
    if (contributor.deadline && new Date() > contributor.deadline) {
      const err = new Error('마감 후 취소 불가');
      err.statusCode = 409;
      throw err;
    }
    const updated = await db.contributor.update({
      where: { id: contributorId },
      data: { status: 'DRAFT', submittedAt: null },
      select: {
        id: true,
        handle: true,
        allocatedPages: true,
        status: true,
        submittedAt: true,
      },
    });
    return updated;
  },

  // contributor 제출물 목록
  async listSubmissions(contributorId) {
    return db.contributorSubmission.findMany({
      where: { contributorId },
      orderBy: { createdAt: 'asc' },
    });
  },

  // 합본 최종화 — Lazy Bind 실행
  async finalize(anthologyId, ownerId) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    const contributors = await db.contributor.findMany({
      where: { anthologyId },
      orderBy: { id: 'asc' },
    });
    const submissions = await db.contributorSubmission.findMany({
      where: { contributorId: { in: contributors.map((c) => c.id) } },
      orderBy: { id: 'asc' },
    });

    const { bookUid, estimate } = await anthologyFlowService.runFinalize(
      anthology,
      contributors,
      submissions
    );

    const updated = await db.anthology.update({
      where: { id: anthologyId },
      data: { status: 'FINALIZED' },
    });

    return { anthology: updated, bookUid, estimate };
  },

  // 합본 주문 생성
  async createOrder(anthologyId, ownerId, { quantity, shipping }) {
    const anthology = await db.anthology.findUnique({ where: { id: anthologyId } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    if (anthology.status !== 'FINALIZED') {
      const err = new Error('NOT_FINALIZED');
      err.statusCode = 400;
      throw err;
    }
    const bookUid = anthology.bookUid;
    if (!bookUid) {
      const err = new Error('BOOK_UID_NOT_CACHED');
      err.statusCode = 409;
      throw err;
    }
    return orderService.create({
      items: [{ bookUid, quantity }],
      shipping,
      externalRef: `anthology:${anthologyId}`,
    });
  },

  // 합본 삭제 (주최자 전용)
  async remove(id, ownerId) {
    const anthology = await db.anthology.findUnique({ where: { id } });
    if (!anthology) {
      const err = new Error('ANTHOLOGY_NOT_FOUND');
      err.statusCode = 404;
      throw err;
    }
    if (anthology.ownerId !== ownerId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }
    const linkedOrder = await db.order.findFirst({
      where: { externalRef: `anthology:${id}` },
    });
    if (linkedOrder) {
      const err = new Error('ORDER_EXISTS');
      err.statusCode = 409;
      throw err;
    }
    await db.$transaction(async (tx) => {
      const contributors = await tx.contributor.findMany({
        where: { anthologyId: id },
        select: { id: true },
      });
      const contributorIds = contributors.map((c) => c.id);
      if (contributorIds.length > 0) {
        await tx.contributorSubmission.deleteMany({
          where: { contributorId: { in: contributorIds } },
        });
      }
      await tx.contributor.deleteMany({ where: { anthologyId: id } });
      await tx.anthology.delete({ where: { id } });
    });
    try {
      const dir = path.join(__dirname, '..', 'uploads', 'anthology', String(id));
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {
      console.warn('[anthology.remove] uploads 디렉터리 삭제 실패', e.message);
    }
    return { ok: true };
  },
};

module.exports = anthologyService;
