# SweetBook Template (템플릿 선택) 가이드

## 개요

템플릿은 BookSpec에 맞는 표지 및 내지 디자인을 정의한다.  
템플릿에는 파라미터 구조가 포함되며, 이를 바인딩하여 콘텐츠를 구성한다.

---

## 템플릿 목록 조회

GET /templates

Query Parameters:

bookSpecUid (권장)

- 판형 기준 필터

templateKind (권장)

- cover (표지)
- content (내지)

category (선택)

- diary, album 등

limit, offset (선택)

- 페이지네이션

---

## 템플릿 종류

cover

- 표지 템플릿
- 책당 1회 적용
- API: POST /books/{bookUid}/cover

content

- 내지 템플릿
- 반복 적용 가능
- API: POST /books/{bookUid}/contents

주의:

- cover ↔ content 혼용 불가

---

## 템플릿 상세 조회

GET /templates/{templateUid}

포함 정보:

parameters

- 바인딩 정의

layout

- 요소 배치

layoutRules

- 여백, 흐름 규칙

baseLayer

- 배경 레이어

thumbnails

- 미리보기 이미지

---

## 파라미터 바인딩

템플릿 내부는 $$변수명$$ 형태로 참조됨

---

### 1. 텍스트 바인딩

{
"templateUid": "TEMPLATE_UID",
"parameters": {
"title": "제목",
"date": "2026"
}
}

---

### 2. 이미지 바인딩

{
"templateUid": "TEMPLATE_UID",
"parameters": {
"photo1": "uploaded_file.jpg"
}
}

---

### 3. 갤러리 바인딩

- 배열 형태로 전달
- 반드시 사전 업로드된 fileName 사용

{
"templateUid": "GALLERY_TEMPLATE_UID",
"parameters": {
"galleryPhotos": [
"photo1.jpg",
"photo2.jpg",
"photo3.jpg"
]
}
}

---

## 핵심 규칙

1. BookSpec 일치 필수

- 템플릿의 bookSpecUid와 책의 bookSpecUid 동일해야 함

2. templateKind 일치

- cover → cover API
- content → contents API

3. parameters 확인 필수

- 상세 조회 후 구조 파악

4. 파일 사용 규칙

- 이미지 바인딩은 업로드 후 fileName 사용

---

## 갤러리 템플릿

- 사진 개수에 따라 자동 레이아웃
- 여러 페이지 자동 분배
- 대량 사진 처리에 적합

---

## 컬럼 템플릿

- 텍스트 + 이미지 세로 배치
- 텍스트 길이에 따라 자동 조정
- 일기 / 알림장에 적합

---

## 선택 기준

- BookSpec 호환 여부
- templateKind 정확성
- 필요한 parameters 존재 여부
- category 기반 필터링 활용

---

## Claude Code 적용 목적

- 잘못된 템플릿 사용 방지
- 파라미터 누락 방지
- cover/content 혼동 방지
- 갤러리/반복 구조 자동 처리 유도
