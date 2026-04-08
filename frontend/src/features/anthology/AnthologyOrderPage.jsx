import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderAnthology } from './api';
import './anthology.css';
import './AnthologyOrderPage.css';

// Figma: SweetPress / Anthology / Order Checkout (node 140:65)
const fmt = (v) => (v?.toLocaleString?.() ?? v);

export default function AnthologyOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { finalizeResult, anthology } = location.state || {};
  const estimate = finalizeResult?.estimate;

  const [form, setForm] = useState({
    quantity: 1,
    recipientName: '',
    recipientPhone: '',
    postalCode: '',
    address1: '',
    address2: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await orderAnthology(id, {
        quantity: Number(form.quantity),
        shipping: {
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          postalCode: form.postalCode,
          address1: form.address1,
          address2: form.address2,
        },
      });
      alert('주문이 생성되었습니다.');
      navigate(`/anthology/${id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const row = (label, value) => (
    <div className="ant-row-between" style={{ width: '100%' }}>
      <span className="ant-sub" style={{ color: 'var(--ant-ink-2)' }}>{label}</span>
      <strong style={{ fontSize: 14, color: 'var(--ant-ink)' }}>{value}</strong>
    </div>
  );

  return (
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <span>{anthology?.title || '합동지'}</span>
        <span className="ant-crumb-sep">›</span>
        <span>주문 확정</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ fontSize: 32 }}>주문 확정</h1>
        <p className="ant-sub">
          최종화 완료. 부수와 배송 정보를 입력하면 POST /orders가 호출됩니다. (Idempotency-Key 자동 생성)
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 540px) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* 좌: 견적 요약 */}
        <div className="ant-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 18 }}>견적 요약</h2>
          {estimate ? (
            <>
              {row('제품 금액 (productAmount)', `${fmt(estimate.productAmount) || 0}원`)}
              {row('배송비 (shippingFee)', `${fmt(estimate.shippingFee) || 0}원`)}
              {row('포장비 (packagingFee)', `${fmt(estimate.packagingFee) || 0}원`)}
              <div className="ant-divider" />
              {row('총 금액 (totalAmount)', `${fmt(estimate.totalAmount) || 0}원`)}
              {row('실 차감 (paidCreditAmount, VAT 포함)', `${fmt(estimate.paidCreditAmount) || 0}원`)}
              {estimate.creditSufficient !== false ? (
                <div className="ant-success-banner">✅ 충전금 충분 (creditSufficient: true)</div>
              ) : (
                <p className="ant-error">충전금이 부족합니다.</p>
              )}
            </>
          ) : (
            <p className="ant-sub">견적 정보가 없습니다.</p>
          )}
        </div>

        {/* 우: 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ant-card">
            <h2>수량</h2>
            <p className="ant-sub-sm" style={{ marginTop: 4, marginBottom: 12 }}>
              1~999부 입력 (외부 데이터 외 추가 수량 가능)
            </p>
            <input
              className="ant-input"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              required
            />
          </div>

          <div className="ant-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2>배송 정보</h2>
            <div className="ant-field">
              <label>수령인 이름</label>
              <input
                className="ant-input"
                value={form.recipientName}
                onChange={(e) => update('recipientName', e.target.value)}
                required
              />
            </div>
            <div className="ant-field">
              <label>연락처</label>
              <input
                className="ant-input"
                value={form.recipientPhone}
                onChange={(e) => update('recipientPhone', e.target.value)}
                required
              />
            </div>
            <div className="ant-field">
              <label>우편번호</label>
              <input
                className="ant-input"
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
                required
              />
            </div>
            <div className="ant-field">
              <label>배송지 주소</label>
              <input
                className="ant-input"
                value={form.address1}
                onChange={(e) => update('address1', e.target.value)}
                required
              />
            </div>
            <div className="ant-field">
              <label>상세 주소</label>
              <input
                className="ant-input"
                value={form.address2}
                onChange={(e) => update('address2', e.target.value)}
              />
            </div>
          </div>

          {error && <p className="ant-error">{error}</p>}

          <div className="ant-row-between">
            <span className="ant-sub-sm">🔒 Idempotency-Key 자동 생성 — 중복 결제 방지</span>
            <div className="ant-row" style={{ gap: 8 }}>
              <button
                type="button"
                className="ant-btn"
                onClick={() => navigate(`/anthology/${id}`)}
              >
                취소
              </button>
              <button type="submit" className="ant-btn ant-btn-primary" disabled={submitting}>
                {submitting ? '주문 중...' : '주문하기 (POST /orders)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
