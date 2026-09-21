/* ==========================================================================
   quiz.js — runs a sequence of questions and reports the score.
   Individual questions are rendered by question.js, which checkpoints share.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { renderQuestion } from './question.js';
import { getSettings } from './store.js';

const XP_PER_CORRECT = 25;

/* Pace is not "faster is better". Finishing far under the budget usually
   means he skimmed, and the score normally shows it. What we want him to
   build is an accurate sense of how long something takes, so Pace measures
   how CLOSE the run was to the estimate, in either direction. */
const PACE_BAND = 0.20;

const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function paceVerdict(spent, budget, pct) {
    if (!budget) return null;
    const drift = (spent - budget) / budget;
    if (Math.abs(drift) <= PACE_BAND) {
        return { key: 'on', label: 'On pace', note: 'Your sense of how long that would take was accurate.' };
    }
    if (drift < 0) {
        return pct >= 80
            ? { key: 'fast', label: 'Ahead', note: 'Quick and still accurate. That is the good kind of fast.' }
            : { key: 'rushed', label: 'Ahead, but', note: 'Faster than the clock and some answers slipped. That is rushing, not speed.' };
    }
    return pct >= 80
        ? { key: 'slow', label: 'Over', note: 'You got them right, it just took longer than planned. Worth knowing.' }
        : { key: 'over', label: 'Over', note: 'Longer than planned. Look at where the time actually went.' };
}

/* Short, concrete, and tied to what the two scores actually said. */
const PACE_TIPS = {
    on:     ['Say your estimate out loud before the next one. You are calibrating well.'],
    fast:   ['Try predicting your total before you start. You are quick — see if you can call it.'],
    rushed: ['Read the whole question before touching an option.',
             'Cover the options, answer in your head, then look.',
             'The clock was never the target. The answer is.'],
    slow:   ['Notice which questions ate the time. It is usually two, not all of them.',
             'One read, then answer. A second read rarely changes it.'],
    over:   ['Mark the hard one and move on. Come back at the end.',
             'One read, then answer. If you are re-reading a third time, guess and flag it.',
             'Phone in another room. The time goes somewhere, and it is usually there.']
};

export function runQuiz(host, questions, { onFinish }) {
    let i = 0, correct = 0, xp = 0, spent = 0;
    const missed = [];
    const budget = questions.reduce((n, q) => n + (Number(q.seconds) || 0), 0);
    const showRun = getSettings().sessionTimer;

    function render() {
        if (i >= questions.length) return finish();

        /* The running total steps forward once per answer rather than ticking.
           The question chip is already a live clock; a second ticking number
           beside it would just be one more thing pulling at him. */
        const sofar = showRun && budget
            ? `<div class="deck-run">${mmss(spent)} <i>of ~${mmss(budget)}</i></div>`
            : '';

        host.innerHTML = `
            <div class="deck-bar">
                <div class="deck-steps"><i style="width:${Math.round(((i + 1) / questions.length) * 100)}%"></i></div>
                <div class="deck-count">${i + 1} of ${questions.length}</div>
                ${sofar}
            </div>
            <section class="card enter" id="qCard"></section>
            <div class="deck-nav" id="qNav"></div>`;

        const q = questions[i];
        renderQuestion(host.querySelector('#qCard'), q, (ok, secs) => {
            spent += secs || 0;
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

        const pace = paceVerdict(spent, budget, pct);

        host.innerHTML = `
            <div class="results">
                <div class="scorepair">
                    <div class="scorecell">
                        <div class="score">${correct}/${questions.length}</div>
                        <div class="score-label">Answers · ${pct}%</div>
                    </div>
                    ${pace ? `<div class="scorecell">
                        <div class="score pace-${pace.key}">${mmss(spent)}</div>
                        <div class="score-label">Pace · ${pace.label} (${mmss(budget)})</div>
                    </div>` : ''}
                </div>
                <div class="score-label" style="margin-top:10px;">+${xp} XP</div>
                <div class="msg">${msg}</div>
                ${pace ? `<div class="pacenote">${escapeHtml(pace.note)}</div>` : ''}
                ${pace && PACE_TIPS[pace.key] ? `
                    <div class="pacetips">
                        <div class="section-title">For next time</div>
                        <ul class="points">${PACE_TIPS[pace.key].map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
                    </div>` : ''}
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
            i = 0; correct = 0; xp = 0; spent = 0; missed.length = 0; render();
        });
        onFinish({ correct, total: questions.length, xp, spent, budget });
    }

    render();
}
