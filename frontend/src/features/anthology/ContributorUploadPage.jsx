import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  uploadContributionFile,
  listMySubmissions,
  getContributorToken,
  getContribDashboard,
  updateMyHandle,
  updateMyParameters,
  aiInspect,
  submitContribution,
  unsubmitContribution,
} from './api';
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
  const [handleInput, setHandleInput] = useState('');
  const [handleSaving, setHandleSaving] = useState(false);
  const [handleMsg, setHandleMsg] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [inspectCount, setInspectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [parameters, setParameters] = useState({});
  const [paramSaving, setParamSaving] = useState(false);
  const [paramMsg, setParamMsg] = useState(null);

  const definitions = dashboard?.contentTemplate?.definitions || {};
  const textBindings = Object.entries(definitions)
    .filter(([, v]) => v?.binding === 'text')
    .map(([key, v]) => ({ key, required: !!v.required, description: v.description || v.label || key }));
  const fileBindings = Object.entries(definitions)
    .filter(([, v]) => v?.binding === 'file')
    .map(([key, v]) => ({ key, required: !!v.required, description: v.description || v.label || key }));
  const isGalleryMode = fileBindings.length === 1;

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
      setParameters(d?.submissionParameters || {});
    } catch (_) {}
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

  const handleAiInspect = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await aiInspect();
      setAiResult(data);
      setInspectCount((n) => n + 1);
    } catch (e) {
      setAiError(e?.response?.data?.error || e.message);
    } finally {
      setAiLoading(false);
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
        setParameters(d?.submissionParameters || {});
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
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadContributionFile(file, isGalleryMode ? { bindingKey: fileBindings[0].key } : {});
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
              <span className="ant-badge lavender">제출 완료 ✓</span>
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
            <span className="ant-badge lavender">
              {dashboard.bookSpecUid || dashboard.anthology?.bookSpecUid || ''}
            </span>
          </div>
          <p className="ant-sub" style={{ marginTop: 8 }}>
            마감일: {dashboard.deadline || dashboard.anthology?.deadline || '-'} · 내 할당 페이지: {dashboard.allocatedPages ?? dashboard.me?.allocatedPages ?? 0}p · 내 제출: {dashboard.submissionCount ?? dashboard.me?.submissionCount ?? submissions.length}건
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
        </div>
      )}

      {dashboard?.requirements && (
        <div className="ant-card">
          <h2>필수 체크리스트</h2>
          {(() => {
            const req = dashboard.requirements;
            const photo = req.photoCount || {};
            const showPhoto = photo.mode && photo.mode !== 'none';
            const photoInsufficient =
              showPhoto && photo.min != null && (photo.current ?? 0) < photo.min;
            return (
              <>
                {showPhoto && (
                  <p className="ant-sub" style={{ marginTop: 8 }}>
                    {photo.min == null ? (
                      <>최소 장수 정보 없음 · 현재 {photo.current ?? 0}장</>
                    ) : (
                      <>
                        {photoInsufficient ? '⚠️ ' : '✅ '}
                        사진 {photo.current ?? 0}장 / 최소 {photo.min}장
                        {photoInsufficient && ' (부족)'}
                      </>
                    )}
                  </p>
                )}
                <ul className="ant-list" style={{ marginTop: 8 }}>
                  <li>
                    <span>
                      {req.handle?.ok ? '✅' : '⚠️'} 이름 입력{' '}
                      <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>
                    </span>
                  </li>
                  {(req.textParams || []).map((t) => {
                    const warn = t.required && !t.ok;
                    return (
                      <li key={`t-${t.key}`}>
                        <span>
                          {warn ? '⚠️' : '✅'} {t.description || t.key}{' '}
                          {t.required ? (
                            <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>
                          ) : (
                            <span className="ant-sub-sm" style={{ color: '#888' }}>(선택)</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                  {(req.fileBindings || []).map((f) => {
                    const warn = f.required && !f.ok;
                    return (
                      <li key={`f-${f.key}`}>
                        <span>
                          {warn ? '⚠️' : '✅'} {f.description || f.key}{' '}
                          {f.required ? (
                            <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>
                          ) : (
                            <span className="ant-sub-sm" style={{ color: '#888' }}>(선택)</span>
                          )}
                          {typeof f.uploadedCount === 'number' && (
                            <span className="ant-sub-sm" style={{ marginLeft: 6 }}>
                              ({f.uploadedCount}개 업로드됨)
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {dashboard.bookSpec && (
                  <p className="ant-sub-sm" style={{ marginTop: 10 }}>
                    판형: {dashboard.bookSpec.pageMin}~{dashboard.bookSpec.pageMax}p (증분{' '}
                    {dashboard.bookSpec.pageIncrement})
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {textBindings.length > 0 && (
        <div className="ant-card">
          <h2>제출 정보 입력</h2>
          <p className="ant-sub" style={{ marginTop: 6 }}>
            합동지에 사용될 텍스트 정보를 입력하세요.
          </p>
          {textBindings.map(({ key, required, description }) => (
            <div className="ant-field" key={key} style={{ marginTop: 12 }}>
              <label>
                {description}{' '}
                {required && <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>}
              </label>
              <input
                className="ant-input"
                value={parameters[key] || ''}
                onChange={(e) => setParameters((s) => ({ ...s, [key]: e.target.value }))}
                placeholder={key}
              />
            </div>
          ))}
          <div className="ant-row" style={{ marginTop: 12, gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="ant-btn ant-btn-primary"
              disabled={paramSaving}
              onClick={async () => {
                setParamSaving(true);
                setParamMsg(null);
                try {
                  await updateMyParameters(parameters);
                  setParamMsg('저장되었습니다');
                  await reloadAll();
                } catch (e) {
                  setParamMsg(e?.response?.data?.error || e.message);
                } finally {
                  setParamSaving(false);
                }
              }}
            >
              {paramSaving ? '저장 중...' : '입력 정보 저장'}
            </button>
            {paramMsg && <span className="ant-sub-sm">{paramMsg}</span>}
          </div>
        </div>
      )}

      {!isGalleryMode && fileBindings.length > 1 && (
        <div className="ant-card">
          <h2>이미지 업로드</h2>
          <p className="ant-sub" style={{ marginTop: 6 }}>
            각 슬롯에 해당하는 이미지를 업로드하세요.
          </p>
          {fileBindings.map(({ key, required, description }) => {
            const existing = submissions.find((s) => s.bindingKey === key);
            return (
              <div className="ant-field" key={key} style={{ marginTop: 12 }}>
                <label>
                  {description}{' '}
                  {required && <span style={{ color: 'var(--ant-danger, #c33)' }}>*</span>}
                </label>
                <div className="ant-row" style={{ gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      setError(null);
                      try {
                        await uploadContributionFile(f, { bindingKey: key });
                        await reloadAll();
                      } catch (err) {
                        setError(err?.response?.data?.error || err.message);
                      } finally {
                        setUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  {existing && (
                    <span className="ant-sub-sm" style={{ color: 'var(--ant-ink)' }}>
                      ✅ {existing.fileName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(isGalleryMode || fileBindings.length === 0) && (
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
      )}

      {error && <p className="ant-error">{error}</p>}

      <div className="ant-card ai-inspect-card">
        <div className="ant-row-between">
          <div>
            <h2>🤖 AI 인쇄 위험 분석</h2>
            <p className="ant-sub" style={{ marginTop: 6 }}>
              해상도, 잘림, 색상 등 인쇄 시 발생할 수 있는 위험을 AI가 점검합니다. 무제한 재검수 가능.
            </p>
          </div>
          <button
            type="button"
            className="ant-btn ai-inspect-btn"
            disabled={aiLoading || submissions.length === 0}
            onClick={handleAiInspect}
          >
            {aiLoading ? '분석 중...' : aiResult ? '🔄 다시 분석' : '🤖 AI 분석 시작'}
          </button>
        </div>

        {aiError && <p className="ant-error" style={{ marginTop: 10 }}>{aiError}</p>}

        {aiResult && (
          <div className="ai-result">
            <div className="ai-summary">
              <span className="ai-chip ok">✅ 통과 {aiResult.summary?.ok ?? 0}</span>
              <span className="ai-chip warn">⚠️ 주의 {aiResult.summary?.warn ?? 0}</span>
              <span className="ai-chip danger">🚨 위험 {aiResult.summary?.danger ?? 0}</span>
              <span className="ai-chip count">재분석 {inspectCount}회</span>
            </div>
            <ul className="ai-result-list">
              {(aiResult.pages || aiResult.items || []).map((p, i) => {
                const level = p.level || p.severity || 'ok';
                return (
                  <li key={p.id || p.fileName || i} className={`ai-result-row level-${level}`}>
                    <div className="ai-row-head">
                      <span className={`ai-level-badge ${level}`}>
                        {level === 'danger' ? '🚨 위험' : level === 'warn' ? '⚠️ 주의' : '✅ 통과'}
                      </span>
                      <span className="ai-file">{p.fileName || p.name || `페이지 ${i + 1}`}</span>
                    </div>
                    {Array.isArray(p.issues) && p.issues.length > 0 && (
                      <ul className="ai-issues">
                        {p.issues.map((iss, j) => (
                          <li key={j}>{typeof iss === 'string' ? iss : iss.message}</li>
                        ))}
                      </ul>
                    )}
                    {p.recommendation && (
                      <p className="ai-reco">💡 {p.recommendation}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

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
                <span className="ant-badge lavender">
                  {s.status || '통과'}
                  {s.bindingKey && <span className="ant-badge lavender" style={{ marginLeft: 6 }}>{s.bindingKey}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
