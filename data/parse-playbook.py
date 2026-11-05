#!/usr/bin/env python3
"""
Parse MODULES PLAYBOOK DESIGN.txt (cp1252, CRLF) into data/playbook.json.

Structure of the source:
  ## NN · Section title            (20 module sections + 5 trailing meta sections)
     <intro paragraphs>
     **Architecture** / **Accessibility** / **Performance** / **Quality gate** bullet lists
     ### <Section> · <Tier> tier (N)   (tier groups — informational)
       #### ModuleName
         - **Type:** Starter|Growth|Business|Flagship
         - **File:** `path`
         - **Core features:** a · b · c
         - **Purpose:** ...
         - **Rule:** ...
         - **Accessibility:** ...        (optional)
         - **Code:** reference implementation|live in this app|generated scaffold — ...
         - **Note:** ...                  (optional)
         ```lang ... ```
Output: one JSON with sections, modules (incl. full code), coverage table,
flagship index, tracked events, tier matrix, build order, quality gates,
closing note.
"""
import json
import re
import sys

SRC = "/home/z/my-project/upload/MODULES PLAYBOOK DESIGN.txt"
OUT = "/home/z/my-project/data/playbook.json"

raw = open(SRC, "rb").read().decode("cp1252")
text = raw.replace("\r\n", "\n").replace("\r", "\n")

TIER_ORDER = ["Starter", "Growth", "Business", "Flagship"]
TIER_KEY = {"Starter": "starter", "Growth": "growth", "Business": "business", "Flagship": "flagship"}

# ── split top-level sections by ## headings ────────────────────────────
head_re = re.compile(r"^## (.+)$", re.M)
marks = [(m.start(), m.group(1).strip()) for m in head_re.finditer(text)]
meta = text[: marks[0][0]]  # the preface (title, how to read, contents)

sections_out = []
modules_out = []
meta_out: dict = {}

for si in range(len(marks)):
    start, title = marks[si]
    end = marks[si + 1][0] if si + 1 < len(marks) else len(text)
    body = text[start:end]

    if title == "Flagship tier index":
        rows = []
        for m in re.finditer(r"^\| \*\*(.+?)\*\* \| (.+?) \| `(.+?)` \| (.+?) \|$", body, re.M):
            rows.append({"module": m.group(1), "section": m.group(2), "file": m.group(3), "purpose": m.group(4)})
        meta_out["flagshipIndex"] = rows
        continue
    if title == "Tracked events":
        rows = []
        for m in re.finditer(r"^\| `(.+?)` \| (.+?) \|$", body, re.M):
            rows.append({"event": m.group(1), "tells": m.group(2)})
        meta_out["trackedEvents"] = rows
        continue
    if title == "Tier matrix":
        rows = []
        for m in re.finditer(r"^\| \*\*(.+?)\*\* \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$", body, re.M):
            rows.append({"area": m.group(1), "starter": m.group(2), "growth": m.group(3), "business": m.group(4), "flagship": m.group(5)})
        meta_out["tierMatrix"] = rows
        continue
    if title == "Build order":
        stages = []
        for m in re.finditer(r"^### (.+?)\n\n- \*\*Includes:\*\* (.+?)\n- \*\*Why now:\*\* (.+?)$", body, re.M | re.S):
            stages.append({"stage": m.group(1).strip(), "includes": m.group(2).strip(), "why": m.group(3).strip()})
        meta_out["buildOrder"] = stages
        continue
    if title == "Quality gates":
        gates = []
        for m in re.finditer(r"^\d+\.\s+\*\*(.+?)\s*[—-]\s*(.+)$", body, re.M):
            gates.append({"gate": m.group(1).strip(), "detail": m.group(2).strip()})
        meta_out["qualityGates"] = gates
        continue
    if title == "Closing note":
        body_txt = re.sub(r"^## .+?\n+", "", body).strip()
        meta_out["closingNote"] = body_txt
        continue
    if title in ("How to read an entry", "Contents", "Section coverage"):
        if title == "Section coverage":
            rows = []
            for m in re.finditer(r"^\| (\d+) \| (.+?) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|$", body, re.M):
                rows.append({
                    "no": m.group(1), "section": m.group(2), "modules": int(m.group(3)),
                    "starter": int(m.group(4)), "growth": int(m.group(5)),
                    "business": int(m.group(6)), "flagship": int(m.group(7)),
                })
            meta_out["coverage"] = rows
        continue

    # a numbered module section: "NN · Title"
    m = re.match(r"^(\d{2})\s*[·\u00b7]\s*(.+)$", title)
    if not m:
        continue
    no, sec_title = m.group(1), m.group(2).strip()

    # intro = text after heading until the first ### or **Architecture** block
    intro_body = re.sub(r"^## .+?\n", "", body)
    first_marker = re.search(r"^(### |\*\*)", intro_body, re.M)
    intro = intro_body[: first_marker.start()].strip() if first_marker else ""
    intro = re.sub(r"\n{2,}", "\n", intro)

    def bullet_block(label: str) -> list:
        m2 = re.search(rf"^\*\*{label}\*\*\n((?:- .+\n?)+)", intro_body, re.M)
        if not m2:
            return []
        return [re.sub(r"^- ", "", ln).strip() for ln in m2.group(1).strip().split("\n") if ln.strip()]

    section_entry = {
        "no": no,
        "title": sec_title,
        "blurb": intro,
        "architecture": bullet_block("Architecture"),
        "accessibility": bullet_block("Accessibility"),
        "performance": bullet_block("Performance"),
        "gate": bullet_block("Quality gate"),
    }
    sections_out.append(section_entry)

    # module entries
    for em in re.finditer(r"^#### ([A-Za-z0-9_]+)\n\n(.*?)(?=^#### |\Z)", body, re.M | re.S):
        name = em.group(1)
        entry = em.group(2)
        fields = {}
        for fm in re.finditer(r"^- \*\*(Type|File|Core features|Purpose|Rule|Accessibility|Code|Note):\*\* (.+)$", entry, re.M):
            fields[fm.group(1)] = fm.group(2).strip()
        code = None
        cm = re.search(r"^```[a-z]*\n(.*?)^```", entry, re.M | re.S)
        if cm:
            code = cm.group(1)
        kind = None
        if "Code" in fields:
            if fields["Code"].startswith("reference implementation"):
                kind = "reference"
            elif fields["Code"].startswith("live in this app"):
                kind = "live"
            elif fields["Code"].startswith("generated scaffold"):
                kind = "scaffold"
        tier_raw = fields.get("Type", "Growth")
        tier = TIER_KEY.get(tier_raw, "growth")
        modules_out.append({
            "id": re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower(),
            "name": name,
            "section": sec_title,
            "sectionNo": no,
            "tier": tier,
            "tierRaw": tier_raw,
            "file": fields.get("File", "").strip("`"),
            "features": [f.strip() for f in re.split(r"\s*[·\u00b7]\s*", fields.get("Core features", "")) if f.strip()],
            "purpose": fields.get("Purpose", ""),
            "rule": fields.get("Rule", ""),
            "accessibility": fields.get("Accessibility"),
            "note": fields.get("Note"),
            "codeKind": kind,
            "codeNote": fields.get("Code"),
            "hasCode": code is not None,
            "code": code,
        })

# ── per-section module counts (from actual parsed modules, not the table) ──
for s in sections_out:
    mods = [m2 for m2 in modules_out if m2["sectionNo"] == s["no"]]
    s["count"] = len(mods)
    s["starter"] = sum(1 for x in mods if x["tier"] == "starter")
    s["growth"] = sum(1 for x in mods if x["tier"] == "growth")
    s["business"] = sum(1 for x in mods if x["tier"] == "business")
    s["flagship"] = sum(1 for x in mods if x["tier"] == "flagship")

by_tier = {t: sum(1 for m2 in modules_out if m2["tier"] == t) for t in ("starter", "growth", "business", "flagship")}

doc = {
    "meta": meta_out,
    "sections": sections_out,
    "modules": modules_out,
    "total": len(modules_out),
    "byTier": by_tier,
}

json.dump(doc, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

print(f"sections: {len(sections_out)}  modules: {len(modules_out)}  by tier: {by_tier}")
missing_purpose = [m2['name'] for m2 in modules_out if not m2['purpose']]
missing_rule = [m2['name'] for m2 in modules_out if not m2['rule']]
missing_code = [m2['name'] for m2 in modules_out if not m2['hasCode']]
print("missing purpose:", len(missing_purpose), missing_purpose[:8])
print("missing rule:", len(missing_rule), missing_rule[:8])
print("missing code:", len(missing_code), missing_code[:8])
print("meta keys:", {k: (len(v) if isinstance(v, list) else 1) for k, v in meta_out.items()})
size = len(open(OUT, "rb").read())
print(f"json size: {size/1024:.0f} KB")
