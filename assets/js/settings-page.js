/* ==========================================================================
   settings-page.js — settings.html controller. Grown-ups only.

   These are the pacing rules the learner is measured by, so he does not get
   to set them. The gate is the teacher class code, checked server-side by
   /api/dashboard with a constant-time compare — the same code that opens the
   class dashboard, and one he does not have.

   Be honest about what this is: possession of a code, not an account. Anyone
   who opens devtools can write localStorage directly. It keeps an eleven year
   old out of his own settings, which is the whole threat model.

   Nothing here can hide the budget-vs-elapsed comparison from him. That is
   the feature, not a punishment, and it stays on.
   ========================================================================== */

import { escapeHtml, mountHeader } from './ui.js';
import { getSettings, saveSettings } from './store.js';
import { getDashboard } from './sync.js';

const UNLOCKED = 'learningLab_settingsUnlocked';

const OPTIONS = [
    {
        key: 'timerMode',
        title: 'How the question clock reads',
        note: 'Either way he sees his own time against the budget. This only changes which direction it moves.',
        choices: [
            { v: 'countup',   label: 'Counts up',   hint: 'His time climbs beside "of ~25s". No deadline, no cliff — going over is information. Recommended.' },
            { v: 'countdown', label: 'Counts down', hint: 'The budget drains toward zero. More urgency, and a visible failure point if he runs out mid-thought.' }
        ]
    },
    {
        key: 'nudges',
        title: 'The two nudges inside a question',
        note: 'At 80% of the budget the chip changes tone. At twice the budget it adds one quiet line telling him to make a call and move on. Never a sound, never red.',
        choices: [
            { v: true,  label: 'On',  hint: 'Recommended. The second nudge is the one that breaks a stall.' },
            { v: false, label: 'Off', hint: 'The clock still shows, it just never comments.' }
        ]
    },
    {
        key: 'sessionTimer',
        title: 'Session clock',
        note: 'On the lesson deck, minutes only ("12 min in") — a per-second number while he is reading is the twitch we are trying to avoid. In the quiz, a running total against the full budget that steps forward with each answer.',
        choices: [
            { v: true,  label: 'Show', hint: 'Recommended.' },
            { v: false, label: 'Hide', hint: 'Per-question clocks stay either way.' }
        ]
    }
];

function panel() {
    const cfg = getSettings();
    return `
        <div class="eyebrow">Grown-ups</div>
        <h1 style="margin:6px 0 10px;">Pacing settings</h1>
        <p class="lede">How the clock behaves while he works. He cannot reach this page.</p>

        <div class="stack" style="margin-top:26px;">
            ${OPTIONS.map(o => `
                <section class="card">
                    <h2>${escapeHtml(o.title)}</h2>
                    <p class="small muted" style="margin-top:8px;">${escapeHtml(o.note)}</p>
                    <div class="options" style="margin-top:16px;">
                        ${o.choices.map(c => `
                            <button class="option${cfg[o.key] === c.v ? ' yes' : ''}"
                                    data-key="${o.key}" data-val="${String(c.v)}">
                                <span><b>${escapeHtml(c.label)}</b><br>
                                <span class="small muted">${escapeHtml(c.hint)}</span></span>
                            </button>`).join('')}
                    </div>
                </section>`).join('')}
        </div>

        <p class="small muted" style="margin-top:24px;">
            Saved on this device only, for whoever uses it. It is not part of his progress
            and does not sync.
        </p>
        <p style="margin-top:18px;"><a class="btn" href="index.html">Back to subjects</a></p>`;
}

function bind(page) {
    page.querySelectorAll('.option[data-key]').forEach(b => {
        b.addEventListener('click', () => {
            const raw = b.dataset.val;
            const val = raw === 'true' ? true : raw === 'false' ? false : raw;
            saveSettings({ [b.dataset.key]: val });
            page.innerHTML = panel();
            bind(page);
        });
    });
}

function gate(page, message = '') {
    page.innerHTML = `
        <div class="eyebrow">Grown-ups</div>
        <h1 style="margin:6px 0 10px;">Pacing settings</h1>
        <section class="card" style="margin-top:20px;">
            <p>Enter the teacher code to change how the clock behaves.</p>
            <div style="margin-top:16px;">
                <input class="text-input" id="code" type="password" autocomplete="off"
                       autocapitalize="off" spellcheck="false" placeholder="teacher code">
            </div>
            ${message ? `<p class="small" style="margin-top:12px;color:var(--accent);">${escapeHtml(message)}</p>` : ''}
            <div class="row" style="margin-top:16px;">
                <button class="btn primary" id="go">Unlock</button>
                <a class="btn" href="index.html">Back</a>
            </div>
        </section>`;

    const input = page.querySelector('#code');
    const go = page.querySelector('#go');

    async function submit() {
        const code = input.value.trim();
        if (!code) return;
        go.disabled = true; go.textContent = 'Checking…';
        try {
            await getDashboard(code);                 // 404s on a wrong code
            sessionStorage.setItem(UNLOCKED, '1');
            page.innerHTML = panel();
            bind(page);
        } catch (err) {
            gate(page, err.status === 404
                ? 'That code did not match.'
                : `Could not check the code: ${err.message}`);
        }
    }

    go.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    input.focus();
}

function main() {
    mountHeader({ showProfile: false });
    const page = document.getElementById('settingsPage');
    if (sessionStorage.getItem(UNLOCKED)) {
        page.innerHTML = panel();
        bind(page);
    } else {
        gate(page);
    }
}

main();
