/* ==========================================================================
   answers.js — the correct answer for a question, as text.

   One function, and its own module on purpose. Two very different screens
   need it: the learner's "answers to remember" list after a quiz, and the
   teacher's answer key.

   Neither of the obvious homes works. In question.js the teacher's key
   would import the whole question renderer to get one string. In
   teacher-view.js the learner's quiz would import the teacher's screen.
   Either way the two screens drift apart or pull in each other's
   dependencies, and they had already drifted once: teacher-view had its own
   copy of this switch with the option letter baked in, so the learner's
   list could not reuse it.

   (This module imports only skeleton.js, for the bone names. That is not
   a claim about teacher-view being storage-free: it reaches store.js
   through ui.js regardless, and always did.)
   ========================================================================== */

import { BONES } from './skeleton.js';

/**
 * Why this is needed at all, rather than just showing the explanation:
 * 2,165 of the 2,784 multiple-choice and true/false questions, 77%, have an
 * explanation that never states the answer. That is deliberate and correct.
 * An explanation hands over the missing fact, it does not repeat the option
 * he just read, so "How many qualities are in that list?" is explained by
 * naming all nine of them and never saying "nine".
 *
 * At answer time that works, because the correct option is lit up on screen
 * beside it. In a list read afterwards nothing is lit up, and a reviewer
 * that shows a question and a cryptic hint with no answer fails at the one
 * job it has: he is meant to come away remembering the correct answer.
 */
export function answerText(q) {
    switch (q.type || 'multiple') {
        case 'truefalse': return q.answer ? 'True' : 'False';
        case 'type':      return (q.accept && q.accept[0]) || '';
        case 'order':     return (q.items || []).join(' → ');
        case 'hotspot':   return BONES[q.answerBone]?.name || q.answerBone || '';
        default:
            return (q.options && q.answerIndex != null) ? q.options[q.answerIndex] : '';
    }
}
