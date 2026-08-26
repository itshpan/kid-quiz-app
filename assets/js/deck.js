/* ==========================================================================
   deck.js — the lesson card player.

   The old build rendered a whole lesson as one long scroll. For a reader with
   attention difficulties that's the worst possible shape: the scrollbar
   announces how much is left, and there's no natural place to stop that isn't
   quitting. So a lesson is a deck. One card, one idea, one tap forward, and a
   count that's always small enough to feel finishable.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { skeletonSVG, bindSkeleton, boneInfoHTML } from './skeleton.js';
import { renderQuestion } from './question.js';

const points = list => `<ul class="points">${list.map(p => `<li>${md(escapeHtml(p))}</li>`).join('')}</ul>`;

const eyebrow = c => c.eyebrow
    ? `<div class="card-eyebrow">${c.icon ? `<span class="ico">${c.icon}</span>` : ''}<span class="eyebrow">${escapeHtml(c.eyebrow)}</span></div>`
    : (c.icon ? `<div class="card-eyebrow"><span class="ico">${c.icon}</span></div>` : '');

/* Each card kind is one function. Add a kind by adding an entry here. */
const KIND = {
    open: c => `${eyebrow(c)}<h2>${escapeHtml(c.title)}</h2><p>${md(escapeHtml(c.text))}</p>`,

    idea: c => `${eyebrow(c)}<h2>${escapeHtml(c.title)}</h2>
        ${c.text ? `<p>${md(escapeHtml(c.text))}</p>` : ''}
        ${c.points ? points(c.points) : ''}`,

    lens: c => `${eyebrow(c)}<h2>${escapeHtml(c.title)}</h2>
        ${c.text ? `<p>${md(escapeHtml(c.text))}</p>` : ''}
        ${c.points ? points(c.points) : ''}`,

    fact: c => `${eyebrow(c)}<p style="font-size:1.05em;">${md(escapeHtml(c.text))}</p>`,

    recap: c => `${eyebrow(c)}<h2>${escapeHtml(c.title)}</h2>${points(c.points)}`,

    terms: c => `<h2>${escapeHtml(c.title)}</h2>
        <div class="terms">${c.terms.map(t =>
            `<dl class="term"><dt>${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.def)}</dd></dl>`).join('')}</div>`,

    diagram: c => `<h2>${escapeHtml(c.title)}</h2>
        <p class="small">${md(escapeHtml(c.text))}</p>
        <div class="skel" id="skelBlock">
            <div class="skel-stage">${skeletonSVG()}</div>
            <div class="bone-info">${boneInfoHTML(null)}</div>
        </div>`,

    story: c => `${eyebrow(c)}<h2>${escapeHtml(c.title)}</h2>
        ${c.text ? `<p>${md(escapeHtml(c.text))}</p>` : ''}
        ${c.points ? points(c.points) : ''}`,

    /* A real, offered stopping point. Quitting mid-lesson feels like failure;
       being told "this is a fine place to stop, your spot is saved" doesn't. */
    break: c => `<div class="card-eyebrow"><span class="ico">☕</span><span class="eyebrow">Break</span></div>
        <h2>${escapeHtml(c.title)}</h2><p>${md(escapeHtml(c.text))}</p>`,

    checkpoint: () => ''   // rendered by renderQuestion, not a template
};

/**
 * Mounts the deck.
 * @param {HTMLElement} host
 * @param {Array}  cards
 * @param {object} opts
 * @param {number} opts.startAt       card to open on (resume position)
 * @param {(i:number)=>void} opts.onMove     fired whenever the card changes
 * @param {()=>void}         opts.onFinish   fired when the reader passes the last card
 */
export function mountDeck(host, cards, { startAt = 0, onMove = () => {}, onFinish = () => {} } = {}) {
    let i = Math.min(Math.max(startAt, 0), cards.length - 1);
    const answered = new Set();

    host.innerHTML = `
        <div class="deck-bar">
            <div class="deck-steps" id="steps" aria-hidden="true"></div>
            <div class="deck-count" id="count"></div>
        </div>
        <div id="cardHost"></div>
        <div class="deck-nav" id="nav"></div>
        <p class="deck-hint no-print">Use ← and → keys to move</p>`;

    const stepsEl = host.querySelector('#steps');
    const countEl = host.querySelector('#count');
    const cardHost = host.querySelector('#cardHost');
    const navEl = host.querySelector('#nav');

    function paintProgress() {
        const pct = Math.round(((i + 1) / cards.length) * 100);
        stepsEl.innerHTML = `<i style="width:${pct}%"></i>`;
        stepsEl.setAttribute('role', 'progressbar');
        stepsEl.setAttribute('aria-valuenow', String(i + 1));
        stepsEl.setAttribute('aria-valuemax', String(cards.length));
        countEl.textContent = `${i + 1} of ${cards.length}`;
    }

    function go(n) {
        i = Math.min(Math.max(n, 0), cards.length);
        if (i >= cards.length) { onFinish(); return; }
        paint();
        onMove(i);
    }

    function paint() {
        const c = cards[i];
        const card = document.createElement('section');
        card.className = `card ${c.kind} enter`;
        if (c.lens) card.dataset.lens = c.lens;

        cardHost.innerHTML = '';
        cardHost.appendChild(card);
        paintProgress();

        if (c.kind === 'checkpoint') {
            // A checkpoint gates on being answered — that's the whole point of
            // it — but it never blocks on being answered *correctly*.
            paintNav({ nextLabel: 'Next', nextEnabled: answered.has(i) });
            renderQuestion(card, c.question, () => {
                answered.add(i);
                paintNav({ nextLabel: 'Next', nextEnabled: true });
            });
            if (answered.has(i)) {
                // Returning to an already-answered checkpoint: show it, don't re-ask.
                card.querySelectorAll('button, input').forEach(el => el.disabled = true);
            }
        } else {
            card.innerHTML = (KIND[c.kind] || KIND.idea)(c);
            paintNav({
                nextLabel: i === cards.length - 1 ? 'Finish the lesson' : 'Next',
                nextEnabled: true,
                exit: c.kind === 'break'
            });
        }

        if (c.kind === 'diagram') {
            const block = card.querySelector('#skelBlock');
            const info = block.querySelector('.bone-info');
            bindSkeleton(block, id => { info.innerHTML = boneInfoHTML(id); });
        }

        card.focus?.();
    }

    function paintNav({ nextLabel, nextEnabled, exit = false }) {
        navEl.innerHTML = `
            <button class="btn" id="prev" ${i === 0 ? 'disabled' : ''} aria-label="Previous card">←</button>
            <button class="btn primary" id="next" ${nextEnabled ? '' : 'disabled'}>${escapeHtml(nextLabel)}</button>
            ${exit ? '<a class="btn" id="stop" href="index.html">Stop for now</a>' : ''}`;
        navEl.querySelector('#prev').addEventListener('click', () => go(i - 1));
        navEl.querySelector('#next').addEventListener('click', () => go(i + 1));
    }

    function onKey(e) {
        if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
        if (e.key === 'ArrowRight' && !navEl.querySelector('#next')?.disabled) go(i + 1);
        if (e.key === 'ArrowLeft') go(i - 1);
    }
    document.addEventListener('keydown', onKey);

    paint();
    onMove(i);

    return {
        jumpTo: go,
        destroy: () => document.removeEventListener('keydown', onKey)
    };
}

/** Flat rendering of every card at once — for a teacher previewing the lesson. */
export function deckAsPage(cards) {
    return cards.map((c, n) => {
        if (c.kind === 'checkpoint') {
            const q = c.question;
            return `<section class="card checkpoint">
                <div class="card-eyebrow"><span class="eyebrow">Checkpoint · card ${n + 1}</span></div>
                <h2>${md(escapeHtml(q.text))}</h2>
                <p class="small" style="margin-top:10px;"><strong>Answer:</strong> ${md(escapeHtml(q.explain))}</p>
            </section>`;
        }
        const card = `<section class="card ${c.kind}"${c.lens ? ` data-lens="${c.lens}"` : ''}>${(KIND[c.kind] || KIND.idea)(c)}</section>`;
        // The interactive diagram is meaningless in a flat print view.
        return c.kind === 'diagram'
            ? `<section class="card"><h2>${escapeHtml(c.title)}</h2><p class="small">Interactive skeleton diagram.</p></section>`
            : card;
    }).join('');
}
