/* ==========================================================================
   store.js — profiles + per-learner progress.

   Local storage is the working copy, so the app is instant and works offline.
   When a class code is linked, sync.js mirrors progress to Cloudflare D1 so it
   follows the learner between devices. Nothing outside this file touches
   storage of either kind.
   ========================================================================== */

import { push, pull, isLinked } from './sync.js';

const K = {
    profiles: 'learningLab_profiles',
    active: 'learningLab_activeProfile',
    progress: id => `learningLab_progress_${id}`,
    settings: 'learningLab_settings',
    term: 'learningLab_term',
    // legacy keys from the single-file quiz app, read once for migration
    legacyProfiles: 'kidQuizApp_users',
    legacyActive: 'kidQuizApp_activeUser'
};

/* ---------- Grown-up settings ----------
   Device-level, not per-learner, and deliberately not reachable from any
   learner-facing screen — settings.html asks for the teacher code first.
   A learner who opens devtools can still change these; this keeps an eleven
   year old out of his own pacing rules, which is all it is for.

   `timerMode` never hides the budget-vs-elapsed comparison. That is the point
   of the feature and is always on. It only changes which way the clock reads. */

const DEFAULT_SETTINGS = {
    timerMode: 'countup',   // 'countup' — time climbs | 'countdown' — budget drains
    nudges: true,           // the two gentle thresholds inside a question
    sessionTimer: true      // running clock on the deck and the quiz
};

export function getSettings() {
    return { ...DEFAULT_SETTINGS, ...read(K.settings, {}) };
}

export function saveSettings(patch) {
    const next = { ...getSettings(), ...patch };
    write(K.settings, next);
    return next;
}

/* Which term he is looking at. A view preference, not progress: it is per
   device and never syncs. Progress itself is keyed by lesson id, and Term 1
   ids were left alone when terms were introduced, so nothing he earned moved. */
export function getTermId(fallback = null) {
    return read(K.term, null) || fallback;
}

export function setTermId(id) {
    write(K.term, id);
}

export const AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐵', '🐰', '🐧', '🦋', '🐢', '🚗', '🥊', '🪐', '👾'];

const DEFAULT_PROGRESS = {
    xp: 0,
    lessonsCompleted: [],   // lesson ids
    quizScores: {},         // lessonId -> { correct, total, attempts, bestPct, lastAt }
    deckPosition: {},       // lessonId -> last card index seen, so a lesson resumes
    streak: 0,
    lastPlayDate: null,
    practiceDays: [],       // 'YYYY-MM-DD'

    /* The questions he got wrong, which is the whole point of a reviewer.
       Before this existed the quiz computed exactly which ones he missed,
       showed them once, and then threw the list away: a score survived and
       the thing worth practising did not.

       qid -> { lessonId, objective, text, wrong, right, lastAt }

       `right` counts consecutive correct answers SINCE the last miss, and a
       question retires at MASTERED. A miss resets it to 0, because getting
       it right once after getting it wrong is not knowing it. */
    missed: {}
};

/* How many consecutive correct answers retire a missed question. Two, not
   one: one is luck or a half-remembered option, and four would mean he keeps
   meeting a question he has clearly learned, which is its own punishment. */
export const MASTERED = 2;

/* A stable id for a question, so a missed one can be found again after the
   file is edited or the quiz reordered. Keyed on the lesson AND the text:
   the same stem in week 3 and in the week 11 exam are two separate items,
   and concept-level grouping is what the `objective` tag is for.

   Two 32-bit FNV-1a passes with different offsets, because one pass over
   ~3,000 questions has a birthday-collision risk of roughly a tenth of a
   per cent, and a collision would silently merge two questions' histories. */
function hash32(s, seed) {
    let h = seed;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}
export function questionId(lessonId, text) {
    const k = `${lessonId}|${String(text || '').replace(/\s+/g, ' ').trim()}`;
    return `${hash32(k, 0x811c9dc5)}${hash32(k, 0x01000193)}`;
}

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* private mode / quota — the app still works for this session */
    }
}

/* ---------- Profiles ---------- */

export function getProfiles() {
    let profiles = read(K.profiles, null);
    if (profiles) return profiles;

    // One-time migration from the old quiz app so existing players keep their name.
    const legacy = read(K.legacyProfiles, []);
    profiles = legacy.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
    write(K.profiles, profiles);
    return profiles;
}

export function createProfile(name, avatar) {
    const profiles = getProfiles();
    const id = 'learner_' + Date.now();
    profiles.push({ id, name: name.trim(), avatar });
    write(K.profiles, profiles);
    return id;
}

/** Creates or updates a profile with a known id — used to adopt a class roster entry. */
export function upsertProfile({ id, name, avatar }) {
    const profiles = getProfiles();
    const found = profiles.find(p => p.id === id);
    if (found) { found.name = name; found.avatar = avatar; }
    else profiles.push({ id, name, avatar });
    write(K.profiles, profiles);
    return id;
}

export function deleteProfile(id) {
    write(K.profiles, getProfiles().filter(p => p.id !== id));
    localStorage.removeItem(K.progress(id));
    if (getActiveId() === id) localStorage.removeItem(K.active);
}

export function getProfile(id) {
    return getProfiles().find(p => p.id === id) || null;
}

export function setActiveId(id) {
    write(K.active, id);
}

export function getActiveId() {
    const id = read(K.active, null) || read(K.legacyActive, null);
    // Only honour it if the profile still exists.
    return getProfiles().some(p => p.id === id) ? id : null;
}

export function getActiveProfile() {
    const id = getActiveId();
    return id ? getProfile(id) : null;
}

/* ---------- Progress ---------- */

/* Lesson ids abbreviate the subject ("eng-w9", "sci-w3") and courseId does
   not ("english", "science"), so the two cannot be compared directly. This
   map exists only to repair misses stored before subjects were tracked, in
   the day this shipped without a subject filter. It was checked against all
   176 lessons and every prefix resolves to exactly one course.

   Delete it once no stored progress predates that, and delete backfill()
   with it. Nothing else should use it: a lesson states its own courseId. */
const COURSE_BY_PREFIX = {
    dev: 'devotion', eng: 'english', fil: 'filipino', mapeh: 'mapeh',
    math: 'math', sci: 'science', ss: 'social-studies', tle: 'tle'
};

function backfill(p) {
    if (!p.missed) return p;
    let changed = false;
    for (const [qid, m] of Object.entries(p.missed)) {
        if (m.courseId || !m.lessonId) continue;
        const course = COURSE_BY_PREFIX[String(m.lessonId).split('-')[0]];
        if (!course) continue;
        p.missed[qid] = { ...m, courseId: course };
        changed = true;
    }
    /* Not written back here: getProgress must stay a read. The repaired
       value is what every caller sees, and it is persisted by the next
       ordinary save. */
    return changed ? { ...p, missed: { ...p.missed } } : p;
}

export function getProgress(id = getActiveId()) {
    if (!id) return { ...DEFAULT_PROGRESS };
    return backfill({ ...DEFAULT_PROGRESS, ...read(K.progress(id), {}) });
}

export function saveProgress(progress, id = getActiveId(), { immediate = false } = {}) {
    if (!id) return;
    write(K.progress(id), progress);
    push(progress, { immediate });   // no-op unless a class code is linked
}

/**
 * Pulls the server copy and merges it in. Call once on page load; it resolves
 * to the merged progress, or to the local copy if there is no network.
 */
export async function syncProgress(id = getActiveId()) {
    if (!id || !isLinked()) return getProgress(id);
    const { merged, synced } = await pull(getProgress(id));
    if (synced) write(K.progress(id), merged);
    return merged;
}

export function isLessonComplete(lessonId, id = getActiveId()) {
    return getProgress(id).lessonsCompleted.includes(lessonId);
}

/**
 * Records a finished quiz and returns the updated progress.
 *
 * `timing` also carries the two question lists, so one call persists the
 * score and the mastery state together rather than saving twice:
 *   asked  - every question put to him in this run
 *   missed - the ones he got wrong
 * Anything asked and not missed was right, which is what retires an item.
 */
export function recordQuiz(lessonId, correct, total, xpEarned, timing = {}, id = getActiveId()) {
    const p = getProgress(id);
    const pct = total ? Math.round((correct / total) * 100) : 0;
    applyMissed(p, lessonId, timing.courseId, timing.asked, timing.missed);
    const prev = p.quizScores[lessonId];

    // Timing is kept alongside the score so the two can be read together:
    // fast-and-wrong and slow-and-right are different problems.
    const spent = Number(timing.spent) || 0;
    const budget = Number(timing.budget) || 0;

    p.quizScores[lessonId] = {
        correct,
        total,
        attempts: (prev?.attempts || 0) + 1,
        bestPct: Math.max(prev?.bestPct || 0, pct),
        spent,
        budget,
        paceHistory: [...(prev?.paceHistory || []), { spent, budget, pct }].slice(-10),
        lastAt: new Date().toISOString()
    };
    p.xp += xpEarned;
    if (!p.lessonsCompleted.includes(lessonId)) p.lessonsCompleted.push(lessonId);

    touchStreak(p);
    saveProgress(p, id, { immediate: true });
    return p;
}

/**
 * A practice run over the missed list. It moves mastery and nothing else:
 * no XP, no score, no streak. The score he got sitting the real quiz is his
 * result, and practising afterwards must not be able to inflate or dent it.
 */
export function recordPractice(lessonId, { asked, missed, courseId } = {}, id = getActiveId()) {
    const p = getProgress(id);
    applyMissed(p, lessonId, courseId, asked, missed);
    saveProgress(p, id, { immediate: true });
    return p;
}

/* ---------- Wrong answers, remembered ----------

   Mutates the progress object in place; the caller saves once. */
function applyMissed(p, lessonId, courseId, asked, missed) {
    if (!Array.isArray(asked) || !asked.length) return;
    p.missed = { ...(p.missed || {}) };
    const wrongIds = new Set((missed || []).map(q => questionId(q.__lesson || lessonId, q.text)));
    const now = new Date().toISOString();

    for (const q of asked) {
        /* A resurfaced question belongs to the lesson it came from, not the
           one he happens to be sitting, or it would be filed twice. The same
           goes for its subject: a maths question carried into English is
           still a maths question. */
        const home = q.__lesson || lessonId;
        const course = q.__course || courseId || null;
        const qid = questionId(home, q.text);
        const prev = p.missed[qid];

        if (wrongIds.has(qid)) {
            /* The whole question is kept, not just its text, so a later week
               can ask it again without fetching another lesson's JSON. That
               file is already downloaded to the browser with every answer in
               it, so this stores nothing that was not already there. The
               carry markers are stripped: this record IS the question's home.
               Fields the renderer does not need are dropped to keep the
               local copy small. */
            const { __lesson, __course, __carried, ...clean } = q;
            p.missed[qid] = {
                lessonId: home,
                courseId: course,
                objective: q.objective || null,
                text: q.text,
                q: clean,
                wrong: (prev?.wrong || 0) + 1,
                right: 0,
                lastAt: now
            };
        } else if (prev) {
            /* Retire by marking, never by deleting. A deleted record is
               indistinguishable from one that was never missed on that
               device, so the cross-device merge would resurrect a question
               he has already mastered. A record that stays, with a newer
               timestamp, merges correctly on its own.
               The stored question is dropped at that point: a mastered one
               is never asked again, and it is the bulky part. */
            const right = (prev.right || 0) + 1;
            p.missed[qid] = right >= MASTERED
                ? { ...prev, courseId: prev.courseId ?? course, q: undefined, right: MASTERED, lastAt: now }
                : { ...prev, courseId: prev.courseId ?? course, q: prev.q || q, right, lastAt: now };
        }
        // Right first time and never missed before: nothing to remember.
    }
}

/**
 * Questions still worth practising, hardest first.
 *
 * `excludeLesson` keeps the lesson he is already sitting out of its own
 * warm-up, because its questions are about to be asked anyway.
 */
const outstanding = m => (m.right || 0) < MASTERED;

/**
 * Questions still worth practising, hardest first.
 *
 * `course` is required and is not optional politeness: without it a maths
 * question he missed gets asked at the top of the English quiz, which is
 * exactly what happened. A quiz belongs to its subject, and an eleven year
 * old switching from English to percentages mid-paper is being asked to do
 * the one thing this app is built around not making him do.
 *
 * Records stored before subjects were tracked are repaired on read by
 * backfill(), so his existing history still carries. One that cannot be
 * placed in a subject is never carried: guessing the subject is what caused
 * this bug, and it stays visible in the grown-up view either way.
 */
export function getDueMissed({ limit = 3, excludeLesson = null, course = null,
                               id = getActiveId() } = {}) {
    const all = Object.entries(getProgress(id).missed || {});
    return all
        .filter(([, m]) => outstanding(m)
            && m.lessonId !== excludeLesson
            && !!course && m.courseId === course)
        .sort((a, b) => (b[1].wrong - a[1].wrong) || String(a[1].lastAt).localeCompare(String(b[1].lastAt)))
        .slice(0, limit)
        .map(([qid, m]) => ({ qid, ...m }));
}

/** Everything still outstanding, for the grown-up view. */
export function missedByObjective(id = getActiveId()) {
    const out = new Map();
    for (const m of Object.values(getProgress(id).missed || {})) {
        if (!outstanding(m)) continue;
        const key = m.objective || 'Unlabelled';
        const row = out.get(key) || { objective: key, items: [], wrong: 0, lessons: new Set() };
        row.items.push(m);
        row.wrong += m.wrong || 0;
        row.lessons.add(m.lessonId);
        out.set(key, row);
    }
    return [...out.values()]
        .map(r => ({ ...r, lessons: [...r.lessons] }))
        .sort((a, b) => b.wrong - a.wrong);
}

export function missedCount(id = getActiveId()) {
    return Object.values(getProgress(id).missed || {}).filter(outstanding).length;
}

/** Questions he missed and has since mastered, for the grown-up view. */
export function masteredCount(id = getActiveId()) {
    return Object.values(getProgress(id).missed || {}).filter(m => !outstanding(m)).length;
}

function touchStreak(p) {
    const today = new Date().toISOString().slice(0, 10);
    if (p.lastPlayDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.streak = p.lastPlayDate === yesterday ? p.streak + 1 : 1;
    p.lastPlayDate = today;
    if (!p.practiceDays.includes(today)) p.practiceDays.push(today);
}

/* ---------- Levels ---------- */

export const LEVELS = [
    { level: 1, xp: 0,    title: 'Curious Rookie' },
    { level: 2, xp: 400,  title: 'Question Hunter' },
    { level: 3, xp: 1000, title: 'Pattern Spotter' },
    { level: 4, xp: 2000, title: 'Deep Thinker' },
    { level: 5, xp: 3500, title: 'Subject Specialist' },
    { level: 6, xp: 5500, title: 'Lab Legend' }
];

export function levelFor(xp) {
    let current = LEVELS[0];
    for (const l of LEVELS) if (xp >= l.xp) current = l;
    const next = LEVELS.find(l => l.xp > xp) || null;
    const span = next ? next.xp - current.xp : 1;
    const into = next ? xp - current.xp : 1;
    return { ...current, next, pct: Math.min(100, Math.round((into / span) * 100)) };
}
