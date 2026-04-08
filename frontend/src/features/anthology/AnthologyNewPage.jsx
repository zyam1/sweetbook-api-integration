import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnthology, createContributor } from "./api";
import "./anthology.css";
import "./AnthologyNewPage.css";

// Figma: SweetPress / Anthology / New (Wizard) (node 111:60)
const STEPS = ["기본 정보", "참여자 모집"];

export default function AnthologyNewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    password: "",
  });
  const [contributors, setContributors] = useState([{ name: "", email: "" }]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 0 && form.password.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAnthology({
        title: form.title,
        description: form.description,
        deadline: form.deadline || null,
        password: form.password,
      });
      const anthologyId = created?.id || created?.anthologyId;
      for (const c of contributors) {
        if (c.name.trim()) {
          await createContributor(anthologyId, {
            handle: c.name,
            email: c.email,
          });
        }
      }
      navigate(`/anthology/${anthologyId}`);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ant-page">
      <div className="ant-crumb">
        <span>합동지</span>
        <span className="ant-crumb-sep">›</span>
        <span>새로 만들기</span>
      </div>

      <h1>새 합동지 만들기</h1>

      <div className="ant-steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className="step-wrap"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div className={`step ${i === step ? "active" : ""}`}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="step-sep">———</span>}
          </div>
        ))}
      </div>

      <div className="ant-card">
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="ant-field">
              <label>합동지 제목</label>
              <input
                className="ant-input"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="예: 봄날의 시집"
              />
            </div>
            <div className="ant-field">
              <label>소개</label>
              <textarea
                className="ant-textarea"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="어떤 책인가요?"
              />
            </div>
            <div className="ant-field">
              <label>마감일</label>
              <input
                className="ant-input"
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
              />
            </div>
            <div className="ant-field">
              <label>참여 비밀번호</label>
              <input
                className="ant-input"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="참여자가 입장할 때 사용할 비밀번호"
                required
              />
              <p className="ant-sub" style={{ marginTop: 6 }}>
                참여자가 링크로 입장할 때 입력할 비밀번호입니다
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="ant-sub">참여자를 추가하세요. (나중에 추가 가능)</p>
            {contributors.map((c, idx) => (
              <div key={idx} className="ant-row">
                <input
                  className="ant-input"
                  placeholder="이름"
                  value={c.name}
                  onChange={(e) => {
                    const next = [...contributors];
                    next[idx] = { ...c, name: e.target.value };
                    setContributors(next);
                  }}
                />
                <input
                  className="ant-input"
                  placeholder="이메일 (선택)"
                  value={c.email}
                  onChange={(e) => {
                    const next = [...contributors];
                    next[idx] = { ...c, email: e.target.value };
                    setContributors(next);
                  }}
                />
              </div>
            ))}
            <button
              className="ant-btn"
              onClick={() =>
                setContributors([...contributors, { name: "", email: "" }])
              }
            >
              + 참여자 추가
            </button>
          </div>
        )}
      </div>

      {error && <p className="ant-error">{error}</p>}

      <div className="ant-row-between">
        <p className="ant-sub">{`${STEPS.length}단계 중 ${step + 1}단계`}</p>
        <div className="ant-row" style={{ gap: 8 }}>
          <button
            className="ant-btn ant-btn-ghost"
            onClick={() =>
              step === 0 ? navigate("/anthology") : setStep(step - 1)
            }
          >
            {step === 0 ? "취소" : "이전"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="ant-btn ant-btn-primary"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              다음 →
            </button>
          ) : (
            <button
              className="ant-btn ant-btn-primary"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "생성 중..." : "합동지 생성"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
