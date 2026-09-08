# Learning Lab — working rules

Read this before writing any lesson, figure or copy. It is loaded automatically
every session, so none of it depends on anyone remembering to mention it.

## What this is

An interactive lesson site for one Grade 6 student, following his school's real
Term 1 weekly scope (2026–2027). Eight subjects, eleven weeks. Lessons are JSON;
the renderer is vanilla ES modules; it deploys to Cloudflare Pages.

Live: https://learning-lab-8qx.pages.dev

## Two constraints that shape everything

**1. The reader has ADHD.** He is bright and not a weak reader. What he
struggles with is staying in a text long enough to finish it. Every rule in
[`docs/WRITING-FOR-ADHD.md`](docs/WRITING-FOR-ADHD.md) exists for that, and
`tools/check-content.mjs` enforces the measurable ones. Read that document
before writing content.

**2. Everything is taught through his interests.** Not as decoration — as the
actual explanation. [`content/interests.json`](content/interests.json) is the
canonical roster: cars and trains, boxing and training, gaming (Cyberpunk,
Death Stranding, Pacific Drive, Minecraft, Forza), his own physical
development, space, and story writing. It carries concrete hooks for each so
you never have to invent one.

**Every lesson must use at least three different lenses.** The checker fails a
build that doesn't. Do not ask whether to include his interests — include them.

## Before you commit

```bash
node tools/check-content.mjs     # writing limits + lens coverage. Must pass.
npm run deploy                   # ships to Cloudflare Pages
```

The checker is not advisory. It has caught real problems on almost every
content change in this repo — spacing drift, over-long sentences, two
near-identical checkpoints two cards apart, a high-stimulation video placed
immediately before new material. If it complains, it is right.

## The content model

A lesson is a **deck of cards**, not a page. One idea per card, tap to advance.
Card kinds, question types and the full schema are in
[`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md).

Adding a week is one JSON file plus a `status` flip in `content/courses.json`.
No JavaScript changes. That separation is deliberate: the renderer can be
rewritten later without touching a single lesson.

## Non-negotiables

- **Wrong answers are never red and never say "wrong."** Calm blue, "not yet",
  and hand over the missing fact.
- **No ambient motion.** Transitions only in response to something he did.
- **Never pure black or pure white.** Pure black haloes light text.
- **Facts must be true.** Never invent a detail about a game, a sport or an
  athlete to make a hook land. Find a different hook.
- **Never talk down.** Real terminology, real numbers, explained properly.
  Simplify the sentence, not the idea.

## Visuals

Prefer a hand-written SVG figure in `assets/js/figures.js` over a photograph
when the subject is a mechanism — a diagram can show a brain rotating inside a
skull; a photo cannot. Use `tools/fetch-images.mjs` for real photographs, which
downloads from Wikimedia into `assets/img/` rather than hotlinking. Prompts and
house style for generated images are in
[`docs/IMAGE-PROMPTS.md`](docs/IMAGE-PROMPTS.md).

Tappable anatomy diagrams reuse one shared explorer component. Add a new body
system by adding artwork and part data to `EXPLORER_DATA`, not by writing a new
interaction.

## Progress and accounts

`assets/js/store.js` is the only module that touches storage. Local storage is
the working copy; Cloudflare D1 is a sync layer. Class codes, no passwords, no
email addresses — see the schema comments in `db/schema.sql` for the access
model and its deliberate limits.
