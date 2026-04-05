# Webhook Events 가이드

이벤트별 payload 구조 + Express 코드 예시

---

## 이벤트 흐름

```
order.created
→ production.confirmed
→ production.started
→ production.completed
→ shipping.departed
→ shipping.delivered
```

예외:
- 취소 → order.cancelled
- 복구 → order.restored

---

## 공통 payload 구조

```json
{
  "event": "order.created",
  "orderUid": "or_123",
  "status": "PAID",
  "timestamp": "2025-03-15T10:30:00Z",
  "isTest": false
}
```

---

## 이벤트별 payload

### order.created

```json
{
  "event": "order.created",
  "orderUid": "or_8f3a2b1c",
  "bookUid": "bk_e4d5c6b7",
  "status": "PAID",
  "quantity": 2,
  "totalCredits": 35000,
  "shippingAddress": {
    "recipientName": "홍길동",
    "phone": "010-1234-5678"
  }
}
```

### order.cancelled

```json
{
  "event": "order.cancelled",
  "status": "CANCELLED",
  "refundedCredits": 35000
}
```

### order.restored

```json
{
  "event": "order.restored",
  "status": "PAID"
}
```

### production.confirmed

```json
{
  "event": "production.confirmed",
  "status": "CONFIRMED",
  "estimatedShipDate": "2025-03-20"
}
```

### production.started

```json
{
  "event": "production.started",
  "status": "IN_PRODUCTION"
}
```

### production.completed

```json
{
  "event": "production.completed",
  "status": "PRODUCTION_COMPLETE"
}
```

### shipping.departed

```json
{
  "event": "shipping.departed",
  "status": "SHIPPED",
  "trackingNumber": "123456",
  "trackingCarrier": "CJ"
}
```

### shipping.delivered

```json
{
  "event": "shipping.delivered",
  "status": "DELIVERED"
}
```

---

## Express 서버 예시

```js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.WEBHOOK_SECRET_KEY;

function verifySignature(payload, signature, timestamp) {
  const signPayload = `${timestamp}.${payload}`;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', SECRET_KEY)
    .update(signPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

app.post('/webhooks/sweetbook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const event = req.headers['x-webhook-event'];

  const payload = JSON.stringify(req.body);

  // 1. 서명 검증
  if (!verifySignature(payload, signature, timestamp)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const data = req.body;

  // 2. 이벤트별 처리
  switch (event) {
    case 'order.created':
      console.log('주문 생성:', data);
      break;
    case 'order.cancelled':
      console.log('주문 취소:', data);
      break;
    case 'shipping.departed':
      console.log('배송 시작:', data);
      break;
    case 'shipping.delivered':
      console.log('배송 완료:', data);
      break;
  }

  // 3. 반드시 200 응답
  res.status(200).json({ received: true });
});
```

---

## 주의사항

- 서명 검증 필수 (보안)
- 동일 이벤트 중복 수신 가능 → idempotent 처리 필요
- 30초 안에 응답해야 함
- 200~299 응답만 성공 처리
- 오래 걸리는 작업은 비동기로 처리
