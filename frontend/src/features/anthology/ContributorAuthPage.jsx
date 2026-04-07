import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contributorAuth } from './api';
import './anthology.css';
import './ContributorAuthPage.css';

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
        <h1>합동지에 참여하기</h1>
        <p className="ant-sub">이름(핸들)을 입력하면 사진을 제출할 수 있습니다.</p>
        <form onSubmit={handleSubmit}>
          <div className="ant-field">
            <label>핸들</label>
            <input className="ant-input" value={handle} onChange={(e) => setHandle(e.target.value)} required placeholder="예: jiwon" />
          </div>
          {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}
          <button className="ant-btn ant-btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? '확인 중...' : '참여하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
