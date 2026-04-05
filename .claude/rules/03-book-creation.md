# SweetBook Book Creation (책 생성) 가이드

## 개요

책 생성은 포토북 제작의 핵심 단계이다.  
책을 생성한 후 표지와 내지를 추가하고, 최종화를 통해 주문 가능한 상태로 전환한다.

---

## 1. 책 생성

POST /books

필수 파라미터:

title

- 책 제목

bookSpecUid

- 판형 UID

선택 파라미터:

bookAuthor

- 저자명

specProfileUid

- 사양 프로필

externalRef

- 파트너 시스템 내부 ID (매핑용)

---

## externalRef 규칙

- 파트너 시스템과 SweetBook 데이터 연결용
- 주문번호 / 상품ID 등 저장 권장
- 이후 조회 시 매핑 기준으로 사용

---

## 2. 표지 추가

POST /books/{bookUid}/cover

구성:

- templateUid 필수
- frontPhoto / backPhoto 업로드
- parameters 전달

주의:

- 템플릿별 필수 파라미터 다름
- 반드시 GET /templates/{templateUid}로 확인

---

## 3. 내지 추가 (반복)

POST /books/{bookUid}/contents

특징:

- 반복 호출 필요
- 페이지 단위로 추가됨

주요 파라미터:

breakBefore

- 페이지 시작 방식 (예: page)

templateUid

- 내지 템플릿

files

- 이미지 파일

parameters

- 텍스트/데이터 바인딩

---

## 4. 내지 초기화

DELETE /books/{bookUid}/contents

- 모든 내지 삭제
- 표지는 유지됨

---

## 5. 페이지 수 확인

GET /books/{bookUid}

확인 항목:

pageCount

- 현재 페이지 수

status

- EDITING 상태 여부

---

## 페이지 규칙

- pageMin <= pageCount <= pageMax
- pageIncrement 단위 준수
- 조건 미충족 시 finalization 실패

---

## 6. 최종화

POST /books/{bookUid}/finalization

설명:

- 책 편집 완료 처리
- 이후 주문 가능 상태로 변경

조건:

- 최소 페이지 수 충족 필수

---

## 상태 흐름

CREATED → EDITING → FINALIZED

- FINALIZED 상태에서만 주문 가능

---

## 핵심 규칙

1. bookSpecUid 반드시 지정
2. contents는 반복 호출 구조
3. 페이지 수 조건 반드시 맞출 것
4. finalization 이전 주문 금지
5. cover는 1회만 설정

---

## 파일 업로드 규칙

지원 형식:

- JPG
- PNG
- GIF
- BMP
- WebP
- HEIC

비지원:

- SVG

---

## 구현 주의사항

- contents 호출 누락 시 페이지 부족 오류 발생
- finalization 실패는 대부분 페이지 조건 문제
- externalRef로 시스템 간 추적 가능하게 설계
- API 실패 시 retry 고려

---

## Claude Code 적용 목적

- 책 생성 흐름 자동 구성
- 반복 구조(contents) 자동 처리
- 페이지 조건 검증 유도
- 잘못된 순서 호출 방지
