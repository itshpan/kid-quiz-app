# Images

## How images are made now

`content/images.json` holds a prompt, a style and an alt text for every
picture in the app. `node tools/make-images.mjs` turns the ones that do not
exist yet into `assets/img/<id>.jpg` and records provenance in
`assets/img/credits.json`. Re-running it is safe: it skips anything already
generated. `--force <id>` regenerates one.

The OpenAI key is a **network secret on the environment**, injected by the
egress proxy. There is no key in this repo and none in the environment
variables. The tool shells out to `curl` rather than using `fetch`, because
Node ignores `HTTPS_PROXY` and the placeholder header would otherwise reach
OpenAI unreplaced and fail as a 401 that looks like a bad key.

Images are generated at 1536×1024 and downscaled to 720px wide, which is the
width a card actually renders at. The full-size original is discarded.

## The four styles

| Style | For | Looks like |
|---|---|---|
| `photo` | A real thing he should be able to recognise | A clear documentary photograph |
| `render3d` | Something no photograph exists of | A short 3D fact-explainer: one object, plain grey backdrop, matte clay materials, slightly oversized and odd — the look of **Zack D. Films** |
| `meme` | A visual joke, or a scene from fiction | Bold flat illustration, thick outlines, warm palette, exaggerated |
| `diagramish` | When a figure would be overkill | Flat vector, amber and muted blue on warm off-white |

`photo` is the one that matters most and is the reason the pipeline exists.
"GO foods" means nothing until he can recognise a kamote on a table.

## Three rules that are not negotiable

**No text inside any image.** Ever. A label baked into pixels cannot scale
with his text-size setting and cannot be translated. Every prompt says so
explicitly, because the models will add lettering if you let them. The
caption goes on the card.

**Never generate a picture that poses as a documentary photograph of a
specific real place, artwork, artefact or person** — the Angono Petroglyphs,
the *Spoliarium*, Rizal, a named battle. A generated image of a named real
thing is a false claim about the world, and CLAUDE.md says facts must be
true. Generated photographs depict a **type**: a kulintang, a sipa shuttle, a
Spanish colonial church, a padlocked gate. For a specific real artefact use
`tools/fetch-images.mjs`, which pulls the real credited photograph from
Wikimedia.

Fiction is exempt from that rule, which is why Don Quixote gets illustrated
scenes — the windmills, the basin helmet, the books put on trial. Nobody is
being told those are photographs of anything.

**Generated images carry `"credit": "Generated image"` on the card**, so he
is never told a drawing is a photograph.

## Still prefer a figure for a mechanism

A hand-written SVG in `assets/js/figures.js` beats a picture whenever the
subject is a **mechanism**. A diagram can show a brain rotating inside a
skull, stays sharp at any text size, works offline and carries no licensing
risk. The rhythm rule asks for both in every lesson precisely because they do
different jobs: the figure shows how it works, the photograph shows what it
looks like in the world.

---

## Older notes: animation prompts

## Prompts for Week 1

### 1. Seatbelt load path
> A simplified human torso seen from the front, seated, with a three-point seatbelt drawn across
> it. The belt crosses the collarbone and breastbone diagonally, then sits low across the hip
> bones. Highlight the collarbone, ribs and pelvis in amber to show the belt lands on bone. The
> soft abdomen the belt deliberately avoids is left plain. Anatomical but stylised, not medical.
> [+ house style]

### 2. Growth plate
> Cross-section of a child's long bone, cut lengthwise. Show the shaft, and near each end a
> distinct band of cartilage — the growth plate — rendered in muted blue against the amber bone.
> Beside it, the same bone as an adult, with the band gone and the bone continuous. Two panels,
> side by side, same scale. [+ house style]

### 3. Hand wrap mechanics
> A human hand seen from above, bones visible in a stylised x-ray look. Left: bones loose and
> separate. Right: the same hand with a boxing wrap compressing the bones into one solid block.
> Amber for the wrapped, braced bones; muted blue for the loose ones. [+ house style]

### 4. Wolff's Law over time
> Three panels showing the same cross-section of bone at three points in a life. Panel one: a
> child's bone, moderate internal lattice. Panel two: an adult who trained, dense thick lattice.
> Panel three: an adult who didn't, sparse thin lattice with visible gaps. Same circle size and
> framing in all three. [+ house style]

---

## Animation prompt (for Codex)

Paste as-is. It's written against the app's real constraints, so the output drops straight in.

> Build a single self-contained HTML file containing an animated SVG: **a punch travelling up the
> human kinetic chain.**
>
> - Simplified front-facing human skeleton, roughly 200×420 viewBox, transparent background.
> - Bones use `currentColor` so the host page controls the colour. Do not hard-code fills.
> - Animate a pulse travelling in sequence: **floor → foot → tibia → femur → pelvis → spine →
>   shoulder → humerus → forearm → metacarpals**. Each segment lights up amber `#C2761A` as the
>   pulse passes, then fades back over ~400ms.
> - Loop with a ~1s pause between cycles.
> - Controls: play/pause, and a speed slider from 0.25× to 2×.
> - Pure SVG + CSS + vanilla JS. **No libraries, no build step, no network requests.**
> - Honour `prefers-reduced-motion: reduce` by rendering the end state statically, no loop.
> - Expose `window.KineticChain = { play(), pause(), setSpeed(n) }`.
>
> Output one file, no explanation.

Others worth generating the same way:

- **Crumple zone in motion** — a car hitting a wall in cross-section, front deforming while the
  cabin holds shape, with a rib/skull comparison animating alongside.
- **Bone remodelling** — osteoblasts adding material and osteoclasts removing it on a bone
  surface, with a load slider that visibly changes the balance.
- **Peristalsis** — smooth muscle moving food along the gut. Reusable for Week 2 (Digestive).

---

## Dropping the result into a lesson

**A generated image** goes in `assets/img/` and gets an `image` card:

```json
{ "kind": "image",
  "eyebrow": "Where the belt lands",
  "title": "A seatbelt only ever touches bone",
  "src": "assets/img/seatbelt-path.svg",
  "alt": "A seatbelt crossing the collarbone, ribs and hip bones",
  "credit": "Illustration generated for this lesson",
  "text": "Optional caption." }
```

`alt` is required, not optional — write what the image *shows*, not what it's called.

**A hand-written SVG figure** goes in `assets/js/figures.js` as a new entry in `FIGURES`, then:

```json
{ "kind": "figure", "figure": "seatbeltPath", "title": "…", "text": "…" }
```

Give it a `bind(root)` function if it should react to taps or a slider. Two of the existing five
do; they hold attention far longer than the static ones.

---

## Video

Video cards embed via `youtube-nocookie.com`:

```json
{ "kind": "video", "eyebrow": "60 seconds", "title": "See real muscle tissue",
  "youtubeId": "Wbo8x_Gnb4A",
  "text": "…", "credit": "Institute of Human Anatomy · youtube.com" }
```

**Watch anything before you add it.** The embed blocks tracking cookies; it does not vet content,
and YouTube's suggestions at the end of a clip are outside our control.

### Vetted so far

| Video | Length | Channel | Use |
|---|---|---|---|
| `Wbo8x_Gnb4A` — *You Have Different Kinds of Muscle in Your Body* | 0:59 | Institute of Human Anatomy | **In the lesson.** Exactly the three types. |

### Worth your review, not yet added

| Video | Length | Channel | Note |
|---|---|---|---|
| `sxn5kPQ4Gl0` — *Strength vs Hypertrophy* | 17:50 | Institute of Human Anatomy | Too long for the deck. Excellent Part 3 follow-up; timestamps cover all three muscle types in the first 10 min. |
| `ttpaCc22iWc` — *How Strong Are Human Bones?* | 0:28 | Zack D. Films | 87M views and a great hook, but that channel leans dramatic and sometimes gruesome. Watch it first. |
| `WdCRrcfan44` — *Skeleton Bones Song* | 3:24 | Neural Academy | Accurate and thorough, but it's a song. May read as too young. |

**Institute of Human Anatomy is the channel to mine** for this whole term. Real cadaver anatomy,
adult register, never talks down. Most of the alternatives that surface for "skeletal system for
kids" are pitched at six-year-olds and will get switched off within seconds.
