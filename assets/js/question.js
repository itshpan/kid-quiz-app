/* ==========================================================================
   question.js — renders ONE question of any type and reports the result.
   Shared by mid-lesson checkpoints and the end-of-lesson quiz, so both
   behave identically.

   Types: multiple | truefalse | type | order | hotspot

   On wording: a wrong answer is never "wrong" and never red. It's "not yet",
   in calm blue, and the feedback's job is to hand over the missing fact.
   See docs/WRITING-FOR-ADHD.md.

   On the clock: each question carries a `seconds` budget, and the reader sees
   his own elapsed time climbing beside it. This is the one deliberate
   exception to the no-ambient-motion rule, and it is there because time
   blindness is the deficit being taught to: time you cannot see is time you
   cannot judge. It counts UP by default rather than down, so there is no
   cliff and no failure state — going over is information, not a buzzer.

   Two gentle thresholds, both calm, neither red:
     NEAR  at 80% of budget — the chip changes tone. "You are near the mark."
     OVER2 at twice budget  — plus one quiet line: make a call and move on.
   A parent can switch to countdown or silence the nudges in settings.html.
   The budget-vs-elapsed comparison itself is always shown.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { skeletonSVG, bindSkeleton, BONES } from './skeleton.js';
import { getSettings } from './store.js';

/** 42 → "42s", 95 → "1:35". Short enough to sit in a chip. */
export const clock = s => s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const NEAR_AT = 0.8;   // "about to exceed"
const OVER_AT = 2;     // "well past it"

export const QUESTION_LABEL = {
    multiple: 'Pick one',
    truefalse: 'True or false',
    type: 'Type it',
    order: 'Put these in order',
    hotspot: 'Tap the diagram'
};

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const normalise = s => String(s).toLowerCase().trim().replace(/[^a-z0-9]/g, '');

/**
 * @param {HTMLElement} host      filled with the question UI
 * @param {object}      q         question data
 * @param {(ok:boolean)=>void} onAnswer  called once, after the reader answers
 */
export function renderQuestion(host, q, onAnswer) {
    const budget = Number(q.seconds) > 0 ? Number(q.seconds) : null;
    const startedAt = Date.now();
    const cfg = getSettings();
    const countdown = cfg.timerMode === 'countdown';

    host.innerHTML = `
        <div class="card-eyebrow"><span class="eyebrow">${QUESTION_LABEL[q.type] || 'Question'}</span>${
            budget ? `<span class="qtimer" id="qTimer" title="Your time, next to about how long this one should take">
                <b class="qnow">${countdown ? clock(budget) : '0s'}</b><i>of ~${clock(budget)}</i>
            </span>` : ''
        }</div>
        <h2>${md(escapeHtml(q.text))}</h2>
        ${budget ? '<div class="qnudge hidden" id="qNudge"></div>' : ''}
        <div id="qInput" style="margin-top:18px;"></div>
        <div id="qFeed"></div>`;

    const input = host.querySelector('#qInput');
    const feed = host.querySelector('#qFeed');

    /* ---- the live clock ---- */
    const elapsed = () => Math.round((Date.now() - startedAt) / 1000);
    let ticker = null;

    if (budget) {
        const chip = host.querySelector('#qTimer');
        const now = chip.querySelector('.qnow');
        const nudge = host.querySelector('#qNudge');
        let stage = '';

        const paint = () => {
            const s = elapsed();
            now.textContent = countdown ? clock(Math.max(0, budget - s)) : clock(s);

            if (!cfg.nudges) return;
            const next = s >= budget * OVER_AT ? 'over' : s >= budget * NEAR_AT ? 'near' : '';
            if (next === stage) return;
            stage = next;
            chip.classList.toggle('near', stage === 'near');
            chip.classList.toggle('over', stage === 'over');
            // Escalate once, quietly. No sound, no flash, never red.
            if (stage === 'over') {
                nudge.textContent = 'You have been on this one a while. Make your best call and keep moving — you can come back to it.';
                nudge.classList.remove('hidden');
            } else {
                nudge.classList.add('hidden');
            }
        };

        ticker = setInterval(() => {
            if (!host.isConnected) return stopClock();   // card was replaced
            paint();
        }, 1000);
        paint();
    }

    function stopClock() {
        if (ticker) { clearInterval(ticker); ticker = null; }
    }

    function settle(ok, extra = '') {
        stopClock();
        const spent = Math.max(1, elapsed());
        // Only ever stated as a fact, never as a pass or a fail.
        const line = budget
            ? `<div class="qclock">Took ${clock(spent)} · budget ${clock(budget)}</div>`
            : '';
        const chip = host.querySelector('#qTimer');
        if (chip) chip.classList.add('done');
        const nudge = host.querySelector('#qNudge');
        if (nudge) nudge.classList.add('hidden');
        feed.innerHTML = `<div class="feedback ${ok ? 'yes' : 'notyet'}">
            <b>${ok ? '✓ Got it' : 'Not yet — here it is'}</b>${extra}${md(escapeHtml(q.explain))}</div>${line}`;
        onAnswer(ok, spent, budget);
    }

    const RENDER = {
        multiple() {
            const wrap = document.createElement('div');
            wrap.className = 'options';
            q.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.className = 'option';
                b.innerHTML = `<span class="key">${'ABCD'[i]}</span><span>${escapeHtml(opt)}</span>`;
                b.addEventListener('click', () => {
                    const ok = i === q.answerIndex;
                    wrap.querySelectorAll('.option').forEach((el, j) => {
                        el.disabled = true;
                        if (j === q.answerIndex) el.classList.add('yes');
                        else if (j === i) el.classList.add('notyet');
                    });
                    settle(ok);
                });
                wrap.appendChild(b);
            });
            input.appendChild(wrap);
        },

        truefalse() {
            const wrap = document.createElement('div');
            wrap.className = 'options';
            [['True', true], ['False', false]].forEach(([label, val]) => {
                const b = document.createElement('button');
                b.className = 'option';
                b.dataset.val = String(val);
                b.innerHTML = `<span class="key">${label[0]}</span><span>${label}</span>`;
                b.addEventListener('click', () => {
                    const ok = val === q.answer;
                    wrap.querySelectorAll('.option').forEach(el => {
                        el.disabled = true;
                        if (el.dataset.val === String(q.answer)) el.classList.add('yes');
                    });
                    if (!ok) b.classList.add('notyet');
                    settle(ok);
                });
                wrap.appendChild(b);
            });
            input.appendChild(wrap);
        },

        type() {
            input.innerHTML = `
                <input class="text-input" id="typeIn" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
                <button class="btn primary wide" id="typeGo" style="margin-top:12px;">Check my answer</button>`;
            const field = input.querySelector('#typeIn');
            const go = input.querySelector('#typeGo');
            const submit = () => {
                const ok = q.accept.some(a => normalise(a) === normalise(field.value));
                field.disabled = true;
                go.remove();
                settle(ok, ok ? '' : `<div style="margin-bottom:6px;">The answer is <strong>${escapeHtml(q.accept[0])}</strong>.</div>`);
            };
            go.addEventListener('click', submit);
            field.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        },

        order() {
            // Shuffle until it differs from the answer, so it's never pre-solved.
            let items = shuffle(q.items);
            let guard = 0;
            while (items.join('|') === q.items.join('|') && guard++ < 20) items = shuffle(q.items);

            const wrap = document.createElement('div');
            wrap.className = 'sortable';
            const go = document.createElement('button');
            go.className = 'btn primary wide';
            go.style.marginTop = '12px';
            go.textContent = 'Check my order';

            // Arrow buttons rather than drag-and-drop: reliable on touch,
            // reachable by keyboard, and impossible to "drop" by accident.
            const paint = () => {
                wrap.innerHTML = items.map((it, i) => `
                    <div class="sort-item">
                        <span class="grip">${i + 1}</span>
                        <span class="label">${escapeHtml(it)}</span>
                        <button class="btn sm" data-move="up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${escapeHtml(it)} up">▲</button>
                        <button class="btn sm" data-move="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Move ${escapeHtml(it)} down">▼</button>
                    </div>`).join('');
                wrap.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
                    const i = +b.dataset.i;
                    const j = b.dataset.move === 'up' ? i - 1 : i + 1;
                    [items[i], items[j]] = [items[j], items[i]];
                    paint();
                }));
            };
            paint();
            input.append(wrap, go);

            go.addEventListener('click', () => {
                const ok = items.join('|') === q.items.join('|');
                wrap.querySelectorAll('.sort-item').forEach((el, i) => {
                    el.classList.add(items[i] === q.items[i] ? 'yes' : 'notyet');
                    el.querySelectorAll('button').forEach(b => b.disabled = true);
                });
                go.remove();
                settle(ok, ok ? '' : `<div style="margin-bottom:6px;">In order: <strong>${q.items.map(escapeHtml).join(' → ')}</strong></div>`);
            });
        },

        hotspot() {
            const wrap = document.createElement('div');
            wrap.className = 'skel';
            wrap.innerHTML = `<div class="skel-stage">${skeletonSVG()}</div>
                <div class="bone-info"><p class="placeholder">Tap the bone you think it is.</p></div>`;
            input.appendChild(wrap);

            const info = wrap.querySelector('.bone-info');
            let answered = false;
            bindSkeleton(wrap, id => {
                if (answered) return;
                answered = true;
                const ok = id === q.answerBone;
                info.innerHTML = `<h3>You picked: ${escapeHtml(BONES[id].name)}</h3>`;
                if (!ok) wrap.querySelector(`[data-bone="${q.answerBone}"]`)?.classList.add('active');
                settle(ok, ok ? '' : `<div style="margin-bottom:6px;">It's the <strong>${escapeHtml(BONES[q.answerBone].name)}</strong>, now lit up on the diagram.</div>`);
            });
        }
    };

    (RENDER[q.type] || RENDER.multiple)();
}
