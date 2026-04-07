import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';

/**
 * Workspace Section — Figma node 41:2
 * 좌: 내 작업 / 우: 최근 주문. 목업 데이터 (Phase 1 랜딩).
 */
const WORKS = [
  { title: '봄날의 단편집 vol.2', meta: 'SQUAREBOOK_HC · 64p · 어제', chip: '편집 중', chipClass: 'pink' },
  { title: '2025 일러스트 아카이브', meta: 'PHOTOBOOK_A4_SC · 128p · 3일 전', chip: '검수 대기', chipClass: 'info' },
  { title: '합동지 — Petals', meta: 'SQUAREBOOK_HC · 88p · 5일 전', chip: '견적 확인', chipClass: 'lavender' },
];

const ORDERS = [
  { title: '겨울의 단상', num: '#SP-2641', meta: '10부 · ₩94,000', chip: '배송중', chipClass: 'info' },
  { title: '합동지 — Bloom', num: '#SP-2632', meta: '30부 · ₩412,000', chip: '제작중', chipClass: 'lavender' },
  { title: '포트폴리오 2025', num: '#SP-2618', meta: '5부 · ₩48,500', chip: '완료', chipClass: 'success' },
];

function WorkspaceSection() {
  return (
    <Container size="lg">
      <div className="mp-workspace">
        {/* 내 작업 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">내 작업</h3>
              <p className="mp-ws-sub">편집 중인 책 3건</p>
            </div>
            <Link to="/books" className="mp-ws-link">전체 보기 →</Link>
          </div>
          <div className="mp-ws-list">
            {WORKS.map((w) => (
              <div key={w.title} className="mp-ws-row">
                <div className="mp-ws-thumb" />
                <div className="mp-ws-row-text">
                  <p className="mp-ws-row-title">{w.title}</p>
                  <p className="mp-ws-row-meta">{w.meta}</p>
                </div>
                <span className={`mp-chip mp-chip--${w.chipClass}`}>{w.chip}</span>
                <span className="mp-ws-arrow">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="mp-ws-card">
          <div className="mp-ws-head">
            <div>
              <h3 className="mp-ws-title">최근 주문</h3>
              <p className="mp-ws-sub">지난 30일 · 4건</p>
            </div>
            <Link to="/orders" className="mp-ws-link">전체 보기 →</Link>
          </div>
          <div className="mp-ws-list">
            {ORDERS.map((o) => (
              <div key={o.num} className="mp-ws-row mp-ws-row--order">
                <div className="mp-ws-row-text">
                  <div className="mp-ws-order-tp">
                    <p className="mp-ws-row-title">{o.title}</p>
                    <span className="mp-ws-order-num">{o.num}</span>
                  </div>
                  <p className="mp-ws-row-meta">{o.meta}</p>
                </div>
                <span className={`mp-chip mp-chip--${o.chipClass}`}>{o.chip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default WorkspaceSection;
