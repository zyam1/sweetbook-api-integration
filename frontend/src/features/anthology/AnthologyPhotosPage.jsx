import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getAnthology,
  listAllSubmissions,
  deleteSubmission,
  reorderSubmissions,
} from './api';
import Modal from '../../components/ui/Modal';
import './anthology.css';

// 백엔드 storedPath → 공개 URL 변환
function toPublicUrl(storedPath) {
  if (!storedPath) return '';
  if (/^https?:\/\//.test(storedPath)) return storedPath;
  const idx = storedPath.indexOf('uploads/');
  if (idx >= 0) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return `${base}/${storedPath.substring(idx)}`;
  }
  return storedPath;
}

export default function AnthologyPhotosPage() {
  const { id } = useParams();
  const [anthology, setAnthology] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = async () => {
    try {
      const [a, list] = await Promise.all([
        getAnthology(id),
        listAllSubmissions(id),
      ]);
      setAnthology(a);
      setItems(Array.isArray(list) ? list : list?.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    setDragIndex(null);
    reorderSubmissions(id, next.map((s) => s.id)).catch((e) =>
      setError(e?.response?.data?.error || e.message)
    );
  };

  const handleDelete = async (sid) => {
    try {
      await deleteSubmission(id, sid);
      setItems((cur) => cur.filter((s) => s.id !== sid));
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const handleConfirmDelete = async () => {
    const sid = pendingDeleteId;
    if (sid == null) return;
    await handleDelete(sid);
    setPendingDeleteId(null);
  };

  const statusLabel = (s) =>
    s === 'SUBMITTED' ? '제출완료' : s === 'DRAFT' ? '작성중' : '대기';

  if (loading) return <div className="ant-page"><p className="ant-sub">불러오는 중...</p></div>;
  if (error) return <div className="ant-page"><p className="ant-error">{error}</p></div>;
  if (!anthology) return null;

  return (
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <Link to={`/anthology/${id}`}>{anthology.title}</Link>
        <span className="ant-crumb-sep">›</span>
        <span>사진/순서 관리</span>
      </div>

      <div className="ant-row-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1>사진/순서 관리</h1>
          <p className="ant-sub">총 {items.length}장 · 드래그하여 순서를 변경할 수 있습니다.</p>
        </div>
        <Link to={`/anthology/${id}`} className="ant-btn">돌아가기</Link>
      </div>

      <div className="ant-card" style={{ marginTop: 16 }}>
        {items.length === 0 ? (
          <p className="ant-sub">등록된 사진이 없습니다.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 12,
            }}
          >
            {items.map((s, idx) => {
              const status = s.contributor?.status || 'PENDING';
              return (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: 8,
                    padding: 8,
                    background: '#fff',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: '#f5f5f5',
                      borderRadius: 6,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={toPublicUrl(s.storedPath)}
                      alt={s.fileName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.contributor?.handle || '이름 없음'}
                  </div>
                  <div className="ant-row-between">
                    <span className={`badge badge-${status.toLowerCase()}`} style={{ fontSize: 11 }}>
                      {statusLabel(status)}
                    </span>
                    <button
                      type="button"
                      className="ant-btn"
                      style={{ fontSize: 11, padding: '4px 8px' }}
                      onClick={() => setPendingDeleteId(s.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={pendingDeleteId !== null}
        title="사진 삭제"
        message="정말 이 사진을 삭제하시겠습니까?"
        variant="danger"
        confirmText="삭제"
        cancelText="취소"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
