#!/usr/bin/env python3
"""BUILD.md §5 image pipeline — baked-alpha portrait fades.

Manual/local only (see CLAUDE.md): never wired into `astro build`, so the
Cloudflare Pages build never needs Python. Run this whenever
source-photos/portraits/ changes, then commit the regenerated public/img/
and src/data/images.json.
"""
import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source-photos" / "portraits"
OUT = ROOT / "public" / "img"
MANIFEST = ROOT / "src" / "data" / "images.json"

MOBILE_WIDTH = 760
AMBIENT_WIDTH = 180
AMBIENT_BLUR_SIGMA = 20
OG_SIZE = (1200, 630)

PORTRAITS = {
    "hero": {
        "file": "hero-frontal-green.JPG",
        "alt": "Antonio Simón, portrait in green light",
    },
    "manifesto": {
        "file": "manifesto-red-doubleexposure.JPG",
        "alt": "Antonio Simón, portrait in red light",
    },
    "agenda": {
        "file": "agenda-bw-lightbars.JPG",
        "alt": "Antonio Simón, black and white portrait with bars of light",
        "filter": "grayscale(1) contrast(1.05)",
    },
    "about": {
        "file": "about-profile-green.JPG",
        "alt": "Antonio Simón, profile in green light",
    },
    "contact": {
        "file": "contact-frontal-green.JPG",
        "alt": "Antonio Simón, portrait in green light, facing the camera",
    },
}


def smootherstep(t: np.ndarray) -> np.ndarray:
    """6t^5 - 15t^4 + 10t^3 — zero first & second derivative at both ends."""
    t = np.clip(t, 0.0, 1.0)
    return 6 * t**5 - 15 * t**4 + 10 * t**3


def load_exif_corrected(path: Path) -> Image.Image:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)
    return img.convert("RGB")


def desktop_alpha(width: int, height: int) -> np.ndarray:
    """Horizontal fade: x=2% -> alpha 0, x=52% -> alpha 255."""
    xs = np.arange(width) / width
    t = (xs - 0.02) / (0.52 - 0.02)
    row = (smootherstep(t) * 255).round().astype(np.uint8)
    return np.tile(row, (height, 1))


def mobile_alpha(width: int, height: int) -> np.ndarray:
    """Vertical fade, both ends: 0 at y=0 -> 255 at y=14%, opaque plateau
    to y=50%, then 255 -> 0 by y=99%. The portrait dissolves into the
    ground at its top edge (behind the fixed nav) as well as its bottom,
    instead of starting flat opaque under the nav."""
    ys = np.arange(height) / height
    t_rise = (ys - 0.0) / (0.14 - 0.0)
    alpha_rise = smootherstep(t_rise) * 255
    t_fall = (ys - 0.50) / (0.99 - 0.50)
    alpha_fall = 255 * (1 - smootherstep(t_fall))
    col = np.minimum(alpha_rise, alpha_fall).round().astype(np.uint8)
    return np.tile(col.reshape(-1, 1), (1, width))


def apply_alpha(img: Image.Image, alpha: np.ndarray) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    arr[..., 3] = alpha
    return Image.fromarray(arr)


def hashed_name(img: Image.Image, prefix: str) -> str:
    import hashlib
    digest = hashlib.sha1(img.tobytes()).hexdigest()[:10]
    return f"{prefix}-{digest}.webp"


def save_webp(img: Image.Image, name: str, quality: int) -> None:
    img.save(OUT / name, "WEBP", quality=quality, alpha_quality=100, method=6)


def build_og_crop(original: Image.Image) -> Image.Image:
    """1200x630 crop of the hero, biased toward the upper quarter of the
    vertical slack so a dead-center crop doesn't cut the face."""
    target_w, target_h = OG_SIZE
    w, h = original.size
    scale = target_w / w
    resized = original.resize((target_w, round(h * scale)), Image.LANCZOS)
    rw, rh = resized.size
    slack = rh - target_h
    top = round(slack * 0.25)
    return resized.crop((0, top, target_w, top + target_h))


def build_portrait(slot: str, meta: dict) -> dict:
    original = load_exif_corrected(SRC / meta["file"])
    w, h = original.size

    desktop_img = apply_alpha(original, desktop_alpha(w, h))
    desktop_name = hashed_name(desktop_img, f"{slot}-desktop")
    save_webp(desktop_img, desktop_name, quality=80)

    mobile_h = round(h * (MOBILE_WIDTH / w))
    mobile_base = original.resize((MOBILE_WIDTH, mobile_h), Image.LANCZOS)
    mobile_img = apply_alpha(mobile_base, mobile_alpha(MOBILE_WIDTH, mobile_h))
    mobile_name = hashed_name(mobile_img, f"{slot}-mobile")
    save_webp(mobile_img, mobile_name, quality=76)

    amb_h = round(h * (AMBIENT_WIDTH / w))
    amb_img = original.resize((AMBIENT_WIDTH, amb_h), Image.LANCZOS)
    amb_img = amb_img.filter(ImageFilter.GaussianBlur(radius=AMBIENT_BLUR_SIGMA))
    amb_name = hashed_name(amb_img, f"{slot}-ambient")
    save_webp(amb_img, amb_name, quality=55)

    entry = {
        "desktop": f"/img/{desktop_name}",
        "mobile": f"/img/{mobile_name}",
        "ambient": f"/img/{amb_name}",
        "alt": meta["alt"],
    }
    if "filter" in meta:
        entry["filter"] = meta["filter"]

    if slot == "hero":
        og_img = build_og_crop(original)
        og_name = hashed_name(og_img, "og-hero")
        save_webp(og_img, og_name, quality=82)
        entry["og"] = f"/img/{og_name}"

    return entry


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    manifest = {}
    for slot, meta in PORTRAITS.items():
        print(f"Processing {slot} ({meta['file']})…")
        manifest[slot] = build_portrait(slot, meta)

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
