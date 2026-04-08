import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAnthologies } from '../anthology/api';
import { orderStatusLabel, orderBadgeClass } from '../anthology/orderStatus';
import { anthologyStatusLabel, anthologyBadgeClass } from '../anthology/anthologyStatus';
import '../anthology/anthology.css';
import './HomePage.css';
import Badge from '../../components/Badge';

// Figma: SweetPress (fileKey: 7WJrsI7QOEOrXFP1x4LtAH) — 디자인 토큰/ant-* 공통 클래스 재사용
export default function HomePage() {
  const [owned, setOwned] = useState([]);
  const [ownedLoading, setOwnedLoading] = useState(true);
  const [ownedError, setOwnedError] = useState(null);

  const [joined, setJoined] = useState([]);
  const [joinedLoading, setJoinedLoading] = useState(true);
  const [joinedError, setJoinedError] = useState(null);

  useEffect(() => {
    let alive = true;
    listAnthologies('owner')
      .then((data) => {
        if (!alive) return;
        setOwned(Array.isArray(data) ? data : data?.items || []);
        setOwnedError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setOwnedError(e?.response?.data?.error || e.message);
      })
      .finally(() => { if (alive) setOwnedLoading(false); });

    listAnthologies('contributor')
      .then((data) => {
        if (!alive) return;
        setJoined(Array.isArray(data) ? data : data?.items || []);
        setJoinedError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setJoinedError(e?.response?.data?.error || e.message);
      })
      .finally(() => { if (alive) setJoinedLoading(false); });

    return () => { alive = false; };
  }, []);

  const renderCards = (items) => (
    <div className="ant-grid">
      {items.slice(0, 3).map((a) => {
        const total = a.contributorMax || a.contributorCount || 0;
        const filled = a.contributorCount ?? 0;
        const pct = total ? Math.min(100, Math.round((filled / total) * 100)) : 0;
        return (
          <Link key={a.id} to={`/anthology/${a.id}`} className="ant-anthology-card">
            <div className="ant-row-between">
              <div className="ant-anthology-card-title">{a.title || '제목 없음'}</div>
              <Badge variant={a.latestOrder?.status ? orderBadgeClass(a.latestOrder.status) : anthologyBadgeClass(a.status || 'DRAFT')}>{a.latestOrder?.status ? orderStatusLabel(a.latestOrder.status) : anthologyStatusLabel(a.status || 'DRAFT')}</Badge>
            </div>
            <div className="ant-anthology-card-meta">
              {a.bookSpecUid || ''} · {filled}/{total || '?'}명 · {a.pageCount ?? 0}p
            </div>
            <div className="ant-progress"><span style={{ width: `${pct}%` }} /></div>
          </Link>
        );
      })}
    </div>
  );

  const emptyState = (
    <div className="ant-card">
      <p className="ant-sub">아직 만든 합동지가 없어요.</p>
      <div style={{ marginTop: 12 }}>
        <Link to="/anthology/new" className="ant-btn ant-btn-primary">새 합동지 만들기</Link>
      </div>
    </div>
  );

  const emptyJoined = (
    <div className="ant-card">
      <p className="ant-sub">참여 중인 합동지가 없어요.</p>
    </div>
  );

  return (
    <div className="ant-page">
      {/* 1. 히어로 */}
      <section className="home-hero">
        <h1 className="home-hero-title">함께 엮는 책, 합동지</h1>
        <p className="home-hero-sub">
          여러 작가의 글과 사진을 한 권의 포토북으로 — 판형 선택부터 최종 주문까지, 한 곳에서 간편하게.
        </p>
        <div className="home-hero-actions">
          <Link to="/anthology/new" className="ant-btn ant-btn-primary">새 합동지 만들기</Link>
          <Link to="/anthology" className="ant-btn">전체 합동지 보기</Link>
        </div>
      </section>

      {/* 2. 내 합동지 현황 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="home-section-head">
          <h2>내 합동지 현황</h2>
          <Link to="/anthology">전체 보기 →</Link>
        </div>
        {ownedLoading && <p className="ant-sub">불러오는 중...</p>}
        {ownedError && <p className="ant-error">{ownedError}</p>}
        {!ownedLoading && !ownedError && owned.length === 0 && emptyState}
        {!ownedLoading && !ownedError && owned.length > 0 && renderCards(owned)}
      </section>

      {/* 3. 빠른 시작 3단계 가이드 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="home-section-head">
          <h2>빠른 시작 가이드</h2>
        </div>
        <div className="home-grid-3">
          <div className="home-guide-card">
            <span className="home-guide-num">1</span>
            <div className="home-guide-title">판형 · 참여자 설정</div>
            <p className="home-guide-desc">원하는 판형을 고르고 함께할 참여자를 초대하세요.</p>
          </div>
          <div className="home-guide-card">
            <span className="home-guide-num">2</span>
            <div className="home-guide-title">원고 모으기</div>
            <p className="home-guide-desc">참여자들이 각자 글과 사진을 업로드하면 자동으로 정리돼요.</p>
          </div>
          <div className="home-guide-card">
            <span className="home-guide-num">3</span>
            <div className="home-guide-title">최종화 · 주문</div>
            <p className="home-guide-desc">페이지를 확정하고 주문하면 인쇄·배송까지 진행됩니다.</p>
          </div>
        </div>
      </section>

      {/* 4. 최근 활동 (참여 중) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="home-section-head">
          <h2>참여 중인 합동지</h2>
          <Link to="/anthology">전체 보기 →</Link>
        </div>
        {joinedLoading && <p className="ant-sub">불러오는 중...</p>}
        {joinedError && <p className="ant-error">{joinedError}</p>}
        {!joinedLoading && !joinedError && joined.length === 0 && emptyJoined}
        {!joinedLoading && !joinedError && joined.length > 0 && renderCards(joined)}
      </section>

      {/* 5. 바로가기 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="home-section-head">
          <h2>바로가기</h2>
        </div>
        <div className="home-grid-3">
          <Link to="/anthology" className="home-shortcut-card">
            <div className="home-shortcut-title">합동지 목록</div>
            <div className="home-shortcut-desc">내가 주최하거나 참여 중인 모든 합동지</div>
          </Link>
          <Link to="/anthology/new" className="home-shortcut-card">
            <div className="home-shortcut-title">새로 만들기</div>
            <div className="home-shortcut-desc">새 합동지 프로젝트 시작하기</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
