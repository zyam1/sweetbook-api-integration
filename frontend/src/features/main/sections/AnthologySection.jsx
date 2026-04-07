import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';
import { useAuth } from '../../auth/useAuth';

/**
 * Anthology Section — Figma node 62:2
 * 좌: 내가 주최한 합동지 / 우: 참여 중인 합동지.
 * Phase 1 랜딩 — 더미 데이터. Phase E에서 API 연결 예정.
 */
const HOSTED = [
  {
    title: '봄날 합동지 vol.4',
    meta: 'SQUAREBOOK_HC · 7/12 제출 · D-12',
    chip: '주최',
    chipClass: 'lavender',
  },
  {
    title: 'Petals — 일러스트 합동',
    meta: 'PHOTOBOOK_A5_SC · 9/10 제출 · D-3',
    chip: '마감 임박',
    chipClass: 'pink',
  },
  {
    title: '여름밤 단편선',
    meta: 'PHOTOBOOK_A4_SC · 3/8 제출 · D-21',
    chip: '모집 중',
    chipClass: 'info',
  },
];

const JOINED = [
  {
    title: '겨울의 단상 — 합동',
    handle: '@snowmint',
    meta: '할당 8p · 평균 312dpi',
    chip: '제출 완료',
    chipClass: 'success',
  },
  {
    title: '라일락 일러스트 모음',
    handle: '@lilac_studio',
    meta: '할당 4p · 마감 D-5',
    chip: '원고 미제출',
    chipClass: 'pink',
  },
];

function AnthologySection() {
  const { isLoggedIn } = useAuth();
  const hosted = isLoggedIn ? HOSTED : [];
  const joined = isLoggedIn ? JOINED : [];

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
                <div key={h.title} className="mp-ws-row">
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
              <p className="mp-ws-sub">기여자로 참여 {joined.length}건</p>
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
                <div key={j.title} className="mp-ws-row mp-ws-row--joined">
                  <div className="mp-ws-row-text">
                    <div className="mp-anth-titlerow">
                      <p className="mp-ws-row-title">{j.title}</p>
                      <span className="mp-anth-handle">{j.handle}</span>
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
