# BookSpecs API

포토북 판형(BookSpec) 조회 API

이 API는  
“책의 물리적 제작 규칙”을 정의한다.

---

## 판형(BookSpec)이란

판형은 책의 제작 스펙이다.

포함 정보:

- 크기 (가로/세로)
- 표지 타입
- 제본 방식
- 페이지 범위
- 가격 구조

---

## 핵심 개념

bookSpecUid는  
“책의 기준 타입”이다

→ 책 생성 시 반드시 지정  
→ 이후 템플릿 / 페이지 규칙 / 가격이 전부 여기서 결정됨

---

## 주요 판형

### A4 소프트커버

PHOTOBOOK_A4_SC

- 210 x 297 mm
- Softcover
- 24 ~ 130 페이지

특징:

→ 텍스트 많은 문서형

---

### A5 소프트커버

PHOTOBOOK_A5_SC

- 148 x 210 mm
- Softcover
- 50 ~ 200 페이지

특징:

→ 사진 많은 앨범

---

### 스퀘어 하드커버

SQUAREBOOK_HC

- 243 x 248 mm
- Hardcover
- 24 ~ 130 페이지

특징:

→ 고급 / 선물용

---

## 판형 조회

GET /v1/book-specs

---

### 특징

- 전체 판형 목록 조회
- accountUid 자동 적용
- 파트너별 가격 자동 반영

---

## 판형 상세 조회

GET /v1/book-specs/{bookSpecUid}

---

### 주요 필드

bookSpecUid  
→ 판형 ID

innerTrimWidthMm / innerTrimHeightMm  
→ 실제 책 크기

pageMin / pageMax  
→ 페이지 범위

pageIncrement  
→ 페이지 증가 단위 (보통 2)

coverType  
→ Softcover / Hardcover

bindingType  
→ 제본 방식 (PUR)

priceBase  
→ 기본 가격

pricePerIncrement  
→ 페이지 추가 비용

layoutSize  
→ 템플릿 작업 영역

---

## 가격 계산 구조

공식:

priceBase

- ((pageCount - pageMin) ÷ pageIncrement) × pricePerIncrement

---

### 예시

SQUAREBOOK_HC / 40페이지

기본: 19,800  
추가: (40 - 24) / 2 × 500 = 4,000

총: 23,800

---

### 중요

실제 주문 금액은:

POST /orders/estimate 사용

→ 배송비 / 포장비 포함됨

---

## 페이지 규칙 (매우 중요)

조건:

1. pageMin 이상
2. pageMax 이하
3. pageIncrement 단위

---

### 예시

가능:

24 / 26 / 28 / ...

불가능:

25 / 27

---

### 영향

이 규칙 안 맞으면:

→ finalization 실패

---

## 판형 선택 기준

### 일기 / 알림장

→ SQUAREBOOK_HC  
→ 적당한 페이지 + 레이아웃 다양

---

### 문서 / 포트폴리오

→ PHOTOBOOK_A4_SC  
→ A4 규격

---

### 사진 앨범

→ PHOTOBOOK_A5_SC  
→ 페이지 많음

---

### 선물용

→ SQUAREBOOK_HC  
→ 하드커버

---

## 개발 시 핵심 포인트

1. bookSpecUid 먼저 선택  
   → 모든 것의 시작점

2. 템플릿과 반드시 호환  
   → bookSpecUid 일치 필수

3. 페이지 규칙 항상 체크  
   → finalization 실패 방지

4. 가격은 참고용  
   → 실제는 estimate API 사용

---

## 전체 흐름에서 위치

1. bookSpec 선택
2. 책 생성
3. 템플릿 적용
4. 페이지 구성
5. finalization
6. 주문 생성

---

## 한 줄 요약

이 API는

“책의 물리 법칙을 정의하는 시스템”이다
