# SweetBook Order & Payment (주문 및 결제) 가이드

## 개요

주문 프로세스는 견적 조회 → 주문 생성 → 상태 관리 순서로 진행된다.  
주문 생성 시 충전금이 즉시 차감되며, 이후 상태에 따라 취소 및 배송 변경이 가능하다.

---

## 1. 견적 조회

POST /orders/estimate

설명:

- 주문 전 예상 비용 확인
- 가격 구성:
  productAmount + shippingFee + packagingFee = totalAmount
- 실제 차감 금액:
  paidCreditAmount (부가세 포함)

---

## 핵심 필드

totalAmount

- 총 금액

paidCreditAmount

- 실제 차감 금액 (VAT 포함)

creditSufficient

- 충전금 충분 여부

---

## 핵심 규칙

- 반드시 주문 전에 estimate 호출
- creditSufficient = true 확인 후 주문 진행

---

## 2. 충전금 확인

GET /credits

설명:

- 현재 잔액 확인

주의:

- Sandbox / Live 환경 분리됨

---

## 3. 주문 생성

POST /orders

필수 요소:

items

- bookUid + quantity

shipping

- 수령인 정보 필수

externalRef

- 파트너 주문 ID

---

## Idempotency-Key (중요)

- 중복 요청 방지 필수
- 동일 요청 재전송 시 중복 결제 방지

---

## 주문 생성 결과

- 즉시 결제 (충전금 차감)
- 상태: PAID

---

## 충전금 부족 에러

HTTP 402

조건:

- 잔액 부족 시 발생

예방:

- estimate의 creditSufficient 체크 필수

---

## 4. 주문 취소

POST /orders/{orderUid}/cancel

조건:

- PAID
- PDF_READY

취소 불가:

- CONFIRMED 이후

결과:

- 즉시 환불

---

## 5. 배송지 변경

PATCH /orders/{orderUid}/shipping

설명:

- 주문 후 배송 정보 수정 가능

---

## 6. 주문 조회

GET /orders

- 목록 조회

GET /orders/{orderUid}

- 상세 조회

---

## 주문 상태 흐름

20 PAID

- 결제 완료

25 PDF_READY

- PDF 생성 완료

30 CONFIRMED

- 제작 확정

40 IN_PRODUCTION

- 제작 진행

45 COMPLETED

- 개별 제작 완료

50 PRODUCTION_COMPLETE

- 전체 제작 완료

60 SHIPPED

- 배송 시작

70 DELIVERED

- 배송 완료

80 CANCELLED

- 취소

81 CANCELLED_REFUND

- 환불 완료

90 ERROR

- 오류

---

## 상태 규칙

- 취소 가능: PAID, PDF_READY
- 취소 불가: CONFIRMED 이후

---

## 구현 주의사항

- Idempotency-Key 누락 시 중복 결제 위험
- estimate 없이 주문 금지
- shipping 정보 누락 시 실패
- 상태 기반 로직 분기 필요

---

## Claude Code 적용 목적

- 주문 전 검증 로직 강제
- 중복 결제 방지
- 상태 기반 처리 자동화
- 취소 가능 여부 판단 자동화
