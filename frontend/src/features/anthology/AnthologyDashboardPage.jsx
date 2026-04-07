import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAnthology, listContributors } from './api';
import FinalizeModal from './FinalizeModal';
import './anthology.css';
import './AnthologyDashboardPage.css';

// Figma: SweetPress / Anthology / Dashboard (:id) (node 112:60)
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
  if (error) return <div className="ant-page"><p className="ant-error">{error}</p></div>;
  if (!anthology) return null;

  const submitted = contributors.filter((c) => (c.submissionCount ?? 0) > 0).length;
  const pending = contributors.length - submitted;

  return (
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <span>{anthology.title}</span>
      </div>

      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="ant-row">
            <h1>{anthology.title}</h1>
            <span className="ant-badge lavender">{anthology.status || 'DRAFT'}</span>
          </div>
          <p className="ant-sub">
            {anthology.bookSpecUid || ''} · 페이지 {anthology.pageCount ?? 0}p · 기여자 {contributors.length}명
          </p>
        </div>
        <div className="ant-row" style={{ gap: 8 }}>
          <Link to={`/anthology/${id}/contributors`} className="ant-btn">기여자 초대</Link>
          <button className="ant-btn ant-btn-primary" onClick={() => setShowFinalize(true)}>
            최종화
          </button>
        </div>
      </div>

      <div className="ant-stat-grid">
        <div className="ant-stat">
          <span className="ant-stat-label">참여 인원</span>
          <span className="ant-stat-value">{contributors.length}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">제출 완료</span>
          <span className="ant-stat-value success">{submitted}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">미제출</span>
          <span className="ant-stat-value warn">{pending}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">총 페이지</span>
          <span className="ant-stat-value">{anthology.pageCount ?? 0}</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 24,
        }}
      >
        <div className="ant-card">
          <h2>기여자 목록</h2>
          {contributors.length === 0 ? (
            <p className="ant-sub" style={{ marginTop: 12 }}>등록된 기여자가 없습니다.</p>
          ) : (
            <ul className="ant-list">
              {contributors.map((c) => {
                const done = (c.submissionCount ?? 0) > 0;
                return (
                  <li key={c.id || c.token}>
                    <div>
                      <div className="name">{c.name || '이름 없음'}</div>
                      <div className="meta">{c.email || `${c.submissionCount ?? 0}건 제출`}</div>
                    </div>
                    <span className={`ant-badge ${done ? 'lavender' : 'pink'}`}>
                      {done ? '제출 완료' : '원고 미제출'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ant-card">
            <div className="ant-row-between">
              <h2>표지 설정</h2>
              <span className={`ant-badge ${anthology.cover ? 'lavender' : 'pink'}`}>
                {anthology.cover ? '설정됨' : '미설정'}
              </span>
            </div>
            <p className="ant-sub" style={{ marginTop: 10 }}>
              템플릿과 표지 이미지를 선택하세요. 마감 시 books → photos → cover 순으로 호출됩니다.
            </p>
          </div>

          <div className="ant-card">
            <h2>책 진행 상황</h2>
            <ul className="ant-list" style={{ marginTop: 8 }}>
              <li>
                <span className="ant-sub" style={{ color: 'var(--ant-ink)' }}>1. 책 생성 (POST /books)</span>
                <span className="ant-badge lavender">완료</span>
              </li>
              <li>
                <span className="ant-sub" style={{ color: 'var(--ant-ink)' }}>2. 사진 업로드</span>
                <span className="ant-badge yellow">진행 중</span>
              </li>
              <li>
                <span className="ant-sub" style={{ color: 'var(--ant-ink)' }}>3. 표지 설정</span>
                <span className="ant-badge subtle">대기</span>
              </li>
              <li>
                <span className="ant-sub" style={{ color: 'var(--ant-ink)' }}>4. 내지 추가</span>
                <span className="ant-badge subtle">대기</span>
              </li>
              <li>
                <span className="ant-sub" style={{ color: 'var(--ant-ink)' }}>5. 최종화</span>
                <span className="ant-badge subtle">대기</span>
              </li>
            </ul>
          </div>
        </div>
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
