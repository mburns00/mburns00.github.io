---
title: "Beyond CTFs — Master's Thesis"
tagline: "Open-source evaluation framework for autonomous pentesting LLMs. 12-dim safety×performance rubric, SFT/DPO/GRPO comparison, MITRE ATT&CK + OWASP Agentic Top 10 mapping."
category: tool
tags: [thesis, ai-red-team, llm-evaluation, mitre-attack, mitre-atlas, owasp-agentic, sft, dpo, grpo, qwen, mcp]
---

## Overview

[Beyond CTFs](https://github.com/mburns00/beyond-ctfs) is the open-source code from my Master of Cybersecurity capstone (OCSE5707 / OCSE5708, The University of Sydney, 2026).

Most LLM pentesting benchmarks are pass/fail on CTF challenges. I built a 12-dimension rubric instead — 8 performance dimensions grounded in PTES and MITRE ATT&CK, plus 4 safety dimensions — so you can actually see where models fail rather than just whether they did.

## Method

Compared four fine-tuned Qwen3-14B variants — Baseline, SFT, DPO, GRPO — across 32 paired HackTheBox runs. Triple-blind LLM-as-judge scoring with the model name redacted from transcripts. Locked statistical pipeline:

`Friedman ω-omnibus → Wilcoxon signed-rank (Bonferroni α = .00833) → Cliff's δ → Mann–Whitney U → Kruskal–Wallis → Holm–Bonferroni`

## Key numbers

| Metric | Value |
|--------|-------|
| Controlled cells | **32** (8 paired HTB machines × 4 variants) |
| Eval dimensions | **12** (8 performance + 4 safety) |
| MCP tools wired into the harness | **574** |
| Safety prompt pack | **50** malicious prompts (JailbreakBench-aligned) |
| Inter-rater reliability | Krippendorff's α = **0.72** [0.53, 0.85] |
| Pre-registered hypotheses | 4 (H1 affirmative, H2 reversed, H3 conditional, H4 affirmative) |

## Headline findings

- **All 8 performance dimensions** show statistically significant variant differences (χ² 9.00–15.51, p .029–.0014).
- **DPO is weakly Pareto-dominated by SFT** — matching refusal rate (~92%) but losing capability (0.47 vs 0.68). Counter-intuitive for the "DPO is strictly safer" prior.
- **GRPO exhibits an LLM06 Excessive-Agency signature** — 96% refusal rate on the malicious-prompt pack (vs base 90%), crossing into over-refusal territory.
- **DPO contamination fingerprint detected** — behavioural divergence on the Silentium box suggests TryHackMe MrRobot leakage into the DPO training set. The framework caught it.

## Governance mapping

Observed agent behaviour is mapped to:

- **OWASP Agentic Top 10**
- **NIST AI 600-1** (12 risks, confirmed)
- **MITRE ATLAS**
- **Singapore Agentic AI Framework** (principle of least privilege)

## On the IRR number

Inter-rater reliability landed at Krippendorff's α = 0.72 — below the 0.80 I pre-registered. I left it in the report at that value rather than re-tuning the rubric until it cleared the bar. Worth knowing if you're reading the results.

## Open source

Published under Apache-2.0 at **[github.com/mburns00/beyond-ctfs](https://github.com/mburns00/beyond-ctfs)**. The 44-page Final Report PDF is at [`docs/Beyond_CTFs_Final_Report.pdf`](https://github.com/mburns00/beyond-ctfs/blob/main/docs/Beyond_CTFs_Final_Report.pdf).

Trained weights, training data, and the full safety prompt pack are deliberately withheld per the dual-use ethics commitment (Final Report Chapter 3 §3.9 and Chapter 8 §8.10).

## Predecessor work

The methodology lessons that made this thesis possible came from an earlier week-long research sprint — see [CyberSec Qwen3](/tools/cybersec-qwen3/).
