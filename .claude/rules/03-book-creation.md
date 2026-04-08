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

## 6. 최종화 (Finalization)

### 엔드포인트

POST /v1/books/{bookUid}/finalization

- 권한: `book:write`
- 요청 본문 없음 (경로 파라미터만 사용)
- Authorization: `Bearer YOUR_API_KEY`

### 요청 예시

```bash
curl -X POST 'https://api-sandbox.sweetbook.com/v1/books/bk_a1b2c3d4e5f6/finalization' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### 응답 예시 (신규 최종화)

```json
{
  "success": true,
  "data": {
    "result": "created",
    "pageCount": 24,
    "finalizedAt": "2025-01-05T15:00:00Z"
  },
  "message": "책 최종화 완료"
}
```

### 응답 예시 (이미 최종화됨 — 멱등)

```json
{
  "success": true,
  "data": {
    "result": "updated",
    "pageCount": 24,
    "finalizedAt": "2025-01-05T15:00:00Z"
  },
  "message": "이미 최종화된 책입니다"
}
```

### 전제 조건

1. **DRAFT 상태만 허용**
   - DRAFT 상태인 책만 최종화 가능
   - 이미 FINALIZED인 경우 멱등 처리로 200 OK 반환 (에러 아님)

2. **표지 + 내지 존재 필수**
   - 표지(`POST /books/{id}/cover`)와 내지(`POST /books/{id}/contents`)가 모두 추가되어 있어야 함

3. **페이지 수 검증** — 실제 pageCount가 판형(BookSpec) 규칙을 만족해야 함

### 페이지 수 검증 규칙

| 규칙 | 조건 | 에러 메시지 |
|------|------|------------|
| 최소 페이지 | `actualPageCount >= pageMin` | 최소 페이지 미달: 현재 Xp, 최소 Yp |
| 최대 페이지 | `actualPageCount <= pageMax` | 페이지 초과: 현재 Xp, 최대 Yp |
| 증분 규칙 | `(actualPageCount - pageMin) % pageIncrement === 0` | 페이지 수가 증분 규칙에 맞지 않음 |

### 검증 예시 (pageMin=20, pageMax=120, pageIncrement=2)

| 페이지 | 판정 | 사유 |
|:------:|:----:|------|
| 20p | 통과 | 최소값 |
| 22p | 통과 | 증분 규칙 만족 |
| 21p | 실패 | 증분 규칙 위반 (홀수) |
| 18p | 실패 | 최소 미달 |
| 122p | 실패 | 최대 초과 |

### 최종화 이후

- 책 상태: `DRAFT → FINALIZED`
- 더 이상 표지/내지 추가, 사진 업로드 불가
- 주문 생성(`POST /orders`) 가능
- **멱등 처리**: 이미 FINALIZED된 책에 재요청 시 200 OK 반환 (에러 아님)

### 사전 검증 권장 패턴 (400 예방)

finalize 호출 전 다음 순서로 검증:

```js
// 1. 책 현재 상태 + pageCount 조회
const book = await client.books.get(bookUid);

// 2. bookSpec 조회
const spec = await client.books._get(`/book-specs/${book.bookSpecUid}`);

// 3. 검증
const pc = book.pageCount;
if (pc < spec.pageMin) throw new Error(`INSUFFICIENT_PAGES: ${pc}/${spec.pageMin}`);
if (pc > spec.pageMax) throw new Error(`TOO_MANY_PAGES: ${pc}/${spec.pageMax}`);
if ((pc - spec.pageMin) % spec.pageIncrement !== 0) {
  throw new Error(`PAGE_INCREMENT_VIOLATION: ${pc}`);
}

// 4. 통과 시 finalize
await client.books.finalize(bookUid);
```

---

## 상태 흐름

DRAFT → FINALIZED

- DRAFT: 편집 가능 (표지/내지/사진 추가)
- FINALIZED: 편집 불가, 주문 가능

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
