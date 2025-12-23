#!/bin/bash
#
# Universal hook wrapper - safely reads CLAUDE_PLUGIN_ROOT from environment
# This avoids path escaping issues when passing paths via command line
#

set -euo pipefail

# Get script directory (works in Git Bash, WSL, and native bash)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

# Normalize Windows backslash paths to forward slashes
PLUGIN_ROOT="${PLUGIN_ROOT//\\/\/}"

# Get the target script name from first argument
TARGET_SCRIPT="$1"
shift

# Execute the target script with full path
exec "$PLUGIN_ROOT/hooks/scripts/$TARGET_SCRIPT" "$@"
