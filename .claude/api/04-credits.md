# Credits API

충전금(크레딧) 조회 및 거래 API

이 API는  
“선불 결제 시스템”을 관리한다.

---

## 기본 개념

SweetBook은 선불 방식이다.

흐름:

충전 → 주문 → 차감 → 취소 시 환불

---

## 환경 분리 (매우 중요)

Sandbox  
→ 테스트용

Live  
→ 실제 돈

---

## 잔액 조회

GET /v1/credits

---

### 예시 요청

curl 'https://api-sandbox.sweetbook.com/v1/credits' \
 -H 'Authorization: Bearer YOUR_API_KEY'

---

### 예시 응답

{
"success": true,
"message": "Success",
"data": {
"accountUid": "acc_abc123",
"balance": 100000,
"currency": "KRW",
"env": "test",
"createdAt": "2026-01-01T00:00:00Z",
"updatedAt": "2026-03-01T10:00:00Z"
}
}

---

### 해석

- 현재 잔액: 100,000원
- 테스트 환경 (Sandbox)

---

## 거래 내역 조회

GET /v1/credits/transactions

---

### 예시 요청

curl 'https://api-sandbox.sweetbook.com/v1/credits/transactions?limit=2' \
 -H 'Authorization: Bearer YOUR_API_KEY'

---

### 예시 응답

{
"success": true,
"data": {
"transactions": [
{
"transactionId": "tx_1",
"reasonCode": 9,
"direction": "credit",
"amount": 100000,
"balanceAfter": 100000,
"createdAt": "2026-02-28T09:00:00Z"
},
{
"transactionId": "tx_2",
"reasonCode": 3,
"direction": "debit",
"amount": 23800,
"balanceAfter": 76200,
"createdAt": "2026-03-01T10:00:00Z"
}
]
}
}

---

### 해석

1. 100,000원 충전
2. 주문으로 23,800원 차감  
   → 남은 잔액: 76,200원

---

## Sandbox 충전

POST /v1/credits/sandbox/charge

---

### 예시 요청

curl -X POST 'https://api-sandbox.sweetbook.com/v1/credits/sandbox/charge' \
 -H 'Authorization: Bearer YOUR_API_KEY' \
 -H 'Idempotency-Key: charge-001' \
 -H 'Content-Type: application/json' \
 -d '{
"amount": 100000,
"memo": "테스트 충전"
}'

---

### 예시 응답

{
"success": true,
"data": {
"amount": 100000,
"balanceAfter": 200000
}
}

---

### 해석

- 기존: 100,000
- 충전: +100,000
- 결과: 200,000

---

## Sandbox 차감

POST /v1/credits/sandbox/deduct

---

### 예시 요청

curl -X POST 'https://api-sandbox.sweetbook.com/v1/credits/sandbox/deduct' \
 -H 'Authorization: Bearer YOUR_API_KEY' \
 -H 'Idempotency-Key: deduct-001' \
 -H 'Content-Type: application/json' \
 -d '{
"amount": 50000,
"memo": "테스트 차감"
}'

---

### 예시 응답

{
"success": true,
"data": {
"amount": -50000,
"balanceAfter": 150000
}
}

---

### 해석

- 기존: 200,000
- 차감: -50,000
- 결과: 150,000

---

## 실제 주문과 연결

예시 시나리오:

현재 잔액: 100,000원

주문 생성:

POST /orders  
→ 결제 금액: 64,400원

---

### 결과

잔액:  
100,000 → 35,600

---

## 주문 취소 시

POST /orders/{orderUid}/cancel

---

### 결과

35,600 → 100,000 (전액 환불)

---

## 잔액 부족 에러

---

### 예시

잔액: 10,000  
주문 금액: 64,400

---

### 응답

{
"success": false,
"message": "Insufficient Credit",
"data": {
"required": 64400,
"balance": 10000
}
}

---

### 해석

- 54,400원 부족
- 충전 후 재시도 필요

---

## 개발 시 핵심 포인트

1. 주문 전에 잔액 확인

2. 거래 내역으로 디버깅

3. Idempotency-Key 사용

4. 402 에러 처리 필수

5. Sandbox / Live 구분 철저

---

## 한 줄 요약

이 API는

“돈이 어떻게 들어오고 나가는지 추적하는 시스템”이다
