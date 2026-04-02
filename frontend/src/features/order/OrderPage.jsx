import { useState, useEffect } from 'react';
import { orderApi } from './orderApi';
import ResultView from '../../components/ResultView';

export default function OrderPage() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderApi.getList();
        setOrders(data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="page">
      <h2>주문 목록</h2>
      {loading && <p className="loading">불러오는 중...</p>}
      {error && <p className="error">오류: {error}</p>}
      {orders && (
        Array.isArray(orders) && orders.length > 0 ? (
          <div className="card-list">
            {orders.map((order) => (
              <div key={order.orderUid} className="card">
                <h3>주문 {order.orderUid?.slice(0, 12)}...</h3>
                <span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span>
                <p className="card-meta">{order.totalAmount?.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        ) : (
          <ResultView data={orders} emptyMessage="주문 내역이 없습니다." />
        )
      )}
    </div>
  );
}
