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

  async create(data) {
    const order = await client.orders.create(data);

    // SweetBook 주문 생성 성공 시 로컬 DB에도 기록
    await db.order.create({
      data: {
        sweetbookOrderUid: order.orderUid,
        externalRef: data.externalRef ?? null,
        status: order.status ?? 'PAID',
        quantity: data.items?.[0]?.quantity ?? 0,
        totalAmount: order.totalAmount ?? 0,
        paidCreditAmount: order.paidCreditAmount ?? 0,
        recipientName: data.shipping?.recipientName ?? null,
      },
    });

    return order;
  },

  estimate(data) {
    return client.orders.estimate(data);
  },

  cancel(orderUid, cancelReason) {
    return client.orders.cancel(orderUid, cancelReason);
  },
};

module.exports = orderService;
