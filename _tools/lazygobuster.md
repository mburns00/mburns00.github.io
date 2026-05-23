---
title: "lazygobuster"
tagline: "One-command directory enumeration with gobuster — pick a wordlist size, add a URL, go."
category: script
tags: [gobuster, recon, bash, automation, web]
---

## Overview

A wrapper around gobuster that runs directory enumeration with a single command. Pick a wordlist size, give it a URL, and it handles the rest — 50 threads, sane status code filtering, and a live progress bar in your terminal.

## Usage

```bash
lazygobuster <size> <url>
```

| Flag | Wordlist | Entries |
|------|----------|---------|
| `-s` | `directory-list-2.3-small.txt` | ~87,000 |
| `-m` | `directory-list-2.3-medium.txt` | ~220,000 |
| `-l` | `directory-list-2.3-big.txt` | ~1,200,000 |

```bash
# Quick scan during a CTF
lazygobuster -s http://10.10.10.1

# Full medium scan
lazygobuster -m http://target.htb
```

## What It Runs

```bash
gobuster dir -u <url> -w <wordlist> -t 50 --no-error -b 400,403,404,405,500,502,503
```

| Option | Purpose |
|--------|---------|
| `-t 50` | 50 concurrent threads |
| `--no-error` | Suppress connection error noise |
| `-b 400,403,...` | Filter out junk status codes |

## Features

- **Live progress bar** — real-time percentage, elapsed time, and found count
- **Color-coded results** — 2xx green, 3xx yellow, everything else red
- **Graceful Ctrl+C** — cleans up background processes on interrupt
- **Wordlist validation** — checks the wordlist exists before scanning

## Install

```bash
# Drop it anywhere on your PATH
cp lazygobuster ~/.local/bin/
chmod +x ~/.local/bin/lazygobuster
```

Wordlists go in `~/wordlists/` — grab them from [SecLists](https://github.com/danielmiessler/SecLists).
