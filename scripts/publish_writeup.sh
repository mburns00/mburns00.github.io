#!/usr/bin/env bash
# Convert a completed report (from completed/) into a Jekyll write-up in _writeups/
# Usage: ./scripts/publish_writeup.sh completed/BoxName/report.md
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-completed-report.md>"
  exit 1
fi

REPORT="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WRITEUPS_DIR="${REPO_ROOT}/_writeups"

if [ ! -f "$REPORT" ]; then
  echo "Error: File not found: $REPORT"
  exit 1
fi

# Extract metadata from the report's header table
extract_field() {
  grep -i "| \*\*$1\*\*" "$REPORT" | sed 's/.*| *//' | sed 's/ *|$//' | tail -1
}

BOX_NAME=$(extract_field "Box")
OS=$(extract_field "OS")
DIFFICULTY=$(extract_field "Difficulty")
DATE=$(extract_field "Date")
USER_FLAG_STATUS=$(extract_field "User Flag")
ROOT_FLAG_STATUS=$(extract_field "Root Flag")

# Defaults
[ -z "$BOX_NAME" ] && BOX_NAME=$(basename "$(dirname "$REPORT")")
[ -z "$DATE" ] && DATE=$(date +%Y-%m-%d)
[ -z "$OS" ] && OS="Linux"
[ -z "$DIFFICULTY" ] && DIFFICULTY="Medium"

# Determine flags
USER_FLAG=false
ROOT_FLAG=false
[[ "$USER_FLAG_STATUS" =~ [Oo]btained|[Yy]es|true|✓ ]] && USER_FLAG=true
[[ "$ROOT_FLAG_STATUS" =~ [Oo]btained|[Yy]es|true|✓ ]] && ROOT_FLAG=true

STATUS="failed"
$ROOT_FLAG && STATUS="rooted"
! $ROOT_FLAG && $USER_FLAG && STATUS="user-only"

SLUG=$(echo "$BOX_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
OUTPUT="${WRITEUPS_DIR}/${DATE}-${SLUG}.md"

# Extract tools from "## Tools Used" section
TOOLS_LINE=$(sed -n '/^## Tools Used/,/^---/p' "$REPORT" | grep -v '^##' | grep -v '^---' | tr '\n' ' ' | sed 's/^[[:space:]]*//')

# Build tools YAML array
TOOLS_YAML="[nmap]"
if [ -n "$TOOLS_LINE" ]; then
  # Try to parse comma or newline-separated tool names
  TOOLS_YAML="[$(echo "$TOOLS_LINE" | sed 's/[*-]//g' | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$' | paste -sd, | sed 's/,/, /g')]"
fi

# Strip the header table (everything before first ---) and prepend front matter
BODY=$(sed '1,/^---$/d' "$REPORT")

cat > "$OUTPUT" <<EOF
---
title: "${BOX_NAME}"
platform: "HTB"
difficulty: "${DIFFICULTY}"
os: "${OS}"
date: ${DATE}
status: "${STATUS}"
user_flag: ${USER_FLAG}
root_flag: ${ROOT_FLAG}
tags: []
tools: ${TOOLS_YAML}
---
${BODY}
EOF

echo "Published: $OUTPUT"
echo "  Status: ${STATUS} | User: ${USER_FLAG} | Root: ${ROOT_FLAG}"
