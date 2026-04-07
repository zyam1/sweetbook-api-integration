import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitContribution, listMySubmissions, getContributorToken, getContribDashboard } from './api';
import './anthology.css';
import './ContributorUploadPage.css';

// Figma: SweetPress / Submit / Upload (:token) (node 115:60)
export default function ContributorUploadPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);

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
    getContribDashboard()
      .then((d) => setDashboard(d))
      .catch(() => {});
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
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <span>원고 업로드</span>
      </div>

      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>원고 업로드</h1>
          <p className="ant-sub">합동지에 사용할 사진을 업로드하세요. 300 DPI 이상 권장.</p>
        </div>
        <span className="ant-badge yellow">진행 중</span>
      </div>

      {dashboard && (
        <div className="ant-card">
          <div className="ant-row-between">
            <h2>{dashboard.title || dashboard.anthology?.title || '합동지'}</h2>
            <span className="ant-badge lavender">
              {dashboard.bookSpecUid || dashboard.anthology?.bookSpecUid || ''}
            </span>
          </div>
          <p className="ant-sub" style={{ marginTop: 8 }}>
            마감일: {dashboard.deadline || dashboard.anthology?.deadline || '-'} · 내 할당 페이지: {dashboard.allocatedPages ?? dashboard.me?.allocatedPages ?? 0}p · 내 제출: {dashboard.submissionCount ?? dashboard.me?.submissionCount ?? submissions.length}건
          </p>
        </div>
      )}

      <div
        className="ant-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <div className="ico">📤</div>
        <div className="title">{uploading ? '업로드 중...' : '이미지를 끌어다 놓거나 클릭해 업로드'}</div>
        <div className="hint">JPG, PNG, HEIC 지원 · 최대 200MB · SVG 불가</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
      </div>

      {error && <p className="ant-error">{error}</p>}

      <div className="ant-card">
        <h2>업로드된 사진 ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <p className="ant-sub" style={{ marginTop: 12 }}>아직 업로드한 사진이 없습니다.</p>
        ) : (
          <ul className="ant-list" style={{ marginTop: 8 }}>
            {submissions.map((s) => (
              <li key={s.id}>
                <div className="ant-row" style={{ gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      background: 'var(--ant-purple-thumb)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div className="name">{s.fileName || s.originalName || s.id}</div>
                    {(s.width || s.height) && (
                      <div className="meta">{s.width}×{s.height}</div>
                    )}
                  </div>
                </div>
                <span className="ant-badge lavender">{s.status || '통과'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
