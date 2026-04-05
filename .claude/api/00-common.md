# SweetBook API 공통 사항

## 개요

SweetBook API의 인증, 요청/응답 형식, 페이지네이션, Rate Limiting 등  
모든 API에 공통으로 적용되는 규칙을 정의한다.

---

## 인증

모든 API 요청은 Bearer Token 인증을 사용한다.

Authorization: Bearer SB{prefix}.{secret}

규칙:

- API Key는 SB로 시작
- prefix.secret 구조
- Sandbox / Live 키 분리

주의:

- 반드시 서버에서만 사용
- 클라이언트 노출 금지

---

## Base URL

Sandbox  
https://api-sandbox.sweetbook.com/v1

Live  
https://api.sweetbook.com/v1

---

## 요청 형식

application/json

- 일반 API

multipart/form-data

- 파일 업로드

---

## 응답 구조

공통 응답 형태:

success  
message  
data  
errors  
fieldErrors

---

## 성공 응답

{
"success": true,
"message": "Success",
"data": {}
}

---

## 에러 응답

{
"success": false,
"message": "Validation failed",
"data": null,
"errors": [],
"fieldErrors": []
}

---

## 페이지네이션

파라미터:

limit (기본 20, 최대 100)  
offset (기본 0)

응답:

total  
limit  
offset  
hasNext  
items

---

## Rate Limiting

auth

- 10 req/min (IP 기준)

general

- 300 req/min (API Key 기준)

upload

- 200 req/min (API Key 기준)

초과 시:

429 응답 + Retry-After 헤더

---

## 멱등성 (Idempotency)

헤더:

Idempotency-Key

사용 대상:

POST /books  
POST /orders  
POST /credits/sandbox/charge

규칙:

- 동일 요청 → 동일 응답 반환
- 다른 요청 → 409 Conflict

주의:

- 주문 생성 시 반드시 사용

---

## 주요 HTTP 에러 코드

400

- 요청 값 오류

401

- 인증 실패

403

- 권한 부족

404

- 리소스 없음

402

- 잔액 부족

409

- 멱등성 충돌

429

- Rate Limit 초과

500

- 서버 오류

---

## 날짜 형식

ISO 8601 (UTC)

예시:

2026-03-17T09:30:00Z
