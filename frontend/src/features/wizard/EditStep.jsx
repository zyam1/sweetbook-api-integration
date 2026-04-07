import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateApi } from '../template/templateApi';
import { bookApi } from '../book/bookApi';
import { useWizard } from './WizardContext';

export default function EditStep() {
  const { bookSpec, bookUid, photos, coverTemplateUid, setCoverTemplateUid, contentPages, setContentPages } = useWizard();
  const [coverTemplates, setCoverTemplates] = useState([]);
  const [contentTemplates, setContentTemplates] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookSpec) return;
    Promise.all([
      templateApi.list({ bookSpecUid: bookSpec.bookSpecUid, templateKind: 'cover' }),
      templateApi.list({ bookSpecUid: bookSpec.bookSpecUid, templateKind: 'content' }),
    ])
      .then(([c, t]) => {
        const pick = (res) => {
          const inner = res.data?.data?.data ?? res.data?.data;
          if (Array.isArray(inner)) return inner;
          return inner?.templates || inner?.items || [];
        };
        setCoverTemplates(pick(c));
        setContentTemplates(pick(t));
      })
      .catch((e) => setError(e.message));
  }, [bookSpec]);

  if (!bookUid) {
    return (
      <div>
        책이 생성되지 않았습니다. <button onClick={() => navigate('/wizard/upload')}>업로드로</button>
      </div>
    );
  }

  const setCover = async (tplUid) => {
    setBusy(true);
    setError(null);
    try {
      await bookApi.setCover(bookUid, {
        templateUid: tplUid,
        parameters: photos[0]?.fileName ? { photo1: photos[0].fileName } : {},
      });
      setCoverTemplateUid(tplUid);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const addContentPage = async (tplUid) => {
    setBusy(true);
    setError(null);
    try {
      const idx = contentPages.length;
      const photo = photos[idx % photos.length];
      await bookApi.insertContent(bookUid, {
        templateUid: tplUid,
        breakBefore: 'page',
        parameters: photo?.fileName ? { photo1: photo.fileName } : {},
      });
      setContentPages([...contentPages, { templateUid: tplUid, photo: photo?.fileName }]);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>편집</h2>
      <section>
        <h3>표지 템플릿</h3>
        <div className="template-grid">
          {coverTemplates.map((t) => (
            <button
              key={t.templateUid}
              className={coverTemplateUid === t.templateUid ? 'selected' : ''}
              onClick={() => setCover(t.templateUid)}
              disabled={busy}
            >
              {t.templateName || t.name}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3>내지 추가 ({contentPages.length}p / 최소 {bookSpec?.pageMin}p)</h3>
        <div className="template-grid">
          {contentTemplates.map((t) => (
            <button key={t.templateUid} onClick={() => addContentPage(t.templateUid)} disabled={busy}>
              + {t.templateName || t.name}
            </button>
          ))}
        </div>
      </section>
      {error && <div className="error">에러: {error}</div>}
      <div className="wizard-actions">
        <button
          disabled={!coverTemplateUid || contentPages.length < (bookSpec?.pageMin || 0)}
          onClick={() => navigate('/wizard/order')}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
