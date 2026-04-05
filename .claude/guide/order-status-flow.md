# Order Status Flow Guide

## 상태 흐름

```
PAID (20)
→ PDF_READY (25)
→ CONFIRMED (30)
→ IN_PRODUCTION (40)
→ PRODUCTION_COMPLETE (50)
→ SHIPPED (60)
→ DELIVERED (70)
```

### 취소 흐름

파트너 취소 (API):
- PAID (20), PDF_READY (25) → CANCELLED_REFUND (81)

관리자 취소:
- SHIPPED (60) 이전 → CANCELLED (80) 또는 CANCELLED_REFUND (81)

---

## 상태 코드

| 코드 | 상태 | 설명 |
|:----:|------|------|
| 20 | PAID | 결제 완료 (충전금 차감) |
| 25 | PDF_READY | PDF 생성 완료 |
| 30 | CONFIRMED | 제작 확정 (출력일 배정) |
| 40 | IN_PRODUCTION | 제작 진행 중 |
| 50 | PRODUCTION_COMPLETE | 제작 완료 |
| 60 | SHIPPED | 발송 완료 |
| 70 | DELIVERED | 배송 완료 |
| 80 | CANCELLED | 취소 |
| 81 | CANCELLED_REFUND | 취소 및 환불 완료 |
| 90 | ERROR | 오류 |

---

## 웹훅 매핑

| 상태 | 이벤트 | 주요 필드 |
|------|--------|----------|
| PAID (20) | order.paid | total_amount, item_count |
| CONFIRMED (30) | order.confirmed | print_day |
| IN_PRODUCTION (40) | order.status_changed | previous_status, new_status |
| PRODUCTION_COMPLETE (50) | order.status_changed | previous_status, new_status |
| SHIPPED (60) | order.shipped | tracking_number, tracking_carrier |
| CANCELLED / CANCELLED_REFUND | order.cancelled | cancel_reason, refund_amount |

---

## 상태별 가능 액션

| 액션 | 가능 상태 |
|------|----------|
| 주문 취소 | PAID, PDF_READY |
| 배송지 변경 | PAID ~ CONFIRMED |

---

## SLA

| 구간 | 기간 | 비고 |
|------|------|------|
| CONFIRMED → PRODUCTION_COMPLETE | 3~4 영업일 | 공휴일 제외 |
| SHIPPED → DELIVERED | 1~2일 | 한진택배 |

---

## Sandbox 동작

- Sandbox에서는 주문이 PAID 상태에서 멈춤
- 실제 제작/배송/상태 전이 없음
- 상태 전이 테스트: POST /webhooks/test 사용

---

## 핵심 규칙

- 상태는 정의된 순서대로만 전이
- 파트너 취소: PAID, PDF_READY에서만 가능
- CONFIRMED 이후 취소: 관리자 권한
- CANCELLED_REFUND에서만 환불 확정
- 웹훅 기반 상태 동기화 권장
