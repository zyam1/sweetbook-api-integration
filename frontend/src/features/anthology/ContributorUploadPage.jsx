import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitContribution, listMySubmissions, getContributorToken } from './api';
import './anthology.css';
import './ContributorUploadPage.css';

export default function ContributorUploadPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    listMySubmissions()
      .then((d) => setSubmissions(Array.isArray(d) ? d : d?.items || []))
      .catch((e) => setError(e?.response?.data?.error || e.message));
  };

  useEffect(() => {
    if (!getContributorToken()) {
      navigate(`/c/${token}`);
      return;
    }
    load();
    // eslint-disable-next-line
  }, [token]);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await submitContribution(file);
      }
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ant-auth-wrap" style={{ alignItems: 'flex-start' }}>
      <div className="ant-auth-card" style={{ maxWidth: 640 }}>
        <h1>사진 제출</h1>
        <p className="ant-sub">합동지에 사용할 사진을 업로드하세요.</p>

        <div
          className="ant-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(Array.from(e.dataTransfer.files));
          }}
        >
          {uploading ? '업로드 중...' : '클릭하거나 파일을 여기로 드래그하세요'}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(Array.from(e.target.files))}
          />
        </div>

        {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}

        <h2>내가 업로드한 사진</h2>
        {submissions.length === 0 ? (
          <p className="ant-sub">아직 업로드한 사진이 없습니다.</p>
        ) : (
          <ul className="ant-list">
            {submissions.map((s) => (
              <li key={s.id}>
                <span>{s.fileName || s.originalName || s.id}</span>
                <span className="ant-sub">{s.status || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
