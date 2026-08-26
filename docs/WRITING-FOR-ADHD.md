# Writing and design rules

The reader is a Grade 6 student with ADHD. He is bright and curious. He is not a weak reader.
What he struggles with is **staying in a text long enough to finish it**.

So every rule here targets one of three failure modes:

1. **The wall.** A screen of dense text reads as "this will take forever" and he quits before line one.
2. **The drift.** He reads four lines, loses the thread, and has to restart — or doesn't.
3. **The shame spiral.** Getting things wrong feels bad, he disengages, and the session is over.

These are the rules. They are enforceable, so enforce them.

---

## Hard limits

| Rule | Limit | Why |
|---|---|---|
| Sentence length | **20 words max**, aim 8–14 | Long sentences hold too much in working memory |
| Card body | **40 words max** | One idea, one screen, no scrolling inside a card |
| Points per card | **4 max**, 3 is better | Beyond four, list items stop being read |
| Words per point | **18 max** | A point is one thought, not a paragraph |
| Line length | **58 characters** (set in CSS) | Long lines cause line-tracking errors |
| Cards between checkpoints | **6 max** | Passive reading beyond this stops being reading |
| Videos per lesson | **3 max** | It's a lesson, not a playlist |
| High-stimulation videos | **1 max** | See below |

Every limit in this table is enforced by the checker. Run it before committing content:

```bash
node tools/check-content.mjs
```

It exits non-zero on any violation, so it can go in CI later.

---

## The stimulation budget

Fast-cut, dramatic, shock-framed video is genuinely engaging. That's the problem.

High-arousal content doesn't just hold attention — it **raises the floor**. Everything calmer that
follows reads as boring by comparison, and the comedown lands hardest on the reader who was
already struggling to stay in the text. One of those videos in a lesson is a gift. Three is a
lesson he can no longer sit through.

So every `video` card declares a `register`:

- **`"high"`** — fast cuts, dramatic music, shock or gross-out framing. Zack D. Films and that
  whole genre. **One per lesson, maximum.**
- **`"calm"`** — plain narration, steady pacing, real footage or clean animation. Institute of
  Human Anatomy, and most straightforward explainers.

Two more rules, both enforced by the checker:

1. **Never put new material straight after a high-stimulation video.** The next card must be a
   checkpoint, fact, break, recap or terms card. Attention is at its worst in the moments after
   a spike, and that is the wrong time to introduce a concept.
2. **Pair it with the calm version of the same idea.** In Week 1 the loud "how strong are your
   bones" short lands immediately before the quiet power-to-weight fact card. Same claim, two
   registers — the calm one is where it actually gets encoded.

He likes the loud ones. That's a reason to use them deliberately, not a reason to use them a lot.

---

## Structure

**One card, one idea.** If a card needs the word "also", it's two cards.

**Front-load the payload.** The first six words carry the point. He may not read the rest.

> ✅ "Your clavicle is designed to break."
> ❌ "One interesting thing about the clavicle, which is also called the collarbone, is that it is designed to break."

**Bold the anchor.** Start each point with 2–4 bolded words that carry the idea. He can re-find his
place by scanning bold text, which is what he will actually do after drifting.

**Never write a paragraph where a list works.** But never write a list of one-word fragments
either — each point should be a complete thought he can hold on its own.

**Checkpoints every 4–6 cards.** A one-question retrieval check, not graded, no penalty. This is
the single highest-value structural rule in this document. Reading without retrieval is a trance;
retrieval is what converts attention into memory. It also gives him a natural stopping point that
isn't "give up".

**End every section with the concrete payoff.** Abstract closes lose him. "That's why your coach
says stay loose" beats "and this demonstrates the principle of antagonistic muscle action".

---

## Voice

**Talk to him, not about the topic.** Second person. "Your femur", not "the human femur".

**Give the mechanism, not the label.** He remembers *why* the clavicle breaks first. He forgets
*that* it's called the clavicle. Teach the first and the second comes free.

**Never talk down.** Real terminology, real numbers, explained properly. Simplify the sentence,
not the idea. He has been condescended to by educational software before and he can smell it.

**One dry joke per section, maximum.** He likes wordplay and absurdity. A joke every card reads
as trying too hard and he starts skimming for jokes instead of content.

**Connect to a decision he controls.** The bone-density window lands because it changes what he
does at training this week. Facts he can act on outrank facts he can only know.

**Cut every hedge.** "It could be argued that bones are somewhat like a frame" → "Bones are a frame."
Hedging adds words and subtracts confidence.

---

## Copy patterns

| Instead of | Write |
|---|---|
| "Incorrect" / "Wrong" / ❌ | "Not yet — here's the thing" |
| "You failed to..." | "The answer is X. Here's why." |
| "Let's learn about the skeletal system" | "Every car you like has a skeleton too" |
| "It is important to note that..." | *(delete — just say the thing)* |
| "Continue" | "Next" |
| "Submit" | "Check my answer" |
| "Quiz" | "Checkpoint" *(mid-lesson)* / "Quiz" *(end, when it's real)* |

**Wrong answers are never red.** Red means danger and failure, and he sees enough of it. The app
uses a calm blue for "not yet" and green for "got it". A wrong answer is a fact he doesn't have
yet, and the feedback's job is to hand him that fact, not to grade him.

---

## Design rules

**One idea on screen.** The lesson is a card deck, not a page. He taps through. He always knows
how many cards are left, and the number is small enough to feel finishable.

**No ambient motion.** The old build had a background gradient animating on a 20-second loop.
For a reader fighting for focus that's a permanent, low-grade attention tax. Transitions only
happen in response to something he did, and they last under 250ms.

**Colour carries meaning or it doesn't appear.** One accent for actions and progress. Green for
correct, blue for not-yet. A colour bar per interest lens so he can *feel* the shift into "the
car bit" without reading a word. Nothing else is coloured.

**Never pure black or pure white.** Pure white glares. Pure black haloes light text and measurably
slows reading, especially with astigmatism. The palette is soft charcoal and warm off-white.

**He controls the reading environment.** Text size and light/dark are one tap away in the header
and persist. What's comfortable varies enormously between people, and between days for the same
person. Don't guess on his behalf — let him set it.

**Touch targets are 48px minimum.** Buttons are big and unmissable. Thin diagram parts get
invisible padded hit areas so a near-miss tap still works.

---

## Fonts

Body text is **Atkinson Hyperlegible**, designed by the Braille Institute to make similar
characters visually distinct — `I`/`l`/`1`, `O`/`0`, `rn`/`m`. That character ambiguity is a
common source of the micro-stumbles that break reading flow. Headings and UI are DM Sans.

---

## The test

Before you ship a lesson, read it as him:

- Can he tell how long this will take, within five seconds of opening it?
- Is there any screen he could look at and think "nope"?
- Does every card give him one thing, and is that thing findable in bold?
- If he drifts on card 7, can he re-enter on card 8 without re-reading?
- When he gets one wrong, does the app make him feel stupid or curious?

If any answer is bad, fix the content — not the kid.
