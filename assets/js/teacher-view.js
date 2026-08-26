/* ==========================================================================
   teacher-view.js — pure renderer for the answer key.
   No DOM mounting and no page controller, so teacher.html and the single-file
   preview bundle can both use it and never drift apart.
   ========================================================================== */

import { escapeHtml, md } from './ui.js';
import { BONES } from './skeleton.js';

export const TEACHER_TYPE_LABEL = {
    multiple: 'Multiple choice',
    truefalse: 'True / False',
    type: 'Short answer',
    order: 'Sequencing',
    hotspot: 'Diagram — label identification'
};

/** The human-readable correct answer for any question type. */
export function answerText(q) {
    switch (q.type) {
        case 'multiple':  return `${'ABCD'[q.answerIndex]} — ${q.options[q.answerIndex]}`;
        case 'truefalse': return q.answer ? 'True' : 'False';
        case 'type':      return `${q.accept[0]}${q.accept.length > 1 ? `  (also accepted: ${q.accept.slice(1).join(', ')})` : ''}`;
        case 'order':     return q.items.join('  →  ');
        case 'hotspot':   return BONES[q.answerBone]?.name || q.answerBone;
        default:          return '—';
    }
}

function item(q, label) {
    return `<div class="tkey">
        <div class="tkey-meta">${escapeHtml(label)} · ${TEACHER_TYPE_LABEL[q.type] || q.type}</div>
        <div class="tkey-q">${md(escapeHtml(q.text))}</div>
        ${q.type === 'multiple' ? `<div class="small muted" style="margin-bottom:8px;">
            ${q.options.map((o, j) => `${'ABCD'[j]}. ${escapeHtml(o)}`).join('<br>')}</div>` : ''}
        <div class="tkey-a">✓ ${escapeHtml(answerText(q))}</div>
        <div class="tkey-why"><strong>Why:</strong> ${md(escapeHtml(q.explain))}</div>
        ${q.objective ? `<div class="tkey-meta" style="margin:9px 0 0;">Assesses: ${escapeHtml(q.objective)}</div>` : ''}
    </div>`;
}

/** Coverage table, checkpoints, quiz answers and teaching notes. */
export function teacherKeyHTML(lesson) {
    const t = lesson.teacher || {};

    // Counting items per objective makes assessment gaps visible at a glance.
    const coverage = lesson.objectives.map(o => ({
        objective: o,
        count: lesson.quiz.filter(q => q.objective === o).length
    }));

    const checkpoints = (lesson.cards || [])
        .map((c, n) => ({ c, n }))
        .filter(x => x.c.kind === 'checkpoint');

    return `
        ${t.summary ? `<section class="card"><div class="section-title">Overview</div><p>${escapeHtml(t.summary)}</p></section>` : ''}

        <section class="card" style="margin-top:14px;">
            <div class="section-title">Objectives &amp; assessment coverage</div>
            <div class="terms">
                ${coverage.map(c => `<dl class="term">
                    <dt style="color:${c.count ? 'var(--yes)' : 'var(--notyet)'};">${c.count} quiz item${c.count === 1 ? '' : 's'}</dt>
                    <dd>${escapeHtml(c.objective)}</dd>
                </dl>`).join('')}
            </div>
        </section>

        ${checkpoints.length ? `
            <h2 style="margin:28px 0 6px;">Checkpoints — ${checkpoints.length} in the cards</h2>
            <p class="small muted" style="margin-bottom:14px;">
                These appear mid-lesson as quick retrieval checks. They are not scored and do not block progress.
            </p>
            <div class="stack">${checkpoints.map(x => item(x.c.question, `Card ${x.n + 1}`)).join('')}</div>` : ''}

        <h2 style="margin:28px 0 14px;">Quiz answer key — ${lesson.quiz.length} items</h2>
        <div class="stack">${lesson.quiz.map((q, n) => item(q, `Q${n + 1}`)).join('')}</div>

        ${t.discussion ? `<section class="card" style="margin-top:24px;">
            <div class="section-title">Discussion prompts</div>
            <ul class="points">${t.discussion.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </section>` : ''}

        ${t.misconceptions ? `<section class="card" style="margin-top:14px;">
            <div class="section-title">Common misconceptions</div>
            <ul class="points">${t.misconceptions.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
        </section>` : ''}

        ${t.extension ? `<section class="card" style="margin-top:14px;">
            <div class="section-title">Extension activity</div>
            <p>${escapeHtml(t.extension)}</p>
        </section>` : ''}

        <section class="card" style="margin-top:14px;">
            <div class="section-title">Key terms covered</div>
            <div class="terms">
                ${(lesson.cards || [])
                    .filter(c => c.kind === 'terms')
                    .flatMap(c => c.terms)
                    .map(term => `<dl class="term"><dt>${escapeHtml(term.term)}</dt><dd>${escapeHtml(term.def)}</dd></dl>`)
                    .join('')}
            </div>
        </section>`;
}
