/* ==========================================================================
   catalog.js — home page. Every subject in the term.
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
        page.innerHTML = `<section class="card"><h2>Couldn't load the subjects</h2><p>${escapeHtml(err.message)}</p></section>`;
        return;
    }

    const progress = getProgress();
    const lv = levelFor(progress.xp);
    const profile = getActiveProfile();
    const ready = data.courses.flatMap(c => (c.weeks || []).filter(w => w.status === 'live'));

    page.innerHTML = `
        <div class="eyebrow">${escapeHtml(data.term.label)}</div>
        <h1 style="margin:6px 0 10px;">Hey ${escapeHtml(profile.name)}</h1>
        <p class="lede">${ready.length} lesson${ready.length === 1 ? '' : 's'} ready. Pick a subject.</p>

        <section class="card" style="margin:22px 0;padding:18px;">
            <div class="between" style="margin-bottom:10px;">
                <div>
                    <div class="eyebrow">Level ${lv.level}</div>
                    <h3 style="margin-top:2px;">${escapeHtml(lv.title)}</h3>
                </div>
                <div style="text-align:right;">
                    <div class="ui" style="font-size:1.4em;font-weight:800;">${progress.xp}</div>
                    <div class="eyebrow">XP</div>
                </div>
            </div>
            <div class="pbar"><i style="width:${lv.pct}%"></i></div>
        </section>

        <div class="grid">
            ${data.courses.map(c => {
                const weeks = c.weeks || [];
                const live = weeks.filter(w => w.status === 'live').length;
                const done = weeks.filter(w => progress.lessonsCompleted.includes(w.id)).length;
                return `<a class="subject" href="course.html?c=${encodeURIComponent(c.id)}" style="--sub:${c.accent}">
                    <span class="ico">${c.icon}</span>
                    <h3>${escapeHtml(c.title)}</h3>
                    <p>${escapeHtml(c.tagline)}</p>
                    <span class="chip ${live ? 'ready' : ''}">${live ? `${live} ready` : `${weeks.length} weeks planned`}</span>
                    ${done ? `<span class="chip ready">${done} done</span>` : ''}
                </a>`;
            }).join('')}
        </div>

        <p class="small muted center" style="margin-top:28px;">
            Teachers: every lesson links to a printable answer key.
        </p>`;
}

main();
