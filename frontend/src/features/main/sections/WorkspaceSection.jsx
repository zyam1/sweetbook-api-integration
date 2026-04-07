import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';
import { useAuth } from '../../auth/useAuth';
import { fetchMyProjects, fetchMyOrders } from '../api';

/**
 * Workspace Section — Figma node 41:2
 * 좌: 내 작업 / 우: 최근 주문. 백엔드 API 연동.
 */

function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return '오늘';
  if (diff < 2 * day) return '어제';
  return `${Math.floor(diff / day)}일 전`;
}

const PROJECT_STATUS_CHIP = {
  EDITING: { chip: '편집 중', chipClass: 'pink' },
  FINALIZED: { chip: '검수 대기', chipClass: 'info' },
  CREATED: { chip: '편집 중', chipClass: 'pink' },
  ORDERED: { chip: '주문 완료', chipClass: 'success' },
};

const ORDER_STATUS_CHIP = {
  PAID: { chip: '결제 완료', chipClass: 'info' },
  PDF_READY: { chip: 'PDF 준비', chipClass: 'info' },
  CONFIRMED: { chip: '제작 확정', chipClass: 'lavender' },
  IN_PRODUCTION: { chip: '제작중', chipClass: 'lavender' },
  COMPLETED: { chip: '완료', chipClass: 'success' },
  PRODUCTION_COMPLETE: { chip: '제작 완료', chipClass: 'success' },
  SHIPPED: { chip: '배송중', chipClass: 'info' },
  DELIVERED: { chip: '배송 완료', chipClass: 'success' },
  CANCELLED: { chip: '취소', chipClass: 'pink' },
  CANCELLED_REFUND: { chip: '환불', chipClass: 'pink' },
  ERROR: { chip: '오류', chipClass: 'pink' },
};

function projectChip(status) {
  return PROJECT_STATUS_CHIP[status] || { chip: status || '편집 중', chipClass: 'pink' };
}

function orderChip(status) {
  return ORDER_STATUS_CHIP[status] || { chip: status || '-', chipClass: 'info' };
}

function WorkspaceSection() {
  const { isLoggedIn } = useAuth();
  const [works, setWorks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setWorks([]);
      setOrders([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchMyProjects({ limit: 6 }).catch((e) => {
        console.warn('[WorkspaceSection] fetchMyProjects 실패', e);
        return [];
      }),
      fetchMyOrders(5).catch((e) => {
        console.warn('[WorkspaceSection] fetchMyOrders 실패', e);
        return [];
      }),
    ])
      .then(([p, o]) => {
        if (cancelled) return;
        setWorks(Array.isArray(p) ? p : p?.data || []);
        setOrders(Array.isArray(o) ? o : o?.data || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <Container size="lg">
      <div className="mp-workspace">
        {/* 내 작업 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">내 작업</h3>
              <p className="mp-ws-sub">편집 중인 책 {works.length}건</p>
            </div>
            <Link to="/books" className="mp-ws-link">전체 보기 →</Link>
          </div>
          <div className="mp-ws-list">
            {loading && works.length === 0 && (
              <p className="mp-ws-row-meta">불러오는 중…</p>
            )}
            {!loading && works.length === 0 && (
              <p className="mp-ws-row-meta">표시할 작업이 없어요.</p>
            )}
            {works.map((w) => {
              const { chip, chipClass } = projectChip(w.status);
              const meta = `${w.bookSpecUid || ''}${w.pageCount != null ? ` · ${w.pageCount}p` : ''}${w.lastEditedAt ? ` · ${formatRelative(w.lastEditedAt)}` : ''}`;
              return (
                <div key={w.id || w.bookUid} className="mp-ws-row">
                  <div className="mp-ws-thumb" />
                  <div className="mp-ws-row-text">
                    <p className="mp-ws-row-title">{w.title}</p>
                    <p className="mp-ws-row-meta">{meta}</p>
                  </div>
                  <span className={`mp-chip mp-chip--${chipClass}`}>{chip}</span>
                  <span className="mp-ws-arrow">→</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">최근 주문</h3>
              <p className="mp-ws-sub">최근 {orders.length}건</p>
            </div>
            <Link to="/orders" className="mp-ws-link">전체 보기 →</Link>
          </div>
          <div className="mp-ws-list">
            {loading && orders.length === 0 && (
              <p className="mp-ws-row-meta">불러오는 중…</p>
            )}
            {!loading && orders.length === 0 && (
              <p className="mp-ws-row-meta">최근 주문이 없어요.</p>
            )}
            {orders.map((o) => {
              const { chip, chipClass } = orderChip(o.status);
              const num = o.externalRef || o.orderUid || o.id;
              const qty = o.quantity ?? o.totalQuantity;
              const amount = o.totalAmount ?? o.paidCreditAmount;
              const meta = `${qty != null ? `${qty}부` : ''}${amount != null ? ` · ₩${Number(amount).toLocaleString()}` : ''}`;
              return (
                <div key={o.id || o.orderUid} className="mp-ws-row mp-ws-row--order">
                  <div className="mp-ws-row-text">
                    <div className="mp-ws-order-tp">
                      <p className="mp-ws-row-title">{o.title || o.bookTitle || '주문'}</p>
                      <span className="mp-ws-order-num">#{num}</span>
                    </div>
                    <p className="mp-ws-row-meta">{meta}</p>
                  </div>
                  <span className={`mp-chip mp-chip--${chipClass}`}>{chip}</span>
                </div>
              );
            })}
            {error && <p className="mp-ws-row-meta">불러오기에 실패했어요.</p>}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default WorkspaceSection;
