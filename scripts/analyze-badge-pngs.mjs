import sharp from "sharp";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve("public/badges");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".png"))) {
  const { data, info } = await sharp(resolve(dir, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let transparent = 0;
  let whiteOpaque = 0;
  const pixels = info.width * info.height;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 10) transparent += 1;
    if (a > 200 && r > 240 && g > 240 && b > 240) whiteOpaque += 1;
  }

  console.log(
    `${file}: ${info.width}x${info.height} transparent=${transparent}/${pixels} whiteOpaque=${whiteOpaque}/${pixels}`,
  );
}
