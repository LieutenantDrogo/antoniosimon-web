#!/usr/bin/env python3
"""Export every user-facing string from src/content/ to docs/TEXTOS.md.

Read-only review document for Antonio: the site's copy, both languages, in
page order, without opening a browser. Run after any content edit:

    python3 scripts/export-texts.py
"""
from __future__ import annotations
import pathlib, re, sys

try:
    import yaml
except ModuleNotFoundError:
    sys.exit("PyYAML missing. Use the repo venv: .venv/bin/python scripts/export-texts.py")

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"
OUT = ROOT / "docs" / "TEXTOS.md"

LANGS = [("es", "Español"), ("en", "English")]
ORDER = ["home", "manifesto", "listen", "programmes", "agenda", "research", "about", "contact"]


def load(name: str) -> dict:
    return yaml.safe_load((CONTENT / name).read_text(encoding="utf-8")) or {}


def md_body(path: pathlib.Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m:
        return {}, raw.strip()
    return yaml.safe_load(m.group(1)) or {}, m.group(2).strip()


def pick(value, lang):
    if isinstance(value, dict):
        return value.get(lang, "")
    return value


def by_order(d: dict):
    return sorted(d.items(), key=lambda kv: kv[1].get("order", 0))


def main() -> None:
    pages = load("pages.yaml")
    site = load("site.yaml")["site"]
    programmes = load("programmes.yaml")
    research = load("research.yaml")
    recordings = load("recordings.yaml")
    videos = load("videos.yaml")
    agenda = load("agenda.yaml")

    out: list[str] = [
        "# Textos de la web",
        "",
        "Generado desde `src/content/` con `python3 scripts/export-texts.py`.",
        "No editar este archivo: los cambios se hacen en `src/content/` y se regenera.",
        "",
    ]

    for lang, label in LANGS:
        out += [f"## {label}", ""]
        for pid in ORDER:
            p = pages[pid]
            out += [f"### {pick(p['eyebrow'], lang)}", ""]
            out += [f"- **Título del navegador:** {pick(p['title'], lang)}"]
            out += [f"- **Meta descripción:** {pick(p['metaDescription'], lang)}", ""]
            out += [f"**{pick(p['display'], lang)}**", ""]
            if p.get("kicker"):
                out += [pick(p["kicker"], lang), ""]
            if p.get("lede"):
                out += [pick(p["lede"], lang), ""]

            if pid == "manifesto":
                _, body = md_body(CONTENT / f"manifesto.{lang}.md")
                out += [body, "", "*Antonio Simón*", ""]

            if pid == "about":
                fm, body = md_body(CONTENT / f"bio.{lang}.md")
                out += [f"> {pick(site['quote']['text'], lang)} — {site['quote']['who']}", ""]
                out += [body, ""]
                out += [f"**{pick(p['recordLabel'], lang)}**", ""]
                for row in fm["record"]:
                    out += [f"- **{pick(row['dt'], lang)}:** {pick(row['dd'], lang)}"]
                out += ["", f"**{pick(p['shortBioLabel'], lang)}**", "", fm["short"].strip(), ""]

            if pid == "programmes":
                for _, prog in by_order(programmes):
                    meta = " · ".join(
                        x for x in [pick(prog["kind"], lang), pick(prog["forces"], lang), prog.get("duration")] if x
                    )
                    out += [f"**{pick(prog['title'], lang)}**"]
                    if prog.get("subtitle"):
                        out += [f"*{pick(prog['subtitle'], lang)}*"]
                    out += ["", pick(prog["desc"], lang), "", f"`{meta}`", ""]
                out += [pick(p["notebox"], lang), ""]

            if pid == "agenda":
                for key, ev in sorted(agenda.items(), key=lambda kv: kv[1]["date"]):
                    date = ev["date"] + (f" → {ev['endDate']}" if ev.get("endDate") else "")
                    out += [f"**{date} · {pick(ev['kind'], lang)}** — {pick(ev['what'], lang)}"]
                    out += [f"{pick(ev['where'], lang)}"]
                    if ev.get("detail"):
                        out += ["", pick(ev["detail"], lang)]
                    out += [""]
                out += [pick(p["note"], lang), ""]

            if pid == "research":
                for _, item in by_order(research):
                    out += [f"**{pick(item['code'], lang)} — {pick(item['title'], lang)}**", ""]
                    out += [pick(item["desc"], lang), "", f"`{item['meta']}`", ""]
                out += [pick(p["note"], lang), ""]

            if pid == "listen":
                for _, v in by_order(videos):
                    out += [f"**{v['composer']} — {pick(v['work'], lang)}** ({pick(v['instrument'], lang)})"]
                    if v.get("caption"):
                        out += ["", pick(v["caption"], lang)]
                    out += [f"", f"`youtube.com/watch?v={v['youtubeId']}`", ""]
                out += [f"**{pick(p['reclistEyebrow'], lang)}**", ""]
                for _, rec in by_order(recordings):
                    out += [f"**{rec['marker']} — {pick(rec['title'], lang)}**", ""]
                    out += [pick(rec["desc"], lang)]
                    if rec.get("meta"):
                        out += ["", f"`{pick(rec['meta'], lang)}`"]
                    if rec.get("url"):
                        out += ["", f"<{rec['url']}>"]
                    out += [""]

            if pid == "contact":
                out += [f"**{site['email']}**", ""]
                out += [f"{pick(site['city'], lang)} · {pick(site['reach'], lang)}", ""]

            out += ["---", ""]

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(out)} lines)")


if __name__ == "__main__":
    main()
