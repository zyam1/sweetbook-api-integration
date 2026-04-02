import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookApi } from './bookApi';
import ResultView from '../../components/ResultView';

export default function BookDetailPage() {
  const { bookUid } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await bookApi.get(bookUid);
        setBook(data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookUid]);

  const handleFinalize = async () => {
    if (!confirm('최종화하면 이후 수정이 불가합니다. 진행할까요?')) return;
    try {
      await bookApi.finalize(bookUid);
      const { data } = await bookApi.get(bookUid);
      setBook(data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제할까요?')) return;
    try {
      await bookApi.delete(bookUid);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <p className="loading">불러오는 중...</p>;
  if (error) return <p className="error">오류: {error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>{book?.title || '제목 없음'}</h2>
        <div className="btn-group">
          {book?.status === 'DRAFT' && (
            <>
              <button className="btn btn-primary" onClick={handleFinalize}>최종화</button>
              <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
            </>
          )}
          <button className="btn" onClick={() => navigate('/books')}>목록으로</button>
        </div>
      </div>
      <ResultView data={book} />
    </div>
  );
}
