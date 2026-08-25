from pathlib import Path

from PIL import Image


ROOT = Path('docs/public/article-assets/service')

for source in sorted(ROOT.glob('guest-*.png')):
    target = source.with_name(f'{source.stem}-display.webp')
    with Image.open(source) as image:
        width = min(900, image.width)
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(target, 'WEBP', quality=86, method=6)
    print(f'{target}: {target.stat().st_size} bytes')
