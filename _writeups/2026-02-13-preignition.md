---
title: "Preignition"
platform: "HTB"
difficulty: "Very Easy"
os: "Linux"
date: 2026-02-13
status: "rooted"
user_flag: true
root_flag: false
tags: [web, nginx, default-credentials, directory-enumeration]
tools: [nmap, gobuster]
ttl: "10m"
---

Preignition is a Very Easy Starting Point Linux box running nginx 1.14.2. Directory enumeration with gobuster reveals a hidden `/admin.php` login panel that accepts default credentials `admin:admin`.

## Reconnaissance

### Port Scan

```
PORT   STATE SERVICE VERSION
80/tcp open  http    nginx 1.14.2
```

Single port — default nginx welcome page.

### Directory Enumeration

```bash
gobuster dir -u http://10.129.1.250 --wordlist /usr/share/wordlists/dirb/common.txt
```

Found `/admin.php` (Status: 200).

## Exploitation

### Default Credentials

Navigated to `/admin.php` — standard login panel. Tried `admin:admin` and got in immediately. Flag displayed post-auth.

## Key Takeaway

Directory brute-forcing is essential when the default page reveals nothing. Always try common default credentials before reaching for brute-force tools.
