import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { finalizeAnthology } from './api';
import './anthology.css';
import './FinalizeModal.css';

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
        <h2>합동지 마감</h2>
        <p className="ant-sub">마감 후에는 기여자가 더 이상 사진을 제출할 수 없습니다.</p>

        <div className="ant-card" style={{ marginTop: 16 }}>
          <div><strong>{anthology?.title}</strong></div>
          <div className="ant-sub">페이지 {anthology?.pageCount ?? 0}p · 기여자 {anthology?.contributorCount ?? 0}명</div>
        </div>

        <h3 style={{ fontSize: 14, marginTop: 20, marginBottom: 8 }}>마감 전 점검</h3>
        <ul className="ant-sub" style={{ paddingLeft: 18, margin: 0 }}>
          <li>페이지 수가 판형 최소/최대 범위에 맞는지 확인</li>
          <li>표지 이미지가 설정되어 있는지 확인</li>
          <li>모든 기여자의 제출이 완료되었는지 확인</li>
        </ul>

        <p className="ant-sub" style={{ marginTop: 16 }}>
          마감하면 책이 최종화되고 제작 의뢰 단계로 넘어갑니다.
        </p>

        {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}

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
