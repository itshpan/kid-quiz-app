/* ==========================================================================
   sync.js — keeps local progress and the server copy in step.

   Local storage stays the working copy: reads are instant and the app keeps
   working with no network. The server is a sync layer, not the source of
   truth. That means a dropped connection costs nothing, and a phone that was
   offline all afternoon merges cleanly when it reconnects.
   ========================================================================== */

const KEY = { class: 'learningLab_class', learner: 'learningLab_remoteId' };

const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const drop = k => { try { localStorage.removeItem(k); } catch {} };

export const getClassCode = () => read(KEY.class);
export const getRemoteId = () => read(KEY.learner);
export const setClassCode = c => write(KEY.class, c);
export const setRemoteId = id => write(KEY.learner, id);
export function signOut() { drop(KEY.class); drop(KEY.learner); }

/** True when this browser is set up to sync. */
export const isLinked = () => Boolean(getClassCode() && getRemoteId());

async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(`api/${path}`, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || data.error || `HTTP ${res.status}`), { code: data.error, status: res.status });
    return data;
}

export const getRoster = code => api(`roster?code=${encodeURIComponent(code)}`);
export const createLearner = (code, name, avatar) => api('learner', { method: 'POST', body: { code, name, avatar } });
export const getDashboard = teacher => api(`dashboard?teacher=${encodeURIComponent(teacher)}`);

/**
 * Field-by-field merge of two progress objects.
 *
 * A naive last-write-wins would throw away a quiz taken on the phone the
 * moment the laptop synced. Nothing here can lose completed work: totals take
 * the larger value, sets take the union, and per-lesson records keep whichever
 * side got further.
 */
export function mergeProgress(a, b) {
    if (!a) return b;
    if (!b) return a;

    const out = { ...a, ...b };
    out.xp = Math.max(a.xp || 0, b.xp || 0);
    out.streak = Math.max(a.streak || 0, b.streak || 0);
    out.lessonsCompleted = [...new Set([...(a.lessonsCompleted || []), ...(b.lessonsCompleted || [])])];
    out.practiceDays = [...new Set([...(a.practiceDays || []), ...(b.practiceDays || [])])].sort();
    out.lastPlayDate = [a.lastPlayDate, b.lastPlayDate].filter(Boolean).sort().pop() || null;

    out.quizScores = { ...(a.quizScores || {}) };
    for (const [lesson, score] of Object.entries(b.quizScores || {})) {
        const mine = out.quizScores[lesson];
        out.quizScores[lesson] = !mine ? score : {
            ...(score.lastAt > mine.lastAt ? score : mine),
            attempts: Math.max(mine.attempts || 0, score.attempts || 0),
            bestPct: Math.max(mine.bestPct || 0, score.bestPct || 0)
        };
    }

    out.deckPosition = { ...(a.deckPosition || {}) };
    for (const [lesson, at] of Object.entries(b.deckPosition || {})) {
        out.deckPosition[lesson] = Math.max(out.deckPosition[lesson] ?? 0, at);
    }
    return out;
}

/** Pulls the server copy and merges it into whatever is local. */
export async function pull(local) {
    if (!isLinked()) return { merged: local, synced: false };
    try {
        const { data } = await api(`progress?code=${encodeURIComponent(getClassCode())}&learner=${encodeURIComponent(getRemoteId())}`);
        return { merged: mergeProgress(local, data), synced: true };
    } catch (err) {
        // Offline, or the class was deleted. Local carries on regardless.
        return { merged: local, synced: false, error: err.message };
    }
}

/* Card-position changes fire on every tap, so pushes are debounced and the
   last one is flushed on the way out rather than being lost. */
let timer = null, pending = null, inFlight = false;

async function flush() {
    if (!pending || inFlight || !isLinked()) return;
    const data = pending;
    pending = null;
    inFlight = true;
    try {
        await api('progress', { method: 'PUT', body: { code: getClassCode(), learner: getRemoteId(), data } });
    } catch {
        // Put it back so the next flush retries, unless newer data arrived meanwhile.
        pending = pending || data;
    } finally {
        inFlight = false;
    }
}

/** Queues a save. Safe to call on every keystroke or card change. */
export function push(progress, { immediate = false } = {}) {
    if (!isLinked()) return;
    pending = progress;
    clearTimeout(timer);
    if (immediate) flush();
    else timer = setTimeout(flush, 4000);
}

// A closing tab must not drop the last few cards of progress.
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
    });
    addEventListener('pagehide', flush);
}
