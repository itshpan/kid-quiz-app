/* ==========================================================================
   /api/* — progress storage on Cloudflare D1.

   No passwords and no email addresses. A class carries two random codes: a
   learner code (pick your name, save progress) and a teacher code (that plus
   the dashboard). Codes are long and random, so this is possession-of-a-code
   security. That is a deliberate fit for quiz scores and nothing more
   sensitive; if this ever holds more, put Cloudflare Access in front of it.
   ========================================================================== */

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });

const bad = (msg, status = 400) => json({ error: msg }, status);

/** Codes and names are user input and go straight into queries — bound, never interpolated. */
const clean = (s, max) => typeof s === 'string' ? s.trim().slice(0, max) : '';

const now = () => new Date().toISOString();

/** Constant-time-ish compare so a wrong teacher code can't be probed by timing. */
function sameCode(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

async function findClassByLearnerCode(db, code) {
    if (!code) return null;
    return db.prepare('SELECT id, label FROM classes WHERE id = ?').bind(code).first();
}

async function findClassByTeacherCode(db, code) {
    if (!code) return null;
    // Fetched by primary lookup then compared, rather than matched in SQL,
    // so the comparison itself is not a timing oracle.
    const row = await db.prepare('SELECT id, label, teacher_code FROM classes WHERE teacher_code = ?')
        .bind(code).first();
    return row && sameCode(row.teacher_code, code) ? { id: row.id, label: row.label } : null;
}

export async function onRequest({ request, env, params }) {
    const db = env.DB;
    if (!db) {
        return json({ error: 'not-configured', message: 'No database is bound yet. The app is running on local storage only.' }, 503);
    }

    const path = (params.path || []).join('/');
    const url = new URL(request.url);
    const method = request.method;

    try {
        /* ---- GET /api/roster?code=… — the name picker ---- */
        if (path === 'roster' && method === 'GET') {
            const cls = await findClassByLearnerCode(db, clean(url.searchParams.get('code'), 64));
            if (!cls) return bad('unknown class code', 404);
            const { results } = await db
                .prepare('SELECT id, name, avatar FROM learners WHERE class_id = ? ORDER BY name')
                .bind(cls.id).all();
            return json({ class: { label: cls.label }, learners: results || [] });
        }

        /* ---- POST /api/learner — first time someone uses a code ---- */
        if (path === 'learner' && method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const cls = await findClassByLearnerCode(db, clean(body.code, 64));
            if (!cls) return bad('unknown class code', 404);

            const name = clean(body.name, 40);
            const avatar = clean(body.avatar, 8) || '🦊';
            if (!name) return bad('a name is required');

            const dupe = await db
                .prepare('SELECT id FROM learners WHERE class_id = ? AND lower(name) = lower(?)')
                .bind(cls.id, name).first();
            if (dupe) return json({ id: dupe.id, name, avatar, existing: true });

            const id = 'lrn_' + crypto.randomUUID();
            await db.prepare('INSERT INTO learners (id, class_id, name, avatar, created_at) VALUES (?,?,?,?,?)')
                .bind(id, cls.id, name, avatar, now()).run();
            return json({ id, name, avatar, existing: false });
        }

        /* ---- GET /api/progress?code=…&learner=… ---- */
        if (path === 'progress' && method === 'GET') {
            const cls = await findClassByLearnerCode(db, clean(url.searchParams.get('code'), 64));
            if (!cls) return bad('unknown class code', 404);
            const learner = clean(url.searchParams.get('learner'), 64);

            // Scoped to the class, so a learner id from another class reads nothing.
            const row = await db.prepare(`
                SELECT p.data, p.updated_at FROM progress p
                JOIN learners l ON l.id = p.learner_id
                WHERE p.learner_id = ? AND l.class_id = ?`)
                .bind(learner, cls.id).first();

            return json(row ? { data: JSON.parse(row.data), updatedAt: row.updated_at } : { data: null });
        }

        /* ---- PUT /api/progress ---- */
        if (path === 'progress' && method === 'PUT') {
            const body = await request.json().catch(() => ({}));
            const cls = await findClassByLearnerCode(db, clean(body.code, 64));
            if (!cls) return bad('unknown class code', 404);

            const learner = clean(body.learner, 64);
            const owns = await db.prepare('SELECT id FROM learners WHERE id = ? AND class_id = ?')
                .bind(learner, cls.id).first();
            if (!owns) return bad('unknown learner', 404);

            const payload = JSON.stringify(body.data ?? {});
            if (payload.length > 200_000) return bad('progress payload too large', 413);

            await db.prepare(`
                INSERT INTO progress (learner_id, data, updated_at) VALUES (?,?,?)
                ON CONFLICT(learner_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
                .bind(learner, payload, now()).run();
            return json({ ok: true });
        }

        /* ---- GET /api/dashboard?teacher=… — everyone in the class ---- */
        if (path === 'dashboard' && method === 'GET') {
            const cls = await findClassByTeacherCode(db, clean(url.searchParams.get('teacher'), 64));
            if (!cls) return bad('unknown teacher code', 404);

            const { results } = await db.prepare(`
                SELECT l.id, l.name, l.avatar, p.data, p.updated_at
                FROM learners l LEFT JOIN progress p ON p.learner_id = l.id
                WHERE l.class_id = ? ORDER BY l.name`)
                .bind(cls.id).all();

            return json({
                class: { label: cls.label },
                learners: (results || []).map(r => ({
                    id: r.id, name: r.name, avatar: r.avatar,
                    updatedAt: r.updated_at,
                    progress: r.data ? JSON.parse(r.data) : null
                }))
            });
        }

        return bad('no such endpoint', 404);
    } catch (err) {
        // Never leak SQL or stack traces to the browser.
        console.error('api error', path, err);
        return json({ error: 'server error' }, 500);
    }
}
