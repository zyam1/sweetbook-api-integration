const client = require('./sweetbook');
const db = require('./db');

const orderService = {
  list(params) {
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
