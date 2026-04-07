#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SessionStart Hook - SweetBook 세션 시작/재개 시 필수 규칙 주입

[기능]
- source 분기:
  - startup     → 새 세션 시작 메시지 주입
  - compact     → 압축 후 Gate 1 재진입 메시지 주입
  - resume/clear→ Gate 1 재진입 메시지 주입
"""

import json
import sys
import os
from datetime import datetime

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
logger = HookLogger("SessionStart", HookLogger.auto_log_filename(__file__))


STARTUP_MESSAGE = """## 새 세션 시작 - SweetBook 필수 준수 사항 (위반 시 작업 무효)

1. 요청 분류 후 Gate Skill 호출 + 진입/통과 선언 필수 (CLAUDE.md ## 3. 작업 워크플로우 한 번 더 읽기)
2. 작업은 5.2절 매핑표에 따른 서브에이전트에 위임 (CLAUDE.md ## 5. 작업 수행 위임 규칙 한 번 더 읽기)
3. 모든 동작 전 CLAUDE.md ## 2. 핵심 원칙 무조건 준수 (CLAUDE.md ## 2. 핵심 원칙 한 번 더 읽기)
4. SweetBook API 호출 순서 1~10 절대 위반 금지 (CLAUDE.md ## 1.3)"""


RESUME_MESSAGE = """## CRITICAL: 세션 재개 - Gate 1 재진입 (위반 시 작업 무효)

### 필수 수행 절차 (순서 엄수)
1. [필수] Skill 도구로 gate-01-gateway-skill을 invoke하라
   - 텍스트로 "Gate 1 진입" 선언만 하면 안 됨. 반드시 Skill 도구 호출
   - Skill 호출 없이 다른 도구(Edit/Write/Agent) 사용 = 작업 무효
2. [필수] 진입 선언 출력:
   - 세션 상태: 압축 후 재개 / --resume / /clear 후
   - 재진입 Gate: 1
   - 진입 시각: (현재 시각)
   - 문서 읽기 증명: (읽은 .claude/ 문서 + 글자수)

### 절대 금지
- Skill 호출 전 Edit/Write/Agent 사용 금지
- "이전에 읽었다" "컨텍스트에 있다" 변명 금지
- 진입 선언 없이 작업 시작 금지"""


try:
    input_data = json.load(sys.stdin)
    logger.set_environment(input_data)
    logger.log_start()

    # 트리거 정보 기록
    trigger_info = {
        "hook": "SessionStart",
        "timestamp": datetime.now().isoformat(),
    }
    trigger_file_path = os.path.join(CLAUDE_HOOKS_DIR, ".last_hook_trigger.json")
    try:
        with open(trigger_file_path, 'w', encoding='utf-8') as f:
            json.dump(trigger_info, f, ensure_ascii=False)
    except Exception as e:
        logger.log(f"트리거 정보 기록 실패: {str(e)}")

    source = input_data.get("source", "unknown")
    logger.log(f"세션 source: {source}")

    if source == "startup":
        message = STARTUP_MESSAGE
    else:
        # compact / resume / clear / unknown → Gate 1 재진입 메시지
        message = RESUME_MESSAGE

    additional_context = remove_surrogates(message)

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context,
        },
    }

    try:
        json.dump(output, sys.stdout, ensure_ascii=False)
    except UnicodeEncodeError:
        logger.log("UTF-8 출력 실패, ASCII 모드 전환")
        json.dump(output, sys.stdout, ensure_ascii=True)

    logger.log(f"메시지 주입 완료: {len(additional_context)}자")
    logger.log_end()

except Exception as e:
    logger.log_error(e)
    sys.exit(0)

sys.exit(0)
