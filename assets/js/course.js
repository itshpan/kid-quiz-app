/* ==========================================================================
   course.js — one subject, all 11 weeks of the term.
   ========================================================================== */

import { escapeHtml, param, loadJSON, mountHeader, requireProfile } from './ui.js';
import { getProgress } from './store.js';

const STATUS_CHIP = {
    live: '<span class="chip live">Ready</span>',
    soon: '<span class="chip soon">Coming soon</span>',
    exam: '<span class="chip soon">Exam week</span>'
};

async function main() {
    mountHeader();
    await requireProfile();

    const page = document.getElementById('coursePage');
    const id = param('c');

    let data;
    try {
        data = await loadJSON('courses.json');
    } catch (err) {
        page.innerHTML = `<div class="card"><h2>Couldn't load this subject</h2><p style="margin-top:10px;">${escapeHtml(err.message)}</p></div>`;
        return;
    }

    const course = data.courses.find(c => c.id === id);
    if (!course) { page.innerHTML = '<p class="muted">Subject not found.</p>'; return; }

    document.title = `${course.title} · Learning Lab`;
    const progress = getProgress();
    const weeks = course.weeks || [];
    const doneCount = weeks.filter(w => progress.lessonsCompleted.includes(w.id)).length;
    const liveCount = weeks.filter(w => w.status === 'live').length;

    page.innerHTML = `
        <a class="crumb" href="index.html">← All subjects</a>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
            <span style="font-size:40px;">${course.icon}</span>
            <div>
                <h1>${escapeHtml(course.title)}</h1>
                <p class="muted" style="font-size:14px;">${escapeHtml(course.tagline)}</p>
            </div>
        </div>
        ${course.note ? `<p class="muted" style="font-size:14px;margin-bottom:16px;">${course.note}</p>` : ''}

        <section class="card" style="margin:18px 0;">
            <div class="between" style="margin-bottom:10px;">
                <span class="muted" style="font-size:13px;font-weight:700;">${doneCount} of ${weeks.length} weeks completed</span>
                <span class="muted" style="font-size:13px;">${liveCount} ready now</span>
            </div>
            <div class="pbar"><i style="width:${weeks.length ? Math.round(doneCount / weeks.length * 100) : 0}%"></i></div>
        </section>

        ${course.bonus ? `
            <div class="section-title">Extra practice</div>
            <a class="week-item" href="${course.bonus.external}" style="margin-bottom:22px;">
                <span class="week-num" style="color:var(--cyan);">★</span>
                <span class="week-meta"><h3>${escapeHtml(course.bonus.title)}</h3><p>${escapeHtml(course.bonus.summary)}</p></span>
                <span class="chip live">Ready</span>
            </a>` : ''}

        <div class="section-title">Term 1 · ${weeks.length} weeks</div>
        <div class="stack">
            ${weeks.map(w => {
                const done = progress.lessonsCompleted.includes(w.id);
                const clickable = w.status === 'live';
                const href = w.external || (w.file ? `lesson.html?file=${encodeURIComponent(w.file)}` : '#');
                const topics = (w.topics || []).join(' · ');
                return `<a class="week-item ${clickable ? '' : 'locked'} ${done ? 'done' : ''}" href="${clickable ? href : '#'}">
                    <span class="week-num">${done ? '✓' : 'W' + w.week}</span>
                    <span class="week-meta">
                        <h3>${escapeHtml(w.title)}</h3>
                        <p>${escapeHtml(topics)}</p>
                    </span>
                    ${STATUS_CHIP[w.status] || ''}
                </a>`;
            }).join('')}
        </div>

        ${liveCount === 0 ? `
            <div class="card center" style="margin-top:22px;">
                <p class="muted">No lessons built for this subject yet — the full term is mapped above, and weeks get switched on as they're written.</p>
            </div>` : ''}`;
}

main();
