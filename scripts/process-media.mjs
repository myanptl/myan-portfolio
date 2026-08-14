// Encodes raw captures in .capture/ into AVIF + WebP at two widths.
// Run: node scripts/process-media.mjs
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = '.capture';
const OUT = 'public/work';
const WIDTHS = [1440, 800];

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));
if (files.length === 0) {
  console.error(`No PNGs in ${SRC}/`);
  process.exit(1);
}

let total = 0;

for (const file of files) {
  const { name } = parse(file);
  const input = join(SRC, file);

  for (const width of WIDTHS) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });

    const avifPath = join(OUT, `${name}-${width}.avif`);
    const webpPath = join(OUT, `${name}-${width}.webp`);

    await base.clone().avif({ quality: 58, effort: 6 }).toFile(avifPath);
    await base.clone().webp({ quality: 76 }).toFile(webpPath);

    const [a, w] = await Promise.all([stat(avifPath), stat(webpPath)]);
    total += a.size;
    console.log(
      `${name}-${width}  avif ${(a.size / 1024).toFixed(0)}kb  webp ${(w.size / 1024).toFixed(0)}kb`,
    );
  }
}

// Full-page captures. These are tall (6000px+) and get panned vertically
// inside the takeover window, so the whole site plays through rather than
// sitting cropped. Encoded at one width only, since they are always full bleed.
const FULL_SRC = join(SRC, 'full');
const FULL_WIDTH = 1100;

try {
  const fullFiles = (await readdir(FULL_SRC)).filter((f) => f.endsWith('.png'));

  // Cap how much of each page is kept. Panning a full 6000px page spends most
  // of its travel on whitespace between sections; the top few screens are
  // where the actual design lives.
  const MAX_TALL = 1950;

  for (const file of fullFiles) {
    const { name } = parse(file);
    const meta = await sharp(join(FULL_SRC, file)).metadata();

    const base = sharp(join(FULL_SRC, file))
      .extract({
        left: 0,
        top: 0,
        width: meta.width,
        height: Math.min(meta.height, Math.round((MAX_TALL * meta.width) / FULL_WIDTH)),
      })
      .resize({ width: FULL_WIDTH, withoutEnlargement: true });

    const avifPath = join(OUT, `${name}-full.avif`);
    const webpPath = join(OUT, `${name}-full.webp`);

    await base.clone().avif({ quality: 52, effort: 6 }).toFile(avifPath);
    await base.clone().webp({ quality: 72 }).toFile(webpPath);

    const [a, outMeta] = await Promise.all([stat(avifPath), sharp(avifPath).metadata()]);
    total += a.size;
    console.log(
      `${name}-full  ${outMeta.width}x${outMeta.height}  avif ${(a.size / 1024).toFixed(0)}kb`,
    );
  }
} catch {
  console.log('(no .capture/full/ directory, skipping full-page captures)');
}

console.log(`\nAVIF payload if every image loaded: ${(total / 1024).toFixed(0)}kb`);
