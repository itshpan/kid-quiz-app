/* ==========================================================================
   balance-answers.mjs — spread the correct answers across A, B, C and D.

     node tools/balance-answers.mjs                     # every lesson
     node tools/balance-answers.mjs content/science/x.json …

   Why this exists: writing a question, you naturally put the right answer
   first or second and move on. Do that 1153 times and every answer sits in
   the same slot — which is exactly what happened here, and a learner who
   spots it stops reading the options. check-content.mjs fails a lesson that
   leans more than 60% on one position; this fixes it.

   The shuffle is seeded on the file and question text, so it is the same
   every run: no churn in git from re-running it.

   It never changes which option is correct — only where it sits. The script
   checks that itself and refuses to write a file if any answer moved.
   An option that only reads correctly last ("none of these") is pinned there.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const LAST = /^(none of (these|the above)|all of the above|wala sa mga ito)\.?$/i;

/** Deterministic PRNG so a given question always lands the same way. */
function rngFrom(seed) {
    let h = parseInt(createHash('sha256').update(seed).digest('hex').slice(0, 13), 16);
    return () => (h = (h * 48271) % 2147483647) / 2147483647;
}

function shuffle(arr, rnd) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Spread one group's answers evenly, then scatter the slot order. */
function relayout(group, seed) {
    const mc = group.filter(q => q?.type === 'multiple' && Array.isArray(q.options)
                                 && Number.isInteger(q.answerIndex));
    if (!mc.length) return 0;
    const rnd = rngFrom(seed);
    const targets = [];
    while (targets.length < mc.length) targets.push(0, 1, 2, 3);
    const slots = shuffle(targets.slice(0, mc.length), rnd);

    mc.forEach((q, i) => {
        const correct = q.options[q.answerIndex];
        const pinned = q.options.filter(o => LAST.test(o.trim()));
        const movable = shuffle(q.options.filter(o => !pinned.includes(o)), rnd);
        const want = Math.min(slots[i], movable.length - 1);
        movable.splice(movable.indexOf(correct), 1);
        movable.splice(want, 0, correct);
        const next = [...movable, ...pinned];
        q.options = next;
        q.answerIndex = next.indexOf(correct);
    });
    return mc.length;
}

async function lessonFiles() {
    const out = [];
    for (const sub of await readdir(join(ROOT, 'content'), { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        for (const f of await readdir(join(ROOT, 'content', sub.name))) {
            if (f.endsWith('.json')) out.push(join('content', sub.name, f));
        }
    }
    return out.sort();
}

const args = process.argv.slice(2);
const files = args.length ? args : await lessonFiles();
let touched = 0, questions = 0;

for (const rel of files) {
    const path = join(ROOT, rel);
    let lesson;
    try { lesson = JSON.parse(await readFile(path, 'utf8')); } catch { continue; }
    if (!Array.isArray(lesson.quiz)) continue;

    const was = new Map();
    const every = [...lesson.quiz, ...(lesson.cards || []).filter(c => c.question).map(c => c.question)];
    for (const q of every) if (q.options) was.set(q, q.options[q.answerIndex]);

    const n = relayout(lesson.quiz, `${rel}#quiz`)
            + relayout((lesson.cards || []).filter(c => c.question).map(c => c.question), `${rel}#cards`);
    if (!n) continue;

    // Refuse to write if the shuffle moved a correct answer.
    const moved = [...was].filter(([q, text]) => q.options[q.answerIndex] !== text);
    if (moved.length) {
        console.error(`✗ ${rel}: ${moved.length} correct answer(s) changed — not written`);
        process.exitCode = 1;
        continue;
    }
    await writeFile(path, JSON.stringify(lesson, null, 2) + '\n');
    touched++; questions += n;
}

console.log(`✓ ${questions} questions rebalanced across ${touched} lesson${touched === 1 ? '' : 's'}`);
