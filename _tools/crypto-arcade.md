---
title: "CryptoOS Arcade"
tagline: "An interactive cryptography course disguised as a retro hacking game — 6 rooms, 30 levels, from XOR to TLS."
category: tool
tags: [cryptography, education, interactive, javascript, applied-crypto]
demo: /assets/crypto-arcade/index.html
---

## Overview

A gamified cryptography learning experience built as a single-page web app. Boot into a retro hacking OS, explore a pixel-art server room, and work through six rooms that build from XOR fundamentals all the way to TLS and digital signatures.

## The Six Rooms

| Room | Topic | Key Concepts |
|------|-------|-------------|
| 1 | XOR | Bitwise operations, encryption/decryption proof, key reuse attacks |
| 2 | PRG & Primitives | Pseudorandom generators, seed expansion, distinguishing games, the crypto chain (OWF &rarr; PRG &rarr; PRF &rarr; PRP) |
| 3 | Block Cipher Modes | ECB penguin, CBC chaining, CTR parallelism, IND-CPA security game |
| 4 | MAC / AEAD | Bit-flip attacks, the bank heist, MAC tagging, Encrypt-then-MAC, AES-GCM pipeline |
| 5 | Diffie-Hellman | Key distribution problem, color mixing analogy, modular arithmetic, MITM attacks |
| 6 | Signatures & PKI | Non-repudiation courtroom, RSA sign/verify, forgery challenge, certificate chains, TLS demolition |

## Features

- **30 interactive levels** with step-by-step breakdowns and hands-on games
- **Pixel-art hub world** — walk between rooms in a retro server room
- **Full terminal emulator** with easter eggs (`cowsay`, `sudo`, `sl`)
- **KaTeX math rendering** for all equations and proofs
- **Web Audio API** sound effects and ambient music
- **Endgame hash-cracking challenge** that unlocks after all rooms complete
- **Zero dependencies** — single HTML file, runs entirely in the browser
