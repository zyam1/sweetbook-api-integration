# Orders API

주문 생성 및 관리 API

이 API는 단순 CRUD가 아니라  
“충전금 결제 + 상태 머신 기반 주문 시스템”이다.

모든 요청은 Authorization: Bearer <API_KEY> 필요

---

## 주문 상태 코드

20 PAID  
→ 결제 완료 (충전금 차감 완료된 상태)

25 PDF_READY  
→ 출력용 PDF 생성 완료

30 CONFIRMED  
→ 제작 확정 (이 시점부터 취소 불가)

40 IN_PRODUCTION  
→ 실제 제작 진행 중

45 COMPLETED  
→ 일부 항목 제작 완료

50 PRODUCTION_COMPLETE  
→ 전체 제작 완료

60 SHIPPED  
→ 발송 완료 (송장 생성됨)

70 DELIVERED  
→ 배송 완료

80 CANCELLED  
→ 취소

81 CANCELLED_REFUND  
→ 취소 + 환불 완료

90 ERROR  
→ 처리 중 오류

---

## 상태 흐름 (State Machine)

정상 흐름:

PAID  
→ PDF_READY  
→ CONFIRMED  
→ IN_PRODUCTION  
→ COMPLETED  
→ PRODUCTION_COMPLETE  
→ SHIPPED  
→ DELIVERED

예외 흐름:

PAID / PDF_READY  
→ CANCELLED_REFUND

설명:

- CONFIRMED 이후는 “제작 시작” 상태라 취소 불가
- 상태 기반으로 가능한 행동이 완전히 달라짐

---

## 파트너 가능 액션

### 주문 취소

가능 상태:

- PAID
- PDF_READY

설명:

- 이 시점까지만 취소 가능
- 취소 시 충전금 자동 환불

---

### 배송지 변경

가능 상태:

- PAID
- PDF_READY
- CONFIRMED

설명:

- 발송 전까지만 수정 가능
- SHIPPED 이후 변경 불가

---

## 주문 목록 조회

GET /v1/orders

설명:

- 주문 리스트 조회
- 상태 / 기간 필터 가능

---

### Query 파라미터

limit  
→ 기본 20, 최대 100

offset  
→ 페이징 시작 위치

status  
→ 상태 코드 필터

from / to  
→ ISO 8601 날짜 범위

---

### 응답 구조

total  
→ 전체 주문 수

items  
→ 주문 목록

hasNext  
→ 다음 페이지 존재 여부

---

## 주문 상세 조회

GET /v1/orders/{orderUid}

설명:

- 단일 주문 상세 조회
- 프론트에서 주문 상세 페이지에 사용

---

### 포함 정보

- 주문 상태
- 결제 금액
- 배송지
- 주문 항목
- 사용자 연동 정보

---

### 특징

- items 배열 안에 실제 주문 상품 정보 포함
- externalUserId로 파트너 유저 연결 가능

---

## 주문 생성

POST /v1/orders

설명:

- FINALIZED 상태의 책을 주문
- 호출 즉시 충전금 차감

---

### 매우 중요한 규칙

반드시 포함:

Idempotency-Key

설명:

- 같은 요청 중복 실행 방지
- 결제 중복 차감 방지

---

### 요청 구조

items  
→ 주문 상품 목록

shipping  
→ 배송지 정보

externalRef  
→ 파트너 주문 ID (선택)

externalUserId  
→ 유저 연결용 (선택)

---

### items 구조

bookUid  
→ FINALIZED 상태만 가능

quantity  
→ 1 ~ 100

---

### shipping 구조

recipientName  
recipientPhone  
postalCode  
address1  
address2  
memo

---

### 내부 처리 흐름

1. bookUid 검증
   - 존재 여부
   - 파트너 소유 여부
   - FINALIZED 상태 여부

2. 가격 계산
   - bookSpec 기준

3. 배송비 추가
   - 기본 3,000원

4. 충전금 잔액 확인

5. 결제 (차감)

6. 주문 생성

---

### 응답 핵심 필드

orderUid  
orderStatus  
totalAmount  
paidCreditAmount  
creditBalanceAfter

---

### 에러 케이스

400  
→ book 상태 오류 / 요청 값 오류

401  
→ 인증 실패

402  
→ 충전금 부족

500  
→ 서버 오류

---

## 주문 취소

POST /v1/orders/{orderUid}/cancel

---

### 조건

- PAID 또는 PDF_READY 상태
- NORMAL 타입 주문만 가능

---

### 특징

- 전액 환불 (충전금으로)
- CONFIRMED 이후 취소 불가

---

### 요청

cancelReason 필수

---

## 배송지 변경

PATCH /v1/orders/{orderUid}/shipping

---

### 가능 상태

PAID ~ CONFIRMED

---

### 변경 가능 필드

recipientName  
recipientPhone  
postalCode  
address1  
address2  
shippingMemo

---

### 특징

- 부분 수정 가능 (PATCH)
- SHIPPED 이후 불가

---

## 개발 시 핵심 주의사항

1. Idempotency-Key 반드시 사용  
   → 안 쓰면 결제 중복 발생 가능

2. 상태 기반 처리 필수  
   → 상태에 따라 가능한 액션 다름

3. 충전금 기반 결제  
   → 실패 시 반드시 롤백 고려

4. SHIPPED 이후 수정 금지  
   → 배송 관련 데이터 immutable

5. 웹훅과 함께 사용 필수  
   → 상태 변경은 웹훅으로 받는 구조

---

## 추천 구조 (프론트 기준)

- 주문 생성 → API 호출
- 상태 변화 → 웹훅 수신 or 폴링
- 상세 조회 → GET /orders/{id}

---

## 한 줄 요약

이 API는

“결제 시스템 + 상태 머신 + 비동기 처리(웹훅)”의 결합이다
