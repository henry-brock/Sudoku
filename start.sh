#!/usr/bin/env bash
# Starts a local server for the Sudoku app and opens it in the default browser.
set -euo pipefail

PORT="${1:-8765}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL="http://localhost:${PORT}"

cd "$DIR"

if command -v xdg-open >/dev/null 2>&1; then
  ( sleep 1 && xdg-open "$URL" >/dev/null 2>&1 & )
fi

echo "Serving Sudoku at $URL (Ctrl+C to stop)"
exec python3 -m http.server "$PORT"
