# Content guide

How to add a lesson without touching any JavaScript.

Read [`WRITING-FOR-ADHD.md`](WRITING-FOR-ADHD.md) first — it holds the rules this schema exists to
enforce. Run the checker before you commit:

```bash
node tools/check-content.mjs
```

---

## Adding a week

1. Write `content/<subject>/wN-<slug>.json`.
2. In `content/courses.json`, find that week and set `"status": "live"` plus a `"file"` path:
   ```json
   { "week": 2, "id": "sci-w2", "title": "Digestive System",
     "topics": ["Mouth, Esophagus, Stomach…"],
     "status": "live", "file": "science/w2-digestive.json" }
   ```
3. Done. The week unlocks and the answer key generates itself.

`status` is `"live"`, `"soon"` or `"exam"`.

---

## Lesson shape

```jsonc
{
  "id": "sci-w2",              // must match the id in courses.json
  "courseId": "science",
  "courseTitle": "Science",    // breadcrumb label
  "week": 2,
  "title": "Digestive System",
  "subtitle": "One short sentence.",
  "estMinutes": 20,
  "objectives": ["..."],       // shown to the learner AND used for the
                               // answer key's coverage table
  "cards": [ ... ],            // the lesson, one idea at a time
  "quiz":  [ ... ],            // the end-of-lesson assessment
  "teacher": { ... }
}
```

A lesson is a **deck of cards**, not a page. The reader taps through one at a time. He can leave
and come back — his position is saved per lesson.

---

## Card kinds

Every card takes an optional `eyebrow` (small uppercase label) and `icon` (one emoji).

### `open` — set the scene
```json
{ "kind": "open", "icon": "🏎️", "eyebrow": "Part 1 · Bones",
  "title": "Every car you like has a skeleton too",
  "text": "Strip the panels off a race car…" }
```

### `idea` — the teaching card
```json
{ "kind": "idea", "title": "Five jobs, one frame",
  "text": "Most people think bones just hold you up.",
  "points": ["**Support** — the frame everything hangs off.", "…"] }
```
Max 4 points. Start each with 2–4 **bolded** words carrying the idea — he re-finds his place by
scanning bold text after drifting.

### `lens` — the interest-personalisation card
The core idea of the app: the same curriculum, retold through something he already cares about.
```json
{ "kind": "lens", "lens": "cars", "icon": "🚗", "eyebrow": "Car mode",
  "title": "A seatbelt lands on bone on purpose",
  "text": "…", "points": ["…"] }
```
`lens` is one of `cars`, `boxing`, `growth`, `gaming`. Each gets its own colour bar so he can
*feel* the shift into "the car bit" without reading a word. Add a lens by adding a colour token
in `app.css` (search `--lens-`).

### `video` — an embedded clip
```json
{ "kind": "video", "register": "calm", "eyebrow": "60 seconds",
  "title": "See real muscle tissue", "youtubeId": "Wbo8x_Gnb4A",
  "text": "…", "credit": "Institute of Human Anatomy · youtube.com" }
```
`register` is **required**: `"high"` for fast-cut, dramatic, shock-framed clips; `"calm"` for
everything else. Max 3 videos per lesson and **max one `high`**, and a `high` video may not be
followed by an `idea` or `lens` card. The checker enforces all of it — see the stimulation budget
in [`WRITING-FOR-ADHD.md`](WRITING-FOR-ADHD.md).

### `figure` — a built-in SVG diagram
```json
{ "kind": "figure", "figure": "boneDensity", "title": "…", "text": "…" }
```
`figure` names an entry in `FIGURES` in `assets/js/figures.js`. Two of the five are interactive.

### `image` — a picture file
```json
{ "kind": "image", "title": "…", "src": "assets/img/x.svg",
  "alt": "what the picture shows", "credit": "…", "text": "…" }
```
`alt` is required. See [`IMAGE-PROMPTS.md`](IMAGE-PROMPTS.md) for generating these.

### `story` — a real person
```json
{ "kind": "story", "icon": "🥊", "eyebrow": "He started smaller than you",
  "title": "Manny Pacquiao", "text": "…", "points": ["…"] }
```
Use for worked examples of the behaviour the lesson is arguing for. Prefer people he could
plausibly identify with over distant legends.

### `fact` — a single striking number
```json
{ "kind": "fact", "eyebrow": "Did you know",
  "text": "Astronauts lose 1–2% of bone density every month in orbit." }
```
One fact, no points, no title. These are pacing tools — put them between two heavy cards.

### `diagram` — the interactive skeleton
```json
{ "kind": "diagram", "title": "Tap any bone", "text": "…" }
```
Bone data lives in `assets/js/skeleton.js`.

### `terms` — vocabulary reference
```json
{ "kind": "terms", "title": "Bone words",
  "terms": [{ "term": "Femur", "def": "Thigh bone…" }] }
```
Exempt from the 40-word ceiling: it's looked up, not read through. Split long lists into two
cards by theme rather than one card of thirty terms. These also appear in the teacher key.

### `checkpoint` — mid-lesson retrieval
```json
{ "kind": "checkpoint", "question": { "type": "multiple", "text": "…", "options": ["…"],
  "answerIndex": 0, "explain": "…" } }
```
Takes any question type (below). **One every 4–6 cards — the checker enforces it.** Not scored,
never blocks on being *right*, only on being answered. This is the highest-value structural rule
in the whole system: reading without retrieval is a trance.

### `break` — an offered stopping point
```json
{ "kind": "break", "title": "Good spot to pause", "text": "…" }
```
Renders a "Stop for now" button alongside "Next". Put one between major parts of a long lesson.
Quitting mid-lesson feels like failure; being told *this is a fine place to stop, your spot is
saved* doesn't.

### `recap` — close a part
```json
{ "kind": "recap", "eyebrow": "Part 1 done", "title": "Bones — the four that matter",
  "points": ["…"] }
```

---

## Question types

Used by both `checkpoint` cards and the `quiz` array. Every question needs `explain` — shown
after answering, and in the answer key. Quiz questions also take `objective`, which must match
one of the lesson's `objectives` **exactly**; that's what drives the coverage table.

```jsonc
// Four options, one right
{ "type": "multiple", "text": "…", "options": ["a","b","c","d"], "answerIndex": 0, "explain": "…" }

// Two options
{ "type": "truefalse", "text": "…", "answer": true, "explain": "…" }

// Free text — matching ignores case, spaces and punctuation
{ "type": "type", "text": "…", "accept": ["tendon", "tendons"], "explain": "…" }

// Sequencing — list in the CORRECT order; the app shuffles and offers ▲▼ buttons
{ "type": "order", "text": "…", "items": ["first","second","third"], "explain": "…" }

// Tap the diagram — answerBone is a key from BONES in skeleton.js
{ "type": "hotspot", "text": "…", "answerBone": "femur", "explain": "…" }
```

---

## Teacher block

```json
"teacher": {
  "summary": "What this week covers and how it's taught.",
  "discussion": ["Prompts to ask out loud."],
  "misconceptions": ["Wrong ideas to watch for, and the correction."],
  "extension": "An activity for whoever finishes early."
}
```

All optional — empty sections are omitted from the printed key.

---

## Formatting

`**bold**` and `*italic*` work in any `text` or point. Everything else is escaped, so content
can never break the page.

## Before you commit

```bash
node tools/check-content.mjs        # limits
node tools/build-preview.mjs <lesson.json> dist/preview.html   # shareable single file
```
