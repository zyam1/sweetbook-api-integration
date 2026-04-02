import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookApi } from './bookApi';
import ResultView from '../../components/ResultView';

export default function BookListPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await bookApi.getList();
      setBooks(data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>책 목록</h2>
        <button className="btn btn-primary" onClick={() => navigate('/books/new')}>
          + 새 책 만들기
        </button>
      </div>

      {loading && <p className="loading">불러오는 중...</p>}
      {error && <p className="error">오류: {error}</p>}

      {books && (
        Array.isArray(books) && books.length > 0 ? (
          <div className="card-list">
            {books.map((book) => (
              <div key={book.bookUid} className="card" onClick={() => navigate(`/books/${book.bookUid}`)}>
                <h3>{book.title || '제목 없음'}</h3>
                <span className={`badge badge-${book.status?.toLowerCase()}`}>{book.status}</span>
                <p className="card-meta">{book.bookSpecUid}</p>
              </div>
            ))}
          </div>
        ) : (
          <ResultView data={books} emptyMessage="생성된 책이 없습니다." />
        )
      )}
    </div>
  );
}
