import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookApi } from '../book/bookApi';
import { useWizard } from './WizardContext';

export default function UploadStep() {
  const { bookSpec, title, setTitle, bookUid, setBookUid, photos, setPhotos } = useWizard();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!bookSpec) {
    return (
      <div>
        판형이 선택되지 않았습니다. <button onClick={() => navigate('/wizard/spec')}>판형 선택으로</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      let uid = bookUid;
      if (!uid) {
        const created = await bookApi.create({
          title: title || '제목 없음',
          bookSpecUid: bookSpec.bookSpecUid,
        });
        uid = created.data?.data?.bookUid;
        setBookUid(uid);
      }
      if (files.length > 0) {
        const res = await bookApi.uploadPhotos(uid, files);
        const uploaded = res.data?.data?.items || res.data?.data || [];
        setPhotos([...(photos || []), ...uploaded]);
        setFiles([]);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>사진 업로드</h2>
      <p>판형: <strong>{bookSpec.name}</strong></p>
      <label>
        책 제목:{' '}
        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!!bookUid} />
      </label>
      <div style={{ marginTop: 16 }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button onClick={handleSubmit} disabled={busy || (!bookUid && !title)}>
          {busy ? '처리 중...' : bookUid ? '추가 업로드' : '책 생성 + 업로드'}
        </button>
      </div>
      {error && <div className="error">에러: {error}</div>}
      {bookUid && (
        <div style={{ marginTop: 16 }}>
          <p>bookUid: <code>{bookUid}</code></p>
          <p>업로드된 사진: {photos.length}장</p>
        </div>
      )}
      <div className="wizard-actions">
        <button disabled={!bookUid || photos.length === 0} onClick={() => navigate('/wizard/edit')}>
          다음 →
        </button>
      </div>
    </div>
  );
}
