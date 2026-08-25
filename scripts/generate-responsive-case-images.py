from pathlib import Path
import re

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "docs" / "public"
SUBMISSIONS = ROOT / "docs" / "cases" / "submissions"
MAX_WIDTH = 720


def optimized_path(source: Path) -> Path:
    return source.with_name(f"{source.stem}-card.webp")


for article in sorted(SUBMISSIONS.glob("*/index.md")):
    match = re.search(r"^cover:\s*(/[^\n]+)$", article.read_text(encoding="utf-8"), re.MULTILINE)
    if not match:
        continue

    source = PUBLIC / match.group(1).strip().lstrip("/")
    target = optimized_path(source)
    with Image.open(source) as image:
        image.thumbnail((MAX_WIDTH, image.height), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.save(target, "WEBP", quality=82, method=6)
    print(f"{source.relative_to(PUBLIC)} -> {target.relative_to(PUBLIC)}")
