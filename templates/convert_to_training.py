#!/usr/bin/env python3
"""
Convert completed box reports + harness logs into fine-tuning data.

Generates ShareGPT format (same as Fenrir dataset) so it slots
directly into the existing training pipeline.

Usage:
  # Convert a single box
  python3 convert_to_training.py ../completed/Facts/

  # Convert all completed boxes
  python3 convert_to_training.py ../completed/

  # Output to specific file
  python3 convert_to_training.py ../completed/ --output training_data.jsonl
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path


def load_harness_log(box_dir: Path) -> dict:
    """Load the harness JSON log from a box directory."""
    log_file = box_dir / "harness_log.json"
    if not log_file.exists():
        return {}
    with open(log_file) as f:
        return json.load(f)


def load_report(box_dir: Path) -> str:
    """Load the markdown report."""
    report_file = box_dir / "report.md"
    if not report_file.exists():
        return ""
    return report_file.read_text()


def extract_sections(report: str) -> dict:
    """Extract named sections from a markdown report."""
    sections = {}
    current = "header"
    current_content = []

    for line in report.split("\n"):
        if line.startswith("## "):
            if current_content:
                sections[current] = "\n".join(current_content).strip()
            current = line[3:].strip().lower()
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections[current] = "\n".join(current_content).strip()

    return sections


def harness_log_to_conversations(log_data: dict) -> list:
    """
    Convert harness log into ShareGPT conversation pairs.

    Each tool-calling round becomes a multi-turn conversation:
    - user: the task/question
    - assistant: explains approach + runs command
    - user: provides command output
    - assistant: analyzes and continues
    """
    conversations = []
    messages = log_data.get("messages", [])

    if not messages:
        return []

    # Build the conversation, combining system+user prompts
    # and assistant responses into clean exchanges
    sharegpt_messages = []

    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")

        if isinstance(content, str):
            # Strip thinking tags for training data
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

        if not content:
            continue

        if role == "system":
            # Include system as the first "from": "system" message
            sharegpt_messages.append({"from": "system", "value": content})
        elif role == "user":
            sharegpt_messages.append({"from": "human", "value": content})
        elif role == "assistant":
            sharegpt_messages.append({"from": "gpt", "value": content})
        elif role == "tool":
            # Tool results get folded into the next user turn
            sharegpt_messages.append({"from": "human", "value": f"Tool output:\n{content}"})

    if sharegpt_messages:
        conversations.append({"conversations": sharegpt_messages})

    return conversations


def report_to_conversation(report: str, box_name: str) -> dict:
    """
    Convert a complete writeup into a single long-form training example.
    User asks to hack the box, assistant provides the full walkthrough.
    """
    sections = extract_sections(report)

    # Build the user prompt
    user_prompt = (
        f"I need to hack into a HackTheBox machine called {box_name}. "
        "Walk me through the entire process from reconnaissance to root."
    )

    # Build the assistant response from report sections
    response_parts = []
    for section_name in ["reconnaissance", "initial foothold", "privilege escalation", "lessons learned"]:
        if section_name in sections:
            response_parts.append(f"## {section_name.title()}\n\n{sections[section_name]}")

    if not response_parts:
        return None

    assistant_response = "\n\n---\n\n".join(response_parts)

    return {
        "conversations": [
            {"from": "system", "value": "You are a cybersecurity expert assistant specializing in penetration testing, vulnerability assessment, exploit development, and security analysis. You provide detailed, technical, and actionable guidance for authorized security testing engagements."},
            {"from": "human", "value": user_prompt},
            {"from": "gpt", "value": assistant_response},
        ]
    }


def process_box(box_dir: Path) -> list:
    """Process a single box directory into training examples."""
    examples = []

    # Method 1: Convert harness log (multi-turn tool-calling conversation)
    log_data = load_harness_log(box_dir)
    if log_data:
        convos = harness_log_to_conversations(log_data)
        for c in convos:
            c["source"] = f"htb_{box_dir.name}_harness"
            c["quality_score"] = 8  # high quality — real tool interaction
            examples.append(c)

    # Method 2: Convert writeup report (long-form walkthrough)
    report = load_report(box_dir)
    if report:
        convo = report_to_conversation(report, box_dir.name)
        if convo:
            convo["source"] = f"htb_{box_dir.name}_writeup"
            convo["quality_score"] = 9  # highest — curated writeup
            examples.append(convo)

    return examples


def main():
    parser = argparse.ArgumentParser(description="Convert box reports to training data")
    parser.add_argument("path", type=Path, help="Box directory or parent of box directories")
    parser.add_argument("--output", type=Path, default=None,
                        help="Output JSONL file (default: stdout)")
    args = parser.parse_args()

    examples = []

    if (args.path / "harness_log.json").exists() or (args.path / "report.md").exists():
        # Single box directory
        examples = process_box(args.path)
    else:
        # Parent directory — process all subdirs
        for box_dir in sorted(args.path.iterdir()):
            if box_dir.is_dir():
                box_examples = process_box(box_dir)
                examples.extend(box_examples)
                if box_examples:
                    sys.stderr.write(f"  {box_dir.name}: {len(box_examples)} examples\n")

    sys.stderr.write(f"\nTotal: {len(examples)} training examples\n")

    if args.output:
        with open(args.output, "w") as f:
            for ex in examples:
                f.write(json.dumps(ex) + "\n")
        sys.stderr.write(f"Written to {args.output}\n")
    else:
        for ex in examples:
            print(json.dumps(ex))


if __name__ == "__main__":
    main()
