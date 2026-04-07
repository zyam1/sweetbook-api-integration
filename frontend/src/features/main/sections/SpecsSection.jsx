import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';

/**
 * Specs Section — Figma node 40:2
 * 판형 카드 4개. (Phase 1 랜딩, 데이터는 Figma 표기 그대로 하드코딩)
 */
const SPECS = [
  {
    code: 'SQUAREBOOK_HC',
    name: '정사각 하드커버',
    size: '190 × 190 mm',
    pages: '20–130p',
    priceFrom: '18,000',
    visual: 'pink',
    thumb: 'square',
  },
  {
    code: 'PHOTOBOOK_A4_SC',
    name: 'A4 소프트커버',
    size: '210 × 297 mm',
    pages: '24–200p',
    priceFrom: '9,500',
    visual: 'lavender',
    thumb: 'portrait',
  },
  {
    code: 'PHOTOBOOK_A5_SC',
    name: 'A5 소프트커버',
    size: '148 × 210 mm',
    pages: '24–200p',
    priceFrom: '6,800',
    visual: 'yellow',
    thumb: 'portrait',
  },
  {
    code: 'PHOTOBOOK_B5_SC',
    name: 'B5 소프트커버',
    size: '182 × 257 mm',
    pages: '24–180p',
    priceFrom: '7,800',
    visual: 'info',
    thumb: 'portrait',
  },
];

const FILTERS = ['전체', '하드커버', '소프트커버', '정사각', 'A판'];

function SpecsSection() {
  return (
    <section className="mp-section">
      <Container size="lg">
        <div className="mp-section-head">
          <div>
            <h2 className="mp-section-title">판형 선택</h2>
            <p className="mp-section-sub">원하는 판형을 고르면 새 작업이 시작돼요.</p>
          </div>
          <div className="mp-section-filters">
            {FILTERS.map((f, i) => (
              <button key={f} className={`mp-pill ${i === 0 ? 'mp-pill--active' : ''}`} type="button">
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mp-specs-grid">
          {SPECS.map((s) => (
            <Link key={s.code} to="/wizard" className="mp-spec-card">
              <div className={`mp-spec-visual mp-spec-visual--${s.visual}`}>
                <div className={`mp-spec-thumb mp-spec-thumb--${s.thumb}`} />
              </div>
              <div className="mp-spec-body">
                <div>
                  <p className="mp-spec-name">{s.name}</p>
                  <p className="mp-spec-code">{s.code}</p>
                </div>
                <div className="mp-spec-meta">
                  <div className="mp-spec-meta-item">
                    <span className="mp-spec-meta-label">판형</span>
                    <span className="mp-spec-meta-value">{s.size}</span>
                  </div>
                  <div className="mp-spec-meta-item">
                    <span className="mp-spec-meta-label">페이지</span>
                    <span className="mp-spec-meta-value">{s.pages}</span>
                  </div>
                </div>
                <div className="mp-spec-divider" />
                <div className="mp-spec-foot">
                  <div className="mp-spec-price">
                    <span className="won">₩</span>
                    <span className="num">{s.priceFrom}</span>
                    <span className="tilde">~</span>
                  </div>
                  <span className="mp-spec-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default SpecsSection;
