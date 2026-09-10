"""Optimalkan logo sekolah & OSIS untuk web.

- Logo asli (ratusan KB) -> 128px, palet 256 warna + dither.
- Ditampilkan di header hanya ~32-44px, jadi 128px cukup (termasuk retina).
- Kualitas visual nyaris identik (selisih rata-rata <4/255) tapi ukuran turun ~98%.

Jalankan: python scripts/optimize-logos.py
Backup asli tersimpan di public/_logo-original/ (tidak di-commit ke git).
"""
from PIL import Image
import os

SPECS = [
    ("public/_logo-original/logo-osis.png", "public/logo-osis.png"),
    ("public/_logo-original/logo-sekolah.png", "public/logo-sekolah.png"),
]
SIZE = 128

for src, dst in SPECS:
    im = Image.open(src).convert("RGBA")
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
    q.save(dst, "PNG", optimize=True)
    print(f"{dst}: {os.path.getsize(dst) / 1024:.1f} KB ({SIZE}x{SIZE})")
