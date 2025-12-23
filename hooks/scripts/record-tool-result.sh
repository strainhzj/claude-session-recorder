#!/bin/bash

# Record Tool Result Hook
# This script captures tool execution results from hook JSON input and records them
# Windows-compatible: uses pure bash without external dependencies

set -euo pipefail

# Get plugin root directory - Windows Git Bash compatible
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

# Normalize Windows backslash paths to forward slashes (fixes hook execution issues)
PLUGIN_ROOT="${PLUGIN_ROOT//\\/\/}"

# Read JSON from stdin
INPUT_JSON=$(cat)

# Extract JSON field value using pure bash
extract_field() {
    local json="$1"
    local field="$2"

    # Use awk to extract the field value
    # Handles JSON escape sequences
    echo "$json" | awk -v field="$field" '
    BEGIN { RS = "[{}],?"; found = 0; }
    {
        # Look for the specified field
        pattern = "\"" field "\"\\s*:\\s*\"(.*)\""
        if (match($0, pattern, arr)) {
            value = arr[1]

            # Unescape JSON escape sequences
            gsub(/\\n/, "\n", value)
            gsub(/\\r/, "\r", value)
            gsub(/\\t/, "\t", value)
            gsub(/\\"/, "\"", value)
            gsub(/\\\\/, "\\", value)
            gsub(/\\/, "", value)

            printf "%s", value
            found = 1
            exit
        }
    }
    END {
        if (!found) {
            print ""
        }
    }
    '
}

# Extract tool_name and tool_result
TOOL_NAME=$(extract_field "$INPUT_JSON" "tool_name")
TOOL_RESULT=$(extract_field "$INPUT_JSON" "tool_result")

# Record the tool result if we have both tool_name and result
if [[ -n "$TOOL_NAME" && -n "$TOOL_RESULT" ]]; then
    # Format the result for recording
    RESULT_TEXT="[Tool: $TOOL_NAME]
$TOOL_RESULT"

    "$PLUGIN_ROOT/hooks/scripts/session-recorder.sh" record-response "$RESULT_TEXT" 2>/dev/null || true
fi

# Exit successfully even if recording fails (dont block tool execution)
exit 0
