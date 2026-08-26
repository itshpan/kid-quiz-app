/* ==========================================================================
   lesson.js — renders a lesson JSON file into the page, then hands off
   to the quiz engine. Every block type is one function in BLOCKS.
   ========================================================================== */

import { escapeHtml, md, param, loadJSON, mountHeader, requireProfile } from './ui.js';
import { skeletonSVG, bindSkeleton, boneInfoHTML } from './skeleton.js';
import { runQuiz } from './quiz.js';
import { recordQuiz, getProgress, levelFor } from './store.js';

const bulletList = items => `<ul class="bullets">${items.map(b => `<li>${md(escapeHtml(b))}</li>`).join('')}</ul>`;
const paras = body => (body || []).map(p => `<p>${md(escapeHtml(p))}</p>`).join('');

const BLOCKS = {
    hook: b => `<section class="hook"><h2>${escapeHtml(b.title)}</h2>${paras(b.body)}</section>`,

    text: b => `<section class="card block-text">
        <h2 style="margin-bottom:12px;">${escapeHtml(b.title)}</h2>
        ${paras(b.body)}
        ${b.bullets ? `<div style="margin-top:14px;">${bulletList(b.bullets)}</div>` : ''}
    </section>`,

    lens: b => `<section class="lens" style="--lens-color:${b.color}">
        <div class="lens-head">
            <span class="lens-icon">${b.icon}</span>
            <div>
                <div class="lens-label">${escapeHtml(b.label)}</div>
                <h3>${escapeHtml(b.title)}</h3>
            </div>
        </div>
        ${paras(b.body)}
        ${b.bullets ? `<div style="margin-top:14px;">${bulletList(b.bullets)}</div>` : ''}
    </section>`,

    skeleton: b => `<section class="card">
        <h2 style="margin-bottom:6px;">${escapeHtml(b.title)}</h2>
        <p class="muted" style="font-size:14px;margin-bottom:16px;">${escapeHtml(b.caption)}</p>
        <div class="skeleton-explorer" id="skeletonBlock">
            <div class="skeleton-stage">${skeletonSVG()}</div>
            <div class="bone-info">${boneInfoHTML(null)}</div>
        </div>
    </section>`,

    keyterms: b => `<section class="card">
        <h2 style="margin-bottom:14px;">${escapeHtml(b.title)}</h2>
        <div class="keyterms">${b.terms.map(t =>
            `<dl class="keyterm"><dt>${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.def)}</dd></dl>`).join('')}</div>
    </section>`,

    dyk: b => `<section>
        <div class="section-title">${escapeHtml(b.title)}</div>
        <div class="dyk">${b.cards.map(c =>
            `<div class="dyk-card"><span class="dyk-tag">${escapeHtml(c.tag)}</span><p>${escapeHtml(c.text)}</p></div>`).join('')}</div>
    </section>`,

    video: b => `<section>
        <div class="section-title">${escapeHtml(b.title)}</div>
        ${b.youtubeId
            ? `<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.youtubeId)}" title="${escapeHtml(b.title)}" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
            : `<div class="media-slot">📺 Video slot ready — add a <code>youtubeId</code> to this block in the lesson JSON and it renders here.</div>`}
        ${b.caption ? `<p class="video-caption">${escapeHtml(b.caption)}</p>` : ''}
    </section>`,

    recap: b => `<section class="card" style="border-color:var(--gold-dim);">
        <h2 style="margin-bottom:14px;">${escapeHtml(b.title)}</h2>
        ${bulletList(b.bullets)}
    </section>`
};

async function main() {
    mountHeader();
    await requireProfile();

    const file = param('file');
    const page = document.getElementById('lessonPage');
    if (!file) { page.innerHTML = '<p class="muted">No lesson specified.</p>'; return; }

    let lesson;
    try {
        lesson = await loadJSON(file);
    } catch (err) {
        page.innerHTML = `<div class="card"><h2>Couldn't load the lesson</h2><p style="margin-top:10px;">${escapeHtml(err.message)}</p></div>`;
        return;
    }

    document.title = `${lesson.title} · Learning Lab`;

    page.innerHTML = `
        <a class="crumb" href="course.html?c=${encodeURIComponent(lesson.courseId)}">← Back to ${escapeHtml(lesson.courseTitle || lesson.courseId)}</a>
        <div class="eyebrow">Week ${lesson.week}</div>
        <h1 style="margin:6px 0 10px;">${escapeHtml(lesson.title)}</h1>
        <p class="lede">${escapeHtml(lesson.subtitle)}</p>

        <div class="row" style="margin:20px 0 8px;">
            <span class="chip">⏱ About ${lesson.estMinutes} min</span>
            <span class="chip">📝 ${lesson.quiz.length} questions</span>
            <a class="chip" href="teacher.html?file=${encodeURIComponent(file)}" style="text-decoration:none;">🔑 Answer key</a>
        </div>

        <section class="card" style="margin-top:18px;">
            <div class="section-title">By the end of this lesson</div>
            ${bulletList(lesson.objectives)}
        </section>

        <div class="lesson-body" style="margin-top:22px;">
            ${lesson.blocks.map(b => (BLOCKS[b.type] || (() => ''))(b)).join('')}
        </div>

        <section id="quizGate" class="card center" style="margin-top:28px;border-color:var(--gold-dim);">
            <h2>Ready for the quiz?</h2>
            <p class="muted" style="margin:8px 0 18px;">${lesson.quiz.length} questions, five different formats. You can retake it as many times as you want.</p>
            <button class="btn primary" id="startQuiz">Start the quiz</button>
        </section>

        <section id="quizHost" class="card hidden" style="margin-top:28px;"></section>`;

    // Wire the interactive skeleton if this lesson uses one.
    const skelBlock = document.getElementById('skeletonBlock');
    if (skelBlock) {
        const info = skelBlock.querySelector('.bone-info');
        bindSkeleton(skelBlock, id => { info.innerHTML = boneInfoHTML(id); });
    }

    document.getElementById('startQuiz').addEventListener('click', () => {
        document.getElementById('quizGate').classList.add('hidden');
        const host = document.getElementById('quizHost');
        host.classList.remove('hidden');
        runQuiz(host, lesson.quiz, {
            onFinish: ({ correct, total, xp }) => {
                const before = levelFor(getProgress().xp).level;
                const after = levelFor(recordQuiz(lesson.id, correct, total, xp).xp).level;
                if (after > before) {
                    const note = document.createElement('div');
                    note.className = 'feedback good';
                    note.style.marginTop = '16px';
                    note.innerHTML = `<strong>🎉 Level up — you're now Level ${after}: ${levelFor(getProgress().xp).title}</strong>`;
                    host.querySelector('.results').appendChild(note);
                }
            }
        });
    });
}

main();
