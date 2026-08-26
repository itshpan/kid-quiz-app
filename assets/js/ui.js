/* ==========================================================================
   ui.js — shared chrome and small text helpers.
   ========================================================================== */

import { getActiveProfile, getProfiles, getProfile, createProfile, upsertProfile, setActiveId,
         AVATARS, getProgress, levelFor, syncProgress } from './store.js';
import { applyReadingPrefs, readingControls } from './reading.js';
import { getClassCode, setClassCode, setRemoteId, getRoster, createLearner, isLinked, signOut } from './sync.js';

export function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Minimal inline markdown: **bold** and *italic*. */
export function md(s) {
    return String(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');
}

export function param(key) {
    return new URLSearchParams(location.search).get(key);
}

/** Renders the sticky header. Always carries the reading controls. */
export function mountHeader({ showProfile = true } = {}) {
    applyReadingPrefs();

    const profile = getActiveProfile();
    const header = document.createElement('header');
    header.className = 'site-header no-print';
    header.innerHTML = `
        <div class="site-header-inner">
            <a class="brand" href="index.html">
                <span class="brand-mark">🧪</span>
                <span>Learning Lab</span>
            </a>
            <span class="header-spacer"></span>
            <span id="headerTools" class="row" style="gap:6px;"></span>
        </div>`;
    document.body.prepend(header);

    const tools = header.querySelector('#headerTools');

    // Say plainly whether progress leaves this device. Silent local-only
    // storage is how a term of work quietly disappears.
    const badge = document.createElement('span');
    badge.className = 'chip';
    badge.id = 'syncBadge';
    badge.style.margin = '0';
    tools.appendChild(badge);
    refreshSyncBadge();

    tools.appendChild(readingControls());

    if (showProfile && profile) {
        const chip = document.createElement('button');
        chip.className = 'btn icon';
        chip.title = 'Switch learner';
        chip.innerHTML = `<span>${profile.avatar}</span>`;
        chip.addEventListener('click', () => openProfilePicker());
        tools.appendChild(chip);
    }
    return header;
}

/**
 * Repaints the sync indicator. The header mounts before sign-in finishes, so
 * this has to be callable again afterwards — a badge that says "this device"
 * while progress is in fact syncing is worse than showing nothing.
 */
export function refreshSyncBadge() {
    const badge = document.getElementById('syncBadge');
    if (!badge) return;
    const linked = isLinked();
    badge.textContent = linked ? '☁ Synced' : '☐ This device';
    badge.title = linked
        ? 'Progress is saved to your class code and follows you between devices'
        : 'Progress is saved in this browser only';
    badge.classList.toggle('ready', linked);
}

/**
 * Asks for a class code, then loads that class's name list.
 * Resolves to the roster, or to null if the code is skipped — in which case
 * the app carries on saving to this browser only.
 */
export function openClassGate({ dismissable = true } = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:210;background:var(--ground);overflow:auto;padding:40px 20px;';
        overlay.innerHTML = `
            <div style="max-width:420px;margin:0 auto;">
                <div class="signin-steps" aria-label="Step 1 of 2">
                    <span class="signin-step now">1 · Class code</span>
                    <span class="signin-step">2 · Your name</span>
                </div>
                <h1 class="center">Enter your class code</h1>
                <ol class="signin-help">
                    <li>Type the code your parent or teacher gave you.</li>
                    <li>It looks like <code>lab-6b-xxxx</code>. Capitals don't matter.</li>
                    <li>You only do this once on each device.</li>
                </ol>
                <input class="text-input" id="codeInput" placeholder="e.g. lab-6b-xxxx" autocomplete="off"
                       autocapitalize="off" spellcheck="false" style="text-align:center;">
                <div id="codeError" class="feedback notyet hidden" style="margin-top:12px;"></div>
                <button class="btn primary wide" id="codeGo" style="margin-top:14px;">Continue</button>
                ${dismissable ? '<div class="center" style="margin-top:16px;"><button class="btn sm" id="codeSkip">Just use this device</button></div>' : ''}
            </div>`;
        document.body.appendChild(overlay);

        const field = overlay.querySelector('#codeInput');
        const go = overlay.querySelector('#codeGo');
        const err = overlay.querySelector('#codeError');

        const submit = async () => {
            const code = field.value.trim();
            if (!code) { field.focus(); return; }
            go.disabled = true; go.textContent = 'Checking…';
            try {
                const roster = await getRoster(code);
                setClassCode(code);
                overlay.remove();
                resolve(roster);
            } catch (e) {
                err.textContent = e.code === 'not-configured'
                    ? "Progress syncing isn't switched on yet. Carry on — this device will remember you."
                    : "That code didn't work. Check it and try again.";
                err.classList.remove('hidden');
                go.disabled = false; go.textContent = 'Continue';
            }
        };
        go.addEventListener('click', submit);
        field.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        overlay.querySelector('#codeSkip')?.addEventListener('click', () => { overlay.remove(); resolve(null); });
        field.focus();
    });
}

/**
 * Full-screen learner chooser.
 *
 * When a class code is linked the names come from the class roster, so the
 * same learner is recognised on any device. The remote learner id doubles as
 * the local profile id, which keeps the two stores pointing at one person.
 */
export function openProfilePicker({ dismissable = true, roster = null } = {}) {
    return new Promise(resolve => {
        const linked = isLinked() || Boolean(roster);
        const people = roster
            ? roster.learners.map(l => ({ id: l.id, name: l.name, avatar: l.avatar }))
            : getProfiles();

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:var(--ground);overflow:auto;padding:40px 20px;';
        overlay.innerHTML = `
            <div style="max-width:460px;margin:0 auto;">
                ${linked ? `<div class="signin-steps" aria-label="Step 2 of 2">
                    <span class="signin-step done">1 · Class code</span>
                    <span class="signin-step now">2 · Your name</span>
                </div>` : ''}
                <h1 class="center">Who's learning?</h1>
                <ol class="signin-help">
                    <li>Tap your name if you can see it.</li>
                    <li>Not there? Type it at the bottom and tap <strong>Create</strong>.</li>
                    <li>${linked ? 'After this, your progress follows you to any device.' : 'Progress is saved on this device only.'}</li>
                </ol>
                <div class="stack">
                    ${people.map(p => {
                        const lv = levelFor(getProgress(p.id).xp);
                        return `<button class="week" data-pick="${p.id}" data-name="${escapeHtml(p.name)}" data-av="${p.avatar}"
                                    style="width:100%;text-align:left;cursor:pointer;font-family:inherit;">
                            <span class="week-num" style="font-size:20px;">${p.avatar}</span>
                            <span class="meta"><h3>${escapeHtml(p.name)}</h3><p>Level ${lv.level} · ${escapeHtml(lv.title)}</p></span>
                        </button>`;
                    }).join('')}
                    ${people.length ? '' : '<p class="muted center small">Nobody here yet. Add the first name below.</p>'}
                </div>
                <div style="margin-top:22px;padding:18px;background:var(--surface);border:1px solid var(--line);border-radius:14px;">
                    <div class="section-title">Add someone</div>
                    <input class="text-input" id="newName" placeholder="Name" maxlength="20" autocomplete="off">
                    <div class="row" id="avatarRow" style="margin:12px 0;gap:6px;">
                        ${AVATARS.map((a, n) => `<button class="btn sm" data-avatar="${a}" style="padding:6px 9px;font-size:17px;${n === 0 ? 'border-color:var(--accent);' : ''}">${a}</button>`).join('')}
                    </div>
                    <div id="pickError" class="feedback notyet hidden" style="margin-bottom:10px;"></div>
                    <button class="btn primary wide" id="createBtn">Create</button>
                </div>
                ${dismissable ? '<div class="center" style="margin-top:16px;"><button class="btn sm" id="cancelBtn">Cancel</button></div>' : ''}
            </div>`;

        let avatar = AVATARS[0];
        overlay.querySelectorAll('[data-avatar]').forEach(b => b.addEventListener('click', () => {
            avatar = b.dataset.avatar;
            overlay.querySelectorAll('[data-avatar]').forEach(x => { x.style.borderColor = ''; });
            b.style.borderColor = 'var(--accent)';
        }));

        /** Makes sure a local profile exists for this id, then activates it. */
        const adopt = (id, name, av) => {
            if (!getProfile(id)) upsertProfile({ id, name, avatar: av });
            setActiveId(id);
            if (linked) setRemoteId(id);
            overlay.remove();
            resolve(id);
        };

        overlay.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () =>
            adopt(b.dataset.pick, b.dataset.name, b.dataset.av)));

        overlay.querySelector('#createBtn').addEventListener('click', async () => {
            const field = overlay.querySelector('#newName');
            const err = overlay.querySelector('#pickError');
            const name = field.value.trim();
            if (!name) { field.focus(); return; }

            if (!linked) return adopt(createProfile(name, avatar), name, avatar);

            const btn = overlay.querySelector('#createBtn');
            btn.disabled = true; btn.textContent = 'Adding…';
            try {
                const made = await createLearner(getClassCode(), name, avatar);
                adopt(made.id, made.name, made.avatar);
            } catch (e) {
                err.textContent = "Couldn't add that name. Check your connection and try again.";
                err.classList.remove('hidden');
                btn.disabled = false; btn.textContent = 'Create';
            }
        });

        overlay.querySelector('#cancelBtn')?.addEventListener('click', () => { overlay.remove(); resolve(null); });
        document.body.appendChild(overlay);
    });
}

/**
 * Ensures somebody is signed in. First run offers the class code; skipping it
 * falls back to this-device-only storage, which is a legitimate choice.
 */
export async function requireProfile() {
    if (getActiveProfile()) {
        // Linked already: fold in anything done on another device.
        if (isLinked()) syncProgress().catch(() => {});
        refreshSyncBadge();
        return getActiveProfile();
    }

    let roster = null;
    if (!getClassCode()) roster = await openClassGate({ dismissable: true });
    else { try { roster = await getRoster(getClassCode()); } catch { roster = null; } }

    await openProfilePicker({ dismissable: false, roster });
    if (isLinked()) await syncProgress().catch(() => {});
    refreshSyncBadge();
    return getActiveProfile();
}

/** Clears the class link and the active learner on this device. */
export function leaveClass() {
    signOut();
    location.reload();
}

/** Loads JSON from /content, with a readable error if opened via file://. */
export async function loadJSON(path) {
    try {
        const res = await fetch(`content/${path}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } catch (err) {
        if (location.protocol === 'file:') {
            throw new Error('This site needs to be served over http, not opened as a file. Run:  python3 -m http.server 8000');
        }
        throw err;
    }
}
