---
name: fe-figma-reference-skill
description: "[WHAT: Frontend 작업 시 Figma(SweetPress) 참조 강제 Skill] [WHEN: frontend/src/features/**, frontend/src/components/* 신규/수정 작업 시작 전 필수 호출] [KEYWORD: frontend, 프론트, React, feature, 컴포넌트, component, 페이지, page, UI, 디자인, design, Figma, 피그마, SweetPress, 레이아웃, layout]"
---

# Frontend Figma 참조 강제 Skill

> **핵심**: 모든 frontend 작업(features/**, components/*) 시작 전 반드시 호출. SweetPress Figma 파일을 디자인 소스로 고정하여 참조 누락/추측 구현 방지.

---

## 0. INVIOLABLE RULES

| # | 규칙 | 위반 시 |
|:-:|------|--------|
| 1 | 본 SKILL.md 전체 Read 필수 | **진입 무효** |
| 2 | frontend 작업(신규/수정) 시작 전 반드시 본 skill 호출. 미호출 = 작업 무효 | **작업 무효** |
| 3 | SweetPress Figma 파일(fileKey: `7WJrsI7QOEOrXFP1x4LtAH`) 외 다른 디자인 소스 가정 금지 (사용자가 다른 URL을 명시한 경우만 예외) | **작업 무효** |
| 4 | `figma:figma-use` 스킬 선행 호출 → `figma:figma-implement-design` 호출 순서 준수 | **작업 무효** |
| 5 | Figma 조회 결과(디자인 토큰/컴포넌트/레이아웃)를 구현에 반영. "참고만 했다"는 무효 | **작업 무효** |
| 6 | Figma 조회 실패 시 추측 구현 금지 → 사용자에게 확인 | **작업 무효** |
| 7 | 모달/다이얼로그가 필요하면 반드시 기존 공통 컴포넌트 [frontend/src/components/ui/Modal.jsx](frontend/src/components/ui/Modal.jsx) 사용. 신규 모달 컴포넌트 생성/인라인 다이얼로그/`window.alert`·`confirm` 대체 금지. props: `open`, `title`, `message`, `onClose`, `variant`('info'\|'error'\|'success'), `confirmText` | **작업 무효** |

---

## 1. 디자인 소스 (고정)

| 항목 | 값 |
|------|----|
| **파일명** | SweetPress |
| **fileKey** | `7WJrsI7QOEOrXFP1x4LtAH` |
| **URL** | https://www.figma.com/design/7WJrsI7QOEOrXFP1x4LtAH/SweetPress?node-id=0-1&m=dev |
| **선행 skill** | `figma:figma-use` (MANDATORY prerequisite) |
| **구현 skill** | `figma:figma-implement-design` |

> 사용자가 다른 Figma URL을 명시한 경우에만 해당 URL 사용. 그 외 모든 경우 위 파일 고정.

---

## 2. 수행 절차

| 순서 | 절차 | 설명 |
|:----:|------|------|
| 1 | **본 SKILL.md 전체 Read** | offset/limit 금지 |
| 2 | **대상 노드 식별** | 작업 요청에서 언급된 페이지/컴포넌트명 추출. 불명확하면 사용자에게 확인 |
| 3 | **`figma:figma-use` 선행 호출** | Figma MCP 사용 전 필수 선행 skill |
| 4 | **`figma:figma-implement-design` 호출** | fileKey + nodeId 전달. 해당 노드의 디자인 컨텍스트(코드/스크린샷/토큰) 조회 |
| 5 | **디자인 결과 반영 계획 수립** | 조회 결과의 색상/간격/컴포넌트/레이아웃을 실제 구현에 어떻게 매핑할지 명시 |
| 6 | **진입점 복귀** | 호출한 에이전트(fe-code-feature / fe-code-component)의 다음 절차로 복귀하여 구현 진행 |

---

## 3. 진입/통과 선언

### 3.1. 진입 선언
```
## fe-figma-reference-skill 진입
- 호출 출처: [fe-code-feature / fe-code-component / gate-03-execute-skill]
- 대상 노드: [페이지/컴포넌트명]
- 디자인 소스: SweetPress (fileKey: 7WJrsI7QOEOrXFP1x4LtAH)
```

### 3.2. 통과 선언
```
## fe-figma-reference-skill 통과
- figma:figma-use 호출: 완료
- figma:figma-implement-design 호출: 완료
- 조회된 디자인 요소: [색상/간격/컴포넌트/레이아웃 요약]
- 구현 반영 계획: [요약]
→ 호출 출처로 복귀하여 구현 진행
```

---

## 4. 체크리스트

- [ ] 본 SKILL.md 전체 Read
- [ ] 대상 노드 식별 완료 (불명확 시 사용자 확인)
- [ ] `figma:figma-use` 선행 호출 완료
- [ ] `figma:figma-implement-design` 호출 완료
- [ ] 조회 결과를 구현 계획에 반영
- [ ] SweetPress 외 다른 디자인 소스 가정 없음
- [ ] 진입/통과 선언 출력

---

## 5. 실패 처리

| 상황 | 처리 |
|------|------|
| Figma MCP 미사용 가능 | 사용자에게 보고 후 대체 방법(URL 직접 제공 요청) 확인. 추측 구현 금지 |
| 대상 노드 불명확 | 사용자에게 노드명/URL 재확인 |
| 조회 결과가 작업 요청과 불일치 | 사용자에게 보고 후 진행 여부 확인 |
