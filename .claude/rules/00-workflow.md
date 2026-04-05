# SweetBook API Integration Workflow

## 개요

이 프로젝트는 SweetBook API를 사용하여 포토북 생성 및 주문 흐름을 처리한다.  
전체 프로세스는 “책 생성 → 콘텐츠 구성 → 주문”의 순차적인 API 호출 구조를 따른다.

---

## 전체 워크플로우

1. 판형 선택
2. 템플릿 선택
3. 책 생성 (draft)
4. 사진 업로드
5. 표지 설정
6. 내지 추가 (반복)
7. 최종화
8. 견적 조회
9. 주문 생성
10. 웹훅 수신

---

## 단계별 API 매핑

1. GET /book-specs  
   → 판형 목록 조회

2. GET /templates  
   → 템플릿 목록 조회

3. POST /books  
   → 책 생성 (draft 상태)

4. POST /books/{bookUid}/photos  
   → 사진 업로드

5. POST /books/{bookUid}/cover  
   → 표지 설정

6. POST /books/{bookUid}/contents  
   → 내지 추가 (반복 호출)

7. POST /books/{bookUid}/finalization  
   → 책 최종화

8. POST /orders/estimate  
   → 견적 조회

9. POST /orders  
   → 주문 생성

10. Webhook  
    → 주문 상태 수신

---

## 핵심 규칙

1. API 호출 순서 필수 준수

- 순서를 건너뛰면 안 됨
- finalization 이전 주문 금지

2. 반복 처리

- contents는 페이지 수만큼 반복 호출

3. 캐싱

- book-specs, templates는 캐싱 권장

4. 상태 흐름

- books 생성 시 draft 상태
- finalization 이후만 주문 가능

5. 주문 흐름

- estimate → orders 순서 필수

---

## 시나리오 A (사용자 선택형)

사용자가 직접 포토북을 구성하는 방식

Flow:
판형 선택 → 템플릿 선택 → 사진 업로드 → 콘텐츠 구성 → 주문

특징:

- UI 중심
- 템플릿/판형 캐싱 필요

---

## 시나리오 B (서버 자동 생성형)

서버가 데이터를 기반으로 자동 생성

Flow:
데이터 조회 → 자동 책 생성 → 자동 콘텐츠 구성 → 견적 → 주문

특징:

- templateUid + 파라미터 사전 정의 필요
- 반복 로직 서버에서 처리

---

## 서버 역할

- API 호출 순서 제어
- templateUid 매핑 관리
- 콘텐츠 데이터 변환
- 반복 호출 처리
- 주문 흐름 제어

---

## 구현 주의사항

- contents 단계 데이터 정합성 중요
- finalization 시 페이지 검증 발생
- API 실패 시 재시도 필요
- webhook으로 주문 상태 동기화

---

## 목적

이 문서는 다음을 보장하기 위한 규칙이다:

- API 호출 순서 오류 방지
- 반복 처리 구조 명확화
- 서버/클라이언트 역할 분리
- 잘못된 주문 흐름 방지
