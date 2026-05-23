---
title: "CyberSec Qwen3"
tagline: "First-generation Qwen3-14B offensive-security fine-tune — the research foundation that evolved into Beyond CTFs (Master's thesis)."
category: tool
tags: [llm, fine-tuning, qlora, sft, dpo, grpo, predecessor]
---

<div style="background: rgba(96, 165, 250, 0.08); border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
  <strong style="color: #60a5fa;">Evolved into <a href="{{ '/tools/beyond-ctfs/' | relative_url }}" style="color: #818cf8;">Beyond CTFs — Master's Thesis</a></strong> &mdash; the lessons from this week-long sprint (data composition, reward design, evaluation gaps) directly shaped the formal capstone research published in 2026.
</div>

## Overview

A week-long research sprint fine-tuning Qwen3 14B into a cybersecurity pentesting assistant using a three-phase training pipeline (SFT, DPO, GRPO). The model was benchmarked against live HackTheBox machines with an MCP tool bridge harness.

## Training Pipeline

```
SFT (Supervised Fine-Tuning)
 > DPO (Direct Preference Optimization)
    > GRPO (Group Relative Policy Optimization)
```

- **Base Model**: Qwen3 14B (4-bit quantized via Unsloth)
- **LoRA**: Rank 32, alpha 64, all 7 linear modules
- **Inference**: q4_k_m GGUF quantization via Ollama
- **Hardware**: RTX 3090 24GB VRAM

## Results at a Glance

| Metric | SFT Baseline | DPO v2 (Best) | GRPO |
|--------|-------------|---------------|------|
| Benchmark Pass Rate | 58% | 63% | 63% |
| Reward Score | baseline | +27.0 | +24.0 |
| Training Samples | 4,308 | 175 pairs | 2,220 prompts |
| Eval Loss | 0.77 | — | — |

### HTB Box Benchmarks

| Box | Difficulty | Flags | Rounds to User |
|-----|-----------|-------|----------------|
| Facts | Easy | User + Root | 17 |
| CodePartTwo | Easy | User + Root | 10 |
| Pterodactyl | Easy | User + Root | 22 |
| Cap | Easy | User + Root | 9 |

## Key Findings

1. **Data composition matters more than training technique** — 94.5% of training data was theoretical Q&A, only 5.5% was practical command-line pentesting. This created a narration bias the model never fully overcame.

2. **Eval loss plateaus are data ceilings** — Loss sat at ~0.77 across all runs regardless of corrections added. The bottleneck was data quality, not model capacity or hyperparameters.

3. **DPO requires clean preference pairs** — Placeholder text, duplicate chosen responses, and near-identical pairs degraded the training signal. Quality over quantity.

4. **Two epochs optimal for SFT** — Three epochs caused overfitting (validated across 4 training runs). Best checkpoint consistently appeared at epoch ~1.8.

5. **Reward functions are easily gamed** — GRPO reward based on structural markers (has code block, has reasoning words) without semantic relevance checks. The model learned to satisfy the form without the substance.

6. **Hallucination under failure is the hardest problem** — When stuck, the model fabricated fake flags and scan results. This is the most dangerous failure mode for any security tool.

## Technical Contributions

- **DPO reference log-prob precomputation** — Solved Unsloth's class-level monkey-patching bug by computing reference model logprobs in a separate subprocess before Unsloth import
- **Benchmark-to-dataset feedback loop** — Systematic pipeline: benchmark on HTB, identify failure patterns, generate correction data, retrain
- **Custom pentest reward function** — Multi-dimensional GRPO reward scoring structure, technique, knowledge, and hallucination signals

<h2 id="next-steps">Next Steps</h2>

Project is **on hold** while completing university. When resumed, the pivot direction is:

- **Reframe as a blue team / SOC tool** — instance scanner for IDS/SIEM integration rather than offensive exploitation
- **Rebalance training data** — shift from theoretical Q&A to practical multi-turn command sequences
- **Rebuild evaluation** — multi-turn scenarios with held-out test cases, not single-turn prompts on training distribution

The offensive security fine-tuning research provided foundational lessons about data composition, reward design, and evaluation methodology that directly apply to the blue team pivot.
