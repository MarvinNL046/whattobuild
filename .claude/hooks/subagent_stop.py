#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///
"""
SubagentStop Hook - Tracks when sub-agents complete.
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def log_subagent_stop(input_data: dict):
    log_dir = Path.cwd() / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'subagents.json'

    if log_path.exists():
        try:
            with open(log_path, 'r') as f:
                log_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            log_data = []
    else:
        log_data = []

    entry = {
        'event': 'subagent_stop',
        'timestamp': datetime.now().isoformat(),
        'session_id': input_data.get('session_id', 'unknown'),
        'subagent_id': input_data.get('subagent_id', 'unknown'),
        'result_preview': str(input_data.get('result', ''))[:200],
    }

    log_data.append(entry)

    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)


def main():
    try:
        input_data = json.load(sys.stdin)
        log_subagent_stop(input_data)
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
