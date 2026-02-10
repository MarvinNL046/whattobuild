#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///
"""
PreToolUse Hook - Security & Validation
Blocks dangerous operations before Claude executes them.

Exit codes:
- 0: Allow tool execution
- 2: Block tool execution (error shown to Claude)
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime


DANGEROUS_COMMANDS = [
    r'\brm\s+.*-[a-z]*r[a-z]*f',
    r'\brm\s+.*-[a-z]*f[a-z]*r',
    r'\brm\s+--recursive\s+--force',
    r'\brm\s+--force\s+--recursive',
    r'\bchmod\s+777',
    r'\bsudo\s+rm',
    r'\bsudo\s+chmod',
    r'\bsudo\s+chown',
    r'\bDROP\s+DATABASE',
    r'\bDROP\s+TABLE',
    r'\bTRUNCATE\s+TABLE',
    r'\bgit\s+push\s+.*--force',
    r'\bgit\s+reset\s+--hard',
]

DANGEROUS_PATHS = [
    '/', '/etc', '/var', '/usr', '/bin', '/sbin', '/boot',
]

PROTECTED_FILES = [
    '.env', '.env.local', '.env.production',
    'credentials', 'secrets', '.ssh', 'id_rsa', 'id_ed25519',
]


def is_dangerous_command(command: str) -> tuple[bool, str]:
    normalized = ' '.join(command.lower().split())
    for pattern in DANGEROUS_COMMANDS:
        if re.search(pattern, normalized, re.IGNORECASE):
            return True, f"Dangerous command pattern detected: {pattern}"
    return False, ""


def is_dangerous_path(path: str) -> tuple[bool, str]:
    normalized = path.strip()
    for dangerous in DANGEROUS_PATHS:
        if normalized == dangerous or normalized.startswith(dangerous + '/'):
            return True, f"Access to protected path blocked: {dangerous}"
    return False, ""


def is_protected_file(path: str) -> tuple[bool, str]:
    filename = Path(path).name.lower()
    for protected in PROTECTED_FILES:
        if protected in filename:
            if any(x in filename for x in ['.sample', '.example', '.template']):
                continue
            return True, f"Access to sensitive file blocked: {protected}"
    return False, ""


def validate_bash_command(command: str) -> tuple[bool, str]:
    is_dangerous, reason = is_dangerous_command(command)
    if is_dangerous:
        return False, reason
    return True, ""


def validate_file_operation(tool_name: str, tool_input: dict) -> tuple[bool, str]:
    file_path = tool_input.get('file_path', '')
    if not file_path:
        return True, ""

    is_dangerous, reason = is_dangerous_path(file_path)
    if is_dangerous:
        return False, reason

    if tool_name in ['Write', 'Edit', 'MultiEdit']:
        is_protected, reason = is_protected_file(file_path)
        if is_protected:
            return False, reason

    return True, ""


def log_tool_use(input_data: dict):
    log_dir = Path.cwd() / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'pre_tool_use.json'

    if log_path.exists():
        try:
            with open(log_path, 'r') as f:
                log_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            log_data = []
    else:
        log_data = []

    input_data['_logged_at'] = datetime.now().isoformat()
    log_data.append(input_data)

    if len(log_data) > 1000:
        log_data = log_data[-1000:]

    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)


def main():
    try:
        input_data = json.load(sys.stdin)
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})

        log_tool_use(input_data)

        if tool_name == 'Bash':
            command = tool_input.get('command', '')
            is_valid, reason = validate_bash_command(command)
            if not is_valid:
                print(f"BLOCKED: {reason}", file=sys.stderr)
                sys.exit(2)

        elif tool_name in ['Read', 'Write', 'Edit', 'MultiEdit']:
            is_valid, reason = validate_file_operation(tool_name, tool_input)
            if not is_valid:
                print(f"BLOCKED: {reason}", file=sys.stderr)
                sys.exit(2)

        sys.exit(0)

    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
