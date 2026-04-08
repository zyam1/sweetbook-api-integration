// 표지 설정 모달 (SweetPress 디자인 시스템 재사용)
import { useState } from 'react';
import { updateCover, uploadAnthologyCoverPhoto } from './api';
import './anthology.css';

export default function CoverSettingsModal({ anthology, onClose, onSaved }) {
  const [frontPhoto, setFrontPhoto] = useState(anthology?.coverFrontPhoto || '');
  const [backPhoto, setBackPhoto] = useState(anthology?.coverBackPhoto || '');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file, which) => {
    if (!file) return;
    const setUploading = which === 'front' ? setUploadingFront : setUploadingBack;
    const setPhoto = which === 'front' ? setFrontPhoto : setBackPhoto;
    setUploading(true);
    setError(null);
    try {
      const { fileName } = await uploadAnthologyCoverPhoto(anthology.id, file);
      setPhoto(fileName);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateCover(anthology.id, { frontPhoto, backPhoto });
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setSaving(false);
    }
  };

  const canSave = !!frontPhoto && !saving;

  return (
    <div className="ant-modal-backdrop" onClick={onClose}>
      <div className="ant-modal" onClick={(e) => e.stopPropagation()}>
        <h2>표지 설정</h2>
        <p className="ant-sub">
          앞/뒤 표지 이미지를 업로드하세요.
        </p>

        <div className="ant-card-soft">
          <p className="ant-sub-sm" style={{ fontWeight: 600 }}>앞/뒤 표지 이미지</p>

          <div style={{ marginTop: 10 }}>
            <p className="ant-sub-sm">앞표지 (필수)</p>
            <div className="ant-row" style={{ gap: 8, marginTop: 6 }}>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingFront}
                onChange={(e) => handleUpload(e.target.files?.[0], 'front')}
              />
            </div>
            {uploadingFront && <p className="ant-sub-sm">업로드 중...</p>}
            {frontPhoto && !uploadingFront && (
              <p className="ant-sub-sm" style={{ color: 'var(--ant-ink)' }}>
                ✅ {frontPhoto}
              </p>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <p className="ant-sub-sm">뒤표지 (선택)</p>
            <div className="ant-row" style={{ gap: 8, marginTop: 6 }}>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingBack}
                onChange={(e) => handleUpload(e.target.files?.[0], 'back')}
              />
            </div>
            {uploadingBack && <p className="ant-sub-sm">업로드 중...</p>}
            {backPhoto && !uploadingBack && (
              <p className="ant-sub-sm" style={{ color: 'var(--ant-ink)' }}>
                ✅ {backPhoto}
              </p>
            )}
          </div>
        </div>

        {error && <p className="ant-error">{error}</p>}

        <div className="ant-modal-actions">
          <button className="ant-btn" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button
            className="ant-btn ant-btn-primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
