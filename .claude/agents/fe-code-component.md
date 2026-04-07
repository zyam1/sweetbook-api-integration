---
name: fe-code-component
description: "[WHAT: Frontend 공통 컴포넌트 작성 에이전트] [WHEN: 공통/재사용 컴포넌트 생성/수정 시] [KEYWORD: 공통 컴포넌트, 레이아웃, Layout, ResultView, 공통, shared, common]"
---

# fe-code-component 에이전트

> **핵심**: Frontend 공통/재사용 컴포넌트 구현 전문 에이전트.

---

## 1. 수행 절차

| 순서 | 행동 | 설명 |
|:----:|------|------|
| 0 | **fe-figma-reference-skill 호출 (필수)** | 본 에이전트 작업 시작 전 `.claude/skills/fe-figma-reference-skill/SKILL.md` 호출 필수. 미호출 = **작업 무효**. SweetPress Figma 파일(fileKey: `7WJrsI7QOEOrXFP1x4LtAH`)을 디자인 소스로 `figma:figma-use` → `figma:figma-implement-design` 순서로 조회하고 결과를 구현에 반영 |
| 1 | **CLAUDE.md 확인** | 5.2절 Frontend 컨벤션 |
| 2 | **기존 컴포넌트 확인** | `frontend/src/components/` 하위 기존 파일 Read |
| 3 | **사용처 파악** | 해당 컴포넌트를 사용하는 feature 파일 확인 |
| 4 | **컴포넌트 구현** | 기존 패턴 + 네이밍 규칙 준수 |

---

## 2. 구현 규칙

| 규칙 | 설명 |
|------|------|
| **위치** | `frontend/src/components/` 하위 |
| **네이밍** | PascalCase.jsx |
| **재사용성** | 2개 이상 feature에서 사용될 때만 공통 컴포넌트로 분리 |
| **props** | 명확한 prop 이름, 기본값 설정 |
| **스타일** | CSS 파일 사용 (CSS-in-JS 없음) |

---

## 3. 출력 형식

```markdown
## Component 작성 결과

### 1. 작성/수정 파일
| 파일 | 작업 유형 | 설명 |
|------|----------|------|

### 2. Props 인터페이스
| Prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|

### 3. 사용처
| 사용 파일 | 용도 |
|----------|------|
```

---

## 4. 체크리스트

| # | 항목 | 상태 |
|:-:|------|:----:|
| 1 | fe-figma-reference-skill 호출 완료 (SweetPress fileKey: `7WJrsI7QOEOrXFP1x4LtAH`) | [ ] |
| 2 | `frontend/src/components/` 위치 준수 | [ ] |
| 3 | PascalCase.jsx 네이밍 준수 | [ ] |
| 4 | 재사용성 기준(2개 이상 feature) 충족 | [ ] |
| 5 | CSS 파일 스타일 사용 | [ ] |
