import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "./api";
import { orderStatusLabel } from "../anthology/orderStatus";
import "../anthology/anthology.css";
import "./OrderDetailPage.css";

// 백엔드 storedPath → 공개 URL 변환 (AnthologyPhotosPage와 동일 규칙)
function toPublicUrl(storedPath) {
  if (!storedPath) return "";
  if (/^https?:\/\//.test(storedPath)) return storedPath;
  const idx = storedPath.indexOf("uploads/");
  if (idx >= 0) {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    const rel = storedPath.substring(idx).split("/").map(encodeURIComponent).join("/");
    return `${base}/${rel}`;
  }
  return storedPath;
}

// Figma: SweetPress / Order / Detail
export default function OrderDetailPage() {
  const { orderUid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    getOrder(orderUid)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error || e.message);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [orderUid]);

  if (loading) {
    return (
      <div className="ant-page">
        <p className="ant-sub">불러오는 중...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="ant-page">
        <p className="ant-error">{error}</p>
        <Link to="/orders" className="ant-btn">
          주문 목록으로
        </Link>
      </div>
    );
  }
  if (!data || !data.order) {
    return (
      <div className="ant-page">
        <p className="ant-sub">주문을 찾을 수 없습니다.</p>
        <Link to="/orders" className="ant-btn">
          주문 목록으로
        </Link>
      </div>
    );
  }

  const { order, anthology, photos } = data;
  const created = order.createdAt
    ? new Date(order.createdAt).toLocaleString("ko-KR")
    : "";
  const updated = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString("ko-KR")
    : "";

  // contributor별 그룹핑
  const grouped = (photos || []).reduce((acc, p) => {
    const key = p.contributorHandle || `#${p.contributorId ?? "unknown"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="ant-page">
      <div className="ant-row-between">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1>주문 상세</h1>
          <p className="ant-sub">
            {order.sweetbookOrderUid} · 생성 {created}
            {updated && updated !== created ? ` · 수정 ${updated}` : ""}
          </p>
        </div>
        <span className="ant-badge lavender">
          {orderStatusLabel(order.status)}
        </span>
      </div>

      <div className="ant-card">
        <h2 className="ant-section-title">주문 정보</h2>
        <div className="ant-kv">
          <div>
            <span>수량</span>
            <strong>{order.quantity ?? 0}권</strong>
          </div>
          <div>
            <span>총 금액</span>
            <strong>
              {Number(order.totalAmount ?? 0).toLocaleString("ko-KR")}원
            </strong>
          </div>
          <div>
            <span>결제 크레딧</span>
            <strong>
              {Number(order.paidCreditAmount ?? 0).toLocaleString("ko-KR")}
            </strong>
          </div>
          <div>
            <span>수령인</span>
            <strong>{order.recipientName || "-"}</strong>
          </div>
          {order.trackingNumber && (
            <div>
              <span>운송장</span>
              <strong>{order.trackingNumber}</strong>
            </div>
          )}
          {order.externalRef && (
            <div>
              <span>외부 참조</span>
              <strong>{order.externalRef}</strong>
            </div>
          )}
        </div>
      </div>

      {anthology && (
        <div className="ant-card">
          <h2 className="ant-section-title">연결된 합동지</h2>
          <div className="ant-row-between">
            <div>
              <div className="ant-anthology-card-title">
                {anthology.title || "제목 없음"}
              </div>
              <div className="ant-anthology-card-meta">
                상태 {anthology.status || "-"}
              </div>
            </div>
            <Link
              to={`/anthology/${anthology.id}`}
              className="ant-btn ant-btn-primary"
            >
              대시보드로 이동
            </Link>
          </div>
        </div>
      )}

      <div className="ant-card">
        <h2 className="ant-section-title">
          업로드된 사진 ({photos?.length ?? 0})
        </h2>
        {(!photos || photos.length === 0) && (
          <p className="ant-sub">업로드된 사진이 없습니다.</p>
        )}
        {Object.entries(grouped).map(([handle, list]) => (
          <div key={handle} className="order-photo-group">
            <div className="order-photo-group-title">
              {handle} · {list.length}장
            </div>
            <div className="order-photo-grid">
              {list.map((p) => (
                <div key={p.id} className="order-photo-item">
                  <div className="order-photo-thumb">
                    {p.storedPath ? (
                      <img src={toPublicUrl(p.storedPath)} alt={p.fileName} />
                    ) : (
                      (p.fileName || "").slice(-12)
                    )}
                  </div>
                  <div className="order-photo-name">{p.fileName}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Link to="/orders" className="ant-btn">
          주문 목록으로
        </Link>
      </div>
    </div>
  );
}
