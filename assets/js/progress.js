/* ==========================================================================
   progress.js — the parent and teacher dashboard.
   Opened with a teacher code; shows every learner in that class.
   ========================================================================== */

import { escapeHtml, mountHeader, param } from './ui.js';
import { getDashboard } from './sync.js';
import { levelFor } from './store.js';
import { loadJSON } from './ui.js';

const KEY = 'learningLab_teacherCode';
const remember = c => { try { localStorage.setItem(KEY, c); } catch {} };
const recall = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

let LESSONS = {};   // lessonId -> { title, subject, objectives }

async function loadLessonIndex() {
    const courses = await loadJSON('courses.json');
    await Promise.all(courses.courses.flatMap(c =>
        (c.weeks || []).filter(w => w.file).map(async w => {
            try {
                const l = await loadJSON(w.file);
                LESSONS[l.id] = { title: l.title, subject: c.title, quiz: l.quiz, objectives: l.objectives };
            } catch { /* a lesson that won't load simply isn't listed */ }
        })));
}

/** Per-objective breakdown for one learner, derived from their quiz scores. */
function objectiveRows(progress) {
    const rows = [];
    for (const [lessonId, score] of Object.entries(progress?.quizScores || {})) {
        const lesson = LESSONS[lessonId];
        if (!lesson) continue;
        rows.push({
            lesson: `${lesson.subject} · ${lesson.title}`,
            best: score.bestPct,
            attempts: score.attempts,
            last: score.lastAt
        });
    }
    return rows.sort((a, b) => (b.last || '').localeCompare(a.last || ''));
}

function learnerCard(l) {
    const p = l.progress;
    const lv = levelFor(p?.xp || 0);
    const rows = objectiveRows(p);
    const done = p?.lessonsCompleted?.length || 0;

    return `<section class="card" style="margin-bottom:14px;">
        <div class="between" style="margin-bottom:12px;">
            <div class="row" style="gap:12px;flex-wrap:nowrap;">
                <span style="font-size:30px;">${l.avatar}</span>
                <div>
                    <h2>${escapeHtml(l.name)}</h2>
                    <p class="small muted">Level ${lv.level} · ${escapeHtml(lv.title)} · ${p?.xp || 0} XP</p>
                </div>
            </div>
            <div style="text-align:right;">
                <div class="ui" style="font-size:1.3em;font-weight:800;">${done}</div>
                <div class="eyebrow">lessons done</div>
            </div>
        </div>
        ${p?.streak ? `<p class="small muted">🔥 ${p.streak}-day streak · last active ${escapeHtml((l.updatedAt || '').slice(0, 10))}</p>` : ''}
        ${rows.length ? `
            <div class="section-title" style="margin-top:16px;">Quiz results</div>
            <div class="stack">
                ${rows.map(r => `<div class="week">
                    <span class="week-num" style="background:${r.best >= 80 ? 'var(--yes)' : r.best >= 60 ? 'var(--accent)' : 'var(--notyet)'};color:var(--surface);">${r.best}%</span>
                    <span class="meta">
                        <h3>${escapeHtml(r.lesson)}</h3>
                        <p>${r.attempts} attempt${r.attempts === 1 ? '' : 's'} · last ${escapeHtml((r.last || '').slice(0, 10))}</p>
                    </span>
                </div>`).join('')}
            </div>`
        : '<p class="small muted" style="margin-top:12px;">No quizzes taken yet.</p>'}
    </section>`;
}

function gate(page, message = '') {
    page.innerHTML = `
        <h1>Parent &amp; teacher view</h1>
        <ol class="signin-help" style="margin-top:16px;">
            <li>Enter the <strong>teacher code</strong> for the class.</li>
            <li>It is different from the code the learners use.</li>
            <li>You'll see everyone's progress and quiz results.</li>
        </ol>
        <input class="text-input" id="tCode" placeholder="Teacher code" autocomplete="off" spellcheck="false">
        ${message ? `<div class="feedback notyet" style="margin-top:12px;">${escapeHtml(message)}</div>` : ''}
        <button class="btn primary wide" id="tGo" style="margin-top:14px;">Open dashboard</button>`;

    const go = () => {
        const code = page.querySelector('#tCode').value.trim();
        if (code) { remember(code); render(page, code); }
    };
    page.querySelector('#tGo').addEventListener('click', go);
    page.querySelector('#tCode').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
}

async function render(page, code) {
    page.innerHTML = '<p class="muted">Loading…</p>';
    try {
        const data = await getDashboard(code);
        await loadLessonIndex();
        page.innerHTML = `
            <div class="between" style="margin-bottom:6px;">
                <div>
                    <div class="eyebrow">Parent &amp; teacher view</div>
                    <h1>${escapeHtml(data.class.label)}</h1>
                </div>
                <button class="btn sm no-print" id="tOut">Sign out</button>
            </div>
            <p class="lede" style="margin-bottom:22px;">${data.learners.length} learner${data.learners.length === 1 ? '' : 's'}</p>
            ${data.learners.length ? data.learners.map(learnerCard).join('')
                : '<section class="card"><p class="muted">Nobody has joined with the class code yet.</p></section>'}`;
        page.querySelector('#tOut').addEventListener('click', () => {
            try { localStorage.removeItem(KEY); } catch {}
            gate(page);
        });
    } catch (err) {
        gate(page, err.code === 'not-configured'
            ? "Progress syncing isn't switched on yet."
            : "That teacher code didn't work.");
    }
}

async function main() {
    mountHeader({ showProfile: false });
    const page = document.getElementById('progressPage');
    const code = param('teacher') || recall();
    if (code) { remember(code); render(page, code); }
    else gate(page);
}

main();
