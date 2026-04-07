import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAnthology, listContributors } from './api';
import FinalizeModal from './FinalizeModal';
import './anthology.css';
import './AnthologyDashboardPage.css';

export default function AnthologyDashboardPage() {
  const { id } = useParams();
  const [anthology, setAnthology] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFinalize, setShowFinalize] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getAnthology(id), listContributors(id).catch(() => [])])
      .then(([a, c]) => {
        if (!alive) return;
        setAnthology(a);
        setContributors(Array.isArray(c) ? c : c?.items || []);
      })
      .catch((e) => alive && setError(e?.response?.data?.error || e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="ant-page"><p className="ant-sub">불러오는 중...</p></div>;
  if (error) return <div className="ant-page"><p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p></div>;
  if (!anthology) return null;

  return (
    <div className="ant-page">
      <div className="ant-row-between">
        <div>
          <h1>{anthology.title}</h1>
          <p className="ant-sub">{anthology.status || 'DRAFT'} · 페이지 {anthology.pageCount ?? 0}p</p>
        </div>
        <div className="ant-row">
          <Link to={`/anthology/${id}/contributors`} className="ant-btn">기여자 관리</Link>
          <button className="ant-btn ant-btn-primary" onClick={() => setShowFinalize(true)}>마감하고 제작 의뢰</button>
        </div>
      </div>

      <div className="ant-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        <div className="ant-card">
          <h2>요약</h2>
          <p className="ant-sub">{anthology.description || '소개 없음'}</p>
        </div>
        <div className="ant-card">
          <h2>통계</h2>
          <div>기여자 {contributors.length}명</div>
          <div>제출 {anthology.submissionCount ?? 0}건</div>
          <div>페이지 {anthology.pageCount ?? 0}p</div>
        </div>
        <div className="ant-card">
          <h2>표지</h2>
          {anthology.cover ? (
            <div className="ant-sub">설정됨</div>
          ) : (
            <div className="ant-sub">표지 미설정</div>
          )}
        </div>
        <div className="ant-card">
          <h2>진행 상태</h2>
          <div className="ant-sub">{anthology.status || 'DRAFT'}</div>
        </div>
      </div>

      <h2>기여자 목록</h2>
      <div className="ant-card">
        {contributors.length === 0 ? (
          <p className="ant-sub">등록된 기여자가 없습니다.</p>
        ) : (
          <ul className="ant-list">
            {contributors.map((c) => (
              <li key={c.id || c.token}>
                <div>
                  <strong>{c.name || '이름 없음'}</strong>
                  <div className="ant-sub">{c.email || ''}</div>
                </div>
                <div className="ant-sub">{c.submissionCount ?? 0}건 제출</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFinalize && (
        <FinalizeModal
          anthology={{ ...anthology, contributorCount: contributors.length }}
          onClose={() => setShowFinalize(false)}
        />
      )}
    </div>
  );
}
