import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listContributors, createContributor } from './api';
import './anthology.css';
import './ContributorsPage.css';

export default function ContributorsPage() {
  const { id } = useParams();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    listContributors(id)
      .then((d) => setContributors(Array.isArray(d) ? d : d?.items || []))
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createContributor(id, form);
      setForm({ name: '', email: '' });
      load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const linkFor = (token) => `${window.location.origin}/c/${token}`;

  return (
    <div className="ant-page">
      <div className="ant-row-between">
        <h1>기여자 관리</h1>
        <Link to={`/anthology/${id}`} className="ant-btn">대시보드로</Link>
      </div>

      <div className="ant-card">
        <h2>새 기여자 초대</h2>
        <form onSubmit={handleCreate}>
          <div className="ant-field">
            <label>이름</label>
            <input className="ant-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="ant-field">
            <label>이메일 (선택)</label>
            <input className="ant-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <button className="ant-btn ant-btn-primary" disabled={submitting}>{submitting ? '발급 중...' : '초대 토큰 발급'}</button>
        </form>
      </div>

      <h2>발급된 초대 링크</h2>
      {loading && <p className="ant-sub">불러오는 중...</p>}
      {error && <p className="ant-sub" style={{ color: '#c0392b' }}>{error}</p>}
      <div className="ant-card">
        {contributors.length === 0 ? (
          <p className="ant-sub">아직 기여자가 없습니다.</p>
        ) : (
          <ul className="ant-list">
            {contributors.map((c) => (
              <li key={c.id || c.token}>
                <div>
                  <strong>{c.name || '이름 없음'}</strong>
                  {c.token && (
                    <div className="ant-sub" style={{ wordBreak: 'break-all' }}>{linkFor(c.token)}</div>
                  )}
                </div>
                {c.token && (
                  <button className="ant-btn" onClick={() => navigator.clipboard.writeText(linkFor(c.token))}>복사</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
