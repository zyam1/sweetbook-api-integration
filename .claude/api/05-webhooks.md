# Webhooks API

웹훅 등록, 조회, 테스트 API

---

## 웹훅 등록

PUT /v1/webhooks/config

### 요청

```json
{
  "webhookUrl": "https://example.com/webhooks/sweetbook",
  "events": ["order.created", "shipping.departed"],
  "description": "주문 알림"
}
```

### 설명

- webhookUrl: 이벤트 수신 서버 URL
- events: 수신할 이벤트 목록 (빈 배열 = 전체 수신)
- secretKey: 응답에서 자동 생성됨 (저장 필수)

---

## 웹훅 조회

GET /v1/webhooks/config

- 현재 등록된 웹훅 설정 확인

---

## 테스트 이벤트 발송

POST /v1/webhooks/test

```bash
curl -X POST 'https://api-sandbox.sweetbook.com/v1/webhooks/test' \
 -H 'Authorization: Bearer YOUR_API_KEY' \
 -H 'Content-Type: application/json' \
 -d '{"eventType": "order.created"}'
```

---

## 수신 시 필수 헤더

| 헤더 | 설명 |
|------|------|
| X-Webhook-Event | 이벤트 타입 |
| X-Webhook-Delivery | 고유 요청 ID |
| X-Webhook-Timestamp | 타임스탬프 |
| X-Webhook-Signature | HMAC-SHA256 서명 |

---

## 서명 검증

방식: HMAC-SHA256

검증 문자열: `{timestamp}.{payload}`

```
expected = sha256(secretKey, "{timestamp}.{raw_body}")
```

규칙:
- raw body 사용 (JSON 파싱 전)
- crypto.timingSafeEqual 사용 필수
- 검증 실패 시 401 반환

---

## 재시도 정책

| 횟수 | 대기 시간 |
|:----:|:---------:|
| 1차 | 1분 후 |
| 2차 | 5분 후 |
| 3차 | 30분 후 |

- 최대 3회 재시도
- 2xx 응답해야 성공 처리
- 30초 안에 응답 필수

---

## 폴링 대안

GET /orders/{orderUid}

- 웹훅 대신 상태 직접 조회
- 권장 간격: 5~10분
- 실시간성 낮음
