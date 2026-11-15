# Learning Lab — working rules

Read this before writing any lesson, figure or copy. It is loaded automatically
every session, so none of it depends on anyone remembering to mention it.

## What this is

An interactive lesson site for one Grade 6 student, following his school's real
weekly scope (2026–2027). Eight subjects, eleven weeks per term. Lessons are
JSON; the renderer is vanilla ES modules; it deploys to Cloudflare Pages.

## Where the scope comes from

Google Drive, `C_Grade 6_Weekly Scope_2026-2027`, owned by the school
(`corehomeschoolers.curriculum@gmail.com`):

- `A_Term 1_Grade 6_Weekly Scope_2026-2027.docx.pdf`
- `B_Term 2_Grade 6_Weekly Scope_2026-2027.docx.pdf`
- the matching `Semestral Scope` PDFs, one per term

**Read both the weekly and the semestral scope.** The weekly one is a table,
and converting it to PDF collapsed the columns, so adjacent subjects run into
each other — Term 2 week 2 reads as if Devotion were "Gratitude Everyday
Traditions" when the real split is MAPEH "Indigenous Music Traditions" and
Devotion "Gratitude Everyday". The semestral scope lists each subject's topics
in one clean column, so it settles every one of those. Never guess the split;
cross-check it.

This is the only source. Never invent a topic or a week: a plausible-looking
curriculum that is not his teaches the wrong thing at the wrong time.

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

**The lens cards are not enough.** The checker counts lens cards; it cannot see
the worked examples, and that is where this has gone wrong before. Whenever an
example is *freely chosen* — a sentence to parse, a word problem, a noun to
classify — it comes from his world: the boxer wrapping his hands, the car in
the pit, the lap time, the inventory. "Ang bata ay naglalaro sa parke" and "a
plank is cut into 0.4 m pieces" are the failure. Where the example is fixed by
the subject — a Bible passage, the Treaty of Paris, the plural of *roof* — the
lens cards carry the interest instead, and that is correct.

## The rhythm rule

**A lesson is never allowed to become a wall of text, and the checker enforces
it.** He is bright and not a weak reader; what he cannot do is stay in prose
long enough to finish it. So prose is capped twice over, because either cap
alone has a hole in it — three short cards in a row are fine, three dense ones
are not:

| Limit | Value |
|---|---|
| Text-only cards in a row | **3** |
| Words of prose with nothing to look at | **130** |
| Cards between checkpoints | **5** |
| Interactive figures per lesson | **at least 1** |
| Image cards per lesson | **at least 1** |

Anything that is not `open`, `idea`, `lens`, `terms`, `recap`, `story`, `fact`
or `break` resets the run — a checkpoint counts, because answering something
is not reading. A `terms` card counts toward the card run but not toward the
word budget: a glossary is scanned for the one word you wanted, which is the
same reason it is already exempt from checkpoint spacing.

**The two floors matter as much as the caps.** A lesson cannot pass by being
all diagram or all photograph, because they do different jobs: a figure shows
a *mechanism* he can poke, and a photograph shows him what the thing actually
looks like in the world. "GO foods" means nothing until he can recognise a
kamote on a table.

## Pictures

`node tools/make-images.mjs` generates the images in
[`content/images.json`](content/images.json) and writes provenance into
`assets/img/credits.json`. The OpenAI key is a **network secret on the
environment**, injected by the egress proxy — there is no key in this repo,
and `fetch` will not work for this because Node ignores `HTTPS_PROXY`. The
tool shells out to `curl` for exactly that reason.

Four styles: `photo` (a real thing he should be able to recognise — the one
that matters most), `render3d` (the short-3D-explainer look, for what no
photograph exists of), `meme` (a textless visual joke), `diagramish` (flat
vector). **No text inside any image**, ever — a label baked into pixels cannot
scale with his text-size setting and cannot be translated. The caption goes on
the card.

**Never generate a picture that poses as a documentary photograph of a
specific real place, artwork, artefact or person** — the Angono Petroglyphs,
the *Spoliarium*, Rizal. A generated image of a named real thing is a false
claim about the world, and the rule below says facts must be true. Generated
photographs depict a *type* — kamote, a kulintang, a sipa shuttle — never a
named original. For a specific real artefact, use `tools/fetch-images.mjs` to
pull the real, credited photograph from Wikimedia.

Generated images carry `"credit": "Generated image"` on the card, so he is
never told a drawing is a photograph.

Still prefer a hand-written SVG figure in `assets/js/figures.js` when the
subject is a **mechanism** — a diagram can show a brain rotating inside a
skull, and it stays sharp, works offline and carries no licensing risk.

## Before you commit

```bash
node tools/check-content.mjs     # writing limits, rhythm rule, lens coverage
node tools/check-figures.mjs     # measures every figure caption in a real
                                 # browser. SVG text does not wrap and does
                                 # not warn — it just gets clipped by the card.
node tools/check-lessons.mjs     # opens every lesson, reads the deck, sits
                                 # the quiz. ~12 min for all 176.
npm run deploy                   # ships to Cloudflare Pages
```

The checkers are not advisory. They have caught real problems on almost every
content change in this repo — spacing drift, over-long sentences, two
near-identical checkpoints two cards apart, a high-stimulation video placed
immediately before new material. If one complains, it is right.

The three look at different things and none of them replaces another.
`check-content` reads the JSON. `check-figures` measures the rendered SVG.
`check-lessons` is the only one that actually *opens* a lesson, which is why
it is the one that catches a card whose shape throws and renders the whole
lesson blank, two cards emitting the same element id, or a deck and its data
drifting apart.

**What `check-lessons` cannot do:** it answers from the same JSON the app
scores against, so an answer key that is wrong but internally consistent
scores 100% and passes. Flipping an `answerIndex` is invisible to it. Only a
person reading the questions catches that.

## The content model

A lesson is a **deck of cards**, not a page. One idea per card, tap to advance.
Card kinds, question types and the full schema are in
[`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md).

Adding a week is one JSON file plus a `status` flip in `content/courses.json`.
No JavaScript changes. That separation is deliberate: the renderer can be
rewritten later without touching a single lesson.

## Voice

The house writing rules apply: straight to the point, fun, willing to joke. Two
of them are enforced by `check-content.mjs` so they cannot drift back:

- **No em or en dashes.** A colon, a full stop or a comma is doing the job more
  clearly, and clarity wins for a reader who loses the thread easily.
- **No buzzwords** from the house list. Every word on that list has a literal
  sense that is fine here: `leverage` is mechanical advantage in a rudder and
  in a punch, the Katipunan really was a revolutionary society, a game reward
  really does unlock. Those uses are allowlisted by file, with the reason, in
  the checker. A *new* buzzword use is a failure.

**The explaining voice sits at a Grade 5 to 6 reading level.** Introduce hard
words freely: `sovereignty`, `distillation`, `membranophone` and `ilustrados`
are the lesson, and "Never talk down" below still holds. The level applies to
the sentence doing the explaining, never to the idea it carries. So a fancy
word standing where a plain one loses nothing is a fault, and
`check-content.mjs` fails the build on a list of them.

It is **not** a readability score, and that was measured rather than assumed.
Flesch-Kincaid across all 2,354 prose cards is the wrong instrument twice over:
the Filipino decks rate grade 10.7 while averaging 2.3 words per sentence,
because Tagalog is agglutinative and those cards are word lists; and English
already sits at a median of grade 4.2, with the high tail carried by subject
terms and proper nouns. "Executed in 1872. Rizal dedicated El Filibusterismo to
them." scores grade 15 and is exactly right. Words with no plain equivalent are
kept out of the list on purpose: `require`, `remainder`, `magnitude`,
`demonstrate` and `observe` were each considered and rejected, because
"Courage requires fear" and "2 remainder 1" are correct, clear, and would only
get worse if simplified.

**Headlines on teaching cards are functional, not witty.** The card title says
what is being taught. The instruction to tap or press belongs in the card text
and in the figure's own label, where it already is. A figure card titled "Six
buttons" tells him nothing at the exact moment he needs orienting; "Six periods,
and the question each one was asking" tells him what he is about to learn. Save
the wordplay for `lens`, `recap`, `break`, `story` and `fact` cards, and for the
week 11 review lessons, where it is doing a different job.

**One deliberate divergence from the house rules: antithesis is allowed here.**
The rule against "X, not Y" exists because it usually spends half a sentence on
something untrue so the true half sounds earned. In a lesson the rejected half
is not a rhetorical prop, it is the wrong model he actually arrived with, and
naming it before correcting it is the teaching:

> Clutter is not mess. It is postponed decisions.
> Blood is not one substance. It is cells and fragments in a straw-coloured liquid.
> Gravity is not a property of Earth. It is a property of mass.

Deleting the first half of those leaves a true sentence that corrects nothing.
Keep them. This is not licence for the construction as decoration: if no
misconception is being corrected, cut the rejected half.

## Non-negotiables

- **Wrong answers are never red and never say "wrong."** Calm blue, "not yet",
  and hand over the missing fact.
- **No ambient motion.** Transitions only in response to something he did.
  *One exception, deliberate:* the per-question clock ticks, and the deck shows
  a minute counter. Time blindness is a real ADHD deficit and time you cannot
  see is time you cannot judge — so this is the lesson, not decoration. It is
  kept as quiet as a live number can be: counts up rather than down by default,
  so there is no cliff; no animation on the digits; colour only at a threshold;
  never red. A parent can change it in `settings.html`; the learner cannot.
  Do not "fix" this back to a static chip.
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
