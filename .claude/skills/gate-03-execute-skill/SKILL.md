---
name: gate-03-execute-skill
description: "[WHAT: SweetBook 코드 작성/수정 실행 - 매핑표에 따라 서브에이전트 위임] [WHEN: Gate 2 승인 후 또는 Gate 1 빠른작업 선택 시] [KEYWORD: 작업 실행, 코드 작성, 수정, 구현, Gate 3, gate3, 실행]"
---

# Gate 3: 코드 작성/수정 실행

> **핵심**: 작업계획서(또는 Gate 1 빠른작업 분석 결과)대로 코드 작성. 5.2절 매핑표에 따라 서브에이전트에 위임. backend↔frontend 정합성 유지.

---

## 0. INVIOLABLE RULES

| # | 규칙 | 위반 시 |
|:-:|------|--------|
| 1 | 본 SKILL Read 필수 | **진입 무효** |
| 2 | 메인에이전트 직접 코드 작성 금지. 5.2절 매핑표에 따라 서브에이전트 위임 | **작업 무효** |
| 3 | API 키 하드코딩 금지. `.env` + `process.env` 사용 | **즉시 수정** |
| 4 | SDK 클라이언트 새 인스턴스 생성 금지. `services/sweetbook.js` import 사용 | **작업 무효** |
| 5 | axios 새 인스턴스 생성 금지. `api/client.js` 사용 | **작업 무효** |
| 6 | SweetBook API 호출 순서 1~10 위반 금지 | **작업 무효** |
| 7 | 범위 초과 리팩토링/주석 추가/기능 추가 금지 | **작업 무효** |
| 8 | 변경 파일에 `frontend/src/features/**` 또는 `frontend/src/components/*` 포함 시 **fe-figma-reference-skill** 선행 호출 필수 (fe-code-feature/fe-code-component 위임 전) | **작업 무효** |

---

## 1. 위임 매핑 (CLAUDE.md 5.2절)

| 파일 경로 패턴 | 키워드 | 위임 에이전트 |
|----------------|--------|---------------|
| `backend/routes/*.js` | route, 라우트, 엔드포인트 | **be-code-route** |
| `backend/services/*.js` | service, SDK, 비즈니스 로직 | **be-code-service** |
| `backend/middleware/*.js` | middleware, 에러 핸들러, 웹훅 검증 | **be-code-middleware** |
| `frontend/src/features/**` | feature, 페이지, book, order, credit | **fe-code-feature** |
| `frontend/src/components/*` | 공통 컴포넌트, Layout | **fe-code-component** |
| 분석/영향 추적 | 분석, 영향 범위 | **co-analysis** |

> **복합 작업**: backend → frontend 순. 새 도메인은 be-code-route + be-code-service + fe-code-feature 순차.

---

## 2. 수행 절차

| 순서 | 절차 |
|:----:|------|
| 1 | 본 SKILL Read |
| 2 | 작업계획서(또는 Gate 1 분석) 재확인 |
| 3 | 변경 파일별 위임 에이전트 매핑 |
| 4 | 위임 순서 결정 (backend 먼저 → frontend) |
| 4.5 | **frontend 작업 포함 시 fe-figma-reference-skill 선행 호출** (fe-code-feature/fe-code-component 위임 전 필수) |
| 5 | 서브에이전트에 작업 지시 (각 에이전트의 SKILL/규칙 준수) |
| 6 | 결과 통합 + backend↔frontend 정합성 확인 |
| 7 | 1차 자체 검토 (CLAUDE.md ## 2.1 품질 기준 5가지) |
| 8 | 통과 선언 → Gate 4 진입 |

---

## 3. 진입/통과 선언

### 3.1. 진입 선언
```
## Gate 3 진입
- 진입 시각: [YYYY-MM-DD HH:MM]
- 출처: [Gate 2 승인 / Gate 1 빠른작업]
- 위임 매핑: [파일 → 에이전트 목록]
- 위임 순서: [backend → frontend]
```

### 3.2. 통과 선언
```
## Gate 3 통과
- 작성/수정 파일: backend [목록], frontend [목록]
- backend↔frontend 정합성: [확인 결과]
- 1차 검토(품질 기준 5가지): 합격
→ Gate 4 진입 → Skill 호출: gate-04-verify-complete-skill
```

---

## 4. 체크리스트

- [ ] 본 SKILL Read
- [ ] 변경 파일별 위임 에이전트 매핑
- [ ] 메인 직접 작성 없이 서브에이전트 위임 완료
- [ ] API 키 하드코딩 없음
- [ ] SDK/axios 새 인스턴스 생성 없음
- [ ] SweetBook API 호출 순서 준수
- [ ] backend↔frontend 정합성 확인
- [ ] 1차 검토(품질 기준 5가지) 합격
- [ ] 통과 선언 출력
