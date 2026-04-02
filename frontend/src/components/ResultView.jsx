export default function ResultView({ data, emptyMessage = '데이터가 없습니다.' }) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <details className="result-view">
      <summary>API 응답 원본 보기</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
