#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///
"""
PostToolUse Hook - Logging & Validation
Runs after Claude executes tools.
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def log_tool_result(input_data: dict):
    log_dir = Path.cwd() / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'post_tool_use.json'

    if log_path.exists():
        try:
            with open(log_path, 'r') as f:
                log_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            log_data = []
    else:
        log_data = []

    input_data['_logged_at'] = datetime.now().isoformat()

    tool_name = input_data.get('tool_name', 'unknown')
    tool_input = input_data.get('tool_input', {})

    if tool_name == 'Bash':
        input_data['_summary'] = f"Bash: {tool_input.get('command', '')[:100]}"
    elif tool_name in ['Read', 'Write', 'Edit', 'MultiEdit']:
        input_data['_summary'] = f"{tool_name}: {tool_input.get('file_path', '')}"
    elif tool_name == 'Grep':
        input_data['_summary'] = f"Grep: {tool_input.get('pattern', '')}"
    elif tool_name == 'Glob':
        input_data['_summary'] = f"Glob: {tool_input.get('pattern', '')}"
    else:
        input_data['_summary'] = f"{tool_name}"

    log_data.append(input_data)

    if len(log_data) > 1000:
        log_data = log_data[-1000:]

    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)


def main():
    try:
        input_data = json.load(sys.stdin)
        log_tool_result(input_data)
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
