# Templates API

템플릿 조회 및 적용 API

이 API는  
“디자인 템플릿 + 데이터 바인딩” 방식으로  
포토북 페이지를 생성하는 시스템이다.

---

## 템플릿 개념

템플릿은 페이지 레이아웃을 정의하는 구조이다.

포함 요소:

- 텍스트 위치
- 이미지 위치
- 스타일
- 레이아웃 규칙

개발자는:

→ 템플릿 + 데이터(parameters)를 넣으면  
→ 완성된 페이지가 생성된다

---

## 템플릿 종류

cover  
→ 표지 (책당 1개)

content  
→ 내지 (여러 개 추가 가능)

---

### 중요한 규칙

- cover는 표지 API에서만 사용
- content는 내지 API에서만 사용
- 서로 혼용 불가

---

## 카테고리

템플릿은 용도별로 분류됨

예:

diary (일기)  
album (앨범)  
wedding (웨딩)  
baby (육아)  
travel (여행)

---

## 템플릿 목록 조회

GET /v1/templates

---

### 필터

bookSpecUid  
→ 책 사이즈 (필수급 중요)

templateKind  
→ cover / content

category  
→ 템플릿 용도

templateName  
→ 검색 (AND 조건)

theme  
→ 디자인 스타일

---

### 응답 핵심

templateUid  
templateName  
templateKind  
category  
bookSpecUid

---

## 템플릿 상세 조회

GET /v1/templates/{templateUid}

---

### 핵심 필드

parameters  
→ 입력해야 하는 데이터 정의

layout  
→ 실제 배치 구조

layoutRules  
→ 여백 / 흐름 규칙

baseLayer  
→ 배경 (짝수/홀수)

---

## 가장 중요한 개념: parameters

템플릿은 “입력값 정의”를 가지고 있음

구조:

parameters.definitions.{key}

---

### 예시

bookTitle  
→ 텍스트

frontPhoto  
→ 이미지

photos  
→ 여러 이미지

---

### binding 종류

text  
→ 문자열

file  
→ 이미지 URL 또는 업로드 파일

gallery  
→ 이미지 배열

---

## 파라미터 전달 규칙

text

"bookTitle": "우리 가족 앨범"

file

"frontPhoto": "https://..."

gallery

"photos": ["photo1.jpg", "photo2.jpg"]

---

### 중요

gallery 사용 시:

→ 먼저 사진 업로드 필요

POST /books/{bookUid}/photos

→ 반환된 fileName 사용

---

## 템플릿 선택 기준

### 1. bookSpecUid 일치

→ 책 사이즈 다르면 적용 불가

---

### 2. templateKind 확인

→ cover / content 맞게 사용

---

### 3. parameters 확인

→ 어떤 값 넣어야 하는지 반드시 체크

---

## 전체 흐름 (진짜 중요)

1. 책 생성  
   POST /books

2. 사진 업로드 (선택)  
   POST /books/{bookUid}/photos

3. 표지 적용  
   POST /books/{bookUid}/cover

4. 내지 추가 (여러 번 반복)  
   POST /books/{bookUid}/contents

5. 최종화  
   POST /books/{bookUid}/finalization

---

## 표지 적용

POST /books/{bookUid}/cover

구성:

- templateUid
- parameters

---

## 내지 추가

POST /books/{bookUid}/contents

특징:

- 여러 번 호출 가능
- 페이지 계속 추가됨
- 템플릿 매번 바꿔도 됨

---

## 개발 시 핵심 포인트

1. 템플릿 = UI 구조  
   → 프론트에서 직접 그리는 게 아님

2. parameters = 데이터 바인딩  
   → API가 렌더링 담당

3. gallery는 반드시 업로드 선행

4. 템플릿 상세 조회는 필수  
   → parameters 안 보고 쓰면 100% 실패

5. 순서 중요  
   → cover → contents → finalization

---

## 한 줄 요약

이 API는

“디자인을 JSON으로 조립하는 시스템”이다
