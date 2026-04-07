#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Common Hook Logger Utilities - 모든 훅에서 공통으로 사용하는 로깅 유틸리티

[주요 기능]
1. 환경 정보 수집 (호스트명, 세션ID, PID, 권한모드)
2. 통일된 로그 포맷 함수
3. 구분선 출력 함수
4. Windows UTF-8 인코딩 설정

[의존성]
- common_hook_setting.py: 경로 및 환경설정 메서드
"""

import os
import sys
import io
import socket
import re
import time
from datetime import datetime

# 플랫폼별 파일 잠금 모듈
if sys.platform == 'win32':
    import msvcrt  # Windows 파일 잠금용
else:
    import fcntl  # Unix/macOS 파일 잠금용

# 환경설정 메서드에서 경로 import
from common_hook_setting import CLAUDE_HOOKS_DIR

# Windows에서 UTF-8 출력을 보장하기 위한 설정
def setup_utf8_encoding():
    """Windows 환경에서 UTF-8 인코딩 설정"""
    if sys.platform == 'win32':
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def remove_surrogates(text):
    """Surrogate 문자를 제거하거나 대체하는 함수"""
    surrogate_pattern = re.compile(r'[\uD800-\uDFFF]')
    return surrogate_pattern.sub('\ufffd', text)

def get_timestamp():
    """현재 시간을 포맷된 문자열로 반환"""
    return datetime.now().strftime("%Y.%m.%d. %H:%M:%S.%f")

def get_environment_info(input_data):
    """환경 정보 수집 (D 옵션: 호스트명 + 세션ID + PID + 권한모드)"""
    return {
        "hostname": socket.gethostname(),
        "session_id": input_data.get("session_id", "N/A"),
        "pid": os.getpid(),
        "permission_mode": input_data.get("permission_mode", "N/A"),
        "cwd": input_data.get("cwd", os.getcwd()),
        "transcript_path": input_data.get("transcript_path", "N/A")
    }

def format_env_info(env_info):
    """환경 정보를 한 줄 문자열로 포맷"""
    return f"호스트: {env_info['hostname']} | 세션: {env_info['session_id']} | PID: {env_info['pid']} | 모드: {env_info['permission_mode']}"

def get_separator(char="=", length=80):
    """구분선 생성 (기본 80자)"""
    return char * length

def get_sub_separator(char="-", length=80):
    """하위 구분선 생성 (호환성 유지용, 기본 80자)"""
    return char * length

class HookLogger:
    """훅 로깅을 위한 클래스"""

    # 로그 파일 최대 크기 (2MB)
    MAX_LOG_SIZE_BYTES = 2 * 1024 * 1024

    @staticmethod
    def auto_log_filename(file_path):
        """파일 경로에서 로그 파일명 자동 생성.
        예: 'pretooluse-auto-approve-optimizer.py' → 'pretooluse-auto-approve-optimizer-log.txt'
        예: 'common_gate_machine.py' → 'common_gate_machine-log.txt'
        """
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        return base_name + "-log.txt"

    def __init__(self, hook_name, log_filename, log_dir=None):
        """
        Args:
            hook_name: 훅 이름 (예: "UserPromptSubmit", "PreToolUse")
            log_filename: 로그 파일명 (예: "userpromptsubmit-log.txt")
            log_dir: 로그 파일 저장 디렉토리 (None이면 CLAUDE_HOOKS_DIR 사용)
        """
        self.hook_name = hook_name
        if log_dir:
            self.log_file = os.path.join(log_dir, log_filename)
        else:
            self.log_file = os.path.join(CLAUDE_HOOKS_DIR, log_filename)
        self.env_info = None
        self._buffer = []  # 로그 버퍼 (훅 종료 시 한 번에 flush)
        self._ensure_log_file()

    def _ensure_log_file(self):
        """로그 파일이 없거나 5MB 초과 시 초기화"""
        should_reset = False
        
        if not os.path.exists(self.log_file):
            should_reset = True
        elif os.path.getsize(self.log_file) > self.MAX_LOG_SIZE_BYTES:
            should_reset = True
        
        if should_reset:
            with open(self.log_file, "w", encoding="utf-8") as f:
                f.write(f"=== {self.hook_name} Hook Log ===\n")

    def set_environment(self, input_data):
        """환경 정보 설정"""
        self.env_info = get_environment_info(input_data)

    def _write(self, message):
        """타임아웃 적용 로그 쓰기 (100ms 초과 시 포기) - 새 로그를 파일 맨 앞에 추가
        
        버그 수정 (2025-12-20): 잠금 파일을 별도로 사용하여 잠금 실패 시 기존 내용 손실 방지
        - 기존: "w" 모드로 열면 파일이 즉시 비워짐 → 잠금 실패 시 빈 파일 남음
        - 수정: 잠금 파일로 먼저 잠금 획득 → 성공 시에만 파일 덮어쓰기
        """
        timeout_ms = 100
        start = time.time()
        lock_file_path = self.log_file + ".lock"

        try:
            # 1. 잠금 파일로 먼저 잠금 획득 (파일 내용 손실 방지)
            if sys.platform == 'win32':
                # 잠금 파일 생성/열기
                lock_fd = os.open(lock_file_path, os.O_CREAT | os.O_RDWR)
                try:
                    # 타임아웃까지 잠금 시도 (10ms 간격으로 재시도)
                    while True:
                        try:
                            msvcrt.locking(lock_fd, msvcrt.LK_NBLCK, 1)
                            break  # 잠금 성공
                        except (IOError, OSError):
                            elapsed = (time.time() - start) * 1000
                            if elapsed > timeout_ms:
                                os.close(lock_fd)
                                self._log_timeout_failure(message, elapsed)
                                return
                            time.sleep(0.01)  # 10ms 대기 후 재시도

                    # 2. 잠금 성공 → 기존 내용 읽기 + 새 내용 쓰기
                    existing_content = ""
                    if os.path.exists(self.log_file):
                        with open(self.log_file, "r", encoding="utf-8") as f:
                            existing_content = f.read()

                    with open(self.log_file, "w", encoding="utf-8") as f:
                        f.write(message + "\n" + existing_content)
                        f.flush()

                    # 3. 잠금 해제
                    try:
                        msvcrt.locking(lock_fd, msvcrt.LK_UNLCK, 1)
                    except:
                        pass
                finally:
                    os.close(lock_fd)
            else:
                # 비Windows: 잠금 없이 바로 쓰기
                existing_content = ""
                if os.path.exists(self.log_file):
                    with open(self.log_file, "r", encoding="utf-8") as f:
                        existing_content = f.read()

                with open(self.log_file, "w", encoding="utf-8") as f:
                    f.write(message + "\n" + existing_content)
                    f.flush()

        except Exception as e:
            self._log_timeout_failure(message, 0, str(e))

    def _log_timeout_failure(self, message, elapsed_ms, error=None):
        """타임아웃/실패 시 별도 파일에 기록"""
        fail_log = self.log_file.replace(".txt", "-failed.txt")
        try:
            with open(fail_log, "a", encoding="utf-8") as f:
                timestamp = datetime.now().strftime("%Y.%m.%d. %H:%M:%S.%f")
                if error:
                    f.write(f"[{timestamp}] ERROR: {error} | {message}\n")
                else:
                    f.write(f"[{timestamp}] TIMEOUT({elapsed_ms:.0f}ms): {message}\n")
        except:
            pass  # 실패 로그도 안되면 포기

    def flush(self):
        """버퍼 내용을 시간순으로 합쳐서 파일 맨 앞에 prepend"""
        if not self._buffer:
            return

        # 버퍼 내용을 시간순(정순)으로 합치기
        block_content = "\n".join(self._buffer)
        self._buffer = []  # 버퍼 초기화

        # 블록 전체를 파일 맨 앞에 prepend
        self._write(block_content)

    def log_start(self):
        """훅 시작 로그 - 간결한 형식 (구분선 + 시작정보 한 줄)"""
        self._buffer = []  # 새 훅 시작 시 버퍼 초기화
        self._buffer.append(get_separator())
        # 타임스탬프 + 훅 시작 + 환경 정보를 한 줄에 출력
        env_str = ""
        if self.env_info:
            env_str = f" {format_env_info(self.env_info)}"
        self._buffer.append(f"[{get_timestamp()}] === {self.hook_name} 훅 시작 ==={env_str}")

    def log_end(self):
        """훅 종료 로그 - 간결한 형식 (종료 메시지 + 구분선 + 빈 줄 2개)"""
        self._buffer.append(f"[{get_timestamp()}] === {self.hook_name} 훅 종료 ===")
        self._buffer.append(get_separator())
        # 다음 로그 블록과 구분을 위해 빈 줄 2개 추가
        self._buffer.append("")
        self._buffer.append("")
        # 버퍼 내용을 파일에 flush
        self.flush()

    def log(self, *args):
        """일반 로그 메시지 - 버퍼에 추가 (가변 인자 지원)"""
        message = " ".join(str(a) for a in args)
        self._buffer.append(f"[{get_timestamp()}] {message}")

    def log_field(self, field_name, value):
        """필드-값 형태의 로그 - 버퍼에 추가"""
        self._buffer.append(f"{field_name}: {value}")

    def log_error(self, error):
        """에러 로그 - 버퍼에 추가"""
        self._buffer.append(f"[{get_timestamp()}] 오류: {type(error).__name__}: {str(error)}")
        import traceback
        self._buffer.append(f"트레이스백:\n{traceback.format_exc()}")
