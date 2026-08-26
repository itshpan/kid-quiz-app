/* ==========================================================================
   quiz.js — runs a sequence of questions and reports the score.
   Individual questions are rendered by question.js, which checkpoints share.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { renderQuestion } from './question.js';

const XP_PER_CORRECT = 25;

export function runQuiz(host, questions, { onFinish }) {
    let i = 0, correct = 0, xp = 0;
    const missed = [];

    function render() {
        if (i >= questions.length) return finish();

        host.innerHTML = `
            <div class="deck-bar">
                <div class="deck-steps"><i style="width:${Math.round(((i + 1) / questions.length) * 100)}%"></i></div>
                <div class="deck-count">${i + 1} of ${questions.length}</div>
            </div>
            <section class="card enter" id="qCard"></section>
            <div class="deck-nav" id="qNav"></div>`;

        const q = questions[i];
        renderQuestion(host.querySelector('#qCard'), q, ok => {
            if (ok) { correct++; xp += XP_PER_CORRECT; } else { missed.push(q); }

            const nav = host.querySelector('#qNav');
            nav.innerHTML = `<button class="btn primary wide" id="qNext">${
                i === questions.length - 1 ? 'See how I did' : 'Next question'}</button>`;
            const next = nav.querySelector('#qNext');
            next.addEventListener('click', () => { i++; render(); });
            next.focus();
        });
    }

    function finish() {
        const pct = Math.round((correct / questions.length) * 100);
        const msg = pct === 100 ? 'Perfect run. Every single one.'
            : pct >= 80 ? 'Strong. You know this.'
            : pct >= 60 ? 'Good start. Two or three to firm up.'
            : 'Worth another pass through the cards.';

        host.innerHTML = `
            <div class="results">
                <div class="score">${correct}/${questions.length}</div>
                <div class="score-label">${pct}% · +${xp} XP</div>
                <div class="msg">${msg}</div>
                <div class="row" style="justify-content:center;margin-top:20px;">
                    <button class="btn" id="retry">Try again</button>
                    <a class="btn primary" href="index.html">Back to subjects</a>
                </div>
            </div>
            ${missed.length ? `
                <div style="margin-top:26px;">
                    <div class="section-title">Worth a second look</div>
                    <div class="stack">
                        ${missed.map(q => `<div class="tkey">
                            <div class="tkey-q">${md(escapeHtml(q.text))}</div>
                            <div class="tkey-why">${md(escapeHtml(q.explain))}</div>
                        </div>`).join('')}
                    </div>
                </div>` : ''}`;

        host.querySelector('#retry').addEventListener('click', () => {
            i = 0; correct = 0; xp = 0; missed.length = 0; render();
        });
        onFinish({ correct, total: questions.length, xp });
    }

    render();
}
