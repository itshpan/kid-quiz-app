/* ==========================================================================
   stamp.mjs — assemble the deployable site into dist/site.

   Two problems this solves, both of which bit us live.

   1. STALE CODE. Assets were served with a one-hour cache and referenced by
      plain names (`assets/js/store.js`). After a deploy a browser could hold
      the old copy for an hour, so a refresh showed nothing new. Worse, each
      file expires on its own timer, so you could get the NEW deck.js beside a
      CACHED OLD store.js — and since deck.js imports a name that the old
      store.js does not export, that is not graceful degradation, it is a
      blank page.

      Fix: every asset URL carries `?v=<hash of all the code>`. One stamp for
      everything, so the whole set moves together and a half-updated mix
      cannot happen. Deploys land immediately; an unchanged deploy keeps the
      same stamp and stays cached.

   2. SOURCE ON THE PUBLIC SITE. `wrangler pages deploy .` shipped the whole
      repo, so db/setup.sql — which holds the live class codes — was
      downloadable from the site. (.cfignore exists but Pages does not read
      it.) Fix: copy only what the site needs.

   Because /assets/* is served `immutable`, an asset reference that missed its
   stamp would be cached forever and could never be fixed. So the build fails
   if it finds one rather than shipping that trap.
   ========================================================================== */

import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = join(ROOT, 'dist/site');

/* What the running site actually needs. Everything else — db/, docs/,
   tools/, package.json, CLAUDE.md, the git history — stays home. */
const COPY = ['assets', 'content', 'functions', 'practice', '_headers'];
const PAGES = ['index.html', 'course.html', 'lesson.html', 'progress.html',
               'teacher.html', 'settings.html', '_mp.html'];

const walk = async dir => {
    const out = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) out.push(...await walk(p));
        else out.push(p);
    }
    return out;
};

/* The stamp covers every file whose URL we rewrite, so it changes when and
   only when the code does. */
async function version() {
    const files = (await walk(join(ROOT, 'assets')))
        .filter(f => f.endsWith('.js') || f.endsWith('.css'))
        .sort();
    const h = createHash('sha256');
    for (const f of files) h.update(await readFile(f));
    return h.digest('hex').slice(0, 10);
}

/** Add ?v= to every asset URL we know how to spot. */
function rewrite(src, v) {
    return src
        // <script src="assets/js/x.js">, <link href="/assets/css/app.css">
        .replace(/((?:src|href)=["'])(\/?assets\/[^"'?]+\.(?:js|css))(["'])/g,
                 (_, a, url, b) => `${a}${url}?v=${v}${b}`)
        // import … from './x.js'  |  from '/assets/js/x.js'
        .replace(/(\bfrom\s+["'])(\.\/[^"'?]+\.js|\/assets\/[^"'?]+\.js)(["'])/g,
                 (_, a, url, b) => `${a}${url}?v=${v}${b}`);
}

/* A reference that slipped through would be cached under `immutable` and
   become permanent. Catch it here instead of in his browser. */
function unstamped(text) {
    const hits = [];
    const re = /(?:(?:src|href)=["']|\bfrom\s+["'])(\.\/[^"']+\.js|\/?assets\/[^"']+\.(?:js|css))["']/g;
    for (const m of text.matchAll(re)) if (!m[1].includes('?v=')) hits.push(m[1]);
    return hits;
}

async function main() {
    const v = await version();

    await rm(OUT, { recursive: true, force: true });
    await mkdir(OUT, { recursive: true });
    for (const item of COPY) await cp(join(ROOT, item), join(OUT, item), { recursive: true });
    for (const page of PAGES) await cp(join(ROOT, page), join(OUT, page));

    /* Rewrite the copies, never the sources. */
    const targets = (await walk(OUT)).filter(f => /\.(html|js)$/.test(f));
    const problems = [];
    let touched = 0;

    for (const f of targets) {
        const before = await readFile(f, 'utf8');
        const after = rewrite(before, v);
        if (after !== before) { await writeFile(f, after); touched++; }
        const missed = unstamped(after);
        if (missed.length) problems.push(`${relative(OUT, f)} → ${missed.join(', ')}`);
    }

    if (problems.length) {
        console.error('\n✗ asset references with no version stamp:\n');
        for (const p of problems) console.error('   ' + p);
        console.error('\nTeach rewrite() the pattern — /assets/* is immutable, so an');
        console.error('unstamped URL would be cached permanently.\n');
        process.exit(1);
    }

    console.log(`✓ dist/site built · version ${v} · ${touched} files stamped`);
}

main().catch(err => { console.error(err); process.exit(1); });
