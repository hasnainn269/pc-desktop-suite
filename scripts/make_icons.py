import os
import zlib
import struct
import math

os.makedirs("/public", exist_ok=True)

# 1. Create clean Windows Desktop SVG icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>

  <!-- Outer Monitor Frame -->
  <rect x="76" y="96" width="360" height="240" rx="20" fill="url(#screen)" stroke="#38bdf8" stroke-width="8"/>

  <!-- Screen Header Bar (Windows Titlebar look) -->
  <rect x="76" y="96" width="360" height="34" rx="20" fill="#334155"/>
  <rect x="76" y="114" width="360" height="16" fill="#334155"/>
  <circle cx="106" cy="113" r="5" fill="#f87171"/>
  <circle cx="124" cy="113" r="5" fill="#fbbf24"/>
  <circle cx="142" cy="113" r="5" fill="#34d399"/>
  <text x="256" y="117" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">PC DESKTOP SUITE</text>

  <!-- Windows 4-Tile Logo in screen -->
  <g transform="translate(196, 154)">
    <path d="M 0 0 L 54 0 L 54 44 L 0 44 Z" fill="#38bdf8"/>
    <path d="M 64 0 L 118 0 L 118 44 L 64 44 Z" fill="#60a5fa"/>
    <path d="M 0 54 L 54 54 L 54 98 L 0 98 Z" fill="#0284c7"/>
    <path d="M 64 54 L 118 54 L 118 98 L 64 98 Z" fill="#3b82f6"/>
  </g>

  <!-- Live Pulse Waves / Specs lines -->
  <path d="M 106 280 L 150 280 L 170 260 L 190 300 L 210 270 L 230 280 L 406 280" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Monitor Stand -->
  <path d="M 226 336 L 286 336 L 296 390 L 216 390 Z" fill="#475569"/>
  <!-- Monitor Base -->
  <rect x="176" y="390" width="160" height="18" rx="9" fill="#64748b"/>

  <!-- Windows Badge (bottom right) -->
  <circle cx="410" cy="410" r="46" fill="#0284c7" stroke="#ffffff" stroke-width="4"/>
  <path d="M 390 395 L 407 395 L 407 407 L 390 407 Z" fill="#ffffff"/>
  <path d="M 413 395 L 430 395 L 430 407 L 413 407 Z" fill="#ffffff"/>
  <path d="M 390 413 L 407 413 L 407 425 L 390 425 Z" fill="#ffffff"/>
  <path d="M 413 413 L 430 413 L 430 425 L 413 425 Z" fill="#ffffff"/>
</svg>
'''

with open("/public/icon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

def make_png(filename, size, is_maskable=False):
    # Pure python PNG generator
    width = size
    height = size
    
    # Generate pixel rows (RGBA)
    raw_data = bytearray()
    
    # Precompute center and radii
    cx = width / 2.0
    cy = height / 2.0
    corner_radius = size * (0.0 if is_maskable else 0.22)
    
    for y in range(height):
        raw_data.append(0) # Filter byte: None
        for x in range(width):
            # Check rounded corner
            dx = abs(x - cx) - (cx - corner_radius)
            dy = abs(y - cy) - (cy - corner_radius)
            in_corner = False
            if dx > 0 and dy > 0:
                dist = math.sqrt(dx*dx + dy*dy)
                if dist > corner_radius:
                    in_corner = True
            
            if in_corner and not is_maskable:
                # Transparent outside
                raw_data.extend([0, 0, 0, 0])
                continue
                
            # Background gradient: from (15, 23, 42) to (2, 132, 199)
            t = (x + y) / (2.0 * size)
            r = int(15 + (2 - 15) * t)
            g = int(23 + (132 - 23) * t)
            b = int(42 + (199 - 42) * t)
            a = 255
            
            # Central Monitor graphic
            scale = size / 512.0
            # Monitor body
            mx1, my1 = 80 * scale, 100 * scale
            mx2, my2 = 432 * scale, 340 * scale
            if mx1 <= x <= mx2 and my1 <= y <= my2:
                # Border
                if (x <= mx1 + 6*scale or x >= mx2 - 6*scale or 
                    y <= my1 + 6*scale or y >= my2 - 6*scale):
                    r, g, b = 56, 189, 248 # Cyan border
                elif y <= my1 + 30*scale:
                    r, g, b = 51, 65, 85 # Titlebar
                else:
                    r, g, b = 20, 30, 48 # Inner screen
                    
                    # 4 Windows tiles in center of screen
                    rel_x = (x - 200 * scale) / (112 * scale)
                    rel_y = (y - 160 * scale) / (90 * scale)
                    if 0 <= rel_x <= 1 and 0 <= rel_y <= 1:
                        # 4 squares with 8% gap
                        if not (0.46 <= rel_x <= 0.54 or 0.46 <= rel_y <= 0.54):
                            r, g, b = 56, 189, 248
                            if rel_x > 0.5:
                                r, g, b = 96, 165, 250
            
            # Monitor Stand
            if (216 * scale <= x <= 296 * scale) and (340 * scale <= y <= 390 * scale):
                r, g, b = 71, 85, 105
            # Monitor Base
            if (180 * scale <= x <= 332 * scale) and (390 * scale <= y <= 408 * scale):
                r, g, b = 100, 116, 139

            raw_data.extend([max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)), a])
            
    # Construct PNG file
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = b'IHDR' + ihdr
    ihdr_crc = struct.pack(">I", zlib.crc32(ihdr_chunk) & 0xffffffff)
    
    idat_chunk = b'IDAT' + compressed
    idat_crc = struct.pack(">I", zlib.crc32(idat_chunk) & 0xffffffff)
    
    iend_chunk = b'IEND'
    iend_crc = struct.pack(">I", zlib.crc32(iend_chunk) & 0xffffffff)
    
    with open(filename, "wb") as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        # IHDR
        f.write(struct.pack(">I", len(ihdr)))
        f.write(ihdr_chunk)
        f.write(ihdr_crc)
        # IDAT
        f.write(struct.pack(">I", len(compressed)))
        f.write(idat_chunk)
        f.write(idat_crc)
        # IEND
        f.write(struct.pack(">I", 0))
        f.write(iend_chunk)
        f.write(iend_crc)

make_png("/public/pwa-192x192.png", 192)
make_png("/public/pwa-512x512.png", 512)
make_png("/public/pwa-maskable-512x512.png", 512, is_maskable=True)
make_png("/public/apple-touch-icon.png", 180)
make_png("/public/favicon.ico", 64)

print("Icons generated successfully!")
