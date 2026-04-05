# Credits Management Guide

## 환경 분리

### Sandbox

- 테스트용 가상 크레딧
- 파트너 포털에서 직접 충전 가능
- 금액 제한 없이 자유롭게 충전/소진 가능
- Live 환경과 완전히 분리됨

### Live

- PG 결제를 통해 실제 금액 충전
- 주문 생성 시 자동 차감
- Sandbox와 완전히 독립

---

## 잔액 조회

GET /v1/credits

### 응답 핵심 필드

| 필드 | 설명 |
|------|------|
| balance | 현재 잔액 |
| currency | 통화 (KRW) |
| env | 환경 (test / live) |

---

## 차감 규칙

- 차감 시점: 주문 생성 (POST /orders) 성공 시 즉시
- 차감 금액: productAmount + shippingFee + packagingFee + VAT(10%)
- 잔액 부족 시: 402 Payment Required

---

## 환불 규칙

| 취소 가능 상태 | 결과 |
|:--------------:|------|
| PAID (20) | 전액 즉시 환불 |
| PDF_READY (25) | 전액 즉시 환불 |
| CONFIRMED 이후 | 취소 불가 |

---

## 필수 흐름

1. 주문 전 잔액 조회 (GET /credits)
2. POST /orders/estimate로 예상 금액 확인
3. creditSufficient = true 확인
4. 잔액 부족 시 주문 요청 금지
5. 주문 후에도 402 응답 별도 처리

---

## 402 처리 패턴

```js
async function createOrderWithBalanceCheck(orderData, estimatedAmount) {
  // 1. 잔액 조회
  const balance = await getCreditsBalance();

  if (balance.totalCreditAmount < estimatedAmount) {
    throw new Error('충전금 부족');
  }

  // 2. 주문 생성
  const response = await createOrder(orderData);

  // 3. 402 예외 처리
  if (response.status === 402) {
    throw new Error('충전 후 재시도');
  }

  return response;
}
```

---

## 핵심 규칙

- Sandbox / Live 충전금 절대 혼용 금지
- 주문 생성 시 즉시 차감
- VAT 포함 금액 기준 차감
- 잔액 체크 + 402 처리 필수
- 거래 내역 (GET /credits/transactions)으로 디버깅
- Idempotency-Key 사용 (충전/차감 시)
