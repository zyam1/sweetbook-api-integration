import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookApi } from '../book/bookApi';
import { orderApi } from '../order/orderApi';
import { useWizard } from './WizardContext';

// Phase 3.3 — F3 부수별 단가 시뮬레이터
function calcPrice(spec, pageCount, qty) {
  if (!spec) return 0;
  const extra = Math.max(0, pageCount - (spec.pageMin || 0));
  const inc = spec.pageIncrement || 1;
  const perBook = (spec.priceBase || 0) + Math.floor(extra / inc) * (spec.pricePerIncrement || 0);
  return perBook * qty;
}

export default function OrderStep() {
  const { bookSpec, bookUid, contentPages, reset } = useWizard();
  const [quantity, setQuantity] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const pageCount = contentPages.length;

  const simulator = useMemo(
    () => [1, 5, 10, 20, 50].map((q) => ({ q, total: calcPrice(bookSpec, pageCount, q) })),
    [bookSpec, pageCount]
  );

  if (!bookUid) {
    return (
      <div>
        책이 없습니다. <button onClick={() => navigate('/wizard/spec')}>처음으로</button>
      </div>
    );
  }

  const handleFinalize = async () => {
    setBusy(true);
    setError(null);
    try {
      await bookApi.finalize(bookUid);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEstimate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await orderApi.estimate({
        items: [{ bookUid, quantity }],
      });
      setEstimate(res.data?.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await orderApi.create({
        items: [{ bookUid, quantity }],
        shipping: { recipientName },
      });
      setOrder(res.data?.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>주문</h2>

      <section>
        <h3>부수별 단가 시뮬레이터</h3>
        <table>
          <thead>
            <tr><th>부수</th><th>총 가격</th></tr>
          </thead>
          <tbody>
            {simulator.map(({ q, total }) => (
              <tr key={q}>
                <td>{q}부</td>
                <td>{total.toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>주문 설정</h3>
        <label>
          수량:{' '}
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
        <label>
          수령인:{' '}
          <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </label>
      </section>

      <section>
        <button onClick={handleFinalize} disabled={busy}>1. 최종화</button>
        <button onClick={handleEstimate} disabled={busy}>2. 견적 조회</button>
        <button onClick={handleOrder} disabled={busy || !estimate || !recipientName}>
          3. 주문 생성
        </button>
      </section>

      {estimate && (
        <section>
          <h3>견적</h3>
          <pre>{JSON.stringify(estimate, null, 2)}</pre>
        </section>
      )}
      {order && (
        <section>
          <h3>주문 완료</h3>
          <pre>{JSON.stringify(order, null, 2)}</pre>
          <button onClick={() => { reset(); navigate('/wizard/spec'); }}>처음부터</button>
        </section>
      )}
      {error && <div className="error">에러: {error}</div>}
    </div>
  );
}
