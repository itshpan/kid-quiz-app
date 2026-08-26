/* ==========================================================================
   teacher-view.js — pure renderer for the answer key.
   No DOM mounting and no page controller here, so this module can be reused
   by teacher.html and by the single-file preview bundle alike.
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
        case 'type':      return `${q.accept[0]}  (also accepted: ${q.accept.slice(1).join(', ') || 'none'})`;
        case 'order':     return q.items.join('  →  ');
        case 'hotspot':   return BONES[q.answerBone]?.name || q.answerBone;
        default:          return '—';
    }
}

/** The answer key body: coverage table, every item, and teaching notes. */
export function teacherKeyHTML(lesson) {
    const t = lesson.teacher || {};

    // Counting items per objective makes assessment gaps visible at a glance.
    const coverage = lesson.objectives.map(o => ({
        objective: o,
        count: lesson.quiz.filter(q => q.objective === o).length
    }));

    return `
        ${t.summary ? `<section class="card"><div class="section-title">Overview</div><p>${escapeHtml(t.summary)}</p></section>` : ''}

        <section class="card" style="margin-top:16px;">
            <div class="section-title">Learning objectives &amp; assessment coverage</div>
            <div class="keyterms">
                ${coverage.map(c => `<dl class="keyterm">
                    <dt style="color:${c.count ? 'var(--green)' : 'var(--red)'};">${c.count} item${c.count === 1 ? '' : 's'}</dt>
                    <dd>${escapeHtml(c.objective)}</dd>
                </dl>`).join('')}
            </div>
        </section>

        <h2 style="margin:30px 0 14px;">Answer key — ${lesson.quiz.length} items</h2>
        ${lesson.quiz.map((q, i) => `
            <div class="tkey-item">
                <div class="tkey-meta">Q${i + 1} · ${TEACHER_TYPE_LABEL[q.type] || q.type}</div>
                <div class="tkey-q">${md(escapeHtml(q.text))}</div>
                ${q.type === 'multiple' ? `<div style="font-size:14px;margin-bottom:10px;color:var(--text-dim);">
                    ${q.options.map((o, j) => `${'ABCD'[j]}. ${escapeHtml(o)}`).join('<br>')}</div>` : ''}
                <div class="tkey-a">✓ ${escapeHtml(answerText(q))}</div>
                <div class="tkey-why"><strong>Why:</strong> ${md(escapeHtml(q.explain))}</div>
                ${q.objective ? `<div class="tkey-meta" style="margin:10px 0 0;">Assesses: ${escapeHtml(q.objective)}</div>` : ''}
            </div>`).join('')}

        ${t.discussion ? `<section class="card" style="margin-top:26px;">
            <div class="section-title">Discussion prompts</div>
            <ul class="bullets">${t.discussion.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </section>` : ''}

        ${t.misconceptions ? `<section class="card" style="margin-top:16px;">
            <div class="section-title">Common misconceptions to correct</div>
            <ul class="bullets">${t.misconceptions.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
        </section>` : ''}

        ${t.extension ? `<section class="card" style="margin-top:16px;">
            <div class="section-title">Extension activity</div>
            <p>${escapeHtml(t.extension)}</p>
        </section>` : ''}

        <section class="card" style="margin-top:16px;">
            <div class="section-title">Key terms covered</div>
            <div class="keyterms">
                ${(lesson.blocks.find(b => b.type === 'keyterms')?.terms || []).map(term =>
                    `<dl class="keyterm"><dt>${escapeHtml(term.term)}</dt><dd>${escapeHtml(term.def)}</dd></dl>`).join('')}
            </div>
        </section>`;
}
