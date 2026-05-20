"""Gera PNG do logo com fundo preto removido (alpha)."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "img"


def knock_out_black(src: Path, dst: Path, thresh: int = 55) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r <= thresh and g <= thresh and b <= thresh:
                px[x, y] = (r, g, b, 0)
    im.save(dst, optimize=True)
    print(f"saved {dst.name} ({dst.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    knock_out_black(ROOT / "logo-wordmark.png", ROOT / "logo-overlay.png")
    knock_out_black(ROOT / "logo.png", ROOT / "logo-overlay-square.png")
