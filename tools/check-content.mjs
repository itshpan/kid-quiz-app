/* ==========================================================================
   check-content.mjs — enforces the limits in docs/WRITING-FOR-ADHD.md.
   Exits non-zero on any violation so it can gate a commit or a CI run.

     node tools/check-content.mjs [lesson.json ...]     (default: all lessons)
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const LIMITS = {
    sentenceWords: 20,
    cardWords: 40,
    pointWords: 18,
    pointsPerCard: 4,
    cardsBetweenCheckpoints: 6
};

const words = s => s.replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length;

function sentences(s) {
    return s.replace(/\*\*/g, '')
        // Don't split on the dot inside "3 mm." style abbreviations or decimals.
        .replace(/(\d)\.(\d)/g, '$1<DOT>$2')
        .split(/(?<=[.!?])\s+/)
        .map(x => x.replace(/<DOT>/g, '.').trim())
        .filter(x => x.split(/\s+/).length > 1);
}

async function lessonFiles() {
    const out = [];
    const base = join(ROOT, 'content');
    for (const dir of await readdir(base, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        for (const f of await readdir(join(base, dir.name))) {
            if (f.endsWith('.json')) out.push(join(base, dir.name, f));
        }
    }
    return out;
}

const args = process.argv.slice(2);
const files = args.length ? args.map(a => join(ROOT, a)) : await lessonFiles();

let problems = 0;
const warn = (file, where, msg) => {
    problems++;
    console.log(`  ${relative(ROOT, file)} · ${where}\n      ${msg}`);
};

for (const file of files) {
    const lesson = JSON.parse(await readFile(file, 'utf8'));
    if (!lesson.cards) continue;    // not a card-format lesson

    console.log(`\n${relative(ROOT, lesson.__file || file)} — ${lesson.cards.length} cards, ${lesson.quiz?.length ?? 0} quiz items`);

    let sinceCheckpoint = 0;

    lesson.cards.forEach((card, i) => {
        const at = `card ${i + 1}${card.title ? ` "${card.title.slice(0, 34)}"` : ''}`;

        if (card.kind === 'checkpoint') { sinceCheckpoint = 0; return; }
        // Reference cards are looked up, not read through, so they're exempt.
        if (card.kind === 'terms') { sinceCheckpoint++; return; }
        sinceCheckpoint++;

        if (sinceCheckpoint > LIMITS.cardsBetweenCheckpoints) {
            warn(file, at, `${sinceCheckpoint} cards since the last checkpoint (max ${LIMITS.cardsBetweenCheckpoints})`);
            sinceCheckpoint = 0;   // report once per run, not every card after
        }

        const body = [card.text, card.caption].filter(Boolean).join(' ');
        if (body && words(body) > LIMITS.cardWords) {
            warn(file, at, `body is ${words(body)} words (max ${LIMITS.cardWords})`);
        }

        if (card.points) {
            if (card.points.length > LIMITS.pointsPerCard) {
                warn(file, at, `${card.points.length} points (max ${LIMITS.pointsPerCard})`);
            }
            card.points.forEach((p, j) => {
                if (words(p) > LIMITS.pointWords) {
                    warn(file, at, `point ${j + 1} is ${words(p)} words (max ${LIMITS.pointWords}): "${p.slice(0, 60)}…"`);
                }
            });
        }

        for (const s of sentences(body || '')) {
            if (words(s) > LIMITS.sentenceWords) {
                warn(file, at, `sentence is ${words(s)} words (max ${LIMITS.sentenceWords}): "${s.slice(0, 70)}…"`);
            }
        }
    });

    // Quiz explanations are read right after a wrong answer — the moment
    // attention is most fragile — so they're held to the same limit.
    (lesson.quiz || []).forEach((q, i) => {
        for (const field of ['text', 'explain']) {
            for (const s of sentences(q[field] || '')) {
                if (words(s) > LIMITS.sentenceWords) {
                    warn(file, `quiz Q${i + 1} (${field})`, `sentence is ${words(s)} words: "${s.slice(0, 70)}…"`);
                }
            }
        }
    });
}

console.log(problems ? `\n✗ ${problems} problem${problems === 1 ? '' : 's'}\n` : '\n✓ all content within limits\n');
process.exit(problems ? 1 : 0);
