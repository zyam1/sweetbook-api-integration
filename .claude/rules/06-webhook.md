# SweetBook Webhook (웹훅 연동) 가이드

## 개요

웹훅은 주문 상태 변경 이벤트를 실시간으로 수신하기 위한 메커니즘이다.  
서버에서 이벤트를 받아 주문 상태를 동기화해야 한다.

---

## 1. 웹훅 설정

PUT /webhooks/config

설정 항목:

url

- 이벤트 수신 서버 URL

events

- 수신할 이벤트 목록

---

## 주요 이벤트

- order.paid
- order.confirmed
- order.status_changed
- order.shipped
- order.cancelled

---

## 2. 설정 조회

GET /webhooks/config

- 현재 등록된 웹훅 확인

---

## 3. 테스트 이벤트

POST /webhooks/test

- 웹훅 정상 동작 여부 확인

---

## 4. 보안 (서명 검증)

방식:

- HMAC-SHA256

검증 문자열:

timestamp.payload

---

## 필수 헤더

X-Webhook-Event

- 이벤트 타입

X-Webhook-Delivery

- 고유 요청 ID

X-Webhook-Timestamp

- 타임스탬프

X-Webhook-Signature

- 서명 값

---

## 핵심 규칙

1. 서명 검증 필수

- 검증 실패 시 요청 거부

2. raw body 사용

- JSON 파싱 전에 검증 필요

3. timingSafeEqual 사용

- 보안 비교 필수

---

## 공통 페이로드 구조

event_uid  
event_type  
created_at  
data

---

## 주요 이벤트 상세

### order.paid

- 주문 생성 및 결제 완료

### order.confirmed

- 제작 확정

### order.status_changed

- 상태 변화 (제작 진행 등)

### order.shipped

- 배송 시작 (송장 포함)

### order.cancelled

- 취소 및 환불

---

## 상태 매핑

PAID → order.paid  
CONFIRMED → order.confirmed  
IN_PRODUCTION → order.status_changed  
SHIPPED → order.shipped  
CANCELLED_REFUND → order.cancelled

---

## 재시도 정책

1차 실패 → 1분 후  
2차 실패 → 5분 후  
3차 실패 → 30분 후

- 최대 3회 재시도
- 이후 미전송

---

## 폴링 대안

GET /orders/{orderUid}

설명:

- 웹훅 대신 상태 조회 가능

권장:

- 5~10분 간격

주의:

- 실시간성 낮음

---

## 구현 주의사항

- 2xx 응답 필수 (재시도 방지)
- 서명 검증 실패 시 401 반환
- 이벤트 중복 수신 가능성 고려
- idempotent 처리 필요

---

## Claude Code 적용 목적

- 웹훅 보안 검증 자동화
- 이벤트 기반 상태 처리 구현
- 중복 이벤트 처리 방지
- 폴링 fallback 구조 설계
