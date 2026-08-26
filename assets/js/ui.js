/* ==========================================================================
   ui.js — shared chrome: header, profile chip, and tiny text helpers.
   ========================================================================== */

import { getActiveProfile, getProfiles, createProfile, setActiveId, AVATARS, getProgress, levelFor } from './store.js';

export function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Minimal inline markdown: **bold** and *italic*. Input is our own content, so tags are allowed through. */
export function md(s) {
    return String(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');
}

/** Reads ?key=value from the URL. */
export function param(key) {
    return new URLSearchParams(location.search).get(key);
}

/** Resolves a path relative to the site root, from any page depth. */
export function root(path = '') {
    const depth = location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
    // Pages live at the site root, so this is a no-op today; kept so nested
    // pages (e.g. /courses/x.html) don't need to hand-write ../ paths later.
    return path;
}

/** Renders the sticky site header into <body>. Call before rendering the page. */
export function mountHeader({ showProfile = true } = {}) {
    const profile = getActiveProfile();
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
        <div class="site-header-inner">
            <a class="brand" href="index.html">
                <span class="brand-mark">🧪</span>
                <span>Learning Lab</span>
            </a>
            <span class="header-spacer"></span>
            ${showProfile && profile ? `
                <button class="user-chip" id="userChip" title="Switch learner">
                    <span class="avatar">${profile.avatar}</span>
                    <span>${escapeHtml(profile.name)}</span>
                </button>` : ''}
        </div>`;
    document.body.prepend(header);

    const chip = header.querySelector('#userChip');
    if (chip) chip.addEventListener('click', () => openProfilePicker());
    return header;
}

/** Full-screen profile chooser. Resolves once a profile is active. */
export function openProfilePicker({ dismissable = true } = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(10,10,15,.94);backdrop-filter:blur(8px);overflow:auto;padding:40px 20px;';

        const draw = () => {
            const profiles = getProfiles();
            overlay.innerHTML = `
                <div style="max-width:520px;margin:0 auto;">
                    <h1 style="text-align:center;margin-bottom:8px;">Who's learning?</h1>
                    <p class="muted center" style="margin-bottom:28px;">Each learner keeps their own progress.</p>
                    <div class="stack" id="plist">
                        ${profiles.map(p => {
                            const lv = levelFor(getProgress(p.id).xp);
                            return `<button class="week-item" data-pick="${p.id}" style="width:100%;text-align:left;font-family:inherit;cursor:pointer;">
                                <span class="week-num" style="font-size:20px;">${p.avatar}</span>
                                <span class="week-meta"><h3>${escapeHtml(p.name)}</h3><p>Level ${lv.level} · ${lv.title}</p></span>
                            </button>`;
                        }).join('')}
                    </div>
                    <div class="card" style="margin-top:20px;">
                        <div class="section-title">Add a learner</div>
                        <input class="text-input" id="newName" placeholder="Name" maxlength="20" autocomplete="off">
                        <div class="row" id="avatarRow" style="margin:14px 0;gap:8px;">
                            ${AVATARS.map((a, i) => `<button class="btn sm" data-av="${a}" style="padding:8px 10px;font-size:18px;${i === 0 ? 'border-color:var(--gold);' : ''}">${a}</button>`).join('')}
                        </div>
                        <button class="btn primary wide" id="createBtn">Create learner</button>
                    </div>
                    ${dismissable ? '<div class="center" style="margin-top:18px;"><button class="btn ghost sm" id="cancelBtn">Cancel</button></div>' : ''}
                </div>`;

            let avatar = AVATARS[0];
            overlay.querySelectorAll('[data-av]').forEach(b => b.addEventListener('click', () => {
                avatar = b.dataset.av;
                overlay.querySelectorAll('[data-av]').forEach(x => x.style.borderColor = '');
                b.style.borderColor = 'var(--gold)';
            }));
            overlay.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
                setActiveId(b.dataset.pick);
                overlay.remove();
                resolve(b.dataset.pick);
            }));
            overlay.querySelector('#createBtn').addEventListener('click', () => {
                const name = overlay.querySelector('#newName').value.trim();
                if (!name) { overlay.querySelector('#newName').focus(); return; }
                const id = createProfile(name, avatar);
                setActiveId(id);
                overlay.remove();
                resolve(id);
            });
            const cancel = overlay.querySelector('#cancelBtn');
            if (cancel) cancel.addEventListener('click', () => { overlay.remove(); resolve(null); });
        };

        draw();
        document.body.appendChild(overlay);
    });
}

/** Ensures a learner is selected; shows the picker if not. */
export async function requireProfile() {
    if (getActiveProfile()) return getActiveProfile();
    await openProfilePicker({ dismissable: false });
    return getActiveProfile();
}

/** Loads a JSON file from /content, with a readable error if the page is opened via file://. */
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
