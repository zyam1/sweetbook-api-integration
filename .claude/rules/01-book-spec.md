# SweetBook BookSpec (판형 선택) 가이드

## 개요

BookSpec은 포토북의 물리적 사양을 정의한다.  
판형 크기, 제본 방식, 표지 유형, 페이지 범위 등을 포함하며,  
책 생성 시 반드시 하나의 BookSpec을 지정해야 한다.

BookSpec 선택 이후에는 해당 판형에 호환되는 템플릿만 사용 가능하다.

---

## 판형 목록 조회

GET /book-specs

설명:

- 사용 가능한 전체 판형 목록 조회

예시:
curl 'https://api-sandbox.sweetbook.com/v1/book-specs' \
 -H 'Authorization: Bearer YOUR_API_KEY'

---

## 상세 조회

GET /book-specs/{bookSpecUid}

설명:

- 특정 판형의 상세 정보 조회
- 가격, 레이아웃 정보 포함

---

## 주요 필드 설명

bookSpecUid

- 판형 고유 ID
- 책 생성 시 필수 사용

name

- 판형 이름

innerTrimWidthMm / innerTrimHeightMm

- 내지 크기 (mm)

pageMin / pageMax

- 허용 페이지 범위
- finalization 시 반드시 이 범위 만족해야 함

pageIncrement

- 페이지 증가 단위 (예: 2페이지씩)

coverType

- 표지 유형 (Softcover, Hardcover)

bindingType

- 제본 방식 (PUR)

priceBase

- 기본 가격 (최소 페이지 기준)

pricePerIncrement

- 페이지 증가당 가격

layoutSize

- 작업 영역 크기 (표지/내지 width, height)

---

## 핵심 규칙

1. BookSpec은 책 생성 시 반드시 필요

- POST /books 호출 시 필수

2. 페이지 제약 준수

- pageMin <= 총 페이지 <= pageMax
- pageIncrement 단위 반드시 맞춰야 함

3. 템플릿 호환성

- 선택한 BookSpec에 맞는 템플릿만 사용 가능

4. finalization 검증

- 페이지 조건 불일치 시 실패 발생

---

## 가격 관련

Sandbox:

- 테스트용 가격 (실제 가격 아님)

Live:

- 실제 가격은 별도 계약 기준

---

## 추천 판형 가이드

일기장 / 알림장

- SQUAREBOOK_HC
- 최대 130페이지, 월 단위 데이터 적합

문서 / 포트폴리오

- PHOTOBOOK_A4_SC
- A4 규격

대량 사진 앨범

- PHOTOBOOK_A5_SC
- 최대 200페이지

고급 포토북 / 선물

- SQUAREBOOK_HC
- 하드커버

졸업앨범 / 범용

- SQUAREBOOK_HC
- 정사각형 레이아웃 유리

---

## Claude Code 적용 목적

- 잘못된 BookSpec 선택 방지
- 페이지 범위 오류 방지
- 템플릿 호환성 자동 체크 유도
- finalization 실패 예방
