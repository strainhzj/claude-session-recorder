#!/bin/bash

# Record User Prompt Hook
# This script captures user prompts from hook JSON input and records them
# Windows-compatible: uses pure bash without external dependencies

set -euo pipefail

# Get plugin root directory - Windows Git Bash compatible
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

# Normalize Windows backslash paths to forward slashes (fixes hook execution issues)
PLUGIN_ROOT="${PLUGIN_ROOT//\\/\/}"

# Read JSON from stdin
INPUT_JSON=$(cat)

# Extract user_prompt from JSON using pure bash (no jq dependency)
# This handles JSON-escaped strings and extracts the user_prompt field
extract_user_prompt() {
    local json="$1"

    # Find the user_prompt field and extract its value
    # Pattern: "user_prompt": "value"
    # We need to handle:
    # - JSON escape sequences (\n, \t, \", \\)
    # - Multi-line values (though uncommon for prompts)
    # - The field may appear anywhere in the JSON

    # Use awk to extract the user_prompt value more reliably
    echo "$json" | awk '
    BEGIN { RS = "[{}],?"; found = 0; }
    {
        # Look for user_prompt field
        if (match($0, /"user_prompt"\s*:\s*"(.*)"/, arr)) {
            # Extract the quoted value
            value = arr[1]

            # Unescape JSON escape sequences
            gsub(/\\n/, "\n", value)
            gsub(/\\r/, "\r", value)
            gsub(/\\t/, "\t", value)
            gsub(/\\"/, "\"", value)
            gsub(/\\\\/, "\\", value)
            gsub(/\\/, "", value)  # Remove any remaining backslashes

            printf "%s", value
            found = 1
            exit
        }
    }
    END {
        if (!found) {
            # If awk method failed, try simpler sed-based approach
            # This is a fallback for edge cases
        }
    }
    '
}

USER_PROMPT=$(extract_user_prompt "$INPUT_JSON")

# Record the prompt if not empty
if [[ -n "$USER_PROMPT" ]]; then
    "$PLUGIN_ROOT/hooks/scripts/session-recorder.sh" record-prompt "$USER_PROMPT" 2>/dev/null || true
fi

# Exit successfully even if recording fails (dont block user input)
exit 0