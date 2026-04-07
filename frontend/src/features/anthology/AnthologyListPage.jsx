import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAnthologies } from './api';
import './anthology.css';
import './AnthologyListPage.css';

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
        <div>
          <h1>합동지</h1>
          <p className="ant-sub">공동 제작 포토북을 관리합니다.</p>
        </div>
        <Link to="/anthology/new" className="ant-btn ant-btn-primary">새 합동지 만들기</Link>
      </div>

      <div className="ant-toggle" style={{ marginTop: 16 }}>
        <button className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}>내가 만든</button>
        <button className={role === 'contributor' ? 'active' : ''} onClick={() => setRole('contributor')}>참여 중</button>
      </div>

      {loading && <p className="ant-sub">불러오는 중...</p>}
      {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}

      {!loading && items.length === 0 && (
        <div className="ant-card" style={{ marginTop: 16 }}>
          <p className="ant-sub">합동지가 없습니다.</p>
        </div>
      )}

      <div className="ant-grid">
        {items.map((a) => (
          <Link key={a.id} to={`/anthology/${a.id}`} className="ant-card ant-anthology-card">
            <div className="ant-anthology-card-title">{a.title || '제목 없음'}</div>
            <div className="ant-sub">{a.status || 'DRAFT'}</div>
            <div className="ant-sub" style={{ marginTop: 8 }}>
              참여자 {a.contributorCount ?? 0}명 · {a.pageCount ?? 0}p
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
