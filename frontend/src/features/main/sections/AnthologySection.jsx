import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';
import { useAuth } from '../../auth/useAuth';
import { fetchOwnedAnthologies, fetchJoinedAnthologies } from '../api';

/**
 * Anthology Section — Figma node 62:2
 * 좌: 내가 주최한 합동지 / 우: 참여 중인 합동지. 백엔드 API 연동.
 */

function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function hostedChip(status, dDay) {
  if (status === 'RECRUITING') return { chip: '모집 중', chipClass: 'info' };
  if (status === 'CLOSED' || status === 'COMPLETED') return { chip: '마감', chipClass: 'success' };
  if (dDay != null && dDay <= 3) return { chip: '마감 임박', chipClass: 'pink' };
  return { chip: '주최', chipClass: 'lavender' };
}

function joinedChip(contributorStatus) {
  switch (contributorStatus) {
    case 'SUBMITTED':
      return { chip: '제출 완료', chipClass: 'success' };
    case 'PENDING':
      return { chip: '원고 미제출', chipClass: 'pink' };
    case 'APPROVED':
      return { chip: '승인됨', chipClass: 'success' };
    default:
      return { chip: contributorStatus || '참여 중', chipClass: 'info' };
  }
}

function adaptHosted(item) {
  const dDay = daysUntil(item.deadline || item.dueDate);
  const submitted = item._count?.contributors ?? item.contributorCount ?? 0;
  const meta = `${item.bookSpecUid || ''} · ${submitted}명 참여${dDay != null ? ` · D-${dDay}` : ''}`;
  const { chip, chipClass } = hostedChip(item.status, dDay);
  return { id: item.id, title: item.title, meta, chip, chipClass };
}

function adaptJoined(item) {
  const me = item.contributor || item.myContribution || (item.contributors && item.contributors[0]);
  const dDay = daysUntil(item.deadline || item.dueDate);
  const allocated = me?.allocatedPages;
  const meta = `${allocated != null ? `할당 ${allocated}p` : ''}${dDay != null ? `${allocated != null ? ' · ' : ''}마감 D-${dDay}` : ''}`;
  const { chip, chipClass } = joinedChip(me?.status);
  const handle = me?.handle || me?.user?.handle || (me?.user?.name ? `@${me.user.name}` : '');
  return { id: item.id, title: item.title, handle, meta, chip, chipClass };
}

function AnthologySection() {
  const { isLoggedIn } = useAuth();
  const [hosted, setHosted] = useState([]);
  const [joined, setJoined] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHosted([]);
      setJoined([]);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetchOwnedAnthologies().catch((e) => {
        console.warn('[AnthologySection] fetchOwnedAnthologies 실패', e);
        return [];
      }),
      fetchJoinedAnthologies().catch((e) => {
        console.warn('[AnthologySection] fetchJoinedAnthologies 실패', e);
        return [];
      }),
    ]).then(([o, j]) => {
      if (cancelled) return;
      const ownedArr = Array.isArray(o) ? o : o?.data || [];
      const joinedArr = Array.isArray(j) ? j : j?.data || [];
      setHosted(ownedArr.map(adaptHosted));
      setJoined(joinedArr.map(adaptJoined));
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <Container size="lg">
      <div className="mp-anthology">
        {/* 내가 주최한 합동지 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">내가 주최한 합동지</h3>
              <p className="mp-ws-sub">진행 중 {hosted.length}건</p>
            </div>
            <Link to="/anthology" className="mp-ws-link">전체 보기 →</Link>
          </div>
          {hosted.length === 0 ? (
            <div className="mp-anth-empty">
              <p className="mp-anth-empty-text">아직 합동지가 없어요</p>
              <p className="mp-anth-empty-sub">합동지를 만들어 함께 책을 엮어보세요.</p>
              <Link to={isLoggedIn ? '/anthology/new' : '/login'} className="mp-anth-empty-cta">합동지 만들기</Link>
            </div>
          ) : (
            <div className="mp-ws-list">
              {hosted.map((h) => (
                <div key={h.id || h.title} className="mp-ws-row">
                  <div className="mp-ws-thumb" />
                  <div className="mp-ws-row-text">
                    <p className="mp-ws-row-title">{h.title}</p>
                    <p className="mp-ws-row-meta">{h.meta}</p>
                  </div>
                  <span className={`mp-chip mp-chip--${h.chipClass}`}>{h.chip}</span>
                  <span className="mp-ws-arrow">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 참여 중인 합동지 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">참여 중인 합동지</h3>
              <p className="mp-ws-sub">참여자로 참여 {joined.length}건</p>
            </div>
            <Link to="/anthology" className="mp-ws-link">전체 보기 →</Link>
          </div>
          {joined.length === 0 ? (
            <div className="mp-anth-empty">
              <p className="mp-anth-empty-text">아직 합동지가 없어요</p>
              <p className="mp-anth-empty-sub">로그인하고 마음에 드는 합동지에 참여해보세요.</p>
              <Link to={isLoggedIn ? '/anthology' : '/login'} className="mp-anth-empty-cta">{isLoggedIn ? '합동지 둘러보기' : '로그인'}</Link>
            </div>
          ) : (
            <div className="mp-ws-list">
              {joined.map((j) => (
                <div key={j.id || j.title} className="mp-ws-row mp-ws-row--joined">
                  <div className="mp-ws-row-text">
                    <div className="mp-anth-titlerow">
                      <p className="mp-ws-row-title">{j.title}</p>
                      {j.handle && <span className="mp-anth-handle">{j.handle}</span>}
                    </div>
                    <p className="mp-ws-row-meta">{j.meta}</p>
                  </div>
                  <span className={`mp-chip mp-chip--${j.chipClass}`}>{j.chip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default AnthologySection;
