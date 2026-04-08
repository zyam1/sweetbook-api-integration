const client = require('./sweetbook');
const db = require('./db');

const orderService = {
  // 기존 호출(SweetBook 원격 목록)은 그대로 유지.
  // 옵션 객체에 userId가 포함되면 로컬 DB에서 사용자별 주문을 조회한다.
  list(params) {
    if (params && typeof params === 'object' && params.userId != null) {
      const { userId, limit } = params;
      return db.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit ?? undefined,
      });
    }
    return client.orders.list(params);
  },

  get(orderUid) {
    return client.orders.get(orderUid);
  },

  async create(data, { userId } = {}) {
    const order = await client.orders.create(data);

    // SweetBook 주문 생성 성공 시 로컬 DB에도 기록
    const localData = {
      sweetbookOrderUid: order.orderUid,
      externalRef: data.externalRef ?? null,
      status: order.status ?? 'PAID',
      quantity: data.items?.[0]?.quantity ?? 0,
      totalAmount: order.totalAmount ?? 0,
      paidCreditAmount: order.paidCreditAmount ?? 0,
      recipientName: data.shipping?.recipientName ?? null,
    };
    if (userId != null) localData.userId = userId;
    await db.order.create({ data: localData });

    return order;
  },

  estimate(data) {
    return client.orders.estimate(data);
  },

  cancel(orderUid, cancelReason) {
    return client.orders.cancel(orderUid, cancelReason);
  },

  // sweetbookOrderUid 기준으로 로컬 row를 최신 상태로 동기화
  async syncByOrderUid(sweetbookOrderUid) {
    const local = await db.order.findUnique({ where: { sweetbookOrderUid } });
    if (!local) return null;

    let remote;
    try {
      remote = await client.orders.get(sweetbookOrderUid);
    } catch (e) {
      return local;
    }

    const remoteStatus = remote?.status ?? null;
    const remoteTracking = remote?.trackingNumber ?? null;

    const statusChanged = remoteStatus && remoteStatus !== local.status;
    const trackingChanged =
      remoteTracking != null && remoteTracking !== local.trackingNumber;

    if (!statusChanged && !trackingChanged) return local;

    const data = {};
    if (statusChanged) data.status = remoteStatus;
    if (trackingChanged) data.trackingNumber = remoteTracking;

    return db.order.update({
      where: { id: local.id },
      data,
    });
  },

  // 로그인 사용자의 로컬 주문 목록 (각 항목 상태 동기화 포함)
  async listForUser(userId) {
    if (!userId) return [];
    const rows = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const synced = await Promise.all(
      rows.map(async (row) => {
        if (!row.sweetbookOrderUid) return row;
        try {
          const updated = await orderService.syncByOrderUid(row.sweetbookOrderUid);
          return updated ?? row;
        } catch (e) {
          return row;
        }
      })
    );
    return synced;
  },

  // 로그인 사용자의 주문 상세 (owner 검증 + anthology 사진 포함)
  async getDetailForUser(sweetbookOrderUid, userId) {
    const order = await db.order.findUnique({ where: { sweetbookOrderUid } });
    if (!order) return null;
    if (order.userId !== userId) {
      const err = new Error('FORBIDDEN');
      err.statusCode = 403;
      throw err;
    }

    let finalOrder = order;
    try {
      const updated = await orderService.syncByOrderUid(sweetbookOrderUid);
      if (updated) finalOrder = updated;
    } catch (e) {
      // 동기화 실패 시 로컬 데이터 유지
    }

    let anthology = null;
    let photos = [];
    const ref = finalOrder.externalRef;
    const match = ref && /^anthology:(.+)$/.exec(ref);
    if (match) {
      const anthologyId = match[1];
      const anth = await db.anthology.findUnique({
        where: { id: anthologyId },
        select: { id: true, title: true, status: true, bookUid: true },
      });
      if (anth) {
        anthology = anth;
        const submissions = await db.contributorSubmission.findMany({
          where: { contributor: { anthologyId } },
          include: { contributor: { select: { handle: true, id: true } } },
          orderBy: [{ contributorId: 'asc' }, { order: 'asc' }],
        });
        photos = submissions.map((s) => ({
          id: s.id,
          fileName: s.fileName,
          storedPath: s.storedPath,
          contributorHandle: s.contributor?.handle ?? null,
          contributorId: s.contributor?.id ?? null,
          order: s.order,
        }));
      }
    }

    return { order: finalOrder, anthology, photos };
  },

  // externalRef로 로컬 주문 조회 후, SweetBook에서 최신 상태를 가져와 동기화
  async syncByExternalRef(externalRef) {
    const local = await db.order.findFirst({ where: { externalRef } });
    if (!local) return null;
    if (!local.sweetbookOrderUid) return local;

    let remote;
    try {
      remote = await client.orders.get(local.sweetbookOrderUid);
    } catch (e) {
      return local;
    }

    const remoteStatus = remote?.status ?? null;
    const remoteTracking = remote?.trackingNumber ?? null;

    const statusChanged = remoteStatus && remoteStatus !== local.status;
    const trackingChanged =
      remoteTracking != null && remoteTracking !== local.trackingNumber;

    if (!statusChanged && !trackingChanged) return local;

    const data = {};
    if (statusChanged) data.status = remoteStatus;
    if (trackingChanged) data.trackingNumber = remoteTracking;

    return db.order.update({
      where: { id: local.id },
      data,
    });
  },
};

module.exports = orderService;
