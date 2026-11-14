/* ==========================================================================
   catalog.js — home page. Every subject in the term.
   ========================================================================== */

import { escapeHtml, param, loadTerms, pickTerm, mountHeader, requireProfile, weekIsOpen } from './ui.js';
import { getProgress, levelFor, getActiveProfile, getTermId, setTermId } from './store.js';

async function main() {
    mountHeader();
    await requireProfile();

    const page = document.getElementById('catalogPage');
    let catalogue;
    try {
        catalogue = await loadTerms();
    } catch (err) {
        page.innerHTML = `<section class="card"><h2>Couldn't load the subjects</h2><p>${escapeHtml(err.message)}</p></section>`;
        return;
    }

    const term = pickTerm(catalogue, param('t') || getTermId(catalogue.activeTermId));
    setTermId(term.id);
    const data = term;

    const progress = getProgress();
    const lv = levelFor(progress.xp);
    const profile = getActiveProfile();
    const ready = data.courses.flatMap(c => (c.weeks || []).filter(weekIsOpen));

    /* Only shown once there is more than one term to choose between. */
    const switcher = catalogue.terms.length > 1 ? `
        <div class="termswitch" role="tablist" aria-label="Which term">
            ${catalogue.terms.map(t => `
                <a role="tab" href="index.html?t=${encodeURIComponent(t.id)}"
                   aria-selected="${t.id === term.id}"
                   class="${t.id === term.id ? 'on' : ''}">${escapeHtml(t.label.split('·')[0].trim())}</a>`).join('')}
        </div>` : '';

    page.innerHTML = `
        ${switcher}
        <div class="eyebrow">${escapeHtml(data.label)}</div>
        <h1 style="margin:6px 0 10px;">Hey ${escapeHtml(profile.name)}</h1>
        <p class="lede">${(() => {
            if (ready.length) return `${ready.length} lesson${ready.length === 1 ? '' : 's'} ready. Pick a subject.`;
            const planned = data.courses.reduce((n, c) => n + (c.weeks || []).length, 0);
            // The scope being in is a real milestone, and different from nothing existing.
            return planned
                ? `${data.weeks} weeks mapped out. The lessons are still being written.`
                : 'Nothing here yet \u2014 this term\u2019s plan has not been added.';
        })()}</p>
        ${data.theme ? `<p class="small muted" style="margin-top:6px;">Term theme: ${escapeHtml(data.theme)}</p>` : ''}

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
                const live = weeks.filter(weekIsOpen).length;
                const done = weeks.filter(w => progress.lessonsCompleted.includes(w.id)).length;
                return `<a class="subject" href="course.html?t=${encodeURIComponent(term.id)}&c=${encodeURIComponent(c.id)}" style="--sub:${c.accent}">
                    <span class="ico">${c.icon}</span>
                    <h3>${escapeHtml(c.title)}</h3>
                    <p>${escapeHtml(c.tagline)}</p>
                    <span class="chip ${live ? 'ready' : ''}">${
                        live ? `${live} ready`
                             : weeks.length ? `${weeks.length} weeks planned`
                                            : 'not planned yet'
                    }</span>
                    ${done ? `<span class="chip ready">${done} done</span>` : ''}
                </a>`;
            }).join('')}
        </div>

        <p class="small muted center" style="margin-top:28px;">
            Teachers: every lesson links to a printable answer key.
        </p>`;
}

main();
