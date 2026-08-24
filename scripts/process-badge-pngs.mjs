/**
 * Remove outer white backgrounds from badge PNGs so CSS alpha masks
 * produce sticker silhouettes instead of full squares.
 *
 * Usage: node scripts/process-badge-pngs.mjs
 */

import sharp from "sharp";
import { readdirSync, renameSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BADGE_DIR = resolve("public/badges");

function isBackgroundPixel(data, index) {
  const offset = index * 4;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3];
  if (a < 10) return true;

  const isWhite = r > 235 && g > 235 && b > 235;
  const isBlack = r < 20 && g < 20 && b < 20;
  return isWhite || isBlack;
}

function removeOuterWhiteBackground(data, width, height) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = [];

  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    if (!isBackgroundPixel(data, index)) return;
    visited[index] = 1;
    queue.push(index);
  }

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.pop();
    if (index === undefined) break;

    data[index * 4 + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }
}

const files = readdirSync(BADGE_DIR).filter((file) => file.endsWith(".png"));

for (const file of files) {
  const inputPath = resolve(BADGE_DIR, file);
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  removeOuterWhiteBackground(pixels, info.width, info.height);

  const tempPath = join(tmpdir(), `msc-badge-${file}`);
  await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(tempPath);

  try {
    unlinkSync(inputPath);
  } catch {
    // ignore if missing
  }
  renameSync(tempPath, inputPath);

  console.log(`Processed ${file}`);
}

console.log("Badge PNG background removal complete.");
