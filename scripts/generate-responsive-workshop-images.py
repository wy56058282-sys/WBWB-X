from pathlib import Path

from PIL import Image


ROOT = Path('docs/public/article-assets/service')
POSTERS = (
    'workshop-815.png',
    'workshop-815-agenda.png',
    'workshop-815-benefits.png',
    'workshop-815-reminder.png',
    'workshop-cover.png',
    'workshop-829-agenda.png',
    'workshop-829-benefits.png',
    'workshop-829-reminder.png',
    'workshop-912.png',
    'workshop-912-agenda.png',
    'workshop-912-benefits.png',
)
COVERS = {'workshop-815.png', 'workshop-cover.png', 'workshop-912.png'}


def write_derivative(source: Path, suffix: str, width: int, quality: int) -> None:
    target = source.with_name(f'{source.stem}-{suffix}.webp')
    with Image.open(source) as image:
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(target, 'WEBP', quality=quality, method=6)
    print(f'{target}: {target.stat().st_size} bytes')


for filename in POSTERS:
    path = ROOT / filename
    write_derivative(path, 'display', 900, 88)
    if filename in COVERS:
        write_derivative(path, 'thumb', 240, 82)
