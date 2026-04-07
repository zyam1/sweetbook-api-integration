# SweetPress 작업 계획서

> **프로젝트**: SweetBook API를 활용한 동인지/합동지 소량 인쇄 제작 플랫폼
> **목적**: 입사 과제 — AI 활용 능력 + SweetBook API 통합 결과물
> **작성일**: 2026-04-06

---

## 1. 프로젝트 개요

### 1.1. 컨셉

**SweetPress** — 서브컬쳐 창작자(동인 작가, 일러스트레이터, 합동지 주최자)를 위한 소량 포토북/도서 인쇄 플랫폼.

기존 인쇄소의 진입장벽(견적 문의, 입고 규격, 재단선 직접 그리기 등)을 AI로 해소하고, SweetBook API를 활용해 **업로드 → 자동 검수 → 즉시 주문**까지의 흐름을 한 화면에서 처리한다.

### 1.2. 타겟 사용자

| 사용자 | 사용 시나리오 |
|--------|--------------|
| **개인 작가** | 일러스트 모음집/단편 만화집을 5~20부 소량 제작 |
| **합동지 주최자** | 여러 참가자의 원고를 모아 한 권으로 제작 (anthology) |
| **굿즈 판매자** | 행사용 카탈로그/포트폴리오북 제작 |

### 1.3. 차별화 포인트

> "동인 인쇄소는 진입장벽이 높다." 이 문제를 AI로 해소하는 것이 핵심.

| 일반 포토북 서비스 | SweetPress |
|-------------------|-----------|
| 템플릿 기반 사진 배치 | 원고 PDF/이미지 그대로 업로드 |
| 재단선 사용자가 확인 | **AI 재단/안전 영역 자동 검수** |
| DPI 안내문만 제공 | **DPI 자동 측정 + 경고** |
| 단일 부수 가격 | **부수별 단가 시뮬레이터** |
| 페이지 부족/초과 시 에러 | **자동 백지 삽입/제안** |

---

## 2. 과제 요구사항 매핑

| 요구사항 | 충족 방법 |
|---------|----------|
| Books API 사용 | `bookService.js` — book-specs/templates/books/photos/cover/contents/finalization |
| Orders API 사용 | `orderService.js` — estimate/orders/cancel |
| Frontend UI | React 19 + Vite, 4단계 위저드 |
| Backend API 키 관리 | `.env` + `services/sweetbook.js` 싱글톤 |
| 더미 데이터 제공 | `backend/fixtures/` — 샘플 이미지 + 메타데이터 |
| 로컬 실행 가능 | `npm start` (backend), `npm run dev` (frontend) |
| `.env.example` 제공 | 루트에 배치 |
| 공개 GitHub | develop → main 머지 후 공개 |

---

## 3. 핵심 기능 정의

### 3.1. 필수 기능 (과제 요구)

| # | 기능 | Backend | Frontend |
|:-:|------|---------|----------|
| 1 | 판형 선택 | `GET /api/book-specs` | `BookSpecPage` |
| 2 | 템플릿 선택 | `GET /api/templates` | `TemplatePage` |
| 3 | 책 생성 | `POST /api/books` | `BookCreatePage` |
| 4 | 사진 업로드 | `POST /api/books/:id/photos` | `UploadStep` |
| 5 | 표지 설정 | `POST /api/books/:id/cover` | `CoverEditor` |
| 6 | 내지 추가 | `POST /api/books/:id/contents` | `ContentEditor` |
| 7 | 최종화 | `POST /api/books/:id/finalization` | `FinalizeButton` |
| 8 | 견적 조회 | `POST /api/orders/estimate` | `EstimateView` |
| 9 | 주문 생성 | `POST /api/orders` | `OrderForm` |
| 10 | 크레딧 조회 | `GET /api/credits` | `CreditBadge` |

### 3.2. 차별화 기능 (AI 활용 어필)

| # | 기능 | 설명 | 구현 위치 |
|:-:|------|------|----------|
| **F1** | **DPI 자동 검수** | 업로드 이미지의 해상도를 BookSpec의 mm 사이즈와 대조해 300dpi 미달 시 경고 | `services/inspectService.js` |
| **F2** | **재단선/안전 영역 미리보기** | 업로드 이미지 위에 bleed(3mm) + safe(5mm) 가이드 오버레이. 안전 영역 밖 콘텐츠 감지 | `features/inspect/BleedPreview.jsx` |
| **F3** | **부수별 단가 시뮬레이터** | `priceBase + ((pageCount - pageMin) / pageIncrement) × pricePerIncrement` 공식으로 1/5/10/20/50부 단가 표 자동 계산 | `features/order/PriceSimulator.jsx` |
| **F4** | **페이지 자동 맞춤** | `pageCount`가 `pageIncrement`에 맞지 않으면 백지 자동 삽입 제안 | `services/bookService.js` (autoFitPages) |
| **F5** | **합동지 대시보드** | 여러 기여자의 원고를 한 책에 합치는 모드. externalRef로 기여자 ID 추적 | `features/anthology/` |

> **F1~F4는 필수 차별화**, **F5는 확장 방향**으로 README에 명시.

---

## 4. Phase 분리

### Phase 1 — Backend API 완성

> **목표**: SweetBook API 10단계 호출 모두 backend에 노출.
> **에이전트**: `be-code-service` + `be-code-route`

| # | 작업 | 파일 | 비고 |
|:-:|------|------|------|
| 1.1 | book-specs 서비스 | `services/bookService.js` (listBookSpecs, getBookSpec) | 캐싱 권장 |
| 1.2 | templates 서비스 | `services/templateService.js` (신규) | bookSpecUid 필터 |
| 1.3 | photos 업로드 | `services/bookService.js` (uploadPhotos) | multipart |
| 1.4 | cover 설정 | `services/bookService.js` (setCover) | templateUid + parameters |
| 1.5 | contents 추가 | `services/bookService.js` (addContent) | 반복 호출 |
| 1.6 | 라우트 확장 | `routes/books.js` | 위 5개 엔드포인트 등록 |
| 1.7 | templates 라우트 | `routes/templates.js` (신규) | `index.js` 마운트 |
| 1.8 | book-specs 라우트 | `routes/bookSpecs.js` (신규) | `index.js` 마운트 |
| 1.9 | Idempotency-Key 미들웨어 | `middleware/idempotency.js` | POST /books, /orders |
| 1.10 | 에러 핸들러 강화 | `middleware/errorHandler.js` | 402, 422 처리 |

**참조 문서**: `.claude/rules/03-book-creation.md`, `04-image-upload.md`, `05-order.md`

---

### Phase 2 — Frontend 4단계 위저드

> **목표**: 사용자가 한 흐름으로 책을 만들 수 있는 UI.
> **에이전트**: `fe-code-feature` + `fe-code-component`

| Step | 화면 | 주요 컴포넌트 | API |
|:----:|------|--------------|-----|
| 1 | **판형 선택** | `BookSpecGrid` | `GET /api/book-specs` |
| 2 | **업로드 + 검수** | `UploadDropzone`, `InspectReport` | `POST /api/books`, `POST /photos` |
| 3 | **편집** | `CoverEditor`, `ContentList`, `BleedPreview` | `POST /cover`, `POST /contents` |
| 4 | **주문** | `PriceSimulator`, `EstimateView`, `OrderForm` | `POST /estimate`, `POST /orders` |

**라우팅**:
- `/wizard` — 4단계 위저드 진입점
- `/wizard/spec` → `/wizard/upload` → `/wizard/edit` → `/wizard/order`
- `/orders/:orderUid` — 주문 상태 추적

**상태 관리**: React Context (`WizardContext`) — `bookUid`, `currentStep`, `inspectResult`

---

### Phase 3 — 차별화 기능 (F1~F4)

> **목표**: 입사 과제 차별점 확보. **AI 활용 어필 핵심.**

#### 3.1. F1 — DPI 자동 검수

| 항목 | 내용 |
|------|------|
| **위치** | `backend/services/inspectService.js` |
| **로직** | 업로드 시 이미지 width/height(px) 추출 → BookSpec의 innerTrimWidthMm/HeightMm와 대조 → `actualDpi = px / (mm / 25.4)` |
| **반환** | `{ pass: boolean, actualDpi, requiredDpi: 300, recommendation }` |
| **라이브러리** | `sharp` (메타데이터 추출) |

#### 3.2. F2 — 재단선/안전 영역 미리보기

| 항목 | 내용 |
|------|------|
| **위치** | `frontend/src/features/inspect/BleedPreview.jsx` |
| **로직** | Canvas API로 업로드 이미지 렌더 + bleed(3mm 빨강선) + safe(5mm 파랑선) 오버레이 |
| **검출** | 안전 영역 밖에 비배경 픽셀이 일정 비율 이상이면 경고 |

#### 3.3. F3 — 부수별 단가 시뮬레이터

| 항목 | 내용 |
|------|------|
| **위치** | `frontend/src/features/order/PriceSimulator.jsx` |
| **로직** | `priceBase + ((pageCount - pageMin) / pageIncrement) × pricePerIncrement` 공식으로 1/5/10/20/50부 표 자동 생성 |
| **데이터 소스** | BookSpec 응답 |

#### 3.4. F4 — 페이지 자동 맞춤

| 항목 | 내용 |
|------|------|
| **위치** | `backend/services/bookService.js` (autoFitPages) |
| **로직** | `pageCount % pageIncrement !== 0`이면 부족분만큼 백지 contents 추가 제안 |
| **트리거** | finalization 직전 |

---

### Phase 4 — 주문/결제 + 상태 추적

> **목표**: 주문 흐름 + 웹훅 수신 + 상태 표시.
> **에이전트**: `be-code-route`, `be-code-middleware`, `fe-code-feature`

| # | 작업 | 파일 |
|:-:|------|------|
| 4.1 | 견적 → 크레딧 검증 → 주문 흐름 | `routes/orders.js` |
| 4.2 | 웹훅 수신 + HMAC 검증 | `routes/webhooks.js` (신규), `middleware/webhookVerify.js` |
| 4.3 | 주문 상태 페이지 | `features/order/OrderStatusPage.jsx` |
| 4.4 | 폴링 fallback | `useOrderStatus.js` (5초 간격) |

**참조 문서**: `.claude/rules/06-webhook.md`, `.claude/guide/order-status-flow.md`, `webhook-events.md`

---

### Phase 5 — 합동지 모드 (확장)

> **목표**: README에 "확장 방향"으로 기재. 시간 남으면 구현.

| 기능 | 설명 |
|------|------|
| 기여자 등록 | 이름 + 페이지 수 입력 |
| 자동 페이지 분배 | 기여자별 contents 묶음으로 추가 |
| externalRef 추적 | `anthology:{slug}:{contributorId}` |

---

### Phase 6 — 마무리 (더미 + README + 제출)

| # | 작업 | 산출물 |
|:-:|------|--------|
| 6.1 | 더미 데이터 | `backend/fixtures/sample-images/`, `fixtures/sample-book.json` |
| 6.2 | `.env.example` | API 키, BASE_URL, WEBHOOK_SECRET 키 명세 |
| 6.3 | README.md | 실행 방법 + 기능 소개 + AI 활용 포인트 + 확장 방향 |
| 6.4 | 시연 시나리오 | 5분 데모 흐름 (판형선택→업로드→검수→주문) |
| 6.5 | GitHub 공개 | develop → main 머지, public 전환 |

---

## 5. 기술 설계

### 5.1. Backend 추가 디렉토리

```
backend/
├── routes/
│   ├── books.js          (확장)
│   ├── orders.js          (확장)
│   ├── credits.js
│   ├── bookSpecs.js       (신규)
│   ├── templates.js       (신규)
│   └── webhooks.js        (신규)
├── services/
│   ├── sweetbook.js
│   ├── bookService.js     (확장: photos/cover/contents/autoFit)
│   ├── orderService.js
│   ├── creditService.js
│   ├── templateService.js (신규)
│   └── inspectService.js  (신규: DPI 검수)
├── middleware/
│   ├── errorHandler.js    (확장)
│   ├── idempotency.js     (신규)
│   └── webhookVerify.js   (신규)
└── fixtures/              (신규: 더미 데이터)
```

### 5.2. Frontend 추가 디렉토리

```
frontend/src/
├── features/
│   ├── book/              (기존)
│   ├── order/             (기존, PriceSimulator 추가)
│   ├── credit/            (기존)
│   ├── wizard/            (신규: 4단계 위저드)
│   │   ├── WizardContext.jsx
│   │   ├── WizardLayout.jsx
│   │   ├── SpecStep.jsx
│   │   ├── UploadStep.jsx
│   │   ├── EditStep.jsx
│   │   └── OrderStep.jsx
│   ├── inspect/           (신규: 검수)
│   │   ├── BleedPreview.jsx
│   │   └── InspectReport.jsx
│   └── anthology/         (Phase 5)
└── components/
    ├── Layout.jsx
    └── ResultView.jsx
```

### 5.3. 환경 변수 (`.env.example`)

```
SWEETBOOK_API_KEY=sandbox_sk_xxxx
SWEETBOOK_API_BASE_URL=https://api-sandbox.sweetbook.com/v1
SWEETBOOK_WEBHOOK_SECRET=whsec_xxxx
PORT=4000
```

---

## 6. 작업 순서 (실행 우선순위)

| 우선순위 | Phase | 의존성 | 예상 산출 |
|:--------:|-------|--------|----------|
| 1 | Phase 1 (Backend API 완성) | — | 10개 엔드포인트 동작 |
| 2 | Phase 2 (4단계 위저드) | Phase 1 | 사용자가 책 만들 수 있음 |
| 3 | Phase 3.3 (F3 시뮬레이터) | Phase 1 | 가격 표시 |
| 4 | Phase 3.1 (F1 DPI) | Phase 1 | 검수 결과 표시 |
| 5 | Phase 4 (주문/웹훅) | Phase 2 | 주문 가능 |
| 6 | Phase 3.2 (F2 미리보기) | Phase 2 | 시각 검수 |
| 7 | Phase 3.4 (F4 자동맞춤) | Phase 1 | 최종화 안정 |
| 8 | Phase 6 (더미/README) | 전체 | 제출 준비 |
| 9 | Phase 5 (합동지 모드) | 시간 여유 시 | 확장 데모 |

---

## 7. 리스크 + 대응

| 리스크 | 대응 |
|--------|------|
| Sandbox 가격이 실제와 달라 시뮬레이터 신뢰도 의문 | README에 "Sandbox 기준" 명시 |
| HEIC 변환 시 메타데이터 손실로 DPI 측정 실패 | 변환 후 재측정, 또는 원본 측정 |
| 웹훅 로컬 수신 불가 | ngrok 안내 + 폴링 fallback 기본 활성화 |
| 페이지 자동 맞춤이 사용자 의도와 충돌 | 자동 적용 X, 제안 → 승인 방식 |

---

## 8. AI 활용 어필 포인트 (README 반영)

| 포인트 | 어필 내용 |
|--------|----------|
| **문서 기반 코딩** | `.claude/` 8개 룰 + 7개 API 레퍼런스 + 3개 가이드를 사전 정리해 Claude Code가 추측 없이 구현 |
| **Gate 워크플로우** | 분석→계획→실행→검증 4단계로 작업 안정성 확보 |
| **에이전트 분리** | 8개 전문 에이전트(route/service/middleware/feature/component/analysis/review/git)로 작업 위임 |
| **AI 검수 기능** | DPI/재단선/페이지 검수를 AI가 자동 수행해 사용자 진입장벽 해소 |

---

---

## 9. 전략 갱신 (2026-04-07)

> 인증 도입 + 메인 페이지 실데이터화 + 합동지 본기능 승격으로 방향 전환.
> 아래 내용이 **현재 진행 기준**이며, Section 1~8의 일부 항목은 [LEGACY] 처리.

### 9.1. 레거시 정리

**제거 대상** (다음 작업 시 삭제):
- `frontend/src/features/book/` (기존 BookSpec/Book 단건 페이지)
- `frontend/src/features/bookSpec/`
- `frontend/src/features/credit/`
- `frontend/src/features/order/` (기존 단순 주문 폼)
- `frontend/src/features/template/`
- `frontend/src/features/wizard/` (기존 4단계 — 9.3에서 재설계)
- `frontend/src/components/ResultView.jsx`

**유지 대상**:
- `frontend/src/features/main/` (MainPage)
- `frontend/src/features/auth/` (LoginPage, SignUpPage, storage, api)
- `frontend/src/components/Layout.jsx`, `components/ui/*`, `components/ui/Modal`

### 9.2. 신규 페이지 목록

| 경로 | 페이지 | 인증 | 설명 |
|------|--------|:----:|------|
| `/` | MainPage | 선택 | 로그인 시 내 데이터, 비로그인 시 빈 상태 + CTA |
| `/login`, `/signup` | Auth | X | 기존 |
| `/wizard` | 새 책 만들기 | O | F1~F4 검수 통합 위저드 (재설계) |
| `/projects` | MyProjects | O | 내 프로젝트 목록 (드래프트/완료) |
| `/projects/:id/edit` | BookEdit | O | 단권 편집 (표지/내지/검수 결과) |
| `/orders` | MyOrders | O | 내 주문 목록 |
| `/orders/:id` | OrderDetail | O | 주문 상세 + 상태 추적 |
| `/account` | Account | O | 계정 설정, 합동지 기여 이력 |
| `/anthology` | Anthology 목록 | O | 내가 주최한 합동지 목록 |
| `/anthology/new` | Anthology 생성 | O | 판형/페이지/마감일 |
| `/anthology/:id` | Anthology 상세 | O | 대시보드 (기여자별 제출 현황) |
| `/anthology/:id/contributors` | 기여자 관리 | O | 기여자 추가/토큰·비번 발급 |
| `/anthology/:id/submit/:token` | 기여자 제출 | **공개** | 토큰 + 비밀번호로 접근, 회원가입 불필요 |

#### 9.2.1. MainPage 섹션 명세 (Figma "🏠 Main Page (Landing)" 기준)

| 블록 | 구성 요소 | 데이터 소스 |
|------|----------|------------|
| **Header** | 로고(SweetPress) / Nav(`새 책 만들기`·`내 작업`·`주문 내역`·`가이드`·`합동지`) / **CreditBadge (상시 노출)** / 아바타 | `GET /api/credits`, 인증 컨텍스트 |
| **Hero** | 타이틀 + 검색 입력(`책 이름이나 판형 입력`) + `새 책 만들기` CTA + **이어서 작업하기 카드** (마지막 편집 책 제목/판형/페이지/진행률 바) | `GET /api/projects/last-edited` (9.4.3 신규) |
| **Section / Specs** | 판형 카드 그리드 (4종 기본 노출) + 필터 pill(`전체`·`하드커버`·`소프트커버`·`정사각`·`A판`) | `GET /api/book-specs` (캐싱 권장, `.claude/rules/01-book-spec.md` 캐싱 전략 절 참조) |
| **Section / Workspace** | 좌 `내 작업` (편집 중/검수 대기/견적 확인 뱃지) + 우 `최근 주문` (`#SP-XXXX` + 배송중/제작중/완료 뱃지) | `GET /api/projects?userId=me`, `GET /api/orders?userId=me&limit=N` |
| **Section / Anthology** | 좌 `내가 주최한 합동지` (제출률 `7/12`, D-day) + 우 `참여 중인 합동지` (@핸들, 평균 dpi) | `GET /api/anthology?role=owner`, `GET /api/anthology?role=contributor` |
| **Footer** | `가이드`·`API`·`이용약관`·`문의` | 정적 |

**비로그인 정책** — 메인 페이지(`/`)는 비로그인도 접근 가능. 섹션별 가시성 분기:

| 섹션 | 비로그인 | 로그인 |
|------|:-------:|:------:|
| Header — Nav | ✅ | ✅ |
| Header — CreditBadge | ❌ (숨김) | ✅ |
| Header — 우측 영역 | `로그인` 버튼 | 아바타 |
| Hero — 타이틀/검색/`새 책 만들기` CTA | ✅ | ✅ |
| Hero — 이어서 작업하기 카드 | ❌ (숨김) | ✅ |
| Section / Specs (판형) | ✅ | ✅ |
| Section / Workspace (내 작업·최근 주문) | ❌ (전체 숨김) | ✅ |
| Section / Anthology (내가 주최·참여) | **빈 상태 카드** (로그인 사용자가 합동지 0건일 때 보는 것과 동일 컴포넌트 재사용) | ✅ |
| Footer | ✅ | ✅ |

- 비로그인 상태에서 `새 책 만들기` CTA 클릭 → `/login`으로 리다이렉트
- Anthology 빈 상태는 별도 디자인 만들지 않고 로그인 사용자의 빈 상태와 동일 컴포넌트 재사용

### 9.3. 차별화 기능 보강

#### F1 — DPI 자동 검수 (페이지별 위험도)

기존 `{ pass, actualDpi }` 단일 응답 → **페이지별 배열로 확장**:

```js
{
  bookId: 123,
  summary: { ok: 40, warn: 5, danger: 2, avgDpi: 312, minDpi: 140 },
  pages: [
    { pageNo: 1, fileName: 'p001.jpg', actualDpi: 320, level: 'ok' },
    { pageNo: 2, fileName: 'p002.jpg', actualDpi: 220, level: 'warn' },
    { pageNo: 3, fileName: 'p003.jpg', actualDpi: 140, level: 'danger' }
  ]
}
```

> `avgDpi`/`minDpi`는 합동지 대시보드 "참여 중인 합동지" 카드("평균 312dpi" 표시)에서 사용된다.

- `level`: `ok` (≥300) / `warn` (200~299) / `danger` (<200)
- UI: BookEdit 페이지 그리드에 색상 뱃지 (녹/황/적), 위험 페이지 우선 표시 + 필터

#### F4 — 페이지 자동 맞춤 (경고 + 승인)

자동 삽입 금지. 다음 흐름:

1. finalization 호출 직전 backend가 부족분 계산
2. 부족하면 frontend에 `{ needFill: 2, suggested: 'blank' }` 응답
3. 프론트가 모달 표시: "페이지 수가 N장 부족합니다. 빈 페이지를 추가하시겠습니까?"
4. 사용자 승인 시 contents 추가 → finalization 재호출
5. BookEdit 상단에 **영구 경고 배너**: "현재 N페이지, 최소 M페이지 필요"

#### F5 — 합동지 (본기능 승격)

기존 "확장 방향" → **본기능**으로 승격. 별도 도메인으로 구현.

**대시보드 표시 항목** (기여자별):
- 이름 / 할당 페이지 수
- 제출 여부 (미제출/제출/검수실패)
- 마지막 제출 시각
- 평균 DPI / 최저 DPI / DPI 등급 (ok/warn/danger)
- 안전영역 통과 여부
- 수동 액션: 비밀번호 재발급, 토큰 재발급, 강제 제거

### 9.4. DB 스키마 변경

#### 9.4.1. 기존 모델 보강 (가장 큰 누락)

```prisma
model Project {
  // ... 기존 필드
  userId       Int       // 신규 FK
  user         User      @relation(fields: [userId], references: [id])
  lastEditedAt DateTime  @updatedAt   // 신규: Hero "이어서 작업하기" 카드 정렬용
}

model Order {
  // ... 기존 필드
  userId Int       // 신규 FK
  user   User @relation(fields: [userId], references: [id])
}
```

> `lastEditedAt`은 `@updatedAt`으로 자동 갱신되지만, Phase B 구현 시 의도치 않은 갱신을 방지하기 위해 명시적 업데이트(편집 액션 시점만 갱신) 방식으로 재검토 가능.

#### 9.4.3. 신규 backend 엔드포인트 (MainPage Hero 전용)

| 메서드 | 경로 | 설명 | 응답 |
|--------|------|------|------|
| `GET` | `/api/projects/last-edited` | 인증된 사용자의 가장 최근 편집 프로젝트 1건 조회 | `{ id, title, bookSpecUid, pageCount, pageMax, currentStep, totalSteps, lastEditedAt }` |

- 정렬: `lastEditedAt DESC`, `LIMIT 1`
- 데이터 없으면 `204 No Content`
- SweetBook API 미호출 (내부 DB만 조회)

#### 9.4.2. 합동지 신규 모델

```prisma
model Anthology {
  id          Int       @id @default(autoincrement())
  ownerId     Int
  owner       User      @relation(fields: [ownerId], references: [id])
  title       String
  deadline    DateTime?
  bookSpecUid String
  pageMin     Int
  pageMax     Int
  status      String    @default("OPEN")  // OPEN | CLOSED | FINALIZED
  contributors Contributor[]
  createdAt   DateTime  @default(now())
}

model Contributor {
  id                 Int       @id @default(autoincrement())
  anthologyId        Int
  anthology          Anthology @relation(fields: [anthologyId], references: [id])
  userId             Int?      // 회원이면 매핑, 비회원이면 null
  name               String
  assignedPages      Int
  inviteToken        String    @unique  // URL 식별자
  accessPasswordHash String    // bcrypt 해시
  status             String    @default("PENDING")  // PENDING | SUBMITTED | REJECTED
  lastSubmittedAt    DateTime?
  submissions        ContributorSubmission[]
  createdAt          DateTime  @default(now())
}

model ContributorSubmission {
  id            Int       @id @default(autoincrement())
  contributorId Int
  contributor   Contributor @relation(fields: [contributorId], references: [id])
  fileName      String
  pageCount     Int
  avgDpi        Int
  minDpi        Int
  dpiLevel      String    // ok | warn | danger
  bleedSafe     Boolean
  uploadedAt    DateTime  @default(now())
}
```

### 9.5. 합동지 기여자 인증 흐름

회원/비회원 모두 접근 가능한 **링크 + 비밀번호 방식** (전화번호 X, 회원가입 X):

1. 주최자가 `/anthology/:id/contributors`에서 기여자 추가
   - backend가 `inviteToken` (랜덤 32자) 생성 + `accessPassword` 자동 생성 (8자) → bcrypt 해시 저장
   - 평문 비밀번호는 1회만 화면에 표시 (주최자가 직접 전달)
2. 기여자는 `/anthology/:id/submit/:token`에 접속
   - 페이지에서 비밀번호 입력 폼
   - backend `POST /api/anthology/:id/submit/:token/auth` → bcrypt 검증 → 단기 JWT 발급 (1h)
3. JWT로 원고 업로드 + 검수 결과 확인
4. 주최자는 언제든 토큰/비밀번호 재발급 가능

**보안 규칙**:
- 토큰 검증 엔드포인트에 rate limit (IP당 분당 5회)
- bcrypt cost factor 10 이상
- 단기 JWT는 별도 secret (`ANTHOLOGY_JWT_SECRET`)
- 비밀번호 평문 저장/로깅 절대 금지

### 9.6. 갱신된 Phase 순서

기존 Phase 1~6은 [LEGACY]. 신규 Phase A~E를 우선 진행.

| Phase | 내용 | 의존성 |
|:-----:|------|--------|
| **A** | 인증 인프라 — Project/Order에 userId FK 추가, `lastEditedAt` 추가, 기존 라우트 인증 미들웨어 적용, JWT 검증 미들웨어 | — |
| **B-1** | 메인 페이지 레이아웃 — 9.2.1 6개 블록 구조 + 빈 상태 UI (Figma 디자인 시스템 기반), 비로그인 시 빈 카드 + 로그인 CTA | A |
| **B-2** | 메인 페이지 섹션별 API 연동 — Hero(`/api/projects/last-edited`) + Specs(`book-specs` 캐싱) + Workspace(`projects`+`orders`) + Anthology(`anthology?role=`) | A, B-1 |
| **C** | 내 작업/주문 페이지 — MyProjects, MyOrders, OrderDetail | A, B-2 |
| **D** | Wizard 재설계 + F1/F4 검수 — `/wizard`, BookEdit, 페이지별 DPI 뱃지, 경고 모달 | A, C |
| **E** | 합동지 본기능 — 9.4.2 스키마 + 9.5 인증 흐름 + 대시보드 + 기여자 제출 페이지 | A, D |

### 9.7. 환경 변수 추가

```
JWT_SECRET=...                  # 기존
ANTHOLOGY_JWT_SECRET=...        # 신규 — 기여자 단기 JWT
BCRYPT_ROUNDS=10                # 신규
```

---

**문서 종료**
