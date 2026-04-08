# SweetPress — 함께 만드는 문집 제작 서비스

## 1. 서비스 소개

**SweetPress**는 여러 참여자가 글과 사진을 함께 모아 한 권의 포토북(문집/앤솔로지)을 만들고 주문할 수 있는 웹 서비스입니다.

- **한 문장 소개**: 주최자가 프로젝트를 열고 링크를 공유하면, 참여자들이 각자 글·사진을 제출해 자동으로 한 권의 문집으로 제작·주문되는 서비스.
- **타겟 고객**
  - 학급 문집·졸업 앨범을 만들고 싶은 교사/학생
  - 동아리·소모임의 활동 기록집을 남기고 싶은 그룹
  - 가족 여행·이벤트 사진집을 함께 만들고 싶은 가족
  - 워크숍·공모전 작품집을 제작하려는 커뮤니티
- **주요 기능**
  - 프로젝트(합동지) 생성 및 참여 링크 공유
  - 참여자별 글/사진 제출 페이지 (로그인 없이 참여 가능)
  - 견적 조회 → 주문 생성 → 주문 상태 추적
  - 관리자 페이지 (참여자 관리/제출물 검토/주문 관리)

---

## 2. 실행 방법

### 사전 요구 사항

- Node.js 18+
- SweetBook Sandbox API Key

> DB는 평가용 개인 서버에 구성되어 있어 별도 설치가 필요 없습니다.
> `DATABASE_URL`은 **제출한 구글폼에 함께 전달**드렸으니 아래 `.env` 설정 시 그대로 붙여넣어 주세요.

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd sweetbook-api-integration

# Backend 설치 (의존성 설치 필수)
cd backend
npm install

# 환경변수 설정 (반드시 backend/ 디렉토리 안에 .env 파일을 둘 것)
cp .env.example .env
# backend/.env 파일 열어 아래 값 입력:
#   SWEETBOOK_API_KEY=sandbox_sk_...
#   SWEETBOOK_API_BASE_URL=https://api-sandbox.sweetbook.com/v1
#   DATABASE_URL=...                    # ★ 제출한 구글폼에 함께 전달드린 값을 그대로 붙여넣기
#   JWT_SECRET=아무_문자열              # 임시용 — 어떤 값이든 가능
#   CONTRIBUTOR_JWT_SECRET=아무_문자열  # 임시용 — 어떤 값이든 가능


npx prisma generate

# Backend 실행 (포트 4000)
npm start
```

```bash
# 새 터미널에서 Frontend 실행 (포트 5173)
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.
테스트 아이디: test@email.com
테스트 비밀번호:test1234

더미데이터의 참여자 인증 비밀번호는 전부 ' 1234 ' 입니다

---

## 3. 사용한 API 목록 (SweetBook / Book Print API)

| API                                  | 용도                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| `GET /book-specs`                    | 판형 목록 조회 (메인 페이지 카드 노출)                 |
| `GET /book-specs/{bookSpecUid}`      | 판형 상세 조회 (페이지 범위·가격)                      |
| `GET /templates`                     | 템플릿 목록 조회 (표지/내지 필터)                      |
| `GET /templates/{templateUid}`       | 템플릿 상세 조회 (parameters 구조)                     |
| `POST /books`                        | 새 포토북 생성 (draft 상태)                            |
| `POST /books/{bookUid}/photos`       | 참여자 사진 업로드                                     |
| `POST /books/{bookUid}/cover`        | 표지 설정                                              |
| `POST /books/{bookUid}/contents`     | 내지 추가 (참여자별 반복 호출)                         |
| `GET /books/{bookUid}`               | 책 상태·pageCount 확인                                 |
| `POST /books/{bookUid}/finalization` | 책 최종화 (주문 가능 상태 전환)                        |
| `POST /orders/estimate`              | 주문 견적 조회 (충전금 충분 여부 체크)                 |
| `POST /orders`                       | 주문 생성 (Idempotency-Key 적용)                       |
| `GET /orders/{orderUid}`             | 주문 상태 조회                                         |
| `GET /credits`                       | 충전금 잔액 조회                                       |
| `Webhook`                            | 주문 상태 변경 이벤트 수신 (paid/confirmed/shipped 등) |

> API 호출 순서는 `.claude/rules/00-workflow.md`의 1~10 단계를 그대로 따릅니다.

---

## 4. AI 도구 사용 내역

| AI 도구                            | 활용 내용                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code**                    | 백엔드 Routes/Services 2-레이어 구조 설계, SweetBook SDK 래핑 로직 작성, Prisma 스키마 설계, Gate 기반 작업 워크플로우 자동화 |
| **Claude Code**                    | Frontend feature 기반 구조 (anthology/auth/order) 설계 및 React 컴포넌트 작성                                                 |
| **ChatGPT**                        | 문집 컨셉 아이디어 브레인스토밍 및 더미 참여자 텍스트·샘플 데이터 생성                                                        |
| **Figma (SweetPress 디자인 파일)** | UI 레퍼런스 — Frontend 작업 시 Figma MCP로 디자인 토큰·레이아웃 참조                                                          |

---

## 5. 설계 의도

### 왜 이 서비스를 선택했는가

"여러 사람이 모은 추억을 한 권의 책으로" 라는 경험은 수요는 있지만 실제로는 편집자 한 명이 모든 사진·글을 모으고 편집해야 하는 번거로움 때문에 포기하게 되는 경우가 많습니다. SweetBook API가 제공하는 **템플릿 기반 자동 레이아웃**과 **판형별 페이지 자동 검증**을 활용하면, 주최자는 링크만 공유하고 참여자가 각자 제출하면 자동으로 한 권이 완성되는 구조를 만들 수 있겠다고 판단해 이 서비스를 선택했습니다.

### 비즈니스 가능성

- **학급/동아리 시장**: 학기말·졸업 시즌마다 반복 수요가 발생하며, 단체 주문으로 객단가가 큼
- **이벤트 MD**: 결혼식·돌잔치·팬미팅 등에서 "방명록 + 사진"을 책으로 만드는 굿즈 시장
- **확장성**: 동일한 "참여자 링크 → 자동 조립" 파이프라인을 달력·엽서·액자 등 다른 포토 굿즈로 확장 가능
- **구독 모델**: 가족 사진을 매달 자동으로 수집해 월간 포토북으로 발송하는 정기 구독

### 시간이 더 있었다면 추가했을 기능

- **결제 연동**: 현재는 SweetBook 충전금 차감 구조. 실사용을 위해 PG 연동(토스페이먼츠/포트원) 추가
- **실시간 미리보기**: 참여자 제출물을 반영한 책 프리뷰를 실시간 렌더링
- **AI 자동 편집**: 참여자 글 길이·사진 비율에 따라 최적 템플릿을 자동 추천
- **웹훅 기반 상태 추적 UI**: 주문 상태 타임라인 + 배송 조회 연동
- **참여 마감/리마인드 알림**: 이메일·카카오 알림톡 연동
- **접근성 개선**: 스크린리더·키보드 내비게이션 보강
