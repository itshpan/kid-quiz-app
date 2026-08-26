/* ==========================================================================
   fetch-images.mjs — downloads lesson photographs from Wikimedia Commons
   into assets/img/, and records where each one came from.

     node tools/fetch-images.mjs              # fetch anything missing
     node tools/fetch-images.mjs --force      # re-fetch everything

   Why download rather than hotlink: hotlinked images rot, and hosts block
   cross-site loading. A broken image discovered mid-lesson is worse than no
   image. These are served from our own domain, so they cannot break.

   Commons rate-limits requests from cloud IPs, so every call retries with
   exponential backoff — without it you get a wall of 429s.
   ========================================================================== */

import { readFile, writeFile, mkdir, access, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/img');
const UA = 'LearningLab/1.0 (https://learning-lab-8qx.pages.dev; educational use)';
const WIDTH = 720;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithBackoff(url, { binary = false, tries = 6 } = {}) {
    for (let i = 0; i < tries; i++) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': UA } });
            if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
            if (!res.ok) return { error: `HTTP ${res.status}` };
            return binary
                ? { data: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || '' }
                : { data: await res.json() };
        } catch (err) {
            if (i === tries - 1) return { error: err.message };
            await sleep(2 ** i * 1500);
        }
    }
}

/** Resolves a Commons file title to a thumbnail URL plus its licence. */
async function resolve(title) {
    const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
        action: 'query', format: 'json', titles: `File:${title}`,
        prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(WIDTH)
    });
    const { data, error } = await fetchWithBackoff(url);
    if (error) return { error };

    const page = Object.values(data?.query?.pages || {})[0];
    if (!page || page.missing !== undefined) return { error: 'not found on Commons' };

    const info = page.imageinfo?.[0];
    if (!info) return { error: 'no image info' };
    const meta = info.extmetadata || {};
    const strip = s => String(s || '').replace(/<[^>]*>/g, '').trim();

    return {
        url: info.thumburl || info.url,
        page: info.descriptionurl,
        licence: strip(meta.LicenseShortName?.value) || 'see source',
        artist: strip(meta.Artist?.value) || 'Unknown'
    };
}

const manifest = JSON.parse(await readFile(join(ROOT, 'content/images.json'), 'utf8'));
const force = process.argv.includes('--force');
await mkdir(OUT, { recursive: true });

const credits = {};
let got = 0, skipped = 0, failed = 0;

// Commons serves PNG for some files and JPEG for others. Save with the
// extension that matches what actually arrived, so the server sends the right
// content-type rather than relying on browser sniffing.
const existing = new Set(await readdir(OUT).catch(() => []));
const extFor = (type, url) =>
    /png/i.test(type) || /\.png$/i.test(url) ? 'png' :
    /svg/i.test(type) ? 'svg' : 'jpg';

for (const item of manifest.images) {
    if (!force && [...existing].some(f => f.startsWith(item.id + '.'))) { skipped++; continue; }

    process.stdout.write(`  ${item.id} … `);
    const info = await resolve(item.commons);
    if (info.error) { console.log(`FAILED (${info.error})`); failed++; continue; }

    const img = await fetchWithBackoff(info.url, { binary: true });
    if (img.error) { console.log(`FAILED (${img.error})`); failed++; continue; }

    const ext = extFor(img.type, info.url);
    // Drop any stale copy saved under a different extension.
    for (const f of existing) if (f.startsWith(item.id + '.') && f !== `${item.id}.${ext}`) await unlink(join(OUT, f));
    await writeFile(join(OUT, `${item.id}.${ext}`), img.data);
    credits[item.id] = {
        file: `${item.id}.${ext}`,
        alt: item.alt,
        artist: info.artist,
        licence: info.licence,
        source: info.page
    };
    console.log(`${(img.data.length / 1024).toFixed(0)} KB · ${info.licence}`);
    got++;
    await sleep(1200);   // be a good citizen between downloads
}

await writeFile(join(OUT, 'credits.json'), JSON.stringify(credits, null, 2) + '\n');
console.log(`\n${got} downloaded, ${skipped} already present, ${failed} failed`);
if (failed) {
    console.log('Failures are usually Commons rate-limiting. Re-run and it will pick up where it left off.');
    process.exit(1);
}
