/* ==========================================================================
   lesson.js — lesson.html controller.
   Three stages: a short intro, the card deck, then the quiz.
   ========================================================================== */

import { escapeHtml, param, loadJSON, mountHeader, requireProfile } from './ui.js';
import { mountDeck, deckAsPage } from './deck.js';
import { runQuiz } from './quiz.js';
import { recordQuiz, getProgress, saveProgress, levelFor } from './store.js';

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
        page.innerHTML = `<section class="card"><h2>Couldn't load the lesson</h2><p>${escapeHtml(err.message)}</p></section>`;
        return;
    }

    document.title = `${lesson.title} · Learning Lab`;

    // Resume where he stopped. Losing your place is a common reason a lesson
    // never gets finished, so the app remembers it rather than asking him to.
    const progress = getProgress();
    const resumeAt = progress.deckPosition?.[lesson.id] ?? 0;

    page.innerHTML = `
        <div class="lesson-head" id="lessonHead">
            <a class="crumb" href="course.html?c=${encodeURIComponent(lesson.courseId)}">← ${escapeHtml(lesson.courseTitle || 'Back')}</a>
            <div class="eyebrow">Week ${lesson.week}</div>
            <h1 style="margin:6px 0 10px;">${escapeHtml(lesson.title)}</h1>
            <p class="lede">${escapeHtml(lesson.subtitle)}</p>
        </div>

        <section class="card" style="margin-top:22px;" id="intro">
            <div class="row" style="gap:8px;margin-bottom:16px;">
                <span class="chip">⏱ About ${lesson.estMinutes} min</span>
                <span class="chip">${lesson.cards.length} cards</span>
                <span class="chip">${lesson.quiz.length} questions at the end</span>
            </div>
            <p class="small">One idea per card. Tap through at your own speed. There are a few quick checks along the way — they don't count for anything.</p>
            <div class="deck-nav" style="margin-top:18px;">
                <button class="btn primary" id="start">${resumeAt > 0 ? `Pick up at card ${resumeAt + 1}` : 'Start'}</button>
                ${resumeAt > 0 ? '<button class="btn" id="restart">Start over</button>' : ''}
            </div>
        </section>

        <div id="deckHost" class="deck hidden"></div>

        <section class="card center hidden" id="quizGate">
            <h2>That's the lesson done</h2>
            <p style="margin:10px auto 18px;">${lesson.quiz.length} questions now. You can retake it as many times as you like.</p>
            <button class="btn primary" id="startQuiz">Start the quiz</button>
        </section>

        <div id="quizHost" class="hidden"></div>

        <details class="no-print" style="margin-top:34px;">
            <summary class="small muted" style="cursor:pointer;">For parents and teachers: see every card at once</summary>
            <div style="margin-top:14px;" class="stack">${deckAsPage(lesson.cards)}</div>
            <p style="margin-top:14px;"><a class="btn sm" href="teacher.html?file=${encodeURIComponent(file)}">Open the answer key</a></p>
        </details>`;

    const intro = document.getElementById('intro');
    const deckHost = document.getElementById('deckHost');
    const quizGate = document.getElementById('quizGate');
    const quizHost = document.getElementById('quizHost');

    function launchDeck(from) {
        intro.classList.add('hidden');
        document.getElementById('lessonHead').classList.add('compact');
        deckHost.classList.remove('hidden');
        mountDeck(deckHost, lesson.cards, {
            startAt: from,
            onMove: n => {
                const p = getProgress();
                p.deckPosition = { ...(p.deckPosition || {}), [lesson.id]: n };
                saveProgress(p);
            },
            onFinish: () => {
                deckHost.classList.add('hidden');
                quizGate.classList.remove('hidden');
                quizGate.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        });
    }

    document.getElementById('start').addEventListener('click', () => launchDeck(resumeAt));
    document.getElementById('restart')?.addEventListener('click', () => launchDeck(0));

    document.getElementById('startQuiz').addEventListener('click', () => {
        quizGate.classList.add('hidden');
        quizHost.classList.remove('hidden');
        runQuiz(quizHost, lesson.quiz, {
            onFinish: ({ correct, total, xp }) => {
                const before = levelFor(getProgress().xp).level;
                const after = recordQuiz(lesson.id, correct, total, xp);
                const now = levelFor(after.xp);
                if (now.level > before) {
                    const note = document.createElement('div');
                    note.className = 'feedback yes';
                    note.style.margin = '18px auto 0';
                    note.innerHTML = `<b>Level up — you're Level ${now.level} now</b>${escapeHtml(now.title)}`;
                    quizHost.querySelector('.results').appendChild(note);
                }
            }
        });
    });
}

main();
