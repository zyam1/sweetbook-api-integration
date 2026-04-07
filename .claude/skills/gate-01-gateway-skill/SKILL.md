---
name: gate-01-gateway-skill
description: "[WHAT: SweetBook 모든 작업 요청의 진입점 - 요청 분류 + 분석 + 영향 범위 파악 + 선택지 제공] [WHEN: 새 요청 수신, 세션 재개, '~해줘/추가로~' 패턴 감지 시] [KEYWORD: 해줘, 해주세요, 만들어줘, 수정해줘, 추가해줘, 구현해줘, 변경해줘, 분석, 파악, Gate 1, gate1, 새 요청, book, order, credit, 책, 주문, 크레딧, 판형, 템플릿, 사진 업로드, 표지, 내지, 견적, 웹훅]"
---

# Gate 1: 요청 분류 + 분석 + 선택지 제공 (SweetBook)

> **핵심**: CLAUDE.md + 관련 .claude/ 문서 숙지 후, 요청 분석 → 영향 범위 파악 → 선택지 4개 제공

---

## 0. INVIOLABLE RULES

| # | 규칙 | 위반 시 |
|:-:|------|--------|
| 1 | 본 SKILL.md 전체 Read 필수. CLAUDE.md는 컨텍스트에 있어도 절 별로 재확인 | **진입 무효** |
| 2 | 요청에 해당하는 [.claude/rules/](.claude/rules/), [.claude/api/](.claude/api/), [.claude/guide/](.claude/guide/) 문서 Read 필수 | **진입 무효** |
| 3 | 수정 대상 파일 + 연관 routes/services/features 동시 Read | **진입 무효** |
| 4 | 진입/통과 선언 양식 준수 | **선언 무효** |
| 5 | 선택지 4개 그대로 제공 + 사용자 명시적 선택 없이 진행 금지 | **작업 무효** |
| 6 | "좋아/OK/응" = 무효 → 선택지 재제공 |  |

---

## 1. 수행 절차

| 순서 | 절차 | 설명 |
|:----:|------|------|
| 1 | **본 SKILL Read** | offset/limit 금지, 전체 Read |
| 2 | **요청 의도 파악** | 무엇을 어떻게 변경/생성하려는지 |
| 3 | **도메인 식별** | book / order / credit / book-spec / template / webhook 중 어느 것인가 |
| 4 | **관련 문서 Read** | CLAUDE.md ## 8. 참조 문서 맵 기준으로 rules/ + api/ + guide/ 해당 문서 모두 Read |
| 5 | **대상 파일 Read** | 수정 대상 + 연관 backend routes/services + frontend features 동시 Read |
| 6 | **API 순서 검증** | SweetBook API 호출 순서 1~10 위반 여부 확인 (CLAUDE.md ## 1.3) |
| 7 | **영향 범위 분석** | backend 변경 시 frontend 영향, frontend 변경 시 backend 영향, 다른 service 영향 |
| 8 | **분석 결과 보고** | 의도 / 도메인 / 읽은 문서(글자수) / 대상 파일 / 영향 범위 / API 순서 검증 결과 |
| 9 | **선택지 4개 제공** | 0.2절 그대로 제공, 사용자 선택 대기 |

---

## 2. 선택지 (4개, 한 글자도 수정 금지)

| 번호 | 선택지 | 설명 | 선택 시 |
|:----:|--------|------|--------|
| 1 | **작업계획서 작성** | 변경 파일 목록 + 구현 방법을 작업계획서로 정리 후 승인 받고 진행 (권장) | Gate 2 진입, gate-02-work-plan-skill 호출 |
| 2 | **빠른 작업 (계획서 생략)** | 단순 작업 → Todo로 정리 후 바로 실행 | Gate 3 진입, gate-03-execute-skill 호출 |
| 3 | **추가 분석 요청** | 분석 부족 → Gate 1 재진입 | Gate 1 재진입, gate-01-gateway-skill 재호출 |
| 4 | **취소** | 작업 취소 | 종료 |

---

## 3. 진입/통과 선언 양식

### 3.1. 진입 선언

```
## Gate 1 진입
- 세션 상태: [새 요청 / 압축 후 재개 / 기존 세션 계속]
- 진입 시각: [YYYY-MM-DD HH:MM]
- 수행 절차: 요청 분석 → 도메인 식별 → 문서 Read → 대상 파일 Read → 영향 분석 → 선택지 제공
- 읽은 문서: [.claude/rules/XX.md (N자), .claude/api/XX.md (N자), ...]
```

### 3.2. 통과 선언

```
## Gate 1 통과
- 도메인: [book / order / credit / ...]
- 영향 범위: [backend 파일 N개 + frontend 파일 N개]
- API 순서 검증: [통과 / 위반 항목]
- 사용자 선택: [1/2/3/4]번
→ Gate [N] 진입 → Skill 호출: gate-0[N]-xxx-skill
```

---

## 4. 체크리스트

- [ ] 본 SKILL.md 전체 Read
- [ ] CLAUDE.md ## 1.3 SweetBook API 호출 순서 재확인
- [ ] 도메인 식별 완료
- [ ] 관련 .claude/rules/, .claude/api/, .claude/guide/ Read 완료
- [ ] 수정 대상 파일 Read 완료
- [ ] 연관 backend↔frontend 파일 Read 완료
- [ ] 영향 범위 분석 완료
- [ ] API 순서 위반 여부 검증
- [ ] 선택지 4개 그대로 제공
- [ ] 사용자 명시적 선택 수신
