/* ==========================================================================
   question.js — renders ONE question of any type and reports the result.
   Shared by mid-lesson checkpoints and the end-of-lesson quiz, so both
   behave identically.

   Types: multiple | truefalse | type | order | hotspot

   On wording: a wrong answer is never "wrong" and never red. It's "not yet",
   in calm blue, and the feedback's job is to hand over the missing fact.
   See docs/WRITING-FOR-ADHD.md.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { skeletonSVG, bindSkeleton, BONES } from './skeleton.js';

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
    host.innerHTML = `
        <div class="card-eyebrow"><span class="eyebrow">${QUESTION_LABEL[q.type] || 'Question'}</span></div>
        <h2>${md(escapeHtml(q.text))}</h2>
        <div id="qInput" style="margin-top:18px;"></div>
        <div id="qFeed"></div>`;

    const input = host.querySelector('#qInput');
    const feed = host.querySelector('#qFeed');

    function settle(ok, extra = '') {
        feed.innerHTML = `<div class="feedback ${ok ? 'yes' : 'notyet'}">
            <b>${ok ? '✓ Got it' : 'Not yet — here it is'}</b>${extra}${md(escapeHtml(q.explain))}</div>`;
        onAnswer(ok);
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
