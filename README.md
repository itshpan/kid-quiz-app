# Learning Lab

An interactive lesson-and-quiz site built around **Grade 6, Term 1 (2026–2027)** — the actual
weekly scope from school. Each lesson teaches the curriculum topic through the things the learner
is already interested in (cars, boxing, gaming, training), then tests retention with a
multi-format quiz.

**It is designed for a reader with ADHD.** That is not a coat of paint — it determines the shape
of the whole thing:

- A lesson is a **deck of cards**, not a page. One idea on screen, tap to advance.
- **Checkpoints every 4–6 cards** — quick retrieval, unscored, never blocking.
- Hard limits on sentence, card and point length, **enforced by a checker**, not by good intentions.
- Reading measure held near **58 characters**; text size and theme are the reader's to set.
- **No ambient motion**, no pure black, no pure white, and **wrong answers are never red**.
- The lesson **remembers where he stopped**, and offers real places to stop.

The reasoning is in [`docs/WRITING-FOR-ADHD.md`](docs/WRITING-FOR-ADHD.md). Read it before writing
any content.

Teachers get a printable answer key for every lesson, including the checkpoints.

## Run it

It's a static site with **no build step and no dependencies**. It does need to be *served* over
http rather than opened as a file, because lessons load as JSON.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pick this repo and the branch you want to publish
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **`/`**
4. **Save and Deploy**

There is nothing to compile, so the first deploy takes well under a minute. Every push to the
connected branch redeploys automatically.

To put it behind a login later, use **Cloudflare Access** on the Pages project — it adds auth
without touching any application code.

## How it's put together

```
index.html          Subject catalogue
course.html         One subject, all 11 weeks of the term
lesson.html         Lesson player + quiz
teacher.html        Printable answer key and teaching notes
practice/           The original surface-area quiz app, preserved as-is

assets/css/app.css  Whole design system
assets/js/
  store.js          Profiles + progress (localStorage today, swappable later)
  reading.js        Text size + theme controls
  ui.js             Header, profile picker, JSON loading, text helpers
  catalog.js        index.html controller
  course.js         course.html controller
  lesson.js         lesson.html controller
  deck.js           The card player — one card kind, one function
  question.js       Renders ONE question of any type
  quiz.js           Sequences questions and scores them
  teacher.js        teacher.html controller
  teacher-view.js   Answer-key renderer (shared with the preview build)
  skeleton.js       Interactive skeleton diagram + bone facts

content/
  courses.json      Every subject and all 11 weeks of Term 1
  science/
    w1-skeleton.json   Week 1 — Skeletal & Muscular Systems
```

**Content is data, not code.** Lessons are JSON files. Adding a week means writing one JSON file
and flipping its `status` to `"live"` in `courses.json` — no JavaScript changes. That's deliberate:
it means the renderer can be rewritten (React, or anything else) later without rewriting a single
lesson.

See [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) for the full schema.

## Tools

```bash
node tools/check-content.mjs     # enforce the ADHD writing limits; exits non-zero on failure
node tools/build-preview.mjs content/science/w1-skeleton.json dist/preview.html
```

`build-preview` flattens one lesson into a single self-contained HTML file, so a lesson can be
shared before the site is deployed anywhere.

## What's built

| Subject | Weeks mapped | Lessons live |
|---|---|---|
| Science | 11 | Week 1 — 55 cards, 11 checkpoints, 19 quiz items |
| Math | 11 | Surface-area trainer (bonus) |
| English | 11 | — |
| Social Studies | 11 | — |
| Filipino | 11 | — |
| MAPEH | 11 | — |
| TLE | 11 | — |
| Devotion | 11 | — |

Every subject shows its real weekly scope; weeks that aren't written yet show as *Coming soon*.

## Question types

| Type | What it does |
|---|---|
| `multiple` | Options, one correct |
| `truefalse` | Two options |
| `type` | Free-text entry, matched against a list of accepted answers |
| `order` | Put steps into the correct sequence (▲▼ buttons — works on touch) |
| `hotspot` | Tap the right bone on the interactive diagram |

The same renderer powers mid-lesson checkpoints and the end-of-lesson quiz, so both behave
identically.

## Card kinds

`open` · `idea` · `lens` · `story` · `fact` · `diagram` · `terms` · `checkpoint` · `break` · `recap`

Each is one function in `deck.js`. Adding a kind means adding an entry there and a style rule.

## Progress

Each learner has their own profile and progress, stored in the browser. Finishing a quiz awards
XP (25 per correct answer) and advances a six-level track from *Curious Rookie* to *Lab Legend*.
Daily streaks are tracked.

All of this goes through `assets/js/store.js`. Nothing else in the app touches `localStorage`,
so moving to Cloudflare D1 or KV later means rewriting one file.
