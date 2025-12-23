#!/bin/bash

# End Session Hook
# This script handles session end events

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")}"

# Normalize Windows backslash paths to forward slashes (fixes hook execution issues)
PLUGIN_ROOT="${PLUGIN_ROOT//\\/\/}"

# End the current session
"$PLUGIN_ROOT/hooks/scripts/session-recorder.sh" end-session