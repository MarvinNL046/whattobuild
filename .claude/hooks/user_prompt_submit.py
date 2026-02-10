#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///
"""
UserPromptSubmit Hook - Prompt Logging & Context Injection
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def log_prompt(session_id: str, prompt: str):
    log_dir = Path.cwd() / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / 'user_prompts.json'

    if log_path.exists():
        try:
            with open(log_path, 'r') as f:
                log_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            log_data = []
    else:
        log_data = []

    entry = {
        'timestamp': datetime.now().isoformat(),
        'session_id': session_id,
        'prompt': prompt[:500],
        'prompt_length': len(prompt),
    }

    log_data.append(entry)

    if len(log_data) > 500:
        log_data = log_data[-500:]

    with open(log_path, 'w') as f:
        json.dump(log_data, f, indent=2)


def get_context_injection() -> str:
    context_file = Path.cwd() / '.claude' / 'context.md'
    if context_file.exists():
        try:
            context = context_file.read_text()
            if context.strip():
                return f"[Project Context]\n{context}\n\n"
        except Exception:
            pass
    return ""


def main():
    try:
        input_data = json.load(sys.stdin)
        session_id = input_data.get('session_id', 'unknown')
        prompt = input_data.get('prompt', '')

        log_prompt(session_id, prompt)

        context = get_context_injection()
        if context:
            print(context)

        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
