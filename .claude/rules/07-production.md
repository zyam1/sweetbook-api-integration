# SweetBook Production (운영 전환) 가이드

## 개요

Sandbox 환경에서 개발 완료 후 Live 환경으로 전환하기 위한 조건과 체크리스트를 정의한다.  
Live 환경에서는 실제 인쇄 및 배송이 발생한다.

---

## 사전 조건

1. 사업 협의 완료

- 가격, 물량, 납기 확정

2. Business 계정 전환

- 파트너 포털에서 완료

주의:

- Live 환경 주문은 실제 제작됨
- 테스트는 반드시 Sandbox에서 수행

---

## 전환 체크리스트

1. 사업 협의 완료
2. Business 계정 전환 완료
3. Live API Key 발급
4. Base URL 변경
5. 충전금 충전
6. 웹훅 URL 변경
7. IP 화이트리스트 설정 (권장)
8. 에러 핸들링 확인
9. 재시도 로직 확인
10. 충전금 모니터링 설정
11. 첫 Live 주문 테스트

---

## 코드 변경 사항

변경 대상:

BASE_URL  
API_KEY

---

## 변경 예시

const BASE*URL = 'https://api-sandbox.sweetbook.com/v1';
const API_KEY = 'sandbox_sk*...';

↓

const BASE*URL = 'https://api.sweetbook.com/v1';
const API_KEY = 'live_sk*...';

---

## 핵심 규칙

1. API 인터페이스 동일

- URL과 Key만 변경

2. 환경 변수로 관리 필수

- dev / prod 자동 전환

3. 코드 수정 최소화

- 로직 변경 금지

---

## 제작 및 배송 SLA

제작

- 3~4 영업일

배송

- 1~2일

기준:

- CONFIRMED 이후 제작 시작

주의:

- 공휴일 / 연휴 시 지연 가능

---

## 배송 정보

- 택배사: 한진택배
- 웹훅(order.shipped)에서 tracking 정보 제공

---

## 불량 처리

조건:

- 인쇄 불량 발생 시

처리 방식:

- 파트너 포털에서 접수
- 불량 사진 첨부 필수

재제작:

- 3~4 영업일

비용:

- 인쇄 불량 인정 시 무료

---

## 주의사항

- 저해상도 이미지 문제는 불량 아님
- Live 환경에서는 반드시 실데이터 사용
- 주문 테스트 시 실제 비용 발생

---

## Claude Code 적용 목적

- 환경 전환 실수 방지
- Sandbox/Live 혼동 방지
- API Key 관리 자동화
- 운영 안정성 확보
