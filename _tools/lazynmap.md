---
title: "lazynmap"
tagline: "One-command full port scan + service detection — just add an IP."
category: script
tags: [nmap, recon, bash, automation]
---

## Overview

A no-frills wrapper around nmap that runs a full TCP port scan with service version detection in a single command. Built for speed during CTFs and lab environments.

## Usage

```bash
lazynmap <target_ip>
```

That's it. No flags, no prompts.

## What It Runs

```bash
nmap -sT -sV -p- -T4 --min-rate 5000 --max-retries 2 --open -v <target>
```

| Flag | Purpose |
|------|---------|
| `-sT` | TCP connect scan |
| `-sV` | Service version detection |
| `-p-` | All 65,535 ports |
| `-T4` | Aggressive timing |
| `--min-rate 5000` | Floor of 5,000 packets/sec |
| `--max-retries 2` | Cap probe retries at 2 |
| `--open` | Only show open ports |
| `-v` | Verbose progress output |

## Install

```bash
# Drop it anywhere on your PATH
cp lazynmap ~/.local/bin/
chmod +x ~/.local/bin/lazynmap
```
