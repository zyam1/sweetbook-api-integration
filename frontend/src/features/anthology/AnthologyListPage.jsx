import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAnthologies } from './api';
import { orderStatusLabel, orderBadgeClass } from './orderStatus';
import { anthologyStatusLabel, anthologyBadgeClass } from './anthologyStatus';
import './anthology.css';
import './AnthologyListPage.css';

const coverBaseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/uploads/anthology`;

// Figma: SweetPress / Anthology / List (node 105:60)
export default function AnthologyListPage() {
  const [role, setRole] = useState('owner');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    listAnthologies(role)
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
        <button className={role === 'owner' ? 'active' : ''} onClick={() => { setLoading(true); setError(null); setRole('owner'); }}>내가 주최한</button>
        <button className={role === 'contributor' ? 'active' : ''} onClick={() => { setLoading(true); setError(null); setRole('contributor'); }}>참여 중인</button>
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
          return (
            <Link key={a.id} to={`/anthology/${a.id}`} className="ant-anthology-card">
              {a.coverFrontPhoto ? (
                <img
                  className="ant-anthology-card-thumb"
                  src={`${coverBaseUrl}/${a.id}/cover/${a.coverFrontPhoto}`}
                  alt="표지 앞면"
                />
              ) : (
                <div className="ant-anthology-card-thumb-empty">표지 미설정</div>
              )}
              <div className="ant-row-between">
                <div className="ant-anthology-card-title">{a.title || '제목 없음'}</div>
                <span className={`ant-badge ${a.latestOrder?.status ? orderBadgeClass(a.latestOrder.status) : anthologyBadgeClass(a.status || 'DRAFT')}`}>{a.latestOrder?.status ? orderStatusLabel(a.latestOrder.status) : anthologyStatusLabel(a.status || 'DRAFT')}</span>
              </div>
              <div className="ant-anthology-card-meta">
                {a.contributorCount ?? 0}명 · {a.pageCount ?? 0}p
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
