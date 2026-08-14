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

console.log(`\nAVIF payload if every image loaded: ${(total / 1024).toFixed(0)}kb`);
