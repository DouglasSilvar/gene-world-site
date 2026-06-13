"""Exporta sprites Java RLE (64x64) para PNG no site."""
from __future__ import annotations

import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src" / "main" / "java" / "org" / "gene" / "world" / "sprites" / "otherworldsdecoration"
OUT = ROOT / "geneworld-site" / "spritepngoutput"

PALETTE = {
    0: (0, 0, 0, 0),
    1: (242, 217, 191, 255),
    2: (255, 0, 0, 255),
    3: (255, 255, 0, 255),
    4: (0, 128, 255, 255),
    5: (255, 153, 0, 255),
    6: (153, 0, 255, 255),
    7: (0, 255, 0, 255),
    8: (153, 102, 51, 255),
    9: (128, 128, 128, 255),
    10: (255, 255, 255, 255),
    11: (0, 0, 0, 255),
    12: (255, 102, 178, 255),
    13: (0, 255, 255, 255),
    14: (0, 0, 153, 255),
    15: (0, 102, 0, 255),
    16: (128, 204, 255, 255),
    17: (128, 0, 0, 255),
    18: (128, 255, 128, 255),
    19: (128, 128, 0, 255),
    20: (255, 0, 255, 255),
    21: (0, 128, 128, 255),
    22: (102, 51, 0, 255),
    23: (0, 0, 128, 255),
    24: (128, 0, 64, 255),
    25: (0, 255, 128, 255),
    26: (64, 64, 64, 255),
    27: (204, 153, 102, 255),
    28: (191, 191, 191, 255),
    29: (255, 214, 0, 255),
    30: (74, 0, 130, 255),
    31: (237, 130, 237, 255),
}


def decode_rle(rle: str, width: int = 64, height: int = 64) -> list[tuple[int, int, int, int]]:
    parts = [int(x) for x in rle.split(",")]
    pixels: list[tuple[int, int, int, int]] = []
    for i in range(0, len(parts), 2):
        color_id = parts[i]
        count = parts[i + 1]
        rgba = PALETTE.get(color_id, (0, 0, 0, 0))
        pixels.extend([rgba] * count)
    expected = width * height
    if len(pixels) != expected:
        raise ValueError(f"RLE decode size mismatch: expected {expected}, got {len(pixels)}")
    return pixels


def extract_frames(java_path: Path) -> list[str]:
    text = java_path.read_text(encoding="utf-8")
    pattern = re.compile(r'FRAME_(\d+)_RLE\s*=\s*"([^"]*)";', re.DOTALL)
    matches = sorted(((int(i), rle) for i, rle in pattern.findall(text)), key=lambda x: x[0])
    if len(matches) != 4:
        raise ValueError(f"Expected 4 frames in {java_path.name}, got {len(matches)}")
    return [rle for _, rle in matches]


def export_sprite_frames(class_name: str) -> None:
    java_file = SRC / f"{class_name}.java"
    rles = extract_frames(java_file)

    for idx, rle in enumerate(rles, start=1):
        pixels = decode_rle(rle)
        image = Image.new("RGBA", (64, 64))
        image.putdata(pixels)
        out_file = OUT / f"{class_name}Frame{idx}.png"
        image.save(out_file, optimize=True)
        print(f"saved {out_file.name}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    export_sprite_frames("TimeClockSprite")
    export_sprite_frames("WeatherForecastSprite")


if __name__ == "__main__":
    main()
