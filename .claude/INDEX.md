# SweetBook API Integration — 문서 인덱스

> `.claude/` 하위 모든 문서의 중앙 인덱스. 작업 전 관련 문서를 반드시 참조할 것.

---

## 네이밍 컨벤션

| 항목 | 규칙 | 예시 |
|------|------|------|
| 폴더 | lowercase | `rules/`, `api/`, `guide/` |
| 파일 | `{순번}-kebab-case.md` | `01-book-spec.md` |
| 순번 | 2자리, API 호출 순서 기준 | `00` = 공통/개요 |

---

## 폴더 구조

```
.claude/
├── INDEX.md                    ← 본 문서
├── settings.json               # Claude Code 설정 (권한, 언어)
├── agents/                     # 에이전트 정의 (7개)
│   ├── co-analysis.md          #   코드베이스 심층 분석
│   ├── be-code-route.md        #   Backend Route 구현
│   ├── be-code-service.md      #   Backend Service 구현
│   ├── be-code-middleware.md    #   Backend Middleware 구현
│   ├── fe-code-feature.md      #   Frontend Feature 구현
│   ├── fe-code-component.md    #   Frontend 공통 컴포넌트 구현
│   ├── co-review.md            #   코드 리뷰/검증
│   └── co-infra-git.md         #   Git 커밋
├── rules/                      # 구현 규칙 (Claude가 코드 작성 시 따라야 할 규칙)
│   ├── 00-workflow.md          #   전체 워크플로우 + API 호출 순서
│   ├── 01-book-spec.md         #   판형 선택 규칙
│   ├── 02-template.md          #   템플릿 선택 규칙
│   ├── 03-book-creation.md     #   책 생성 규칙
│   ├── 04-image-upload.md      #   이미지 업로드 규칙
│   ├── 05-order.md             #   주문 규칙
│   ├── 06-webhook.md           #   웹훅 규칙
│   └── 07-production.md        #   운영 전환 규칙
├── api/                        # API 레퍼런스 (엔드포인트, 파라미터, 응답 스펙)
│   ├── 00-common.md            #   공통 사항 (인증, 페이지네이션, Rate Limit, 멱등성)
│   ├── 01-book-specs.md        #   GET /book-specs
│   ├── 02-templates.md         #   GET /templates, GET /templates/{uid}
│   ├── 03-orders.md            #   POST /orders, GET /orders, 취소, 배송지 변경
│   ├── 04-credits.md           #   GET /credits, 충전, 차감, 거래내역
│   ├── 05-webhooks.md          #   PUT /webhooks/config, POST /webhooks/test
│   └── 06-errors.md            #   HTTP 에러 코드 + 공통 에러 응답 구조
└── guide/                      # 실전 가이드 (개념 설명 + 코드 예시)
    ├── credits-management.md   #   충전금 관리 + 402 처리 패턴
    ├── order-status-flow.md    #   주문 상태 흐름 + 웹훅 매핑 + SLA
    └── webhook-events.md       #   이벤트별 payload + Express 예시 코드
```

---

## 작업별 참조 가이드

| 작업 | 에이전트 | rules/ | api/ | guide/ |
|------|---------|--------|------|--------|
| 판형 선택 구현 | `be-code-service` | `01-book-spec.md` | `01-book-specs.md` | — |
| 템플릿 적용 구현 | `be-code-service` | `02-template.md` | `02-templates.md` | — |
| 책 생성/편집 구현 | `be-code-service` | `03-book-creation.md` | — | — |
| 이미지 업로드 구현 | `be-code-service` | `04-image-upload.md` | — | — |
| 주문 흐름 구현 | `be-code-service` + `be-code-route` | `05-order.md` | `03-orders.md` | `order-status-flow.md` |
| 크레딧/결제 구현 | `be-code-service` + `be-code-route` | `05-order.md` | `04-credits.md` | `credits-management.md` |
| 웹훅 수신 구현 | `be-code-middleware` | `06-webhook.md` | `05-webhooks.md` | `webhook-events.md` |
| Frontend 기능 | `fe-code-feature` | — | — | — |
| 공통 컴포넌트 | `fe-code-component` | — | — | — |
| Live 환경 전환 | — | `07-production.md` | — | — |
| **전체 흐름 파악** | `co-analysis` | `00-workflow.md` | `00-common.md` | — |
| **코드 리뷰** | `co-review` | — | — | — |
| **Git 커밋** | `co-infra-git` | — | — | — |
