#!/bin/bash

# View Session Script - Utility to view session files in a readable format

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")}"
SESSIONS_DIR="${PLUGIN_ROOT}/sessions"

if [[ $# -eq 0 ]]; then
    echo "Available sessions:"
    ls -1t "$SESSIONS_DIR"/conversation-*.json 2>/dev/null | head -10 | sed 's/^/  /'
    echo ""
    echo "Usage: $0 <session-file>"
    echo "Example: $0 conversation-2024-01-01_10-00-00.json"
    exit 0
fi

SESSION_FILE="$1"

if [[ ! -f "$SESSIONS_DIR/$SESSION_FILE" ]]; then
    echo "Session file not found: $SESSIONS_DIR/$SESSION_FILE"
    exit 1
fi

# Use Python to pretty-print the session
python3 - << EOF "$SESSIONS_DIR/$SESSION_FILE"
import json
import sys
from datetime import datetime

def format_session(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        session = json.load(f)

    print(f"Session ID: {session.get('sessionId', 'N/A')}")
    print(f"Start Time: {session.get('startTime', 'N/A')}")
    print(f"End Time: {session.get('endTime', 'Still active')}")
    print()

    print(f"Total Prompts: {len(session.get('prompts', []))}")
    print(f"Total Responses: {len(session.get('responses', []))}")
    print()

    # Show prompts
    if session.get('prompts'):
        print("=== Prompts ===")
        for i, prompt in enumerate(session['prompts'], 1):
            timestamp = prompt.get('timestamp', '')
            text = prompt.get('text', '')
            print(f"\n{i}. [{timestamp}]")
            print(f"   {text[:100]}{'...' if len(text) > 100 else ''}")

    # Show responses
    if session.get('responses'):
        print("\n=== Responses ===")
        for i, response in enumerate(session['responses'], 1):
            timestamp = response.get('timestamp', '')
            rtype = response.get('type', 'assistant')

            if rtype == 'assistant':
                text = response.get('text', '')
                print(f"\n{i}. [{timestamp}] Assistant Response:")
                print(f"   {text[:100]}{'...' if len(text) > 100 else ''}")
            else:
                tool = response.get('toolName', 'Unknown')
                result = response.get('result', '')
                print(f"\n{i}. [{timestamp}] Tool Call: {tool}")
                print(f"   Result: {result[:100]}{'...' if len(result) > 100 else ''}")

if __name__ == "__main__":
    format_session(sys.argv[1])
EOF