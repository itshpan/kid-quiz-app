/* ==========================================================================
   make-images.mjs — generates the lesson photographs listed in
   content/images.json and writes them into assets/img/.

     node tools/make-images.mjs                  # anything not yet generated
     node tools/make-images.mjs --force id …     # regenerate these ids
     node tools/make-images.mjs --dry            # print what it would do

   Why this exists: 173 of 176 lessons had no picture in them. A diagram can
   show a mechanism, which is why figures.js exists and is still the first
   choice for one — but a diagram cannot show him what kamote actually looks
   like on a table, and "GO foods" means nothing until he can recognise one.

   The key is attached to this environment as a network secret, so the
   Authorization header below is a placeholder that the egress proxy replaces.
   There is no key in this file, in the repo, or in the environment variables.

   Images are generated at 1536×1024 and then downscaled to 720px wide, which
   is the width the card renders at on a phone. The full-size original is
   thrown away: shipping a 1.9MB PNG to a kid on mobile data to display it at
   720px is the kind of thing that makes an app feel broken.
   ========================================================================== */

import { readFile, writeFile, mkdir, access, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';

const run = promisify(execFile);
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = join(ROOT, 'assets/img');
const MANIFEST = join(ROOT, 'content/images.json');
const CREDITS = join(OUT, 'credits.json');

const MODEL = 'gpt-image-2';
const WIDTH = 720;            // the width a card actually renders at
const QUALITY = 82;
const CONCURRENCY = 4;

/* ---------------------------------------------------------------------------
   House styles.

   Three, because the lessons need three different jobs done and a single
   style does none of them well.

   `photo` is the one that matters most and is the reason this tool exists:
   he should be able to put the word and the real object together. No styling
   tricks, no illustration — a clear photograph of the actual thing.

   `render3d` is the look of those short 3D fact videos he watches: one
   object, plain background, slightly oversized and odd, explaining exactly
   one thing. It suits anything that has no photograph — a cross-section, an
   invisible process, a thing happening inside a body.

   `meme` is a visual joke with no text in it. The text of a meme has to live
   in the card, not in the pixels, for the same reason every other label does:
   it must scale with his text-size setting and stay translatable.
--------------------------------------------------------------------------- */
const STYLES = {
    photo: 'Style: a clear, well-lit documentary photograph. Natural daylight, '
         + 'soft shadows, shallow depth of field, neutral pale background, nothing '
         + 'staged or advertising-like. Absolutely no text, no letters, no numbers, '
         + 'no logos, no watermarks anywhere in the image. No people unless the '
         + 'subject requires them, and never a recognisable face.',

    render3d: 'Style: a simple 3D render on a plain soft-grey seamless background, '
            + 'like a short explainer animation. One subject, centred, slightly '
            + 'oversized, matte clay-like materials, soft even studio light, gentle '
            + 'contact shadow. Clean and slightly odd rather than photoreal or cute. '
            + 'Absolutely no text, no letters, no numbers, no labels, no arrows.',

    meme: 'Style: a bold, funny, flat illustration with thick confident outlines and '
        + 'a warm limited palette, like an internet reaction image. Exaggerated and '
        + 'expressive. Absolutely no text, no letters, no numbers, no speech bubbles '
        + 'and no captions anywhere in the image — the joke is carried by the picture '
        + 'alone. No real or recognisable person.',

    diagramish: 'Style: clean flat vector illustration, minimal, generous negative '
              + 'space. Warm amber #C2761A for anything emphasised, muted blue #4A6FA5 '
              + 'for anything secondary, warm off-white #FBF8F3 background, dark '
              + 'charcoal #23222A linework. No gradients, no drop shadows, no '
              + 'photorealism. Absolutely no text, no letters, no numbers, no labels.'
};

/* Landscape by default: a square image eats a whole phone screen and pushes
   the words it is supposed to support below the fold. */
const SIZES = { wide: '1536x1024', square: '1024x1024', tall: '1024x1536' };

const exists = p => access(p).then(() => true, () => false);

async function generate(id, spec) {
    const style = STYLES[spec.style];
    if (!style) throw new Error(`${id}: unknown style "${spec.style}"`);
    const size = SIZES[spec.size || 'wide'];

    /* curl rather than fetch, deliberately. Node's global fetch ignores
       HTTPS_PROXY, so it goes straight out, misses the egress proxy, and the
       placeholder Authorization header below arrives at OpenAI unreplaced —
       which fails as a 401 that looks like a bad key rather than a routing
       problem. curl honours the proxy, so the real key is substituted there. */
    const body = join(OUT, `.${id}.req.json`);
    const resp = join(OUT, `.${id}.resp.json`);
    await writeFile(body, JSON.stringify({
        model: MODEL,
        prompt: `${spec.prompt}\n\n${style}`,
        size,
        n: 1
    }));

    const { stdout: code } = await run('curl', [
        '-sS', '-m', '600', '-o', resp, '-w', '%{http_code}',
        'https://api.openai.com/v1/images/generations',
        '-H', 'Authorization: Bearer placeholder',
        '-H', 'Content-Type: application/json',
        '-d', `@${body}`
    ], { maxBuffer: 1 << 20 });
    await unlink(body);

    if (code.trim() !== '200') {
        const detail = await readFile(resp, 'utf8').catch(() => '');
        await unlink(resp).catch(() => {});
        throw new Error(`${id}: HTTP ${code.trim()} ${detail.slice(0, 200).replace(/\s+/g, ' ')}`);
    }

    const json = JSON.parse(await readFile(resp, 'utf8'));
    await unlink(resp);
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error(`${id}: no image in response`);

    const tmp = join(OUT, `.${id}.raw.png`);
    const final = join(OUT, `${id}.jpg`);
    await writeFile(tmp, Buffer.from(b64, 'base64'));
    await run('convert', [tmp, '-resize', `${WIDTH}x`, '-quality', String(QUALITY), '-strip', final]);
    await unlink(tmp);
    return final;
}

async function main() {
    const force = process.argv.includes('--force');
    const dry = process.argv.includes('--dry');
    const only = process.argv.slice(2).filter(a => !a.startsWith('--'));

    const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
    const credits = JSON.parse(await readFile(CREDITS, 'utf8').catch(() => '{}'));
    await mkdir(OUT, { recursive: true });

    const todo = [];
    for (const [id, spec] of Object.entries(manifest.images)) {
        if (only.length && !only.includes(id)) continue;
        if (!force && await exists(join(OUT, `${id}.jpg`))) continue;
        todo.push([id, spec]);
    }

    if (!todo.length) { console.log('✓ every image in the manifest already exists'); return; }
    console.log(`${todo.length} image${todo.length === 1 ? '' : 's'} to generate${dry ? ' (dry run)' : ''}`);
    if (dry) { todo.forEach(([id, s]) => console.log(`  ${id}  [${s.style}]  ${s.prompt.slice(0, 70)}…`)); return; }

    let done = 0;
    const failures = [];
    const queue = [...todo];

    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) {
            const [id, spec] = queue.shift();
            try {
                await generate(id, spec);
                credits[id] = {
                    file: `${id}.jpg`,
                    alt: spec.alt,
                    artist: `Generated with OpenAI ${MODEL}`,
                    licence: 'Generated for this project',
                    source: spec.prompt
                };
                console.log(`  ✓ ${++done}/${todo.length}  ${id}`);
            } catch (err) {
                failures.push(err.message);
                console.log(`  ✗ ${++done}/${todo.length}  ${err.message}`);
            }
        }
    }));

    await writeFile(CREDITS, JSON.stringify(credits, null, 2) + '\n');
    if (failures.length) {
        console.error(`\n✗ ${failures.length} failed. Re-run to retry just those.`);
        process.exit(1);
    }
    console.log('\n✓ all generated');
}

main().catch(err => { console.error(err); process.exit(1); });
