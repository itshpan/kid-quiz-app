/* Captions live inside a 400-unit viewBox, so a long one used to run off the
   right-hand edge and get clipped by the card with no warning. This squeezes
   anything over the limit instead. Content should still fit on its own —
   tools/check-figures.mjs measures every caption in every state — but a
   silent clip is the one failure mode worth engineering out. */
const CAP_MAX = 374;

function fitText(el) {
    if (!el || !el.getComputedTextLength) return;
    el.removeAttribute('textLength');
    el.removeAttribute('lengthAdjust');
    const len = el.getComputedTextLength();
    if (len > CAP_MAX) {
        el.setAttribute('textLength', CAP_MAX);
        el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
}

/* ==========================================================================
   figures.js — hand-drawn SVG diagrams for lesson cards.

   Why SVG rather than images: they inherit the theme tokens, stay sharp at
   any size and text scale, work offline, add no page weight, and carry no
   licensing baggage. Two of them are interactive, because a diagram he can
   poke at holds attention far longer than one he looks at.

   Each figure exports { svg, bind? }. `bind` wires interactivity after mount.
   ========================================================================== */

const NS = 'http://www.w3.org/2000/svg';

/* ---------- 1. Crumple zone vs safety cell ---------- */
/* The signature analogy of the whole lesson, drawn once. */
function crumpleZone() {
    return {
        svg: `
<svg viewBox="0 0 460 250" role="img" aria-labelledby="czT">
  <title id="czT">A car's crumple zone next to the human ribcage and skull, showing the same design idea</title>

  <text class="fig-label" x="10" y="18">THE CAR</text>
  <!-- rigid passenger cell -->
  <rect class="fig-rigid" x="150" y="46" width="120" height="56" rx="6"/>
  <path class="fig-rigid" d="M162 46 L182 24 L242 24 L262 46 Z"/>
  <!-- crumple zone: concertina lines that visibly compress -->
  <g class="fig-soft">
    <path d="M276 54 v40 M290 50 v48 M304 52 v44 M318 56 v36 M332 60 v28"/>
  </g>
  <path class="fig-soft-fill" d="M270 48 Q345 48 350 76 Q345 100 270 100 Z"/>
  <path class="fig-soft" d="M60 52 Q118 50 150 50 M60 96 Q118 98 150 98"/>
  <circle class="fig-wheel" cx="120" cy="104" r="15"/>
  <circle class="fig-wheel" cx="300" cy="104" r="15"/>
  <text class="fig-note fig-note-soft" x="352" y="80">crumples</text>
  <text class="fig-note fig-note-rigid" x="210" y="78" text-anchor="middle">stays rigid</text>

  <line class="fig-rule" x1="10" y1="136" x2="450" y2="136"/>

  <text class="fig-label" x="10" y="162">YOU</text>
  <!-- skull: rigid -->
  <ellipse class="fig-rigid" cx="118" cy="200" rx="34" ry="30"/>
  <text class="fig-note fig-note-rigid" x="118" y="243" text-anchor="middle">skull — stays rigid</text>
  <!-- ribs: flex -->
  <g class="fig-soft">
    <path d="M258 172 Q300 178 306 194 M258 186 Q306 192 310 208 M258 200 Q302 206 304 220 M258 214 Q292 220 292 232"/>
    <path d="M258 172 Q216 178 210 194 M258 186 Q210 192 206 208 M258 200 Q214 206 212 220 M258 214 Q224 220 224 232"/>
  </g>
  <rect class="fig-rigid" x="253" y="168" width="10" height="62" rx="4"/>
  <text class="fig-note fig-note-soft" x="258" y="245" text-anchor="middle">ribs — flex and absorb</text>
</svg>`
    };
}

/* ---------- 2. The three muscle types ---------- */
/* Straight exam content: structure, control and location side by side. */
function muscleTypes() {
    const stripes = (x, y, w, h, gap) => {
        let out = '';
        for (let i = x + gap; i < x + w; i += gap) out += `<line x1="${i}" y1="${y}" x2="${i}" y2="${y + h}"/>`;
        return out;
    };

    return {
        svg: `
<svg viewBox="0 0 460 210" role="img" aria-labelledby="mtT">
  <title id="mtT">Skeletal, smooth and cardiac muscle tissue compared</title>

  <!-- SKELETAL: long parallel fibres, regular stripes -->
  <text class="fig-label" x="8" y="16">SKELETAL</text>
  <g class="fig-tissue">
    <rect x="8" y="26" width="132" height="18" rx="4"/>
    <rect x="8" y="50" width="132" height="18" rx="4"/>
    <rect x="8" y="74" width="132" height="18" rx="4"/>
  </g>
  <g class="fig-stripe">${stripes(8, 26, 132, 66, 9)}</g>
  <g class="fig-nuc"><circle cx="30" cy="30" r="3"/><circle cx="78" cy="30" r="3"/><circle cx="52" cy="54" r="3"/><circle cx="104" cy="78" r="3"/></g>
  <text class="fig-note" x="8" y="112">Striped · voluntary</text>
  <text class="fig-note" x="8" y="128">On your bones</text>
  <text class="fig-note fig-note-key" x="8" y="146">It gets tired</text>

  <!-- SMOOTH: spindle cells, no stripes -->
  <text class="fig-label" x="164" y="16">SMOOTH</text>
  <g class="fig-tissue">
    <path d="M164 34 Q198 22 232 34 Q198 46 164 34 Z"/>
    <path d="M172 58 Q206 46 240 58 Q206 70 172 58 Z"/>
    <path d="M164 82 Q198 70 232 82 Q198 94 164 82 Z"/>
    <path d="M176 34 Q210 22 244 34" fill="none"/>
  </g>
  <g class="fig-nuc"><circle cx="198" cy="34" r="3"/><circle cx="206" cy="58" r="3"/><circle cx="198" cy="82" r="3"/></g>
  <text class="fig-note" x="164" y="112">No stripes · involuntary</text>
  <text class="fig-note" x="164" y="128">Stomach, gut, vessels</text>
  <text class="fig-note fig-note-key" x="164" y="146">Runs without you</text>

  <!-- CARDIAC: branching, striped, intercalated discs -->
  <text class="fig-label" x="320" y="16">CARDIAC</text>
  <g class="fig-tissue">
    <path d="M320 26 h60 v18 h-60 Z"/>
    <path d="M386 26 h60 v18 h-60 Z"/>
    <path d="M320 50 h44 v18 h-44 Z"/>
    <path d="M370 50 h76 v18 h-76 Z"/>
    <path d="M320 74 h72 v18 h-72 Z"/>
    <path d="M398 74 h48 v18 h-48 Z"/>
    <path d="M364 44 h12 v8 h-12 Z"/>
    <path d="M392 68 h10 v8 h-10 Z"/>
  </g>
  <g class="fig-stripe">${stripes(320, 26, 126, 66, 9)}</g>
  <g class="fig-disc"><line x1="382" y1="24" x2="382" y2="46"/><line x1="366" y1="48" x2="366" y2="70"/><line x1="394" y1="72" x2="394" y2="94"/></g>
  <g class="fig-nuc"><circle cx="348" cy="34" r="3"/><circle cx="416" cy="34" r="3"/><circle cx="340" cy="58" r="3"/><circle cx="356" cy="82" r="3"/></g>
  <text class="fig-note" x="320" y="112">Striped · involuntary</text>
  <text class="fig-note" x="452" y="128" text-anchor="end">Heart only · it branches</text>
  <text class="fig-note fig-note-key" x="320" y="146">Never tires</text>
</svg>`
    };
}

/* ---------- 3. Antagonistic pair (interactive) ---------- */
/* Tap to flex. Shows which muscle is pulling — the point being that the
   other one cannot push, it can only pull the other way. */
function armPair() {
    return {
        svg: `
<svg viewBox="0 0 400 230" role="img" aria-labelledby="apT">
  <title id="apT">A bent and a straight arm, showing biceps and triceps taking turns to pull</title>
  <g id="apArm">
    <!-- humerus, fixed -->
    <rect class="fig-bone" x="70" y="40" width="16" height="96" rx="8"/>
    <!-- forearm, rotates about the elbow -->
    <g id="apForearm" style="transform-origin:78px 136px;">
      <rect class="fig-bone" x="70" y="132" width="15" height="86" rx="7"/>
      <rect class="fig-bone" x="88" y="132" width="15" height="86" rx="7"/>
      <rect class="fig-bone" x="70" y="212" width="33" height="16" rx="7"/>
    </g>
    <circle class="fig-joint" cx="78" cy="136" r="8"/>
    <circle class="fig-joint" cx="78" cy="42" r="9"/>

    <!-- biceps (front) and triceps (back) -->
    <path id="apBiceps"  class="fig-muscle" d="M62 54 Q40 92 62 130 Q74 92 62 54 Z"/>
    <path id="apTriceps" class="fig-muscle" d="M94 54 Q116 92 94 130 Q82 92 94 54 Z"/>
  </g>

  <text class="fig-label" x="180" y="34">WHAT'S PULLING</text>
  <g id="apLegend">
    <rect class="fig-chip" x="180" y="46" width="200" height="46" rx="10"/>
    <text class="fig-chip-t" x="194" y="68">Biceps</text>
    <text class="fig-chip-s" id="apBicepsState" x="194" y="84">pulling</text>

    <rect class="fig-chip" x="180" y="102" width="200" height="46" rx="10"/>
    <text class="fig-chip-t" x="194" y="124">Triceps</text>
    <text class="fig-chip-s" id="apTricepsState" x="194" y="140">relaxed</text>
  </g>
  <text class="fig-note fig-note-key" x="180" y="176">Neither one can push.</text>
  <text class="fig-note" x="180" y="194">They take turns pulling.</text>
</svg>`,

        bind(root) {
            const forearm = root.querySelector('#apForearm');
            const biceps = root.querySelector('#apBiceps');
            const triceps = root.querySelector('#apTriceps');
            const bState = root.querySelector('#apBicepsState');
            const tState = root.querySelector('#apTricepsState');

            const btn = document.createElement('button');
            btn.className = 'btn sm fig-action';
            let bent = true;

            const apply = () => {
                forearm.style.transform = bent ? 'rotate(-118deg)' : 'rotate(0deg)';
                biceps.classList.toggle('pulling', bent);
                triceps.classList.toggle('pulling', !bent);
                bState.textContent = bent ? 'pulling — arm bends' : 'relaxed';
                tState.textContent = bent ? 'relaxed' : 'pulling — arm straightens';
                btn.textContent = bent ? 'Straighten the arm' : 'Bend the arm';
            };
            btn.addEventListener('click', () => { bent = !bent; apply(); });
            apply();
            root.appendChild(btn);
        }
    };
}

/* ---------- 4. Bone density (interactive) ---------- */
/* The argument of Part 3 in one control: drag the load, watch the lattice
   thicken or thin out. This is Wolff's Law made touchable. */
function boneDensity() {
    // A fixed lattice so the figure is identical on every render.
    const struts = [];
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            const x = 26 + c * 22 + (r % 2 ? 11 : 0);
            const y = 26 + r * 20;
            if (Math.hypot(x - 100, y - 92) > 80) continue;
            struts.push([x, y, x + 22, y], [x, y, x + 11, y + 20], [x, y, x - 11, y + 20]);
        }
    }
    const lines = struts.map(([a, b, c, d], n) =>
        `<line class="fig-strut" data-n="${n}" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('');

    return {
        svg: `
<svg viewBox="0 0 400 200" role="img" aria-labelledby="bdT">
  <title id="bdT">A cross-section of bone whose internal lattice thickens as training load increases</title>
  <defs><clipPath id="bdClip"><circle cx="100" cy="92" r="76"/></clipPath></defs>
  <circle class="fig-bone-outer" cx="100" cy="92" r="76"/>
  <g clip-path="url(#bdClip)" id="bdLattice">${lines}</g>
  <circle class="fig-bone-ring" cx="100" cy="92" r="76"/>

  <text class="fig-label" x="210" y="34">BONE DENSITY</text>
  <text class="fig-big" id="bdValue" x="210" y="76">—</text>
  <text class="fig-note" id="bdCaption" x="210" y="100">Drag the slider</text>
  <text class="fig-note fig-note-key" id="bdVerdict" x="210" y="132"> </text>
</svg>`,

        bind(root) {
            const wrap = document.createElement('div');
            wrap.className = 'fig-control';
            wrap.innerHTML = `
                <label class="fig-control-label" for="bdRange">How much you load your bones</label>
                <input type="range" id="bdRange" min="0" max="4" step="1" value="3">
                <div class="fig-control-ends"><span>None at all</span><span>Training daily</span></div>`;
            root.appendChild(wrap);

            const STAGES = [
                { w: 0.7, drop: 0.62, pct: 'Very low', cap: 'Bed rest, or months in orbit.',   verdict: 'Breaks from a small fall.' },
                { w: 1.2, drop: 0.42, pct: 'Low',      cap: 'Sitting most days, no loading.',   verdict: 'Fractures come easily later.' },
                { w: 2.0, drop: 0.22, pct: 'Average',  cap: 'Walking, ordinary activity.',      verdict: 'Ordinary. Declines with age.' },
                { w: 3.0, drop: 0.06, pct: 'High',     cap: 'Regular running and lifting.',     verdict: 'A real buffer for later.' },
                { w: 4.2, drop: 0,    pct: 'Very high', cap: 'Daily impact and resistance work.', verdict: 'This is what you build now.' }
            ];

            const lattice = root.querySelector('#bdLattice');
            const value = root.querySelector('#bdValue');
            const caption = root.querySelector('#bdCaption');
            const verdict = root.querySelector('#bdVerdict');
            const strutEls = [...lattice.querySelectorAll('.fig-strut')];

            const apply = n => {
                const s = STAGES[n];
                strutEls.forEach((el, idx) => {
                    el.style.strokeWidth = s.w;
                    // Thin bone doesn't just get finer, struts disappear entirely.
                    el.style.opacity = (idx % 17) / 17 < s.drop ? 0 : 1;
                });
                value.textContent = s.pct;
                caption.textContent = s.cap;
                verdict.textContent = s.verdict;
            };

            const range = wrap.querySelector('#bdRange');
            range.addEventListener('input', () => apply(+range.value));
            apply(+range.value);
        }
    };
}

/* ---------- 5. Kinetic chain ---------- */
function kineticChain() {
    return {
        svg: `
<svg viewBox="0 0 300 250" role="img" aria-labelledby="kcT">
  <title id="kcT">A punch's force travelling from the floor through the legs, hips and arm to the fist</title>
  <path class="fig-chain" d="M62 232 L78 190 L96 150 L128 128 L166 112 L206 104 L246 100"/>
  <g class="fig-node">
    <circle cx="62"  cy="232" r="9"/><circle cx="96"  cy="150" r="9"/>
    <circle cx="128" cy="128" r="9"/><circle cx="166" cy="112" r="9"/>
    <circle cx="246" cy="100" r="11"/>
  </g>
  <g class="fig-step">
    <text x="62"  y="250" text-anchor="middle">1 floor</text>
    <text x="96"  y="140" text-anchor="middle">2 legs</text>
    <text x="128" y="118" text-anchor="middle">3 hips</text>
    <text x="166" y="102" text-anchor="middle">4 shoulder</text>
    <text x="250" y="86"  text-anchor="middle">5 fist</text>
  </g>
  <text class="fig-note fig-note-key" x="20" y="30">Power starts at the floor.</text>
  <text class="fig-note" x="20" y="50">Your hand only delivers it.</text>
</svg>`
    };
}

/* ==========================================================================
   MATHS FIGURES — tessellation.
   Tessellation is the rare topic where the diagram *is* the explanation, so
   two of these are interactive and carry the two hardest ideas: why only
   three regular polygons work, and how Escher made his tiles.
   ========================================================================== */

const rad = d => d * Math.PI / 180;
const interiorAngle = n => (n - 2) * 180 / n;

/** A regular n-gon with one vertex at the origin, opening toward +x. */
function polyAtVertex(n, s) {
    const A = interiorAngle(n);
    const ext = 360 / n;
    let d = -A / 2, x = 0, y = 0;
    const pts = [[0, 0]];
    for (let i = 1; i < n; i++) {
        x += s * Math.cos(rad(d));
        y += s * Math.sin(rad(d));
        pts.push([x, y]);
        d += ext;
    }
    return pts;
}

const ptsToPath = pts => 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L') + ' Z';

/* ---------- 6. Does it fit around a point? (interactive) ---------- */
/* The whole "why only three" argument, in one control. Copies of a polygon
   fan around a single vertex; you watch the gap close or refuse to. */
function angleFit() {
    const SHAPES = [
        { n: 3, name: 'Triangle' },
        { n: 4, name: 'Square' },
        { n: 5, name: 'Pentagon' },
        { n: 6, name: 'Hexagon' },
        { n: 8, name: 'Octagon' }
    ];

    return {
        svg: `
<svg viewBox="0 0 400 250" role="img" aria-labelledby="afT">
  <title id="afT">Copies of a regular polygon fanned around a single point, showing whether they close the full turn</title>
  <g id="afFan" transform="translate(108,125)"></g>
  <circle class="fig-vertex" cx="108" cy="125" r="4"/>
  <text class="fig-label" x="216" y="30">AT ONE CORNER</text>
  <text class="fig-big" id="afTitle" x="216" y="66">—</text>
  <text class="fig-note" id="afAngle" x="216" y="92"> </text>
  <text class="fig-note" id="afSum" x="216" y="112"> </text>
  <text class="fig-note fig-note-key" id="afVerdict" x="216" y="146"> </text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = SHAPES.map((s, i) =>
                `<button data-n="${s.n}" aria-pressed="${i === 0}">${s.name}</button>`).join('');
            root.appendChild(bar);

            const fan = root.querySelector('#afFan');
            const title = root.querySelector('#afTitle');
            const angle = root.querySelector('#afAngle');
            const sum = root.querySelector('#afSum');
            const verdict = root.querySelector('#afVerdict');

            const draw = n => {
                const A = interiorAngle(n);
                const fit = Math.floor(360 / A + 1e-9);
                const gap = +(360 - fit * A).toFixed(2);
                // Normalise size so every shape occupies about the same space.
                const s = 2 * 45 * Math.sin(rad(180 / n));
                const pts = polyAtVertex(n, s);

                let out = '';
                for (let k = 0; k < fit; k++) {
                    out += `<path class="fig-tile" transform="rotate(${(k * A).toFixed(2)})" d="${ptsToPath(pts)}"/>`;
                }
                if (gap > 0.01) {
                    // Draw the leftover wedge so the failure is visible, not just stated.
                    const r = 46;
                    const a0 = rad(fit * A), a1 = rad(360);
                    out += `<path class="fig-gap" d="M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)} Z"/>`;
                }
                fan.innerHTML = out;

                const nm = SHAPES.find(x => x.n === n).name;
                title.textContent = gap < 0.01 ? 'It fits' : "It can't";
                title.setAttribute('class', gap < 0.01 ? 'fig-big' : 'fig-big fig-big-no');
                angle.textContent = `${nm}: ${A % 1 ? A.toFixed(2) : A}° per corner`;
                sum.textContent = `${fit} of them = ${(fit * A) % 1 ? (fit * A).toFixed(2) : fit * A}°`;
                verdict.textContent = gap < 0.01
                    ? 'Exactly 360°. No gap.'
                    : `${gap}° short of a full turn.`;
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                draw(+b.dataset.n);
            });
            draw(3);
        }
    };
}

/* ---------- 7. The three that work ---------- */
function regularTess() {
    const tri = (cx, cy, s, up) => {
        const h = s * Math.sqrt(3) / 2;
        return up
            ? `M${cx} ${cy - h / 2} L${cx + s / 2} ${cy + h / 2} L${cx - s / 2} ${cy + h / 2} Z`
            : `M${cx} ${cy + h / 2} L${cx + s / 2} ${cy - h / 2} L${cx - s / 2} ${cy - h / 2} Z`;
    };
    const hex = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5]
        .map(i => `${(cx + r * Math.cos(rad(60 * i - 90))).toFixed(1)} ${(cy + r * Math.sin(rad(60 * i - 90))).toFixed(1)}`)
        .join(' L') + ' Z';

    let tris = '', sqs = '', hexes = '';
    const S = 26, H = S * Math.sqrt(3) / 2;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 9; c++) {
            const up = (r + c) % 2 === 0;
            tris += `<path class="fig-tile" d="${tri(14 + c * S / 2, 40 + r * H, S, up)}"/>`;
        }
    }
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
            sqs += `<rect class="fig-tile" x="${152 + c * 24}" y="${26 + r * 24}" width="24" height="24"/>`;
        }
    }
    const R = 15, HW = R * Math.sqrt(3);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            hexes += `<path class="fig-tile" d="${hex(292 + c * HW + (r % 2 ? HW / 2 : 0), 30 + r * R * 1.5, R)}"/>`;
        }
    }

    return {
        svg: `
<svg viewBox="0 0 400 165" role="img" aria-labelledby="rtT">
  <title id="rtT">Triangles, squares and hexagons each tiling a plane with no gaps</title>
  <g clip-path="url(#rtA)">${tris}</g>
  <g clip-path="url(#rtB)">${sqs}</g>
  <g clip-path="url(#rtC)">${hexes}</g>
  <defs>
    <clipPath id="rtA"><rect x="8" y="26" width="112" height="96"/></clipPath>
    <clipPath id="rtB"><rect x="152" y="26" width="112" height="96"/></clipPath>
    <clipPath id="rtC"><rect x="284" y="26" width="112" height="96"/></clipPath>
  </defs>
  <text class="fig-label" x="8"   y="18">TRIANGLE · 60°</text>
  <text class="fig-label" x="152" y="18">SQUARE · 90°</text>
  <text class="fig-label" x="284" y="18">HEXAGON · 120°</text>
  <text class="fig-note" x="8"   y="140">6 × 60 = 360</text>
  <text class="fig-note" x="152" y="140">4 × 90 = 360</text>
  <text class="fig-note" x="284" y="140">3 × 120 = 360</text>
  <text class="fig-note fig-note-key" x="8" y="160">The only three regular shapes that work alone.</text>
</svg>`
    };
}

/* ---------- 8. Escher's cut-and-slide (interactive) ---------- */
/* Cut a piece off one edge, slide it to the opposite edge, and the shape
   still tiles. That single move is how every Escher tessellation was built. */
function escherSlide() {
    const S = 46, STEPS = 14;

    const tilePath = (ox, oy, b) => {
        const f = y => b * Math.sin(Math.PI * y / S);
        let d = `M${(ox + f(0)).toFixed(1)} ${oy}`;
        d += ` L${(ox + S + f(0)).toFixed(1)} ${oy}`;
        for (let i = 1; i <= STEPS; i++) {
            const y = S * i / STEPS;
            d += ` L${(ox + S + f(y)).toFixed(1)} ${(oy + y).toFixed(1)}`;
        }
        d += ` L${(ox + f(S)).toFixed(1)} ${(oy + S).toFixed(1)}`;
        for (let i = STEPS - 1; i >= 0; i--) {
            const y = S * i / STEPS;
            d += ` L${(ox + f(y)).toFixed(1)} ${(oy + y).toFixed(1)}`;
        }
        return d + ' Z';
    };

    return {
        svg: `
<svg viewBox="0 0 400 230" role="img" aria-labelledby="esT">
  <title id="esT">A square with a bump cut from one edge and added to the other, still tiling perfectly</title>
  <g id="esGrid"></g>
  <text class="fig-label" x="248" y="30">THE MOVE</text>
  <text class="fig-note" x="248" y="54">Cut a piece off the left.</text>
  <text class="fig-note" x="248" y="74">Slide it to the right.</text>
  <text class="fig-note fig-note-key" x="248" y="104">It still tiles. Always.</text>
  <text class="fig-note" id="esState" x="248" y="140"> </text>
</svg>`,

        bind(root) {
            const wrap = document.createElement('div');
            wrap.className = 'fig-control';
            wrap.innerHTML = `
                <label class="fig-control-label" for="esRange">How big a piece do you move?</label>
                <input type="range" id="esRange" min="0" max="18" step="1" value="10">
                <div class="fig-control-ends"><span>Plain square</span><span>Big bite</span></div>`;
            root.appendChild(wrap);

            const grid = root.querySelector('#esGrid');
            const state = root.querySelector('#esState');

            const draw = b => {
                let out = '';
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const cls = (r + c) % 2 ? 'fig-tile' : 'fig-tile fig-tile-alt';
                        out += `<path class="${cls}" d="${tilePath(24 + c * S, 22 + r * S, b)}"/>`;
                    }
                }
                grid.innerHTML = out;
                state.textContent = b === 0 ? 'A plain square. It tiles.' : 'Not a square. Still tiles.';
            };

            const range = wrap.querySelector('#esRange');
            range.addEventListener('input', () => draw(+range.value));
            draw(+range.value);
        }
    };
}

/* ---------- 9. Mixing shapes ---------- */
function semiRegular() {
    const oct = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5, 6, 7]
        .map(i => `${(cx + r * Math.cos(rad(45 * i + 22.5))).toFixed(1)} ${(cy + r * Math.sin(rad(45 * i + 22.5))).toFixed(1)}`)
        .join(' L') + ' Z';

    const R = 21, P = R * 2 * Math.cos(rad(22.5));
    let a = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cx = 30 + c * P, cy = 34 + r * P;
            a += `<path class="fig-tile" d="${oct(cx, cy, R)}"/>`;
            const g = R * Math.sin(rad(22.5)) * 2;
            a += `<rect class="fig-tile fig-tile-alt" x="${(cx + P / 2 - g / 2).toFixed(1)}" y="${(cy + P / 2 - g / 2).toFixed(1)}" width="${g.toFixed(1)}" height="${g.toFixed(1)}" transform="rotate(45 ${(cx + P / 2).toFixed(1)} ${(cy + P / 2).toFixed(1)})"/>`;
        }
    }

    const hex = (cx, cy, r) => 'M' + [0, 1, 2, 3, 4, 5]
        .map(i => `${(cx + r * Math.cos(rad(60 * i))).toFixed(1)} ${(cy + r * Math.sin(rad(60 * i))).toFixed(1)}`)
        .join(' L') + ' Z';
    let b = '';
    const HR = 20;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cx = 252 + c * HR * 3 + (r % 2 ? HR * 1.5 : 0);
            const cy = 34 + r * HR * Math.sqrt(3);
            b += `<path class="fig-tile" d="${hex(cx, cy, HR)}"/>`;
            for (const [dx, dy, rot] of [[HR * 1.5, 0, 0], [HR * 0.75, HR * 0.87, 60]]) {
                const px = cx + dx, py = cy + dy;
                b += `<path class="fig-tile fig-tile-alt" transform="rotate(${rot} ${px.toFixed(1)} ${py.toFixed(1)})" d="M${px.toFixed(1)} ${(py - HR).toFixed(1)} L${(px + HR * 0.87).toFixed(1)} ${(py + HR / 2).toFixed(1)} L${(px - HR * 0.87).toFixed(1)} ${(py + HR / 2).toFixed(1)} Z"/>`;
            }
        }
    }

    return {
        svg: `
<svg viewBox="0 0 400 175" role="img" aria-labelledby="srT">
  <title id="srT">Octagons filled in with squares, and hexagons filled in with triangles</title>
  <g clip-path="url(#srA)">${a}</g>
  <g clip-path="url(#srB)">${b}</g>
  <defs>
    <clipPath id="srA"><rect x="10" y="14" width="150" height="116"/></clipPath>
    <clipPath id="srB"><rect x="232" y="14" width="150" height="116"/></clipPath>
  </defs>
  <text class="fig-label" x="10"  y="148">OCTAGON + SQUARE</text>
  <text class="fig-label" x="232" y="148">HEXAGON + TRIANGLE</text>
  <text class="fig-note fig-note-key" x="10" y="168">Alone they fail. Together the corners reach 360°.</text>
</svg>`
    };
}

/* ---------- 10. The striking hand (interactive) ---------- */
/* Bones drawn as capsules. Tap to switch between a square landing and a
   rotated one, and watch which bone the force ends up in. The whole point of
   the boxer's-fracture card is that this is a technique problem, so the
   diagram has to let him see the technique change. */
function strikingHand() {
    // [x1, y1, x2, y2, thickness] — a capsule per bone.
    const META = {
        mc2: [78, 192, 48, 120, 9],
        mc3: [90, 194, 74, 116, 9],
        mc4: [102, 194, 100, 118, 9],
        mc5: [114, 192, 126, 124, 9]
    };
    const PHAL = [
        [48, 120, 42, 88, 7], [42, 88, 38, 66, 6], [38, 66, 36, 50, 5],
        [74, 116, 72, 80, 7], [72, 80, 70, 56, 6], [70, 56, 69, 40, 5],
        [100, 118, 102, 84, 7], [102, 84, 104, 62, 6], [104, 62, 105, 47, 5],
        [126, 124, 130, 96, 6], [130, 96, 133, 78, 5], [133, 78, 134, 66, 5]
    ];
    const THUMB = [[74, 190, 44, 170, 9], [44, 170, 28, 148, 7], [28, 148, 20, 132, 6]];

    const bone = ([a, b, c, d, w], cls = 'fig-hbone', id = '') =>
        `<line ${id ? `id="${id}" ` : ''}class="${cls}" x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke-width="${w}"/>`;

    return {
        svg: `
<svg viewBox="0 0 400 250" role="img" aria-labelledby="shT">
  <title id="shT">The bones of the hand, showing which metacarpal takes the force on a square punch versus a rotated one</title>

  <!-- carpals: the wrist block -->
  <g class="fig-carpal">
    <rect x="72" y="196" width="16" height="13" rx="5"/>
    <rect x="90" y="198" width="16" height="13" rx="5"/>
    <rect x="76" y="212" width="17" height="12" rx="5"/>
    <rect x="95" y="212" width="17" height="12" rx="5"/>
  </g>
  <g>${THUMB.map(b => bone(b)).join('')}</g>
  <g>${PHAL.map(b => bone(b)).join('')}</g>
  ${bone(META.mc2, 'fig-hbone', 'shMc2')}
  ${bone(META.mc3, 'fig-hbone', 'shMc3')}
  ${bone(META.mc4, 'fig-hbone', 'shMc4')}
  ${bone(META.mc5, 'fig-hbone', 'shMc5')}

  <!-- force arrow, repositioned per state -->
  <g id="shForce" class="fig-force">
    <line id="shArrow" x1="95" y1="200" x2="60" y2="130"/>
    <polygon id="shHead" points="0,0 -5,10 5,10"/>
  </g>

  <text class="fig-label" x="192" y="34">WHERE THE FORCE GOES</text>
  <text class="fig-big" id="shTitle" x="192" y="72">—</text>
  <text class="fig-note" id="shBone" x="192" y="98"> </text>
  <text class="fig-note fig-note-key" id="shWhy" x="192" y="128"> </text>
  <text class="fig-note" id="shWhy2" x="192" y="148"> </text>

  <text class="fig-note fig-note-dim" x="18" y="240">index</text>
  <text class="fig-note fig-note-dim" x="62" y="240">middle</text>
  <text class="fig-note fig-note-dim" x="112" y="240">ring</text>
  <text class="fig-note fig-note-dim" x="150" y="240">pinky</text>
</svg>`,

        bind(root) {
            const btn = document.createElement('button');
            btn.className = 'btn sm fig-action';
            let square = true;

            const mc = n => root.querySelector('#shMc' + n);
            const arrow = root.querySelector('#shArrow');
            const head = root.querySelector('#shHead');
            const title = root.querySelector('#shTitle');
            const boneEl = root.querySelector('#shBone');
            const why = root.querySelector('#shWhy');
            const why2 = root.querySelector('#shWhy2');

            const apply = () => {
                [2, 3, 4, 5].forEach(n => mc(n).classList.remove('load', 'risk'));
                if (square) {
                    mc(2).classList.add('load');
                    mc(3).classList.add('load');
                    arrow.setAttribute('x2', '61'); arrow.setAttribute('y2', '132');
                    head.setAttribute('transform', 'translate(61,132) rotate(-25)');
                    title.textContent = 'Square on';
                    title.setAttribute('class', 'fig-big');
                    boneEl.textContent = '2nd and 3rd metacarpals';
                    why.textContent = 'The thickest striking bones.';
                    why2.textContent = 'Braced through the wrist.';
                } else {
                    mc(5).classList.add('risk');
                    arrow.setAttribute('x2', '124'); arrow.setAttribute('y2', '128');
                    head.setAttribute('transform', 'translate(124,128) rotate(18)');
                    title.textContent = 'Rotated landing';
                    title.setAttribute('class', 'fig-big fig-big-no');
                    boneEl.textContent = '5th metacarpal — the pinky side';
                    why.textContent = "This is the boxer's fracture.";
                    why2.textContent = 'Thinnest bone, worst-braced angle.';
                }
                btn.textContent = square ? 'Show a rotated punch' : 'Show a square punch';
            };

            btn.addEventListener('click', () => { square = !square; apply(); });
            apply();
            root.appendChild(btn);
        }
    };
}

/* ---------- 11. Chin tuck and the rotating skull (interactive) ---------- */
/* No photograph can show this: the skull stops and the brain, floating in
   fluid, keeps going. That lag is the knockout. Tuck the chin and the lever
   gets shorter, so the whole rotation gets smaller. */
function brainRotation() {
    return {
        svg: `
<svg viewBox="0 0 400 250" role="img" aria-labelledby="brT">
  <title id="brT">A head rotating from a punch, with the brain lagging behind inside the skull</title>

  <!-- neck pivot: everything turns about this point -->
  <circle class="fig-joint" cx="140" cy="196" r="7"/>
  <line class="fig-hbone" x1="140" y1="196" x2="140" y2="230" stroke-width="12"/>

  <g id="brHead">
    <!-- skull -->
    <path class="fig-skullwall" d="M140 196 L136 150 Q96 148 92 106 Q88 58 140 52 Q192 58 190 104 Q188 140 168 152 L166 196 Z"/>
    <!-- brain: its own group so it can lag behind the skull -->
    <g id="brBrain">
      <ellipse class="fig-brain" cx="139" cy="100" rx="34" ry="30"/>
      <path class="fig-brain-fold" d="M118 88 q10 8 20 0 q10 -8 20 0 M114 102 q12 9 24 0 q12 -9 22 1 M120 116 q10 7 20 0 q10 -7 18 1"/>
    </g>
    <!-- jaw: the lever -->
    <path class="fig-jaw" id="brJaw" d="M150 150 Q176 158 178 138"/>
  </g>

  <!-- incoming punch -->
  <g id="brFist" class="fig-force">
    <circle cx="238" cy="140" r="13" fill="none"/>
    <line x1="252" y1="140" x2="288" y2="140"/>
  </g>

  <text class="fig-label" x="212" y="34">WHAT HAPPENS</text>
  <text class="fig-big" id="brTitle" x="212" y="70">—</text>
  <text class="fig-note" id="brRot" x="212" y="96"> </text>
  <text class="fig-note fig-note-key" id="brWhy" x="212" y="196"> </text>
  <text class="fig-note" id="brWhy2" x="212" y="216"> </text>
</svg>`,

        bind(root) {
            const head = root.querySelector('#brHead');
            const brain = root.querySelector('#brBrain');
            const fist = root.querySelector('#brFist');
            const title = root.querySelector('#brTitle');
            const rotTxt = root.querySelector('#brRot');
            const why = root.querySelector('#brWhy');
            const why2 = root.querySelector('#brWhy2');

            head.style.transformOrigin = '140px 196px';
            brain.style.transformOrigin = '139px 100px';

            let tucked = false, playing = false;

            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = `
                <button data-t="0" aria-pressed="true">Chin up</button>
                <button data-t="1" aria-pressed="false">Chin tucked</button>`;
            const hit = document.createElement('button');
            hit.className = 'btn sm fig-action';
            hit.textContent = 'Land the shot';
            root.append(bar, hit);

            const setText = () => {
                title.textContent = tucked ? 'Tucked' : 'Exposed';
                title.setAttribute('class', tucked ? 'fig-big' : 'fig-big fig-big-no');
                rotTxt.textContent = tucked ? 'Short lever · small rotation' : 'Long lever · fast rotation';
                why.textContent = tucked ? 'The head barely turns.' : 'The skull whips round.';
                why2.textContent = tucked ? 'The brain moves with it.' : 'The brain lags behind.';
            };

            const play = () => {
                if (playing) return;
                playing = true;
                const deg = tucked ? 7 : 26;
                fist.style.transform = 'translateX(-46px)';
                head.style.transform = `rotate(-${deg}deg)`;
                // The brain turns less than the skull does — that difference
                // is the whole point of the card.
                brain.style.transform = `rotate(${deg * 0.55}deg)`;
                setTimeout(() => {
                    brain.style.transform = 'rotate(0deg)';   // it catches up late
                }, 260);
                setTimeout(() => {
                    fist.style.transform = '';
                    head.style.transform = '';
                    brain.style.transform = '';
                    playing = false;
                }, 1100);
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                tucked = b.dataset.t === '1';
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                root.querySelector('#brJaw').setAttribute('d',
                    tucked ? 'M150 150 Q168 154 170 140' : 'M150 150 Q176 158 178 138');
                setText();
            });
            hit.addEventListener('click', play);
            setText();
        }
    };
}

/* ---------- 12. The plural machine (interactive) ---------- */
/* Seven rules is too many to hold at once. Tapping a word and seeing which
   rule caught it turns a list to memorise into a procedure to follow. */
function pluralMachine() {
    const WORDS = [
        { one: 'helmet', many: 'helmets',  rule: 'Default',        why: 'Nothing special. Just add -s.' },
        { one: 'punch',  many: 'punches',  rule: 'Hissing sound',  why: 'Ends in -ch, so it takes -es.' },
        { one: 'box',    many: 'boxes',    rule: 'Hissing sound',  why: 'Ends in -x, so it takes -es.' },
        { one: 'city',   many: 'cities',   rule: 'Consonant + y',  why: 'A consonant before the y: drop it, add -ies.' },
        { one: 'monkey', many: 'monkeys',  rule: 'Vowel + y',      why: 'A vowel before the y: just add -s.' },
        { one: 'knife',  many: 'knives',   rule: 'f becomes v',    why: 'The -fe turns into -ves.' },
        { one: 'roof',   many: 'roofs',    rule: 'f stays f',      why: 'An exception. Roofs, chiefs and beliefs keep the f.' },
        { one: 'potato', many: 'potatoes', rule: 'o takes -es',    why: 'Food words ending in -o usually take -es.' },
        { one: 'photo',  many: 'photos',   rule: 'o takes -s',     why: 'Shortened words ending in -o just take -s.' },
        { one: 'child',  many: 'children', rule: 'Irregular',      why: 'No rule at all. Older than the rules.' },
        { one: 'foot',   many: 'feet',     rule: 'Irregular',      why: 'Pure memory. So are tooth, mouse and person.' },
        { one: 'sheep',  many: 'sheep',    rule: 'No change',      why: 'One sheep, ten sheep. Deer and fish do this too.' }
    ];

    return {
        svg: `
<svg viewBox="0 0 400 150" role="img" aria-labelledby="pmT">
  <title id="pmT">A singular noun and its plural, with the rule that produced it</title>
  <rect class="fig-chip" x="6"   y="26" width="150" height="52" rx="10"/>
  <rect class="fig-chip" x="212" y="26" width="182" height="52" rx="10"/>
  <text class="fig-label" x="6"   y="18">SINGULAR</text>
  <text class="fig-label" x="212" y="18">PLURAL</text>
  <text class="fig-word" id="pmOne"  x="20"  y="60">—</text>
  <text class="fig-word fig-word-out" id="pmMany" x="226" y="60">—</text>
  <path class="fig-chain" d="M166 52 H202"/>
  <polygon class="fig-node" points="202,52 192,46 192,58"/>
  <text class="fig-label" x="6" y="104">RULE THAT FIRED</text>
  <text class="fig-big" id="pmRule" x="6" y="128">—</text>
  <text class="fig-note" id="pmWhy" x="6" y="146"> </text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch fig-switch-wrap';
            bar.innerHTML = WORDS.map((w, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${w.one}</button>`).join('');
            root.appendChild(bar);

            const one = root.querySelector('#pmOne');
            const many = root.querySelector('#pmMany');
            const rule = root.querySelector('#pmRule');
            const why = root.querySelector('#pmWhy');

            const show = i => {
                const w = WORDS[i];
                one.textContent = w.one;
                many.textContent = w.many;
                rule.textContent = w.rule;
                why.textContent = w.why;
            };
            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                show(+b.dataset.i);
            });
            show(0);
        }
    };
}

/* ==========================================================================
   EXPLORERS — tappable anatomical diagrams with an info panel beside them.

   The Week 1 skeleton proved the interaction, so every body system reuses it
   rather than inventing a new one. Each explorer supplies its own artwork and
   its own part data; bindExplorer and explorerInfoHTML are shared.
   ========================================================================== */

const EXPLORER_DATA = {
    digestiveTract: {
        mouth: {
            name: 'Mouth', sub: 'os',
            job: 'Two jobs at once: teeth grind the food, saliva starts dissolving it.',
            car: 'The filler neck and the first filter. Nothing gets in unbroken.',
            you: 'Chew properly and everything downstream has less work to do.'
        },
        esophagus: {
            name: 'Oesophagus', sub: 'about 25 cm',
            job: 'A muscular tube that squeezes food down. It does not drop it.',
            car: 'The fuel line. It pumps rather than relying on gravity.',
            you: 'That squeeze is peristalsis — smooth muscle, from Week 1.'
        },
        stomach: {
            name: 'Stomach', sub: 'gaster',
            job: 'A muscular bag of acid. Food sits here two to four hours becoming chyme.',
            car: 'The mixing chamber. Harsh enough to damage metal, lined so it survives itself.',
            you: 'It rebuilds its own mucus lining constantly, or it would digest itself.'
        },
        liver: {
            name: 'Liver', sub: 'hepar',
            job: 'Makes bile, which breaks fat into droplets small enough to absorb.',
            car: 'The additive and filtration system.',
            you: 'It also stores glucose and releases it when you train.'
        },
        pancreas: {
            name: 'Pancreas', sub: 'pancreas',
            job: 'Pumps enzymes into the small intestine for carbs, fats and proteins.',
            car: 'The chemistry set — a different enzyme for each kind of fuel.',
            you: 'It also makes insulin, which decides what happens to sugar.'
        },
        smallint: {
            name: 'Small intestine', sub: 'six to seven metres',
            job: 'Almost every nutrient you will ever use is absorbed here.',
            car: 'The injector rail. This is where fuel actually enters the system.',
            you: 'Its villi, folded flat, would cover a tennis court.'
        },
        largeint: {
            name: 'Large intestine', sub: 'about 1.5 metres',
            job: 'Shorter but wider. Reclaims water and salts from what is left.',
            car: 'The recovery loop. Nothing usable is thrown away.',
            you: 'Trillions of bacteria live here and make vitamins for you.'
        },
        rectum: {
            name: 'Rectum & anus', sub: 'the exit',
            job: 'Stores waste until you decide. The final muscle is one you control.',
            car: 'The exhaust.',
            you: 'The whole trip takes roughly 24 to 72 hours.'
        }
    },

    phMap: {
        luzon: {
            name: 'Luzon', sub: 'the largest island group',
            job: 'The biggest island and the northern group. Manila, the capital, is here.',
            car: 'Most of the country\'s roads, rail and ports are concentrated on this island.',
            you: 'Roughly half the population of the Philippines lives in this group.'
        },
        visayas: {
            name: 'The Visayas', sub: 'the central group',
            job: 'A cluster of islands in the middle, including Cebu, Bohol, Leyte, Samar and Negros.',
            car: 'Ferries do the work roads do elsewhere. Sea lanes are the highways here.',
            you: 'Being scattered is why the country has so many languages.'
        },
        mindanao: {
            name: 'Mindanao', sub: 'the southern group',
            job: 'The second largest island, in the south. Davao is its biggest city.',
            car: 'Closest group to Indonesia and Malaysia, so trade has always flowed south.',
            you: 'Sits furthest from the typhoon belt, so it is hit far less often.'
        },
        palawan: {
            name: 'Palawan', sub: 'the long western island',
            job: 'A long thin island stretching south-west, counted with the Luzon group.',
            car: 'It points straight at the disputed waters of the West Philippine Sea.',
            you: 'One of the least densely populated parts of the country.'
        },
        westsea: {
            name: 'West Philippine Sea', sub: 'to the west',
            job: 'The eastern part of the South China Sea, which the Philippines calls the West Philippine Sea.',
            car: 'One of the busiest shipping routes on Earth passes through here.',
            you: 'Parts of it are claimed by several countries at once.'
        },
        philsea: {
            name: 'Philippine Sea', sub: 'to the east',
            job: 'Open Pacific to the east, and where most typhoons arrive from.',
            car: 'It contains the Philippine Trench, one of the deepest places in any ocean.',
            you: 'Storms crossing it are what make the eastern coast the wettest.'
        },
        neighbours: {
            name: 'The neighbours', sub: 'who is nearby',
            job: 'Taiwan to the north, Vietnam west, Malaysia and Indonesia south, Palau east.',
            car: 'Every neighbour is reached by sea or air. The Philippines shares no land border.',
            you: 'Being on the route between China, India and the Pacific shaped its whole history.'
        }
    },
    skinLayers: {
        epidermis: {
            name: 'Epidermis', sub: 'the outer layer',
            job: 'The barrier. Its outermost cells are already dead and flake away constantly.',
            car: 'The clear coat. Thin, sacrificial, and replaced rather than repaired.',
            you: 'You replace this whole layer roughly every four weeks.'
        },
        melanocyte: {
            name: 'Melanocytes', sub: 'pigment cells',
            job: 'Make melanin, the pigment that absorbs ultraviolet light before it reaches your DNA.',
            car: 'UV-blocking tint. It is protection, not decoration.',
            you: 'A tan is these cells responding to damage that already happened.'
        },
        dermis: {
            name: 'Dermis', sub: 'the working layer',
            job: 'Where the blood vessels, nerves, glands and hair roots all live.',
            car: 'The wiring loom and plumbing under the panel.',
            you: 'Every touch, temperature and pain signal starts here.'
        },
        sweat: {
            name: 'Sweat gland', sub: 'two to four million of them',
            job: 'Pushes water onto the skin. Evaporating water carries heat away.',
            car: 'The radiator. This is your entire cooling system.',
            you: 'Training makes these start earlier and work better. That is an adaptation.'
        },
        oil: {
            name: 'Oil gland', sub: 'sebaceous gland',
            job: 'Makes sebum, which waterproofs skin and hair and keeps them flexible.',
            car: 'The wax layer. It sheds water and stops drying out.',
            you: 'Puberty hormones make these far more active. That is what acne is.'
        },
        hair: {
            name: 'Hair & follicle', sub: 'with arrector pili muscle',
            job: 'Grows from a root in the dermis. A tiny muscle can stand it upright.',
            car: 'Surface texture that traps a thin layer of still air.',
            you: 'That muscle is smooth muscle — goosebumps are it contracting.'
        },
        subcut: {
            name: 'Subcutaneous layer', sub: 'hypodermis',
            job: 'Fat and connective tissue. Insulates, stores energy, and cushions impact.',
            car: 'The padding behind the panel.',
            you: 'This is the layer that absorbs a body shot before it reaches anything solid.'
        }
    }
};

function digestiveTract() {
    return {
        svg: `<svg viewBox="0 0 200 306" role="img" aria-labelledby="dtT">
  <title id="dtT">The digestive tract from mouth to anus, drawn as one continuous tube</title>
  <g class="organ" data-part="mouth" role="button" tabindex="0" aria-label="Mouth"><title>Mouth</title>
    <ellipse cx="100" cy="26" rx="24" ry="15"/></g>
  <g class="organ" data-part="esophagus" role="button" tabindex="0" aria-label="Oesophagus"><title>Oesophagus</title>
    <rect x="92" y="40" width="16" height="60" rx="8"/></g>
  <g class="organ" data-part="stomach" role="button" tabindex="0" aria-label="Stomach"><title>Stomach</title>
    <path d="M100 100 Q70 106 66 132 Q64 158 92 162 Q116 162 118 140 Q120 118 108 102 Z"/></g>
  <g class="organ" data-part="liver" role="button" tabindex="0" aria-label="Liver"><title>Liver</title>
    <path d="M122 104 Q160 100 166 122 Q164 140 138 140 Q122 132 122 104 Z"/></g>
  <g class="organ" data-part="pancreas" role="button" tabindex="0" aria-label="Pancreas"><title>Pancreas</title>
    <path d="M118 150 Q142 146 156 154 Q140 162 118 158 Z"/></g>
  <g class="organ tube" data-part="smallint" role="button" tabindex="0" aria-label="Small intestine"><title>Small intestine</title>
    <path d="M92 172 q28 -6 30 14 q-2 18 -28 14 q-26 -4 -26 16 q0 20 28 16 q28 -4 28 16 q0 18 -26 14" fill="none" stroke-width="11" stroke-linecap="round"/></g>
  <g class="organ tube" data-part="largeint" role="button" tabindex="0" aria-label="Large intestine"><title>Large intestine</title>
    <path d="M56 176 v76 q0 14 14 14 h60 q14 0 14 -14 v-76" fill="none" stroke-width="14" stroke-linecap="round"/></g>
  <g class="organ" data-part="rectum" role="button" tabindex="0" aria-label="Rectum and anus"><title>Rectum and anus</title>
    <rect x="94" y="268" width="14" height="26" rx="6"/></g>
</svg>`
    };
}

function skinLayers() {
    return {
        svg: `<svg viewBox="0 0 220 300" role="img" aria-labelledby="slT">
  <title id="slT">A cross-section of skin showing the epidermis, dermis and subcutaneous layer with a hair, an oil gland and a sweat gland</title>

  <g class="organ" data-part="epidermis" role="button" tabindex="0" aria-label="Epidermis"><title>Epidermis</title>
    <rect x="10" y="16" width="200" height="46" rx="4"/></g>
  <g class="organ" data-part="dermis" role="button" tabindex="0" aria-label="Dermis"><title>Dermis</title>
    <rect x="10" y="62" width="200" height="118" rx="4"/></g>
  <g class="organ" data-part="subcut" role="button" tabindex="0" aria-label="Subcutaneous layer"><title>Subcutaneous layer</title>
    <rect x="10" y="180" width="200" height="76" rx="4"/></g>

  <g class="organ" data-part="melanocyte" role="button" tabindex="0" aria-label="Melanocytes"><title>Melanocytes</title>
    <circle cx="40" cy="55" r="5"/><circle cx="70" cy="57" r="5"/><circle cx="100" cy="55" r="5"/></g>

  <g class="organ tube" data-part="hair" role="button" tabindex="0" aria-label="Hair and follicle"><title>Hair and follicle</title>
    <path d="M150 4 v152" fill="none" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="150" cy="160" rx="13" ry="11"/></g>

  <g class="organ tube" data-part="oil" role="button" tabindex="0" aria-label="Oil gland"><title>Oil gland</title>
    <path d="M150 96 h-22" fill="none" stroke-width="6" stroke-linecap="round"/>
    <circle cx="118" cy="96" r="13"/></g>

  <g class="organ tube" data-part="sweat" role="button" tabindex="0" aria-label="Sweat gland"><title>Sweat gland</title>
    <path d="M54 16 v58 q0 12 -10 14" fill="none" stroke-width="6" stroke-linecap="round"/>
    <circle cx="40" cy="96" r="15"/></g>

  <text class="fig-label" x="14" y="34">EPIDERMIS</text>
  <text class="fig-label" x="14" y="128">DERMIS</text>
  <text class="fig-label" x="14" y="200">SUBCUTANEOUS</text>
  <text class="fig-note fig-note-dim" x="10" y="276">Tap any layer or structure</text>
</svg>`
    };
}

/** Info panel for a tapped part of any explorer. */
export function explorerInfoHTML(figure, id) {
    const part = EXPLORER_DATA[figure]?.[id];
    if (!part) return '<p class="placeholder">Tap any part of the diagram to see what it does.</p>';
    return `<h3>${part.name}</h3><div class="latin">${part.sub}</div>
        <div class="bone-fact"><span class="ico">🔬</span><span>${part.job}</span></div>
        <div class="bone-fact"><span class="ico">🚗</span><span>${part.car}</span></div>
        <div class="bone-fact"><span class="ico">⚡</span><span>${part.you}</span></div>`;
}

/** Click and keyboard selection for any explorer diagram. */
export function bindExplorer(root, figure, onSelect) {
    const groups = root.querySelectorAll('.organ');
    const select = id => {
        if (!EXPLORER_DATA[figure]?.[id]) return;
        groups.forEach(g => g.classList.toggle('active', g.dataset.part === id));
        onSelect(id);
    };
    root.addEventListener('click', e => {
        const t = e.target.closest('[data-part]');
        if (t) select(t.dataset.part);
    });
    groups.forEach(g => g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.part); }
    }));
}

/* ---------- 15. Transformation lab (interactive) ---------- */
/* The shape is deliberately asymmetric — an F — because a symmetrical one
   hides the difference between a flip and a turn, which is the exact thing
   the exam asks him to tell apart. The ghost shows where it started, so what
   is preserved is as visible as what moved. */
function transformLab() {
    const F = 'M0 0 h44 v13 h-31 v11 h27 v13 h-27 v33 h-13 Z';

    const MOVES = {
        none:       { t: '', name: 'Start', desc: 'This is the shape before any move.', tag: '' },
        translate:  { t: 'translate(96,34)', name: 'Translation', desc: 'Slid 96 right, 34 down. Same way up.', tag: 'A slide' },
        reflect:    { t: 'translate(230,0) scale(-1,1)', name: 'Reflection', desc: 'Flipped across a vertical mirror line. Left and right have swapped.', tag: 'A flip' },
        rotate:     { t: 'rotate(180 158 60)',           name: 'Rotation', desc: 'Turned 180° about the marked centre point.', tag: 'A turn' }
    };

    return {
        svg: `
<svg viewBox="0 0 400 210" role="img" aria-labelledby="tlT">
  <title id="tlT">An F-shaped figure shown in its original position and after a translation, reflection or rotation</title>

  <g class="fig-grid">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${20 + i * 30}" y1="14" x2="${20 + i * 30}" y2="164"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="20" y1="${14 + i * 30}" x2="260" y2="${14 + i * 30}"/>`).join('')}
  </g>

  <!-- mirror line and rotation centre, shown only for the relevant move -->
  <line class="fig-mirror hidden" id="tlMirror" x1="115" y1="10" x2="115" y2="168"/>
  <circle class="fig-vertex hidden" id="tlCentre" cx="158" cy="60" r="5"/>

  <path class="fig-ghost" d="${F}" transform="translate(30,30)"/>
  <g id="tlMoved" transform="translate(30,30)">
    <path class="fig-shape" d="${F}"/>
  </g>

  <text class="fig-label" x="188" y="30">THE MOVE</text>
  <text class="fig-big" id="tlName" x="188" y="60">—</text>
  <text class="fig-note fig-note-key" id="tlTag" x="188" y="82"> </text>
  <text class="fig-note fig-note-dim" x="188" y="150">Faint outline = the start</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = `
                <button data-m="none" aria-pressed="true">Start</button>
                <button data-m="translate" aria-pressed="false">Slide</button>
                <button data-m="reflect" aria-pressed="false">Flip</button>
                <button data-m="rotate" aria-pressed="false">Turn</button>`;
            root.appendChild(bar);

            const caption = document.createElement('p');
            caption.className = 'fig-caption';
            root.appendChild(caption);

            const moved = root.querySelector('#tlMoved');
            const name = root.querySelector('#tlName');
            const tag = root.querySelector('#tlTag');
            const mirror = root.querySelector('#tlMirror');
            const centre = root.querySelector('#tlCentre');

            const show = key => {
                const m = MOVES[key];
                moved.setAttribute('transform', `translate(30,30) ${m.t}`);
                name.textContent = m.name;
                tag.textContent = m.tag;
                caption.textContent = m.desc;
                mirror.classList.toggle('hidden', key !== 'reflect');
                centre.classList.toggle('hidden', key !== 'rotate');
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                show(b.dataset.m);
            });
            show('none');
        }
    };
}

/* ---------- 16. Decimal alignment (interactive) ---------- */
/* Nearly every decimal addition error is the same error: lining the digits up
   on the right instead of on the decimal point. Showing both side by side,
   with both answers, makes the mistake visible rather than described. */
function decimalColumns() {
    const A = '12.5', B = '3.75';

    // Right-aligned is what a careless reader does; it silently changes the
    // place value of every digit.
    const WRONG = { rows: ['12.5', '3.75'], pad: 'right', sum: '(nonsense)', note: 'The 5 tenths sits under 7 hundredths now.' };
    const RIGHT = { rows: ['12.50', ' 3.75'], pad: 'point', sum: '16.25', note: 'Tenths under tenths. Fill the gap with a zero.' };

    const row = (txt, y, cls = '') =>
        `<text class="fig-digit ${cls}" x="150" y="${y}" text-anchor="end">${txt}</text>`;

    return {
        svg: `
<svg viewBox="0 0 400 190" role="img" aria-labelledby="dcT">
  <title id="dcT">Two decimal numbers stacked, aligned on the right and then aligned on the decimal point</title>
  <text class="fig-label" x="20" y="24" id="dcMode">—</text>
  <g id="dcRows"></g>
  <line class="fig-rule-strong" x1="60" y1="112" x2="152" y2="112"/>
  <text class="fig-digit fig-digit-sum" id="dcSum" x="150" y="142" text-anchor="end">—</text>
  <line class="fig-mirror hidden" id="dcPoint" x1="121" y1="34" x2="121" y2="150"/>
  <text class="fig-note" id="dcNote" x="176" y="72"> </text>
  <text class="fig-note" id="dcNote2" x="176" y="92"> </text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = `
                <button data-m="wrong" aria-pressed="true">Line up the right edge</button>
                <button data-m="right" aria-pressed="false">Line up the point</button>`;
            root.appendChild(bar);

            const rows = root.querySelector('#dcRows');
            const sum = root.querySelector('#dcSum');
            const mode = root.querySelector('#dcMode');
            const note = root.querySelector('#dcNote');
            const note2 = root.querySelector('#dcNote2');
            const point = root.querySelector('#dcPoint');

            const show = key => {
                const m = key === 'wrong' ? WRONG : RIGHT;
                rows.innerHTML = row(m.rows[0], 60) + row('+ ' + m.rows[1].trim(), 96);
                sum.textContent = m.sum;
                sum.setAttribute('class', key === 'wrong' ? 'fig-digit fig-digit-bad' : 'fig-digit fig-digit-sum');
                mode.textContent = key === 'wrong' ? 'WRONG — RIGHT-ALIGNED' : 'RIGHT — POINT-ALIGNED';
                mode.setAttribute('class', key === 'wrong' ? 'fig-label fig-label-bad' : 'fig-label');
                const words = m.note.split(' ');
                const half = Math.ceil(words.length / 2);
                note.textContent = words.slice(0, half).join(' ');
                note2.textContent = words.slice(half).join(' ');
                point.classList.toggle('hidden', key === 'wrong');
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                show(b.dataset.m);
            });
            show('wrong');
        }
    };
}

/* ---------- 17. Possessive apostrophes (interactive) ---------- */
/* Four cases and one notorious trap. Tapping through them puts the rule and
   the example on screen together, which a list of rules does not. */
function possessiveRule() {
    const CASES = [
        { label: 'boy',      base: 'boy',      out: "the boy's helmet",       rule: 'Singular noun',              why: "Add 's. It doesn't matter what letter it ends in." },
        { label: 'boys',     base: 'boys',     out: "the boys' helmets",      rule: 'Plural ending in s',         why: "Just an apostrophe. There's already an s there." },
        { label: 'children', base: 'children', out: "the children's books",   rule: 'Plural NOT ending in s',     why: "Add 's, same as a singular. Also men, women, people." },
        { label: 'James',    base: 'James',    out: "James's horse",          rule: 'Singular ending in s', why: "James's or James' — both are accepted. Pick one." },
        { label: 'its',      base: 'its',      out: "the car lost its wheel", rule: 'The trap',                   why: "No apostrophe. it's always means 'it is'." }
    ];

    return {
        svg: `
<svg viewBox="0 0 400 150" role="img" aria-labelledby="prT">
  <title id="prT">A possessive form with the rule that produced it</title>
  <text class="fig-label" x="10" y="20">THE RULE</text>
  <text class="fig-big" id="prRule" x="10" y="48">—</text>
  <rect class="fig-chip" x="6" y="64" width="388" height="44" rx="10"/>
  <text class="fig-word fig-word-out" id="prOut" x="20" y="93">—</text>
  <text class="fig-note" id="prWhy" x="10" y="132"> </text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch fig-switch-wrap';
            bar.innerHTML = CASES.map((c, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${c.label}</button>`).join('');
            root.appendChild(bar);

            const out = root.querySelector('#prOut');
            const rule = root.querySelector('#prRule');
            const why = root.querySelector('#prWhy');

            const show = i => {
                const c = CASES[i];
                out.textContent = c.out;
                rule.textContent = c.rule;
                rule.setAttribute('class', c.rule === 'The trap' ? 'fig-big fig-big-no' : 'fig-big');
                why.textContent = c.why;
            };
            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (!b) return;
                bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
                show(+b.dataset.i);
            });
            show(0);
        }
    };
}

/* ---------- 18. The Philippines in its region (explorer) ---------- */
/* A deliberately schematic map. An accurate coastline drawn by hand would be
   worse than useless — this shows the three island groups, the seas that
   bound them and the neighbours, which is exactly what Week 1 assesses. */
function phMap() {
    return {
        svg: `<svg viewBox="0 0 240 320" role="img" aria-labelledby="phT">
  <title id="phT">A simplified map of the Philippines showing Luzon, the Visayas and Mindanao, the surrounding seas and neighbouring countries</title>

  <rect class="map-sea" x="0" y="0" width="240" height="320" rx="6"/>

  <g class="organ" data-part="luzon" role="button" tabindex="0" aria-label="Luzon"><title>Luzon</title>
    <path d="M96 42 Q126 38 134 66 Q140 96 126 116 Q118 132 122 146 Q112 154 104 142 Q92 122 90 96 Q86 66 96 42 Z"/>
    <path d="M138 150 q10 6 6 18 q-8 8 -14 -2 Z"/></g>

  <g class="organ" data-part="visayas" role="button" tabindex="0" aria-label="The Visayas"><title>The Visayas</title>
    <ellipse cx="104" cy="176" rx="15" ry="8"/>
    <ellipse cx="132" cy="186" rx="11" ry="7"/>
    <ellipse cx="96" cy="196" rx="12" ry="7"/>
    <ellipse cx="126" cy="206" rx="14" ry="7"/>
    <ellipse cx="150" cy="196" rx="9" ry="6"/></g>

  <g class="organ" data-part="mindanao" role="button" tabindex="0" aria-label="Mindanao"><title>Mindanao</title>
    <path d="M92 226 Q126 218 152 232 Q166 248 154 266 Q130 280 106 272 Q86 258 92 226 Z"/></g>

  <g class="organ" data-part="palawan" role="button" tabindex="0" aria-label="Palawan"><title>Palawan</title>
    <path d="M42 196 L78 168 l8 9 l-36 28 Z"/></g>

  <g class="organ" data-part="westsea" role="button" tabindex="0" aria-label="West Philippine Sea"><title>West Philippine Sea</title>
    <rect x="6" y="60" width="56" height="90" rx="6" fill="transparent"/></g>
  <g class="organ" data-part="philsea" role="button" tabindex="0" aria-label="Philippine Sea"><title>Philippine Sea</title>
    <rect x="176" y="60" width="58" height="110" rx="6" fill="transparent"/></g>
  <g class="organ" data-part="neighbours" role="button" tabindex="0" aria-label="Neighbouring countries"><title>Neighbouring countries</title>
    <rect x="6" y="272" width="228" height="42" rx="6" fill="transparent"/></g>

  <text class="map-label" x="12" y="104">WEST</text>
  <text class="map-label" x="12" y="116">PHILIPPINE</text>
  <text class="map-label" x="12" y="128">SEA</text>
  <text class="map-label" x="236" y="110" text-anchor="end">PHILIPPINE</text>
  <text class="map-label" x="182" y="122">SEA</text>
  <text class="map-label" x="88" y="22">Taiwan ↑</text>
  <text class="map-label" x="12" y="296">Vietnam ←</text>
  <text class="map-label" x="150" y="296">→ Palau</text>
  <text class="map-label" x="72" y="310">Malaysia · Indonesia ↓</text>
</svg>`
    };
}

/* ==========================================================================
   SOCIAL STUDIES — timelines.
   These topics are causal chains, not lists of dates: each event made the
   next one possible. A timeline shows that in a way four paragraphs cannot,
   and it lets the sequence be recovered without re-reading the cards.
   ========================================================================== */

/** A tappable timeline. Five or so stops on one line; tapping names one. */
function timeline({ id, label, alt, stops }) {
    // Evenly spaced between x=42 and x=418, whatever the number of stops.
    const X = stops.map((_, i) => Math.round(42 + i * 358 / (stops.length - 1)));

    return {
        svg: `
<svg viewBox="0 0 460 214" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="26">${label}</text>
  <path class="fig-chain" d="M${X[0]} 112 L${X[X.length - 1]} 112"/>
  <g id="${id}Nodes" class="fig-node">
    ${X.map((x, i) => `<circle data-i="${i}" cx="${x}" cy="112" r="6"/>`).join('')}
  </g>
  <g class="fig-step">
    ${stops.map((s, i) => `<text x="${X[i]}" y="96" text-anchor="middle">${s.year}</text>`).join('')}
  </g>
  <g class="fig-note">
    ${stops.map((s, i) => `<text x="${X[i]}" y="136" text-anchor="middle">${s.tag}</text>`).join('')}
  </g>
  <text class="fig-note fig-note-key" id="${id}Head" x="20" y="178">&#160;</text>
  <text class="fig-note"              id="${id}Body" x="20" y="198">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = stops.map((s, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${s.year}</button>`).join('');
            root.appendChild(bar);

            const h = root.querySelector(`#${id}Head`);
            const b = root.querySelector(`#${id}Body`);
            const dots = [...root.querySelectorAll(`#${id}Nodes circle`)];

            const show = i => {
                h.textContent = stops[i].head;
                b.textContent = stops[i].body;
                fitText(h); fitText(b);
                dots.forEach((d, j) => d.setAttribute('r', j === i ? 11 : 6));
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === i)));
            };

            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(Number(btn.dataset.i));
            });
            root.querySelector(`#${id}Nodes`).addEventListener('click', e => {
                const c = e.target.closest('circle');
                if (c) show(Number(c.dataset.i));
            });

            show(0);
        }
    };
}

/* Week 2: how the colony arrived at 1872. */
function roadTo1872() {
    return timeline({
        id: 'r72', label: 'THE ROAD TO 1872',
        alt: 'A timeline from 1834 to February 1872, where each event makes the next one possible',
        stops: [
            { year: '1834', tag: 'ports open',
              head: 'Manila opens to world trade',
              body: 'Filipino families grow rich selling to the world.' },
            { year: '1863', tag: 'schools',
              head: 'Free primary school, taught in Spanish',
              body: 'More Filipinos can read what European liberals write.' },
            { year: '1869', tag: 'the shortcut',
              head: 'Suez Canal opens · de la Torre arrives',
              body: 'Spain is now a month away, not three.' },
            { year: 'Jan 1872', tag: 'mutiny',
              head: 'The Cavite Mutiny',
              body: 'Arsenal workers revolt over a lost exemption.' },
            { year: 'Feb 1872', tag: 'GomBurZa',
              head: 'Three priests executed at Bagumbayan',
              body: 'No real evidence was ever shown against them.' }
        ]
    });
}

/* Week 5: from a secret society to a republic, in seven years. */
function roadToRepublic() {
    return timeline({
        id: 'rep', label: 'SEVEN YEARS',
        alt: 'A timeline from the founding of the Katipunan in 1892 to the First Philippine Republic in 1899',
        stops: [
            { year: '1892', tag: 'Katipunan',
              head: 'The Katipunan is founded in Tondo',
              body: 'Days after Rizal is arrested. Reform is over.' },
            { year: '1896', tag: 'the Cry',
              head: 'The Cry of Pugad Lawin',
              body: 'Members tear their cedulas. The revolution begins.' },
            { year: '1897', tag: 'the split',
              head: 'Tejeros, then Biak-na-Bato',
              body: 'Aguinaldo elected. Bonifacio executed in May.' },
            { year: '1898', tag: 'Kawit',
              head: 'Independence declared at Kawit',
              body: '12 June. The flag is unfurled for the first time.' },
            { year: '1899', tag: 'Malolos',
              head: 'The First Philippine Republic',
              body: '23 January, at Barasoain Church in Malolos.' }
        ]
    });
}

/* ==========================================================================
   SCIENCE — circulation and the reflex arc.
   Both are sequences, and a sequence is the case where a diagram genuinely
   beats prose: you can see where you are in the loop. They share one small
   engine below — light the segments up to step n, and caption the current one.
   Nothing is distinguished by colour alone; the caption always names it.
   ========================================================================== */

/** Shared: a stepped path diagram. STEPS carry the caption for each segment. */
function steppedPath({ id, viewBox, scene, segs, steps, labels }) {
    const head = 'M-11 -5 L0 0 L-11 5 Z';
    return {
        svg: `
<svg viewBox="${viewBox}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${labels.alt}</title>
  <text class="fig-label" x="${labels.x}" y="${labels.y}">${labels.text}</text>
  ${scene}
  ${segs.map((g, i) => `
  <path class="fig-seg"     data-s="${i}" d="${g.d}"/>
  <path class="fig-seghead" data-s="${i}" d="${head}" transform="translate(${g.tip}) rotate(${g.rot})"/>`).join('')}
  <text class="fig-note fig-note-key" id="${id}Head" x="16" y="${labels.capY}">&#160;</text>
  <text class="fig-note"              id="${id}Body" x="16" y="${labels.capY + 18}">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = steps.map((s, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${s.btn}</button>`).join('');
            root.appendChild(bar);

            const h = root.querySelector(`#${id}Head`);
            const b = root.querySelector(`#${id}Body`);
            const parts = [...root.querySelectorAll('[data-s]')];

            const show = n => {
                h.textContent = steps[n].head;
                b.textContent = steps[n].body;
                fitText(h); fitText(b);
                // Cumulative: the path so far stays lit, so the sequence is visible
                // as a route rather than as five unrelated highlights.
                parts.forEach(p => p.classList.toggle('on', Number(p.dataset.s) <= n));
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === n)));
            };

            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(Number(btn.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- Double circulation: two loops, one pump ---------- */
/* Drawn as a figure of eight because that is what double circulation is.
   Right side of the heart is on the viewer's left, as on every diagram he
   will meet in an exam — the card says so, because it catches people out. */
function heartLoop() {
    return steppedPath({
        id: 'hl',
        viewBox: '0 0 400 332',
        labels: {
            x: 146, y: 20, text: 'TWO LOOPS, ONE PUMP', capY: 300,
            alt: 'A figure-of-eight showing blood going body, right heart, lungs, left heart, body'
        },
        scene: `
  <rect class="fig-organ" x="28"  y="26"  width="104" height="46" rx="10"/>
  <text class="fig-organ-t" x="80"  y="55"  text-anchor="middle">LUNGS</text>
  <rect class="fig-organ" x="268" y="228" width="104" height="46" rx="10"/>
  <text class="fig-organ-t" x="320" y="257" text-anchor="middle">BODY</text>
  <rect class="fig-pump"  x="140" y="108" width="120" height="88" rx="12"/>
  <line class="fig-divide" x1="200" y1="110" x2="200" y2="194"/>
  <text class="fig-chamber fig-chamber-strong" x="170" y="128" text-anchor="middle">RIGHT</text>
  <text class="fig-chamber" x="170" y="150" text-anchor="middle">atrium</text>
  <text class="fig-chamber" x="170" y="172" text-anchor="middle">ventricle</text>
  <text class="fig-chamber fig-chamber-strong" x="231" y="128" text-anchor="middle">LEFT</text>
  <text class="fig-chamber" x="231" y="150" text-anchor="middle">atrium</text>
  <text class="fig-chamber" x="231" y="172" text-anchor="middle">ventricle</text>`,
        segs: [
            { d: 'M268 252 C220 262 172 236 166 200', tip: '166,200', rot: 261 },
            { d: 'M168 108 C150 92 110 88 84 77',     tip: '84,77',   rot: 203 },
            { d: 'M112 74 C160 96 200 84 230 106',    tip: '230,106', rot: 36  },
            { d: 'M232 196 C252 214 268 220 286 229', tip: '286,229', rot: 27  }
        ],
        steps: [
            { btn: '1 Body in',  head: 'Body to the right side of the heart',
              body: 'Oxygen-poor blood comes back in the veins.' },
            { btn: '2 To lungs', head: 'Right side pumps it to the lungs',
              body: 'It picks up oxygen and drops carbon dioxide.' },
            { btn: '3 Lungs in', head: 'Lungs back to the left side',
              body: 'Oxygen-rich blood returns to the heart.' },
            { btn: '4 To body',  head: 'Left side pumps it to the whole body',
              body: 'The hardest push. That is why its wall is thickest.' }
        ]
    });
}

/* ---------- The reflex arc ---------- */
/* The point of the figure is the last step: the brain is told afterwards.
   That ordering is impossible to show convincingly in a paragraph. */
function reflexArc() {
    return steppedPath({
        id: 'ra',
        viewBox: '0 0 400 314',
        labels: {
            x: 16, y: 20, text: 'REFLEX ARC', capY: 278,
            alt: 'A hand, the spinal cord, an arm muscle and the brain, with the reflex path between them'
        },
        scene: `
  <circle class="fig-organ" cx="56" cy="196" r="26"/>
  <text class="fig-organ-t" x="56" y="240" text-anchor="middle">HAND</text>
  <rect class="fig-organ" x="20" y="72" width="76" height="38" rx="16"/>
  <text class="fig-organ-t" x="58" y="62" text-anchor="middle">ARM MUSCLE</text>
  <rect class="fig-pump" x="186" y="50" width="28" height="184" rx="13"/>
  <text class="fig-organ-t" x="200" y="252" text-anchor="middle">SPINAL CORD</text>
  <rect class="fig-organ" x="256" y="30" width="88" height="46" rx="22"/>
  <text class="fig-organ-t" x="300" y="59" text-anchor="middle">BRAIN</text>`,
        segs: [
            { d: 'M80 188 C120 180 150 172 182 163', tip: '182,163', rot: 344 },
            { d: 'M200 158 L200 130',                tip: '200,130', rot: 270 },
            { d: 'M184 118 C150 110 120 100 94 95',  tip: '94,95',   rot: 192 },
            { d: 'M213 80 C234 68 242 60 254 54',    tip: '254,54',  rot: 329 }
        ],
        steps: [
            { btn: '1 Sensory', head: 'Sensory neuron: hand to spinal cord',
              body: 'The message goes in. It does not visit the brain first.' },
            { btn: '2 Cord',    head: 'The spinal cord makes the decision',
              body: 'One relay neuron, and that is the whole shortcut.' },
            { btn: '3 Motor',   head: 'Motor neuron: cord to the arm muscle',
              body: 'Your hand is already moving away from the pan.' },
            { btn: '4 Brain',   head: 'Only now is the brain told',
              body: 'You feel the pain after your hand has gone. That is the point.' }
        ]
    });
}

/* ---------- Multiplying decimals: count, don't align ---------- */
/* The companion to decimalColumns. Addition says "line up the points";
   multiplication says the opposite, and that contradiction is where the
   marks go. Showing the two rules as two figures makes them separate
   things in his head rather than one rule he half-remembers. */
function decimalPlaces() {
    const CASES = [
        { btn: '1.2 × 0.3', a: '1.2', b: '0.3',
          strip: '12 × 3 = 36', places: '1 + 1 = 2 places', answer: '0.36',
          check: 'About 1 lot of 0.3, so about 0.3. It fits.' },
        { btn: '0.25 × 4', a: '0.25', b: '4',
          strip: '25 × 4 = 100', places: '2 + 0 = 2 places', answer: '1.00',
          check: 'A quarter, four times, is 1. Exactly right.' },
        { btn: '3.14 × 2.5', a: '3.14', b: '2.5',
          strip: '314 × 25 = 7850', places: '2 + 1 = 3 places', answer: '7.850',
          check: 'About 3 × 2.5 = 7.5. The point looks right.' }
    ];

    return {
        svg: `
<svg viewBox="0 0 400 232" role="img" aria-labelledby="dpT">
  <title id="dpT">Multiplying two decimals by ignoring the points, then counting the decimal places</title>
  <text class="fig-label" x="16" y="20">MULTIPLY: COUNT, DO NOT ALIGN</text>
  <text class="fig-digit" id="dpSum"    x="16" y="58">&#160;</text>
  <text class="fig-step"  x="16" y="86">STEP 1 — IGNORE THE POINTS</text>
  <text class="fig-note fig-note-key" id="dpStrip"  x="16" y="106">&#160;</text>
  <text class="fig-step"  x="16" y="134">STEP 2 — COUNT THE PLACES IN BOTH NUMBERS</text>
  <text class="fig-note fig-note-key" id="dpPlaces" x="16" y="154">&#160;</text>
  <line class="fig-rule" x1="16" y1="170" x2="384" y2="170"/>
  <text class="fig-digit fig-digit-sum" id="dpAns" x="16" y="200">&#160;</text>
  <text class="fig-note" id="dpCheck" x="16" y="222">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = CASES.map((c, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${c.btn}</button>`).join('');
            root.appendChild(bar);

            const el = k => root.querySelector('#dp' + k);
            const show = i => {
                const c = CASES[i];
                el('Sum').textContent = `${c.a} × ${c.b}`;
                el('Strip').textContent = c.strip;
                el('Places').textContent = c.places;
                el('Ans').textContent = `= ${c.answer}`;
                el('Check').textContent = 'Check: ' + c.check;
                fitText(el('Check'));
                bar.querySelectorAll('button').forEach((b, j) =>
                    b.setAttribute('aria-pressed', String(j === i)));
            };
            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (b) show(Number(b.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- Antecedent arrows ---------- */
/* Agreement is a relationship between two words, and a relationship is the
   thing prose describes worst. The ambiguous case is the reason the figure
   exists: two arrows leaving one pronoun is instantly wrong in a way that
   "the antecedent is unclear" never is. */
function antecedentArrow() {
    const CH = 9;      // width of one character at 15px in this monospace stack
    const X0 = 16, BASE = 74, TOP = 52;

    const CASES = [
        { btn: 'Singular', words: ['The', 'team', 'celebrated', 'its', 'win.'],
          ant: [1], pro: 3,
          note: 'Singular noun, singular pronoun.',
          sub: 'A team is one thing, so it takes "its", not "their".' },
        { btn: 'Plural', words: ['The', 'fighters', 'tightened', 'their', 'wraps.'],
          ant: [1], pro: 3,
          note: 'Plural noun, plural pronoun.',
          sub: 'Two or more, so "their". This one is easy.' },
        { btn: 'The trap', words: ['Everybody', 'brought', 'his', 'own', 'wraps.'],
          ant: [0], pro: 2,
          note: 'Everybody is singular. It only sounds plural.',
          sub: 'Every-, any-, some- and no- words are all singular.' },
        { btn: 'Ambiguous', words: ['When', 'Mario', 'met', 'Luis,', 'he', 'was', 'tired.'],
          ant: [1, 3], pro: 4,
          note: 'Two possible antecedents. Who is "he"?',
          sub: 'Nothing in the sentence decides it. Rewrite, do not guess.' }
    ];

    // Word positions come from character counts, so the arrows land correctly
    // without having to measure rendered text.
    const layout = words => {
        const out = [];
        let x = X0;
        for (const w of words) {
            out.push({ w, x, mid: x + (w.length * CH) / 2 });
            x += (w.length + 1) * CH;
        }
        return out;
    };

    return {
        svg: `
<svg viewBox="0 0 400 146" role="img" aria-labelledby="aaT">
  <title id="aaT">A sentence with an arrow drawn from each pronoun back to the noun it stands for</title>
  <text class="fig-label" x="16" y="20">A PRONOUN POINTS BACKWARDS</text>
  <g id="aaScene"></g>
  <text class="fig-note fig-note-key" id="aaNote" x="16" y="112">&#160;</text>
  <text class="fig-note"              id="aaSub"  x="16" y="132">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = CASES.map((c, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${c.btn}</button>`).join('');
            root.appendChild(bar);

            const scene = root.querySelector('#aaScene');
            const note = root.querySelector('#aaNote');
            const sub = root.querySelector('#aaSub');

            const show = n => {
                const c = CASES[n];
                const pos = layout(c.words);
                const hi = new Set([...c.ant, c.pro]);
                // Two arrows off one pronoun is the ambiguous case: draw both
                // faint and dashed, because neither of them is the answer.
                const unsure = c.ant.length > 1;
                const px = pos[c.pro].mid;

                const arcs = c.ant.map(i => {
                    const ax = pos[i].mid;
                    const h = Math.min(34, Math.abs(px - ax) / 2 + 12);
                    const k = unsure ? ' faint' : '';
                    return `<path class="fig-point${k}" d="M${px} ${TOP} C${px} ${TOP - h} ${ax} ${TOP - h} ${ax} ${TOP}"/>
                            <path class="fig-point-h${k}" d="M-5 -9 L0 0 L5 -9 Z" transform="translate(${ax},${TOP + 1})"/>`;
                }).join('');

                scene.innerHTML = arcs
                    + pos.map((p, i) => `<text class="fig-sent${hi.has(i) ? ' fig-sent-hi' : ''}" x="${p.x}" y="${BASE}">${p.w}</text>`).join('')
                    // Under the pronoun, not above it: the arcs and the figure
                    // label both live in the space overhead.
                    + (unsure ? `<text class="fig-sent fig-sent-hi" x="${px - 4}" y="${BASE + 18}">?</text>` : '');

                note.textContent = c.note;
                sub.textContent = c.sub;
                fitText(note); fitText(sub);
                bar.querySelectorAll('button').forEach((b, j) =>
                    b.setAttribute('aria-pressed', String(j === n)));
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (b) show(Number(b.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- The flag, part by part ---------- */
/* He sees this every school morning. Every element on it is an exam answer,
   and the last case is the one nobody forgets: the flag means something
   different upside down, which almost no other national flag does. */
function phFlag() {
    const CASES = [
        { btn: 'Triangle', pick: ['tri'],
          head: 'The white triangle is the Katipunan',
          body: 'The secret society that started the revolution in 1892.' },
        { btn: 'Eight rays', pick: ['rays', 'sun'],
          head: 'Eight rays for eight provinces',
          body: 'The eight Spain placed under martial law in August 1896.' },
        { btn: 'Three stars', pick: ['stars'],
          head: 'Three stars for the three island groups',
          body: 'Luzon, the Visayas and Mindanao. Week 1, back again.' },
        { btn: 'Turn it over', pick: null, war: true,
          head: 'Red on top means the country is at war',
          body: 'Blue on top in peacetime. Almost no other flag does this.' }
    ];

    return {
        svg: `
<svg viewBox="0 0 400 262" role="img" aria-labelledby="pfT">
  <title id="pfT">The flag of the Philippines, with its triangle, sun, eight rays and three stars</title>
  <g data-p="bands" class="fig-flag-part">
    <rect id="pfTop" class="fig-flag-blue" x="20" y="22" width="360" height="90"/>
    <rect id="pfBot" class="fig-flag-red"  x="20" y="112" width="360" height="90"/>
  </g>
  <path data-p="tri"   class="fig-flag-white fig-flag-part" d="M20 22 L20 202 L175.9 112.0 Z"/>
  <g    data-p="rays"  class="fig-flag-gold fig-flag-part"><path d="M117.0 112.0 L93.0 119.0 L93.0 105.0 Z"/><path d="M103.8 143.8 L81.9 131.8 L91.8 121.9 Z"/><path d="M72.0 157.0 L65.0 133.0 L79.0 133.0 Z"/><path d="M40.1 143.8 L52.2 121.9 L62.1 131.8 Z"/><path d="M27.0 112.0 L51.0 105.0 L51.0 119.0 Z"/><path d="M40.1 80.2 L62.1 92.2 L52.2 102.1 Z"/><path d="M72.0 67.0 L79.0 91.0 L65.0 91.0 Z"/><path d="M103.8 80.2 L91.8 102.1 L81.9 92.2 Z"/></g>
  <circle data-p="sun" class="fig-flag-gold fig-flag-part" cx="72.0" cy="112.0" r="21"/>
  <g    data-p="stars" class="fig-flag-gold fig-flag-part"><path d="M46.0 39.0 L48.2 44.9 L54.6 45.2 L49.6 49.2 L51.3 55.3 L46.0 51.8 L40.7 55.3 L42.4 49.2 L37.4 45.2 L43.8 44.9 Z"/><path d="M46.0 167.0 L48.2 172.9 L54.6 173.2 L49.6 177.2 L51.3 183.3 L46.0 179.8 L40.7 183.3 L42.4 177.2 L37.4 173.2 L43.8 172.9 Z"/><path d="M145.9 103.0 L148.1 108.9 L154.4 109.2 L149.5 113.2 L151.2 119.3 L145.9 115.8 L140.6 119.3 L142.3 113.2 L137.3 109.2 L143.7 108.9 Z"/></g>
  <rect class="fig-flag-edge" x="20" y="22" width="360" height="180"/>
  <text class="fig-note fig-note-key" id="pfHead" x="20" y="228">&#160;</text>
  <text class="fig-note"              id="pfBody" x="20" y="248">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = CASES.map((c, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${c.btn}</button>`).join('');
            root.appendChild(bar);

            const head = root.querySelector('#pfHead');
            const body = root.querySelector('#pfBody');
            const parts = [...root.querySelectorAll('[data-p]')];
            const top = root.querySelector('#pfTop');
            const bot = root.querySelector('#pfBot');

            const show = n => {
                const c = CASES[n];
                // pick: null means the whole flag stays lit — the last case is
                // about the flag as a whole, not about one piece of it.
                parts.forEach(p => p.classList.toggle('dim', !!c.pick && !c.pick.includes(p.dataset.p)));
                top.setAttribute('class', c.war ? 'fig-flag-red' : 'fig-flag-blue');
                bot.setAttribute('class', c.war ? 'fig-flag-blue' : 'fig-flag-red');
                head.textContent = c.head;
                body.textContent = c.body;
                fitText(head); fitText(body);
                bar.querySelectorAll('button').forEach((b, j) =>
                    b.setAttribute('aria-pressed', String(j === n)));
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (b) show(Number(b.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- The airway, nose to alveoli ---------- */
function airwayPath() {
    const box = (x, y, w, t) =>
        `<rect class="fig-organ" x="${x}" y="${y}" width="${w}" height="32" rx="9"/>
         <text class="fig-organ-t" x="${x + w / 2}" y="${y + 21}" text-anchor="middle">${t}</text>`;

    return steppedPath({
        id: 'ap',
        viewBox: '0 0 400 206',
        labels: {
            x: 20, y: 18, text: 'ONE ROUTE, SIX STOPS', capY: 170,
            alt: 'The path air takes from the nose through the pharynx, larynx, trachea and bronchi to the alveoli'
        },
        scene: box(20, 34, 86, 'NOSE') + box(140, 34, 104, 'PHARYNX') + box(278, 34, 94, 'LARYNX')
             + box(278, 106, 94, 'TRACHEA') + box(140, 106, 104, 'BRONCHI') + box(20, 106, 86, 'ALVEOLI'),
        segs: [
            { d: 'M108 50 L134 50',   tip: '134,50',  rot: 0 },
            { d: 'M246 50 L272 50',   tip: '272,50',  rot: 0 },
            { d: 'M325 68 L325 100',  tip: '325,100', rot: 90 },
            { d: 'M276 122 L248 122', tip: '248,122', rot: 180 },
            { d: 'M138 122 L110 122', tip: '110,122', rot: 180 }
        ],
        steps: [
            { btn: '1 Nose',    head: 'Nose and mouth',
              body: 'Air is warmed, moistened and filtered on the way in.' },
            { btn: '2 Pharynx', head: 'Pharynx — the throat',
              body: 'The only part shared by food and air.' },
            { btn: '3 Larynx',  head: 'Larynx — the voice box',
              body: 'The epiglottis shuts it every time you swallow.' },
            { btn: '4 Trachea', head: 'Trachea — the windpipe',
              body: 'C-shaped cartilage rings stop it collapsing.' },
            { btn: '5 Bronchi', head: 'Bronchi, then bronchioles',
              body: 'One tube into each lung, then thousands of branches.' },
            { btn: '6 Alveoli', head: 'Alveoli — where it actually happens',
              body: 'Hundreds of millions of tiny sacs. This is the point of all of it.' }
        ]
    });
}

/* ---------- How breathing in actually works ---------- */
/* The misconception this exists to kill: nobody sucks air in. You make the
   space bigger, the pressure inside drops, and the atmosphere pushes air in.
   Seeing the diaphragm flatten while the arrow points inward does the work. */
function breathingMech() {
    // Deliberately exaggerated: a flat low diaphragm against a high dome, and
    // a clear size difference in the lungs. A faithful-but-subtle drawing
    // teaches nothing, because the whole point is the contrast between states.
    const lungs = inhale =>
        `<ellipse class="fig-lung" cx="148" cy="104" rx="${inhale ? 50 : 40}" ry="${inhale ? 60 : 44}"/>
         <ellipse class="fig-lung" cx="252" cy="104" rx="${inhale ? 50 : 40}" ry="${inhale ? 60 : 44}"/>`;

    return {
        svg: `
<svg viewBox="0 0 400 296" role="img" aria-labelledby="bmT">
  <title id="bmT">The diaphragm flattening to draw air in, and doming upward to push it out</title>
  <text class="fig-label" x="20" y="20">NOBODY SUCKS AIR IN</text>

  <rect class="fig-pump"  x="70"  y="38" width="260" height="178" rx="20"/>
  <rect class="fig-organ" x="190" y="4"  width="20"  height="42"  rx="6"/>

  <g id="bmIn" class="fig-breath">
    ${lungs(true)}
    <path class="fig-dia" d="M84 208 L316 208"/>
    <path class="fig-air" d="M200 12 L200 30"/>
    <path class="fig-airh" d="M-6 -11 L0 0 L6 -11 Z" transform="translate(200,38)"/>
  </g>

  <g id="bmOut" class="fig-breath">
    ${lungs(false)}
    <path class="fig-dia" d="M84 208 Q200 92 316 208"/>
    <path class="fig-air" d="M200 38 L200 20"/>
    <path class="fig-airh" d="M-6 11 L0 0 L6 11 Z" transform="translate(200,12)"/>
  </g>

  <text class="fig-note fig-note-key" id="bmHead" x="20" y="244">&#160;</text>
  <text class="fig-note" id="bmA" x="20" y="264">&#160;</text>
  <text class="fig-note" id="bmB" x="20" y="282">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = `
                <button data-k="in"  aria-pressed="true">Breathe in</button>
                <button data-k="out" aria-pressed="false">Breathe out</button>`;
            root.appendChild(bar);

            const IN = {
                head: 'Breathing in is muscular work',
                a: 'Diaphragm contracts and flattens · chest volume rises',
                b: 'Pressure inside drops, so the air outside pushes in.'
            };
            const OUT = {
                head: 'Breathing out at rest is free',
                a: 'Diaphragm relaxes and domes up · chest volume falls',
                b: 'Pressure inside rises, so the air is pushed back out.'
            };

            const gIn = root.querySelector('#bmIn');
            const gOut = root.querySelector('#bmOut');
            const head = root.querySelector('#bmHead');
            const a = root.querySelector('#bmA');
            const b = root.querySelector('#bmB');

            const show = k => {
                const m = k === 'in' ? IN : OUT;
                gIn.classList.toggle('show', k === 'in');
                gOut.classList.toggle('show', k === 'out');
                head.textContent = m.head;
                a.textContent = m.a;
                b.textContent = m.b;
                fitText(head); fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach(x =>
                    x.setAttribute('aria-pressed', String(x.dataset.k === k)));
            };

            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(btn.dataset.k);
            });
            show('in');
        }
    };
}

/* ---------- Comparing decimals, column by column ---------- */
/* One error accounts for most lost marks here: reading 0.45 as bigger than
   0.5 because 45 is bigger than 5. Padding both numbers to the same length
   and lighting up the first column that differs makes the real rule visible
   — you compare from the left, and you stop at the first difference. */
function compareDecimals() {
    const CH = 13, X0 = 46, R1 = 78, R2 = 114;

    const CASES = [
        { btn: '0.5 vs 0.45',   a: '0.5',    b: '0.45',
          note: 'More digits does not mean bigger.' },
        { btn: '3.07 vs 3.7',   a: '3.07',   b: '3.7',
          note: 'The tenths column settles it before you reach the rest.' },
        { btn: '12.48 vs 12.480', a: '12.48', b: '12.480',
          note: 'A zero on the end changes nothing at all.' }
    ];

    // Pad both numbers to the same number of decimal places, so the columns
    // line up and can honestly be compared one at a time.
    const pad = (a, b) => {
        const dp = x => (x.split('.')[1] || '').length;
        const n = Math.max(dp(a), dp(b));
        const fix = x => {
            const [i, d = ''] = x.split('.');
            return n ? `${i}.${d.padEnd(n, '0')}` : i;
        };
        return [fix(a), fix(b)];
    };

    return {
        svg: `
<svg viewBox="0 0 400 216" role="img" aria-labelledby="cdT">
  <title id="cdT">Two decimals padded to the same length, with the first column that differs highlighted</title>
  <text class="fig-label" x="20" y="20">COMPARE FROM THE LEFT</text>
  <rect class="fig-col" id="cdCol" x="0" y="0" width="0" height="0"/>
  <text class="fig-mono" id="cdA" x="${X0}" y="${R1}">&#160;</text>
  <text class="fig-mono" id="cdB" x="${X0}" y="${R2}">&#160;</text>
  <text class="fig-step" id="cdWhy"  x="20" y="150">&#160;</text>
  <text class="fig-note fig-note-key" id="cdVerdict" x="20" y="176">&#160;</text>
  <text class="fig-note" id="cdNote" x="20" y="198">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = CASES.map((c, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${c.btn}</button>`).join('');
            root.appendChild(bar);

            const el = k => root.querySelector('#cd' + k);
            const col = el('Col');

            const show = i => {
                const c = CASES[i];
                const [A, B] = pad(c.a, c.b);
                el('A').textContent = A;
                el('B').textContent = B;

                let k = 0;
                while (k < A.length && A[k] === B[k]) k++;

                if (k === A.length) {
                    col.setAttribute('width', '0');
                    el('Why').textContent = 'EVERY COLUMN MATCHES';
                    el('Verdict').textContent = `${c.a} and ${c.b} are the same number`;
                } else {
                    col.setAttribute('x', X0 + k * CH - 3);
                    col.setAttribute('y', R1 - 24);
                    col.setAttribute('width', CH + 6);
                    col.setAttribute('height', R2 - R1 + 32);
                    const bigger = Number(A) > Number(B) ? c.a : c.b;
                    el('Why').textContent = 'FIRST COLUMN THAT DIFFERS — STOP HERE';
                    el('Verdict').textContent = `${bigger} is the bigger number`;
                }
                el('Note').textContent = c.note;
                fitText(el('Why')); fitText(el('Verdict')); fitText(el('Note'));

                bar.querySelectorAll('button').forEach((b, j) =>
                    b.setAttribute('aria-pressed', String(j === i)));
            };

            bar.addEventListener('click', e => {
                const b = e.target.closest('button');
                if (b) show(Number(b.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- Possessive determiners against possessive pronouns ---------- */
/* Seven pairs he has to know cold, and two facts that hide inside the table:
   "his" is the same word twice, and "its" has no pronoun form at all. A table
   shows both of those at a glance; a list of rules does not. */
function possessivePairs() {
    const ROWS = [
        { det: 'my',    pro: 'mine',
          a: 'That is my helmet.',        b: 'That helmet is mine.' },
        { det: 'your',  pro: 'yours',
          a: 'Is this your seat?',        b: 'Is this seat yours?' },
        { det: 'his',   pro: 'his',
          a: 'His gloves are new.',       b: 'The new gloves are his.' },
        { det: 'her',   pro: 'hers',
          a: 'Her lap time was faster.',  b: 'The faster time was hers.' },
        { det: 'its',   pro: '—',
          a: 'The car lost its grip.',    b: 'There is no pronoun form. And never it’s.' },
        { det: 'our',   pro: 'ours',
          a: 'Our team won.',             b: 'The win was ours.' },
        { det: 'their', pro: 'theirs',
          a: 'Their car broke down.',     b: 'The broken car was theirs.' }
    ];
    const Y0 = 76, DY = 25, XD = 54, XP = 214;

    return {
        svg: `
<svg viewBox="0 0 400 322" role="img" aria-labelledby="ppT">
  <title id="ppT">A table of possessive determiners beside the matching possessive pronouns</title>
  <text class="fig-label" x="20" y="20">NONE OF THESE TAKE AN APOSTROPHE</text>
  <text class="fig-step" x="${XD}" y="52">BEFORE A NOUN</text>
  <text class="fig-step" x="${XP}" y="52">STANDS ALONE</text>
  <line class="fig-rule" x1="20" y1="60" x2="380" y2="60"/>
  <rect class="fig-row-hi" id="ppHi" x="24" y="0" width="352" height="0" rx="6"/>
  ${ROWS.map((r, i) => `
  <text class="fig-cell" x="${XD}" y="${Y0 + i * DY}">${r.det}</text>
  <text class="fig-cell${r.pro === '—' ? ' off' : ''}" x="${XP}" y="${Y0 + i * DY}">${r.pro}</text>
  <rect class="fig-row" data-i="${i}" x="24" y="${Y0 + i * DY - 18}" width="352" height="${DY}"/>`).join('')}
  <text class="fig-note fig-note-key" id="ppA" x="20" y="278">&#160;</text>
  <text class="fig-note"              id="ppB" x="20" y="300">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = ROWS.map((r, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${r.det}</button>`).join('');
            root.appendChild(bar);

            const hi = root.querySelector('#ppHi');
            const a = root.querySelector('#ppA');
            const b = root.querySelector('#ppB');

            const show = i => {
                hi.setAttribute('y', Y0 + i * DY - 19);
                hi.setAttribute('height', DY);
                a.textContent = ROWS[i].a;
                b.textContent = ROWS[i].b;
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === i)));
            };

            const pick = e => {
                const t = e.target.closest('[data-i]');
                if (t) show(Number(t.dataset.i));
            };
            bar.addEventListener('click', pick);
            root.querySelector('svg').addEventListener('click', pick);
            show(0);
        }
    };
}

/* Week 4: one life, and the five dates the exam wants from it. */
function rizalLife() {
    return timeline({
        id: 'rz', label: 'ONE LIFE, THIRTY-FIVE YEARS',
        alt: 'A timeline of Jose Rizal from his birth in 1861 to his execution in 1896',
        stops: [
            { year: '1861', tag: 'born',
              head: 'Born in Calamba, Laguna',
              body: 'The seventh of eleven children.' },
            { year: '1887', tag: 'Noli',
              head: 'Noli Me Tangere is published',
              body: 'Written in Berlin. Banned in the Philippines.' },
            { year: '1891', tag: 'Fili',
              head: 'El Filibusterismo is published',
              body: 'Darker, angrier, and dedicated to GomBurZa.' },
            { year: '1892', tag: 'Dapitan',
              head: 'La Liga Filipina, then exile',
              body: 'Founded 3 July. Arrested 6 July. Four years in Dapitan.' },
            { year: '1896', tag: 'Bagumbayan',
              head: 'Executed by firing squad',
              body: '30 December, aged 35. The revolution had already started.' }
        ]
    });
}

/* ---------- A picked list with two caption lines ---------- */
/* Used wherever the content is "here are N things, and each one has a fact
   and a consequence". One row lit at a time; the rows are tappable as well
   as the buttons, because a row is the bigger target on a phone. */
function listPicker({ id, label, alt, rows, capA = '', capB = '', height = 296, y0 = 60, dy = 26 }) {
    return {
        svg: `
<svg viewBox="0 0 400 ${height}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="20">${label}</text>
  <line class="fig-rule" x1="20" y1="38" x2="380" y2="38"/>
  <rect class="fig-row-hi" id="${id}Hi" x="24" y="0" width="352" height="0" rx="6"/>
  ${rows.map((r, i) => `
  <text class="fig-cell" x="54" y="${y0 + i * dy}">${i + 1}. ${r.short}</text>
  <rect class="fig-row" data-i="${i}" x="24" y="${y0 + i * dy - 18}" width="352" height="${dy}"/>`).join('')}
  <text class="fig-note fig-note-key" id="${id}A" x="20" y="${height - 48}">&#160;</text>
  <text class="fig-note"              id="${id}B" x="20" y="${height - 24}">&#160;</text>
</svg>`,

        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = rows.map((r, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${r.btn ?? i + 1}</button>`).join('');
            root.appendChild(bar);

            const hi = root.querySelector(`#${id}Hi`);
            const a = root.querySelector(`#${id}A`);
            const b = root.querySelector(`#${id}B`);

            const show = i => {
                hi.setAttribute('y', y0 + i * dy - 19);
                hi.setAttribute('height', dy);
                a.textContent = capA + rows[i].a;
                b.textContent = capB + rows[i].b;
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === i)));
            };

            const pick = e => {
                const t = e.target.closest('[data-i]');
                if (t) show(Number(t.dataset.i));
            };
            bar.addEventListener('click', pick);
            root.querySelector('svg').addEventListener('click', pick);
            show(0);
        }
    };
}

/* ---------- What the reformers asked for, and what they got ---------- */
/* The list of demands is easy to memorise and easy to misread as a list of
   things that happened. Pairing each one with the outcome is the argument of
   the whole topic: twenty years of asking, and the second line never changes. */
function reformDemands() {
    return listPicker({
        id: 'rd', label: 'SIX DEMANDS · TWENTY YEARS',
        alt: 'The six reform demands, each paired with what Spain actually did about it',
        capA: 'Asked: ', capB: 'Got: ',
        rows: [
            { short: 'A province of Spain',
              a: 'Make the Philippines a province, not a colony',
              b: 'Never granted. It stayed a colony to the end.' },
            { short: 'Seats in the Cortes',
              a: 'Restore Filipino seats in the Spanish parliament',
              b: 'It existed briefly before 1837. Never restored.' },
            { short: 'Filipino priests',
              a: 'Hand the parishes to Filipino secular priests',
              b: 'Refused. The Spanish friars kept them.' },
            { short: 'Equality in law',
              a: 'Treat Filipinos and Spaniards equally in law',
              b: 'Refused. The ranking held until 1898.' },
            { short: 'Free speech',
              a: 'Freedom of speech, press and assembly',
              b: 'Spaniards had these in Spain. The colony never did.' },
            { short: 'End forced labour',
              a: 'Abolish the polo, the forced labour service',
              b: 'Cut from forty days to fifteen. Never abolished.' }
        ]
    });
}

/* ==========================================================================
   MAPEH FIGURES.
   Two of these are about seeing rather than reading — the elements of art
   and the styles — so they draw the thing instead of naming it. A lesson
   about texture that shows no texture is not a lesson about texture.
   ========================================================================== */

/** One demo group at a time, cross-faded. Shared by the three below. */
function demoSwitch({ id, label, alt, height, demos, capY }) {
    return {
        svg: `
<svg viewBox="0 0 400 ${height}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="20">${label}</text>
  ${demos.map((d, i) => `<g class="fig-demo" data-d="${i}">${d.svg}</g>`).join('')}
  <text class="fig-note fig-note-key" id="${id}A" x="20" y="${capY}">&#160;</text>
  <text class="fig-note"              id="${id}B" x="20" y="${capY + 22}">&#160;</text>
</svg>`,
        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = demos.map((d, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${d.btn}</button>`).join('');
            root.appendChild(bar);

            const groups = [...root.querySelectorAll('[data-d]')];
            const a = root.querySelector(`#${id}A`);
            const b = root.querySelector(`#${id}B`);

            const show = i => {
                groups.forEach((g, j) => g.classList.toggle('show', j === i));
                a.textContent = demos[i].a;
                b.textContent = demos[i].b;
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === i)));
            };
            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(Number(btn.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- PE: self-space, general space, levels, pathways ---------- */
const stick = (x, y, s = 1) => `
  <g class="fig-body" transform="translate(${x},${y}) scale(${s})">
    <circle cx="0" cy="-26" r="7"/>
    <rect x="-3" y="-19" width="6" height="20" rx="3"/>
    <rect x="-14" y="-16" width="28" height="5" rx="2.5"/>
    <rect x="-9" y="0" width="6" height="18" rx="3"/>
    <rect x="3" y="0" width="6" height="18" rx="3"/>
  </g>`;

function spaceAwareness() {
    const arena = '<rect class="fig-arena" x="24" y="36" width="352" height="150" rx="10"/>';
    return demoSwitch({
        id: 'sa', height: 268, capY: 214,
        label: 'WHERE THE BODY MOVES',
        alt: 'Self space, general space, levels, pathways and directions, shown one at a time',
        demos: [
            { btn: 'Self space',
              svg: arena + `<circle class="fig-bubble" cx="200" cy="118" r="58"/>` + stick(200, 122),
              a: 'Self space is what you can reach without moving',
              b: 'Your own space. Nobody else should be inside it.' },
            { btn: 'General space',
              svg: arena
                 + `<path class="fig-track-d" d="M70 160 C120 60 190 180 250 90 S340 150 350 70"/>`
                 + stick(70, 164, .8) + stick(350, 74, .8),
              a: 'General space is the area you travel through',
              b: 'Shared with everyone. Avoiding collisions happens here.' },
            { btn: 'Levels',
              svg: `<rect class="fig-band" x="24" y="36" width="352" height="50"/>
                    <rect class="fig-band" x="24" y="86" width="352" height="50"/>
                    <rect class="fig-band" x="24" y="136" width="352" height="50"/>
                    <text class="fig-step" x="34" y="60">HIGH</text>
                    <text class="fig-step" x="34" y="110">MEDIUM</text>
                    <text class="fig-step" x="34" y="160">LOW</text>`
                 + stick(160, 78, .7) + stick(230, 128, .7) + stick(300, 178, .7),
              a: 'Three levels: high, medium and low',
              b: 'Reaching up, standing, and crouching or lying down.' },
            { btn: 'Pathways',
              svg: arena
                 + `<path class="fig-track" d="M60 66 L340 66"/>
                    <path class="fig-track" d="M60 118 C130 78 250 158 340 118"/>
                    <path class="fig-track" d="M60 170 L120 142 L180 170 L240 142 L300 170 L340 150"/>
                    <text class="fig-step" x="60" y="56">STRAIGHT</text>
                    <text class="fig-step" x="60" y="108">CURVED</text>
                    <text class="fig-step" x="60" y="134">ZIGZAG</text>`,
              a: 'Pathways: straight, curved and zigzag',
              b: 'The shape of the line you travel along.' },
            { btn: 'Directions',
              svg: arena
                 + `<g class="fig-track">
                      <path d="M200 110 L200 60"/><path d="M200 126 L200 176"/>
                      <path d="M192 118 L110 118"/><path d="M208 118 L290 118"/>
                    </g>
                    <text class="fig-step" x="200" y="52" text-anchor="middle">UP / FORWARD</text>
                    <text class="fig-step" x="90"  y="122" text-anchor="end">LEFT</text>
                    <text class="fig-step" x="300" y="122">RIGHT</text>
                    <text class="fig-step" x="200" y="192" text-anchor="middle">DOWN / BACK</text>`
                 + stick(200, 128, .55),
              a: 'Directions: forward, back, sideways, up, down',
              b: 'Where you go from where you are standing now.' }
        ]
    });
}

/* ---------- Art: the seven elements, each one drawn ---------- */
function artElements() {
    const HUES = ['#C0392B', '#E08A1E', '#E3C020', '#3F8F4A', '#2E6DA4', '#6B4A9B'];
    const wheel = HUES.map((h, i) => {
        const a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180;
        const R = 52, cx = 200, cy = 112;
        return `<path fill="${h}" d="M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z"/>`;
    }).join('');

    const steps = [...Array(6)].map((_, i) =>
        `<rect x="${86 + i * 38}" y="88" width="38" height="48" fill="hsl(30 8% ${92 - i * 15}%)"/>`).join('');

    const hatch = [...Array(14)].map((_, i) =>
        `<path class="fig-hatch" d="M${96 + i * 8} 84 L${80 + i * 8} 140"/>`).join('');
    const dots = [...Array(5)].flatMap((_, r) => [...Array(6)].map((_, c) =>
        `<circle class="fig-ink-fill" cx="${232 + c * 15}" cy="${88 + r * 13}" r="${1.4 + (r % 3)}"/>`)).join('');

    return demoSwitch({
        id: 'ae', height: 250, capY: 196,
        label: 'THE SEVEN ELEMENTS OF ART',
        alt: 'Line, shape, form, space, colour, value and texture, each one drawn as an example',
        demos: [
            { btn: 'Line',
              svg: `<g class="fig-ink">
                      <path d="M70 70 L330 70" stroke-width="1"/>
                      <path d="M70 92 L330 92" stroke-width="4"/>
                      <path d="M70 116 C140 86 260 146 330 116" stroke-width="2.5"/>
                      <path d="M70 142 L110 158 L150 138 L190 158 L230 138 L270 158 L310 138" stroke-width="2.5"/>
                    </g>`,
              a: 'Line — the path a point takes',
              b: 'Thin or thick, straight or curved. Everything starts here.' },
            { btn: 'Shape',
              svg: `<g class="fig-ink" stroke-width="2.5">
                      <circle cx="110" cy="114" r="38"/>
                      <rect x="172" y="76" width="76" height="76"/>
                      <path d="M290 76 L332 152 L248 152 Z"/>
                    </g>`,
              a: 'Shape — flat, and measured two ways',
              b: 'Height and width only. No thickness at all.' },
            { btn: 'Form',
              svg: `<g class="fig-ink" stroke-width="2.5">
                      <rect x="80" y="92" width="66" height="66"/>
                      <path d="M80 92 L108 66 L174 66 L146 92"/>
                      <path d="M146 158 L174 132 L174 66"/>
                      <circle cx="286" cy="118" r="42"/>
                    </g>
                    <circle cx="188" cy="106" r="30" fill="var(--ink-soft)" opacity=".18"/>`,
              a: 'Form — shape with depth added',
              b: 'A square becomes a cube. A circle becomes a sphere.' },
            { btn: 'Space',
              svg: `<rect class="fig-neg" x="70" y="70" width="260" height="90"/>
                    <circle class="fig-ink-fill" cx="150" cy="130" r="34"/>
                    <circle class="fig-ink-fill" cx="240" cy="102" r="18" opacity=".55"/>
                    <text class="fig-step" x="150" y="176" text-anchor="middle">NEAR</text>
                    <text class="fig-step" x="240" y="176" text-anchor="middle">FAR</text>`,
              a: 'Space — the area around and between things',
              b: 'Bigger and lower reads as nearer. That is depth.' },
            { btn: 'Colour',
              svg: wheel + `<circle cx="200" cy="112" r="52" fill="none" stroke="var(--ink-faint)" stroke-width="1.5"/>`,
              a: 'Colour — hue, and how light or strong it is',
              b: 'Red, orange, yellow, green, blue, violet. Then all the mixes.' },
            { btn: 'Value',
              svg: steps + `<rect x="86" y="88" width="228" height="48" fill="none" stroke="var(--ink-faint)" stroke-width="1.5"/>
                    <text class="fig-step" x="86" y="154">LIGHT</text>
                    <text class="fig-step" x="314" y="154" text-anchor="end">DARK</text>`,
              a: 'Value — how light or dark something is',
              b: 'Take the colour away and this is what is left.' },
            { btn: 'Texture',
              svg: hatch + dots + `<text class="fig-step" x="88" y="158">HATCHED</text>
                    <text class="fig-step" x="232" y="158">STIPPLED</text>`,
              a: 'Texture — how a surface would feel',
              b: 'Or how it looks as if it would feel, which is the artist trick.' }
        ]
    });
}

/* ---------- Art: one subject, three styles ---------- */
/* The same bahay kubo three times. Comparing styles across three different
   subjects teaches nothing; holding the subject still is the whole method. */
function artStyles() {
    return demoSwitch({
        id: 'as', height: 250, capY: 196,
        label: 'ONE SUBJECT, THREE STYLES',
        alt: 'A nipa hut drawn realistically, then stylised, then abstracted',
        demos: [
            { btn: 'Realistic',
              svg: `<g class="fig-ink" stroke-width="2">
                      <path d="M130 96 L200 54 L270 96"/>
                      <path d="M136 96 L264 96"/>
                      <path d="M146 96 L146 158 M254 96 L254 158 M146 158 L254 158"/>
                      <path d="M186 158 L186 122 L214 122 L214 158"/>
                      <path d="M120 158 L280 158"/>
                      <path d="M158 168 L158 158 M242 168 L242 158"/>
                    </g>
                    <g class="fig-hatch">
                      <path d="M150 92 L186 66"/><path d="M162 92 L198 66"/><path d="M174 92 L210 66"/>
                      <path d="M186 92 L222 66"/><path d="M198 92 L234 66"/><path d="M210 92 L246 66"/>
                      <path d="M222 96 L250 76"/><path d="M234 96 L256 82"/>
                      <path d="M152 110 L152 150"/><path d="M160 110 L160 150"/><path d="M168 110 L168 150"/>
                    </g>`,
              a: 'Realistic — drawn as the eye would see it',
              b: 'Proportions, shading and detail all kept.' },
            { btn: 'Stylised',
              svg: `<path fill="var(--accent)" fill-opacity=".85" d="M124 98 L200 50 L276 98 Z"/>
                    <rect x="148" y="98" width="104" height="62" fill="var(--accent)" fill-opacity=".35"/>
                    <rect x="186" y="122" width="28" height="38" fill="var(--surface)"/>
                    <rect x="120" y="160" width="160" height="6" rx="3" fill="var(--ink-faint)"/>`,
              a: 'Stylised — simplified on purpose',
              b: 'Still clearly a house. Detail dropped, not lost.' },
            { btn: 'Abstract',
              svg: `<path fill="var(--accent)" fill-opacity=".8" d="M96 76 L172 40 L188 104 Z"/>
                    <rect x="196" y="58" width="70" height="70" transform="rotate(14 231 93)" fill="var(--notyet)" fill-opacity=".5"/>
                    <circle cx="150" cy="140" r="30" fill="var(--accent)" fill-opacity=".3"/>
                    <path class="fig-ink" stroke-width="3" d="M244 126 L318 166"/>
                    <rect x="272" y="72" width="18" height="76" fill="var(--ink-soft)" opacity=".5"/>`,
              a: 'Abstract — the shapes kept, the subject let go',
              b: 'Triangle, square, circle. You are meant to feel it, not name it.' }
        ]
    });
}

/* ---------- Six genres, and where each one is from ---------- */
function worldGenres() {
    return listPicker({
        id: 'wg', label: 'SIX GENRES · SIX PLACES',
        alt: 'Six music genres with the country each comes from and what it sounds like',
        capA: 'From: ', capB: '',
        rows: [
            { btn: 'Reggae', short: 'Reggae', a: 'Jamaica, from the 1960s',
              b: 'Guitar chops on the offbeat; the bass leads.' },
            { btn: 'Samba', short: 'Samba', a: 'Brazil',
              b: 'Layers of percussion over a fast two-beat pulse.' },
            { btn: 'Flamenco', short: 'Flamenco', a: 'Andalusia, in southern Spain',
              b: 'Guitar, handclaps and a singer, counted in cycles.' },
            { btn: 'Hip hop', short: 'Hip hop', a: 'The Bronx, New York, in the 1970s',
              b: 'Built from DJs looping the drum break in a record.' },
            { btn: 'K-pop', short: 'K-pop', a: 'South Korea, from the 1990s',
              b: 'Groups, choreography and video, made to travel.' },
            { btn: 'Gamelan', short: 'Gamelan', a: 'Indonesia',
              b: 'An orchestra of tuned bronze gongs and metal keys.' }
        ]
    });
}

/* ---------- Filipino folk forms and instruments ---------- */
function pinoyMusic() {
    return listPicker({
        id: 'pm', label: 'SIX FILIPINO FORMS',
        alt: 'Six Filipino folk music forms and instruments, with what each one is',
        capA: '', capB: '',
        rows: [
            { btn: 'Kundiman', short: 'Kundiman',
              a: 'A love song that is often about the country',
              b: 'Usually in three-time, opening minor and turning major.' },
            { btn: 'Harana', short: 'Harana',
              a: 'A serenade, sung outside a window at night',
              b: 'One singer, one guitar, and a set of polite rules.' },
            { btn: 'Balitaw', short: 'Balitaw',
              a: 'A Visayan song and dance for two singers',
              b: 'Often improvised on the spot, as a courtship argument.' },
            { btn: 'Kulintang', short: 'Kulintang',
              a: 'A row of small bronze gongs, from Mindanao',
              b: 'Played with two sticks, inside an ensemble of larger gongs.' },
            { btn: 'Rondalla', short: 'Rondalla',
              a: 'A plucked string band, brought in under Spain',
              b: 'Bandurria, laud, octavina, guitar and bass.' },
            { btn: 'Tinikling', short: 'Tinikling',
              a: 'A dance stepped between two bamboo poles',
              b: 'From Leyte. Named after the tikling bird.' }
        ]
    });
}

/* ==========================================================================
   TLE FIGURES.
   This subject is the one where the lesson has to survive contact with an
   actual bedroom, so the figures show the physical steps rather than the
   principle behind them. A folding diagram is worth more than a paragraph
   about folding.
   ========================================================================== */

/* ---------- Where does this thing go? ---------- */
/* The decision, not the tidying, is what stalls people. Four outcomes and
   one question each. Lighting the path taken is the whole figure. */
function sortFlow() {
    const box = (id, x, y, w, t, sub = '') =>
        `<rect class="fig-box" data-b="${id}" x="${x}" y="${y}" width="${w}" height="34" rx="8"/>
         <text class="fig-organ-t" data-b="${id}" x="${x + w / 2}" y="${y + (sub ? 16 : 22)}" text-anchor="middle">${t}</text>
         ${sub ? `<text class="fig-note" data-b="${id}" x="${x + w / 2}" y="${y + 29}" text-anchor="middle">${sub}</text>` : ''}`;

    const scene =
        box('q', 130, 30, 140, 'PICK IT UP') +
        `<path class="fig-flow" data-f="q" d="M200 64 L200 84"/>` +
        box('use', 90, 84, 220, 'Used it in the last year?') +
        `<path class="fig-flow" data-f="yes" d="M150 118 L150 140 L96 140 L96 158"/>
         <path class="fig-flow" data-f="no"  d="M250 118 L250 140 L304 140 L304 158"/>
         <text class="fig-step" x="126" y="136">YES</text>
         <text class="fig-step" x="258" y="136">NO</text>` +
        box('home', 22, 158, 148, 'KEEP', 'give it one home') +
        box('out', 230, 158, 148, 'LET IT GO', 'donate, sell or bin');

    return {
        svg: `
<svg viewBox="0 0 400 258" role="img" aria-labelledby="sfT">
  <title id="sfT">A decision flow for one object: pick it up, ask if you used it, then keep it or let it go</title>
  <text class="fig-label" x="20" y="18">ONE OBJECT AT A TIME</text>
  ${scene}
  <text class="fig-note fig-note-key" id="sfA" x="20" y="222">&#160;</text>
  <text class="fig-note"              id="sfB" x="20" y="244">&#160;</text>
</svg>`,

        bind(root) {
            const STEPS = [
                { btn: '1 Pick up', on: ['q'], flow: [],
                  a: 'Pick up one object. Only one.',
                  b: 'Deciding about a whole pile at once is why people stop.' },
                { btn: '2 Ask', on: ['q', 'use'], flow: ['q'],
                  a: 'Have I used this in the last year?',
                  b: 'One question, and it is not "might I ever need it".' },
                { btn: '3 Keep', on: ['use', 'home'], flow: ['yes'],
                  a: 'Yes — give it one home, and always put it back',
                  b: 'A thing without a home becomes clutter again by Friday.' },
                { btn: '4 Let go', on: ['use', 'out'], flow: ['no'],
                  a: 'No — donate it, sell it, or bin it today',
                  b: 'Out of the room the same day, or it quietly comes back.' }
            ];

            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = STEPS.map((s, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${s.btn}</button>`).join('');
            root.appendChild(bar);

            const a = root.querySelector('#sfA');
            const b = root.querySelector('#sfB');

            const show = n => {
                const s = STEPS[n];
                root.querySelectorAll('[data-b]').forEach(el => {
                    const on = s.on.includes(el.dataset.b);
                    if (el.tagName === 'rect') el.setAttribute('class', on ? 'fig-box-on' : 'fig-box');
                    else el.style.opacity = on ? '1' : '.35';
                });
                root.querySelectorAll('[data-f]').forEach(el =>
                    el.setAttribute('class', s.flow.includes(el.dataset.f) ? 'fig-flow on' : 'fig-flow'));
                a.textContent = s.a;
                b.textContent = s.b;
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === n)));
            };
            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(Number(btn.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- Making a bed, layer by layer ---------- */
function bedLayers() {
    const base = `
      <rect class="fig-box" x="60" y="96" width="280" height="70" rx="6"/>
      <rect class="fig-box" x="52" y="150" width="296" height="16" rx="4"/>
      <text class="fig-step" x="200" y="188" text-anchor="middle">MATTRESS ON THE BASE</text>`;
    const sheet = (y, h, cls, label, ly) =>
        `<rect class="${cls}" x="58" y="${y}" width="284" height="${h}" rx="5"/>
         <text class="fig-step" x="200" y="${ly}" text-anchor="middle">${label}</text>`;

    return demoSwitch({
        id: 'bl', height: 250, capY: 202,
        label: 'FOUR LAYERS, IN ORDER',
        alt: 'A bed built up in four steps: fitted sheet, flat sheet, blanket and pillows',
        demos: [
            { btn: '1 Fitted',
              svg: base + sheet(92, 74, 'fig-cloth', 'FITTED SHEET · CORNERS TUCKED', 84),
              a: 'Fitted sheet first, all four corners pulled on',
              b: 'Do the two far corners first. Everything else gets easier.' },
            { btn: '2 Flat',
              svg: base + sheet(92, 74, 'fig-cloth', '', 84)
                 + sheet(84, 66, 'fig-cloth', 'FLAT SHEET · WRONG SIDE UP', 76),
              a: 'Flat sheet next, patterned side facing down',
              b: 'The top gets folded back, so the pattern shows.' },
            { btn: '3 Blanket',
              svg: base + sheet(92, 74, 'fig-cloth', '', 84) + sheet(84, 66, 'fig-cloth', '', 76)
                 + sheet(78, 62, 'fig-cloth', 'BLANKET · FOLD THE SHEET BACK OVER IT', 70),
              a: 'Blanket on top, then fold the sheet edge back over it',
              b: 'That fold is what stops the blanket touching your face.' },
            { btn: '4 Pillows',
              svg: base + sheet(92, 74, 'fig-cloth', '', 84) + sheet(84, 66, 'fig-cloth', '', 76)
                 + sheet(78, 62, 'fig-cloth', '', 70)
                 + `<rect class="fig-cloth" x="86" y="52" width="98" height="34" rx="14"/>
                    <rect class="fig-cloth" x="212" y="52" width="98" height="34" rx="14"/>
                    <text class="fig-step" x="200" y="44" text-anchor="middle">PILLOWS LAST</text>`,
              a: 'Pillows last, on top of everything else',
              b: 'Two minutes total. It is the cheapest win in the room.' }
        ]
    });
}

/* ---------- Folding a shirt in four moves ---------- */
/* Drawn as a folding diagram rather than as a picture of a shirt: each step
   shows the silhouette you should be looking at, with the next fold line
   dashed on top of it. That is the only form of this that is followable. */
function foldSteps() {
    const G = 'translate(132,46) scale(1.7)';
    // Local space is 80 wide. Sleeves 0-16 and 64-80; body 16-64; folds at 22 and 58.
    const SHIRT = 'M16 8 L30 4 Q40 13 50 4 L64 8 L80 22 L70 38 L64 32 L64 76 L16 76 L16 32 L10 38 L0 22 Z';

    return demoSwitch({
        id: 'fs', height: 252, capY: 204,
        label: 'ONE SHIRT, FOUR MOVES',
        alt: 'A t-shirt folded in four steps: laid flat, each side folded in, then folded in half',
        demos: [
            { btn: '1 Flat',
              svg: `<g transform="${G}">
                      <path class="fig-cloth" d="${SHIRT}"/>
                      <path class="fig-fold" d="M22 0 L22 80"/>
                    </g>`,
              a: 'Lay it flat, face down, and smooth it out',
              b: 'Creases you leave now are creases you keep.' },
            { btn: '2 Left in',
              svg: `<g transform="${G}">
                      <path class="fig-cloth" d="M22 6 L50 4 L64 8 L80 22 L70 38 L64 32 L64 76 L22 76 Z"/>
                      <path class="fig-cloth" d="M22 10 L44 18 L44 60 L22 68 Z" opacity=".55"/>
                      <path class="fig-fold" d="M22 0 L22 80"/>
                      <path class="fig-fold" d="M58 0 L58 80"/>
                    </g>`,
              a: 'Fold one side in, sleeve and all',
              b: 'The sleeve folds back on itself.' },
            { btn: '3 Right in',
              svg: `<g transform="${G}">
                      <path class="fig-cloth" d="M22 4 L58 4 L58 76 L22 76 Z"/>
                      <path class="fig-fold" d="M22 40 L58 40"/>
                    </g>`,
              a: 'Fold the other side in to match',
              b: 'You should have a straight rectangle now.' },
            { btn: '4 In half',
              svg: `<g transform="${G}">
                      <path class="fig-cloth" d="M22 4 L58 4 L58 40 L22 40 Z"/>
                    </g>
                    <g transform="translate(132,150) scale(1.7)">
                      <rect class="fig-box" x="18" y="0" width="44" height="14" rx="2"/>
                      <rect class="fig-box" x="18" y="16" width="44" height="14" rx="2"/>
                    </g>`,
              a: 'Fold it in half, bottom up to the collar',
              b: 'Stand them on edge in the drawer, not stacked.' }
        ]
    });
}

/* ---------- A day in blocks ---------- */
function dayBlocks() {
    const BLK = [
        { t: 'Morning routine', a: 6.5, b: 7.5 },
        { t: 'School',          a: 7.5, b: 15 },
        { t: 'Move / train',    a: 15.5, b: 17 },
        { t: 'Homework',        a: 17.5, b: 19 },
        { t: 'Dinner + free',   a: 19, b: 21 },
        { t: 'Wind-down',       a: 21, b: 21.75 }
    ];
    const X = h => 40 + (h - 6) * (330 / 16);
    // Late blocks sit near the right edge, so their label is right-aligned
    // to the bar rather than running off the frame.
    const label = b => {
        const w = b.t.length * 6.4;
        return X(b.a) + 6 + w < 392
            ? `x="${X(b.a) + 6}"`
            : `x="${Math.max(X(b.b) - 6, 26 + w)}" text-anchor="end"`;
    };
    return {
        svg: `
<svg viewBox="0 0 400 262" role="img" aria-labelledby="dbT">
  <title id="dbT">A weekday laid out as six blocks of time from six in the morning to ten at night</title>
  <text class="fig-label" x="20" y="18">A DAY IS SIX BLOCKS, NOT FORTY JOBS</text>
  <line class="fig-rule" x1="40" y1="40" x2="370" y2="40"/>
  ${[6, 10, 14, 18, 22].map(h => `<text class="fig-step" x="${X(h)}" y="34" text-anchor="middle">${h}:00</text>`).join('')}
  ${BLK.map((b, i) => `
    <rect class="fig-blk" data-i="${i}" x="${X(b.a)}" y="${50 + i * 26}" width="${X(b.b) - X(b.a)}" height="20" rx="5" fill="var(--accent)" fill-opacity="0.25"/>
    <text class="fig-blk-t" data-i="${i}" ${label(b)} y="${64 + i * 26}">${b.t}</text>`).join('')}
  <text class="fig-note fig-note-key" id="dbA" x="20" y="228">&#160;</text>
  <text class="fig-note"              id="dbB" x="20" y="250">&#160;</text>
</svg>`,
        bind(root) {
            const NOTE = [
                ['The morning block is the one you control least', 'So decide it the night before, not at 6:30 am.'],
                ['School is fixed. Everything else moves around it', 'Start from the blocks you cannot change.'],
                ['Training goes before homework on purpose', 'Hard physical work first makes sitting still easier after.'],
                ['One homework block, not homework all evening', 'A block has an end. "This evening" does not.'],
                ['Free time is scheduled, which is why it stays free', 'Unplanned free time gets eaten by everything else.'],
                ['Wind-down is a block too, and the one people skip', 'Screens down, kit laid out, tomorrow already decided.']
            ];
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = BLK.map((b, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${i + 1}</button>`).join('');
            root.appendChild(bar);
            const a = root.querySelector('#dbA');
            const b = root.querySelector('#dbB');
            const show = n => {
                root.querySelectorAll('[data-i]').forEach(el => {
                    const on = Number(el.dataset.i) === n;
                    if (el.tagName === 'rect') el.setAttribute('fill-opacity', on ? '0.75' : '0.18');
                    else el.style.opacity = on ? '1' : '.45';
                });
                a.textContent = NOTE[n][0];
                b.textContent = NOTE[n][1];
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === n)));
            };
            const pick = e => {
                const t = e.target.closest('[data-i]');
                if (t) show(Number(t.dataset.i));
            };
            bar.addEventListener('click', pick);
            root.querySelector('svg').addEventListener('click', pick);
            show(0);
        }
    };
}

/* ---------- The five habits an organised room runs on ---------- */
function homeRules() {
    return listPicker({
        id: 'hr', label: 'FIVE HABITS, NOT FIVE CHORES',
        alt: 'Five household organisation principles, each with what it means and why it works',
        rows: [
            { btn: '1', short: 'A home for everything',
              a: 'Every object has one place it lives',
              b: 'If you have to think about where it goes, it will not go there.' },
            { btn: '2', short: 'Put it back, not down',
              a: 'Handle a thing once, and finish the journey',
              b: 'Putting it down is a decision you have to make again later.' },
            { btn: '3', short: 'The two-minute rule',
              a: 'If it takes under two minutes, do it now',
              b: 'Small jobs are what pile up into a job you cannot start.' },
            { btn: '4', short: 'Like with like',
              a: 'Store things by what they are for, not by size',
              b: 'You look for things by purpose, so store them that way.' },
            { btn: '5', short: 'One in, one out',
              a: 'Something new arrives, something leaves',
              b: 'Storage is finite. This is the only rule that respects that.' }
        ]
    });
}

/* ---------- The two builders ---------- */
/* Matthew 7:24-27 is a parable about construction, and it is one of the rare
   cases where the literal engineering and the point being made are the same
   thing. Both houses stand under the same storm until the last panel, which
   is where the whole argument of the passage sits. */
function rockOrSand() {
    const house = (x, tilt = 0) => `
      <g transform="translate(${x},70) rotate(${tilt} 40 84)">
        <path class="fig-ink" stroke-width="2.5" d="M6 34 L40 6 L74 34"/>
        <rect class="fig-box" x="14" y="34" width="52" height="50"/>
        <rect class="fig-box" x="32" y="56" width="16" height="28"/>
      </g>`;

    // A collapsed house has to look collapsed: the roof slides off and lands
    // on its side, and the walls go over. Drawn with explicit coordinates
    // rather than rotations, so nothing can reach down into the labels.
    const ruin = x => `
      <g opacity=".7">
        <path class="fig-box" d="M${x + 2} 156 L${x + 2} 120 L${x + 44} 156 Z"/>
        <path class="fig-box" d="M${x + 40} 156 L${x + 54} 112 L${x + 88} 124 L${x + 74} 156 Z"/>
        <path class="fig-hatch" d="M${x - 4} 150 L${x + 6} 143 M${x + 94} 150 L${x + 104} 143"/>
      </g>`;

    const ground = `
      <rect class="fig-arena" x="20" y="156" width="168" height="12"/>
      <rect class="fig-arena" x="212" y="156" width="168" height="12"/>
      <text class="fig-step" x="104" y="198" text-anchor="middle">BUILT ON ROCK</text>
      <text class="fig-step" x="296" y="198" text-anchor="middle">BUILT ON SAND</text>`;

    const rain = [...Array(12)].map((_, i) =>
        `<path class="fig-hatch" d="M${22 + i * 32} 26 L${14 + i * 32} 50"/>`).join('');

    return demoSwitch({
        id: 'rs', height: 268, capY: 226,
        label: 'MATTHEW 7:24-27',
        alt: 'Two identical houses in the same storm, one built on rock and one on sand',
        demos: [
            { btn: 'Two houses', svg: house(58) + house(250) + ground,
              a: 'Two houses. From outside they look the same',
              b: 'Same size, same effort. The difference is underneath.' },
            { btn: 'The storm', svg: rain + house(58) + house(250, 3) + ground,
              a: 'The rain falls on both of them equally',
              b: 'Nobody is promised no storm. That is not the offer.' },
            { btn: 'After', svg: house(58) + ruin(250) + ground,
              a: 'One stands. One does not',
              b: 'The foundation was invisible until it mattered.' }
        ]
    });
}

/* ---------- Four parts of prayer ---------- */
function prayerParts() {
    return listPicker({
        id: 'pp2', label: 'A · C · T · S',
        alt: 'Four parts of prayer: adoration, confession, thanksgiving and supplication',
        rows: [
            { btn: 'A', short: 'Adoration',
              a: 'Saying who God is, before asking for anything',
              b: 'The Lord’s Prayer opens this way. Matthew 6:9.' },
            { btn: 'C', short: 'Confession',
              a: 'Being honest about what you got wrong',
              b: 'Not a performance. 1 John 1:9.' },
            { btn: 'T', short: 'Thanksgiving',
              a: 'Naming what has already been given',
              b: 'Specific things, not a general thank you. Philippians 4:6.' },
            { btn: 'S', short: 'Supplication',
              a: 'Asking — for yourself and for other people',
              b: 'It comes last on purpose, not because it matters least.' }
        ]
    });
}

/* ==========================================================================
   FILIPINO FIGURES.
   Affixation is the whole of Filipino word-building, and it is the one thing
   a list cannot show: you have to see the root stay put while the affix
   attaches around it. The infix in particular lands *inside* the root, which
   is impossible to convey in prose and obvious in one picture.
   ========================================================================== */

function panlapi() {
    const CH = 13.2;
    // Segments are rendered left to right; the root keeps its colour so you
    // can watch it survive intact inside every built word.
    const line = (segs, y) => {
        const total = segs.reduce((n, s) => n + s.t.length, 0);
        let x = 200 - (total * CH) / 2;
        return segs.map(s => {
            const el = `<text class="fig-mono${s.root ? ' fig-sent-hi' : ''}" x="${x.toFixed(1)}" y="${y}">${s.t}</text>`;
            x += s.t.length * CH;
            return el;
        }).join('');
    };

    const root = t => ({ t, root: true });
    const fix = t => ({ t });

    return demoSwitch({
        id: 'pl', height: 232, capY: 178,
        label: 'ISANG UGAT, APAT NA SALITA',
        alt: 'The root sulat with a prefix, an infix, a suffix and both, showing the root staying intact',
        demos: [
            { btn: 'Unlapi',
              svg: `<text class="fig-step" x="200" y="52" text-anchor="middle">SALITANG-UGAT: SULAT</text>`
                 + line([fix('mag'), root('sulat')], 110)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">UNLAPI + UGAT</text>`,
              a: 'Unlapi — nasa unahan ng salitang-ugat',
              b: 'mag- + sulat = magsulat. Buo pa rin ang ugat.' },
            { btn: 'Gitlapi',
              svg: `<text class="fig-step" x="200" y="52" text-anchor="middle">SALITANG-UGAT: SULAT</text>`
                 + line([root('s'), fix('um'), root('ulat')], 110)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">UGAT + GITLAPI SA LOOB</text>`,
              a: 'Gitlapi — pumapasok sa loob ng ugat',
              b: 's + -um- + ulat = sumulat. Ito ang mahirap makita.' },
            { btn: 'Hulapi',
              svg: `<text class="fig-step" x="200" y="52" text-anchor="middle">SALITANG-UGAT: SULAT</text>`
                 + line([root('sulat'), fix('in')], 110)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">UGAT + HULAPI</text>`,
              a: 'Hulapi — nasa hulihan ng salitang-ugat',
              b: 'sulat + -in = sulatin.' },
            { btn: 'Kabilaan',
              svg: `<text class="fig-step" x="200" y="52" text-anchor="middle">SALITANG-UGAT: SULAT</text>`
                 + line([fix('pag'), root('sulat'), fix('an')], 110)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">UNLAPI + UGAT + HULAPI</text>`,
              a: 'Kabilaan — may panlapi sa unahan at hulihan',
              b: 'pag- + sulat + -an = pagsulatan.' }
        ]
    });
}

/* ---------- Karaniwan against di-karaniwang ayos ---------- */
/* The two orders are the same sentence, and "ay" is the visible tell. */
function ayosPangungusap() {
    const CH = 8.4;
    const line = (segs, y) => {
        const total = segs.reduce((n, s) => n + s.t.length, 0);
        let x = 200 - (total * CH) / 2;
        return segs.map(s => {
            const cls = s.hi ? 'fig-sent fig-sent-hi' : 'fig-sent';
            const el = `<text class="${cls}" x="${x.toFixed(1)}" y="${y}">${s.t}</text>`;
            x += s.t.length * CH;
            return el;
        }).join('');
    };

    return demoSwitch({
        id: 'ay', height: 232, capY: 178,
        label: 'ISANG PANGUNGUSAP, DALAWANG AYOS',
        alt: 'One sentence written in the usual order and then in the inverted order with the marker ay',
        demos: [
            { btn: 'Karaniwan',
              svg: `<text class="fig-step" x="200" y="56" text-anchor="middle">PANAGURI MUNA</text>`
                 + line([{ t: 'Kumakain ng mansanas ' }, { t: 'ang bata.', hi: true }], 104)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">PANAGURI — SIMUNO · WALANG "AY"</text>`,
              a: 'Karaniwang ayos: panaguri muna, simuno sa huli',
              b: 'Walang panandang "ay". Ito ang mas madalas sa Filipino.' },
            { btn: 'Di-karaniwan',
              svg: `<text class="fig-step" x="200" y="56" text-anchor="middle">SIMUNO MUNA</text>`
                 + line([{ t: 'Ang bata ', hi: true }, { t: 'ay ' }, { t: 'kumakain ng mansanas.' }], 104)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">SIMUNO — "AY" — PANAGURI</text>`,
              a: 'Di-karaniwang ayos: simuno muna, may "ay"',
              b: 'Pareho ang kahulugan. Ang "ay" ang tanda nito.' }
        ]
    });
}

function kayarianSalita() {
    return listPicker({
        id: 'ks', label: 'APAT NA KAYARIAN NG SALITA',
        alt: 'The four Filipino word structures with an example of each',
        rows: [
            { btn: 'Payak', short: 'Payak', a: 'Salitang-ugat lamang, walang panlapi',
              b: 'bahay · laro · sulat · tubig' },
            { btn: 'Maylapi', short: 'Maylapi', a: 'May panlapi sa ugat',
              b: 'magbahay · naglaro · sumulat · tubigan' },
            { btn: 'Inuulit', short: 'Inuulit', a: 'Inuulit ang buo o bahagi ng ugat',
              b: 'araw-araw · bahay-bahay · sari-sari' },
            { btn: 'Tambalan', short: 'Tambalan', a: 'Dalawang salitang-ugat na pinagsama',
              b: 'hampaslupa · bahay-kubo · dalagang-bukid' }
        ]
    });
}

function kayarianPangungusap() {
    return listPicker({
        id: 'kp', label: 'APAT NA KAYARIAN NG PANGUNGUSAP',
        alt: 'The four Filipino sentence structures with an example of each',
        rows: [
            { btn: 'Payak', short: 'Payak', a: 'Isang punong sugnay lamang',
              b: 'Naglalaro ang bata sa labas.' },
            { btn: 'Tambalan', short: 'Tambalan', a: 'Dalawang punong sugnay',
              b: 'Naglaro siya at natulog agad. (at, ngunit, o)' },
            { btn: 'Hugnayan', short: 'Hugnayan', a: 'Punong sugnay at palipong sugnay',
              b: 'Natulog siya dahil pagod na siya. (dahil, kung, kapag)' },
            { btn: 'Langkapan', short: 'Langkapan', a: 'Pinagsamang tambalan at hugnayan',
              b: 'Naglaro siya at natulog dahil pagod na siya.' }
        ]
    });
}

/* ==========================================================================
   SCIENCE, WEEKS 6-10.
   ========================================================================== */

/** One drawn scene, several named parts, one lit at a time. Selection is by
    dimming the rest, never by colour alone — the caption names the part. */
function partPicker({ id, label, alt, height, scene, parts, capY }) {
    return {
        svg: `
<svg viewBox="0 0 400 ${height}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="20">${label}</text>
  ${scene}
  <text class="fig-note fig-note-key" id="${id}A" x="20" y="${capY}">&#160;</text>
  <text class="fig-note"              id="${id}B" x="20" y="${capY + 22}">&#160;</text>
</svg>`,
        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = parts.map((p, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${p.btn}</button>`).join('');
            root.appendChild(bar);

            const els = [...root.querySelectorAll('[data-p]')];
            const a = root.querySelector(`#${id}A`);
            const b = root.querySelector(`#${id}B`);

            const show = i => {
                els.forEach(el => el.classList.toggle('dim', !parts[i].pick.includes(el.dataset.p)));
                a.textContent = parts[i].a;
                b.textContent = parts[i].b;
                fitText(a); fitText(b);
                bar.querySelectorAll('button').forEach((x, j) =>
                    x.setAttribute('aria-pressed', String(j === i)));
            };
            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) show(Number(btn.dataset.i));
            });
            show(0);
        }
    };
}

/* ---------- The five vertebrate classes ---------- */
function vertebrates() {
    return listPicker({
        id: 'vt', label: 'FIVE CLASSES WITH A BACKBONE',
        alt: 'The five vertebrate classes with the feature that identifies each',
        rows: [
            { btn: 'Fish', short: 'Fishes',
              a: 'Gills, scales and fins. Cold-blooded.',
              b: 'Most lay eggs in water. They never leave it.' },
            { btn: 'Amphib', short: 'Amphibians',
              a: 'Moist skin, no scales. Cold-blooded.',
              b: 'Start in water with gills, then grow lungs. Frogs, toads.' },
            { btn: 'Reptile', short: 'Reptiles',
              a: 'Dry scaly skin, lungs from birth. Cold-blooded.',
              b: 'Leathery eggs laid on land. Snakes, lizards, turtles.' },
            { btn: 'Bird', short: 'Birds',
              a: 'Feathers and a beak. Warm-blooded.',
              b: 'Hard-shelled eggs. Hollow bones to save weight.' },
            { btn: 'Mammal', short: 'Mammals',
              a: 'Hair or fur, and milk for the young. Warm-blooded.',
              b: 'Mostly live young. The platypus lays eggs and still counts.' }
        ]
    });
}

/* ---------- The six invertebrate groups ---------- */
function invertebrates() {
    return listPicker({
        id: 'iv', label: 'SIX GROUPS WITHOUT ONE',
        alt: 'Six invertebrate groups with an identifying feature and an example of each',
        rows: [
            { btn: 'Sponges', short: 'Sponges',
              a: 'Full of holes, and fixed in one place',
              b: 'No organs at all. Water carries the food to them.' },
            { btn: 'Cnidarians', short: 'Cnidarians',
              a: 'Stinging cells and a body like a bag',
              b: 'Jellyfish, corals, sea anemones.' },
            { btn: 'Worms', short: 'Worms',
              a: 'Long soft body, no legs',
              b: 'Flatworms, roundworms and segmented worms.' },
            { btn: 'Molluscs', short: 'Molluscs',
              a: 'Soft body, very often inside a shell',
              b: 'Snails, clams, squid and octopus.' },
            { btn: 'Echinoderms', short: 'Echinoderms',
              a: 'Spiny skin, and built around a circle',
              b: 'Starfish and sea urchins. All of them live in the sea.' },
            { btn: 'Arthropods', short: 'Arthropods',
              a: 'Jointed legs and an exoskeleton',
              b: 'Insects, spiders, crabs. Most animal species are here.' }
        ]
    });
}

/* ---------- A flower, cut in half ---------- */
/* Every exam question about plant reproduction needs this diagram, and no
   photograph shows the inside. Cutting it open is the only way. */
function flowerParts() {
    const scene = `
  <g data-p="stem"><path class="fig-stalk" d="M200 200 L200 256"/>
    <path class="fig-green" d="M200 226 q28 -14 34 8 q-24 12 -34 -8 Z"/></g>
  <g data-p="sepal">
    <path class="fig-green" d="M176 196 q-34 4 -40 20 q30 8 42 -12 Z"/>
    <path class="fig-green" d="M224 196 q34 4 40 20 q-30 8 -42 -12 Z"/></g>
  <g data-p="petal">
    <path class="fig-petal" d="M178 188 C120 178 92 140 104 106 C142 108 176 140 180 184 Z"/>
    <path class="fig-petal" d="M222 188 C280 178 308 140 296 106 C258 108 224 140 220 184 Z"/></g>
  <g data-p="stamen">
    <path class="fig-stalk" d="M186 190 C168 156 158 132 152 116"/>
    <ellipse class="fig-petal" cx="150" cy="110" rx="13" ry="8"/>
    <path class="fig-stalk" d="M214 190 C232 156 242 132 248 116"/>
    <ellipse class="fig-petal" cx="250" cy="110" rx="13" ry="8"/></g>
  <g data-p="ovary">
    <ellipse class="fig-green" cx="200" cy="176" rx="26" ry="22"/>
    <circle class="fig-seed" cx="192" cy="176" r="4"/>
    <circle class="fig-seed" cx="208" cy="176" r="4"/>
    <circle class="fig-seed" cx="200" cy="186" r="4"/></g>
  <g data-p="style"><rect class="fig-green" x="196" y="104" width="8" height="52" rx="4"/></g>
  <g data-p="stigma"><ellipse class="fig-green" cx="200" cy="98" rx="19" ry="9"/></g>`;

    return partPicker({
        id: 'fp', height: 320, capY: 282,
        label: 'A FLOWER, CUT IN HALF',
        alt: 'A flower in cross section with the sepal, petal, stamen, stigma, style and ovary',
        scene,
        parts: [
            { btn: 'Sepal', pick: ['sepal'],
              a: 'Sepal — the green flaps under the petals',
              b: 'They protected the whole flower while it was a bud.' },
            { btn: 'Petal', pick: ['petal'],
              a: 'Petal — colour and scent, for advertising',
              b: 'They exist to bring insects and birds in. Nothing else.' },
            { btn: 'Stamen', pick: ['stamen'],
              a: 'Stamen — the male part. Filament plus anther',
              b: 'The anther on top is where the pollen is made.' },
            { btn: 'Stigma', pick: ['stigma'],
              a: 'Stigma — the sticky landing pad on top',
              b: 'Pollen has to land here for anything to happen.' },
            { btn: 'Style', pick: ['style'],
              a: 'Style — the tube from the stigma down',
              b: 'The pollen tube grows down through this to the ovary.' },
            { btn: 'Ovary', pick: ['ovary'],
              a: 'Ovary — holds the ovules, at the base',
              b: 'Ovules become seeds. The ovary becomes the fruit.' }
        ]
    });
}

/* ---------- The Tyndall effect ---------- */
/* The single test that separates a solution from a colloid, and it is
   entirely visual: you either see the beam or you do not. */
function tyndall() {
    const jar = `<rect class="fig-jar" x="120" y="60" width="160" height="110" rx="8"/>
                 <rect class="fig-liquid" x="124" y="86" width="152" height="80"/>`;
    const torch = `<path class="fig-ink" stroke-width="2.5" d="M40 100 L74 100 L74 130 L40 130 Z"/>
                   <path class="fig-ink" stroke-width="2.5" d="M74 106 L88 100 L88 130 L74 124 Z"/>
                   <text class="fig-step" x="56" y="150" text-anchor="middle">TORCH</text>`;
    return demoSwitch({
        id: 'ty', height: 254, capY: 202,
        label: 'CAN YOU SEE THE BEAM?',
        alt: 'A torch beam passing through a solution and then through a colloid',
        demos: [
            { btn: 'Solution',
              svg: jar + torch
                 + `<path class="fig-beam" d="M90 115 L120 115"/>
                    <path class="fig-beam-off" d="M124 115 L276 115"/>
                    <path class="fig-beam" d="M280 115 L330 115"/>
                    <text class="fig-step" x="200" y="188" text-anchor="middle">SALT IN WATER</text>`,
              a: 'A solution: the beam goes straight through, unseen',
              b: 'The particles are too small to bounce light back at you.' },
            { btn: 'Colloid',
              svg: jar + torch
                 + `<path class="fig-beam" d="M90 115 L330 115"/>
                    ${[...Array(9)].map((_, i) => `<circle class="fig-grain" cx="${132 + i * 17}" cy="${107 + (i % 3) * 8}" r="2.6"/>`).join('')}
                    <text class="fig-step" x="200" y="188" text-anchor="middle">MILK IN WATER</text>`,
              a: 'A colloid: the beam lights up inside the liquid',
              b: 'Bigger particles scatter the light. This is the Tyndall effect.' }
        ]
    });
}

/* ---------- Three ways to make something dissolve faster ---------- */
function dissolveRate() {
    const jar = `<path class="fig-jar" d="M130 66 L270 66 L262 176 L138 176 Z"/>
                 <path class="fig-liquid" d="M133 92 L267 92 L262 173 L138 173 Z"/>`;
    const grains = (n, r, y0) => [...Array(n)].map((_, i) =>
        `<circle class="fig-grain" cx="${150 + (i * 37) % 100}" cy="${y0 + (i % 3) * 14}" r="${r}"/>`).join('');
    return demoSwitch({
        id: 'dr', height: 250, capY: 200,
        label: 'THREE WAYS TO SPEED IT UP',
        alt: 'Three ways to dissolve a solid faster: heat, stirring and grinding',
        demos: [
            { btn: 'Heat',
              svg: jar + grains(4, 7, 130)
                 + `<path class="fig-track" d="M170 60 q8 -14 0 -26 M200 60 q8 -14 0 -26 M230 60 q8 -14 0 -26"/>
                    <text class="fig-step" x="200" y="196" text-anchor="middle">HOT WATER</text>`,
              a: 'Heat — the particles move faster and hit harder',
              b: 'Warmer water dissolves most solids more quickly.' },
            { btn: 'Stirring',
              svg: jar + grains(4, 7, 130)
                 + `<path class="fig-stalk" d="M200 50 L200 150"/>
                    <path class="fig-track" d="M150 118 q50 -26 100 0" />
                    <text class="fig-step" x="200" y="196" text-anchor="middle">STIRRED</text>`,
              a: 'Stirring — fresh water keeps reaching the solid',
              b: 'Without it, the water right next to the grain gets saturated.' },
            { btn: 'Grinding',
              svg: jar + grains(12, 3.4, 126)
                 + `<text class="fig-step" x="200" y="196" text-anchor="middle">GROUND SMALL</text>`,
              a: 'Grinding — smaller pieces mean far more surface',
              b: 'Water can only attack the outside, so more outside is faster.' }
        ]
    });
}

/* ---------- How to get the parts of a mixture back ---------- */
function separationMethods() {
    return listPicker({
        id: 'sm', label: 'SIX WAYS TO SEPARATE A MIXTURE',
        alt: 'Six separation methods with what each one separates and an example',
        rows: [
            { btn: 'Picking', short: 'Picking',
              a: 'By hand, when the pieces are big enough to see',
              b: 'Stones out of rice. The simplest method there is.' },
            { btn: 'Sieving', short: 'Sieving',
              a: 'Separates by size of particle',
              b: 'Flour from lumps. Sand from gravel.' },
            { btn: 'Magnet', short: 'Magnet',
              a: 'Pulls out anything magnetic',
              b: 'Iron filings out of sand. Nothing else moves.' },
            { btn: 'Filtering', short: 'Filtering',
              a: 'Separates an undissolved solid from a liquid',
              b: 'Sand from water. The sand stays on the paper.' },
            { btn: 'Evaporation', short: 'Evaporation',
              a: 'Boils the solvent away and leaves the solute',
              b: 'Salt from seawater. You keep the solid.' },
            { btn: 'Distillation', short: 'Distillation',
              a: 'Boils, then catches and cools the vapour',
              b: 'Pure water from seawater. You keep the liquid.' }
        ]
    });
}

/* ==========================================================================
   MATHS, WEEKS 6-10 — fractions and ratio.
   ========================================================================== */

/** A bar cut into n equal pieces with the first k filled. */
function fracBar(y, n, k, { x = 72, w = 282, h = 38, cls = 'fig-cell-f', cuts = 0 } = {}) {
    const p = w / n;
    let out = '';
    for (let i = 0; i < n; i++) {
        out += `<rect class="${i < k ? cls : 'fig-cell-e'}" x="${(x + i * p).toFixed(1)}" y="${y}" width="${p.toFixed(1)}" height="${h}"/>`;
    }
    if (cuts) {
        for (let i = 1; i < cuts; i++) {
            const gx = x + (i * w) / cuts;
            if (Math.abs((gx - x) % p) > 0.5) out += `<path class="fig-cut" d="M${gx.toFixed(1)} ${y} L${gx.toFixed(1)} ${y + h}"/>`;
        }
    }
    return out;
}

/* ---------- Why fractions need a common denominator ---------- */
/* You cannot add halves to thirds for the same reason you cannot add
   centimetres to inches: the pieces are different sizes. Re-cutting both
   bars into sixths is the entire method, and it is obvious once drawn. */
function fractionBars() {
    const lab = (t, y) => `<text class="fig-frac" x="18" y="${y}">${t}</text>`;
    return demoSwitch({
        id: 'fb', height: 262, capY: 212,
        label: 'WHY THE BOTTOMS HAVE TO MATCH',
        alt: 'A half and a third drawn as bars, then both re-cut into sixths and added',
        demos: [
            { btn: 'The problem',
              svg: lab('1/2', 88) + fracBar(62, 2, 1) + lab('1/3', 152) + fracBar(126, 3, 1)
                 + `<text class="fig-step" x="200" y="186" text-anchor="middle">DIFFERENT SIZED PIECES</text>`,
              a: 'A half and a third are different sized pieces',
              b: 'You cannot add them while they are different. Nothing lines up.' },
            { btn: 'Re-cut',
              svg: lab('3/6', 88) + fracBar(62, 6, 3, { cuts: 6 }) + lab('2/6', 152) + fracBar(126, 6, 2, { cuts: 6 })
                 + `<text class="fig-step" x="200" y="186" text-anchor="middle">BOTH CUT INTO SIXTHS</text>`,
              a: 'Cut both into sixths. Same bars, same amounts',
              b: 'Six is the smallest number both 2 and 3 divide into.' },
            { btn: 'Add',
              svg: lab('5/6', 106) + fracBar(80, 6, 5)
                 + `<text class="fig-step" x="200" y="150" text-anchor="middle">3 SIXTHS + 2 SIXTHS = 5 SIXTHS</text>`,
              a: 'Now just count the pieces: 3 + 2 = 5',
              b: 'The bottom number never changes. Only the top is added.' }
        ]
    });
}

/* ---------- Multiplying and dividing fractions ---------- */
function fractionOps() {
    const X = 116, Y = 56, S = 168;
    const grid = (cols, rows) => {
        let out = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const on = c < 2 && r < 3;   // 2/3 across by 3/4 down
                out += `<rect class="${on ? 'fig-cell-x' : 'fig-cell-e'}" x="${X + (c * S) / cols}" y="${Y + (r * S) / rows}" width="${S / cols}" height="${S / rows}"/>`;
            }
        }
        return out;
    };
    return demoSwitch({
        id: 'fo', height: 322, capY: 272,
        label: 'TIMES AND DIVIDE',
        alt: 'An area model for two thirds times three quarters, and halves counted inside three wholes',
        demos: [
            { btn: 'Across',
              svg: `${[...Array(3)].map((_, c) => `<rect class="${c < 2 ? 'fig-cell-f' : 'fig-cell-e'}" x="${X + (c * S) / 3}" y="${Y}" width="${S / 3}" height="${S}"/>`).join('')}
                    <text class="fig-frac" x="200" y="${Y + S + 24}" text-anchor="middle">2/3 of the width</text>`,
              a: 'Shade two thirds of the square, going across',
              b: 'Two strips out of three. Nothing complicated yet.' },
            { btn: 'Down',
              svg: `${[...Array(4)].map((_, r) => `<rect class="${r < 3 ? 'fig-cell-g' : 'fig-cell-e'}" x="${X}" y="${Y + (r * S) / 4}" width="${S}" height="${S / 4}"/>`).join('')}
                    <text class="fig-frac" x="200" y="${Y + S + 24}" text-anchor="middle">3/4 of the height</text>`,
              a: 'Now shade three quarters of it, going down',
              b: 'Three strips out of four, the other way.' },
            { btn: 'Overlap',
              svg: grid(3, 4)
                 + `<text class="fig-frac" x="200" y="${Y + S + 24}" text-anchor="middle">6 of 12 = 6/12 = 1/2</text>`,
              a: 'The overlap is the answer: 2 x 3 = 6, and 3 x 4 = 12',
              b: 'Multiply the tops, multiply the bottoms. The picture proves it.' },
            { btn: 'Divide',
              svg: `${[...Array(6)].map((_, i) => `<rect class="fig-cell-f" x="${44 + i * 52}" y="90" width="50" height="56"/>`).join('')}
                    <path class="fig-cut" d="M148 84 L148 152 M252 84 L252 152 M356 84 L356 152"/>
                    <text class="fig-step" x="200" y="176" text-anchor="middle">3 WHOLES, CUT INTO HALVES</text>
                    <text class="fig-frac" x="200" y="206" text-anchor="middle">3 ÷ 1/2 = 6</text>`,
              a: 'Dividing asks how many of them fit inside',
              b: 'Six halves fit into three. That is why the answer got bigger.' }
        ]
    });
}

/* ---------- Ratio as parts of a bar ---------- */
function ratioBars() {
    const seg = (x, w, cls) => `<rect class="${cls}" x="${x}" y="86" width="${w}" height="44"/>`;
    const bar = (a, b) => {
        const total = a + b, p = 312 / total;
        let out = '';
        for (let i = 0; i < total; i++) out += seg(44 + i * p, p, i < a ? 'fig-cell-f' : 'fig-cell-g');
        return out;
    };
    return demoSwitch({
        id: 'rb', height: 238, capY: 190,
        label: 'A RATIO IS A BAR SPLIT INTO PARTS',
        alt: 'Ratios drawn as a bar divided into parts, simplified and then shared out',
        demos: [
            { btn: '3 : 4',
              svg: bar(3, 4) + `<text class="fig-step" x="200" y="152" text-anchor="middle">3 PARTS AND 4 PARTS · 7 IN TOTAL</text>`,
              a: 'A ratio of 3 : 4 means seven parts, not three or four',
              b: 'The total is what most people forget. Count all the parts.' },
            { btn: '6 : 8',
              svg: bar(6, 8) + `<text class="fig-step" x="200" y="152" text-anchor="middle">SAME BAR, TWICE THE CUTS</text>`,
              a: '6 : 8 is the same split, cut into smaller pieces',
              b: 'Equivalent ratios. Divide both sides by 2 and you are back to 3 : 4.' },
            { btn: 'Share 35',
              svg: bar(3, 4)
                 + `<text class="fig-step" x="200" y="152" text-anchor="middle">35 ÷ 7 PARTS = 5 EACH</text>`
                 + `<text class="fig-frac" x="200" y="178" text-anchor="middle">3 x 5 = 15   ·   4 x 5 = 20</text>`,
              a: 'Sharing 35 in the ratio 3 : 4',
              b: 'Find one part first, then multiply. Never guess the halves.' }
        ]
    });
}

/* ==========================================================================
   ENGLISH, WEEKS 6-10.
   ========================================================================== */

/* ---------- Take the -self word out and see what happens ---------- */
/* Intensive and reflexive pronouns look identical. The only reliable test is
   deletion: an intensive one can be removed and the sentence survives, and a
   reflexive one cannot. Striking the word out on screen is that test, done. */
function selfPronouns() {
    const CH = 8.4;
    const line = (segs, y) => {
        const total = segs.reduce((n, s) => n + s.t.length, 0);
        let x = 200 - (total * CH) / 2;
        let out = '';
        for (const s of segs) {
            const w = s.t.length * CH;
            const cls = s.cut ? 'fig-sent fig-sent-dim' : s.hi ? 'fig-sent fig-sent-hi' : 'fig-sent';
            out += `<text class="${cls}" x="${x.toFixed(1)}" y="${y}">${s.t}</text>`;
            if (s.cut) out += `<path class="fig-strike" d="M${(x + 1).toFixed(1)} ${y - 5} L${(x + w - 4).toFixed(1)} ${y - 5}"/>`;
            x += w;
        }
        return out;
    };

    return demoSwitch({
        id: 'sp', height: 246, capY: 196,
        label: 'CROSS IT OUT AND SEE',
        alt: 'An intensive pronoun struck out leaving a working sentence, and a reflexive one leaving a broken sentence',
        demos: [
            { btn: 'Intensive',
              svg: line([{ t: 'I ' }, { t: 'myself ', hi: true }, { t: 'saw the whole thing.' }], 92)
                 + line([{ t: 'I ' }, { t: 'myself ', cut: true }, { t: 'saw the whole thing.' }], 132)
                 + `<text class="fig-verdict-ok" x="200" y="166" text-anchor="middle">STILL A SENTENCE · INTENSIVE</text>`,
              a: 'Intensive: it only adds emphasis',
              b: 'Take it out and the sentence still works. That is the test.' },
            { btn: 'Reflexive',
              svg: line([{ t: 'She taught ' }, { t: 'herself ', hi: true }, { t: 'to code.' }], 92)
                 + line([{ t: 'She taught ' }, { t: 'herself ', cut: true }, { t: 'to code.' }], 132)
                 + `<text class="fig-verdict-no" x="200" y="166" text-anchor="middle">TAUGHT WHO? · REFLEXIVE</text>`,
              a: 'Reflexive: it is the object of the verb',
              b: 'Take it out and the sentence breaks. It was doing real work.' },
            { btn: 'The eight',
              svg: `<text class="fig-step" x="112" y="70" text-anchor="middle">SINGULAR</text>
                    <text class="fig-step" x="288" y="70" text-anchor="middle">PLURAL</text>
                    <line class="fig-rule" x1="24" y1="78" x2="376" y2="78"/>
                    ${['myself', 'yourself', 'himself', 'herself', 'itself'].map((w, i) =>
                        `<text class="fig-cell" x="112" y="${100 + i * 22}" text-anchor="middle">${w}</text>`).join('')}
                    ${['ourselves', 'yourselves', 'themselves'].map((w, i) =>
                        `<text class="fig-cell" x="288" y="${100 + i * 22}" text-anchor="middle">${w}</text>`).join('')}
                    <text class="fig-verdict-no" x="288" y="176" text-anchor="middle">NOT hisself · NOT theirselves</text>`,
              a: 'Eight forms. Singular ends -self, plural ends -selves',
              b: 'Hisself and theirselves are not words. They never have been.' }
        ]
    });
}

/* ---------- Adding -s or -es in the present tense ---------- */
function verbEndings() {
    return listPicker({
        id: 've', label: 'HE, SHE, IT — ADD SOMETHING',
        alt: 'Spelling rules for the third person singular in the simple present tense',
        rows: [
            { btn: 'Most', short: 'Most verbs',
              a: 'Just add -s', b: 'run → runs · eat → eats · play → plays' },
            { btn: '-s -sh -ch', short: 'Ends -s, -sh, -ch, -x, -z',
              a: 'Add -es, because -s alone would be unsayable',
              b: 'watch → watches · fix → fixes · pass → passes' },
            { btn: '-o', short: 'Ends in -o',
              a: 'Add -es', b: 'go → goes · do → does' },
            { btn: 'Consonant + y', short: 'Consonant then -y',
              a: 'Change the y to i and add -es',
              b: 'carry → carries · study → studies · fly → flies' },
            { btn: 'Vowel + y', short: 'Vowel then -y',
              a: 'Keep the y and just add -s',
              b: 'play → plays · enjoy → enjoys. Not playies.' },
            { btn: 'Odd ones', short: 'have and be',
              a: 'These two do not follow any rule',
              b: 'have → has · be → is. Learn them separately.' }
        ]
    });
}

/* ---------- The subject-verb agreement traps ---------- */
function agreementTraps() {
    return listPicker({
        id: 'at', label: 'SIX PLACES AGREEMENT GOES WRONG',
        alt: 'Six subject-verb agreement traps, each with the rule and a correct example',
        rows: [
            { btn: 'Phrase', short: 'A phrase in the way',
              a: 'Ignore everything between the subject and the verb',
              b: 'The box of chocolates IS on the table. Box is the subject.' },
            { btn: 'Each', short: 'each, every, -one, -body',
              a: 'All singular, however plural they sound',
              b: 'Everyone HAS a partner. Each of the boys IS ready.' },
            { btn: 'and / or', short: 'Joined by and, or, nor',
              a: 'And makes it plural. Or and nor match the nearer one',
              b: 'Neither the boys nor the coach WAS late.' },
            { btn: 'Group', short: 'Collective nouns',
              a: 'A team, class or family is one group',
              b: 'The team IS winning. The team members ARE winning.' },
            { btn: 'There', short: 'there is / there are',
              a: 'The real subject comes after the verb',
              b: 'There ARE three reasons. There IS one reason.' },
            { btn: 'Amounts', short: 'Amounts and titles',
              a: 'A quantity acting as one thing takes a singular verb',
              b: 'Ten pesos IS enough. Five kilometres IS a long way.' }
        ]
    });
}

/* ==========================================================================
   SOCIAL STUDIES, WEEKS 6-10.
   ========================================================================== */

/* Week 6: the republic, from declaration to inauguration. */
function roadToMalolos() {
    return timeline({
        id: 'ml', label: 'FIVE MONTHS, ONE REPUBLIC',
        alt: 'A timeline from the declaration of independence in June 1898 to the republic in January 1899',
        stops: [
            { year: 'Jun 1898', tag: 'Kawit',
              head: 'Independence declared at Kawit',
              body: '12 June. The flag is unfurled for the first time.' },
            { year: 'Aug 1898', tag: 'mock battle',
              head: 'The staged Battle of Manila',
              body: 'Spain surrenders to the Americans. Filipinos are kept out.' },
            { year: 'Sep 1898', tag: 'Congress',
              head: 'The Malolos Congress opens',
              body: '15 September, at Barasoain Church in Bulacan.' },
            { year: 'Dec 1898', tag: 'Paris',
              head: 'The Treaty of Paris',
              body: 'Spain sells the islands to the United States for $20 million.' },
            { year: 'Jan 1899', tag: 'Republic',
              head: 'The First Philippine Republic',
              body: '23 January. The first constitutional republic in Asia.' }
        ]
    });
}

/* Week 7: the war, from the first shot to the last surrender. */
function warTimeline() {
    return timeline({
        id: 'wt', label: 'THREE YEARS OF WAR',
        alt: 'A timeline of the Filipino-American War from February 1899 to July 1902',
        stops: [
            { year: 'Feb 1899', tag: 'first shot',
              head: 'The first shot, at San Juan bridge',
              body: '4 February. The US Senate ratifies the treaty two days later.' },
            { year: 'Nov 1899', tag: 'guerrilla',
              head: 'Aguinaldo dissolves the regular army',
              body: 'The war becomes a guerrilla war. It lasts far longer.' },
            { year: 'Dec 1899', tag: 'Tirad Pass',
              head: 'Tirad Pass',
              body: 'Gregorio del Pilar and 60 men hold the pass. He is 24.' },
            { year: 'Mar 1901', tag: 'captured',
              head: 'Aguinaldo captured at Palanan',
              body: 'Taken in Isabela. He swears allegiance days later.' },
            { year: 'Jul 1902', tag: 'declared over',
              head: 'The war is declared over',
              body: 'Malvar had surrendered in April. Fighting went on elsewhere.' }
        ]
    });
}

/* Week 8: the two governments and the laws that shaped them. */
function colonialGov() {
    return listPicker({
        id: 'cg', label: 'HOW THE AMERICANS GOVERNED',
        alt: 'The stages of American colonial government in the Philippines with dates',
        rows: [
            { btn: '1898', short: 'Military government',
              a: 'August 1898 to July 1901. Run by generals',
              b: 'Three military governors: Merritt, Otis, then Arthur MacArthur.' },
            { btn: '1899', short: 'Schurman Commission',
              a: 'The First Philippine Commission. Advisory only',
              b: 'It investigated and reported. It could not make law.' },
            { btn: '1900', short: 'Taft Commission',
              a: 'The Second Commission, and it could legislate',
              b: 'From September 1900 it held law-making power.' },
            { btn: '1901', short: 'Civil government',
              a: '4 July 1901. William Howard Taft becomes Civil Governor',
              b: 'Government passes from soldiers to civilians.' },
            { btn: '1902', short: 'Philippine Bill',
              a: 'Promised an elected assembly and a bill of rights',
              b: 'Also sent two Filipino commissioners to the US Congress.' },
            { btn: '1907', short: 'Philippine Assembly',
              a: 'The first elected Filipino legislative body',
              b: 'Opened 16 October 1907. Osmena was its Speaker.' }
        ]
    });
}

/* Week 9: what the commission recommended, and what happened. */
function schurmanReport() {
    return listPicker({
        id: 'sr', label: 'RECOMMENDED · DELIVERED',
        alt: 'The Schurman Commission recommendations paired with what actually happened',
        capA: 'Said: ', capB: 'Result: ',
        rows: [
            { btn: '1', short: 'Eventual independence',
              a: 'Independence one day, but not yet',
              b: 'It came in 1946, forty-six years after the report.' },
            { btn: '2', short: 'Filipinos not ready',
              a: 'Filipinos were not ready to govern themselves',
              b: 'A republic had already existed for months by then.' },
            { btn: '3', short: 'Civil government',
              a: 'Replace military rule with a civil government',
              b: 'Done in July 1901, with Taft as Civil Governor.' },
            { btn: '4', short: 'A legislature',
              a: 'A two-chamber legislature, partly elected',
              b: 'The elected Assembly came in 1907.' },
            { btn: '5', short: 'Local autonomy',
              a: 'Let towns and provinces run their own affairs',
              b: 'Partly done, under American supervision.' },
            { btn: '6', short: 'Free public schools',
              a: 'A free public school system for everyone',
              b: 'Act No. 74 in 1901. The biggest change of all.' }
        ]
    });
}

/* Week 10: what actually changed in ordinary life. */
function americanChanges() {
    return listPicker({
        id: 'ac', label: 'WHAT CHANGED IN DAILY LIFE',
        alt: 'Six social changes under American rule, each with what it meant',
        rows: [
            { btn: 'Schools', short: 'Free public schools',
              a: 'Act No. 74, 1901. Free primary education for all',
              b: 'The single largest change, and the most lasting.' },
            { btn: 'English', short: 'English in class',
              a: 'English replaced Spanish as the language of school',
              b: 'It is why the Philippines is an English-speaking country.' },
            { btn: 'Thomasites', short: 'The Thomasites',
              a: 'About 500 American teachers arrived in August 1901',
              b: 'Named after their ship, the USS Thomas.' },
            { btn: 'Health', short: 'Public health',
              a: 'Sanitation campaigns, hospitals and vaccination',
              b: 'A cholera epidemic in 1902 killed tens of thousands.' },
            { btn: 'Church', short: 'Church and state',
              a: 'The friars lost their land and their political power',
              b: 'The Philippine Independent Church was founded in 1902.' },
            { btn: 'Sport', short: 'Basketball',
              a: 'American teachers and soldiers brought the game',
              b: 'It stayed. It is now the most popular sport in the country.' }
        ]
    });
}

export const FIGURES = {
    crumpleZone,
    muscleTypes,
    armPair,
    boneDensity,
    kineticChain,
    angleFit,
    regularTess,
    escherSlide,
    semiRegular,
    strikingHand,
    brainRotation,
    pluralMachine,
    digestiveTract,
    skinLayers,
    transformLab,
    decimalColumns,
    possessiveRule,
    phMap,
    roadTo1872,
    roadToRepublic,
    rizalLife,
    heartLoop,
    reflexArc,
    decimalPlaces,
    antecedentArrow,
    phFlag,
    airwayPath,
    breathingMech,
    compareDecimals,
    possessivePairs,
    reformDemands,
    spaceAwareness,
    artElements,
    artStyles,
    worldGenres,
    pinoyMusic,
    sortFlow,
    bedLayers,
    foldSteps,
    dayBlocks,
    homeRules,
    rockOrSand,
    prayerParts,
    panlapi,
    ayosPangungusap,
    kayarianSalita,
    kayarianPangungusap,
    vertebrates,
    invertebrates,
    flowerParts,
    tyndall,
    dissolveRate,
    separationMethods,
    fractionBars,
    fractionOps,
    ratioBars,
    selfPronouns,
    verbEndings,
    agreementTraps,
    roadToMalolos,
    warTimeline,
    colonialGov,
    schurmanReport,
    americanChanges
};


/** Renders a figure into a container and wires any interactivity. */
export function mountFigure(host, name) {
    const make = FIGURES[name];
    if (!make) { host.innerHTML = ''; return; }
    const fig = make();
    host.innerHTML = fig.svg;
    host.classList.add('figure');
    fig.bind?.(host);
}
