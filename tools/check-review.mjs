/* ==========================================================================
   check-review.mjs — proves the wrong-answer memory actually works.

     node tools/check-review.mjs

   This is the fourth checker, and it exists because the other three cannot
   see this feature at all. check-content reads the JSON, check-figures
   measures the SVG, and check-lessons sits every quiz with a FRESH profile,
   which by definition has no history: it never has a missed question to
   carry, so it would pass whether any of this worked or not.

   What a reviewer is for is that he corrects a wrong answer and then meets
   it again. Before this existed the quiz computed exactly which questions he
   got wrong, showed them once, and threw the list away. A score survived and
   the only thing worth practising did not.

   Six behaviours, each of which has been broken at least once while being
   written:
     1. a missed question is persisted, with its objective and itself;
     2. "Redo the N I missed" asks only those;
     3. a practice run moves mastery but never the lesson score or XP;
     4. a question missed in week 1 comes back at the top of a later week;
     5. a carried question is graded and remembered but is NOT counted in
        the host lesson's score, because week 3's mistake must not dent the
        week 9 result;
     6. two consecutive correct answers retire it, by MARKING it mastered
        rather than deleting it. Deleting looked tidier and was wrong: an
        absent record cannot be told apart from one that was never missed on
        that device, so a stale phone would resurrect a finished question.
   ========================================================================== */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
    try { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
    catch { console.log('\n· playwright not installed — skipping the review check\n'); process.exit(0); }
}

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
                '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png',
                '.svg':'image/svg+xml' };

const server = createServer(async (req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    try {
        const b = await readFile(join(ROOT, p.slice(1)));
        res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
        res.end(b);
    } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });

const problems = [];
const check = (name, got, want) => {
    const pass = JSON.stringify(got) === JSON.stringify(want);
    console.log(`  ${pass ? '✓' : '✗'} ${name}`);
    if (!pass) problems.push(`${name}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
};

async function newPage(init, arg) {
    const page = await browser.newPage({ viewport: { width: 430, height: 1100 } });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.route('**/*', r => {
        const u = r.request().url();
        return (u.startsWith(base) || u.startsWith('data:') || u.startsWith('about:'))
            ? r.continue() : r.abort();
    });
    await page.addInitScript(init, arg);
    page.__errs = errs;
    return page;
}

/* Walk the deck without reading it, to reach the quiz. */
async function toQuiz(page, file) {
    await page.clock.install();
    await page.goto(`${base}/lesson.html?file=${file}`, { waitUntil: 'domcontentloaded' });
    await page.clock.runFor(800);
    await page.locator('#start').click();
    await page.waitForSelector('#cardHost .card');
    for (let i = 0; i < 160; i++) {
        const o = page.locator('#cardHost .option').first();
        if (await o.count()) { await o.click(); await page.clock.runFor(110); }
        else if (await page.locator('#cardHost #typeIn').count()) {
            await page.locator('#cardHost #typeIn').fill('x');
            await page.locator('#cardHost #typeGo').click();
            await page.clock.runFor(110);
        } else if (await page.locator('#cardHost .sortable').count()) {
            await page.locator('#cardHost .btn.primary.wide').first().click();
            await page.clock.runFor(110);
        } else if (await page.locator('#cardHost .skel [data-bone]').count()) {
            await page.locator('#cardHost .skel [data-bone]').first().click({ force: true });
            await page.clock.runFor(110);
        }
        const n = page.locator('#nav button').last();
        if (!await n.count()) break;
        if ((await n.textContent()).trim().startsWith('Finish')) { await n.click(); break; }
        await n.click({ timeout: 4000 }).catch(() => {});
        await page.clock.runFor(100);
    }
    await page.clock.runFor(400);
    await page.locator('#startQuiz').click();
    await page.clock.runFor(300);
}

/* Sit the quiz. `choose` returns the option index to click for a stem. */
async function sitQuiz(page, choose) {
    const stems = [];
    for (let i = 0; i < 70; i++) {
        const opts = page.locator('#quizHost .option');
        const ty = page.locator('#quizHost #typeIn');
        const so = page.locator('#quizHost .sortable');
        if (!await opts.count() && !await ty.count() && !await so.count()) break;
        await page.clock.fastForward(19_000);
        const stem = (await page.locator('#quizHost .qtext, #quizHost h2')
            .first().innerText().catch(() => '')).trim().split('\n')[0];
        stems.push(stem);
        if (await opts.count()) {
            const n = await opts.count();
            await opts.nth(Math.max(0, Math.min(choose(stem, 'multiple') ?? 0, n - 1))).click();
        } else if (await ty.count()) {
            await ty.fill(String(choose(stem, 'type') ?? 'x'));
            await page.locator('#quizHost #typeGo').click();
        } else {
            await page.locator('#quizHost .btn.primary.wide').first().click();
        }
        await page.clock.runFor(150);
        const nx = page.locator('#quizHost button:visible').last();
        if (!await nx.count()) break;
        await nx.click({ timeout: 4000 }).catch(() => {});
        await page.clock.runFor(180);
        if (await page.locator('#quizHost .results').count()) break;
    }
    await page.clock.runFor(300);
    return stems;
}

const SEED = ([q, right]) => {
    try {
        localStorage.setItem('learningLab_profiles',
            JSON.stringify([{ id: 'rv', name: 'Check', avatar: '🦊' }]));
        localStorage.setItem('learningLab_activeProfile', JSON.stringify('rv'));
        if (!q) return;
        /* Mirrors store.js questionId(): two FNV-1a passes. If that function
           changes, this check must change with it, and failing loudly here is
           the point: a changed id silently orphans every stored miss. */
        const h = (s, seed) => { let x = seed;
            for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
            return (x >>> 0).toString(36); };
        const k = 'math-t2-w1|' + q.text.replace(/\s+/g, ' ').trim();
        const qid = h(k, 0x811c9dc5) + h(k, 0x01000193);
        localStorage.setItem('learningLab_progress_rv', JSON.stringify({
            xp: 0, lessonsCompleted: [], quizScores: {}, deckPosition: {},
            streak: 0, lastPlayDate: null, practiceDays: [],
            missed: { [qid]: { lessonId: 'math-t2-w1', objective: q.objective,
                               text: q.text, q, wrong: 2, right, lastAt: '2026-01-01T00:00:00Z' } }
        }));
    } catch {}
};

const read = p => p.evaluate(() => JSON.parse(localStorage.getItem('learningLab_progress_rv') || '{}'));
const SRC = 'math/t2-w1-percentages.json';
const HOST = 'math/t2-w3-exponential-form.json';
const srcLesson = JSON.parse(await readFile(join(ROOT, 'content', SRC), 'utf8'));
const hostLesson = JSON.parse(await readFile(join(ROOT, 'content', HOST), 'utf8'));
const seedQ = srcLesson.quiz[0];

// ---- 1-3: miss everything, then redo only the misses ----
console.log('\nmissing every question, then redoing only those');
{
    const page = await newPage(SEED, [null, 0]);
    await toQuiz(page, SRC);
    await sitQuiz(page, (stem, kind) => {
        if (kind === 'type') return 'definitely-not-the-answer';
        const q = (srcLesson.quiz || []).find(x => x.text && stem.includes(x.text.slice(0, 28)));
        return q && q.answerIndex === 0 ? 1 : 0;        // never the key
    });
    const before = await read(page);
    const n = Object.keys(before.missed || {}).length;
    check('misses are persisted', n > 0, true);

    /* The review list must state the correct answer. 77% of explanations
       never do, by design, because at answer time the right option is lit
       up beside them. Here it is not, so without the answer this list is a
       question and a cryptic hint. */
    const panel = await page.locator('#quizHost').innerText();
    check('the review list is headed as answers to remember',
        /answers to remember/i.test(panel), true);
    /* Count the answer elements, do not search the text for answer strings.
       Several explanations legitimately contain the answer already ("3
       divided by 4 is 0.75, which is 75%"), so a text search passed even
       with the answer markup deleted. One .tkey-a per listed question is
       the thing that actually has to be true. */
    const cards = await page.locator('#quizHost .tkey').count();
    const answers = await page.locator('#quizHost .tkey-a').count();
    check('every question in the review list states its answer',
        [cards === n, answers], [true, cards]);
    const one = Object.values(before.missed || {})[0] || {};
    check('a record carries its objective and the question',
        [!!one.objective, !!one.q, one.right], [true, true, 0]);

    const redo = page.locator('#quizHost #redo');
    check('a redo button is offered', await redo.count() > 0, true);
    check('it names the number missed',
        (await redo.first().innerText()).trim(), `Redo the ${n} I missed`);

    await redo.first().click();
    await page.clock.runFor(300);
    const asked = await sitQuiz(page, (_s, kind) => (kind === 'type' ? 'x' : 0));
    check('the redo asks only the missed ones', asked.length, n);

    const after = await read(page);
    const sid = srcLesson.id;
    check('a practice run leaves the lesson score alone',
        [after.quizScores?.[sid]?.correct, after.quizScores?.[sid]?.total],
        [before.quizScores?.[sid]?.correct, before.quizScores?.[sid]?.total]);
    check('a practice run awards no XP', after.xp, before.xp);
    check('no page errors', page.__errs, []);
    await page.close();
}

// ---- 4-6: carry into a later week, and retire at two ----
for (const [seededRight, label] of [[0, 'one of two correct'], [1, 'the second correct']]) {
    console.log(`\ncarrying a week 1 miss into week 3 (${label})`);
    const page = await newPage(SEED, [seedQ, seededRight]);
    await toQuiz(page, HOST);
    /* Every host question must be answered CORRECTLY here, or the expected
       score below is calibrated against a wrong baseline and the check stops
       meaning anything. truefalse carries `answer`, not `answerIndex`, and
       renders True then False in that fixed order; only `order` items are
       shuffled, so an index is safe for the rest. */
    const keyFor = q => q.type === 'truefalse' ? (q.answer ? 0 : 1) : (q.answerIndex ?? 0);
    const stems = await sitQuiz(page, (stem, kind) => {
        if (stem.includes(seedQ.text.slice(0, 25))) return keyFor(seedQ);
        const q = (hostLesson.quiz || []).find(x => x.text && stem.includes(x.text.slice(0, 25)));
        if (kind === 'type') return q?.accept?.[0] ?? 'x';
        return q ? keyFor(q) : 0;
    });
    check('the carried question is asked first',
        stems[0]?.includes(seedQ.text.slice(0, 20)), true);
    check('it is asked in addition to the whole host quiz',
        stems.length, (hostLesson.quiz || []).length + 1);

    const res = await page.locator('#quizHost .results').innerText();
    const m = res.match(/(\d+)\/(\d+)/) || [];
    const hostN = (hostLesson.quiz || []).length;
    /* Both halves of the fraction matter and for different reasons. The
       denominator proves the carried question was not added to the total;
       the numerator proves it was not added to the marks either. Asserting
       only the denominator let a reintroduced scoring bug through, which
       showed up as an impossible 13/12. */
    check('the host score excludes it, numerator and denominator',
        [Number(m[1]), Number(m[2])], [hostN, hostN]);
    check('and the results screen says so', /earlier weeks/.test(res), true);

    const p = await read(page);
    const hostScore = p.quizScores?.[hostLesson.id];
    check('the recorded score is never more than its total',
        [hostScore?.correct, hostScore?.total], [hostN, hostN]);
    const rec = Object.values(p.missed || {}).find(m => m.lessonId === 'math-t2-w1');
    if (seededRight === 0) {
        check('a correct answer advances the streak', [rec?.right, !!rec?.q], [1, true]);
    } else {
        check('two correct answers retire it, kept and marked rather than deleted',
            [!!rec, rec?.right, rec?.q === undefined], [true, 2, true]);
    }
    check('no page errors', page.__errs, []);
    await page.close();
}

await browser.close();
server.close();

if (problems.length) {
    console.error(`\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
    for (const p of problems) console.error(`      ${p}`);
    console.error('');
    process.exit(1);
}
console.log('\n✓ the wrong-answer memory works end to end\n');
