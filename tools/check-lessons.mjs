/* ==========================================================================
   check-lessons.mjs — opens every lesson in a real browser, reads the whole
   deck, sits the quiz, and fails on anything that is not a clean run.

     node tools/check-lessons.mjs                      # every lesson
     node tools/check-lessons.mjs science/w1-skeleton.json …

   check-content.mjs reads the JSON and check-figures.mjs measures the SVG.
   Neither of them opens a lesson. This does, and it is the one that keeps
   catching the faults that only exist once the renderer has run:

     · a `terms` card written with `points` instead of `terms`, which threw
       and rendered the entire lesson blank;
     · two cards emitting the same element id, so the second one's button
       did nothing;
     · twenty-one quiz questions sharing the stem "Which is correct?", found
       because this tool could no longer tell them apart either.

   What counts as a failure:
     · a lesson that will not render at all, which is the big one;
     · any uncaught page error while reading or answering;
     · a quiz stem this tool cannot find in the lesson JSON, or an option
       that has gone missing — both mean the deck and the data disagree;
     · a final score below 100%.

   What it CANNOT catch, and this matters: it answers from the same JSON the
   app scores against, so an answer key that is factually wrong but
   internally consistent scores 100% and passes. Flipping an answerIndex is
   invisible here. A score below 100% means the deck and the data have come
   apart — an option rendering differently from the string in the file, or
   two questions sharing a stem so the wrong key gets looked up — not that
   the key is wrong about the world. Only a human reading the questions
   catches that.

   The clock is faked, so a 40-card lesson takes about eight seconds rather
   than the twenty minutes it would take a person.
   ========================================================================== */

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
/* Same resolution dance as check-figures.mjs: playwright is not a project
   dependency, so fall back to the globally installed copy and skip the
   check entirely rather than failing a build on a machine without it. */
let chromium;
try {
    ({ chromium } = await import('playwright'));
} catch {
    try {
        ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs'));
    } catch {
        console.log('\n· playwright not installed — skipping the lesson walk\n');
        process.exit(0);
    }
}

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

/* Option text picks up the A/B/C/D key chip and the markdown, so both sides
   of a comparison get flattened the same way before they are matched. */
const norm = t => t.replace(/^[A-Za-z]\n/, '').replace(/[*_`]/g, '')
                   .replace(/\s+/g, ' ').trim().toLowerCase();

async function lessonFiles() {
    const out = [];
    for (const dir of await readdir(join(ROOT, 'content'), { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        for (const f of await readdir(join(ROOT, 'content', dir.name))) {
            if (f.endsWith('.json')) out.push(`${dir.name}/${f}`);
        }
    }
    return out.sort();
}

const server = createServer(async (req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    try {
        const body = await readFile(join(ROOT, path.slice(1)));
        res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
        res.end(body);
    } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
});

async function walk(page, rel) {
    const lesson = JSON.parse(await readFile(join(ROOT, 'content', rel), 'utf8'));
    if (!lesson.cards) return null;

    /* Answer from the lesson's own key, so a disagreement between the deck
       and the data shows up as a wrong answer rather than passing quietly. */
    const choice = new Map(), typed = new Map(), ordered = new Map();
    for (const q of lesson.quiz ?? []) {
        if (q.type === 'order' && q.items) ordered.set(norm(q.text), q.items);
        else if (q.options) choice.set(norm(q.text), q.options[q.answerIndex]);
        else if (q.type === 'truefalse') choice.set(norm(q.text), q.answer ? 'True' : 'False');
        else if (q.type === 'type' && q.accept) typed.set(norm(q.text), q.accept[0]);
    }

    const problems = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', e => problems.push(`page error: ${e.message}`));

    await page.clock.install();
    await page.goto(`${base}/lesson.html?file=${rel}`, { waitUntil: 'domcontentloaded' });
    await page.clock.runFor(800);
    await page.locator('#start').click();
    await page.waitForSelector('#cardHost .card');

    // ---- read the deck, pressing every control on every figure ----
    for (let i = 0; i < 120; i++) {
        const controls = page.locator('#cardHost .fig-switch button, #cardHost .fig-row');
        const n = await controls.count();
        for (let j = 0; j < n; j++) {
            await controls.nth(j).click({ force: true }).catch(() => {});
            await page.clock.runFor(100);
        }
        const opt = page.locator('#cardHost .option').first();
        if (await opt.count()) { await opt.click(); await page.clock.runFor(150); }
        else if (await page.locator('#cardHost #typeIn').count()) {
            await page.locator('#cardHost #typeIn').fill('x');
            await page.locator('#cardHost #typeGo').click();
            await page.clock.runFor(150);
        } else if (await page.locator('#cardHost .sortable').count()) {
            await page.locator('#cardHost .btn.primary.wide').first().click();
            await page.clock.runFor(150);
        }
        const next = page.locator('#nav button').last();
        if (!await next.count()) break;
        if ((await next.textContent()).trim().startsWith('Finish')) { await next.click(); break; }
        await next.click({ timeout: 4000 }).catch(() => {});
        await page.clock.runFor(120);
    }
    await page.clock.runFor(400);

    // ---- sit the quiz ----
    await page.locator('#startQuiz').click();
    await page.clock.runFor(300);

    for (let i = 0; i < 60; i++) {
        const opts = page.locator('#quizHost .option');
        const ty = page.locator('#quizHost #typeIn');
        const so = page.locator('#quizHost .sortable');
        if (!await opts.count() && !await ty.count() && !await so.count()) break;
        await page.clock.fastForward(19_000);   // past the per-question nudges

        const stem = (await page.locator('#quizHost .qtext, #quizHost h2')
            .first().innerText().catch(() => '')).trim();

        if (await opts.count()) {
            const want = choice.get(norm(stem));
            const texts = (await opts.allInnerTexts()).map(norm);
            if (!want) problems.push(`no key for "${stem.slice(0, 48)}"`);
            else {
                const j = texts.findIndex(t => t === norm(want));
                if (j < 0) problems.push(`option missing for "${stem.slice(0, 48)}"`);
                await opts.nth(Math.max(j, 0)).click();
            }
        } else if (await ty.count()) {
            const want = typed.get(norm(stem));
            if (!want) problems.push(`no typed key for "${stem.slice(0, 48)}"`);
            await ty.fill(want ?? 'x');
            await page.locator('#quizHost #typeGo').click();
        } else {
            /* The sortable uses arrow buttons rather than drag-and-drop so it
               works on touch and by keyboard. That also makes it scriptable:
               selection-sort each item up into its place. */
            const want = ordered.get(norm(stem));
            if (!want) problems.push(`no order key for "${stem.slice(0, 48)}"`);
            else for (let t = 0; t < want.length; t++) {
                const labels = (await page.locator('#quizHost .sort-item .label')
                    .allInnerTexts()).map(x => x.trim());
                let c = labels.indexOf(want[t], t);
                if (c < 0) { problems.push(`order item missing: ${want[t].slice(0, 32)}`); break; }
                while (c > t) {
                    await page.locator('#quizHost .sort-item').nth(c)
                        .locator('[data-move="up"]').click();
                    await page.clock.runFor(60);
                    c--;
                }
            }
            await page.locator('#quizHost .btn.primary.wide').first().click();
        }

        await page.clock.runFor(150);
        const next = page.locator('#quizHost button:visible').last();
        if (!await next.count()) break;
        await next.click({ timeout: 4000 }).catch(() => {});
        await page.clock.runFor(180);
        if (await page.locator('#quizHost .results').count()) break;
    }

    const cells = await page.locator('#quizHost .scorecell').allInnerTexts();
    const score = (cells[0] ?? '').match(/(\d+)\/(\d+)/);
    if (!score) problems.push('no score — the quiz did not finish');
    else if (score[1] !== score[2]) problems.push(`scored ${score[1]}/${score[2]} from its own answer key`);

    return problems;
}

const args = process.argv.slice(2);
const files = args.length ? args.map(a => a.replace(/^content\//, '')) : await lessonFiles();

const page = await browser.newPage({ viewport: { width: 430, height: 1000 } });
await page.addInitScript(() => {
    localStorage.setItem('learningLab_profiles',
        JSON.stringify([{ id: 'check', name: 'Check', avatar: '🦊' }]));
    localStorage.setItem('learningLab_activeProfile', JSON.stringify('check'));
});

let walked = 0, failed = 0;
for (const rel of files) {
    /* A lesson that will not render at all throws out of walk() — which is
       the single most important thing this tool catches, so it must be
       reported as a result rather than ending the run and taking the other
       175 lessons with it. */
    let problems;
    try {
        problems = await walk(page, rel);
    } catch (err) {
        problems = [`did not finish: ${String(err.message).split('\n')[0].slice(0, 120)}`];
    }
    if (problems === null) continue;
    walked++;
    if (problems.length) {
        failed++;
        console.log(`\n  content/${rel}`);
        for (const p of problems) console.log(`      ${p}`);
    }
}

await browser.close();
server.close();

console.log(`\n${walked} lesson${walked === 1 ? '' : 's'} walked`);
if (failed) {
    console.error(`\n✗ ${failed} lesson${failed === 1 ? '' : 's'} with problems\n`);
    process.exit(1);
}
console.log('\n✓ every lesson reads and scores clean\n');
