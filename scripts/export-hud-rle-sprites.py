"""Exporta sprites Java RLE (Grid Editor) para PNG no site."""
from __future__ import annotations

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES_NPC = (
    ROOT / "src" / "main" / "java" / "org" / "gene" / "world" / "sprites" / "npc" / "terrainspersons"
)
SPRITES_INSTRUMENTS = (
    ROOT / "src" / "main" / "java" / "org" / "gene" / "world" / "sprites" / "itens" / "instruments"
)
SPRITES_HUD = ROOT / "src" / "main" / "java" / "org" / "gene" / "world" / "sprites" / "otherworldsdecoration"
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

RE_FRAME_RLE = re.compile(r'FRAME_(\d+)_RLE\s*=\s*"([^"]*)";', re.DOTALL)
RE_WIDTH = re.compile(r"public\s+static\s+final\s+int\s+WIDTH\s*=\s*(\d+)\s*;")
RE_HEIGHT = re.compile(r"public\s+static\s+final\s+int\s+HEIGHT\s*=\s*(\d+)\s*;")


def decode_rle(rle: str, width: int, height: int) -> list[tuple[int, int, int, int]]:
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


def read_sprite_size(java_path: Path) -> tuple[int, int]:
    text = java_path.read_text(encoding="utf-8")
    width_match = RE_WIDTH.search(text)
    height_match = RE_HEIGHT.search(text)
    if not width_match or not height_match:
        raise ValueError(f"WIDTH/HEIGHT not found in {java_path.name}")
    return int(width_match.group(1)), int(height_match.group(1))


def extract_frame_rle(java_path: Path, frame_index: int) -> str:
    text = java_path.read_text(encoding="utf-8")
    matches = {int(i): rle for i, rle in RE_FRAME_RLE.findall(text)}
    if frame_index not in matches:
        raise ValueError(f"FRAME_{frame_index}_RLE not found in {java_path.name}")
    return matches[frame_index]


def export_frame(java_path: Path, frame_index: int, out_name: str) -> None:
    width, height = read_sprite_size(java_path)
    rle = extract_frame_rle(java_path, frame_index)
    pixels = decode_rle(rle, width, height)
    image = Image.new("RGBA", (width, height))
    image.putdata(pixels)
    out_file = OUT / out_name
    image.save(out_file, optimize=True)
    print(f"saved {out_file.name}")


def export_all_frames(java_path: Path, class_name: str | None = None) -> None:
    name = class_name or java_path.stem
    text = java_path.read_text(encoding="utf-8")
    width, height = read_sprite_size(java_path)
    matches = sorted(((int(i), rle) for i, rle in RE_FRAME_RLE.findall(text)), key=lambda x: x[0])
    for idx, rle in matches:
        pixels = decode_rle(rle, width, height)
        image = Image.new("RGBA", (width, height))
        image.putdata(pixels)
        out_file = OUT / f"{name}Frame{idx}.png"
        image.save(out_file, optimize=True)
        print(f"saved {out_file.name}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for class_name in ("TimeClockSprite", "WeatherForecastSprite"):
        export_all_frames(SPRITES_HUD / f"{class_name}.java", class_name)

    for class_name in ("NPCJester", "NPCBardo", "NPCGypsy"):
        export_frame(SPRITES_NPC / f"{class_name}.java", 1, f"{class_name}.png")

    instrument_exports = [
        ("FluteBanjoBassDrum.java", 1, "FluteSprite.png"),
        ("FluteBanjoBassDrum.java", 2, "BanjoSprite.png"),
        ("FluteBanjoBassDrum.java", 3, "BassSprite.png"),
        ("FluteBanjoBassDrum.java", 4, "DrumSprite.png"),
        ("AccordionHarpHornTamborine.java", 1, "AccordionSprite.png"),
        ("AccordionHarpHornTamborine.java", 2, "HarpSprite.png"),
        ("AccordionHarpHornTamborine.java", 3, "HornSprite.png"),
        ("AccordionHarpHornTamborine.java", 4, "TambourineSprite.png"),
    ]
    for java_file, frame_index, out_name in instrument_exports:
        export_frame(SPRITES_INSTRUMENTS / java_file, frame_index, out_name)


if __name__ == "__main__":
    main()
