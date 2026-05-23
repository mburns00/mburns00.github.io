---
title: "Explosion"
platform: "HTB"
difficulty: "Very Easy"
os: "Windows"
date: 2026-02-13
status: "rooted"
user_flag: true
root_flag: false
tags: [rdp, default-credentials, windows]
tools: [nmap, xfreerdp]
ttl: "10m"
---

Explosion is a Very Easy Starting Point Windows box with multiple exposed services including RDP on 3389. The Administrator account has a blank password with NLA disabled, granting full desktop access.

## Reconnaissance

### Port Scan

```
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server Microsoft Terminal Services
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
```

Wide attack surface — RDP, SMB, and WinRM all open.

## Exploitation

### RDP with Blank Password

Connected via xfreerdp as Administrator with an empty password — no NLA challenge, straight to desktop. Flag on the Administrator desktop.

## Key Takeaway

Always try blank and default passwords on exposed services before brute-forcing. WinRM (5985) was an alternate path if RDP was locked down.
