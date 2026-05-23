#!/usr/bin/env bash
# Scaffold a new write-up with front matter
set -euo pipefail

WRITEUPS_DIR="$(cd "$(dirname "$0")/.." && pwd)/_writeups"

read -rp "Box name: " NAME
read -rp "Platform (HTB/THM): " PLATFORM
read -rp "Difficulty (Easy/Medium/Hard/Insane): " DIFFICULTY
read -rp "OS (Linux/Windows): " OS

DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
FILE="${WRITEUPS_DIR}/${DATE}-${SLUG}.md"

cat > "$FILE" <<EOF
---
title: "${NAME}"
platform: "${PLATFORM}"
difficulty: "${DIFFICULTY}"
os: "${OS}"
date: ${DATE}
status: "rooted"
user_flag: false
root_flag: false
tags: []
tools: [nmap]
ttl: ""
---

## Reconnaissance

### Port Scan
\`\`\`

\`\`\`

### Service Enumeration

## Initial Foothold

### Vulnerability Identified

### Exploitation

### User Flag
\`\`\`

\`\`\`

## Privilege Escalation

### Enumeration

### Exploitation

### Root Flag
\`\`\`

\`\`\`

## Lessons Learned

### What Worked

### What Failed

### Key Takeaways
EOF

echo "Created: $FILE"
