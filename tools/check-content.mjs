/* ==========================================================================
   check-content.mjs — enforces the limits in docs/WRITING-FOR-ADHD.md.
   Exits non-zero on any violation so it can gate a commit or a CI run.

     node tools/check-content.mjs [lesson.json ...]     (default: all lessons)
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

/* The learner's interests are not a nice-to-have — the whole app exists to
   teach through them. Loading the roster here means a lesson that forgets
   them fails the build rather than quietly shipping as a wall of text. */
const INTERESTS = JSON.parse(await readFile(join(ROOT, 'content/interests.json'), 'utf8'));
const KNOWN_LENSES = Object.keys(INTERESTS.lenses);

const LIMITS = {
    sentenceWords: 20,
    cardWords: 40,
    pointWords: 18,
    pointsPerCard: 4,
    cardsBetweenCheckpoints: 5,
    /* The rhythm rule. He is bright and not a weak reader; what he cannot do
       is stay in a block of prose. So prose is capped twice over — by how
       many cards in a row it runs, and by how many words those cards carry —
       and a lesson that is all diagram or all photograph fails too, because
       a mechanism needs a figure and a real thing needs a photograph. */
    textCardsInARow: 3,
    wordsBetweenVisuals: 130,
    minInteractiveVisuals: 1,
    minPhotos: 1,
    minLensesPerLesson: 3,
    maxSamePositionShare: 0.6,    // an answer key that is 100% "A" is free marks
    maxSameLensInARow: 2,
    cardsPerVideo: 15,            // a 60-card lesson may carry 4 videos, a 30-card one 3
    minVideosPerLesson: 3,
    highStimVideosPerLesson: 1
};

/* Cards that are fine to land on straight after a high-stimulation video.
   Anything demanding — a new idea, a new lens — is not, because attention is
   at its worst in the moments after a dopamine spike. */
const OK_AFTER_HIGH_STIM = new Set(['checkpoint', 'break', 'fact', 'recap', 'terms']);

/* Cards that are words on a screen, however they are laid out. A `terms` card
   is a definition list, which reads as prose however it is styled, so it
   counts here even though it is exempt from the checkpoint spacing. */
const TEXT_ONLY = new Set(['open', 'idea', 'lens', 'terms', 'recap', 'story', 'fact', 'break']);

/* Anything that breaks a run of prose. A checkpoint counts: answering
   something is not reading. */
const BREAKS_PROSE = k => !TEXT_ONLY.has(k);

/* Something he can touch and that responds. A picture is not one of these. */
const INTERACTIVE = new Set(['figure', 'explorer', 'diagram', 'model3d']);

/* A photograph or generated image of a real thing, which is the other half:
   a diagram shows a mechanism, a photograph shows him what it looks like in
   the world so he can recognise it there. */
const PHOTO = new Set(['image']);

const words = s => s.replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length;

/** Every word on a card, wherever the renderer puts it. */
function cardWords(c) {
    let n = 0;
    for (const k of ['text', 'body', 'lede', 'caption']) if (typeof c[k] === 'string') n += words(c[k]);
    for (const p of c.points || []) n += words(p);
    for (const t of c.terms || []) n += words(t.def || '');
    return n;
}

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

    /* Two quiz items with the same stem are a content problem before they
       are anything else: "Which is correct?" twice in one paper tells him
       nothing about what is being tested, and he cannot tell the two apart
       when he reviews his answers. It also silently breaks any tool that
       keys a lesson by its question text. */
    {
        const seen = new Map();
        for (const q of lesson.quiz || []) {
            const t = (q.text || '').trim().toLowerCase();
            if (!t) continue;
            if (seen.has(t)) {
                warn(file, `quiz ${seen.get(t) + 1} and ${(lesson.quiz.indexOf(q)) + 1}`,
                    `two questions share the stem "${q.text.slice(0, 48)}" — say what each one is asking`);
            } else seen.set(t, lesson.quiz.indexOf(q));
        }
    }

    /* ---- Rhythm ------------------------------------------------------
       Two caps on prose, because either one alone has a hole in it: three
       short cards in a row are fine, three dense ones are not, and one very
       long card is not fine either. Then two floors on what a lesson must
       carry, so it cannot pass by being all diagram or all photograph. */
    {
        let run = 0, runWords = 0, runStart = 0;
        lesson.cards.forEach((c, i) => {
            if (BREAKS_PROSE(c.kind)) { run = 0; runWords = 0; return; }
            if (run === 0) runStart = i;
            run++;
            /* A glossary is scanned for the one word you wanted, not read
               through, which is why `terms` is already exempt from checkpoint
               spacing. It still counts toward the card run - it is not
               something to look at - but its definitions are not prose he has
               to get through, so they do not count toward the word budget. */
            if (c.kind !== 'terms') runWords += cardWords(c);

            const where = `cards ${runStart + 1}-${i + 1}`;
            if (run > LIMITS.textCardsInARow) {
                warn(file, where,
                    `${run} text cards in a row (max ${LIMITS.textCardsInARow}) — break the run with a figure, a photo or a checkpoint`);
                run = 0; runWords = 0;          // report once per run
            } else if (runWords > LIMITS.wordsBetweenVisuals) {
                warn(file, where,
                    `${runWords} words of prose with nothing to look at (max ${LIMITS.wordsBetweenVisuals}) — break the run`);
                run = 0; runWords = 0;
            }
        });
    }

    const interactive = lesson.cards.filter(c => INTERACTIVE.has(c.kind)).length;
    if (interactive < LIMITS.minInteractiveVisuals) {
        warn(file, 'rhythm',
            `no interactive visual — every lesson needs at least ${LIMITS.minInteractiveVisuals} figure or explorer he can touch`);
    }

    const photos = lesson.cards.filter(c => PHOTO.has(c.kind)).length;
    if (photos < LIMITS.minPhotos) {
        warn(file, 'rhythm',
            `no image card — every lesson needs at least ${LIMITS.minPhotos} picture of the real thing. See docs/IMAGE-PROMPTS.md`);
    }

    // Interest coverage. Every lesson teaches through at least three different
    // lenses, and never stacks the same one up in a run — four car cards in a
    // row is worse than one of each.
    const lensCards = lesson.cards.filter(c => c.kind === 'lens');
    const used = new Set(lensCards.map(c => c.lens));

    for (const c of lensCards) {
        if (!KNOWN_LENSES.includes(c.lens)) {
            warn(file, `lens "${c.lens}"`, `unknown lens — use one of: ${KNOWN_LENSES.join(', ')} (see content/interests.json)`);
        }
    }
    /* Every question carries a time budget, and the answer key has to move
       around. Both of these were wrong for a long time without anyone
       noticing, which is exactly what the checker is for. */
    const asked = [...lesson.quiz, ...lesson.cards.filter(c => c.question).map(c => c.question)];
    for (const q of asked) {
        if (!(Number(q.seconds) > 0)) {
            warn(file, 'timing', `question has no "seconds" budget: "${q.text.slice(0, 44)}"`);
            break;
        }
    }
    const mc = lesson.quiz.filter(q => q.type === 'multiple' && Array.isArray(q.options));
    if (mc.length >= 6) {
        const tally = {};
        for (const q of mc) tally[q.answerIndex] = (tally[q.answerIndex] || 0) + 1;
        const [top, n] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
        if (n / mc.length > LIMITS.maxSamePositionShare) {
            warn(file, 'answer key', `${n} of ${mc.length} answers sit at position ${'ABCD'[top]} — vary them`);
        }
    }

    if (used.size < LIMITS.minLensesPerLesson) {
        warn(file, 'interests', `only ${used.size} lens${used.size === 1 ? '' : 'es'} used (${[...used].join(', ') || 'none'}) — need at least ${LIMITS.minLensesPerLesson}. See content/interests.json`);
    }

    let run = 0, prev = null;
    lesson.cards.forEach((c, i) => {
        if (c.kind !== 'lens') { run = 0; prev = null; return; }
        run = c.lens === prev ? run + 1 : 1;
        prev = c.lens;
        if (run > LIMITS.maxSameLensInARow) {
            warn(file, `card ${i + 1}`, `${run} "${c.lens}" lens cards in a row (max ${LIMITS.maxSameLensInARow}) — rotate the lenses`);
            run = 0;
        }
    });

    // Video pacing. High-stimulation video (fast cuts, shock framing) is
    // genuinely engaging, but it raises the floor: everything calmer
    // afterwards reads as boring. So it's budgeted, not banned.
    const videos = lesson.cards.map((c, i) => ({ c, i })).filter(x => x.c.kind === 'video');
    const highStim = videos.filter(x => x.c.register === 'high');

    // "clip" is a few seconds of footage used as a moving picture. It doesn't
    // interrupt the lesson the way an explainer does, so it isn't budgeted.
    const segments = videos.filter(x => x.c.register !== 'clip');
    const cap = Math.max(LIMITS.minVideosPerLesson, Math.floor(lesson.cards.length / LIMITS.cardsPerVideo));
    if (segments.length > cap) {
        warn(file, 'videos', `${segments.length} video segments in ${lesson.cards.length} cards (max ${cap}) — this is a lesson, not a playlist`);
    }
    if (highStim.length > LIMITS.highStimVideosPerLesson) {
        warn(file, 'videos', `${highStim.length} high-stimulation videos (max ${LIMITS.highStimVideosPerLesson})`);
    }
    for (const { c, i } of videos) {
        if (!['high', 'calm', 'clip'].includes(c.register)) {
            warn(file, `card ${i + 1} "${c.title}"`, 'video card needs "register": "high", "calm" or "clip"');
            continue;
        }
        const next = lesson.cards[i + 1];
        if (c.register === 'high' && next && !OK_AFTER_HIGH_STIM.has(next.kind)) {
            warn(file, `card ${i + 1} "${c.title}"`,
                `high-stimulation video is followed by a "${next.kind}" card — put a checkpoint, fact or break after it, not new material`);
        }
    }

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
