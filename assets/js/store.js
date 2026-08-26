/* ==========================================================================
   store.js — profiles + per-learner progress.
   Everything persists to localStorage today. When we move to Cloudflare
   (D1 / KV / Access), only the bodies of these functions change; no page
   or lesson touches localStorage directly.
   ========================================================================== */

const K = {
    profiles: 'learningLab_profiles',
    active: 'learningLab_activeProfile',
    progress: id => `learningLab_progress_${id}`,
    // legacy keys from the single-file quiz app, read once for migration
    legacyProfiles: 'kidQuizApp_users',
    legacyActive: 'kidQuizApp_activeUser'
};

export const AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐵', '🐰', '🐧', '🦋', '🐢', '🚗', '🥊', '🪐', '👾'];

const DEFAULT_PROGRESS = {
    xp: 0,
    lessonsCompleted: [],   // lesson ids
    quizScores: {},         // lessonId -> { correct, total, attempts, bestPct, lastAt }
    deckPosition: {},       // lessonId -> last card index seen, so a lesson resumes
    streak: 0,
    lastPlayDate: null,
    practiceDays: []        // 'YYYY-MM-DD'
};

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

export function getProgress(id = getActiveId()) {
    if (!id) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...read(K.progress(id), {}) };
}

export function saveProgress(progress, id = getActiveId()) {
    if (!id) return;
    write(K.progress(id), progress);
}

export function isLessonComplete(lessonId, id = getActiveId()) {
    return getProgress(id).lessonsCompleted.includes(lessonId);
}

/** Records a finished quiz and returns the updated progress. */
export function recordQuiz(lessonId, correct, total, xpEarned) {
    const p = getProgress();
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const prev = p.quizScores[lessonId];

    p.quizScores[lessonId] = {
        correct,
        total,
        attempts: (prev?.attempts || 0) + 1,
        bestPct: Math.max(prev?.bestPct || 0, pct),
        lastAt: new Date().toISOString()
    };
    p.xp += xpEarned;
    if (!p.lessonsCompleted.includes(lessonId)) p.lessonsCompleted.push(lessonId);

    touchStreak(p);
    saveProgress(p);
    return p;
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
