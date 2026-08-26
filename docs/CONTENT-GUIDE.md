# Content guide

How to add a lesson without touching any JavaScript.

## Adding a week

1. Write `content/<subject>/wN-<slug>.json` (schema below).
2. In `content/courses.json`, find that week and set:
   ```json
   { "week": 2, "id": "sci-w2", "title": "...", "topics": ["..."],
     "status": "live", "file": "science/w2-digestive.json" }
   ```
3. That's it. The week unlocks on the subject page and the answer key generates itself.

`status` is one of `"live"`, `"soon"`, or `"exam"`.

## Lesson file schema

```jsonc
{
  "id": "sci-w2",                 // must match the id in courses.json
  "courseId": "science",
  "courseTitle": "Science",       // used for the breadcrumb
  "week": 2,
  "title": "Digestive System",
  "subtitle": "One sentence hook",
  "estMinutes": 25,
  "objectives": ["..."],          // shown to the learner AND used for the
                                  // answer key's coverage table
  "blocks": [ ... ],              // the lesson body, in order — see below
  "quiz": [ ... ],
  "teacher": { ... }
}
```

## Block types

Blocks render in array order. Mix them freely.

### `hook` — opening attention-grabber, gold panel
```json
{ "type": "hook", "title": "...", "body": ["paragraph", "paragraph"] }
```

### `text` — standard explanation card
```json
{ "type": "text", "title": "...", "body": ["..."], "bullets": ["..."] }
```
`bullets` is optional.

### `lens` — the interest-personalisation block
This is the core idea of the whole app: the same curriculum content, retold through something the
learner already cares about.
```json
{
  "type": "lens",
  "interest": "cars",          // free-form label for your own reference
  "icon": "🚗",
  "label": "Car mode",         // small uppercase tag
  "color": "#4ecdc4",          // accent for the left border and bullets
  "title": "...",
  "body": ["..."],
  "bullets": ["..."]
}
```
Suggested palette: cars `#4ecdc4`, boxing `#ff6b9d`, body/growth `#f5c542`,
space `#a855f7`, gaming `#22c55e`.

### `keyterms` — vocabulary the exam will use
```json
{ "type": "keyterms", "title": "Words the test will use",
  "terms": [{ "term": "Femur", "def": "Thigh bone..." }] }
```
These also appear automatically at the bottom of the teacher answer key.

### `dyk` — "did you know" fact cards
```json
{ "type": "dyk", "title": "Did you know",
  "cards": [{ "tag": "Strength", "text": "..." }] }
```

### `video` — YouTube embed
```json
{ "type": "video", "title": "...", "youtubeId": "abc123", "caption": "..." }
```
Set `"youtubeId": null` to show a placeholder slot instead — useful for drafting a lesson before
you've picked the clip. Embeds use `youtube-nocookie.com`.

### `recap` — the pre-quiz summary
```json
{ "type": "recap", "title": "Before the quiz", "bullets": ["..."] }
```

### `skeleton` — the interactive skeleton diagram
```json
{ "type": "skeleton", "title": "Tap any bone", "caption": "..." }
```
Bone data lives in `assets/js/skeleton.js`. This is currently the one bespoke visual; more will be
added as separate modules.

## Text formatting

`**bold**` and `*italic*` work inside any body paragraph or bullet. Everything else is escaped, so
content can't break the page.

## Quiz question types

Every question takes an `explain` string (shown after answering, and in the answer key) and an
optional `objective` that must match one of the lesson's `objectives` exactly — that's what drives
the coverage table in the teacher key.

```jsonc
// Multiple choice
{ "type": "multiple", "text": "...", "options": ["a","b","c","d"],
  "answerIndex": 0, "explain": "...", "objective": "..." }

// True / false
{ "type": "truefalse", "text": "...", "answer": true, "explain": "..." }

// Short answer — matching ignores case, spaces and punctuation
{ "type": "type", "text": "...", "accept": ["osteoblast", "osteoblasts"], "explain": "..." }

// Sequencing — list items in the CORRECT order; the app shuffles them
{ "type": "order", "text": "...", "items": ["first","second","third"], "explain": "..." }

// Diagram hotspot — answerBone must be a key from skeleton.js BONES
{ "type": "hotspot", "text": "...", "answerBone": "femur", "explain": "..." }
```

## Teacher block

```json
"teacher": {
  "summary": "What this week covers and how it's taught.",
  "discussion": ["Prompts to ask out loud."],
  "misconceptions": ["Wrong ideas to watch for and the correction."],
  "extension": "An optional activity for learners who finish early."
}
```

All of it is optional — sections with no content are simply omitted from the printed key.

## Writing style that works for this learner

Based on what's landed so far:

- **Lead with the interest, not the curriculum.** "Every car you like has a skeleton too" beats
  "Today we will learn about bones."
- **Give the mechanism, not just the fact.** *Why* the clavicle breaks first is more memorable
  than *that* it breaks first.
- **One dry joke per section is plenty.** "A puddle with opinions" works; a joke in every bullet
  gets skimmed.
- **Connect to a decision he controls.** The bone-density window lands because it changes what
  he does at training this week.
- **Never talk down.** Real terminology, real numbers, explained properly.
