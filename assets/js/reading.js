/* ==========================================================================
   reading.js — the reader controls his own reading environment.

   What's comfortable varies enormously between people, and between days for
   the same person. Text size and light/dark are one tap away and persist,
   rather than being guessed on his behalf.
   ========================================================================== */

const KEY = { scale: 'learningLab_textScale', theme: 'learningLab_theme' };
const SCALES = { small: 0.9, normal: 1, large: 1.15, huge: 1.32 };

function readPref(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function writePref(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

/** Applies stored preferences. Call as early as possible to avoid a flash. */
export function applyReadingPrefs() {
    const scale = readPref(KEY.scale, 'normal');
    const theme = readPref(KEY.theme, 'system');
    document.documentElement.style.setProperty('--scale', SCALES[scale] ?? 1);
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
}

/** Builds the "Aa" button plus its popover. Returns the button. */
export function readingControls() {
    const btn = document.createElement('button');
    btn.className = 'btn icon';
    btn.id = 'readingBtn';
    btn.setAttribute('aria-label', 'Text size and theme');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span style="font-family:var(--font-ui);font-weight:800;">Aa</span>';

    let menu = null;

    const close = () => {
        menu?.remove();
        menu = null;
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', onOutside, true);
    };

    function onOutside(e) {
        if (menu && !menu.contains(e.target) && e.target !== btn) close();
    }

    function seg(label, name, options, current, onPick) {
        return `<div>
            <div class="section-title">${label}</div>
            <div class="seg" data-name="${name}">
                ${options.map(([val, text]) =>
                    `<button data-val="${val}" aria-pressed="${val === current}">${text}</button>`).join('')}
            </div>
        </div>`;
    }

    function open() {
        menu = document.createElement('div');
        menu.className = 'reading-menu';
        menu.innerHTML = `
            <div class="row" style="display:block;">
                ${seg('Text size', 'scale', [['small', 'A'], ['normal', 'A'], ['large', 'A'], ['huge', 'A']], readPref(KEY.scale, 'normal'))}
            </div>
            <div class="row" style="display:block;">
                ${seg('Theme', 'theme', [['light', 'Light'], ['dark', 'Dark'], ['system', 'Auto']], readPref(KEY.theme, 'system'))}
            </div>`;

        // Size the four "A"s so the control shows what it does.
        const sizes = ['13px', '16px', '19px', '22px'];
        menu.querySelectorAll('[data-name="scale"] button').forEach((b, n) => { b.style.fontSize = sizes[n]; });

        menu.querySelectorAll('.seg').forEach(group => {
            group.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                const which = group.dataset.name;
                writePref(which === 'scale' ? KEY.scale : KEY.theme, b.dataset.val);
                group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                applyReadingPrefs();
            });
        });

        document.body.appendChild(menu);
        btn.setAttribute('aria-expanded', 'true');
        setTimeout(() => document.addEventListener('click', onOutside, true), 0);
    }

    btn.addEventListener('click', () => (menu ? close() : open()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    return btn;
}
