import client from '../../api/client';

// 내 주문 목록 조회
export async function listOrders() {
  const { data } = await client.get('/orders');
  return data?.data ?? data;
}

// 주문 상세 조회
export async function getOrder(orderUid) {
  const { data } = await client.get(`/orders/${orderUid}`);
  return data?.data ?? data;
}
