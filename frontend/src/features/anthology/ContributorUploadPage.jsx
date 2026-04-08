import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  uploadContributionFile,
  listMySubmissions,
  getContributorToken,
  getContribDashboard,
  updateMyHandle,
  submitContribution,
  unsubmitContribution,
} from './api';
import './anthology.css';
import './ContributorUploadPage.css';
import Badge from '../../components/Badge';

// Figma: SweetPress / Submit / Upload (:token) (node 115:60)
export default function ContributorUploadPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [handleInput, setHandleInput] = useState('');
  const [handleSaving, setHandleSaving] = useState(false);
  const [handleMsg, setHandleMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 참여자 상태: PENDING(파일 없음) / DRAFT(파일 있음) / SUBMITTED(제출 완료)
  const myStatus =
    dashboard?.status ||
    dashboard?.me?.status ||
    dashboard?.contributor?.status ||
    (submissions.length > 0 ? 'DRAFT' : 'PENDING');

  const reloadAll = async () => {
    try {
      const d = await getContribDashboard();
      setDashboard(d);
    } catch {
      // ignore
    }
    load();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitContribution();
      await reloadAll();
    } catch (e) {
      setSubmitError(e?.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await unsubmitContribution();
      await reloadAll();
    } catch (e) {
      setSubmitError(e?.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

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
      .then((d) => {
        setDashboard(d);
        const h = d?.handle || d?.me?.handle || d?.contributor?.handle || '';
        setHandleInput(h);
      })
      .catch(() => {});
    // eslint-disable-next-line
  }, [token]);

  const handleSaveHandle = async () => {
    if (!handleInput.trim()) return;
    setHandleSaving(true);
    setHandleMsg(null);
    try {
      await updateMyHandle(handleInput.trim());
      setHandleMsg('저장되었습니다');
      const d = await getContribDashboard();
      setDashboard(d);
    } catch (e) {
      setHandleMsg(e?.response?.data?.error || e.message);
    } finally {
      setHandleSaving(false);
    }
  };

  const handleFiles = async (files) => {
    if (myStatus === 'SUBMITTED') return;
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadContributionFile(file);
      }
      reloadAll();
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
        <div className="ant-row" style={{ gap: 8, alignItems: 'center' }}>
          {myStatus === 'SUBMITTED' ? (
            <>
              <Badge variant="lavender">제출 완료 ✓</Badge>
              <button
                type="button"
                className="ant-btn"
                onClick={handleUnsubmit}
                disabled={submitting}
              >
                {submitting ? '처리 중...' : '제출 취소'}
              </button>
            </>
          ) : myStatus === 'DRAFT' ? (
            <button
              type="button"
              className="ant-btn ant-btn-primary"
              onClick={doSubmit}
              disabled={submitting}
            >
              {submitting ? '제출 중...' : '제출하기'}
            </button>
          ) : (
            <button type="button" className="ant-btn" disabled>
              파일 업로드 후 제출 가능
            </button>
          )}
        </div>
      </div>
      {submitError && <p className="ant-error">{submitError}</p>}

      {dashboard && (
        <div className="ant-card">
          <div className="ant-row-between">
            <h2>{dashboard.title || dashboard.anthology?.title || '합동지'}</h2>
          </div>
          <p className="ant-sub" style={{ marginTop: 8 }}>
            마감일: {dashboard.deadline || dashboard.anthology?.deadline || '-'} · 내 제출: {dashboard.submissionCount ?? dashboard.me?.submissionCount ?? submissions.length}건
          </p>
          <div className="ant-field" style={{ marginTop: 12 }}>
            <label>내 이름</label>
            <div className="ant-row" style={{ gap: 8, alignItems: 'center' }}>
              <input
                className="ant-input"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="이름 입력"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="ant-btn ant-btn-primary"
                onClick={handleSaveHandle}
                disabled={handleSaving}
              >
                {handleSaving ? '저장 중...' : '저장'}
              </button>
            </div>
            {handleMsg && <p className="ant-sub" style={{ marginTop: 6 }}>{handleMsg}</p>}
          </div>
          {dashboard?.requirements && (
            <>
              <div className="ant-sub" style={{ marginTop: 12 }}>필수 체크리스트</div>
              {(() => {
                const req = dashboard.requirements;
                const photo = req.photoCount || {};
                const photoInsufficient =
                  photo.min != null && (photo.current ?? 0) < photo.min;
                return (
                  <ul className="ant-list" style={{ marginTop: 8 }}>
                    <li>
                      <span>
                        {req.handle?.ok ? '✅' : '⚠️'} 이름 입력{' '}
                        <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>
                      </span>
                    </li>
                    <li>
                      <span>
                        {photoInsufficient ? '⚠️' : '✅'} 사진 {photo.current ?? 0}장
                        {photo.min != null && <> / 최소 {photo.min}장</>}
                        {photoInsufficient && ' (부족)'}{' '}
                        <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>
                      </span>
                    </li>
                  </ul>
                );
              })()}
            </>
          )}
        </div>
      )}

      <div
        className={`ant-dropzone${myStatus === 'SUBMITTED' ? ' disabled' : ''}`}
        onClick={() => {
          if (myStatus === 'SUBMITTED') return;
          inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (myStatus === 'SUBMITTED') return;
          handleFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <div className="ico">{myStatus === 'SUBMITTED' ? '🔒' : '📤'}</div>
        <div className="title">
          {myStatus === 'SUBMITTED'
            ? '제출 완료 — 추가 업로드 불가'
            : uploading
            ? '업로드 중...'
            : '이미지를 끌어다 놓거나 클릭해 업로드'}
        </div>
        <div className="hint">
          {myStatus === 'SUBMITTED'
            ? '제출을 취소하면 다시 업로드할 수 있습니다'
            : 'JPG, PNG, HEIC 지원 · 최대 200MB · SVG 불가'}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          disabled={myStatus === 'SUBMITTED'}
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
                <Badge variant="lavender">{s.status || '통과'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
