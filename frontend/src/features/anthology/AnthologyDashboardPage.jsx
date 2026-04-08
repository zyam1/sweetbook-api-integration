import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteAnthology,
  getAnthology,
  listAllSubmissions,
  listContributors,
  reorderContributors,
} from "./api";
import FinalizeModal from "./FinalizeModal";
import CoverSettingsModal from "./CoverSettingsModal";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/Badge";
import { orderStatusLabel, orderBadgeClass } from "./orderStatus";
import { anthologyStatusLabel, anthologyBadgeClass } from "./anthologyStatus";
import "./anthology.css";
import "./AnthologyDashboardPage.css";

const coverBaseUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/uploads/anthology`;

// Figma: SweetPress / Anthology / Dashboard (:id) (node 112:60)
export default function AnthologyDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anthology, setAnthology] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFinalize, setShowFinalize] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [photosByContributor, setPhotosByContributor] = useState({});

  // storedPath → 공개 URL 변환 (AnthologyPhotosPage와 동일 규칙)
  const toPublicUrl = (storedPath) => {
    if (!storedPath) return "";
    if (/^https?:\/\//.test(storedPath)) return storedPath;
    const idx = storedPath.indexOf("uploads/");
    if (idx >= 0) {
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      return `${base}/${storedPath.substring(idx)}`;
    }
    return storedPath;
  };

  const handleDelete = async () => {
    try {
      await deleteAnthology(id);
      setShowDeleteConfirm(false);
      navigate("/anthology");
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setShowDeleteConfirm(false);
    }
  };

  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (dragIndex === null || dragIndex === idx) return;
    const next = [...contributors];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setContributors(next);
    setDragIndex(null);
    reorderContributors(
      id,
      next.map((c) => c.id),
    ).catch((e) => setError(e?.response?.data?.error || e.message));
  };

  const showToast = (message, variant) => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2000);
  };

  const handleCopyLink = async (e, token) => {
    e.stopPropagation();
    if (!token) return;
    const url = `${window.location.origin}/c/${token}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("execCommand failed");
      }
      setCopiedId(token);
      setTimeout(
        () => setCopiedId((cur) => (cur === token ? null : cur)),
        1500,
      );
      showToast("제출 링크가 복사되었습니다. 참여자에게 전달해 주세요.", "success");
    } catch {
      showToast("복사에 실패했습니다", "error");
    }
  };

  const handleRowToggle = (cid) => {
    if (!cid) return;
    setExpandedId((cur) => (cur === cid ? null : cid));
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      getAnthology(id),
      listContributors(id).catch(() => []),
      listAllSubmissions(id).catch(() => []),
    ])
      .then(([a, c, subs]) => {
        if (!alive) return;
        setAnthology(a);
        setContributors(Array.isArray(c) ? c : c?.items || []);
        const list = Array.isArray(subs) ? subs : subs?.items || [];
        const grouped = {};
        for (const s of list) {
          const key = s.contributorId ?? s.contributor?.id;
          if (key == null) continue;
          (grouped[key] = grouped[key] || []).push(s);
        }
        setPhotosByContributor(grouped);
      })
      .catch((e) => alive && setError(e?.response?.data?.error || e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading)
    return (
      <div className="ant-page">
        <p className="ant-sub">불러오는 중...</p>
      </div>
    );
  if (error)
    return (
      <div className="ant-page">
        <p className="ant-error">{error}</p>
      </div>
    );
  if (!anthology) return null;

  const submitted = contributors.filter((c) => c.status === "SUBMITTED").length;
  const pending = contributors.length - submitted;
  const hasBothCovers =
    !!anthology.coverFrontPhoto && !!anthology.coverBackPhoto;
  const hasEnoughPages = (anthology.pageCount ?? 0) >= 24;
  const canFinalize = hasBothCovers && hasEnoughPages;
  const statusLabel = (s) =>
    s === "SUBMITTED" ? "제출완료" : s === "DRAFT" ? "작성중" : "대기";

  const latestOrder = anthology.latestOrder;
  if (latestOrder) {
    const orderLabel = orderStatusLabel(latestOrder.status);
    const orderBadge = orderBadgeClass(latestOrder.status);
    const createdAtText = latestOrder.createdAt
      ? new Date(latestOrder.createdAt).toLocaleString("ko-KR")
      : "-";
    return (
      <div className="ant-page">
        <div className="ant-crumb">
          <span>합동지</span>
          <span className="ant-crumb-sep">›</span>
          <span>{anthology.title}</span>
        </div>

        <div className="ant-row-between">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="ant-row">
              <h1>{anthology.title}</h1>
              <Badge variant={orderBadge}>{orderLabel}</Badge>
            </div>
            <p className="ant-sub">
              {anthology.bookSpecUid || ""} · 페이지 {anthology.pageCount ?? 0}p
              · 참여자 {contributors.length}명
            </p>
          </div>
        </div>

        <div className="ant-card">
          <div className="ant-row-between">
            <h2>배송 정보</h2>
            <Badge variant={orderBadge}>{orderLabel}</Badge>
          </div>
          <ul className="ant-list" style={{ marginTop: 12 }}>
            <li className="ant-row-between">
              <span className="ant-sub">주문번호</span>
              <span>{latestOrder.sweetbookOrderUid || "-"}</span>
            </li>
            <li className="ant-row-between">
              <span className="ant-sub">수령인</span>
              <span>{latestOrder.recipientName ?? "-"}</span>
            </li>
            <li className="ant-row-between">
              <span className="ant-sub">수량</span>
              <span>{latestOrder.quantity}</span>
            </li>
            <li className="ant-row-between">
              <span className="ant-sub">결제금액</span>
              <span>
                {Number(latestOrder.paidCreditAmount ?? 0).toLocaleString()}{" "}
                크레딧
              </span>
            </li>
            <li className="ant-row-between">
              <span className="ant-sub">송장번호</span>
              <span>{latestOrder.trackingNumber || "준비중"}</span>
            </li>
            <li className="ant-row-between">
              <span className="ant-sub">주문일</span>
              <span>{createdAtText}</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <span>{anthology.title}</span>
      </div>

      <div className="ant-row-between">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="ant-row">
            <h1>{anthology.title}</h1>
            <Badge variant={anthologyBadgeClass(anthology.status || "DRAFT")}>
              {anthologyStatusLabel(anthology.status || "DRAFT")}
            </Badge>
          </div>
          <p className="ant-sub">
            {anthology.bookSpecUid || ""} · 페이지 {anthology.pageCount ?? 0}p ·
            참여자 {contributors.length}명
          </p>
        </div>
        <div className="ant-row" style={{ gap: 8 }}>
          <Link to={`/anthology/${id}/contributors`} className="ant-btn">
            참여자 초대
          </Link>
          <button
            type="button"
            className="ant-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            삭제
          </button>
          <button
            className="ant-btn ant-btn-primary"
            onClick={() => setShowFinalize(true)}
            disabled={!canFinalize}
            title={
              !canFinalize
                ? "표지(앞/뒤)와 24p 이상의 내지가 필요합니다."
                : undefined
            }
          >
            마감
          </button>
        </div>
      </div>

      <div className="ant-stat-grid">
        <div className="ant-stat">
          <span className="ant-stat-label">참여 인원</span>
          <span className="ant-stat-value">{contributors.length}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">제출 완료</span>
          <span className="ant-stat-value success">{submitted}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">미제출</span>
          <span className="ant-stat-value warn">{pending}</span>
        </div>
        <div className="ant-stat">
          <span className="ant-stat-label">총 페이지</span>
          <span className="ant-stat-value">{anthology.pageCount ?? 0}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="ant-card">
          <div className="ant-row-between">
            <h2>표지 설정</h2>
            <Badge variant={anthology.coverFrontPhoto ? "lavender" : "pink"}>
              {anthology.coverFrontPhoto ? "설정됨" : "미설정"}
            </Badge>
          </div>
          <p className="ant-sub" style={{ marginTop: 10 }}>
            앞/뒤 표지 이미지를 업로드하세요.
          </p>
          <div className="cover-thumbs">
            {["front", "back"].map((side) => {
              const fileName =
                side === "front"
                  ? anthology.coverFrontPhoto
                  : anthology.coverBackPhoto;
              const url = fileName
                ? `${coverBaseUrl}/${id}/cover/${fileName}`
                : "";
              return (
                <div key={side} className="cover-thumb">
                  <div className="cover-thumb-frame">
                    {url ? (
                      <img src={url} alt={`${side} cover`} />
                    ) : (
                      <span className="ant-sub-sm">미설정</span>
                    )}
                  </div>
                  <p className="ant-sub-sm" style={{ marginTop: 6 }}>
                    {side === "front" ? "앞표지" : "뒤표지"}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              className="ant-btn ant-btn-primary"
              onClick={() => setShowCoverModal(true)}
            >
              표지 설정
            </button>
          </div>
        </div>

        <div className="ant-card">
          <div className="ant-row-between">
            <h2>사진/순서 관리</h2>
            <Link to={`/anthology/${id}/photos`} className="ant-btn">
              관리하기
            </Link>
          </div>
          <p className="ant-sub" style={{ marginTop: 10 }}>
            참여자들이 제출한 사진을 확인하고 내지 순서를 조정합니다.
          </p>
        </div>

        <div className="ant-card">
          <h2>참여자 목록</h2>
          <p className="ant-sub" style={{ marginTop: 8 }}>
            각 참여자에게 <strong>제출 링크</strong>를 복사해 전달하세요. 참여자는 전달받은 링크로만 사진 제출 페이지에 접근할 수 있습니다.
          </p>
          {contributors.length === 0 ? (
            <p className="ant-sub" style={{ marginTop: 12 }}>
              등록된 참여자가 없습니다.
            </p>
          ) : (
            <ul className="ant-list">
              {contributors.map((c, idx) => {
                const status = c.status || "PENDING";
                const cid = c.id;
                const token = c.inviteToken || c.token;
                const copied = copiedId === token;
                const expanded = expandedId === cid;
                const photos = photosByContributor[cid] || [];
                return (
                  <li
                    key={cid || token}
                    className={`participant-row${expanded ? " expanded" : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    onClick={() => handleRowToggle(cid)}
                  >
                    <div className="participant-row-main">
                      <div>
                        <div className="name">
                          {c.handle || c.name || "이름 없음"}
                        </div>
                        <div className="meta">
                          {c.email || `${c._count?.submissions ?? c.submissionCount ?? 0}건 제출`}
                        </div>
                      </div>
                      <div className="ant-row" style={{ gap: 8 }}>
                        <span className={`badge badge-${status.toLowerCase()}`}>
                          {statusLabel(status)}
                        </span>
                        <button
                          type="button"
                          className="ant-btn"
                          disabled={!token}
                          onClick={(e) => handleCopyLink(e, token)}
                        >
                          {copied ? "복사됨" : "제출 링크 복사"}
                        </button>
                        <span className="arrow" aria-hidden>
                          {expanded ? "⌄" : "›"}
                        </span>
                      </div>
                    </div>
                    {expanded && (
                      <div
                        className="participant-photos"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photos.length === 0 ? (
                          <p className="ant-sub-sm">제출된 사진이 없습니다.</p>
                        ) : (
                          <div className="participant-photos-grid">
                            {photos.map((p) => (
                              <div
                                key={p.id}
                                className="participant-photo-thumb"
                              >
                                <img
                                  src={toPublicUrl(p.storedPath)}
                                  alt={p.fileName || `submission-${p.id}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <Modal
        open={showDeleteConfirm}
        title="합동지 삭제"
        message={
          "정말 이 합동지를 삭제하시겠습니까?\n모든 참여자와 제출물이 함께 삭제되며 되돌릴 수 없습니다."
        }
        variant="danger"
        confirmText="삭제"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {showFinalize && (
        <FinalizeModal
          anthology={{ ...anthology, contributorCount: contributors.length }}
          onClose={() => setShowFinalize(false)}
        />
      )}

      {showCoverModal && (
        <CoverSettingsModal
          anthology={anthology}
          onClose={() => setShowCoverModal(false)}
          onSaved={async () => {
            const a = await getAnthology(id);
            setAnthology(a);
          }}
        />
      )}

      {toast && (
        <div
          className={`ant-toast ant-toast-${toast.variant || "success"}`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
