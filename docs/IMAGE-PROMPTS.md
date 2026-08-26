# Image and animation prompts

Ready-to-paste prompts for generating visuals elsewhere (Codex, an image model, whatever you're
using) and dropping the results back into a lesson.

## Before you generate anything

The app already has **five hand-drawn SVG figures** built in — `crumpleZone`, `muscleTypes`,
`armPair`, `boneDensity`, `kineticChain` (see `assets/js/figures.js`). Those inherit the theme,
stay sharp at any text size, work offline, and carry no licensing risk. **Prefer a new SVG figure
over a generated image** wherever the subject is diagrammatic.

Generate images when you want something a diagram can't do: atmosphere, a photographic subject,
a character, a scene.

---

## House style (paste this into every image prompt)

> Style: clean flat vector illustration, minimal, generous negative space. Limited palette: warm
> amber `#C2761A` for anything rigid or emphasised, muted blue `#4A6FA5` for anything that
> deforms or is secondary, warm off-white `#FBF8F3` background, dark charcoal `#23222A` for line
> work. No gradients, no drop shadows, no photorealism, no text or labels in the image. Flat
> colour blocks with confident linework. Reads clearly at 700px wide on a phone.

Two rules that matter more than they sound:

- **No text in the image.** Any label needs to scale with his text-size setting and stay
  translatable. Labels go in the card's `points`, not baked into the pixels.
- **Transparent or `#FBF8F3` background.** A white-boxed image looks broken in dark mode.

---

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
