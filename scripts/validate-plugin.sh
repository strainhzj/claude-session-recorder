#!/bin/bash

# Plugin Validation Script

PLUGIN_ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"
echo "Validating plugin at: $PLUGIN_ROOT"
echo ""

# Check required files
echo "=== Required Files ==="
if [[ -f "$PLUGIN_ROOT/.claude-plugin/plugin.json" ]]; then
    echo "✓ plugin.json exists"
else
    echo "✗ plugin.json missing"
fi

if [[ -f "$PLUGIN_ROOT/hooks/hooks.json" ]]; then
    echo "✓ hooks.json exists"
else
    echo "✗ hooks.json missing"
fi

echo ""
echo "=== Directory Structure ==="
if [[ -d "$PLUGIN_ROOT/commands" ]]; then
    echo "✓ commands/ directory exists"
    cmd_count=$(find "$PLUGIN_ROOT/commands" -name "*.md" | wc -l)
    echo "  - Found $cmd_count command files"
else
    echo "✗ commands/ directory missing"
fi

if [[ -d "$PLUGIN_ROOT/hooks/scripts" ]]; then
    echo "✓ hooks/scripts/ directory exists"
    script_count=$(find "$PLUGIN_ROOT/hooks/scripts" -name "*.sh" | wc -l)
    echo "  - Found $script_count script files"
else
    echo "✗ hooks/scripts/ directory missing"
fi

if [[ -d "$PLUGIN_ROOT/sessions" ]]; then
    echo "✓ sessions/ directory exists"
else
    echo "✗ sessions/ directory missing"
fi

echo ""
echo "=== File Permissions ==="
for script in "$PLUGIN_ROOT/hooks/scripts"/*.sh; do
    if [[ -f "$script" ]]; then
        if [[ -x "$script" ]]; then
            echo "✓ $(basename "$script") is executable"
        else
            echo "✗ $(basename "$script") is not executable"
        fi
    fi
done

echo ""
echo "=== JSON Validation ==="
if command -v jq >/dev/null 2>&1; then
    if jq empty "$PLUGIN_ROOT/.claude-plugin/plugin.json" 2>/dev/null; then
        echo "✓ plugin.json is valid JSON"
    else
        echo "✗ plugin.json has invalid JSON"
    fi

    if jq empty "$PLUGIN_ROOT/hooks/hooks.json" 2>/dev/null; then
        echo "✓ hooks.json is valid JSON"
    else
        echo "✗ hooks.json has invalid JSON"
    fi

    if jq empty "$PLUGIN_ROOT/config/recorder-config.json" 2>/dev/null; then
        echo "✓ recorder-config.json is valid JSON"
    else
        echo "✗ recorder-config.json has invalid JSON"
    fi
else
    echo "jq not available - skipping JSON validation"
fi

echo ""
echo "Validation complete!"