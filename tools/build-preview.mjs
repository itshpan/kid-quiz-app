/* ==========================================================================
   build-preview.mjs — flattens one lesson into a single self-contained HTML
   file (no fetch, no module graph, no external assets except the webfont).
   Useful for sharing a preview link before the site is deployed anywhere.

     node tools/build-preview.mjs science/w1-skeleton.json dist/preview.html
   ========================================================================== */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = p => readFile(join(ROOT, p), 'utf8');

// Order matters: dependencies before dependents, since the bundle drops the
// module system and relies on a single shared scope.
const MODULES = ['store.js', 'ui.js', 'skeleton.js', 'quiz.js', 'teacher-view.js', 'lesson.js'];

/** Strips ESM syntax so modules can share one <script> scope. */
function flatten(src) {
    return src
        .replace(/^\s*import[\s\S]*?from\s*['"][^'"]+['"];\s*$/gm, '')
        .replace(/^\s*export\s+(?=(const|let|var|function|async|class)\b)/gm, '')
        .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '');
}

const [lessonPath = 'science/w1-skeleton.json', outPath = 'dist/preview.html'] = process.argv.slice(2);

const lesson = JSON.parse(await read(join('content', lessonPath)));
const css = await read('assets/css/app.css');

let js = '';
for (const m of MODULES) js += `\n/* ---- ${m} ---- */\n` + flatten(await read(join('assets/js', m)));

// lesson.js expects to read ?file= and fetch it. In the bundle the lesson is
// already here, and there are no sibling pages to link to.
js = js
    // No learner profiles in a shared preview: skip the gate and the chip.
    .replace(/\s*await requireProfile\(\);/, '')
    .replace(/mountHeader\(\);/, 'mountHeader({ showProfile: false });')
    .replace(/const file = param\('file'\);/, 'const file = null;')
    .replace(/if \(!file\) \{[^}]*\}\n/, '')
    .replace(/lesson = await loadJSON\(file\);/, 'lesson = EMBEDDED_LESSON;')
    .replace(/href="course\.html\?c=\$\{encodeURIComponent\(lesson\.courseId\)\}"/, 'href="#top"')
    .replace(/<a class="chip" href="teacher\.html\?file=\$\{encodeURIComponent\(file\)\}"[^>]*>[^<]*<\/a>/,
             '<button class="chip" id="keyToggle" style="cursor:pointer;font-family:inherit;">🔑 Answer key</button>')
    .replace(/<a class="btn primary" href="index\.html">Back to subjects<\/a>/,
             '<button class="btn primary" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">Back to the top</button>');

const html = `<title>Skeletal &amp; Muscular Systems</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet">
<style>
${css}
/* Preview-only: the answer key lives on the same page instead of its own route. */
#keyPanel { margin-top: 28px; }
#keyPanel[hidden] { display: none; }
.preview-note {
    border: 1px solid var(--border);
    border-left: 3px solid var(--cyan);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    font-size: 13px;
    color: var(--text-dim);
    line-height: 1.6;
    margin-bottom: 20px;
}
</style>
<div class="bg-effects"></div>
<main class="page" id="top">
    <p class="preview-note no-print">
        <strong style="color:var(--cyan);">Preview build.</strong>
        One lesson, flattened into a single page so it can be shared before the site is deployed.
        Progress isn't saved here and the other subjects aren't included — both work on the full site.
    </p>
    <div id="lessonPage"></div>
    <section id="keyPanel" hidden>
        <h2 style="margin-bottom:6px;">Teacher answer key</h2>
        <p class="muted" style="font-size:14px;margin-bottom:18px;">
            ${lesson.quiz.length} items with answers, explanations and teaching notes. Use your browser's print function to save it as a PDF.
        </p>
        <div id="keyBody"></div>
    </section>
</main>
<script>
const EMBEDDED_LESSON = ${JSON.stringify(lesson)};
${js}

// Answer-key toggle, standing in for the separate teacher.html route.
// Rendered by the same teacher-view module the real site uses, so the preview
// can never drift from teacher.html.
document.addEventListener('click', e => {
    if (e.target.id !== 'keyToggle') return;
    const panel = document.getElementById('keyPanel');
    const body = document.getElementById('keyBody');
    if (!body.innerHTML) body.innerHTML = teacherKeyHTML(EMBEDDED_LESSON);
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
</script>
`;

await mkdir(dirname(join(ROOT, outPath)), { recursive: true });
await writeFile(join(ROOT, outPath), html, 'utf8');
console.log(`wrote ${outPath} — ${(html.length / 1024).toFixed(0)} KB`);
