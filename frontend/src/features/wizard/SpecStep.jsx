import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookSpecApi } from '../bookSpec/bookSpecApi';
import { useWizard } from './WizardContext';

export default function SpecStep() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { bookSpec, setBookSpec } = useWizard();
  const navigate = useNavigate();

  useEffect(() => {
    bookSpecApi
      .list()
      .then((res) => {
        // 응답: { success, data: { success, message, data: [...] } }
        const inner = res.data?.data;
        const list = Array.isArray(inner) ? inner : inner?.data || inner?.items || [];
        setSpecs(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>판형 불러오는 중...</div>;
  if (error) return <div className="error">에러: {error}</div>;

  return (
    <div>
      <h2>판형 선택</h2>
      <div className="spec-grid">
        {specs.map((s) => (
          <button
            key={s.bookSpecUid}
            className={`spec-card ${bookSpec?.bookSpecUid === s.bookSpecUid ? 'selected' : ''}`}
            onClick={() => setBookSpec(s)}
          >
            <div className="spec-name">{s.name}</div>
            <div className="spec-meta">
              {s.innerTrimWidthMm}×{s.innerTrimHeightMm}mm
            </div>
            <div className="spec-meta">
              {s.pageMin}~{s.pageMax}p ({s.pageIncrement}단위)
            </div>
            <div className="spec-meta">{s.coverType} / {s.bindingType}</div>
          </button>
        ))}
      </div>
      <div className="wizard-actions">
        <button disabled={!bookSpec} onClick={() => navigate('/wizard/upload')}>
          다음 →
        </button>
      </div>
    </div>
  );
}
