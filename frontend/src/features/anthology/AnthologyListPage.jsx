import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAnthologies } from './api';
import './anthology.css';
import './AnthologyListPage.css';

// Figma: SweetPress / Anthology / List (node 105:60)
export default function AnthologyListPage() {
  const [role, setRole] = useState('owner');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listAnthologies(role)
      .then((data) => {
        if (!alive) return;
        setItems(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((e) => alive && setError(e?.response?.data?.error || e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [role]);

  return (
    <div className="ant-page">
      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>합동지</h1>
          <p className="ant-sub">여러 작가가 함께 책을 엮는 프로젝트</p>
        </div>
        <Link to="/anthology/new" className="ant-btn ant-btn-primary">새 합동지 만들기</Link>
      </div>

      <div className="ant-toggle">
        <button className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}>내가 주최한</button>
        <button className={role === 'contributor' ? 'active' : ''} onClick={() => setRole('contributor')}>참여 중인</button>
      </div>

      {loading && <p className="ant-sub">불러오는 중...</p>}
      {error && <p className="ant-error">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="ant-card">
          <p className="ant-sub">합동지가 없습니다.</p>
        </div>
      )}

      <div className="ant-grid">
        {items.map((a) => {
          const total = a.contributorMax || a.contributorCount || 0;
          const filled = a.contributorCount ?? 0;
          const pct = total ? Math.min(100, Math.round((filled / total) * 100)) : 0;
          return (
            <Link key={a.id} to={`/anthology/${a.id}`} className="ant-anthology-card">
              <div className="ant-row-between">
                <div className="ant-anthology-card-title">{a.title || '제목 없음'}</div>
                <span className="ant-badge lavender">{a.status || 'DRAFT'}</span>
              </div>
              <div className="ant-anthology-card-meta">
                {a.bookSpecUid || ''} · {filled}/{total || '?'}명 · {a.pageCount ?? 0}p
              </div>
              <div className="ant-progress"><span style={{ width: `${pct}%` }} /></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
