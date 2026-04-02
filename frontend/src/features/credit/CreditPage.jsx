import { useState, useEffect } from 'react';
import { creditApi } from './creditApi';
import ResultView from '../../components/ResultView';

export default function CreditPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await creditApi.getBalance();
        setBalance(data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="page">
      <h2>충전금</h2>
      {loading && <p className="loading">불러오는 중...</p>}
      {error && <p className="error">오류: {error}</p>}
      {balance && (
        <div className="credit-card">
          <p className="credit-label">Sandbox 잔액</p>
          <p className="credit-amount">{balance.balance?.toLocaleString()}원</p>
          <p className="credit-env">{balance.env}</p>
        </div>
      )}
      <ResultView data={balance} />
    </div>
  );
}
