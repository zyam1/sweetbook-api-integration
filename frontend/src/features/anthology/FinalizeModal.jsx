import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { finalizeAnthology } from './api';
import './anthology.css';
import './FinalizeModal.css';

// Figma: SweetPress / Anthology / Finalize Modal (node 115:122)
export default function FinalizeModal({ anthology, onClose }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFinalize = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await finalizeAnthology(anthology.id);
      navigate(`/anthology/${anthology.id}/order`, {
        state: { finalizeResult: result, anthology },
      });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="ant-modal-backdrop" onClick={onClose}>
      <div className="ant-modal" onClick={(e) => e.stopPropagation()}>
        <h2>합동지 최종화</h2>
        <p className="ant-sub">지금 마감하면 더 이상 원고를 추가하거나 수정할 수 없어요.</p>

        <div className="ant-card-soft">
          <p className="ant-sub-sm" style={{ fontWeight: 600 }}>합동지 요약</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--ant-ink)', margin: '4px 0' }}>
            {anthology?.title}
          </p>
          <p className="ant-sub-sm">{anthology?.bookSpecUid || ''}</p>
          <div className="ant-divider" style={{ margin: '10px 0' }} />
          <p style={{ fontSize: 14, color: 'var(--ant-ink)', margin: 0 }}>
            참여자 {anthology?.contributorCount ?? 0}명
          </p>
          <p style={{ fontSize: 14, color: 'var(--ant-ink)', margin: '4px 0 0' }}>
            총 페이지 {anthology?.pageCount ?? 0}p
          </p>
        </div>

        <div className="ant-card-soft">
          <p className="ant-sub-sm" style={{ fontWeight: 600 }}>마감 전 점검</p>
          <p className="ant-success" style={{ marginTop: 6 }}>✅ 페이지 조건이 판형 범위에 맞는지 확인</p>
          <p className="ant-success">✅ 표지 이미지가 설정되어 있는지 확인</p>
          <p className="ant-warn">⚠ 미제출 기여자는 마감 시 자동 제외됩니다</p>
        </div>

        <div className="ant-info-banner">
          <span>ℹ</span>
          <span>마감하면 SweetBook으로 전송되어 책으로 제작 의뢰됩니다.</span>
        </div>

        {error && <p className="ant-error">{error}</p>}

        <div className="ant-modal-actions">
          <button className="ant-btn" onClick={onClose} disabled={submitting}>취소</button>
          <button className="ant-btn ant-btn-primary" onClick={handleFinalize} disabled={submitting}>
            {submitting ? '마감 중...' : '마감하고 제작 의뢰'}
          </button>
        </div>
      </div>
    </div>
  );
}
