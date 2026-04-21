#!/bin/bash
# scripts/hooks/pre-session.sh
# Run at the start of every AI Signal session.
# Loads project memory context from MemPalace palace.
# Usage: bash scripts/hooks/pre-session.sh

set -e

MEMPALACE=/Users/surajpandita/Library/Python/3.9/bin/mempalace

if ! command -v "$MEMPALACE" &>/dev/null; then
  echo "MemPalace not found at $MEMPALACE"
  echo "Install: python3 -m pip install mempalace"
  exit 1
fi

echo "── AI Signal Memory: Wake-up ────────────────────────────────"
"$MEMPALACE" wake-up --wing ai-signal
echo "─────────────────────────────────────────────────────────────"
echo "Memory loaded. Context ready."
echo ""
echo "Quick search commands:"
echo "  $MEMPALACE search \"[topic]\" --wing ai-signal"
echo "  $MEMPALACE search \"[topic]\" --wing lenny-index"
echo "  $MEMPALACE search \"[topic]\" --wing ai-signal-code"
