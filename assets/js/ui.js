/* ==========================================================================
   ui.js — shared chrome and small text helpers.
   ========================================================================== */

import { getActiveProfile, getProfiles, createProfile, setActiveId, AVATARS, getProgress, levelFor } from './store.js';
import { applyReadingPrefs, readingControls } from './reading.js';

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

/** Full-screen learner chooser. Resolves once a profile is active. */
export function openProfilePicker({ dismissable = true } = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:var(--ground);overflow:auto;padding:40px 20px;';

        const profiles = getProfiles();
        overlay.innerHTML = `
            <div style="max-width:460px;margin:0 auto;">
                <h1 class="center">Who's learning?</h1>
                <p class="muted center" style="margin:8px auto 26px;">Everyone keeps their own progress.</p>
                <div class="stack">
                    ${profiles.map(p => {
                        const lv = levelFor(getProgress(p.id).xp);
                        return `<button class="week" data-pick="${p.id}" style="width:100%;text-align:left;cursor:pointer;font-family:inherit;">
                            <span class="week-num" style="font-size:20px;">${p.avatar}</span>
                            <span class="meta"><h3>${escapeHtml(p.name)}</h3><p>Level ${lv.level} · ${escapeHtml(lv.title)}</p></span>
                        </button>`;
                    }).join('')}
                </div>
                <div style="margin-top:22px;padding:18px;background:var(--surface);border:1px solid var(--line);border-radius:14px;">
                    <div class="section-title">Add someone</div>
                    <input class="text-input" id="newName" placeholder="Name" maxlength="20" autocomplete="off">
                    <div class="row" id="avatarRow" style="margin:12px 0;gap:6px;">
                        ${AVATARS.map((a, n) => `<button class="btn sm" data-av="${a}" style="padding:6px 9px;font-size:17px;${n === 0 ? 'border-color:var(--accent);' : ''}">${a}</button>`).join('')}
                    </div>
                    <button class="btn primary wide" id="createBtn">Create</button>
                </div>
                ${dismissable ? '<div class="center" style="margin-top:16px;"><button class="btn sm" id="cancelBtn">Cancel</button></div>' : ''}
            </div>`;

        let avatar = AVATARS[0];
        overlay.querySelectorAll('[data-av]').forEach(b => b.addEventListener('click', () => {
            avatar = b.dataset.av;
            overlay.querySelectorAll('[data-av]').forEach(x => { x.style.borderColor = ''; });
            b.style.borderColor = 'var(--accent)';
        }));
        overlay.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
            setActiveId(b.dataset.pick);
            overlay.remove();
            resolve(b.dataset.pick);
        }));
        overlay.querySelector('#createBtn').addEventListener('click', () => {
            const field = overlay.querySelector('#newName');
            const name = field.value.trim();
            if (!name) { field.focus(); return; }
            const id = createProfile(name, avatar);
            setActiveId(id);
            overlay.remove();
            resolve(id);
        });
        overlay.querySelector('#cancelBtn')?.addEventListener('click', () => { overlay.remove(); resolve(null); });

        document.body.appendChild(overlay);
    });
}

export async function requireProfile() {
    if (getActiveProfile()) return getActiveProfile();
    await openProfilePicker({ dismissable: false });
    return getActiveProfile();
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
