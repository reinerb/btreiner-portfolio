import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSync, type Font } from 'fontkit';

const fontDir = 'src/fonts';
const siteDir = 'dist';

const named: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function visibleText(html: string): string {
  const body = html.slice(html.indexOf('<body'));
  return body
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity);
}

const pages = readdirSync(siteDir, { recursive: true, encoding: 'utf8' }).filter((file) =>
  file.endsWith('.html'),
);
if (pages.length === 0) throw new Error('No HTML in dist/. Run `pnpm build` first.');

const characters = new Set<string>();
for (const page of pages) {
  for (const char of visibleText(readFileSync(join(siteDir, page), 'utf8'))) {
    if (char.trim()) characters.add(char);
  }
}

let missingAny = false;
for (const file of readdirSync(fontDir).filter((name) => name.endsWith('.woff2'))) {
  const font = openSync(join(fontDir, file)) as Font;
  const missing = [...characters].filter(
    (char) => !font.hasGlyphForCodePoint(char.codePointAt(0) ?? 0),
  );
  if (missing.length > 0) {
    missingAny = true;
    const list = missing.map(
      (char) =>
        `${char} (U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')})`,
    );
    console.error(`${file} is missing: ${list.join(', ')}`);
  }
}

console.log(
  `Checked ${characters.size} characters from ${pages.length} pages against the fonts in ${fontDir}.`,
);
if (missingAny) process.exit(1);
console.log('Every character is covered.');
