/* ==========================================================================
   quiz.js — question engine.
   Types: multiple | truefalse | type | order | hotspot
   Add a type by writing a render function and listing it in RENDERERS.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { skeletonSVG, bindSkeleton, BONES } from './skeleton.js';

const XP_PER_CORRECT = 25;

const TYPE_LABEL = {
    multiple: 'Multiple choice',
    truefalse: 'True or false',
    type: 'Type the answer',
    order: 'Put it in order',
    hotspot: 'Find it on the diagram'
};

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function normalise(s) {
    return String(s).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Runs a quiz inside `host`.
 * @param {HTMLElement} host
 * @param {Array} questions
 * @param {{onFinish: (r:{correct:number,total:number,xp:number}) => void}} opts
 */
export function runQuiz(host, questions, { onFinish }) {
    let index = 0;
    let correctCount = 0;
    let xp = 0;
    const results = [];

    function progressHTML() {
        return `<div class="quiz-progress">${questions.map((_, i) =>
            `<span class="${i < index ? 'done' : i === index ? 'current' : ''}"></span>`).join('')}</div>`;
    }

    function settle(isCorrect, q, extra = '') {
        if (isCorrect) { correctCount++; xp += XP_PER_CORRECT; }
        results.push({ q, isCorrect });

        const fb = document.createElement('div');
        fb.className = `feedback ${isCorrect ? 'good' : 'bad'}`;
        fb.innerHTML = `<strong>${isCorrect ? '✅ Correct — +' + XP_PER_CORRECT + ' XP' : '❌ Not quite'}</strong>${extra}${md(escapeHtml(q.explain))}`;
        host.querySelector('#qBody').appendChild(fb);

        const next = document.createElement('button');
        next.className = 'btn primary wide';
        next.style.marginTop = '18px';
        next.textContent = index === questions.length - 1 ? 'See results' : 'Next question';
        next.addEventListener('click', () => { index++; render(); });
        host.querySelector('#qBody').appendChild(next);
        next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const RENDERERS = {
        multiple(q, body) {
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
                        if (j === q.answerIndex) el.classList.add('correct');
                        else if (j === i) el.classList.add('wrong');
                    });
                    settle(ok, q);
                });
                wrap.appendChild(b);
            });
            body.appendChild(wrap);
        },

        truefalse(q, body) {
            const wrap = document.createElement('div');
            wrap.className = 'options';
            [['True', true], ['False', false]].forEach(([label, val]) => {
                const b = document.createElement('button');
                b.className = 'option';
                b.innerHTML = `<span class="key">${label[0]}</span><span>${label}</span>`;
                b.addEventListener('click', () => {
                    const ok = val === q.answer;
                    wrap.querySelectorAll('.option').forEach(el => {
                        el.disabled = true;
                        const isAnswer = el.textContent.trim().startsWith(q.answer ? 'True' : 'False');
                        if (isAnswer) el.classList.add('correct');
                    });
                    if (!ok) b.classList.add('wrong');
                    settle(ok, q);
                });
                wrap.appendChild(b);
            });
            body.appendChild(wrap);
        },

        type(q, body) {
            const wrap = document.createElement('div');
            wrap.innerHTML = `
                <input class="text-input" id="typeIn" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
                <button class="btn primary wide" id="typeGo" style="margin-top:12px;">Check answer</button>`;
            body.appendChild(wrap);
            const input = wrap.querySelector('#typeIn');
            const go = wrap.querySelector('#typeGo');
            const submit = () => {
                const ok = q.accept.some(a => normalise(a) === normalise(input.value));
                input.disabled = true;
                go.remove();
                input.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
                settle(ok, q, ok ? '' : `<div style="margin-bottom:8px;">Answer: <strong>${escapeHtml(q.accept[0])}</strong></div>`);
            };
            go.addEventListener('click', submit);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
            input.focus();
        },

        order(q, body) {
            // Shuffled until it differs from the answer, so the task is never pre-solved.
            let items = shuffle(q.items);
            let guard = 0;
            while (items.join('|') === q.items.join('|') && guard++ < 20) items = shuffle(q.items);

            const wrap = document.createElement('div');
            wrap.className = 'sortable';
            const go = document.createElement('button');
            go.className = 'btn primary wide';
            go.style.marginTop = '12px';
            go.textContent = 'Check order';

            const paint = () => {
                wrap.innerHTML = items.map((it, i) => `
                    <div class="sort-item" data-i="${i}">
                        <span class="grip">${i + 1}</span>
                        <span style="flex:1">${escapeHtml(it)}</span>
                        <button class="btn sm" data-move="up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>
                        <button class="btn sm" data-move="down" data-i="${i}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>
                    </div>`).join('');
                wrap.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
                    const i = +b.dataset.i;
                    const j = b.dataset.move === 'up' ? i - 1 : i + 1;
                    [items[i], items[j]] = [items[j], items[i]];
                    paint();
                }));
            };
            paint();
            body.appendChild(wrap);
            body.appendChild(go);

            go.addEventListener('click', () => {
                const ok = items.join('|') === q.items.join('|');
                wrap.querySelectorAll('.sort-item').forEach((el, i) => {
                    el.classList.add(items[i] === q.items[i] ? 'correct' : 'wrong');
                    el.querySelectorAll('button').forEach(b => b.disabled = true);
                });
                go.remove();
                settle(ok, q, ok ? '' : `<div style="margin-bottom:8px;">Correct order: <strong>${q.items.map(escapeHtml).join(' → ')}</strong></div>`);
            });
        },

        hotspot(q, body) {
            const wrap = document.createElement('div');
            wrap.className = 'skeleton-explorer';
            wrap.innerHTML = `<div class="skeleton-stage">${skeletonSVG()}</div>
                <div class="bone-info"><p class="placeholder">Tap the bone you think is the answer.</p></div>`;
            body.appendChild(wrap);

            const info = wrap.querySelector('.bone-info');
            let answered = false;
            bindSkeleton(wrap, id => {
                if (answered) return;
                answered = true;
                const ok = id === q.answerBone;
                info.innerHTML = `<h3>${escapeHtml(BONES[id].name)}</h3>
                    <div class="latin">${ok ? 'Correct pick' : 'Not this one'}</div>`;
                if (!ok) {
                    const target = wrap.querySelector(`[data-bone="${q.answerBone}"]`);
                    if (target) target.classList.add('active');
                }
                settle(ok, q, ok ? '' : `<div style="margin-bottom:8px;">The answer was <strong>${escapeHtml(BONES[q.answerBone].name)}</strong> — now highlighted on the diagram.</div>`);
            });
        }
    };

    function render() {
        if (index >= questions.length) return finish();
        const q = questions[index];

        host.innerHTML = `
            ${progressHTML()}
            <div id="qBody">
                <span class="q-type-badge">${TYPE_LABEL[q.type] || q.type}</span>
                <div class="q-text">Question ${index + 1} of ${questions.length}<br>${md(escapeHtml(q.text))}</div>
            </div>`;

        const body = host.querySelector('#qBody');
        (RENDERERS[q.type] || RENDERERS.multiple)(q, body);
        host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    function finish() {
        const pct = Math.round((correctCount / questions.length) * 100);
        const msg = pct === 100 ? 'Perfect run. Every single one.'
            : pct >= 80 ? 'Strong. You know this material.'
            : pct >= 60 ? 'Solid start — review the ones you missed.'
            : 'Worth another pass through the lesson before the quiz.';

        host.innerHTML = `
            <div class="results">
                <div class="score">${correctCount}/${questions.length}</div>
                <div class="score-label">${pct}% correct · +${xp} XP</div>
                <div class="msg">${msg}</div>
                <div class="row" style="justify-content:center;margin-top:22px;">
                    <button class="btn" id="retry">Try again</button>
                    <a class="btn primary" href="index.html">Back to subjects</a>
                </div>
                <div class="card" style="margin-top:26px;text-align:left;">
                    <div class="section-title">What you missed</div>
                    ${results.filter(r => !r.isCorrect).length
                        ? results.filter(r => !r.isCorrect).map(r =>
                            `<div class="tkey-item"><div class="tkey-q">${md(escapeHtml(r.q.text))}</div><div class="tkey-why">${md(escapeHtml(r.q.explain))}</div></div>`).join('')
                        : '<p class="muted">Nothing. Clean sheet.</p>'}
                </div>
            </div>`;
        host.querySelector('#retry').addEventListener('click', () => {
            index = 0; correctCount = 0; xp = 0; results.length = 0; render();
        });
        onFinish({ correct: correctCount, total: questions.length, xp });
    }

    render();
}
