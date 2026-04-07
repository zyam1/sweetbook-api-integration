#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UserPromptSubmit Hook - SweetBook 최우선 필수 규칙 주입

[기능]
1. 매 요청마다 동적 헤더 생성 (타임스탬프 + 토큰)
2. SweetBook CLAUDE.md 핵심 절을 강조 형식으로 재주입
3. Gate Skill 호출 강제, 핵심원칙/매핑표/동기화 강조
"""

import json
import sys
import os
import uuid
from datetime import datetime

# 공통 모듈 경로
HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HOOK_DIR)
sys.path.insert(0, os.path.join(HOOK_DIR, "_Common"))

from common_hook_setting import CLAUDE_HOOKS_DIR
from common_hook_logger_utils import (
    HookLogger,
    setup_utf8_encoding,
    remove_surrogates,
)

setup_utf8_encoding()
logger = HookLogger("UserPromptSubmit", HookLogger.auto_log_filename(__file__))


# ============================================================
# SweetBook 전용 강제 규칙 섹션
# ============================================================

SECTION_ESSENTIAL_RULES = """<ESSENTIAL_RULES>
★★★ 모든 동작의 전제 조건 - 위반 시 작업 무효 ★★★
1. 요청 분류 후 Gate Skill 호출 + 진입 선언/통과 선언 필수 (CLAUDE.md ## 3. 작업 워크플로우 한 번 더 읽기)
2. 작업은 5.2절 매핑표에 따른 서브에이전트에 위임 (CLAUDE.md ## 5. 작업 수행 위임 규칙 한 번 더 읽기)
3. 모든 동작 전 CLAUDE.md ## 2. 핵심 원칙 무조건 준수 (CLAUDE.md ## 2. 핵심 원칙 한 번 더 읽기)
4. SweetBook API 호출 순서 1~10 절대 위반 금지 (CLAUDE.md ## 1.3 SweetBook API 호출 순서)
</ESSENTIAL_RULES>"""

SECTION_CORE_PRINCIPLE = """<CORE_PRINCIPLE>
★★★ 모든 행위(분석/사고/판단/작업/응답)의 대전제 = CLAUDE.md ## 2. 핵심 원칙. 위반 = 작업 무효 ★★★
■ 품질 기준 5가지 (우선순위): 이해 용이 > 일관성/안전성 > 가독성/간결함
■ 사전 파악 의무: 문서 숙지(.claude/) + 전체 파악(routes/services/features 동시) + 직접 확인(Read 필수, "이미 읽었다"=무효) + 연관 검토(backend↔frontend 영향)
■ 근거 기반: 추측 금지, API 파라미터/엔드포인트 추측 사용 금지, .claude/api/ 문서 확인 필수
■ 근거 확보 순서: 코드 직접 확인 → .claude/ 문서 → 웹 검색 → 사용자 확인
■ 금지 패턴: 직선적 사고 / 단순화 / 범위 초과 리팩토링 / 키 노출 / API 순서 위반 = 즉시 작업 무효
>>> 세부: CLAUDE.md ## 2. 핵심 원칙 (2.1~2.3) 무조건 절 별로 재확인 <<<
</CORE_PRINCIPLE>"""

SECTION_REQUEST_GATE = """<REQUEST_GATE>
★★★ 모든 요청은 유형 분류 후 Gate Skill 호출. 모호하면 무조건 Gate 1 ★★★
■ 정보성 질문(Read/검색만, 파일 수정 불필요) = Gate 불필요, 직접 답변
■ 작업 요청(파일 수정/생성) = Gate 1 필수
■ "~해줘/이것도~/추가로~" 패턴 = 새 요청 → Gate 1 재시작 (이전 승인 무효)
■ Gate 1: Skill(gate-01-gateway-skill) → 분석 + 영향 범위 + 선택지 4개
■ Gate 2: Skill(gate-02-work-plan-skill) → 작업계획서 + 명시적 승인
■ Gate 3: Skill(gate-03-execute-skill) → 코드 작성 + backend↔frontend 정합성
■ Gate 4: Skill(gate-04-verify-complete-skill) → 5단계 검증 + 동기화 확인 + 완료 보고
■ Gate 전환 = 해당 Gate Skill 호출 필수. 텍스트 선언만으로는 무효
■ 유효 승인: "1번/2번/승인/진행" / 무효: "좋아/OK/응" → 선택지 재제공
■ Gate 1/4 생략 절대 불가
>>> 세부: CLAUDE.md ## 3. 작업 워크플로우 + ## 4. 승인 규칙 무조건 재확인 <<<
</REQUEST_GATE>"""

SECTION_DELEGATION = """<DELEGATION>
★★★ 메인에이전트 직접 코드 작성 금지. 5.2절 매핑표에 따라 서브에이전트 위임 ★★★
■ 분석 → co-analysis (영향 범위/의존성/구조)
■ Backend route → be-code-route (backend/routes/*.js)
■ Backend service → be-code-service (backend/services/*.js, SDK 호출)
■ Backend middleware → be-code-middleware (backend/middleware/*.js)
■ Frontend feature → fe-code-feature (frontend/src/features/**)
■ Frontend 공통 컴포넌트 → fe-code-component (frontend/src/components/*)
■ Gate 4 검증 → co-review
■ Git 커밋 → co-infra-git
■ 매칭 우선순위: 파일 경로 패턴 > 키워드 > 폴백(be-code-service / fe-code-feature)
■ 복합 작업(backend+frontend): backend 에이전트 먼저 → frontend 에이전트
>>> 세부: CLAUDE.md ## 5. 작업 수행 위임 규칙 (5.2절 매핑표) 무조건 재확인 <<<
</DELEGATION>"""

SECTION_QUALITY_CHECK = """<QUALITY_CHECK>
■ 5단계 최종 검증 - 1개라도 미충족 시 응답 금지, 재검토 후 진행
  1. 구조 파악: 기존 코드 패턴/흐름 파악?
  2. 문서 확인: 관련 .claude/ 문서 Read?
  3. 안전성: API 키 노출/보안 문제 없음?
  4. 파급 영향: backend↔frontend, 다른 service 영향?
  5. API 순서: SweetBook API 호출 순서 준수?
>>> 세부: CLAUDE.md ## 2.3 최종 검증 (5단계) 무조건 재확인 <<<
</QUALITY_CHECK>"""

SECTION_SYNC = """<SYNC>
■ 파일 변경 후 동기화 미수행 = 해당 변경 무효
■ 유형 A: backend 수정 → 대응하는 frontend feature 확인
■ 유형 B: frontend 수정 → 대응하는 backend route/service 확인
■ 유형 C: 새 도메인 → backend(route+service) + frontend(feature) 동시 생성
■ 유형 D: API 엔드포인트 변경 → backend route + frontend API 호출부 + .claude/ 문서
■ Gate 4에서 동기화 완전성 확인 필수
>>> 세부: CLAUDE.md ## 7. 동기화 규칙 무조건 재확인 <<<
</SYNC>"""


def generate_dynamic_header():
    """동적 헤더 생성 - 매 요청마다 새 토큰"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    request_token = uuid.uuid4().hex[:8]

    header = f"""<PRIORITY_RULES ts="{timestamp}" token="{request_token}" violation="위반 = 작업 무효 / CLAUDE.md는 컨텍스트에 있어도 무조건 절 별로 재확인 / Gate Skill 호출 + 진입/통과 선언 필수">

{SECTION_ESSENTIAL_RULES}

{SECTION_CORE_PRINCIPLE}

{SECTION_REQUEST_GATE}

{SECTION_DELEGATION}

{SECTION_QUALITY_CHECK}

{SECTION_SYNC}

</PRIORITY_RULES>"""

    return header


try:
    input_data = json.load(sys.stdin)
    logger.set_environment(input_data)
    logger.log_start()

    # 트리거 정보 기록
    trigger_info = {
        "hook": "UserPromptSubmit",
        "timestamp": datetime.now().isoformat(),
    }
    trigger_file_path = os.path.join(CLAUDE_HOOKS_DIR, ".last_hook_trigger.json")
    try:
        with open(trigger_file_path, 'w', encoding='utf-8') as f:
            json.dump(trigger_info, f, ensure_ascii=False)
    except Exception as e:
        logger.log(f"트리거 정보 기록 실패: {str(e)}")

    prompt = input_data.get("prompt", "")
    if prompt:
        prompt = remove_surrogates(prompt)

    ai_context = generate_dynamic_header()
    ai_context = remove_surrogates(ai_context)

    system_message = (
        "CRITICAL: Gate Skill 호출 + 진입 선언 없이 작업 시작 = 전체 무효. "
        "ABSOLUTE: (1) 모든 행위 전 CLAUDE.md ## 2. 핵심 원칙 준수 "
        "(2) 요청 분류 후 정확한 Gate Skill 호출(CLAUDE.md ## 3 + ## 4) "
        "(3) 메인에이전트 직접 코드 작성 금지, 5.2절 매핑표 위임 필수 "
        "(4) 파일 변경 후 동기화 필수(CLAUDE.md ## 7) "
        "(5) SweetBook API 호출 순서 1~10 절대 위반 금지. 위반 = 작업 무효"
    )

    output = {
        "systemMessage": system_message,
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": ai_context,
        },
    }

    try:
        json.dump(output, sys.stdout, ensure_ascii=False)
    except UnicodeEncodeError:
        logger.log("UTF-8 출력 실패, ASCII 모드 전환")
        json.dump(output, sys.stdout, ensure_ascii=True)

    logger.log(f"프롬프트 {len(prompt)}자 / 컨텍스트 {len(ai_context)}자 주입 완료")
    logger.log_end()

except Exception as e:
    logger.log_error(e)
    sys.exit(0)

sys.exit(0)
