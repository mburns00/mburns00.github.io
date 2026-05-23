---
title: "Appointment"
platform: "HTB"
difficulty: "Very Easy"
os: "Linux"
date: 2026-02-13
status: "rooted"
user_flag: true
root_flag: false
tags: [web, sql-injection, apache]
tools: [nmap, gobuster]
ttl: "15m"
---

Appointment is a Very Easy Starting Point box running Apache 2.4.38 on Debian serving a login portal. The login form is vulnerable to SQL injection — using `admin'#` as the username bypasses authentication entirely and reveals the flag.

## Reconnaissance

### Port Scan

```
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
```

Single port open — Apache serving a login page.

## Exploitation

### SQL Injection

Default credentials failed. Tested the login form for SQL injection:

- **Username**: `admin'#`
- **Password**: anything

The `#` comments out the password check in the MySQL query, granting access as admin. Flag displayed on the post-auth dashboard.

## Key Takeaway

Always test login forms for basic SQLi before reaching for heavier tools. A single quote and comment character was all it took.
