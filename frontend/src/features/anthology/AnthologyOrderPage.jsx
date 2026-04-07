import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderAnthology } from './api';
import './anthology.css';
import './AnthologyOrderPage.css';

export default function AnthologyOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { finalizeResult, anthology } = location.state || {};
  const estimate = finalizeResult?.estimate;

  const [form, setForm] = useState({
    quantity: 1,
    recipient: '',
    phone: '',
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
          recipient: form.recipient,
          phone: form.phone,
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

  return (
    <div className="ant-page">
      <h1>제작 의뢰</h1>
      <p className="ant-sub">{anthology?.title}</p>

      {estimate && (
        <div className="ant-card">
          <h2>견적 요약</h2>
          <div>상품 금액: {estimate.productAmount?.toLocaleString?.() || estimate.productAmount}</div>
          <div>배송비: {estimate.shippingFee?.toLocaleString?.() || estimate.shippingFee}</div>
          <div>포장비: {estimate.packagingFee?.toLocaleString?.() || estimate.packagingFee}</div>
          <div><strong>총 금액: {estimate.totalAmount?.toLocaleString?.() || estimate.totalAmount}</strong></div>
          <div className="ant-sub">차감 금액: {estimate.paidCreditAmount?.toLocaleString?.() || estimate.paidCreditAmount}</div>
          {estimate.creditSufficient === false && (
            <p style={{ color: '#c0392b' }}>충전금이 부족합니다.</p>
          )}
        </div>
      )}

      <form className="ant-card" onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <h2>배송 정보</h2>
        <div className="ant-field">
          <label>수량</label>
          <input className="ant-input" type="number" min="1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} required />
        </div>
        <div className="ant-field">
          <label>수령인</label>
          <input className="ant-input" value={form.recipient} onChange={(e) => update('recipient', e.target.value)} required />
        </div>
        <div className="ant-field">
          <label>연락처</label>
          <input className="ant-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
        </div>
        <div className="ant-field">
          <label>우편번호</label>
          <input className="ant-input" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} required />
        </div>
        <div className="ant-field">
          <label>주소</label>
          <input className="ant-input" value={form.address1} onChange={(e) => update('address1', e.target.value)} required />
        </div>
        <div className="ant-field">
          <label>상세 주소</label>
          <input className="ant-input" value={form.address2} onChange={(e) => update('address2', e.target.value)} />
        </div>

        {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}

        <div className="ant-row-between">
          <button type="button" className="ant-btn" onClick={() => navigate(`/anthology/${id}`)}>취소</button>
          <button type="submit" className="ant-btn ant-btn-primary" disabled={submitting}>
            {submitting ? '주문 중...' : '주문하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
