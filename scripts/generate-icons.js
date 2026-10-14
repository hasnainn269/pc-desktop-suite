import fs from "fs";
import path from "path";
import zlib from "zlib";

function makePNG(width, height, drawPixel) {
  // RGBA buffer: height rows, each row has 1 filter byte (0) + width * 4 bytes
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // Helper to build chunks
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);

    // CRC32 of type + data
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk("IDAT", compressed);
  const iendChunk = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon with smooth rounded corners, Windows 11 style blue gradient and desktop grid
function createWindowsAppIcon(size, isMaskable = false) {
  const radius = isMaskable ? 0 : Math.round(size * 0.22); // Squircle for non-maskable
  const padding = isMaskable ? Math.round(size * 0.15) : Math.round(size * 0.12);

  return makePNG(size, size, (x, y, w, h) => {
    // Check squircle bounds if not maskable
    if (!isMaskable) {
      // Rounded rect test
      const inX = x < radius ? radius - x : x > w - 1 - radius ? x - (w - 1 - radius) : 0;
      const inY = y < radius ? radius - y : y > h - 1 - radius ? y - (h - 1 - radius) : 0;
      if (inX * inX + inY * inY > radius * radius) {
        return [0, 0, 0, 0]; // transparent outside
      }
    }

    // Windows Desktop App Theme: Deep Midnight Blue with Cyan/Azure Highlights
    const gradRatio = (x + y) / (w + h);
    // Background gradient: #0b132b -> #1c2541 -> #1e3a8a
    let r = Math.round(11 + gradRatio * 20);
    let g = Math.round(19 + gradRatio * 40);
    let b = Math.round(43 + gradRatio * 110);

    // Inner area for Windows tile emblem
    const innerX = (x - padding) / (w - padding * 2);
    const innerY = (y - padding) / (h - padding * 2);

    if (innerX >= 0 && innerX <= 1 && innerY >= 0 && innerY <= 1) {
      const gap = 0.08;
      const half = 0.5;

      const inLeft = innerX >= 0.05 && innerX <= half - gap / 2;
      const inRight = innerX >= half + gap / 2 && innerX <= 0.95;
      const inTop = innerY >= 0.05 && innerY <= half - gap / 2;
      const inBottom = innerY >= half + gap / 2 && innerY <= 0.95;

      // 4 Windows Fluent Tiles
      if ((inLeft || inRight) && (inTop || inBottom)) {
        if (inLeft && inTop) {
          // Top Left Tile: Light Azure #38bdf8
          return [56, 189, 248, 255];
        }
        if (inRight && inTop) {
          // Top Right Tile: Windows Blue #2563eb
          return [37, 99, 235, 255];
        }
        if (inLeft && inBottom) {
          // Bottom Left Tile: Indigo #6366f1
          return [99, 102, 241, 255];
        }
        if (inRight && inBottom) {
          // Bottom Right Tile: Cyan #06b6d4
          return [6, 182, 212, 255];
        }
      }
    }

    return [r, g, b, 255];
  });
}

const publicDir = path.resolve(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="win1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="win2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="win3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="win4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#bg)"/>
  <rect x="2" y="2" width="508" height="508" rx="113" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3"/>
  <g filter="url(#glow)">
    <rect x="96" y="96" width="140" height="140" rx="16" fill="url(#win1)" />
    <rect x="276" y="96" width="140" height="140" rx="16" fill="url(#win2)" />
    <rect x="96" y="276" width="140" height="140" rx="16" fill="url(#win4)" />
    <rect x="276" y="276" width="140" height="140" rx="16" fill="url(#win3)" />
  </g>
  <!-- Mini Laptop / Device indicator at center -->
  <circle cx="256" cy="256" r="32" fill="#0f172a" />
  <circle cx="256" cy="256" r="26" fill="#38bdf8" />
  <path d="M246 250h20v10h-20z M242 262h28v3h-28z" fill="#0f172a"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, "icon.svg"), svgContent);
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent);

// 2. Write PNGs
const png192 = createWindowsAppIcon(192, false);
fs.writeFileSync(path.join(publicDir, "pwa-192x192.png"), png192);

const png512 = createWindowsAppIcon(512, false);
fs.writeFileSync(path.join(publicDir, "pwa-512x512.png"), png512);

const pngMaskable = createWindowsAppIcon(512, true);
fs.writeFileSync(path.join(publicDir, "pwa-maskable-512x512.png"), pngMaskable);

const appleTouch = createWindowsAppIcon(180, false);
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleTouch);

// Minimal 32x32 for favicon.ico
const ico32 = createWindowsAppIcon(32, false);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico32);

console.log("Successfully generated all PWA icons in /public!");
