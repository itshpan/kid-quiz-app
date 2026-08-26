/* ==========================================================================
   catalog.js — home page. Lists every subject in the term.
   ========================================================================== */

import { escapeHtml, loadJSON, mountHeader, requireProfile } from './ui.js';
import { getProgress, levelFor, getActiveProfile } from './store.js';

async function main() {
    mountHeader();
    await requireProfile();

    const page = document.getElementById('catalogPage');
    let data;
    try {
        data = await loadJSON('courses.json');
    } catch (err) {
        page.innerHTML = `<div class="card"><h2>Couldn't load the subjects</h2><p style="margin-top:10px;">${escapeHtml(err.message)}</p></div>`;
        return;
    }

    const progress = getProgress();
    const lv = levelFor(progress.xp);
    const profile = getActiveProfile();
    const doneCount = progress.lessonsCompleted.length;

    const liveLessons = data.courses.flatMap(c => (c.weeks || []).filter(w => w.status === 'live'));

    page.innerHTML = `
        <div class="eyebrow">${escapeHtml(data.term.label)} · ${escapeHtml(data.term.year)}</div>
        <h1 style="margin:6px 0 10px;">Hey ${escapeHtml(profile.name)} 👋</h1>
        <p class="lede">${liveLessons.length} lesson${liveLessons.length === 1 ? '' : 's'} ready right now. ${data.term.weeks} weeks mapped out for the term.</p>

        <section class="card" style="margin:22px 0;">
            <div class="between" style="margin-bottom:12px;">
                <div>
                    <div class="section-title" style="margin:0 0 4px;">Level ${lv.level}</div>
                    <h3 style="color:var(--gold);">${escapeHtml(lv.title)}</h3>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:24px;font-weight:800;">${progress.xp}</div>
                    <div class="muted" style="font-size:12px;">XP</div>
                </div>
            </div>
            <div class="pbar"><i style="width:${lv.pct}%"></i></div>
            <div class="between" style="margin-top:8px;font-size:12px;" class="muted">
                <span class="muted">${doneCount} lesson${doneCount === 1 ? '' : 's'} completed</span>
                <span class="muted">${lv.next ? `Next: ${lv.next.xp} XP` : 'Max level'}</span>
            </div>
        </section>

        <div class="section-title">Subjects</div>
        <div class="course-grid">
            ${data.courses.map(c => {
                const weeks = c.weeks || [];
                const live = weeks.filter(w => w.status === 'live').length;
                const done = weeks.filter(w => progress.lessonsCompleted.includes(w.id)).length;
                return `<a class="course-card" href="course.html?c=${encodeURIComponent(c.id)}" style="--accent:${c.accent}">
                    <span class="icon">${c.icon}</span>
                    <h3>${escapeHtml(c.title)}</h3>
                    <p>${escapeHtml(c.tagline)}</p>
                    <span class="chip ${live ? 'live' : 'soon'}">${live ? `${live} lesson${live === 1 ? '' : 's'} ready` : `${weeks.length} weeks planned`}</span>
                    ${done ? `<span class="chip live">${done} done</span>` : ''}
                </a>`;
            }).join('')}
        </div>

        <section class="card" style="margin-top:26px;">
            <div class="section-title">Term verse</div>
            <p style="font-style:italic;">${escapeHtml(data.term.verse)}</p>
        </section>

        <p class="muted center" style="margin-top:26px;font-size:13px;">
            Teachers: every lesson has a printable answer key linked at the top of the page.
        </p>`;
}

main();
