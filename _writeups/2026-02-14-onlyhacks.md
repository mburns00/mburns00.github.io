---
title: "OnlyHacks"
platform: "HTB"
difficulty: "Easy"
os: "Web"
date: 2026-02-14
status: "rooted"
user_flag: true
root_flag: false
seasonal: true
tags: [web, idor, broken-access-control, flask, socketio, owasp-top-10, valentines-2026]
tools: [nmap, burpsuite, flask-unsign]
ttl: "30m"
---

<div style="background: rgba(255, 68, 68, 0.08); border: 1px solid rgba(255, 68, 68, 0.25); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
  <span style="font-size: 1.2rem;">&#9829;</span>
  <div>
    <strong style="color: #ff4444;">Valentine's Day 2026 — Seasonal Challenge</strong>
    <p style="margin: 0.25rem 0 0; color: #a4b1cd; font-size: 0.85rem;">This is an active limited-time challenge. Key details have been redacted.</p>
  </div>
</div>

OnlyHacks is a Valentine's Day themed HTB web challenge — a Tinder-style dating app built on Flask + Socket.IO. The core vulnerability is a classic OWASP Top 10 access control flaw.

## Reconnaissance

### Application Overview

Dating app with registration, profile swiping, and real-time chat via Socket.IO. Chat rooms are identified by sequential integer IDs passed as a URL parameter.

## Exploitation

### The Vulnerability

<div style="background: rgba(107, 123, 149, 0.1); border-radius: 6px; padding: 1rem; margin: 1rem 0;">
  <p style="color: #6b7b95; font-style: italic; margin: 0;">Redacted — active challenge. The vulnerability class is <strong style="color: #ffab40;">Broken Access Control (IDOR)</strong>.</p>
</div>

The attack leverages insufficient authorization checks on a parameterised endpoint, allowing access to resources belonging to other users.

### Other Vectors Tested

- **SSTI in bio/chat**: Not vulnerable
- **File upload abuse**: Rejected non-image uploads
- **Flask session cracking**: Not needed

## Key Takeaway

IDOR is OWASP #1 (Broken Access Control) for a reason. Always check whether the server validates that the authenticated user actually belongs to the resource they're requesting. Sequential integer IDs are trivially enumerable.

<p style="color: #6b7b95; font-size: 0.8rem; margin-top: 2rem; font-style: italic;">Full writeup will be unredacted after the seasonal event ends.</p>
