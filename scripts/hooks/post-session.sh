#!/bin/bash
# scripts/hooks/post-session.sh
# Run at the end of every AI Signal session.
# Mines new knowledge from .claude/, scripts/, lib/ into MemPalace.
# Usage: bash scripts/hooks/post-session.sh

set -e

MEMPALACE=/Users/surajpandita/Library/Python/3.9/bin/mempalace
PROJECT=/Users/surajpandita/Documents/projects/ai_signal
LENNY=/Users/surajpandita/lennys-podcast-transcripts/index

if ! command -v "$MEMPALACE" &>/dev/null; then
  echo "MemPalace not found at $MEMPALACE"
  echo "Install: python3 -m pip install mempalace"
  exit 1
fi

echo "── AI Signal Memory: Saving session ─────────────────────────"

echo "[1/3] Mining .claude/ → ai-signal wing"
"$MEMPALACE" mine "$PROJECT/.claude/" --wing ai-signal

echo "[2/3] Mining scripts/ + lib/ → ai-signal-code wing"
"$MEMPALACE" mine "$PROJECT/scripts/" --wing ai-signal-code
"$MEMPALACE" mine "$PROJECT/lib/" --wing ai-signal-code

# Only re-mine Lenny if the index exists (not always present on CI)
if [ -d "$LENNY" ]; then
  echo "[3/3] Mining Lenny index → lenny-index wing"
  "$MEMPALACE" mine "$LENNY" --wing lenny-index
else
  echo "[3/3] Skipping lenny-index (not found at $LENNY)"
fi

echo "─────────────────────────────────────────────────────────────"
echo "Session saved to memory."
