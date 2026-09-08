/* ==========================================================================
   check-figures.mjs — measures every caption in every figure, in a real
   browser, and fails if any of them runs outside its viewBox.

   Text in an SVG does not wrap and does not warn. A caption three words too
   long is simply clipped by the edge of the card, and it looks fine in the
   source. This is the only way to catch it.

     node tools/check-figures.mjs
   ========================================================================== */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

let chromium;
try {
    ({ chromium } = await import('playwright'));
} catch {
    try {
        ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs'));
    } catch {
        console.log('\n· playwright not installed — skipping the figure check\n');
        process.exit(0);
    }
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const HARNESS = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/app.css">
<div id="h"></div>
<script type="module">
  import { mountFigure, FIGURES } from '/assets/js/figures.js';
  window.__names = Object.keys(FIGURES);
  window.__mount = n => { document.getElementById('h').innerHTML = ''; mountFigure(document.getElementById('h'), n); };
</script>`;

const server = createServer(async (req, res) => {
    const path = req.url.split('?')[0];
    if (path === '/__harness') {
        res.writeHead(200, { 'content-type': 'text/html' });
        return res.end(HARNESS);
    }
    try {
        const body = await readFile(join(ROOT, path.slice(1)));
        res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
        res.end(body);
    } catch {
        res.writeHead(404).end('not found');
    }
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 420, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(`page error: ${e.message}`));

await page.goto(`${base}/__harness`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__names);
const names = await page.evaluate(() => window.__names);

const problems = [];
for (const name of names) {
    await page.evaluate(n => window.__mount(n), name);
    await page.waitForTimeout(30);
    const states = Math.max(await page.locator('#h .fig-switch button').count(), 1);

    for (let i = 0; i < states; i++) {
        if (states > 1) {
            await page.locator('#h .fig-switch button').nth(i).click();
            await page.waitForTimeout(30);
        }
        const over = await page.evaluate(() => {
            const svg = document.querySelector('#h svg');
            if (!svg) return [];
            const w = svg.viewBox.baseVal.width;
            const out = [];
            for (const t of svg.querySelectorAll('text')) {
                if (!t.textContent.trim()) continue;
                const len = t.getComputedTextLength();
                const x = parseFloat(t.getAttribute('x') || 0);
                const anchor = getComputedStyle(t).textAnchor;
                const left = anchor === 'middle' ? x - len / 2 : anchor === 'end' ? x - len : x;
                if (left + len > w || left < 0) {
                    out.push({ text: t.textContent.trim().slice(0, 44), left: Math.round(left), right: Math.round(left + len), w });
                }
            }
            return out;
        });
        for (const o of over) {
            problems.push(`  ${name} · state ${i + 1}\n      "${o.text}" spans ${o.left}–${o.right} in a ${o.w}-wide viewBox`);
        }
    }
}

await browser.close();
server.close();

console.log(`\n${names.length} figures measured`);
if (errors.length) problems.unshift(...errors.map(e => '  ' + e));
console.log(problems.length ? problems.join('\n') + `\n\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}\n` : '\n✓ every caption fits\n');
process.exit(problems.length ? 1 : 0);
