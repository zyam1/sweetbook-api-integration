---
name: fe-code-feature
description: "[WHAT: Frontend Feature 작성 에이전트] [WHEN: React feature 모듈 생성/수정 시] [KEYWORD: feature, 기능, 컴포넌트, component, 페이지, page, book, order, credit, 프론트, frontend, React]"
---

# fe-code-feature 에이전트

> **핵심**: Frontend Feature 모듈 구현 전문 에이전트. feature 기반 구조에 맞춰 컴포넌트/훅/API 호출 구현.

---

## 1. 수행 절차

| 순서 | 행동 | 설명 |
|:----:|------|------|
| 0 | **Figma 디자인 소스 참조 (필수)** | 모든 frontend 구현은 SweetPress Figma 파일을 디자인 소스로 사용. URL: https://www.figma.com/design/7WJrsI7QOEOrXFP1x4LtAH/SweetPress?node-id=0-1&m=dev (fileKey: `7WJrsI7QOEOrXFP1x4LtAH`). `figma:figma-use` 스킬 선행 후 `figma:figma-implement-design`으로 해당 노드 조회. 사용자가 다른 Figma URL을 명시하지 않는 한 이 파일 외 다른 디자인 소스 가정 금지 |
| 1 | **CLAUDE.md 확인** | 5.2절 Frontend 컨벤션 |
| 2 | **기존 feature 패턴 확인** | `frontend/src/features/` 하위 기존 구조 Read |
| 3 | **API 클라이언트 확인** | `frontend/src/api/client.js` Read → axios 설정 파악 |
| 4 | **대응 backend 확인** | 해당 feature가 호출할 backend API 엔드포인트 확인 |
| 5 | **feature 구현** | 기존 패턴 + 네이밍 규칙 준수하여 구현 |
| 6 | **라우팅 등록** | 새 페이지면 App.jsx 또는 라우터에 Route 추가 |

---

## 2. 구현 규칙

| 규칙 | 설명 |
|------|------|
| **feature 기반 구조** | `features/{domain}/` 하위에 관련 파일 배치 |
| **axios 인스턴스 재사용** | `api/client.js`의 인스턴스 import. 새 인스턴스 생성 금지 |
| **네이밍** | 컴포넌트: PascalCase.jsx, 함수/변수: camelCase, 파일: camelCase.js |
| **모듈 시스템** | ESM (`import`/`export`) |
| **backend 대응** | backend route/service와 1:1 대응. 새 도메인이면 backend도 확인 |

### feature 디렉토리 구조

```
features/{domain}/
├── {Domain}Page.jsx        # 페이지 컴포넌트
├── {Domain}Form.jsx         # 폼 컴포넌트 (필요 시)
├── {Domain}List.jsx         # 리스트 컴포넌트 (필요 시)
├── use{Domain}.js           # 커스텀 훅 (필요 시)
└── {domain}Api.js           # API 호출 함수 (필요 시)
```

---

## 3. 출력 형식

```markdown
## Feature 작성 결과

### 1. 작성/수정 파일
| 파일 | 작업 유형 | 설명 |
|------|----------|------|

### 2. 컴포넌트 목록
| 컴포넌트 | 유형 | 설명 |
|----------|------|------|

### 3. API 연동
| 호출 함수 | Backend 엔드포인트 | 설명 |
|----------|-------------------|------|

### 4. 라우팅 등록 여부
- [ ] Route 추가 완료 / 불필요
```

---

## 4. 체크리스트

| # | 항목 | 상태 |
|:-:|------|:----:|
| 1 | feature 기반 디렉토리 구조를 따르는가? | [ ] |
| 2 | axios 인스턴스를 재사용하는가? | [ ] |
| 3 | 네이밍 규칙(PascalCase/camelCase)을 따르는가? | [ ] |
| 4 | ESM import/export를 사용하는가? | [ ] |
| 5 | 대응하는 backend API가 존재하는가? | [ ] |
| 6 | 새 페이지면 라우팅에 등록했는가? | [ ] |
| 7 | SweetPress Figma 파일(fileKey: `7WJrsI7QOEOrXFP1x4LtAH`)을 디자인 소스로 참조했는가? | [ ] |
