#!/bin/bash

# Claude Session Recorder Script
# This script manages recording of Claude Code CLI sessions
# Uses pure bash without external dependencies

set -euo pipefail

# Plugin root directory
# Script is in: plugin-root/hooks/scripts/session-recorder.sh
# So we need to go up 2 levels to reach plugin-root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
SESSIONS_DIR="${PLUGIN_ROOT}/sessions"
CONFIG_FILE="${PLUGIN_ROOT}/config/recorder-config.json"
STATE_FILE="${PLUGIN_ROOT}/config/.current-session"

# Ensure directories exist
mkdir -p "$SESSIONS_DIR"
mkdir -p "$(dirname "$CONFIG_FILE")"

# Simple JSON escape function
json_escape() {
    local text="$1"
    # Escape backslashes, quotes, and newlines
    text="${text//\\/\\\\}"
    text="${text//\"/\\\"}"
    text="${text//$'\n'/\\n}"
    text="${text//$'\r'/\\r}"
    text="${text//$'\t'/\\t}"
    printf '%s' "$text"
}

# Get current session file
get_session_file() {
    # Check state file first
    if [[ -f "$STATE_FILE" ]]; then
        local session_file
        session_file=$(cat "$STATE_FILE" 2>/dev/null || echo "")
        if [[ -n "$session_file" && -f "$session_file" ]]; then
            echo "$session_file"
            return 0
        fi
    fi

    # Create new session file
    local timestamp
    timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
    local session_file="${SESSIONS_DIR}/conversation-${timestamp}.json"

    # Initialize session file with proper JSON
    local start_time
    start_time=$(date -Iseconds 2>/dev/null || date)

    cat > "$session_file" << SESSIONEOF
{
  "sessionId": "${timestamp}",
  "startTime": "${start_time}",
  "endTime": null,
  "prompts": [],
  "responses": []
}
SESSIONEOF

    # Save session file to state
    echo "$session_file" > "$STATE_FILE"

    echo "$session_file"
}

# Record user prompt
record_prompt() {
    local prompt_text="$1"
    local session_file
    session_file=$(get_session_file)

    local timestamp
    timestamp=$(date -Iseconds 2>/dev/null || date)

    # Escape the prompt text for JSON
    local escaped_text
    escaped_text=$(json_escape "$prompt_text")

    # Read current file
    local content
    content=$(cat "$session_file")

    # Use sed to insert the new prompt before the closing prompts bracket
    # This is a simplified approach - for production, consider using a proper JSON library
    local new_prompt="    {\"timestamp\": \"${timestamp}\", \"text\": \"${escaped_text}\"}"

    # Insert before "]," that closes prompts array
    local new_content
    new_content=$(echo "$content" | sed 's/\("prompts": \[\)/\1\n'"$new_prompt"'/')

    echo "$new_content" > "$session_file"

    echo "Prompt recorded to $(basename "$session_file")"
}

# Record assistant response
record_response() {
    local response_text="$1"
    local session_file
    session_file=$(get_session_file)

    local timestamp
    timestamp=$(date -Iseconds 2>/dev/null || date)

    # Escape the response text for JSON
    local escaped_text
    escaped_text=$(json_escape "$response_text")

    # Read current file
    local content
    content=$(cat "$session_file")

    # Use sed to insert the new response
    local new_response="    {\"type\": \"assistant\", \"text\": \"${escaped_text}\", \"timestamp\": \"${timestamp}\"}"

    # Insert before "]," that closes responses array
    local new_content
    new_content=$(echo "$content" | sed 's/\("responses": \[\)/\1\n'"$new_response"'/')

    echo "$new_content" > "$session_file"
}

# End current session
end_session() {
    local session_file
    session_file=$(get_session_file)

    # Update end time
    local endtime
    endtime=$(date -Iseconds 2>/dev/null || date)

    # Update endTime in JSON using sed
    local content
    content=$(cat "$session_file")
    local new_content
    new_content=$(echo "$content" | sed "s/\"endTime\": null/\"endTime\": \"${endtime}\"/")

    echo "$new_content" > "$session_file"

    echo "Session ended: $(basename "$session_file")"

    # Remove state file
    rm -f "$STATE_FILE"
}

# Main command handler
case "${1:-}" in
    record-prompt)
        shift
        record_prompt "$*"
        ;;
    record-response)
        shift
        record_response "$*"
        ;;
    end-session)
        end_session
        ;;
    get-session-file)
        get_session_file
        ;;
    *)
        echo "Usage: $0 {record-prompt|record-response|end-session|get-session-file}"
        exit 1
        ;;
esac
