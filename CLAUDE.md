# CLAUDE.md — SweetBook API Integration

> 이 문서의 모든 규칙은 예외 없이 적용된다. 모든 대화/주석은 한글로 작성(기술 용어 제외).

---

## 1. 프로젝트 개요

SweetBook API를 사용하여 포토북 생성 및 주문 흐름을 처리하는 풀스택 프로젝트.

| 구분 | 기술 스택 | 진입점 | 포트 |
|------|----------|--------|:----:|
| **Backend** | Express 5 + bookprintapi-nodejs-sdk + dotenv | `backend/index.js` | 4000 |
| **Frontend** | React 19 + Vite + react-router-dom + axios | `frontend/src/main.jsx` | 5173 |

### 1.1. 실행 명령어

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

### 1.2. 프로젝트 구조

```
sweetbook-api-integration/
├── backend/
│   ├── index.js              # Express 서버 진입점
│   ├── routes/               # 라우트 레이어 (books, orders, credits)
│   ├── services/             # 비즈니스 로직 + SDK 호출
│   │   ├── sweetbook.js      # SDK 클라이언트 초기화
│   │   ├── bookService.js    # 책 생성/조회/사진업로드/표지/내지/최종화
│   │   ├── orderService.js   # 견적/주문
│   │   └── creditService.js  # 크레딧 잔액 조회
│   └── middleware/           # 에러 핸들러
├── frontend/
│   └── src/
│       ├── main.jsx          # React 앱 진입점
│       ├── api/client.js     # axios 인스턴스
│       ├── features/         # 기능별 모듈 (book, credit, order)
│       └── components/       # 공통 컴포넌트
└── .claude/                  # SweetBook API 공식 문서 정리
    ├── INDEX.md              # 중앙 인덱스 (문서 맵)
    ├── rules/                # 구현 규칙 (00-workflow ~ 07-production)
    ├── api/                  # API 레퍼런스 (00-common ~ 06-errors)
    └── guide/                # 실전 가이드 (크레딧/주문상태/웹훅이벤트)
```

---

## 2. 핵심 원칙

### 2.1. 사전 파악 의무

| 의무 | 규칙 | 위반 시 |
|------|------|--------|
| **문서 숙지** | 작업 전 `.claude/` 하위의 관련 규칙 문서를 반드시 Read. "이미 읽었다/컨텍스트에 있다" 불인정 | 작업 무효 |
| **전체 파악** | 수정 대상 파일뿐 아니라 연관된 routes/services/features를 함께 파악한 후 작업 | 작업 무효 |
| **API 순서 준수** | SweetBook API 호출 순서를 반드시 지킴 (2.3절 참조) | 작업 무효 |

### 2.2. 행동 규칙

**DO**
- 코드 수정 전 해당 파일을 반드시 Read
- 기존 코드의 패턴/컨벤션을 따라 작성
- backend 변경 시 대응하는 frontend 영향도 확인 (역방향도 동일)
- `.claude/api_reference/` 문서를 참고하여 정확한 API 엔드포인트/파라미터 사용

**DON'T**
- 추측 기반 API 파라미터 사용 금지 — 문서 확인 필수
- finalization 이전에 주문 로직 구현 금지
- .env 파일을 커밋하거나 API 키를 코드에 하드코딩 금지
- 요청 범위 밖의 리팩토링/기능추가 금지

### 2.3. SweetBook API 호출 순서 (필수)

```
1. GET /book-specs          → 판형 목록 조회
2. GET /templates           → 템플릿 목록 조회
3. POST /books              → 책 생성 (draft)
4. POST /books/{id}/photos  → 사진 업로드
5. POST /books/{id}/cover   → 표지 설정
6. POST /books/{id}/contents → 내지 추가 (반복)
7. POST /books/{id}/finalization → 최종화
8. POST /orders/estimate    → 견적 조회
9. POST /orders             → 주문 생성
10. Webhook                 → 주문 상태 수신
```

> **순서를 건너뛸 수 없음.** finalization 없이 주문 불가. estimate 없이 주문 불가.

---

## 3. 작업 워크플로우 (Gate)

> Smaple_Web의 Gate 시스템을 이 프로젝트 규모에 맞게 간소화.

### 3.1. 요청 분류

| 유형 | 정의 | 처리 |
|------|------|------|
| **정보성 질문** | Read/검색만으로 답변 가능, 파일 수정 불필요 | 직접 답변 (Gate 불필요) |
| **작업 요청** | 파일 수정/생성 필요 | Gate 진입 필수 |

### 3.2. Gate 흐름

| Gate | 역할 | 필수 행동 |
|:----:|------|----------|
| **1. 분석** | 요청 파악 + 영향 범위 분석 | 관련 `.claude/` 문서 Read + 대상 파일 Read + 영향 범위 파악 |
| **2. 계획** | 작업 계획 수립 + 사용자 승인 | 변경 파일 목록 + 구현 방법 제시 → 사용자 명시적 승인 후 진행 |
| **3. 실행** | 코드 작성/수정 | 계획대로 구현 + backend↔frontend 정합성 확인 |
| **4. 검증** | 결과 확인 | 변경 사항 요약 + 테스트 방법 안내 |

**간소화 조건**: 단일 파일 수정, 명확한 버그 수정 등 단순 작업은 Gate 2(계획) 생략 가능. 단, Gate 1(분석)과 Gate 4(검증)는 생략 불가.

### 3.3. 승인 규칙

| 원칙 | 설명 |
|------|------|
| **명시적 승인만 인정** | "좋아/OK/응" = 승인 아님. "진행해주세요", "1번", "승인" 등 명시적 표현만 인정 |
| **새 요청 = Gate 1 재시작** | "~해줘", "추가로~" 등 새 작업 요청 시 Gate 1부터 재시작 |

---

## 4. 코드 컨벤션

### 4.1. Backend (Node.js/Express)

| 항목 | 규칙 |
|------|------|
| **아키텍처** | Routes → Services 2-레이어. Route는 요청/응답만, 비즈니스 로직은 Service에 |
| **SDK 사용** | `services/sweetbook.js`의 초기화된 클라이언트를 import하여 사용 |
| **에러 처리** | `next(err)`로 중앙 에러 핸들러에 위임 |
| **라우트 경로** | `/api/` 접두사 (index.js에서 마운트) |
| **환경 변수** | `.env` 파일 사용, `process.env`로 접근 |

### 4.2. Frontend (React/Vite)

| 항목 | 규칙 |
|------|------|
| **아키텍처** | feature 기반 구조 — `features/{domain}/` 하위에 컴포넌트/훅 배치 |
| **API 호출** | `api/client.js`의 axios 인스턴스 사용 |
| **라우팅** | react-router-dom 사용 |
| **스타일** | CSS 파일 사용 (별도 CSS-in-JS 없음) |

### 4.3. 공통

| 항목 | 규칙 |
|------|------|
| **언어** | JavaScript (CommonJS: backend, ESM: frontend) |
| **네이밍** | 파일: camelCase.js, 컴포넌트: PascalCase.jsx |
| **backend↔frontend 대응** | backend의 route/service와 frontend의 feature가 1:1 대응 (book, order, credit) |
| **Git** | 커밋 메시지: `[영역] 작업내용` (예: `[backend] 책 생성 API 연결`) |

---

## 5. 참조 문서 맵

> 문서 전체 인덱스: `.claude/INDEX.md`

작업 시 해당 단계의 문서를 반드시 참조:

| 작업 단계 | rules/ | api/ | guide/ |
|----------|--------|------|--------|
| **전체 흐름** | `00-workflow.md` | `00-common.md` | — |
| 판형 선택 | `01-book-spec.md` | `01-book-specs.md` | — |
| 템플릿 선택 | `02-template.md` | `02-templates.md` | — |
| 책 생성 | `03-book-creation.md` | — | — |
| 사진 업로드 | `04-image-upload.md` | — | — |
| 주문 | `05-order.md` | `03-orders.md` | `order-status-flow.md` |
| 크레딧 | `05-order.md` | `04-credits.md` | `credits-management.md` |
| 웹훅 | `06-webhook.md` | `05-webhooks.md` | `webhook-events.md` |
| 운영 전환 | `07-production.md` | — | — |
| 에러 처리 | — | `06-errors.md` | — |
