import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookApi } from './bookApi';

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [bookSpecUid, setBookSpecUid] = useState('SQUAREBOOK_HC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await bookApi.create({ title, bookSpecUid });
      const bookUid = data.data?.bookUid || data.data?.uid;
      navigate(`/books/${bookUid}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>새 책 만들기</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">책 제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="나의 첫 포토북"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="spec">판형</label>
          <select id="spec" value={bookSpecUid} onChange={(e) => setBookSpecUid(e.target.value)}>
            <option value="SQUAREBOOK_HC">정사각 하드커버</option>
            <option value="SQUAREBOOK_SC">정사각 소프트커버</option>
            <option value="A4_HC">A4 하드커버</option>
            <option value="A4_SC">A4 소프트커버</option>
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '생성 중...' : '책 생성'}
        </button>
      </form>
    </div>
  );
}
