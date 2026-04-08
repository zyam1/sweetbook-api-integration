import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from './api';
import { orderStatusLabel } from '../anthology/orderStatus';
import '../anthology/anthology.css';
import './OrderListPage.css';

// Figma: SweetPress / Order / List
export default function OrderListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    listOrders()
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : data?.items || []);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error || e.message);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="ant-page">
      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>주문 내역</h1>
          <p className="ant-sub">지금까지 진행된 주문을 확인하세요</p>
        </div>
      </div>

      {loading && <p className="ant-sub">불러오는 중...</p>}
      {error && <p className="ant-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="ant-card">
          <p className="ant-sub">주문 내역이 없습니다.</p>
        </div>
      )}

      <div className="ant-grid">
        {items.map((o) => {
          const shortUid = o.sweetbookOrderUid ? o.sweetbookOrderUid.slice(-8) : `#${o.id}`;
          const created = o.createdAt ? new Date(o.createdAt).toLocaleDateString('ko-KR') : '';
          return (
            <Link
              key={o.id}
              to={`/orders/${o.sweetbookOrderUid}`}
              className="ant-anthology-card"
            >
              <div className="ant-row-between">
                <div className="ant-anthology-card-title">주문 {shortUid}</div>
                <span className="ant-badge lavender">{orderStatusLabel(o.status)}</span>
              </div>
              <div className="ant-anthology-card-meta">
                수량 {o.quantity ?? 0}권 · {Number(o.totalAmount ?? 0).toLocaleString('ko-KR')}원
              </div>
              <div className="ant-anthology-card-meta">
                {o.recipientName || '수령인 미정'} · {created}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
