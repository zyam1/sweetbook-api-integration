import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { createAnthology, createContributor } from './api';
import './anthology.css';
import './AnthologyNewPage.css';

const STEPS = ['기본 정보', '판형 선택', '내지 템플릿', '기여자 모집'];

export default function AnthologyNewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    bookSpecUid: '',
    contentTemplateUid: '',
  });
  const [contributors, setContributors] = useState([{ name: '', email: '' }]);

  const [specs, setSpecs] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    client.get('/book-specs').then((res) => {
      const inner = res.data?.data;
      setSpecs(Array.isArray(inner) ? inner : inner?.data || inner?.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.bookSpecUid) return;
    client
      .get('/templates', { params: { bookSpecUid: form.bookSpecUid, templateKind: 'content' } })
      .then((res) => {
        const inner = res.data?.data;
        setTemplates(Array.isArray(inner) ? inner : inner?.data || inner?.items || []);
      })
      .catch(() => {});
  }, [form.bookSpecUid]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) return !!form.bookSpecUid;
    if (step === 2) return !!form.contentTemplateUid;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAnthology({
        title: form.title,
        description: form.description,
        bookSpecUid: form.bookSpecUid,
        contentTemplateUid: form.contentTemplateUid,
      });
      const anthologyId = created?.id || created?.anthologyId;
      // 기여자 추가 (비어있지 않은 것만)
      for (const c of contributors) {
        if (c.name.trim()) {
          try {
            await createContributor(anthologyId, { name: c.name, email: c.email });
          } catch (_) {}
        }
      }
      navigate(`/anthology/${anthologyId}`);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ant-page">
      <h1>새 합동지 만들기</h1>

      <div className="ant-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? 'active' : ''}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="ant-card">
        {step === 0 && (
          <div>
            <div className="ant-field">
              <label>제목</label>
              <input className="ant-input" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="예: 우리 반 졸업 합동지" />
            </div>
            <div className="ant-field">
              <label>소개</label>
              <textarea className="ant-textarea" value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="ant-sub">판형을 선택하세요.</p>
            <div className="ant-grid">
              {specs.map((s) => (
                <div
                  key={s.bookSpecUid}
                  className="ant-card"
                  onClick={() => update('bookSpecUid', s.bookSpecUid)}
                  style={{
                    cursor: 'pointer',
                    borderColor: form.bookSpecUid === s.bookSpecUid ? 'var(--ant-ink)' : 'var(--ant-border)',
                  }}
                >
                  <strong>{s.name}</strong>
                  <div className="ant-sub">{s.innerTrimWidthMm}×{s.innerTrimHeightMm}mm</div>
                  <div className="ant-sub">{s.coverType} · {s.pageMin}~{s.pageMax}p</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="ant-sub">내지 템플릿을 선택하세요.</p>
            <div className="ant-grid">
              {templates.map((t) => (
                <div
                  key={t.templateUid}
                  className="ant-card"
                  onClick={() => update('contentTemplateUid', t.templateUid)}
                  style={{
                    cursor: 'pointer',
                    borderColor: form.contentTemplateUid === t.templateUid ? 'var(--ant-ink)' : 'var(--ant-border)',
                  }}
                >
                  <strong>{t.name || t.templateUid}</strong>
                  <div className="ant-sub">{t.category || ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="ant-sub">기여자를 추가하세요. (나중에 추가 가능)</p>
            {contributors.map((c, idx) => (
              <div key={idx} className="ant-row" style={{ marginBottom: 8 }}>
                <input className="ant-input" placeholder="이름" value={c.name} onChange={(e) => {
                  const next = [...contributors]; next[idx] = { ...c, name: e.target.value }; setContributors(next);
                }} />
                <input className="ant-input" placeholder="이메일 (선택)" value={c.email} onChange={(e) => {
                  const next = [...contributors]; next[idx] = { ...c, email: e.target.value }; setContributors(next);
                }} />
              </div>
            ))}
            <button className="ant-btn" onClick={() => setContributors([...contributors, { name: '', email: '' }])}>+ 기여자 추가</button>
          </div>
        )}
      </div>

      {error && <p className="ant-sub" style={{ color: '#c0392b', marginTop: 12 }}>{error}</p>}

      <div className="ant-row-between" style={{ marginTop: 20 }}>
        <button className="ant-btn" onClick={() => (step === 0 ? navigate('/anthology') : setStep(step - 1))}>
          {step === 0 ? '취소' : '이전'}
        </button>
        {step < STEPS.length - 1 ? (
          <button className="ant-btn ant-btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>다음</button>
        ) : (
          <button className="ant-btn ant-btn-primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? '생성 중...' : '합동지 생성'}
          </button>
        )}
      </div>
    </div>
  );
}
