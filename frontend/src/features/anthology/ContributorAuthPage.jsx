import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contributorAuth } from './api';
import './anthology.css';
import './ContributorAuthPage.css';

// Figma: SweetPress / Submit / Auth Gate (:token) (node 114:128)
export default function ContributorAuthPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await contributorAuth(token, handle);
      navigate(`/c/${token}/upload`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ant-auth-wrap">
      <div className="ant-auth-card">
        <div className="ant-auth-icon">📖</div>
        <h1>기여자 인증</h1>
        <p className="ant-sub">합동지에 초대되었어요. 핸들을 입력해 본인 확인을 해주세요.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="ant-field">
            <label>핸들</label>
            <input
              className="ant-input"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
              placeholder="@misun"
            />
          </div>

          {error && <p className="ant-error">{error}</p>}

          <button
            type="submit"
            className="ant-btn ant-btn-primary"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? '확인 중...' : '인증하고 입장하기'}
          </button>
        </form>

        <p className="ant-sub-sm">이 토큰은 1회 인증으로 사용되며 마감 시 만료됩니다.</p>
      </div>
    </div>
  );
}
