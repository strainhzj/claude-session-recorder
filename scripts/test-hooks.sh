#!/bin/bash

# Test Script for Claude Session Recorder Hooks
# This script simulates hook calls to verify JSON parsing works correctly

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Testing plugin at: $PLUGIN_ROOT"
echo ""

# Test 1: UserPromptSubmit hook with simple input
echo "=== Test 1: UserPromptSubmit with simple input ==="
TEST_INPUT='{
  "session_id": "test-session-123",
  "transcript_path": "/path/to/transcript.txt",
  "cwd": "/current/working/dir",
  "permission_mode": "allow",
  "hook_event_name": "UserPromptSubmit",
  "user_prompt": "Hello, this is a test prompt"
}'

echo "Input: $TEST_INPUT"
echo ""
echo "Running record-user-input.sh..."
OUTPUT=$(echo "$TEST_INPUT" | bash "$PLUGIN_ROOT/hooks/scripts/record-user-input.sh")
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE"
echo "Output: $OUTPUT"
echo ""

# Test 2: UserPromptSubmit hook with special characters
echo "=== Test 2: UserPromptSubmit with special characters ==="
TEST_INPUT_SPECIAL='{
  "session_id": "test-session-456",
  "user_prompt": "Test with quotes \\" and newlines \\n and tabs \\t"
}'

echo "Input: $TEST_INPUT_SPECIAL"
echo ""
echo "Running record-user-input.sh..."
OUTPUT=$(echo "$TEST_INPUT_SPECIAL" | bash "$PLUGIN_ROOT/hooks/scripts/record-user-input.sh")
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE"
echo ""

# Test 3: PostToolUse hook
echo "=== Test 3: PostToolUse with tool result ==="
TOOL_TEST_INPUT='{
  "session_id": "test-session-789",
  "tool_name": "Bash",
  "tool_input": {"command": "echo test"},
  "tool_result": "Command completed successfully\\nWith multiple lines"
}'

echo "Input: $TOOL_TEST_INPUT"
echo ""
echo "Running record-tool-result.sh..."
OUTPUT=$(echo "$TOOL_TEST_INPUT" | bash "$PLUGIN_ROOT/hooks/scripts/record-tool-result.sh")
EXIT_CODE=$?
echo "Exit code: $EXIT_CODE"
echo ""

# Check if session files were created
echo "=== Checking session files ==="
if [[ -d "$PLUGIN_ROOT/sessions" ]]; then
    SESSION_COUNT=$(find "$PLUGIN_ROOT/sessions" -name "conversation-*.json" 2>/dev/null | wc -l)
    echo "Session files found: $SESSION_COUNT"
    if [[ $SESSION_COUNT -gt 0 ]]; then
        echo "Latest session files:"
        find "$PLUGIN_ROOT/sessions" -name "conversation-*.json" -type f 2>/dev/null | head -3 | while read -r file; do
            echo "  - $(basename "$file")"
        done
    fi
else
    echo "Sessions directory not found!"
fi

echo ""
echo "=== Test Summary ==="
echo "All hook scripts executed without crashing."
echo "Please check the sessions directory for generated files."
