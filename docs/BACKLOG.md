# Backlog

Everything not in the Week 1 build, sized and sequenced. Each item names its own branch so
work stays isolated and reviewable.

Sizes: **S** ≈ under an hour · **M** ≈ 2–4 hours · **L** ≈ a day or more.

---

## Next up — content throughput

The bottleneck is now writing lessons, not building features. These make that faster.

| # | Item | Size | Branch |
|---|---|---|---|
| 1 | **Week 2 Science — Digestive System.** First test of whether the schema holds for a lesson with no skeleton diagram. Needs a new interactive: a tap-through gut path. | M | `content/sci-w2-digestive` |
| 2 | **Math Week 1 — Tessellation.** Highly visual and the natural second subject. Wants a tiling canvas he can drag shapes around in. Ties to gaming (level-design tilesets) and cars (honeycomb crash structures). | M | `content/math-w1-tessellation` |
| 3 | **English Week 1 — Nouns + Don Quixote Ch.1.** The literature strand is a gift: Don Quixote is a guy who rides off into strange scenarios and fights things that aren't really there. Frame the whole English track as story-craft and it stops being grammar homework. | M | `content/eng-w1-nouns-quixote` |
| 4 | **Lesson authoring helper.** A script that takes a topic plus an interest list and scaffolds the JSON with the right block skeleton, so writing a week starts from structure rather than a blank file. | M | `tools/lesson-scaffold` |

## Features

| # | Item | Size | Branch |
|---|---|---|---|
| 5 | **Interest profile per learner.** Right now the interest lenses are hardcoded into the lesson. Make them selectable so the same lesson can render a cars lens for one learner and a space lens for another. This is the feature that makes the app generalise beyond one kid. | L | `feat/interest-profiles` |
| 6 | **Spaced repetition.** Missed questions return in a "review" deck a few days later. This is what actually drives retention, and the quiz results already record what was missed. | M | `feat/spaced-repetition` |
| 7 | **Parent/teacher dashboard.** Per-learner view: which lessons are done, scores per objective, which questions get missed repeatedly. The objective tagging already in the quiz data makes this mostly a rendering job. | M | `feat/progress-dashboard` |
| 8 | **Cloudflare Access login.** Wrap the Pages project so only approved emails get in. No application code changes — it's a dashboard setting plus a doc update. | S | `ops/cloudflare-access` |
| 9 | **Progress sync via D1 or KV.** Progress is per-browser today, so switching from phone to laptop loses it. Only `store.js` needs rewriting. | M | `feat/cloud-progress` |
| 10 | **Bring the AI quiz generator forward.** The old app could turn a photo of a worksheet into a quiz (Gemini, own API key). Port it so a photo of the week's actual handout becomes a practice quiz. | M | `feat/photo-to-quiz` |
| 11 | **Story mode for English.** He writes AI adventure stories with aliens and Slenderman. Let the grammar objective be assessed *inside* a story he's writing rather than as isolated sentences. | L | `feat/story-mode` |
| 12 | **Audio narration.** Read-aloud for lesson text using the browser's speech synthesis. Accessibility win, zero dependencies. | S | `feat/read-aloud` |

## Polish

| # | Item | Size | Branch |
|---|---|---|---|
| 13 | **Redraw the skeleton diagram.** The current one is recognisable but stylised — the mandible reads oddly against the skull and the lower legs are ambiguous. Worth a proper pass now that the interaction is proven. | M | `polish/skeleton-art` |
| 14 | **Fix the surface-area content bug.** In `practice/index.html`, the hard prism question has a broken solution: the working shows "Wait, let me recalculate" and the stated answer ($67.68) doesn't match the arithmetic (19.32 m² × $3 = $57.96). Pick a price, fix the answer, delete the stray text. | S | `fix/surface-area-solution` |
| 15 | **Offline support.** A service worker so lessons work without internet — relevant if he uses this on a phone in transit. | M | `feat/offline` |
| 16 | **Merge the old quiz app into the new engine.** `practice/index.html` is still a separate 112KB file with its own everything. Convert its questions to lesson JSON and delete it. | M | `refactor/absorb-practice-app` |

---

## Animation prompt for Codex

Paste this to generate a drop-in animation. It's written to match the app's constraints so the
output plugs straight into a lesson.

> Build a single self-contained HTML file containing an animated SVG diagram: **a punch travelling
> up the human kinetic chain.**
>
> Requirements:
> - Front-facing simplified human skeleton, roughly 200×420 viewBox, bones in light grey
>   (`#e8e8f0`) with `#9a9ab0` strokes, on a transparent background.
> - Animate a pulse of energy travelling in sequence: **floor → foot → tibia → femur → pelvis →
>   spine → shoulder → humerus → forearm → metacarpals.** Each segment lights up amber
>   (`#f5c542`) as the pulse passes, then fades back over ~400ms.
> - The pulse repeats on a loop with a ~1s pause between cycles.
> - A caption under the diagram names the current segment as it lights up.
> - Controls: play/pause, and a speed slider from 0.25× to 2×.
> - Pure SVG + CSS + vanilla JS. **No external libraries, no build step, no network requests.**
> - Honour `prefers-reduced-motion: reduce` by rendering the final state statically with no loop.
> - Expose `window.KineticChain = { play(), pause(), setSpeed(n) }` so a host page can drive it.
> - Dark background assumed — make sure everything is legible on `#0a0a0f`.
>
> Output one file, no explanation.

To plug the result in: save it as `assets/animations/kinetic-chain.html`, then add an `iframe`
block type to `lesson.js` following the pattern of the existing `video` block.

Other animations worth generating the same way:
- **Crumple zone vs safety cell** — a car hitting a wall in cross-section, front deforming while
  the cabin holds, with the rib/skull comparison labelled alongside.
- **Bone remodelling** — osteoblasts and osteoclasts working on a bone cross-section, with a
  load slider that visibly increases density over simulated years.
- **The three muscle types** — three looping micrographs side by side: striated skeletal fibres,
  smooth spindle cells, and branching cardiac fibres beating on their own rhythm.

## YouTube clips to vet

Every lesson has a `video` block ready — it renders a placeholder until a `youtubeId` is set.
Watch these before adding them; the block uses `youtube-nocookie.com` so there's no tracking, but
it does not filter what's in the video itself.

Search terms that tend to surface good Grade 6 material:
- "skeletal system for kids" · "how bones heal" · "why bones are stronger than steel"
- "three types of muscle tissue" · "how muscles work animation"
- Crash-test and seatbelt-physics explainers — these land especially well given the car angle
