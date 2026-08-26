/* ==========================================================================
   teacher.js — teacher.html controller.
   Deliberately has no profile gate: a teacher opens the link and reads it.
   ========================================================================== */

import { escapeHtml, param, loadJSON, mountHeader } from './ui.js';
import { teacherKeyHTML } from './teacher-view.js';

async function main() {
    mountHeader({ showProfile: false });

    const page = document.getElementById('teacherPage');
    const file = param('file');
    if (!file) { page.innerHTML = '<p class="muted">No lesson specified.</p>'; return; }

    let lesson;
    try {
        lesson = await loadJSON(file);
    } catch (err) {
        page.innerHTML = `<div class="card"><h2>Couldn't load the lesson</h2><p style="margin-top:10px;">${escapeHtml(err.message)}</p></div>`;
        return;
    }

    document.title = `Answer Key — ${lesson.title}`;
    const lessonHref = `lesson.html?file=${encodeURIComponent(file)}`;

    page.innerHTML = `
        <a class="crumb no-print" href="${lessonHref}">← Back to the lesson</a>
        <div class="eyebrow">Teacher answer key · Week ${lesson.week}</div>
        <h1 style="margin:6px 0 10px;">${escapeHtml(lesson.title)}</h1>
        <p class="lede">${escapeHtml(lesson.subtitle)}</p>

        <div class="row no-print" style="margin:20px 0;">
            <button class="btn primary" id="printBtn">🖨 Print / Save as PDF</button>
            <a class="btn" href="${lessonHref}">Open student view</a>
        </div>

        ${teacherKeyHTML(lesson)}`;

    document.getElementById('printBtn').addEventListener('click', () => window.print());
}

main();
