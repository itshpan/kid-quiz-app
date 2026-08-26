/* ==========================================================================
   course.js — one subject, all the weeks of the term.
   ========================================================================== */

import { escapeHtml, param, loadJSON, mountHeader, requireProfile } from './ui.js';
import { getProgress } from './store.js';

const CHIP = {
    live: '<span class="chip ready">Ready</span>',
    soon: '<span class="chip">Soon</span>',
    exam: '<span class="chip">Exam</span>'
};

async function main() {
    mountHeader();
    await requireProfile();

    const page = document.getElementById('coursePage');
    let data;
    try {
        data = await loadJSON('courses.json');
    } catch (err) {
        page.innerHTML = `<section class="card"><h2>Couldn't load this subject</h2><p>${escapeHtml(err.message)}</p></section>`;
        return;
    }

    const course = data.courses.find(c => c.id === param('c'));
    if (!course) { page.innerHTML = '<p class="muted">Subject not found.</p>'; return; }

    document.title = `${course.title} · Learning Lab`;
    const progress = getProgress();
    const weeks = course.weeks || [];
    const done = weeks.filter(w => progress.lessonsCompleted.includes(w.id)).length;
    const live = weeks.filter(w => w.status === 'live').length;

    page.innerHTML = `
        <a class="crumb" href="index.html">← All subjects</a>
        <div class="row" style="gap:12px;margin-bottom:8px;flex-wrap:nowrap;">
            <span style="font-size:34px;">${course.icon}</span>
            <div>
                <h1>${escapeHtml(course.title)}</h1>
                <p class="small muted">${escapeHtml(course.tagline)}</p>
            </div>
        </div>
        ${course.note ? `<p class="small muted" style="margin-bottom:14px;">${course.note}</p>` : ''}

        <section class="card" style="margin:18px 0;padding:16px;">
            <div class="between" style="margin-bottom:9px;">
                <span class="small muted">${done} of ${weeks.length} weeks done</span>
                <span class="small muted">${live} ready now</span>
            </div>
            <div class="pbar"><i style="width:${weeks.length ? Math.round(done / weeks.length * 100) : 0}%"></i></div>
        </section>

        ${course.bonus ? `
            <div class="section-title">Extra practice</div>
            <a class="week" href="${course.bonus.external}" style="margin-bottom:20px;">
                <span class="week-num">★</span>
                <span class="meta"><h3>${escapeHtml(course.bonus.title)}</h3><p>${escapeHtml(course.bonus.summary)}</p></span>
                <span class="chip ready">Ready</span>
            </a>` : ''}

        <div class="section-title">${weeks.length} weeks</div>
        <div class="stack">
            ${weeks.map(w => {
                const finished = progress.lessonsCompleted.includes(w.id);
                const open = w.status === 'live';
                const href = w.external || (w.file ? `lesson.html?file=${encodeURIComponent(w.file)}` : '#');
                return `<a class="week ${open ? '' : 'locked'} ${finished ? 'done' : ''}" href="${open ? href : '#'}">
                    <span class="week-num">${finished ? '✓' : w.week}</span>
                    <span class="meta">
                        <h3>${escapeHtml(w.title)}</h3>
                        <p>${escapeHtml((w.topics || []).join(' · '))}</p>
                    </span>
                    ${CHIP[w.status] || ''}
                </a>`;
            }).join('')}
        </div>`;
}

main();
