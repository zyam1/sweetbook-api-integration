#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Common Hook Setting - SweetBook 프로젝트 로컬 경로 설정

[기능]
- 스크립트 __file__ 기반 프로젝트 루트/.claude 경로 동적 산출
- CLAUDE.md 경로 제공
- 외부 설정 파일 없이 동작 (단순화)
"""

import os

# 이 파일의 디렉토리: <project>/.claude/hooks/_Common
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))

# 훅 디렉토리: <project>/.claude/hooks
CLAUDE_HOOKS_DIR = os.path.dirname(_THIS_DIR)

# .claude 디렉토리: <project>/.claude
CLAUDE_DIR = os.path.dirname(CLAUDE_HOOKS_DIR)

# 프로젝트 루트: <project>
PROJECT_ROOT = os.path.dirname(CLAUDE_DIR)

# CLAUDE.md 경로 (프로젝트 루트)
CLAUDE_MD_PATH = os.path.join(PROJECT_ROOT, "CLAUDE.md")


def get_claude_md_path():
    """CLAUDE.md 경로 반환"""
    return CLAUDE_MD_PATH


def read_claude_md():
    """CLAUDE.md 파일을 읽어서 반환"""
    try:
        with open(CLAUDE_MD_PATH, 'r', encoding='utf-8') as f:
            return f.read()
    except (FileNotFoundError, OSError):
        return ""
