import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listContributors, createContributor } from './api';
import './anthology.css';
import './ContributorsPage.css';

// Figma: SweetPress / Anthology / Contributors (:id) (node 114:60)
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
      await createContributor(id, { handle: form.name, email: form.email });
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
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <Link to={`/anthology/${id}`}>대시보드</Link>
        <span className="ant-crumb-sep">›</span>
        <span>참여자 관리</span>
      </div>

      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>참여자 관리</h1>
          <p className="ant-sub">토큰 링크를 발급해 참여자를 초대하세요. 토큰은 1회 인증으로 사용됩니다.</p>
        </div>
        <Link to={`/anthology/${id}`} className="ant-btn">대시보드로</Link>
      </div>

      <div className="ant-card">
        <h2>새 토큰 발급</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div className="ant-row" style={{ alignItems: 'flex-end' }}>
            <div className="ant-field" style={{ flex: 2 }}>
              <label>참여자 이름</label>
              <input
                className="ant-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 김미선"
                required
              />
            </div>
            <div className="ant-field" style={{ flex: 3 }}>
              <label>이메일 (선택)</label>
              <input
                className="ant-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <button className="ant-btn ant-btn-pink" disabled={submitting}>
              {submitting ? '발급 중...' : '발급'}
            </button>
          </div>
        </form>
      </div>

      <div className="ant-card">
        <h2>발급된 토큰</h2>
        {loading && <p className="ant-sub" style={{ marginTop: 12 }}>불러오는 중...</p>}
        {error && <p className="ant-error" style={{ marginTop: 12 }}>{error}</p>}
        {!loading && contributors.length === 0 ? (
          <p className="ant-sub" style={{ marginTop: 12 }}>아직 참여자가 없습니다.</p>
        ) : (
          <ul className="ant-list" style={{ marginTop: 8 }}>
            {contributors.map((c) => {
              const token = c.inviteToken || c.token;
              const used = !!c.tokenUsedAt || !!c.usedAt || !!c.authedAt;
              return (
                <li key={c.id || token}>
                  <div>
                    <div className="name">{c.handle || c.name || '이름 없음'}</div>
                    {token && (
                      <div className="meta" style={{ wordBreak: 'break-all' }}>{linkFor(token)}</div>
                    )}
                  </div>
                  <div className="ant-row" style={{ gap: 8 }}>
                    <span className={`ant-badge ${used ? 'lavender' : 'yellow'}`}>
                      {used ? '인증 완료' : '미사용'}
                    </span>
                    {token && (
                      <button
                        type="button"
                        className="ant-btn ant-btn-ghost"
                        onClick={() => navigator.clipboard.writeText(linkFor(token))}
                      >
                        복사
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
