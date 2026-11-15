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
    /* ---- The electric fan, opened up ----
       He takes these apart himself, so the facts have to survive him checking.
       Every part here is one he will actually find inside the case. ---- */
    fanParts: {
        blade: {
            name: 'Blade', sub: 'usually three or five',
            job: 'Each blade is a twisted wing. It pushes air forward as it turns.',
            car: 'A propeller, not a knife. Angle is what moves air, not sharpness.',
            you: 'Hold one flat against the table and look down it — the twist is the whole design.'
        },
        motor: {
            name: 'Motor', sub: 'induction motor',
            job: 'Turns electricity into a spinning magnetic field, and the field drags the shaft round.',
            car: 'The engine. Everything else in the case exists to serve it.',
            you: 'Nothing inside it touches to make it spin. The pull is magnetic, across an air gap.'
        },
        capacitor: {
            name: 'Capacitor', sub: 'the little box',
            job: 'Gives the motor the shove that decides which way it starts turning.',
            car: 'The starter motor. Once it is running it is barely needed.',
            you: 'This is the usual dead part. A fan that hums but will not start is nearly always this.'
        },
        windings: {
            name: 'Windings', sub: 'coils of copper',
            job: 'Current through the coils makes the magnetic field. More coil, slower spin.',
            car: 'The gearbox. The speed switch picks how much winding the current goes through.',
            you: 'Speed 1 is not less power to one coil. It is a different coil.'
        },
        bearing: {
            name: 'Bearings', sub: 'at each end of the shaft',
            job: 'Hold the shaft straight and let it spin with almost no friction.',
            car: 'Wheel bearings. Dry ones rumble, then seize.',
            you: 'A fan that rattles or slows down is nearly always dry bearings, not a dead motor.'
        },
        gearbox: {
            name: 'Oscillating gearbox', sub: 'behind the motor',
            job: 'Gears the motor down and drives a crank, which swings the head side to side.',
            car: 'A crankshaft, backwards: spin in, swing out.',
            you: 'Pull the knob up and the crank disengages. The motor does not change at all.'
        },
        guard: {
            name: 'Guard', sub: 'the cage',
            job: 'Keeps fingers out while letting air through.',
            car: 'A radiator grille. Open enough to flow, tight enough to protect.',
            you: 'The gap is set by a safety standard so a finger cannot reach the blade.'
        },
        cord: {
            name: 'Cord & switch', sub: 'the way in',
            job: 'Brings mains electricity in and chooses which winding it reaches.',
            car: 'The ignition and the loom.',
            you: 'Unplug it before opening anything. The capacitor can hold a charge after the plug is out.'
        }
    },

    /* ---- Respiratory: the intake side of the engine ---- */
    airway: {
        nose: {
            name: 'Nose', sub: 'nasus',
            job: 'Filters, warms and moistens air before it goes anywhere useful.',
            car: 'The airbox and air filter. Grit caught here never reaches the engine.',
            you: 'Mouth-breathing skips all three jobs. That is why cold air bites more.'
        },
        trachea: {
            name: 'Trachea', sub: 'the windpipe',
            job: 'One tube down to the lungs, held open by rings of cartilage.',
            car: 'A reinforced intake hose. Rings stop it collapsing under suction.',
            you: 'The rings are C-shaped, open at the back, so swallowed food can bulge past.'
        },
        bronchi: {
            name: 'Bronchi', sub: 'two of them',
            job: 'The trachea splits in two, one branch into each lung.',
            car: 'The intake manifold splitting to feed each side.',
            you: 'The right one is wider and steeper, so anything inhaled usually lands there.'
        },
        bronchioles: {
            name: 'Bronchioles', sub: 'about 30,000 per lung',
            job: 'The branches keep dividing and getting narrower, like a tree.',
            car: 'Runners narrowing toward each cylinder.',
            you: 'These are the tubes that tighten in asthma. The air is not blocked, the pipe is.'
        },
        alveoli: {
            name: 'Alveoli', sub: 'about 300 million',
            job: 'Tiny air sacs one cell thick. Oxygen crosses into blood, carbon dioxide crosses out.',
            car: 'Where air finally meets fuel. Older engines did it in a carburettor, newer ones inject.',
            you: 'Flattened out they would cover about 70 square metres — a small flat.'
        },
        diaphragm: {
            name: 'Diaphragm', sub: 'the muscle that breathes',
            job: 'Pulls flat, the chest gets bigger, pressure drops, air flows in on its own.',
            car: 'The piston on its intake stroke. Nothing sucks — pressure does the work.',
            you: 'A hit here winds you: it spasms and you cannot pull it flat for a moment.'
        }
    },

    /* ---- Urinary: the oil filter ---- */
    urinary: {
        renalartery: {
            name: 'Renal artery', sub: 'the dirty side',
            job: 'Delivers blood carrying urea and everything else that needs sorting.',
            car: 'The feed line into the filter housing.',
            you: 'About a fifth of every heartbeat is sent straight to your kidneys.'
        },
        kidney: {
            name: 'Kidney', sub: 'ren · two of them',
            job: 'Filters the blood, then takes back almost everything worth keeping.',
            car: 'The oil filter. The fluid is cleaned and returned, not thrown away.',
            you: 'They filter about 180 litres a day. You pass under two. The rest goes back.'
        },
        nephron: {
            name: 'Nephron', sub: 'about a million per kidney',
            job: 'The actual filter unit. Everything small is pushed out, then the useful part reclaimed.',
            car: 'One filter element. A kidney is a million of them in parallel.',
            you: 'Sugar in your urine means they were overwhelmed. Normally none escapes.'
        },
        ureter: {
            name: 'Ureter', sub: 'about 25 cm each',
            job: 'Carries urine from kidney down to the bladder.',
            car: 'The return line. It squeezes rather than trusting gravity.',
            you: 'It has muscle in its wall, so it works whichever way up you are.'
        },
        bladder: {
            name: 'Bladder', sub: 'vesica urinaria',
            job: 'A muscular bag that stretches to hold urine until you decide.',
            car: 'The catch tank. It buffers so the system is not always dumping.',
            you: 'You feel it at about 200 ml. It can hold two or three times that.'
        },
        urethra: {
            name: 'Urethra', sub: 'the way out',
            job: 'The final tube. A ring of muscle keeps it shut until you release it.',
            car: 'The drain plug, with a valve you control.',
            you: 'This is the one part of the whole route you have a say over.'
        }
    },

    /* ---- Nervous: the ECU and the loom ---- */
    nervous: {
        cerebrum: {
            name: 'Cerebrum', sub: 'the wrinkled part',
            job: 'Thinking, deciding, remembering, and every movement you choose to make.',
            car: 'The ECU. It reads everything and decides what the machine does.',
            you: 'The wrinkles are folds. Flattened out it would cover a pillowcase.'
        },
        cerebellum: {
            name: 'Cerebellum', sub: 'the little brain',
            job: 'Balance, timing and smoothness. It does not choose the move, it makes it clean.',
            car: 'Traction and stability control. You asked for it; this makes it not a mess.',
            you: 'Practising a combination until it stops feeling clumsy is this part learning.'
        },
        brainstem: {
            name: 'Brainstem', sub: 'truncus encephali',
            job: 'Breathing, heartbeat, swallowing. The jobs you never decide to do.',
            car: 'The idle controller. It keeps everything running while you think about other things.',
            you: 'This is why you keep breathing asleep. It was never up to you.'
        },
        spinalcord: {
            name: 'Spinal cord', sub: 'about 45 cm',
            job: 'The main cable between brain and body, protected inside the backbone.',
            car: 'The wiring loom. Every signal in either direction runs down it.',
            you: 'Damage high up cuts off everything below, because there is no second route.'
        },
        nerves: {
            name: 'Nerves', sub: 'the peripheral system',
            job: 'Branch off the cord to every muscle and every patch of skin.',
            car: 'The wires out to each sensor and actuator.',
            you: 'The fastest carry signals at about 100 metres a second. 360 km/h.'
        }
    },

    /* Four chambers plus the four great vessels. The artery/vein facts are the
       ones worth having early: an artery is not "the red one", it is the one
       leaving the heart — which is why the pulmonary artery carries the
       oxygen-poor blood and the pulmonary veins carry the rich. */
    heartParts: {
        rightatrium: {
            name: 'Right atrium', sub: 'atrium dextrum',
            job: 'Catches oxygen-poor blood coming back from the whole body.',
            car: 'The return tank. Everything used up arrives here first.',
            you: 'Thin walls. It only has to push blood to the chamber below it.'
        },
        rightventricle: {
            name: 'Right ventricle', sub: 'ventriculus dexter',
            job: 'Pumps that blood to the lungs to pick up oxygen.',
            car: 'The low-pressure pump. The lungs are a short trip away.',
            you: 'Thicker than the atrium above it, thinner than its partner across the wall.'
        },
        leftatrium: {
            name: 'Left atrium', sub: 'atrium sinistrum',
            job: 'Catches oxygen-rich blood arriving back from the lungs.',
            car: 'The collector on the clean side, just after the intercooler.',
            you: 'The only place in your body where veins carry oxygen-rich blood.'
        },
        leftventricle: {
            name: 'Left ventricle', sub: 'ventriculus sinister',
            job: 'Pumps oxygen-rich blood to every part of you. The hardest push.',
            car: 'The high-pressure pump. Thickest wall because it works hardest.',
            you: 'Train hard for months and this is the chamber that grows.'
        },
        aorta: {
            name: 'Aorta', sub: 'the biggest artery you have',
            job: 'Carries oxygen-rich blood out of the left ventricle to the body.',
            car: 'The main fuel rail. Everything else branches off it.',
            you: 'About as wide as a garden hose, and it flexes with every beat.'
        },
        pulmonaryartery: {
            name: 'Pulmonary artery', sub: 'the odd one out',
            job: 'Carries oxygen-poor blood from the right ventricle to the lungs.',
            car: 'The pipe to the intercooler, where the charge gets fresh again.',
            you: 'An artery is one that LEAVES the heart. That is why this one is blue.'
        },
        pulmonaryveins: {
            name: 'Pulmonary veins', sub: 'the other odd one out',
            job: 'Bring oxygen-rich blood back from the lungs into the left atrium.',
            car: 'The return from the intercooler, on its way to the pump.',
            you: 'A vein is one that RETURNS to the heart. These are the red ones.'
        },
        venacava: {
            name: 'Vena cava', sub: 'superior and inferior',
            job: 'Two huge veins returning oxygen-poor blood from above and below.',
            car: 'The return line, gathering everything that has been used.',
            you: 'One drains your head and arms, the other everything below your chest.'
        }
    },

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

/* Anterior view, so the RIGHT chambers are on the viewer's LEFT. The outline
   is drawn once as a backing shape so the thing always reads as a heart; the
   tappable parts sit inside it rather than trying to tile it themselves. */
/* ==========================================================================
   ruleLab — he picks the input, the law shows him what it does.

   Every other figure here explains something to him. This one makes him the
   one who moves, which is the only way a rule like "speed is squared" ever
   stops being a sentence to memorise: he presses 40, then 80, and watches the
   bar go up four times rather than twice.

   Bars are drawn to scale against the largest value the lab can produce, so
   the jump is visible rather than stated. Nothing moves until he presses
   something — the bars resize on his tap, which is a response, not ambient
   motion.

   Each output takes f(v) and a fmt, so the same engine serves percentages,
   exponents, volume and kinetic energy.
   ========================================================================== */
function ruleLab({ id, label, alt, input, outputs, rule, sharedScale = false, height }) {
    // Fit the canvas to the rows rather than leaving a hole under a short lab.
    height = height || 108 + outputs.length * 54 + 34;
    const BAR_X = 150, BAR_W = 212;
    const rowY = i => 96 + i * 54;

    return {
        svg: `
<svg viewBox="0 0 400 ${height}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="20">${label}</text>
  <text class="fig-note fig-note-key" id="${id}In" x="20" y="56">&#160;</text>
  ${outputs.map((o, i) => `
  <text class="fig-cell" x="20" y="${rowY(i) + 5}">${o.name}</text>
  <rect class="fig-bar-track" x="${BAR_X}" y="${rowY(i) - 11}" width="${BAR_W}" height="16" rx="8"/>
  <rect class="fig-bar" id="${id}B${i}" x="${BAR_X}" y="${rowY(i) - 11}" width="0" height="16" rx="8"/>
  <text class="fig-cell fig-bar-val" id="${id}V${i}" x="${BAR_X + BAR_W}" y="${rowY(i) + 24}" text-anchor="end">&#160;</text>`).join('')}
  <text class="fig-note" id="${id}R" x="20" y="${height - 16}">&#160;</text>
</svg>`,
        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            bar.innerHTML = input.values.map((v, i) =>
                `<button data-i="${i}" aria-pressed="${i === 0}">${input.label ? input.label(v) : v}${input.unit || ''}</button>`).join('');
            root.appendChild(bar);

            const inEl = root.querySelector(`#${id}In`);
            const ruleEl = root.querySelector(`#${id}R`);
            // Scale every bar against the biggest value this lab can reach, so
            // the proportions between presses are honest.
            let peak = outputs.map(o => Math.max(...input.values.map(v => Math.abs(o.f(v)))) || 1);
            // When the rows are meant to be read against each other, one scale
            // or the comparison lies: a constant row would otherwise fill the
            // bar and look like the biggest thing on screen.
            if (sharedScale) { const top = Math.max(...peak); peak = peak.map(() => top); }

            const show = i => {
                const v = input.values[i];
                inEl.textContent = `${input.name}: ${input.label ? input.label(v) : v}${input.unit || ''}`;
                fitText(inEl);
                outputs.forEach((o, j) => {
                    const out = o.f(v);
                    root.querySelector(`#${id}B${j}`).setAttribute('width',
                        String(Math.max(2, Math.round(212 * Math.abs(out) / peak[j]))));
                    root.querySelector(`#${id}V${j}`).textContent = o.fmt ? o.fmt(out, v) : String(out);
                });
                if (ruleEl) { ruleEl.textContent = typeof rule === 'function' ? rule(v) : (rule || ''); fitText(ruleEl); }
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

/* ==========================================================================
   orderLab — he chooses which part to work out first, and the expression
   actually collapses in front of him.

   Order of operations is usually taught as a word to chant. Chanting it does
   not stop anyone adding before they multiply. Here a wrong choice is allowed
   and answered calmly — the line shows what that choice would give and why it
   is not the rule — and a right choice rewrites the expression one step
   shorter. He gets to the answer by making the decisions.
   ========================================================================== */
function orderLab({ id, label, alt, steps, height = 196 }) {
    return {
        svg: `
<svg viewBox="0 0 400 ${height}" role="img" aria-labelledby="${id}T">
  <title id="${id}T">${alt}</title>
  <text class="fig-label" x="20" y="20">${label}</text>
  <text class="fig-expr" id="${id}E" x="200" y="76" text-anchor="middle">&#160;</text>
  <text class="fig-note fig-note-key" id="${id}A" x="20" y="${height - 50}">&#160;</text>
  <text class="fig-note"              id="${id}B" x="20" y="${height - 26}">&#160;</text>
</svg>`,
        bind(root) {
            const bar = document.createElement('div');
            bar.className = 'fig-switch';
            root.appendChild(bar);
            const expr = root.querySelector(`#${id}E`);
            const a = root.querySelector(`#${id}A`);
            const b = root.querySelector(`#${id}B`);
            let at = 0;

            const draw = () => {
                const st = steps[at];
                expr.textContent = st.expr;
                fitText(expr);
                if (!st.choices) {           // the final line: done
                    bar.innerHTML = `<button data-reset="1">Start again</button>`;
                    a.textContent = st.done || 'Done.';
                    b.textContent = '';
                    fitText(a);
                    return;
                }
                bar.innerHTML = st.choices.map((c, i) =>
                    `<button data-i="${i}">${c.btn}</button>`).join('');
                a.textContent = st.ask || 'Which part do you work out first?';
                b.textContent = '';
                fitText(a);
            };

            bar.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                if (btn.dataset.reset) { at = 0; draw(); return; }
                const pick = steps[at].choices[Number(btn.dataset.i)];
                if (pick.ok) { at++; draw(); }
                else {
                    // Never "wrong". Show what that move would give, and the rule.
                    a.textContent = pick.gives;
                    b.textContent = pick.why;
                    fitText(a); fitText(b);
                }
            });
            draw();
        }
    };
}

/* Irregular verbs, with sentences from his world rather than from a textbook.
   The pattern is the lesson: regular verbs add -ed, these change their vowel
   or their whole shape, and there is no rule — only exposure. */
function irregularVerbs() {
    return listPicker({
        id: 'iv', label: 'TAP A VERB · SEE IT CHANGE',
        alt: 'Eight irregular verbs with their past tense forms and an example sentence for each',
        capA: 'Past: ', capB: 'In a sentence: ',
        rows: [
            { short: 'catch', a: 'caught (not catched)', b: 'He caught the jab on his glove.' },
            { short: 'break', a: 'broke (not breaked)', b: 'The typhoon broke the fence overnight.' },
            { short: 'build', a: 'built (not builded)', b: 'I built the whole base before sunrise.' },
            { short: 'spin', a: 'spun (not spinned)', b: 'The blades spun for ten seconds after I switched it off.' },
            { short: 'drive', a: 'drove (not drived)', b: 'She drove the last lap on worn tyres.' },
            { short: 'think', a: 'thought (not thinked)', b: 'I thought the capacitor was dead.' },
            { short: 'lose', a: 'lost (not losed)', b: 'He lost because he had not trained.' },
            { short: 'take', a: 'took (not taked)', b: 'I took the fan apart on the kitchen floor.' }
        ]
    });
}

/* GEMDAS, worked by him rather than recited at him. */
function gemdasLab() {
    return orderLab({
        id: 'gm', label: 'YOU PICK THE FIRST MOVE',
        alt: 'An interactive where the learner chooses which part of an expression to evaluate first, with the order of operations enforced',
        steps: [
            { expr: '4 + 3 × 2²',
              ask: 'Which part do you work out first?',
              choices: [
                { btn: '4 + 3', ok: false, gives: 'That would give 7 × 2², which is 28.',
                  why: 'Addition is last. The exponent comes before everything here.' },
                { btn: '3 × 2', ok: false, gives: 'That would give 4 + 6², which is 40.',
                  why: 'The exponent is attached to the 2 alone, not to 3 × 2.' },
                { btn: '2²', ok: true } ] },
            { expr: '4 + 3 × 4',
              ask: 'The exponent is gone. What now?',
              choices: [
                { btn: '4 + 3', ok: false, gives: 'That would give 7 × 4, which is 28.',
                  why: 'Multiply before you add. Always, unless brackets say otherwise.' },
                { btn: '3 × 4', ok: true } ] },
            { expr: '4 + 12',
              ask: 'Only one move left.',
              choices: [ { btn: '4 + 12', ok: true } ] },
            { expr: '16', done: 'Exponent, then multiply, then add. 16.' }
        ]
    });
}

/* Speed is squared and mass is not. Pressing 20 then 40 makes that one fact
   impossible to miss: one bar doubles, the other quadruples. */
function squareLawLab() {
    const base = 20;
    return ruleLab({
        id: 'sq', label: 'PRESS A SPEED · WATCH BOTH BARS',
        alt: 'A lab where choosing a speed shows that kinetic energy grows with the square of speed while mass grows in proportion',
        input: { name: 'Speed', unit: ' km/h', values: [20, 40, 80, 160] },
        sharedScale: true,
        outputs: [
            { name: 'Double the MASS', f: () => 2, fmt: () => '×2, always' },
            { name: 'This SPEED', f: v => (v / base) ** 2, fmt: o => `×${o}` }
        ],
        rule: v => `At ${v} km/h the energy is ${(v / base) ** 2} times what it is at ${base}.`
    });
}

/* One quantity, three ways of writing it. He presses a fraction and sees the
   decimal and the percentage land together. */
function percentLab() {
    return ruleLab({
        id: 'pc', label: 'ONE AMOUNT · THREE NAMES',
        alt: 'A lab showing the same quantity written as a fraction, a decimal and a percentage',
        input: { name: 'Fraction', values: [0.25, 0.5, 0.75, 1], label: v => ({0.25:'1/4',0.5:'1/2',0.75:'3/4',1:'1'}[v]) },
        outputs: [
            { name: 'As a decimal', f: v => v, fmt: o => o.toFixed(2) },
            { name: 'As a percentage', f: v => v * 100, fmt: o => `${o}%` },
            { name: 'Of 60 marks', f: v => v * 60, fmt: o => `${o} marks` }
        ],
        rule: 'Per cent means per hundred. Move the decimal two places and you have it.'
    });
}

/* Volume is three dimensions multiplied, so doubling one edge doubles the
   volume and doubling all three multiplies it by eight. */
function volumeLab() {
    return ruleLab({
        id: 'vl', label: 'PRESS AN EDGE LENGTH',
        alt: 'A lab showing how the volume of a cube grows as its edge length grows',
        input: { name: 'Edge', unit: ' cm', values: [1, 2, 3, 4] },
        outputs: [
            { name: 'Edge doubled only', f: v => v * 2, fmt: o => `${o} cm` },
            { name: 'Volume of the cube', f: v => v ** 3, fmt: o => `${o} cm³` }
        ],
        rule: v => `${v} × ${v} × ${v} = ${v ** 3} cm³. Three edges multiplied, not added.`
    });
}

/* An electric fan seen from the front, opened up. Drawn so the parts sit where
   he will find them when he takes the case off: motor behind the blades,
   capacitor and gearbox behind the motor, bearings on the shaft. */
function fanParts() {
    return {
        svg: `<svg viewBox="0 0 240 300" role="img" aria-labelledby="fpT">
  <title id="fpT">An electric fan from the front with its case open: guard, blades, motor, windings, capacitor, bearings, oscillating gearbox, and the cord</title>

  <g class="organ" data-part="guard" role="button" tabindex="0" aria-label="Guard"><title>Guard</title>
    <circle cx="120" cy="104" r="86" fill="none" stroke-width="4"/>
    <circle cx="120" cy="104" r="68" fill="none" stroke-width="2.5"/>
    <circle cx="120" cy="104" r="50" fill="none" stroke-width="2.5"/></g>

  <g class="organ" data-part="blade" role="button" tabindex="0" aria-label="Blade"><title>Blade</title>
    <path d="M120 86 C150 70 176 78 182 96 C168 104 140 102 122 98 Z"/>
    <path d="M128 118 C150 142 146 168 130 178 C120 166 114 140 116 122 Z"/>
    <path d="M110 112 C78 126 54 116 50 98 C66 88 94 92 110 100 Z"/>
    <path d="M114 88 C96 62 102 36 120 28 C129 40 132 68 128 86 Z"/></g>

  <g class="organ" data-part="windings" role="button" tabindex="0" aria-label="Windings"><title>Windings</title>
    <circle cx="120" cy="104" r="30" fill="none" stroke-width="7"/></g>
  <g class="organ" data-part="motor" role="button" tabindex="0" aria-label="Motor"><title>Motor</title>
    <circle cx="120" cy="104" r="20"/></g>
  <g class="organ" data-part="bearing" role="button" tabindex="0" aria-label="Bearings"><title>Bearings</title>
    <circle cx="120" cy="104" r="8"/>
    <circle cx="120" cy="150" r="7"/></g>

  <g class="organ" data-part="capacitor" role="button" tabindex="0" aria-label="Capacitor"><title>Capacitor</title>
    <rect x="164" y="176" width="26" height="36" rx="5"/></g>
  <g class="organ" data-part="gearbox" role="button" tabindex="0" aria-label="Oscillating gearbox"><title>Oscillating gearbox</title>
    <path d="M96 176 h48 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 Z"/>
    <circle class="fold" cx="120" cy="195" r="9" fill="none"/></g>

  <rect class="organ-bg" x="104" y="214" width="32" height="40" rx="5"/>
  <path class="organ-bg" d="M78 254 h84 a10 10 0 0 1 10 10 v10 h-104 v-10 a10 10 0 0 1 10 -10 Z"/>

  <g class="organ tube" data-part="cord" role="button" tabindex="0" aria-label="Cord and switch"><title>Cord and switch</title>
    <path d="M172 268 C196 272 208 282 214 292" fill="none" stroke-width="6" stroke-linecap="round"/></g>
</svg>`
    };
}

/* Intake side: nose down to the sacs, with the muscle that drives it all. */
/* Five kinds of colloid, each named by what is dispersed in what. The pairing
   is the whole idea: "colloid" is not one thing, it is a size band that any
   two states of matter can sit in. */
function colloidKinds() {
    return listPicker({
        id: 'ck', label: 'FIVE COLLOIDS · WHAT IS IN WHAT',
        alt: 'The five kinds of colloid, each with what is dispersed, what it is dispersed in, and an everyday example',
        capA: 'Is: ', capB: 'Like: ',
        rows: [
            { short: 'Sol — solid in liquid',
              a: 'Solid specks spread through a liquid',
              b: 'Paint. The pigment never dissolves, it is just too small to settle.' },
            { short: 'Gel — liquid in solid',
              a: 'Liquid held inside a solid mesh',
              b: 'Jelly. Mostly water, but it holds its shape.' },
            { short: 'Emulsion — liquid in liquid',
              a: 'Droplets of one liquid inside another',
              b: 'Milk. Fat droplets spread through water.' },
            { short: 'Foam — gas in liquid',
              a: 'Gas bubbles trapped in a liquid',
              b: 'Whipped cream. Mostly air by volume.' },
            { short: 'Aerosol — in a gas',
              a: 'Liquid droplets or solid specks floating in gas',
              b: 'Fog is water in air. Smoke is solid in air.' }
        ]
    });
}

function airway() {
    return {
        svg: `<svg viewBox="0 0 230 300" role="img" aria-labelledby="awT">
  <title id="awT">The airway from nose to alveoli, with the two lungs and the diaphragm beneath them</title>

  <path class="organ-bg" d="M100 118 C66 120 46 150 44 190 C42 226 56 250 84 252 C100 250 104 226 104 196 Z"/>
  <path class="organ-bg" d="M130 118 C164 120 184 150 186 190 C188 226 174 250 146 252 C130 250 126 226 126 196 Z"/>

  <g class="organ" data-part="nose" role="button" tabindex="0" aria-label="Nose"><title>Nose</title>
    <path d="M100 18 C86 26 82 42 94 50 L136 50 C148 42 144 26 130 18 Z"/></g>
  <g class="organ" data-part="trachea" role="button" tabindex="0" aria-label="Trachea"><title>Trachea</title>
    <rect x="105" y="54" width="20" height="60" rx="7"/></g>
  <g class="organ tube" data-part="bronchi" role="button" tabindex="0" aria-label="Bronchi"><title>Bronchi</title>
    <path d="M112 116 C104 134 92 142 76 148" fill="none" stroke-width="11" stroke-linecap="round"/>
    <path d="M118 116 C126 134 138 142 154 148" fill="none" stroke-width="11" stroke-linecap="round"/></g>
  <g class="organ tube" data-part="bronchioles" role="button" tabindex="0" aria-label="Bronchioles"><title>Bronchioles</title>
    <path d="M76 150 C66 162 62 176 60 190 M76 150 C80 166 80 180 78 194" fill="none" stroke-width="6" stroke-linecap="round"/>
    <path d="M154 150 C164 162 168 176 170 190 M154 150 C150 166 150 180 152 194" fill="none" stroke-width="6" stroke-linecap="round"/></g>
  <g class="organ" data-part="alveoli" role="button" tabindex="0" aria-label="Alveoli"><title>Alveoli</title>
    <circle cx="58" cy="200" r="8"/><circle cx="74" cy="206" r="8"/><circle cx="62" cy="218" r="8"/>
    <circle cx="172" cy="200" r="8"/><circle cx="156" cy="206" r="8"/><circle cx="168" cy="218" r="8"/></g>
  <g class="organ" data-part="diaphragm" role="button" tabindex="0" aria-label="Diaphragm"><title>Diaphragm</title>
    <path d="M40 268 C80 246 150 246 190 268 L190 282 C150 262 80 262 40 282 Z"/></g>
</svg>`
    };
}

/* Two filters, the lines down, and the tank you control the valve on. */
function urinary() {
    return {
        svg: `<svg viewBox="0 0 230 300" role="img" aria-labelledby="urT">
  <title id="urT">The urinary system: two kidneys, their vessels, the ureters running down to the bladder and out</title>

  <g class="organ tube" data-part="renalartery" role="button" tabindex="0" aria-label="Renal artery"><title>Renal artery</title>
    <path d="M115 56 L115 104" fill="none" stroke-width="12" stroke-linecap="round"/>
    <path d="M113 74 C100 76 92 80 84 86 M117 80 C130 82 138 86 146 92" fill="none" stroke-width="9" stroke-linecap="round"/></g>

  <g class="organ" data-part="kidney" role="button" tabindex="0" aria-label="Kidney"><title>Kidney</title>
    <path d="M78 58 C56 58 44 76 44 96 C44 116 56 132 76 132 C86 132 88 120 84 106 C80 94 80 84 84 74 C88 64 86 58 78 58 Z"/>
    <path d="M152 58 C174 58 186 76 186 96 C186 116 174 132 154 132 C144 132 142 120 146 106 C150 94 150 84 146 74 C142 64 144 58 152 58 Z"/></g>

  <g class="organ" data-part="nephron" role="button" tabindex="0" aria-label="Nephron"><title>Nephron</title>
    <circle cx="62" cy="86" r="7"/><path d="M62 93 C62 104 54 106 56 116" fill="none" stroke-width="4" stroke-linecap="round"/>
    <circle cx="168" cy="86" r="7"/><path d="M168 93 C168 104 176 106 174 116" fill="none" stroke-width="4" stroke-linecap="round"/></g>

  <g class="organ tube" data-part="ureter" role="button" tabindex="0" aria-label="Ureter"><title>Ureter</title>
    <path d="M76 132 C82 172 96 196 106 212" fill="none" stroke-width="9" stroke-linecap="round"/>
    <path d="M154 132 C148 172 134 196 124 212" fill="none" stroke-width="9" stroke-linecap="round"/></g>

  <g class="organ" data-part="bladder" role="button" tabindex="0" aria-label="Bladder"><title>Bladder</title>
    <path d="M86 216 C84 244 96 258 115 258 C134 258 146 244 144 216 C126 208 104 208 86 216 Z"/></g>
  <g class="organ" data-part="urethra" role="button" tabindex="0" aria-label="Urethra"><title>Urethra</title>
    <rect x="108" y="258" width="14" height="30" rx="6"/></g>
</svg>`
    };
}

/* The ECU, the stability controller, the idle controller, and the loom. */
function nervous() {
    return {
        svg: `<svg viewBox="0 0 230 300" role="img" aria-labelledby="nvT">
  <title id="nvT">The central nervous system: the folded cerebrum, the cerebellum behind and below it, the brainstem running into the spinal cord, and nerves branching off</title>

  <g class="organ" data-part="cerebrum" role="button" tabindex="0" aria-label="Cerebrum"><title>Cerebrum</title>
    <path d="M58 82 C54 44 88 20 122 22 C158 24 180 46 178 78 C176 102 156 116 128 118 C98 120 62 112 58 82 Z"/>
    <path class="fold" d="M74 52 C90 62 108 62 124 52 M70 74 C90 86 114 86 136 74
                          M84 98 C100 106 118 106 134 98 M148 44 C158 56 160 70 152 84" fill="none"/></g>
  <g class="organ" data-part="cerebellum" role="button" tabindex="0" aria-label="Cerebellum"><title>Cerebellum</title>
    <path d="M136 122 C164 116 188 126 188 144 C188 162 166 170 142 164 C128 158 126 130 136 122 Z"/>
    <path class="fold" d="M140 132 L182 136 M138 144 L186 146 M140 156 L180 156" fill="none"/></g>
  <g class="organ" data-part="brainstem" role="button" tabindex="0" aria-label="Brainstem"><title>Brainstem</title>
    <path d="M104 116 C120 116 126 128 124 148 C122 166 120 176 112 176 C102 176 98 164 98 144 C98 126 96 116 104 116 Z"/></g>
  <g class="organ tube" data-part="spinalcord" role="button" tabindex="0" aria-label="Spinal cord"><title>Spinal cord</title>
    <path d="M111 176 L111 272" fill="none" stroke-width="15" stroke-linecap="round"/></g>
  <g class="organ tube" data-part="nerves" role="button" tabindex="0" aria-label="Nerves"><title>Nerves</title>
    <path d="M105 196 C86 200 70 208 54 220 M117 208 C138 212 156 220 172 232
             M105 232 C86 236 70 244 54 256 M117 244 C138 248 156 256 172 268" fill="none" stroke-width="6" stroke-linecap="round"/></g>
</svg>`
    };
}

function heartParts() {
    return {
        svg: `<svg viewBox="0 0 244 286" role="img" aria-labelledby="hpT">
  <title id="hpT">A human heart seen from the front, with the four chambers and the great vessels each tappable</title>

  <g class="organ" data-part="venacava" role="button" tabindex="0" aria-label="Vena cava"><title>Vena cava</title>
    <rect x="68" y="12"  width="23" height="116" rx="11"/>
    <rect x="68" y="196" width="23" height="84"  rx="11"/></g>
  <g class="organ tube" data-part="aorta" role="button" tabindex="0" aria-label="Aorta"><title>Aorta</title>
    <path d="M164 150 C168 84 146 40 110 46" fill="none" stroke-width="19" stroke-linecap="round"/></g>
  <g class="organ tube" data-part="pulmonaryartery" role="button" tabindex="0" aria-label="Pulmonary artery"><title>Pulmonary artery</title>
    <path d="M116 170 C122 96 150 62 198 66" fill="none" stroke-width="16" stroke-linecap="round"/></g>
  <g class="organ" data-part="pulmonaryveins" role="button" tabindex="0" aria-label="Pulmonary veins"><title>Pulmonary veins</title>
    <rect x="188" y="118" width="52" height="14" rx="7"/>
    <rect x="188" y="146" width="52" height="14" rx="7"/></g>

  <path class="heart-body" d="M72 112 C52 128 48 158 58 188 C68 222 104 250 164 260
                              C188 238 204 202 208 172 C214 142 204 112 182 104
                              C166 98 150 110 132 112 C116 100 90 98 72 112 Z"/>

  <g class="organ" data-part="rightatrium" role="button" tabindex="0" aria-label="Right atrium"><title>Right atrium</title>
    <path d="M76 112 C58 126 54 152 62 172 C82 178 110 176 126 166 C128 142 126 122 124 114 C108 106 88 106 76 112 Z"/></g>
  <g class="organ" data-part="leftatrium" role="button" tabindex="0" aria-label="Left atrium"><title>Left atrium</title>
    <path d="M140 114 C158 110 176 104 186 108 C204 116 210 140 206 164 C188 172 158 172 140 164 C136 146 136 128 140 114 Z"/></g>
  <g class="organ" data-part="rightventricle" role="button" tabindex="0" aria-label="Right ventricle"><title>Right ventricle</title>
    <path d="M62 178 C70 212 100 244 152 256 C146 228 138 198 134 174 C112 182 84 184 62 178 Z"/></g>
  <g class="organ" data-part="leftventricle" role="button" tabindex="0" aria-label="Left ventricle"><title>Left ventricle</title>
    <path d="M140 172 C160 178 188 176 204 170 C200 202 184 232 162 254 C152 226 144 198 140 172 Z"/></g>
</svg>`
    };
}

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
        viewBox: '0 0 400 352',
        labels: {
            x: 132, y: 20, text: 'TWO LOOPS, ONE PUMP', capY: 322,
            alt: 'A heart drawn as the organ, its four chambers labelled, with arrows tracing blood from the body to the right side, out to the lungs, back to the left side, and out to the body'
        },
        /* Drawn as the organ, not a box. Anterior view, so the RIGHT chambers
           sit on the viewer's LEFT — the convention every textbook and every
           exam diagram uses, and the reason the labels look swapped until you
           know that. The apex points down and to the patient's left.
           The left ventricle's wall is drawn genuinely thicker because the
           last step of the figure says it is. */
        scene: `
  <rect class="fig-organ" x="24"  y="26"  width="104" height="44" rx="10"/>
  <text class="fig-organ-t" x="76"  y="54"  text-anchor="middle">LUNGS</text>
  <rect class="fig-organ" x="272" y="250" width="104" height="44" rx="10"/>
  <text class="fig-organ-t" x="324" y="278" text-anchor="middle">BODY</text>

  <path class="fig-pump" d="M146 112 C126 128 122 158 132 188
                            C142 222 178 250 238 260
                            C262 238 278 202 282 172
                            C288 142 278 112 256 104
                            C240 98 224 110 206 112
                            C190 100 164 98 146 112 Z"/>
  <path class="fig-wall" d="M276 174 C272 202 254 232 234 252"/>
  <path class="fig-divide" d="M206 98 C200 152 214 212 232 252"/>
  <path class="fig-divide" d="M130 160 C158 172 186 170 205 160"/>
  <path class="fig-divide" d="M205 160 C230 170 258 166 282 154"/>

  <text class="fig-chamber fig-chamber-strong" x="168" y="126" text-anchor="middle">right</text>
  <text class="fig-chamber" x="168" y="140" text-anchor="middle">atrium</text>
  <text class="fig-chamber fig-chamber-strong" x="174" y="200" text-anchor="middle">right</text>
  <text class="fig-chamber" x="174" y="214" text-anchor="middle">ventricle</text>
  <text class="fig-chamber fig-chamber-strong" x="246" y="126" text-anchor="middle">left</text>
  <text class="fig-chamber" x="246" y="140" text-anchor="middle">atrium</text>
  <text class="fig-chamber fig-chamber-strong" x="248" y="200" text-anchor="middle">left</text>
  <text class="fig-chamber" x="248" y="214" text-anchor="middle">ventricle</text>`,
        /* The arrows meet the chamber they actually belong to: blood arrives in
           the right ATRIUM and leaves from the right VENTRICLE. Getting those
           two the wrong way up would teach the wrong thing to a reader who can
           see the labels. */
        segs: [
            { d: 'M292 268 C198 306 88 274 68 212 C58 180 80 154 116 150',
              tip: '116,150', rot: 349 },
            { d: 'M146 212 C132 198 126 176 124 154 C120 124 112 98 106 80',
              tip: '106,80',  rot: 253 },
            { d: 'M116 70  C168 84 214 88 244 96', tip: '244,96',  rot: 17 },
            { d: 'M258 228 C274 242 282 250 292 256', tip: '292,256', rot: 33 }
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
    // .fig-mono is the same family at 22px: 9.211 * 22 / 15.
    const CH = 13.51;
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
    // Measured advance of .fig-sent (15px monospace) in the browser. The old
    // 8.4 was short enough to overlap once a segment ran past ~12 characters.
    const CH = 9.211;
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
                 + line([{ t: 'Nagsanay ng suntok ' }, { t: 'ang boksingero.', hi: true }], 104)
                 + `<text class="fig-step" x="200" y="140" text-anchor="middle">PANAGURI — SIMUNO · WALANG "AY"</text>`,
              a: 'Karaniwang ayos: panaguri muna, simuno sa huli',
              b: 'Walang panandang "ay". Ito ang mas madalas sa Filipino.' },
            { btn: 'Di-karaniwan',
              svg: `<text class="fig-step" x="200" y="56" text-anchor="middle">SIMUNO MUNA</text>`
                 + line([{ t: 'Ang boksingero ', hi: true }, { t: 'ay ' }, { t: 'nagsanay ng suntok.' }], 104)
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
              b: 'takbo · suntok · bilis · laro' },
            { btn: 'Maylapi', short: 'Maylapi', a: 'May panlapi sa ugat',
              b: 'tumakbo · sumuntok · naglaro · bilisan' },
            { btn: 'Inuulit', short: 'Inuulit', a: 'Inuulit ang buo o bahagi ng ugat',
              b: 'araw-araw · dahan-dahan · unti-unti' },
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
              b: 'Umaandar ang makina ng sasakyan.' },
            { btn: 'Tambalan', short: 'Tambalan', a: 'Dalawang punong sugnay',
              b: 'Lumindol kagabi at bumaha kaninang umaga. (at, ngunit, o)' },
            { btn: 'Hugnayan', short: 'Hugnayan', a: 'Punong sugnay at palipong sugnay',
              b: 'Natalo siya dahil hindi siya nagsanay. (dahil, kung, kapag)' },
            { btn: 'Langkapan', short: 'Langkapan', a: 'Pinagsamang tambalan at hugnayan',
              b: 'Nagsanay siya at nanalo dahil handa na siya.' }
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


/* ---- MAPEH weeks 6-10 ------------------------------------------------ */

/* Week 6: colour relationships, shown in actual colour. */
function colorSchemes() {
    const dot = (x, fill, label) => `
        <circle cx="${x}" cy="112" r="30" fill="${fill}" stroke="#2a2a2e" stroke-width="1.5"/>
        <text class="fig-mono" x="${x}" y="162" text-anchor="middle">${label}</text>`;
    const row = arr => arr.map(([f, l], i) =>
        dot(Math.round(200 - (arr.length - 1) * 45 + i * 90), f, l)).join('');
    return demoSwitch({
        id: 'cs', label: 'COLOUR RELATIONSHIPS', height: 250, capY: 200,
        alt: 'Six colour relationships shown as coloured circles with names',
        demos: [
            { btn: 'Primary', svg: row([['#d94a3d', 'red'], ['#e8c33a', 'yellow'], ['#3f6fd1', 'blue']]),
              a: 'Primary: red, yellow, blue',
              b: 'You cannot mix these from anything else.' },
            { btn: 'Secondary', svg: row([['#e08a30', 'orange'], ['#4a9e5c', 'green'], ['#7d5aa8', 'violet']]),
              a: 'Secondary: orange, green, violet',
              b: 'Each one is two primaries mixed together.' },
            { btn: 'Warm', svg: row([['#d94a3d', 'red'], ['#e08a30', 'orange'], ['#e8c33a', 'yellow']]),
              a: 'Warm colours come forward',
              b: 'Fire and sunlight. They look closer than they are.' },
            { btn: 'Cool', svg: row([['#3f6fd1', 'blue'], ['#4a9e5c', 'green'], ['#7d5aa8', 'violet']]),
              a: 'Cool colours fall back',
              b: 'Water and shade. They look further away.' },
            { btn: 'Opposite', svg: row([['#d94a3d', 'red'], ['#4a9e5c', 'green']]),
              a: 'Complementary: opposite on the wheel',
              b: 'Side by side they both look brighter.' },
            { btn: 'Neutral', svg: row([['#2a2a2e', 'dark'], ['#8a8a90', 'grey'], ['#f2f0ec', 'light']]),
              a: 'Neutrals let a colour breathe',
              b: 'Used around a bright colour, not instead of it.' }
        ]
    });
}

/* Week 7: how sports are grouped, by what the game asks of you. */
function sportCategories() {
    return listPicker({
        id: 'sp7', label: 'HOW SPORTS ARE GROUPED',
        alt: 'Six categories of sport with an example and what each one demands',
        capA: 'Means: ', capB: 'Example: ',
        rows: [
            { btn: 'Solo', short: 'Individual',
              a: 'One person, one result', b: 'Sprinting, swimming, gymnastics.' },
            { btn: 'Dual', short: 'Dual',
              a: 'One against one, or two against two', b: 'Boxing, badminton, table tennis.' },
            { btn: 'Team', short: 'Team',
              a: 'A group with a shared score', b: 'Basketball, volleyball, football.' },
            { btn: 'Invade', short: 'Invasion game',
              a: 'You enter their territory to score', b: 'Basketball, football, rugby.' },
            { btn: 'Net', short: 'Net or wall game',
              a: 'A barrier separates the two sides', b: 'Volleyball, badminton, tennis.' },
            { btn: 'Target', short: 'Target game',
              a: 'You aim at something that does not move', b: 'Archery, bowling, darts.' }
        ]
    });
}

/* Week 8: the daily habits, and what each one actually does. */
function healthHabits() {
    return listPicker({
        id: 'hh', label: 'SIX HABITS, SIX EFFECTS',
        alt: 'Six daily health habits with the effect each one has on the body',
        capA: 'Does: ', capB: 'Note: ',
        rows: [
            { btn: 'Sleep', short: 'Sleep',
              a: 'Repairs muscle and files the day into memory',
              b: 'Age 11 to 13 needs about nine hours.' },
            { btn: 'Water', short: 'Water',
              a: 'Carries nutrients and cools you down',
              b: 'Thirst arrives after you are already low.' },
            { btn: 'Food', short: 'Balanced food',
              a: 'Fuel, building material and repair kit',
              b: 'Go, grow and glow is the same idea.' },
            { btn: 'Move', short: 'Daily movement',
              a: 'Strengthens the heart and the bones',
              b: 'Sixty minutes a day is the usual target.' },
            { btn: 'Screen', short: 'Screen limits',
              a: 'Protects sleep and protects your eyes',
              b: 'Blue light late tells the brain it is morning.' },
            { btn: 'Clean', short: 'Hygiene',
              a: 'Keeps germs off your hands and out of you',
              b: 'Handwashing is still the biggest single win.' }
        ]
    });
}

/* Week 9: the five parts of health-related fitness. */
function fitnessParts() {
    return listPicker({
        id: 'fp9', label: 'FIVE PARTS OF FITNESS',
        alt: 'The five components of health-related fitness with a test for each',
        capA: 'Is: ', capB: 'Tested by: ',
        rows: [
            { btn: '1', short: 'Heart endurance',
              a: 'How long you keep going without stopping',
              b: 'A timed run, or a step test.' },
            { btn: '2', short: 'Muscular strength',
              a: 'How much force you can produce once',
              b: 'One heavy push, pull or lift.' },
            { btn: '3', short: 'Muscular endurance',
              a: 'How many times you can repeat that force',
              b: 'Push-ups or sit-ups to failure.' },
            { btn: '4', short: 'Flexibility',
              a: 'How far a joint can move safely',
              b: 'The sit-and-reach test.' },
            { btn: '5', short: 'Body composition',
              a: 'How much of you is muscle, bone and fat',
              b: 'It is one number among five, not a verdict.' },
            { btn: 'Skill', short: 'Skill-related',
              a: 'Speed, power, balance, agility, coordination',
              b: 'These help you play. The five above keep you well.' }
        ]
    });
}

/* Week 10: a hygiene routine in the order it actually happens. */
function hygieneRoutine() {
    return listPicker({
        id: 'hr10', label: 'SELF-CARE, AND THE REASON',
        alt: 'Six self-care tasks with the reason each one matters',
        capA: 'Why: ', capB: 'Note: ',
        rows: [
            { btn: 'Teeth', short: 'Brush twice daily',
              a: 'Plaque hardens within about two days',
              b: 'Two minutes, morning and last thing at night.' },
            { btn: 'Hands', short: 'Wash hands',
              a: 'Hands move germs to your face and food',
              b: 'Twenty seconds with soap beats a quick rinse.' },
            { btn: 'Shower', short: 'Shower daily',
              a: 'Sweat itself is odourless until bacteria feed on it',
              b: 'This is why puberty changes how you smell.' },
            { btn: 'Hair', short: 'Hair and nails',
              a: 'Dirt collects under nails and in scalp oil',
              b: 'Cut nails straight across to avoid ingrowth.' },
            { btn: 'Clothes', short: 'Clean clothes',
              a: 'Worn clothes hold sweat and bacteria',
              b: 'Socks and underwear are a daily change.' },
            { btn: 'Sleep', short: 'Rest and recovery',
              a: 'Skin and muscle repair mostly while you sleep',
              b: 'Self-care is not only what you wash.' }
        ]
    });
}


/* ---- TLE weeks 6-10 -------------------------------------------------- */

/* Week 6: the kit, and the cue that tells you to restock it. */
function careKit() {
    return listPicker({
        id: 'ck', label: 'YOUR OWN KIT, YOUR OWN JOB',
        alt: 'Six personal care supplies with how often each runs out',
        capA: 'Item: ', capB: 'Restock when: ',
        rows: [
            { btn: '1', short: 'Toothbrush',
              a: 'One brush, replaced on a schedule',
              b: 'The bristles splay, or three months pass.' },
            { btn: '2', short: 'Toothpaste',
              a: 'A tube lasts roughly a month',
              b: 'You can feel the tube going light. Say so then.' },
            { btn: '3', short: 'Soap and shampoo',
              a: 'Body wash or soap, plus shampoo',
              b: 'Open the spare before the old one runs out.' },
            { btn: '4', short: 'Deodorant',
              a: 'Applied to clean, dry skin',
              b: 'Check it on the same day each month.' },
            { btn: '5', short: 'Nail clippers, comb',
              a: 'Tools, not supplies. They do not run out',
              b: 'They only get lost. Give them one home.' },
            { btn: '6', short: 'Clean towel',
              a: 'A damp towel grows bacteria fast',
              b: 'Hang it spread out, and change it weekly.' }
        ]
    });
}

/* Week 7: the school kit as a system with a nightly reset. */
function schoolKit() {
    return listPicker({
        id: 'sk', label: 'A BAG THAT PACKS ITSELF',
        alt: 'Six rules for organising school materials, each with the reason it works',
        rows: [
            { btn: '1', short: 'One folder per subject',
              a: 'Colour or label it, and never mix two subjects',
              b: 'Searching is what kills you, not carrying.' },
            { btn: '2', short: 'Paper in, paper out',
              a: 'Every sheet is filed the day it arrives',
              b: 'A loose sheet in a bag is a lost sheet.' },
            { btn: '3', short: 'Pack the night before',
              a: 'The bag is packed before you sleep',
              b: 'Morning you is not the person to trust with this.' },
            { btn: '4', short: 'One launch spot',
              a: 'Bag, shoes and water bottle live in one place',
              b: 'No searching at 6:40 in the morning.' },
            { btn: '5', short: 'Weekly clear-out',
              a: 'Empty the bag completely once a week',
              b: 'Sunday works. It takes about four minutes.' },
            { btn: '6', short: 'A spare of one thing',
              a: 'One spare pen, kept somewhere separate',
              b: 'One spare. A drawer of spares is clutter.' }
        ]
    });
}

/* Week 8: folders, names and backups, shown as actual screens. */
function fileTree() {
    const mono = (x, y, t, cls = 'fig-mono') =>
        `<text class="${cls}" x="${x}" y="${y}">${t}</text>`;
    const messy = [
        'Untitled document (3).docx',
        'IMG_20260904_113402.jpg',
        'sci final FINAL v2.docx',
        'aaaa.pdf',
        'Screenshot 2026-09-01.png'
    ].map((t, i) => mono(40, 76 + i * 24, t)).join('');

    const tree =
        mono(34, 76, 'School/') +
        mono(52, 100, 'Grade-6/') +
        mono(70, 124, 'Science/') +
        mono(70, 148, 'Math/') +
        mono(70, 172, 'Filipino/') +
        `<path class="fig-flow on" d="M40 82 L40 96 L50 96"/>
         <path class="fig-flow on" d="M58 106 L58 168"/>
         <path class="fig-flow on" d="M58 120 L68 120"/>
         <path class="fig-flow on" d="M58 144 L68 144"/>
         <path class="fig-flow on" d="M58 168 L68 168"/>`;

    const naming = [
        ['2026-09-04-science-w6.docx', 'fig-mono'],
        ['date first, then subject', 'fig-note'],
        ['sorts itself by date', 'fig-note'],
        ['no spaces, no capitals', 'fig-note']
    ].map(([t, c], i) => mono(34, 80 + i * 28, t, c)).join('');

    const backup = ['On the laptop', 'In cloud storage', 'On a USB drive']
        .map((t, i) => `<rect class="fig-box" x="34" y="${60 + i * 46}" width="330" height="34" rx="8"/>` +
                       mono(48, 82 + i * 46, t, 'fig-cell')).join('');

    return demoSwitch({
        id: 'ft', label: 'FILES YOU CAN FIND AGAIN', height: 268, capY: 220,
        alt: 'Four screens: a messy folder, a folder tree, a file naming rule, and three backup places',
        demos: [
            { btn: 'Messy', svg: messy,
              a: 'None of these names says what is inside',
              b: 'In a year you will open all five to find one.' },
            { btn: 'Folders', svg: tree,
              a: 'Folders inside folders, widest first',
              b: 'School, then year, then subject. Three levels is plenty.' },
            { btn: 'Naming', svg: naming,
              a: 'A name is a search you do not have to run',
              b: 'Date first means the list sorts itself.' },
            { btn: 'Backup', svg: backup,
              a: 'One copy is not a copy',
              b: 'Two places at least, and one of them not the laptop.' }
        ]
    });
}

/* Week 9: the jobs that keep a house running, and who they belong to. */
function homeJobs() {
    return listPicker({
        id: 'hj', label: 'JOBS, AND WHY THEY ARE YOURS',
        alt: 'Six household responsibilities with the skill each one builds',
        capA: 'Job: ', capB: 'Builds: ',
        rows: [
            { btn: '1', short: 'Your own laundry',
              a: 'Sort, wash, dry, fold and put away',
              b: 'Sequencing a task that has waiting built into it.' },
            { btn: '2', short: 'Washing up',
              a: 'Clear, wash, dry and reset the kitchen',
              b: 'Finishing. A half-done kitchen is not done.' },
            { btn: '3', short: 'Simple cooking',
              a: 'One meal you can make without help',
              b: 'Reading a process and following it in order.' },
            { btn: '4', short: 'Rubbish and recycling',
              a: 'Sorted, bagged and out on the right day',
              b: 'Working to a deadline somebody else set.' },
            { btn: '5', short: 'Your own room',
              a: 'Reset it daily, deep clean it weekly',
              b: 'Maintenance instead of rescue.' },
            { btn: '6', short: 'Noticing',
              a: 'Doing a job nobody assigned you',
              b: 'This is the one that turns chores into independence.' }
        ]
    });
}

/* Week 10: assembling a portfolio, in the order it is built. */
function portfolioSteps() {
    return listPicker({
        id: 'ps', label: 'BUILDING THE PORTFOLIO',
        alt: 'Six steps for assembling a digital portfolio of term work',
        capA: 'Step: ', capB: 'Why: ',
        rows: [
            { btn: '1', short: 'Gather',
              a: 'Collect every piece of work from the term',
              b: 'Gather first. Judging while you gather is slow.' },
            { btn: '2', short: 'Choose',
              a: 'Pick the pieces that show the most',
              b: 'Best work, hardest work, and one you improved.' },
            { btn: '3', short: 'Name',
              a: 'Rename each file by date and subject',
              b: 'The names are what make it findable later.' },
            { btn: '4', short: 'Arrange',
              a: 'Put them in folders, one per subject',
              b: 'The same structure you already use for school.' },
            { btn: '5', short: 'Caption',
              a: 'One or two lines on each piece',
              b: 'What it was, and what you would change now.' },
            { btn: '6', short: 'Back up',
              a: 'Store a second copy somewhere else',
              b: 'A portfolio in one place is a portfolio you can lose.' }
        ]
    });
}


/* ---- Devotion weeks 6-10 --------------------------------------------- */

/* Week 6: worship is wider than singing. */
function worshipForms() {
    return listPicker({
        id: 'wf', label: 'SIX FORMS OF WORSHIP',
        alt: 'Six forms worship takes, each with a verse and what it looks like',
        capA: 'Verse: ', capB: 'Looks like: ',
        rows: [
            { btn: '1', short: 'Singing',
              a: 'Ephesians 5:19', b: 'The part most people picture first.' },
            { btn: '2', short: 'Your whole life',
              a: 'Romans 12:1', b: 'Offering your body as a living sacrifice.' },
            { btn: '3', short: 'Obedience',
              a: '1 Samuel 15:22', b: 'To obey is better than sacrifice.' },
            { btn: '4', short: 'Giving',
              a: '2 Corinthians 9:7', b: 'God loves a cheerful giver.' },
            { btn: '5', short: 'Serving others',
              a: 'Matthew 25:40', b: 'Done for the least of these, done for him.' },
            { btn: '6', short: 'Thankfulness',
              a: '1 Thessalonians 5:18', b: 'Give thanks in all circumstances.' }
        ]
    });
}

/* Week 7: the chain in Romans 5:3-5. */
function perseverChain() {
    return timeline({
        id: 'pc', label: 'ROMANS 5:3-5, IN ORDER',
        alt: 'The chain from suffering to hope described in Romans 5 verses 3 to 5',
        stops: [
            { year: 'Suffering', tag: 'the trial',
              head: 'It starts with something you did not choose',
              body: 'Paul does not pretend the suffering is good in itself.' },
            { year: 'Perseverance', tag: 'staying',
              head: 'Suffering produces perseverance',
              body: 'Perseverance means staying when leaving is available.' },
            { year: 'Character', tag: 'proven',
              head: 'Perseverance produces character',
              body: 'The word means tested and found genuine.' },
            { year: 'Hope', tag: 'the end',
              head: 'Character produces hope',
              body: 'Hope built this way does not put us to shame.' }
        ]
    });
}

/* Week 8: what honesty costs in the moment, and what it saves. */
function honestyCases() {
    return listPicker({
        id: 'hc', label: 'SIX MOMENTS, SIX CHOICES',
        alt: 'Six everyday situations where honesty costs something, with what it saves',
        capA: 'Costs: ', capB: 'Saves: ',
        rows: [
            { btn: '1', short: 'You broke it',
              a: 'Admitting it before anyone asks',
              b: 'The far worse conversation two days later.' },
            { btn: '2', short: 'The half-truth',
              a: 'Saying the part you left out',
              b: 'Being someone whose words need checking.' },
            { btn: '3', short: 'Copied work',
              a: 'Handing in less than you wanted to',
              b: 'A mark that was never actually yours.' },
            { btn: '4', short: 'A friend asks',
              a: 'Telling a friend something true and unwelcome',
              b: 'A friendship built on agreeing with everything.' },
            { btn: '5', short: 'The exaggeration',
              a: 'Telling the story smaller than it could be',
              b: 'Having to remember which version you told.' },
            { btn: '6', short: 'Found money',
              a: 'Handing back what nobody saw you take',
              b: 'The thing honesty is actually testing.' }
        ]
    });
}

/* Week 9: what serving looked like in practice. */
function serviceActs() {
    return listPicker({
        id: 'sa', label: 'SERVICE, WITH THE PASSAGE',
        alt: 'Six examples of humility and service in scripture with their references',
        capA: 'Where: ', capB: 'What: ',
        rows: [
            { btn: '1', short: 'Washing feet',
              a: 'John 13:1-17', b: 'The teacher does the lowest job in the room.' },
            { btn: '2', short: 'Not to be served',
              a: 'Mark 10:45', b: 'He came to serve, and to give his life.' },
            { btn: '3', short: 'Others first',
              a: 'Philippians 2:3-4', b: 'Value others above yourselves.' },
            { btn: '4', short: 'The lowest seat',
              a: 'Luke 14:7-11', b: 'Take the lowest place, not the highest.' },
            { btn: '5', short: 'Quiet giving',
              a: 'Matthew 6:1-4', b: 'Do not announce it. That is the point.' },
            { btn: '6', short: 'The widow',
              a: 'Mark 12:41-44', b: 'She gave less, and it counted for more.' }
        ]
    });
}

/* Week 10: people who stood, and what it cost them. */
function courageStands() {
    return listPicker({
        id: 'cst', label: 'SIX PEOPLE WHO STOOD',
        alt: 'Six people in scripture who stood for truth, with what each of them risked',
        capA: 'Where: ', capB: 'Risked: ',
        rows: [
            { btn: '1', short: 'Daniel',
              a: 'Daniel 6', b: 'Kept praying at the window. Faced the lions.' },
            { btn: '2', short: 'Three friends',
              a: 'Daniel 3', b: 'Would not bow. Said "even if he does not".' },
            { btn: '3', short: 'Esther',
              a: 'Esther 4', b: 'Went to the king uninvited. "If I perish, I perish."' },
            { btn: '4', short: 'Peter and John',
              a: 'Acts 4:19-20', b: 'Told to stop speaking. Said they could not.' },
            { btn: '5', short: 'Stephen',
              a: 'Acts 7', b: 'Spoke the truth to the council. It cost his life.' },
            { btn: '6', short: 'Nathan',
              a: '2 Samuel 12', b: 'Told a king to his face that he was wrong.' }
        ]
    });
}


/* ---- Filipino weeks 6-10 --------------------------------------------- */

/* Linggo 6: uri ng pangungusap ayon sa gamit. */
function uriPangungusap() {
    return listPicker({
        id: 'up6', label: 'LIMANG URI AYON SA GAMIT',
        alt: 'Apat na uri ng pangungusap ayon sa gamit, may halimbawa at bantas',
        capA: 'Gamit: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Pasalaysay',
              a: 'Nagsasabi ng impormasyon. Tuldok ang bantas',
              b: 'Tumatakbo ang sasakyan sa karera.' },
            { btn: '2', short: 'Patanong',
              a: 'Nagtatanong. Tandang pananong ang bantas',
              b: 'Ilang round ang ginawa mo kahapon?' },
            { btn: '3', short: 'Pautos',
              a: 'Nag-uutos. Malakas ang tono',
              b: 'Itali mo nang mahigpit ang bendahe.' },
            { btn: '4', short: 'Pakiusap',
              a: 'Humihiling nang magalang. May "paki" o "nga"',
              b: 'Pakiabot nga ng guwantes.' },
            { btn: '5', short: 'Padamdam',
              a: 'Nagpapahayag ng matinding damdamin',
              b: 'Ang bilis ng lap na iyon!' },
            { btn: '6', short: 'Bantas',
              a: 'Ang bantas ang unang senyas',
              b: 'Tuldok, pananong, o padamdam. Tingnan ang dulo.' }
        ]
    });
}

/* Linggo 7: pangungusap na walang paksa. */
function walangPaksa() {
    return listPicker({
        id: 'wp', label: 'PANGUNGUSAP NA WALANG PAKSA',
        alt: 'Anim na uri ng pangungusap na walang paksa na may halimbawa',
        capA: 'Uri: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Panahon',
              a: 'Tungkol sa lagay ng panahon',
              b: 'Bumabagyo mula kahapon.' },
            { btn: '2', short: 'Kalikasan',
              a: 'Pangyayari sa kalikasan',
              b: 'Bumaha sa buong kalye.' },
            { btn: '3', short: 'Karamdaman',
              a: 'Damdaming pisikal, walang binabanggit na paksa',
              b: 'Nilalagnat mula kagabi.' },
            { btn: '4', short: 'Oras',
              a: 'Tungkol sa oras o panahon ng araw',
              b: 'Alas-singko na pala.' },
            { btn: '5', short: 'Pautos',
              a: 'Ang inuutusan ay hindi binabanggit',
              b: 'Magsanay na!' },
            { btn: '6', short: 'Padamdam',
              a: 'Bulalas na walang tinutukoy na paksa',
              b: 'Aray!' }
        ]
    });
}

/* Linggo 8: uri ng pangngalan. */
function uriPangngalan() {
    return listPicker({
        id: 'upn', label: 'URI NG PANGNGALAN',
        alt: 'Anim na uri ng pangngalan na may kahulugan at halimbawa',
        capA: 'Ibig sabihin: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Pambalana',
              a: 'Pangkalahatan. Maliit na titik',
              b: 'bayani, lungsod, makina, eroplano.' },
            { btn: '2', short: 'Pantangi',
              a: 'Tiyak na ngalan. Malaking titik',
              b: 'Bonifacio, Maynila, Supremo.' },
            { btn: '3', short: 'Tahas',
              a: 'Nahahawakan o nakikita',
              b: 'makina, guwantes, eroplano, bato.' },
            { btn: '4', short: 'Basal',
              a: 'Hindi nahahawakan. Ideya o damdamin',
              b: 'katapangan, pag-asa, takot, tiyaga.' },
            { btn: '5', short: 'Palansak',
              a: 'Isang salita para sa isang pangkat',
              b: 'kawan, pulutong, samahan, bungkos.' },
            { btn: '6', short: 'Suriin',
              a: 'Isang pangngalan ay maaaring maraming uri',
              b: '"Katipunan" ay pantangi at palansak.' }
        ]
    });
}

/* Linggo 9: kasarian ng pangngalan. */
function kasarianPangngalan() {
    return listPicker({
        id: 'kpn', label: 'APAT NA KASARIAN',
        alt: 'Apat na kasarian ng pangngalan na may kahulugan at halimbawa',
        capA: 'Ibig sabihin: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Panlalaki',
              a: 'Tumutukoy sa lalaki',
              b: 'ama, kapatid na lalaki, hari, tandang.' },
            { btn: '2', short: 'Pambabae',
              a: 'Tumutukoy sa babae',
              b: 'ina, reyna, tiya, inahin.' },
            { btn: '3', short: 'Di-tiyak',
              a: 'Maaaring lalaki o babae. Hindi tiyak',
              b: 'guro, boksingero, manlalaro, kaibigan.' },
            { btn: '4', short: 'Walang kasarian',
              a: 'Bagay na walang buhay o kasarian',
              b: 'bato, mesa, aklat, bahay.' },
            { btn: '5', short: 'Mag-ingat',
              a: 'Ang di-tiyak ang madalas na mali',
              b: '"Guro" ay di-tiyak, hindi pambabae.' },
            { btn: '6', short: 'Hiram',
              a: 'May hiram na salitang may kasarian',
              b: 'aktor at aktres, mula sa Espanyol.' }
        ]
    });
}

/* Linggo 10: kailanan ng pangngalan. */
function kailananPangngalan() {
    return listPicker({
        id: 'kln', label: 'TATLONG KAILANAN',
        alt: 'Tatlong kailanan ng pangngalan na may panuntunan at halimbawa',
        capA: 'Ibig sabihin: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Isahan',
              a: 'Iisa lamang',
              b: 'makina, bagyo, sasakyan, bayani.' },
            { btn: '2', short: 'Dalawahan',
              a: 'Tiyak na dalawa. Karaniwang nagsisimula sa "mag-"',
              b: 'magkapatid, magkaibigan, mag-ama.' },
            { btn: '3', short: 'Maramihan',
              a: 'Tatlo o higit pa. Ginagamitan ng "mga"',
              b: 'mga makina, mga bagyo, mga bayani.' },
            { btn: '4', short: 'Ang "mga"',
              a: 'Ito ang pinakakaraniwang senyas',
              b: 'Isang salita lamang ang nagpapalit ng kailanan.' },
            { btn: '5', short: 'Pag-uulit',
              a: 'May pag-uulit din ng salita',
              b: 'bahay-bahay, araw-araw. Iba ang kahulugan.' },
            { btn: '6', short: 'Mag-ingat',
              a: 'Huwag doblehin ang senyas',
              b: 'Mali ang "mga aklat-aklat". Pumili ng isa.' }
        ]
    });
}


/* ---- Week 11: one revision map per subject --------------------------- */

/* Ten weeks, one tap each: what to know, and the mistake that costs the mark.
   Taller than the usual picker because ten rows do not fit the default. */
function examMap({ id, label, alt, rows }) {
    return listPicker({
        id, label, alt, rows, height: 384,
        capA: 'Know: ', capB: 'Trap: '
    });
}

function sciExam() {
    return examMap({
        id: 'sx', label: 'SCIENCE · TEN WEEKS',
        alt: 'The ten Science topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Skeleton & muscles',
              a: 'Muscles work in pairs and only ever pull',
              b: 'Nothing pushes. The opposite muscle pulls instead.' },
            { btn: '2', short: 'Digestion',
              a: 'The order of the tract, and where absorption happens',
              b: 'The stomach breaks down. The small intestine absorbs.' },
            { btn: '3', short: 'Skin',
              a: 'Three layers, and sweat cooling by evaporation',
              b: 'A tan is damage already done, not health.' },
            { btn: '4', short: 'Breathing & kidneys',
              a: 'The diaphragm drops, pressure falls, air is pushed in',
              b: 'You do not suck air in. Pressure does the work.' },
            { btn: '5', short: 'Heart & nerves',
              a: 'Four chambers, two circuits, and the reflex arc',
              b: 'A reflex does not go through the brain at all.' },
            { btn: '6', short: 'Animal groups',
              a: 'Backbone or none. Five vertebrate classes',
              b: 'About 95 percent of species have no backbone.' },
            { btn: '7', short: 'Reproduction',
              a: 'Asexual and sexual, and the parts of a flower',
              b: 'Pollination is arrival. Fertilisation is joining.' },
            { btn: '8', short: 'Heterogeneous',
              a: 'Suspensions settle, colloids do not, Tyndall tells them apart',
              b: 'Cloudiness is not the test. Settling is.' },
            { btn: '9', short: 'Solutions',
              a: 'Solute, solvent, solubility, and what saturated means',
              b: 'Saturated is a limit, not a strength.' },
            { btn: '10', short: 'Separating',
              a: 'Filtering, evaporation, distillation, chromatography',
              b: 'Distillation keeps the liquid. Evaporation loses it.' }
        ]
    });
}

function mathExam() {
    return examMap({
        id: 'mx', label: 'MATH · TEN WEEKS',
        alt: 'The ten Math topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Tessellation',
              a: 'The angles at a vertex must total exactly 360 degrees',
              b: 'Only three regular polygons tile on their own.' },
            { btn: '2', short: 'Transformations',
              a: 'Translation, reflection and rotation keep size and angles',
              b: 'A rotation needs a centre and a direction too.' },
            { btn: '3', short: 'Add & subtract decimals',
              a: 'Line up the decimal points, not the last digits',
              b: 'Zeros on the end change nothing at all.' },
            { btn: '4', short: 'Compare decimals',
              a: 'Compare from the left, padding to the same length',
              b: 'More digits does not mean a bigger number.' },
            { btn: '5', short: 'Multiply & divide',
              a: 'Count the decimal places in both factors',
              b: 'Times by under 1 gets smaller. Divide gets bigger.' },
            { btn: '6', short: 'Order & rates',
              a: 'Multiply and divide before add and subtract',
              b: 'The bigger pack is not always better value.' },
            { btn: '7', short: 'Add & subtract fractions',
              a: 'A common denominator first, then add the tops only',
              b: 'Never add the bottoms. They name the piece size.' },
            { btn: '8', short: 'Multiply & divide fractions',
              a: 'Multiply straight across. Divide by flipping the second',
              b: 'No common denominator is needed to multiply.' },
            { btn: '9', short: 'Ratio',
              a: 'Three parts to four means seven in total',
              b: 'Order matters. 3 to 4 is not 4 to 3.' },
            { btn: '10', short: 'Proportion & scale',
              a: 'Unit rate first solves nearly every word problem',
              b: 'A scale of 1 to 100 means the drawing is smaller.' }
        ]
    });
}

function engExam() {
    return examMap({
        id: 'ex', label: 'ENGLISH · TEN WEEKS',
        alt: 'The ten English topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Plurals',
              a: 'The y, f and o rules, and the irregulars',
              b: 'An apostrophe never makes a plural. Never.' },
            { btn: '2', short: 'Quantifiers',
              a: 'Count nouns take fewer, noncount take less',
              b: 'Noncount nouns cannot simply take an -s.' },
            { btn: '3', short: 'Possessive nouns',
              a: 'Apostrophe placement for singular and plural',
              b: 'Plurals already ending in s take only an apostrophe.' },
            { btn: '4', short: 'Possessive pronouns',
              a: 'Determiners sit before a noun, pronouns stand alone',
              b: 'Its, hers, yours and theirs take no apostrophe.' },
            { btn: '5', short: 'Pronoun agreement',
              a: 'A pronoun matches its antecedent in number',
              b: 'Everyone, each and either are all singular.' },
            { btn: '6', short: 'Compound pronouns',
              a: 'The eight -self and -selves forms',
              b: 'Hisself and theirselves are not words.' },
            { btn: '7', short: 'Reflexive pronouns',
              a: 'Reflexive is the object; intensive only emphasises',
              b: 'Delete it. If the sentence breaks, it was reflexive.' },
            { btn: '8', short: 'Simple present',
              a: 'Only he, she and it change in the present tense',
              b: 'Does already carries the ending. Not doesn’t likes.' },
            { btn: '9', short: 'Subject-verb agreement',
              a: 'The verb agrees with the subject, not the nearest noun',
              b: 'In there is and there are, there is never the subject.' },
            { btn: '10', short: 'Agreement applied',
              a: 'Amounts and titles are treated as one unit',
              b: 'News, mathematics and physics are all singular.' }
        ]
    });
}

function ssExam() {
    return examMap({
        id: 'sse', label: 'SOCIAL STUDIES · TEN WEEKS',
        alt: 'The ten Social Studies topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'The Philippines',
              a: 'An archipelago of 7,641 islands in three groups',
              b: 'It has no land border with any country.' },
            { btn: '2', short: 'Nationalism',
              a: 'The Cavite Mutiny and GomBurZa, 1872',
              b: 'The mutiny was a protest, not a revolution.' },
            { btn: '3', short: 'The reformers',
              a: 'La Solidaridad, and the six demands',
              b: 'They wanted reform inside Spain, not independence.' },
            { btn: '4', short: 'Rizal',
              a: 'The novels, La Liga, Dapitan, December 1896',
              b: 'He argued against the revolution and was executed for it.' },
            { btn: '5', short: 'Revolution',
              a: 'The Katipunan, Pugad Lawin, Tejeros, Kawit',
              b: 'Bonifacio was executed by his own side, not by Spain.' },
            { btn: '6', short: 'Malolos',
              a: 'A written constitution, approved January 1899',
              b: 'The Battle of Manila was arranged in advance.' },
            { btn: '7', short: 'The war',
              a: 'February 1899 to July 1902, and the civilian cost',
              b: 'The first shot came before the treaty was ratified.' },
            { btn: '8', short: 'Colonial government',
              a: 'Military 1898, civil 1901, Assembly 1907',
              b: 'Schurman only advised. Taft could make law.' },
            { btn: '9', short: 'Schurman',
              a: 'Advisory, and most of it was carried out',
              b: 'A republic was already running when it said "not ready".' },
            { btn: '10', short: 'American rule',
              a: 'Act No. 74, the Thomasites, English in school',
              b: 'A benefit does not cancel a cost. Say both.' }
        ]
    });
}

function filExam() {
    return examMap({
        id: 'fx', label: 'FILIPINO · SAMPUNG LINGGO',
        alt: 'Ang sampung paksa sa Filipino ngayong termino, may dapat tandaan at karaniwang mali',
        rows: [
            { btn: '1', short: 'Ortograpiya',
              a: 'Ang alpabetong Filipino at ang tamang baybay',
              b: 'Hindi lahat ng hiram na salita ay binabaybay muli.' },
            { btn: '2', short: 'Pagbuo ng salita',
              a: 'Panlapi, salitang-ugat at pag-uulit',
              b: 'Ang unlapi ay nasa unahan, hindi sa gitna.' },
            { btn: '3', short: 'Kayarian ng salita',
              a: 'Payak, maylapi, inuulit at tambalan',
              b: 'May salitang tambalan na iisa na ang kahulugan.' },
            { btn: '4', short: 'Bahagi at ayos',
              a: 'Simuno at panaguri; karaniwan at di-karaniwan',
              b: 'Ang "ay" ang senyas ng karaniwang ayos.' },
            { btn: '5', short: 'Kayarian ng pangungusap',
              a: 'Payak, tambalan, hugnayan at langkapan',
              b: 'Bilangin ang sugnay bago sumagot.' },
            { btn: '6', short: 'Uri ayon sa gamit',
              a: 'Pasalaysay, patanong, pautos, pakiusap, padamdam',
              b: 'Ang "paki-" at "nga" ang senyas ng pakiusap.' },
            { btn: '7', short: 'Walang paksa',
              a: 'Panahon, kalikasan, karamdaman at oras',
              b: 'May paksa ang "Masakit ang ulo". Hindi ito kasama.' },
            { btn: '8', short: 'Uri ng pangngalan',
              a: 'Pantangi, pambalana, tahas, basal, palansak',
              b: 'Maaaring maraming uri ang isang pangngalan.' },
            { btn: '9', short: 'Kasarian',
              a: 'Panlalaki, pambabae, di-tiyak, walang kasarian',
              b: 'Ang "guro" ay di-tiyak, hindi pambabae.' },
            { btn: '10', short: 'Kailanan',
              a: 'Isahan, dalawahan at maramihan',
              b: 'Huwag doblehin: mali ang "mga aklat-aklat".' }
        ]
    });
}

function mapehExam() {
    return examMap({
        id: 'mpx', label: 'MAPEH · TEN WEEKS',
        alt: 'The ten MAPEH topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Music & space',
              a: 'The elements of music; self space and general space',
              b: 'Dynamics is loud and soft. Tempo is the speed.' },
            { btn: '2', short: 'World genres',
              a: 'Six genres and where each came from',
              b: 'A genre is shared rhythm and place, not who sings.' },
            { btn: '3', short: 'Folk & OPM',
              a: 'Kundiman, harana, balitaw, kulintang, rondalla',
              b: 'OPM is who made it, not a single genre.' },
            { btn: '4', short: 'Elements of art',
              a: 'The seven elements, and shape against form',
              b: 'Balance and contrast are principles, not elements.' },
            { btn: '5', short: 'Art styles',
              a: 'Realistic, stylised, abstract; Luna, Amorsolo, Edades',
              b: 'Luna painted the Spoliarium. Amorsolo painted fields.' },
            { btn: '6', short: 'Colour & symbols',
              a: 'Primary, secondary, warm, cool, complementary',
              b: 'Red, yellow, blue in paint. Not red, green, blue.' },
            { btn: '7', short: 'Sport categories',
              a: 'Individual, dual, team; invasion, net, target',
              b: 'Arnis is the national sport. Basketball is popular.' },
            { btn: '8', short: 'Health habits',
              a: 'Sleep, water, go-grow-glow, and how habits form',
              b: 'Thirst is a late signal, not an early one.' },
            { btn: '9', short: 'Fitness & teams',
              a: 'Five health-related components, and FITT',
              b: 'Agility is skill-related, not health-related.' },
            { btn: '10', short: 'Hygiene',
              a: 'Apocrine glands, soap, enamel, skin care',
              b: 'Acne is hormones. It is not caused by dirt.' }
        ]
    });
}

function tleExam() {
    return examMap({
        id: 'tx', label: 'TLE · TEN WEEKS',
        alt: 'The ten TLE topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Foundations',
              a: 'A home for everything; the two-minute rule',
              b: 'Putting it down is not putting it away.' },
            { btn: '2', short: 'Routine & schedule',
              a: 'A routine is an order; a schedule adds times',
              b: 'A task without a time does not get done.' },
            { btn: '3', short: 'Decluttering',
              a: 'Decide per object, then get it out the same day',
              b: 'Declutter before organising. Tidy junk is junk.' },
            { btn: '4', short: 'Bed & sleep',
              a: 'The bedding layers, changed about weekly',
              b: 'A slightly cool room is easier to sleep in.' },
            { btn: '5', short: 'Clothes',
              a: 'Hang or fold, care symbols, sorting by colour',
              b: 'Knitwear stretches on a hanger. Fold it.' },
            { btn: '6', short: 'Self-care system',
              a: 'A fixed order, and a kit you restock yourself',
              b: 'Say something when you open the last one.' },
            { btn: '7', short: 'School materials',
              a: 'One folder per subject; pack the night before',
              b: 'Searching is the cost, not carrying.' },
            { btn: '8', short: 'Digital files',
              a: 'Date, subject, what it is. Three folder levels',
              b: 'A copy on the same laptop is not a backup.' },
            { btn: '9', short: 'Home responsibility',
              a: 'A job is done when the space is reset',
              b: 'No reminders needed is what makes it yours.' },
            { btn: '10', short: 'Portfolio',
              a: 'Gather, choose, name, arrange, caption, back up',
              b: 'Gather first. Judging while hunting is slow.' }
        ]
    });
}

function devExam() {
    return examMap({
        id: 'dx', label: 'DEVOTION · TEN WEEKS',
        alt: 'The ten Devotion topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Foundations',
              a: 'The wise and foolish builders, Matthew 7',
              b: 'Both houses face the same storm.' },
            { btn: '2', short: 'Trust & obedience',
              a: 'Proverbs 3:5-6; 1 Samuel 15:22',
              b: 'Trust is belief. Obedience is what you do.' },
            { btn: '3', short: 'Faith',
              a: 'Hebrews 11:1 and the mustard seed',
              b: 'The size of the faith is not the point.' },
            { btn: '4', short: 'Love',
              a: 'Matthew 22:37-39 and 1 Corinthians 13',
              b: 'Love there is a list of verbs, not feelings.' },
            { btn: '5', short: 'Prayer',
              a: 'The Lord’s Prayer pattern and ACTS',
              b: 'Asking comes last, and that is deliberate.' },
            { btn: '6', short: 'Worship',
              a: 'Romans 12:1 and John 4:23-24',
              b: 'Obedience cannot be replaced by an offering.' },
            { btn: '7', short: 'Perseverance',
              a: 'Romans 5:3-5 and James 1:2-4',
              b: '"Consider" is a judgement, not a feeling.' },
            { btn: '8', short: 'Honesty',
              a: 'Proverbs 12:22, Ephesians 4:25, Acts 5',
              b: 'Ananias lied about the amount. The money was his.' },
            { btn: '9', short: 'Humility',
              a: 'John 13, Philippians 2, Mark 10:45',
              b: 'Thinking of yourself less, not thinking less of you.' },
            { btn: '10', short: 'Courage',
              a: 'Daniel 6, Daniel 3, Esther 4, Acts 4',
              b: 'Courage needs fear. Without it, it is just easy.' }
        ]
    });
}

/* ==========================================================================
   FILIPINO FIGURES — Term 2.
   Grammar in Filipino goes wrong in a particular way: the learner memorises
   a list of labels and never sees the thing the label points at. So every
   one of these is a picker or a switch — the label arrives only after he has
   chosen something. Where an example is free, it comes from his world; where
   the form is fixed by the language it stays fixed.
   ========================================================================== */

/* Three cases, six markers. The markers are the only reliable signal, so
   they are what he presses. */
function kaukulanPangngalan() {
    return listPicker({
        id: 'kk', label: 'PINDUTIN ANG PANANDA', height: 272, y0: 60, dy: 26,
        alt: 'Anim na pananda ng pangngalan, bawat isa may kaukulan at halimbawa',
        capA: 'Kaukulan: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'ang / ang mga', a: 'Palagyo — ito ang gumagawa o pinag-uusapan',
              b: 'Mabilis ang sasakyan sa huling liko.' },
            { short: 'si / sina', a: 'Palagyo — para sa pangngalang pantangi',
              b: 'Nanalo si Pacquiao sa Las Vegas noong 2008.' },
            { short: 'ng / ng mga', a: 'Paari — may-ari o bahagi ng isang bagay',
              b: 'Umalingawngaw ang makina ng kotse.' },
            { short: 'ni / nina', a: 'Paari — may-ari na pantangi',
              b: 'Makapal ang benda ni Manny bago ang laban.' },
            { short: 'sa / sa mga', a: 'Palayon — pinatutunguhan o pinupuntahan',
              b: 'Sumuntok siya sa sandbag ng tatlumpung minuto.' },
            { short: 'kay / kina', a: 'Palayon — pinatutunguhan na pantangi',
              b: 'Ibinigay ng kotse ang unang puwesto kay Carlo.' }
        ]
    });
}

/* The personal pronoun table is the single densest thing in Grade 6 Filipino.
   Presented as a table he reads it once; presented as eight buttons he works
   through all three cases of each person. */
function panghalipPanao() {
    return listPicker({
        id: 'pp', label: 'WALONG PANAUHAN · TATLONG KAUKULAN', height: 320, y0: 60, dy: 26,
        alt: 'Ang walong panghalip panao at ang anyo ng bawat isa sa tatlong kaukulan',
        capA: 'Paari / Palayon: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'ako — unang panauhan, isahan', a: 'ko, akin / sa akin',
              b: 'Binuksan ko ang bentilador. Akin ang distornilyador.' },
            { short: 'kami — unang, maramihan, di-kasama', a: 'namin, amin / sa amin',
              b: 'Hindi kasama ang kinakausap: Kami lang ang nagsanay.' },
            { short: 'tayo — unang, maramihan, kasama', a: 'natin, atin / sa atin',
              b: 'Kasama ang kinakausap: Tara, tayo na sa gym.' },
            { short: 'ikaw / ka — ikalawa, isahan', a: 'mo, iyo / sa iyo',
              b: 'Ikaw ang nanalo. Iyo ang huling round.' },
            { short: 'kayo — ikalawa, maramihan', a: 'ninyo, inyo / sa inyo',
              b: 'Kayo ang magsasaayos ng mga gulong.' },
            { short: 'siya — ikatlo, isahan', a: 'niya, kaniya / sa kaniya',
              b: 'Siya ang tumapos ng lap. Kaniya ang record.' },
            { short: 'sila — ikatlo, maramihan', a: 'nila, kanila / sa kanila',
              b: 'Sila ang nagtanggal ng makina.' },
            { short: 'ka — hindi kayang mag-una', a: 'Laging pangalawa sa pangungusap',
              b: 'Tama: Mabilis ka. Mali: Ka ay mabilis.' }
        ]
    });
}

/* Distance, not vocabulary. ito/iyan/iyon is a question of who is near the
   thing — so the figure draws the two people and moves the thing. */
function pamatligLapit() {
    const you = stick(70, 150), them = stick(206, 150);
    const bag = (x, on) =>
        `<g><rect class="${on ? 'fig-box-on' : 'fig-box'}" x="${x - 18}" y="128" width="36" height="26" rx="5"/>
          <text class="fig-cell" x="${x}" y="176" text-anchor="middle">guwantes</text></g>`;
    const tag = t => `<text class="fig-label" x="200" y="46" text-anchor="middle">${t}</text>`;
    const who = `<text class="fig-cell" x="70" y="196" text-anchor="middle">ako</text>
                 <text class="fig-cell" x="206" y="196" text-anchor="middle">kausap</text>`;
    return demoSwitch({
        id: 'pl', height: 276, capY: 230,
        label: 'SINO ANG MALAPIT SA BAGAY?',
        alt: 'Tatlong tagpo na nagpapakita kung kailan ginagamit ang ito, iyan at iyon',
        demos: [
            { btn: 'ito', svg: `${tag('ITO')}${you}${them}${who}${bag(112, true)}`,
              a: 'ITO — malapit sa nagsasalita',
              b: 'Hawak ko ang guwantes: Bago ito.' },
            { btn: 'iyan', svg: `${tag('IYAN')}${you}${them}${who}${bag(166, true)}`,
              a: 'IYAN — malapit sa kinakausap',
              b: 'Hawak mo ang guwantes: Luma na iyan.' },
            { btn: 'iyon', svg: `${tag('IYON')}${you}${them}${who}${bag(342, true)}`,
              a: 'IYON — malayo sa inyong dalawa',
              b: 'Nasa bodega pa: Akin iyon.' }
        ]
    });
}

/* Panaklaw means it sweeps everything in. The test item that catches people
   is the one where a panaklaw looks like a pamilang, so that pair is here. */
function panaklawTakip() {
    return listPicker({
        id: 'pk', label: 'WALANG PINIPILI · PINDUTIN', height: 272, y0: 60, dy: 26,
        alt: 'Anim na panghalip panaklaw at ang saklaw ng bawat isa',
        capA: 'Saklaw: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'lahat', a: 'Buong bilang, walang itinatangi',
              b: 'Pagod na lahat pagkatapos ng sparring.' },
            { short: 'sinuman', a: 'Kahit sinong tao, hindi tiyak kung sino',
              b: 'Sinuman ang pumasok, kailangan ng benda sa kamay.' },
            { short: 'anuman', a: 'Kahit anong bagay, hindi tiyak kung ano',
              b: 'Anuman ang bahaging nasira, may kapalit iyon.' },
            { short: 'alinman', a: 'Kahit alin sa mga naibigay na pagpipilian',
              b: 'Alinman sa dalawang gulong ay kasya.' },
            { short: 'bawat isa', a: 'Lahat, pero isa-isa',
              b: 'May sariling takdang bigat ang bawat isa.' },
            { short: 'madla / balana', a: 'Ang publiko — ang hindi tiyak na nakararami',
              b: 'Bukas sa madla ang laban sa Araneta.' }
        ]
    });
}

/* The pronoun number table, with the two traps: tayo-vs-kami, and the
   dual forms that textbooks list but nobody says out loud. */
function kailananPanghalip() {
    return listPicker({
        id: 'kp', label: 'ILAN ANG TINUTUKOY?', height: 272, y0: 60, dy: 26,
        alt: 'Ang tatlong kailanan ng panghalip panao, kasama ang pagkakaiba ng tayo at kami',
        capA: 'Kailanan: ', capB: 'Tandaan: ',
        rows: [
            { short: 'ako, ikaw / ka, siya', a: 'Isahan — isang tao lamang',
              b: 'Ako ang nagtanggal ng takip ng bentilador.' },
            { short: 'kata / kita, kanita', a: 'Dalawahan — tiyak na dalawa',
              b: 'Bihira na sa usapan ngayon, pero nasa pagsusulit.' },
            { short: 'kami, namin, amin', a: 'Maramihan — hindi kasama ang kausap',
              b: 'Kami ang nagsanay. Hindi ka kasama doon.' },
            { short: 'tayo, natin, atin', a: 'Maramihan — kasama ang kausap',
              b: 'Tayo ang magsasanay. Kasama ka.' },
            { short: 'kayo, ninyo, inyo', a: 'Maramihan — dalawa o higit na kausap',
              b: 'Kayo ang susunod sa ring.' },
            { short: 'sila, nila, kanila', a: 'Maramihan — dalawa o higit na pinag-uusapan',
              b: 'Sila ang may pinakamabilis na lap.' }
        ]
    });
}

/* Two kinds, and the numeral kind has four sub-kinds that are easy to mix.
   Pressing one at a time keeps the four apart. */
function uriPangUri() {
    return listPicker({
        id: 'up', label: 'ANONG URI NG PANG-URI?', height: 272, y0: 60, dy: 26,
        alt: 'Ang pang-uring panlarawan at ang apat na uri ng pang-uring pamilang',
        capA: 'Uri: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'mabilis, makapal, bilog', a: 'Panlarawan — katangian o kaanyuan',
              b: 'Makapal ang benda sa kanang kamay.' },
            { short: 'isa, dalawa, pito', a: 'Pamilang patakaran — simpleng bilang',
              b: 'Pitong round ang natapos bago tumigil.' },
            { short: 'una, ikalawa, ikatlo', a: 'Pamilang panunuran — pagkakasunod-sunod',
              b: 'Ikatlong puwesto siya sa huling karera.' },
            { short: 'kalahati, sangkatlo', a: 'Pamilang pamahagi — bahagi ng kabuuan',
              b: 'Kalahati ng gasolina ang natira.' },
            { short: 'dalawahan, tatluhan', a: 'Pamilang palansak — kung ilan-ilan',
              b: 'Tatluhan kaming naghakot ng mga gulong.' },
            { short: 'balat-sibuyas', a: 'Panlarawang tambalan — dalawang salita, isang kahulugan',
              b: 'Hindi ka puwedeng balat-sibuyas sa boksing.' }
        ]
    });
}

/* Three degrees, drawn as three bars rather than named as three words. One
   bar is a description; two is a comparison; three has a winner. */
function kaantasanPangUri() {
    const track = y => `<rect class="fig-bar-track" x="150" y="${y - 11}" width="212" height="16" rx="8"/>`;
    const bar = (y, w) => `<rect class="fig-bar" x="150" y="${y - 11}" width="${w}" height="16" rx="8"/>`;
    const name = (y, t) => `<text class="fig-cell" x="20" y="${y + 5}">${t}</text>`;
    const tag = t => `<text class="fig-label" x="200" y="46" text-anchor="middle">${t}</text>`;
    return demoSwitch({
        id: 'ka', height: 258, capY: 212,
        label: 'ILANG BAGAY ANG PINAGHAHAMBING?',
        alt: 'Tatlong antas ng pang-uri na iginuhit bilang isa, dalawa at tatlong bar ng bilis',
        demos: [
            { btn: 'lantay', svg: `${tag('ISA LANG')}${name(100,'Vios')}${track(100)}${bar(100,96)}`,
              a: 'LANTAY — walang kahambing',
              b: 'Mabilis ang Vios. Wala pang itinatapat dito.' },
            { btn: 'pahambing', svg: `${tag('DALAWA')}${name(100,'Vios')}${track(100)}${bar(100,96)}
                 ${name(150,'Civic')}${track(150)}${bar(150,148)}`,
              a: 'PAHAMBING — dalawang bagay, may nilalamangan',
              b: 'Mas mabilis ang Civic kaysa sa Vios. Senyas: mas, higit, lalo.' },
            { btn: 'pasukdol', svg: `${tag('TATLO O HIGIT')}${name(100,'Vios')}${track(100)}${bar(100,96)}
                 ${name(150,'Civic')}${track(150)}${bar(150,148)}
                 ${name(200,'GT-R')}${track(200)}${bar(200,206)}`,
              a: 'PASUKDOL — pinakamataas, wala nang hihigit',
              b: 'Pinakamabilis ang GT-R. Senyas: pinaka-, napaka-, ubod ng.' }
        ]
    });
}

/* Synonyms and antonyms are usually drilled as columns of words. Pairing
   each one with a sentence shows that a synonym is not always a swap. */
function kasingSalungat() {
    return listPicker({
        id: 'ks', label: 'KAPAREHO O KABALIKTARAN?', height: 272, y0: 60, dy: 26,
        alt: 'Anim na pares ng salita, tatlong magkasingkahulugan at tatlong magkasalungat',
        capA: 'Ugnayan: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'mabilis — matulin', a: 'Magkasingkahulugan — iisa ang dalang kahulugan',
              b: 'Matulin ang takbo niya sa huling round.' },
            { short: 'matalino — marunong', a: 'Magkasingkahulugan',
              b: 'Marunong siyang magbasa ng laban.' },
            { short: 'malungkot — nalulumbay', a: 'Magkasingkahulugan',
              b: 'Nalulumbay siya matapos ang pagkatalo.' },
            { short: 'mabilis — mabagal', a: 'Magkasalungat — kabaligtaran ang kahulugan',
              b: 'Mabagal ang unang lap, mabilis ang huli.' },
            { short: 'magaan — mabigat', a: 'Magkasalungat',
              b: 'Magaan ang guwantes, mabigat ang sandbag.' },
            { short: 'matapang — duwag', a: 'Magkasalungat',
              b: 'Hindi duwag ang umayaw kapag sugatan na.' }
        ]
    });
}

/* Aspect is about where the action sits relative to now, so the figure
   draws now as a line and moves the action across it. */
function aspektoPandiwa() {
    const axis = `<path class="fig-chain" d="M40 130 L360 130"/>
      <line class="fig-rule-strong" x1="200" y1="96" x2="200" y2="164"/>
      <text class="fig-step" x="200" y="88" text-anchor="middle">NGAYON</text>
      <text class="fig-note-dim" x="46" y="182">nakaraan</text>
      <text class="fig-note-dim" x="354" y="182" text-anchor="end">hinaharap</text>`;
    const span = (x, w) => `<rect class="fig-bar" x="${x}" y="122" width="${w}" height="16" rx="8"/>`;
    const verb = t => `<text class="fig-expr" x="200" y="56" text-anchor="middle">${t}</text>`;
    return demoSwitch({
        id: 'as', height: 254, capY: 208,
        label: 'SAAN NAKAUPO ANG KILOS?',
        alt: 'Tatlong aspekto ng pandiwa na iginuhit sa isang guhit ng panahon na may markang ngayon',
        demos: [
            { btn: 'nagsanay', svg: `${verb('nagsanay')}${axis}${span(56, 110)}`,
              a: 'PERPEKTIBO — tapos na ang kilos',
              b: 'Nagsanay siya kagabi. Wala nang ginagawa ngayon.' },
            { btn: 'nagsasanay', svg: `${verb('nagsasanay')}${axis}${span(140, 120)}`,
              a: 'IMPERPEKTIBO — nagaganap pa, hindi pa tapos',
              b: 'Nagsasanay siya ngayon. Nagsimula na, hindi pa natapos.' },
            { btn: 'magsasanay', svg: `${verb('magsasanay')}${axis}${span(234, 110)}`,
              a: 'KONTEMPLATIBO — hindi pa nagsimula',
              b: 'Magsasanay siya bukas. Balak pa lang.' }
        ]
    });
}

/* Six kinds of adverb, each tied to the question it answers. The question is
   the test: if none of the six questions fits, it is not a pang-abay. */
function uriPangAbay() {
    return listPicker({
        id: 'pa', label: 'ANONG TANONG ANG SINASAGOT?', height: 272, y0: 60, dy: 26,
        alt: 'Anim na uri ng pang-abay, bawat isa may tanong na sinasagot at halimbawa',
        capA: 'Sinasagot: ', capB: 'Halimbawa: ',
        rows: [
            { short: 'Pamanahon', a: 'KAILAN nangyari ang kilos',
              b: 'Tuwing Sabado siya nagsasanay sa gym.' },
            { short: 'Panlunan', a: 'SAAN nangyari ang kilos',
              b: 'Sa garahe inihiwalay ang makina.' },
            { short: 'Pamaraan', a: 'PAANO ginawa ang kilos',
              b: 'Dahan-dahan niyang binuksan ang kapasitor.' },
            { short: 'Panang-ayon', a: 'Pagsang-ayon — oo, tunay, talaga',
              b: 'Talagang bumilis siya pagkatapos ng dalawang buwan.' },
            { short: 'Pananggi', a: 'Pagtanggi — hindi, huwag, ayaw',
              b: 'Huwag mong hawakan ang kapasitor kung nakakabit pa.' },
            { short: 'Pang-agam', a: 'Hindi tiyak — baka, marahil, siguro',
              b: 'Baka manalo siya kung tatapusin niya ang programa.' }
        ]
    });
}

/* ==========================================================================
   MAPEH FIGURES — Term 2.
   The term is history: of instruments, of art, of games, of how music gets
   from a player to an ear. History taught as dates is the fastest way to
   lose him, so each of these is a mechanism instead — how the sound is
   made, what order the panels go in, what goes on the plate.
   ========================================================================== */

/* Instruments are usually grouped by what they look like. They are actually
   grouped by what vibrates, which is a physics question and a better one. */
function instrumentFamilies() {
    return listPicker({
        id: 'if1', label: 'WHAT ACTUALLY VIBRATES?', height: 272, y0: 60, dy: 26,
        alt: 'Five instrument families, each named by the part that vibrates, with a Filipino example',
        capA: 'Vibrates: ', capB: 'Filipino example: ',
        rows: [
            { btn: '1', short: 'Chordophone — strings', a: 'A stretched string',
              b: 'Kudyapi, the two-string boat lute of Mindanao.' },
            { btn: '2', short: 'Aerophone — wind', a: 'A column of air inside a tube',
              b: 'Tongali, the Kalinga nose flute.' },
            { btn: '3', short: 'Membranophone — drums', a: 'A stretched skin',
              b: 'Dabakan, the goblet drum of a kulintang ensemble.' },
            { btn: '4', short: 'Idiophone — self-sounding', a: 'The whole body of the instrument',
              b: 'Gangsa and kulintang gongs; the kubing jaw harp.' },
            { btn: '5', short: 'Electrophone — electric', a: 'Nothing. A circuit makes the signal',
              b: 'Synthesiser, electric guitar pickup, drum machine.' },
            { btn: '?', short: 'Why it matters', a: 'The family predicts how you change the note',
              b: 'Shorter string, shorter air column, tighter skin, bigger gong.' }
        ]
    });
}

/* Indigenous music here is named by region and by playing technique, not by
   a single word, because "ethnic music" flattens half the country. */
function pinoyEnsembles() {
    return listPicker({
        id: 'pe2', label: 'WHERE IT IS FROM · HOW IT IS PLAYED', height: 272, y0: 60, dy: 26,
        alt: 'Six indigenous Philippine music traditions with their region and playing method',
        capA: 'From: ', capB: 'Played: ',
        rows: [
            { btn: '1', short: 'Gangsa — flat gongs', a: 'The Cordillera, in the north',
              b: 'Toppaya: seated, struck with the palm. Palook: standing, struck with a stick.' },
            { btn: '2', short: 'Kulintang — gong row', a: 'Maguindanao and Maranao, Mindanao',
              b: 'Eight gongs in a row, struck with two padded sticks.' },
            { btn: '3', short: 'Agung & gandingan', a: 'Mindanao, inside the kulintang ensemble',
              b: 'The large hanging gongs that hold the time underneath.' },
            { btn: '4', short: 'Kudyapi — boat lute', a: 'Maguindanao, Maranao, T’boli',
              b: 'Two strings: one carries the melody, one drones.' },
            { btn: '5', short: 'Kubing — jaw harp', a: 'Across Mindanao and the Cordillera',
              b: 'Held to the mouth; your mouth is the amplifier.' },
            { btn: '6', short: 'Bamboo ensembles', a: 'Visayas and Luzon lowlands',
              b: 'Angklung, tongatong, bungkaka — tuned lengths of bamboo.' }
        ]
    });
}

/* Not "old versus new" but a chain of answers to one question: how do you
   move a sound from the player to the listener? */
function musicTech() {
    return listPicker({
        id: 'mt3', label: 'HOW THE SOUND REACHES YOU', height: 272, y0: 60, dy: 26,
        alt: 'Six stages in how music is stored and delivered, from live performance to streaming',
        capA: 'Stored as: ', capB: 'What changed: ',
        rows: [
            { btn: '1', short: 'Live only', a: 'Nothing. It exists while it is played',
              b: 'To hear it you had to be in the room. Every version was different.' },
            { btn: '2', short: 'Notation', a: 'Marks on paper',
              b: 'The piece could travel without the player. Reading became a skill.' },
            { btn: '3', short: 'Record & tape', a: 'A groove, or magnetised tape',
              b: 'One performance, copied. The take became permanent.' },
            { btn: '4', short: 'CD', a: 'Numbers read by a laser',
              b: 'No contact, so no wear. The same copy every play.' },
            { btn: '5', short: 'MP3', a: 'Numbers with the quiet parts thrown away',
              b: 'Small enough to send. That is why it won, not because it sounded better.' },
            { btn: '6', short: 'Streaming', a: 'Nothing on your device at all',
              b: 'You stopped owning it. The catalogue moved to someone else’s computer.' }
        ]
    });
}

/* Six periods, each with the question its artists were trying to answer.
   The Philippine example is there so the period is not only European. */
function artPeriods() {
    return listPicker({
        id: 'ap4', label: 'WHAT WERE THEY TRYING TO DO?', height: 272, y0: 60, dy: 26,
        alt: 'Six periods of art history, each with the question its artists were answering and a Philippine example',
        capA: 'The question: ', capB: 'Here: ',
        rows: [
            { btn: '1', short: 'Prehistoric', a: 'Can I record that this happened?',
              b: 'The Angono Petroglyphs in Rizal — 127 carved figures, around 3000 BC.' },
            { btn: '2', short: 'Classical', a: 'Can I make the human body ideal?',
              b: 'Greek and Roman sculpture: balance, proportion, calm faces.' },
            { btn: '3', short: 'Religious', a: 'Can I teach a story to people who cannot read?',
              b: 'Colonial church painting and santo carving, from the 1500s on.' },
            { btn: '4', short: 'Academic realism', a: 'Can I paint it exactly as the eye sees it?',
              b: 'Juan Luna’s Spoliarium, 1884 — gold medal in Madrid.' },
            { btn: '5', short: 'Modernism', a: 'Why should art look like anything at all?',
              b: 'Victorio Edades broke with Amorsolo’s sunlit style in the 1920s.' },
            { btn: '6', short: 'Digital', a: 'What can I make that could not exist on paper?',
              b: 'Game art, 3D models, animation — including the ones you already use.' }
        ]
    });
}

/* Symbols carry meaning that is lost the moment they are called decoration.
   Each row says what it means, not only what it is. */
function pinoySymbols() {
    return listPicker({
        id: 'ps5', label: 'WHAT IT MEANS, NOT JUST WHAT IT IS', height: 272, y0: 60, dy: 26,
        alt: 'Six Philippine cultural symbols with their origin and the meaning each one carries',
        capA: 'From: ', capB: 'Carries: ',
        rows: [
            { btn: '1', short: 'Sarimanok', a: 'Maranao, Mindanao',
              b: 'A bird holding a fish. A sign of rank and good fortune, not a cartoon.' },
            { btn: '2', short: 'Okir', a: 'Maranao and Maguindanao',
              b: 'Curved leaf and vine carving. Traditionally carved by men, on houses and boats.' },
            { btn: '3', short: 'T’nalak', a: 'T’boli, South Cotabato',
              b: 'Abaca cloth in red, black and white. The patterns come to the weaver in dreams.' },
            { btn: '4', short: 'Bulul', a: 'Ifugao, the Cordillera',
              b: 'A carved rice-granary figure. It guards the harvest; it is not an ornament.' },
            { btn: '5', short: 'Parol', a: 'Pampanga and the whole country',
              b: 'A star lantern. San Fernando’s giant parols run on their own motors.' },
            { btn: '6', short: 'Jeepney art', a: 'Everywhere there is a road',
              b: 'Chrome horses, names, saints. The owner’s whole life painted on a vehicle.' }
        ]
    });
}

/* Sequencing a story is a decision, so he makes it. A wrong order is never
   called wrong — it is shown as a different story, which it is. */
function storyPanels() {
    return orderLab({
        id: 'sp6', height: 206,
        label: 'YOU PUT THE PANELS IN ORDER',
        alt: 'An interactive where the learner sequences four story panels and sees what each wrong order would mean',
        steps: [
            { expr: '? → ? → ? → ?',
              ask: 'Four panels of one story. Which is panel 1?',
              choices: [
                { btn: 'Trophy', ok: false,
                  gives: 'Opening on the trophy tells the reader the ending first.',
                  why: 'That can work — it is called a flash-forward — but then panel 2 has to go back in time, and you have to show that.' },
                { btn: 'Taping hands', ok: true },
                { btn: 'The knockdown', ok: false,
                  gives: 'Opening on the knockdown is dramatic and leaves no setup.',
                  why: 'The reader does not know who is down or why it matters yet.' } ] },
            { expr: 'Taping hands → ? → ? → ?',
              ask: 'Hands are taped. What comes next?',
              choices: [
                { btn: 'Trophy', ok: false,
                  gives: 'Taping, then the trophy. The fight is skipped entirely.',
                  why: 'Skipping the middle is allowed, but then the story is about preparation, not the fight.' },
                { btn: 'Walking out', ok: true } ] },
            { expr: 'Taping → Walking out → ? → ?',
              ask: 'He is in the ring. What now?',
              choices: [
                { btn: 'The knockdown', ok: true },
                { btn: 'Trophy', ok: false,
                  gives: 'Walking out, then the trophy. He wins with nothing at stake.',
                  why: 'A story needs the moment it could have gone the other way.' } ] },
            { expr: 'Taping → Walking out → Knockdown → Trophy',
              done: 'Setup, build, turning point, outcome. Four panels, one story.' }
        ]
    });
}

/* These games are a PE syllabus that nobody wrote down. Each row names the
   fitness component it trains, so "old game" becomes "specific training". */
function pinoyGames() {
    return listPicker({
        id: 'pg7', label: 'WHAT EACH GAME ACTUALLY TRAINS', height: 272, y0: 60, dy: 26,
        alt: 'Six traditional Filipino games with how each is played and the fitness component it trains',
        capA: 'How: ', capB: 'Trains: ',
        rows: [
            { btn: '1', short: 'Patintero', a: 'Cross a grid of lines without being tagged',
              b: 'Agility and reaction. Direction changes, not straight-line speed.' },
            { btn: '2', short: 'Tumbang preso', a: 'Knock down a can with a slipper, then retrieve it',
              b: 'Accuracy under pressure, plus sprinting.' },
            { btn: '3', short: 'Sipa', a: 'Keep a weighted shuttle up with your feet',
              b: 'Balance and coordination. Closest Filipino game to footwork drills.' },
            { btn: '4', short: 'Luksong tinik', a: 'Jump over a rising stack of hands and feet',
              b: 'Explosive power and flexibility together.' },
            { btn: '5', short: 'Piko', a: 'Hop a drawn grid on one foot',
              b: 'Single-leg balance and ankle control.' },
            { btn: '6', short: 'Sungka', a: 'Move shells around a carved board',
              b: 'Nothing physical. Counting ahead — it is a strategy game.' }
        ]
    });
}

/* The plate, tappable. Pinggang Pinoy is a proportion, so a figure that
   shows the proportion does the teaching that a list of food groups cannot. */
function pinggangPinoy() {
    const CX = 182, CY = 124, R = 80;
    const plate = `
      <g data-p="glow">
        <path class="fig-cloth" d="M${CX} ${CY - R} A${R} ${R} 0 0 0 ${CX} ${CY + R} Z"/>
        <text class="fig-cell" x="${CX - 42}" y="${CY + 5}" text-anchor="middle">GLOW</text>
      </g>
      <g data-p="go">
        <path class="fig-liquid" d="M${CX} ${CY} L${CX} ${CY - R} A${R} ${R} 0 0 1 ${CX + R} ${CY} Z"/>
        <text class="fig-cell" x="${CX + 34}" y="${CY - 28}" text-anchor="middle">GO</text>
      </g>
      <g data-p="grow">
        <path class="fig-band" d="M${CX} ${CY} L${CX + R} ${CY} A${R} ${R} 0 0 1 ${CX} ${CY + R} Z"/>
        <text class="fig-cell" x="${CX + 32}" y="${CY + 38}" text-anchor="middle">GROW</text>
      </g>
      <circle class="fig-wheel" cx="${CX}" cy="${CY}" r="${R}"/>
      <g data-p="water">
        <circle class="fig-liquid" cx="326" cy="86" r="26"/>
        <circle class="fig-wheel" cx="326" cy="86" r="26"/>
        <text class="fig-cell" x="326" y="130" text-anchor="middle">tubig</text>
      </g>`;
    return partPicker({
        id: 'pp8', height: 296, capY: 240,
        label: 'TAP A PART OF THE PLATE',
        alt: 'The Pinggang Pinoy plate divided into vegetables and fruit, energy foods and body-building foods, with water beside it',
        scene: plate,
        parts: [
            { btn: 'Glow', pick: ['glow'],
              a: 'GLOW \u2014 vegetables and fruit, half the plate',
              b: 'Vitamins and minerals. The biggest share, and the one usually missing.' },
            { btn: 'Go', pick: ['go'],
              a: 'GO \u2014 rice, bread, root crops',
              b: 'Energy. Not the enemy: it is what the training runs on.' },
            { btn: 'Grow', pick: ['grow'],
              a: 'GROW \u2014 fish, meat, egg, beans, milk',
              b: 'Body-building. The smallest share of the plate, and still essential.' },
            { btn: 'Water', pick: ['water'],
              a: 'WATER \u2014 beside the plate, not on it',
              b: 'Six to eight glasses a day, more when you train.' },
            { btn: 'All', pick: ['glow', 'go', 'grow', 'water'],
              a: 'HALF GLOW, THEN GO, THEN GROW',
              b: 'The proportions are the lesson. A list of food groups cannot show them.' }
        ]
    });
}

/* A multimedia project fails in the planning, not the making, so the figure
   is the planning — and a wrong order shows the cost rather than a cross. */
function projectOrder() {
    return orderLab({
        id: 'po10', height: 206,
        label: 'YOU PLAN THE PROJECT',
        alt: 'An interactive where the learner orders the stages of a historical multimedia project',
        steps: [
            { expr: '? → ? → ? → ?',
              ask: 'A short video about one event. What do you do first?',
              choices: [
                { btn: 'Record audio', ok: false,
                  gives: 'You record a narration before you know what happens in it.',
                  why: 'The script decides the length of every shot. Recording first means recording twice.' },
                { btn: 'Find the facts', ok: true },
                { btn: 'Pick music', ok: false,
                  gives: 'Music first means cutting the facts to fit a song.',
                  why: 'That is how an accurate project becomes a wrong one.' } ] },
            { expr: 'Find the facts → ? → ? → ?',
              ask: 'You have the facts and the sources. Now?',
              choices: [
                { btn: 'Write the script', ok: true },
                { btn: 'Edit', ok: false,
                  gives: 'Editing with no script means guessing in the timeline.',
                  why: 'Every change costs ten times more once the clips are in.' } ] },
            { expr: 'Facts → Script → ? → ?',
              ask: 'Script is done. Next?',
              choices: [
                { btn: 'Gather media', ok: true },
                { btn: 'Publish', ok: false,
                  gives: 'Nothing to publish yet — there are no images or clips.',
                  why: 'The script tells you exactly which media to collect. That is its other job.' } ] },
            { expr: 'Facts → Script → Media → Edit & cite',
              done: 'Facts, script, media, edit. Cite every source on screen or at the end.' }
        ]
    });
}


/* The expo is the term's final piece, so the review board doubles as a
   planning board: ten weeks, what to show from each, and the thing that
   usually goes wrong on the day. */
function mapehT2Map() {
    return examMap({
        id: 'mpt2', label: 'TEN WEEKS \u00b7 WHAT TO SHOW',
        alt: 'The ten MAPEH topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Instrument families',
              a: 'What vibrates: string, air, skin, body, circuit',
              b: 'A gong is an idiophone, not a drum. Nothing is stretched over it.' },
            { btn: '2', short: 'Indigenous music',
              a: 'Gangsa in the north; kulintang in the south',
              b: 'Toppaya is the palm, palook is the stick. They are techniques, not places.' },
            { btn: '3', short: 'Then vs. now',
              a: 'Live, notation, record, CD, MP3, streaming',
              b: 'The MP3 won on size. It throws audio away on purpose.' },
            { btn: '4', short: 'Art through time',
              a: 'Each period answers a question; Angono, Luna, Amorsolo, Edades',
              b: 'Luna painted the Spoliarium. Amorsolo painted sunlight.' },
            { btn: '5', short: 'Cultural symbols',
              a: 'Sarimanok, okir, t\u2019nalak, bulul, parol, flag',
              b: 'Three stars are the island groups, not three heroes.' },
            { btn: '6', short: 'Storytelling',
              a: 'Setup, build, turning point, outcome; panel and gutter',
              b: 'The reader fills the gutter. The best moment is often not drawn.' },
            { btn: '7', short: 'Traditional games',
              a: 'What each game trains, not just how it is played',
              b: 'Sungka trains nothing physical. It is a strategy game.' },
            { btn: '8', short: 'Wellness & nutrition',
              a: 'Go, Grow, Glow and the proportions of the plate',
              b: 'Glow is the biggest share. Go is not the enemy.' },
            { btn: '9', short: 'Fitness & recreation',
              a: 'The five components, and a test for each',
              b: 'Strength is one effort; endurance is many. Different tests.' },
            { btn: '10', short: 'Multimedia project',
              a: 'Facts, script, media, edit \u2014 in that order',
              b: 'Picking music first means cutting the facts to fit a song.' }
        ]
    });
}

/* ==========================================================================
   TLE FIGURES — Term 2. Kitchen, pantry, laundry, needle.
   Home skills are usually taught as lists of rules with no mechanism, which
   is why they are forgotten the week after the test. Each of these shows the
   reason instead: what the temperature does to bacteria, why the zones sit
   where they do, what a stitch is actually holding.
   ========================================================================== */

/* Tools grouped by the job, because a drawer full of named objects is not
   knowledge. The last row is the one that prevents most injuries. */
function kitchenTools() {
    return listPicker({
        id: 'kt1', label: 'WHAT IS IT FOR?', height: 272, y0: 60, dy: 26,
        alt: 'Six kitchen tools grouped by the job each one does, with the reason for each',
        capA: 'Job: ', capB: 'Why that one: ',
        rows: [
            { btn: '1', short: 'Chef’s knife', a: 'Chopping, slicing, dicing — most cutting',
              b: 'The curve lets you rock it. One good knife beats five bad ones.' },
            { btn: '2', short: 'Paring knife', a: 'Small, close work in your hand',
              b: 'Peeling and trimming. A chef’s knife here is how fingers get cut.' },
            { btn: '3', short: 'Measuring cups & spoons', a: 'Measuring by volume',
              b: 'Baking fails without them. "A bit" is not a quantity.' },
            { btn: '4', short: 'Colander & sieve', a: 'Separating solid from liquid',
              b: 'Same idea as filtration in Science: holes pass one, hold the other.' },
            { btn: '5', short: 'Tongs & turner', a: 'Moving hot food without touching it',
              b: 'A fork pierces meat and lets the juice out. Tongs do not.' },
            { btn: '6', short: 'Thermometer', a: 'Telling you if food is actually safe',
              b: 'Colour is not doneness. 74°C for chicken, measured, not guessed.' }
        ]
    });
}

/* The work triangle, drawn. A kitchen is laid out badly when you cross your
   own path; the figure shows the four zones and the walk between them. */
function kitchenZones() {
    const zone = (pid, x, y, label) => `
      <g data-p="${pid}">
        <rect class="fig-box" x="${x}" y="${y}" width="74" height="42" rx="4"/>
        <text class="fig-cell" x="${x + 37}" y="${y + 26}" text-anchor="middle">${label}</text>
      </g>`;
    const room = `
      <rect class="fig-arena" x="40" y="44" width="320" height="168" rx="8"/>
      ${zone('store', 52, 56, 'store')}
      ${zone('wash', 146, 56, 'wash')}
      ${zone('prep', 240, 56, 'prep')}
      ${zone('cook', 146, 150, 'cook')}
      <g data-p="walk">
        <path class="fig-flow on" fill="none" d="M126 77 L146 77 M220 77 L240 77 M277 98 L277 128 L220 171"/>
      </g>`;
    return partPicker({
        id: 'kz2', height: 296, capY: 244,
        label: 'TAP A ZONE \u00b7 SEE THE WALK',
        alt: 'A kitchen plan with store, wash, prep and cook zones and the path between them',
        scene: room,
        parts: [
            { btn: 'Store', pick: ['store'],
              a: 'STORE \u2014 fridge, pantry, cupboards',
              b: 'Food comes in here and should not have to cross the room to be used.' },
            { btn: 'Wash', pick: ['wash'],
              a: 'WASH \u2014 sink, drainer, bin',
              b: 'Between store and prep, because washing happens before cutting.' },
            { btn: 'Prep', pick: ['prep'],
              a: 'PREP \u2014 board, knives, clear counter',
              b: 'The biggest clear surface. Prep with no space is where accidents happen.' },
            { btn: 'Cook', pick: ['cook'],
              a: 'COOK \u2014 stove, oven, pans',
              b: 'Closed off from the walkway, so nobody walks past a hot pan.' },
            { btn: 'The walk', pick: ['walk', 'store', 'wash', 'prep', 'cook'],
              a: 'STORE \u2192 WASH \u2192 PREP \u2192 COOK',
              b: 'One direction, no crossing back. That is the whole point of zoning.' }
        ]
    });
}

/* The one food-safety fact that explains all the others. Bacteria growth
   against temperature, so the two-hour rule and the fridge setting stop
   being arbitrary numbers. */
function dangerZone() {
    const rate = v => v <= -18 ? 0 : v <= 4 ? 0.12 : v < 60 ? (v < 20 ? 0.9 : 2) : 0;
    const note = {
        '-18': 'Frozen. Growth is stopped, not reversed — bacteria already there survive.',
        '4': 'Fridge temperature. Growth is very slow. This is why a fridge buys you days.',
        '20': 'Room temperature in Manila. Growth is well underway.',
        '37': 'Body temperature — the fastest growth of all. Doubling about every 20 minutes.',
        '65': 'Above 60°C growth stops and most bacteria begin to die. Hot holding works.'
    };
    return ruleLab({
        id: 'dz3', label: 'PRESS A TEMPERATURE',
        alt: 'A lab showing how fast bacteria grow at different temperatures and how long food is safe',
        input: { name: 'Temperature', unit: '°C', values: [-18, 4, 20, 37, 65] },
        sharedScale: true,
        outputs: [
            { name: 'Bacteria growth', f: rate, fmt: o => o === 0 ? 'stopped' : o < 0.5 ? 'very slow' : o < 1.5 ? 'fast' : 'fastest' },
            { name: 'Safe time out', f: v => rate(v) === 0 ? 2 : v <= 4 ? 2 : 0.4,
              fmt: o => o === 2 ? 'hours and hours' : 'about 2 hours, no more' }
        ],
        rule: v => note[String(v)]
    });
}

/* Where things go, and why. He makes the call and a wrong one is answered
   with what would actually happen to the food. */
function pantryOrder() {
    return orderLab({
        id: 'po4', height: 206,
        label: 'YOU DECIDE WHERE IT GOES',
        alt: 'An interactive where the learner decides where to store four items and sees the consequence of each choice',
        steps: [
            { expr: 'Raw chicken',
              ask: 'Shopping is on the counter. Where does the raw chicken go?',
              choices: [
                { btn: 'Top shelf', ok: false,
                  gives: 'Juice drips onto everything below it.',
                  why: 'Raw meat always goes on the bottom shelf, in a sealed container.' },
                { btn: 'Bottom shelf', ok: true },
                { btn: 'Pantry', ok: false,
                  gives: 'At 20°C bacteria are already multiplying fast.',
                  why: 'Raw meat has about two hours out of refrigeration, total.' } ] },
            { expr: 'Two tins of the same sardines',
              ask: 'One tin expires in March, one in August. How do you shelve them?',
              choices: [
                { btn: 'August in front', ok: false,
                  gives: 'You reach for the August tin first and the March one expires unopened.',
                  why: 'First in, first out — FIFO. Nearest expiry goes in front.' },
                { btn: 'March in front', ok: true } ] },
            { expr: 'Opened bag of rice',
              ask: 'Where does an opened bag of rice belong?',
              choices: [
                { btn: 'Sealed container', ok: true },
                { btn: 'Folded over, as is', ok: false,
                  gives: 'Weevils and ants get in, and the rice takes up damp.',
                  why: 'Opened dry goods go into something that closes properly.' } ] },
            { expr: 'Cooked rice, still warm',
              ask: 'Last one. Warm cooked rice at 9pm?',
              choices: [
                { btn: 'Leave overnight', ok: false,
                  gives: 'Cooked rice left out is one of the most common causes of food poisoning.',
                  why: 'Bacillus cereus survives cooking and multiplies as the rice cools.' },
                { btn: 'Cool fast, then fridge', ok: true } ] },
            { expr: 'All four stored',
              done: 'Raw low and sealed, nearest expiry in front, dry goods closed, cooked food cooled fast.' }
        ]
    });
}

/* Five cuts, named, with the reason each shape exists. The reason is always
   cooking time, which is the idea worth keeping. */
function knifeCuts() {
    return listPicker({
        id: 'kc5', label: 'WHY THAT SHAPE?', height: 272, y0: 60, dy: 26,
        alt: 'Five knife cuts with the shape each produces and the reason for using it',
        capA: 'Shape: ', capB: 'Used because: ',
        rows: [
            { btn: '1', short: 'Slice', a: 'Flat pieces of even thickness',
              b: 'Even thickness means every piece is done at the same moment.' },
            { btn: '2', short: 'Dice', a: 'Cubes, all the same size',
              b: 'Cubes cook evenly from every side. Small dice cooks faster.' },
            { btn: '3', short: 'Julienne', a: 'Thin matchsticks',
              b: 'Maximum surface, minimum time. For stir-fries and raw salads.' },
            { btn: '4', short: 'Mince', a: 'Very fine, almost paste',
              b: 'Garlic and ginger minced spread flavour through the whole pan.' },
            { btn: '5', short: 'Chiffonade', a: 'Fine ribbons of leaves',
              b: 'Stacked, rolled and sliced. Keeps herbs from bruising into mush.' },
            { btn: '!', short: 'The claw', a: 'Fingertips curled under, knuckles forward',
              b: 'The blade rides your knuckles. A sharp knife cuts you less than a dull one.' }
        ]
    });
}

/* Mise en place is an order, not a tidiness rule, and he works it out. */
function miseOrder() {
    return orderLab({
        id: 'mo6', height: 206,
        label: 'YOU RUN THE WORKSTATION',
        alt: 'An interactive where the learner orders the stages of preparing and cooking a simple dish',
        steps: [
            { expr: 'Adobo for four. What first?',
              ask: 'Nothing is out yet. What is the first move?',
              choices: [
                { btn: 'Heat the pan', ok: false,
                  gives: 'The pan is hot and you are still looking for the garlic.',
                  why: 'Heat starts a clock you cannot pause. Everything else comes first.' },
                { btn: 'Read it through', ok: true },
                { btn: 'Start chopping', ok: false,
                  gives: 'You chop, then find out the recipe wanted it whole.',
                  why: 'Read the whole method once. It is thirty seconds and it saves the dish.' } ] },
            { expr: 'Read through → ?',
              ask: 'You know the method. Now?',
              choices: [
                { btn: 'Gather everything', ok: true },
                { btn: 'Heat the pan', ok: false,
                  gives: 'Still hunting for ingredients with a hot pan behind you.',
                  why: 'Mise en place means everything in place before any heat.' } ] },
            { expr: 'Read → Gather → ?',
              ask: 'Everything is on the counter. Next?',
              choices: [
                { btn: 'Cut and measure', ok: true },
                { btn: 'Wash up', ok: false,
                  gives: 'Clean sink, nothing prepped, and no time saved.',
                  why: 'Washing up happens in the gaps while things cook.' } ] },
            { expr: 'Read → Gather → Prep → ?',
              ask: 'Prepped and measured. Now you can…',
              choices: [
                { btn: 'Heat and cook', ok: true } ] },
            { expr: 'Read → Gather → Prep → Cook → Clean as you go',
              done: 'Read, gather, prep, cook. Clean in the waiting time, not at the end.' }
        ]
    });
}

/* Care labels are a written language almost nobody is taught to read. */
function laundryCodes() {
    return listPicker({
        id: 'lc8', label: 'READ THE LABEL', height: 272, y0: 60, dy: 26,
        alt: 'Six laundry care symbols and what each one instructs',
        capA: 'Means: ', capB: 'In practice: ',
        rows: [
            { btn: '1', short: 'Tub of water', a: 'Machine washing',
              b: 'A number inside is the maximum temperature. Dots mean the same thing.' },
            { btn: '2', short: 'Tub with a hand', a: 'Hand wash only',
              b: 'Usually wool or something loosely knitted. A machine will felt it.' },
            { btn: '3', short: 'Triangle', a: 'Bleaching',
              b: 'Crossed out means no bleach at all — including most stain removers.' },
            { btn: '4', short: 'Square', a: 'Drying',
              b: 'A circle inside is a tumble dryer. A line inside means dry flat or on a line.' },
            { btn: '5', short: 'Iron', a: 'Ironing',
              b: 'Dots are the heat setting: one is coolest. Crossed out means do not iron.' },
            { btn: '6', short: 'Any symbol crossed out', a: 'Do not do this',
              b: 'The cross is the whole instruction. Ignoring it is how a shirt is ruined once.' }
        ]
    });
}

/* Stitches by what they are holding, so the choice has a reason. */
function stitchKinds() {
    return listPicker({
        id: 'sk9', label: 'WHICH STITCH, AND WHY', height: 272, y0: 60, dy: 26,
        alt: 'Six hand stitches with what each is for and how strong it is',
        capA: 'For: ', capB: 'Strength: ',
        rows: [
            { btn: '1', short: 'Running stitch', a: 'Quick seams and gathering',
              b: 'Weakest of the set. Fast to sew, fast to pull out.' },
            { btn: '2', short: 'Backstitch', a: 'A seam that has to hold',
              b: 'Strongest hand stitch. Each stitch doubles back on the last.' },
            { btn: '3', short: 'Basting stitch', a: 'Holding two pieces while you sew properly',
              b: 'Deliberately weak and long. It is meant to come out.' },
            { btn: '4', short: 'Hemming stitch', a: 'Turning up an edge so it does not fray',
              b: 'Barely visible from the front, which is the point.' },
            { btn: '5', short: 'Overcast stitch', a: 'Wrapping a raw edge',
              b: 'Stops fraying on fabric that has been cut.' },
            { btn: '6', short: 'Sewing a button', a: 'Four holes, a shank, a knot underneath',
              b: 'Leave slack for the thickness of the buttonhole, or it will not sit flat.' }
        ]
    });
}


/* The practical test is the term, done rather than written. The board names
   what each week will actually be marked on. */
function tleT2Map() {
    return examMap({
        id: 'tlt2', label: 'TEN WEEKS \u00b7 WHAT IS MARKED',
        alt: 'The ten TLE topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Tools',
              a: 'Which tool for which job; thermometer over colour',
              b: 'A sharp knife is the safe one. A dull blade needs force.' },
            { btn: '2', short: 'Organisation',
              a: 'Store, wash, prep, cook \u2014 one direction',
              b: 'Clean-as-you-go is a time strategy, not tidiness.' },
            { btn: '3', short: 'Food safety',
              a: '5\u201360\u00b0C danger zone; two hours total',
              b: 'The clock does not reset in the fridge. Freezing does not kill.' },
            { btn: '4', short: 'Pantry',
              a: 'FIFO; fridge 4\u00b0C, freezer \u221218\u00b0C',
              b: 'Use by is safety. Best before is quality.' },
            { btn: '5', short: 'Preparation',
              a: 'Slice, dice, julienne, mince, chiffonade; the claw',
              b: 'Equal beats fine. Do not pack flour; do pack brown sugar.' },
            { btn: '6', short: 'No-cook',
              a: 'No kill step, so handling is everything',
              b: 'Acid firms fish. Freezing is what deals with parasites.' },
            { btn: '7', short: 'Cooking skills',
              a: 'Conduction, convection, radiation; dry and moist heat',
              b: 'You cannot brown in water. It stops at 100\u00b0C.' },
            { btn: '8', short: 'Laundry',
              a: 'Reading care symbols; sorting; cold for protein stains',
              b: 'Hot water sets blood and egg. Cold first, always.' },
            { btn: '9', short: 'Sewing',
              a: 'Running, back, basting, hemming, overcast, buttons',
              b: 'Backstitch holds. Basting is meant to come out.' },
            { btn: '10', short: 'Home system',
              a: 'A place for everything, and a repeatable routine',
              b: 'A system you have to remember is not a system.' }
        ]
    });
}

/* ==========================================================================
   DEVOTION FIGURES — Term 2.
   Character is usually taught as a word and a verse, which is why none of it
   survives contact with an actual bad afternoon. These figures put the
   mechanism in: where the gap between trigger and action is, what
   forgiveness does and does not include, what order a conflict is handled
   in. Scripture here is fixed by the subject, so the examples stay inside
   the text and the lens cards carry his world.
   ========================================================================== */

/* The gap between trigger and action is where self-control lives. He works
   the sequence himself, and a wrong choice is answered with what it costs
   rather than with a verdict. */
function impulseGap() {
    return orderLab({
        id: 'ig1', height: 212,
        label: 'YOU CHOOSE WHAT HAPPENS IN THE GAP',
        alt: 'An interactive where the learner works through the moment between a trigger and a reaction',
        steps: [
            { expr: 'Someone takes your turn.',
              ask: 'The anger is already there. What is the very first move?',
              choices: [
                { btn: 'Say it now', ok: false,
                  gives: 'The sentence lands before you have chosen it, and you cannot take it back.',
                  why: 'Proverbs 25:28 — a person with no self-control is a city with its walls broken down. Nothing is holding the line.' },
                { btn: 'Notice it', ok: true },
                { btn: 'Pretend it is fine', ok: false,
                  gives: 'It goes underground and comes out later, at someone who did nothing.',
                  why: 'Self-control is not pretending. Ephesians 4:26 allows the anger and sets a limit on it.' } ] },
            { expr: 'You noticed it. Anger named.',
              ask: 'There is now a gap. What goes in it?',
              choices: [
                { btn: 'One breath', ok: true },
                { btn: 'Plan the comeback', ok: false,
                  gives: 'You spend the gap building a better insult, and then you use it.',
                  why: 'The gap is for choosing, not for aiming.' } ] },
            { expr: 'Noticed. Breathed.',
              ask: 'Now you can actually decide. Which question helps?',
              choices: [
                { btn: '"How do I win this?"', ok: false,
                  gives: 'Winning the exchange usually costs the friendship.',
                  why: 'Romans 12:18 — as far as it depends on you, live at peace. Winning is not the goal named there.' },
                { btn: '"What do I want after?"', ok: true } ] },
            { expr: 'Noticed → Breathed → Asked → Chose',
              done: 'Self-control is not feeling less. It is the gap between feeling and acting, used on purpose.' }
        ]
    });
}

/* Gratitude fails when it is only a mood. Four kinds, each with the thing
   that makes it concrete. */
function gratitudeKinds() {
    return listPicker({
        id: 'gk2', label: 'FOUR KINDS, NOT ONE MOOD', height: 272, y0: 60, dy: 26,
        alt: 'Four kinds of gratitude, each with what makes it specific and a scripture reference',
        capA: 'Means: ', capB: 'In the text: ',
        rows: [
            { btn: '1', short: 'For what is obvious', a: 'Food, a bed, people who came back for you',
              b: 'Psalm 103:2 — "forget not all his benefits". The command is against forgetting.' },
            { btn: '2', short: 'For what you nearly missed', a: 'The thing that almost went wrong and did not',
              b: 'Luke 17 — ten were healed, one came back. Nine were glad and did not say so.' },
            { btn: '3', short: 'In hard circumstances', a: 'Thanks *in* it, which is not thanks *for* it',
              b: '1 Thessalonians 5:18 says "in all circumstances", not "for all circumstances".' },
            { btn: '4', short: 'Said out loud', a: 'Named, to the person, specifically',
              b: 'Gratitude nobody hears changes nothing between two people.' },
            { btn: '5', short: 'Why it is specific', a: 'A vague thanks is a mood; a named one is a fact',
              b: '"Thanks for everything" is forgettable. "Thanks for waiting for me" is not.' },
            { btn: '6', short: 'The usual failure', a: 'Comparison',
              b: 'You cannot be grateful and be counting what someone else has at the same time.' }
        ]
    });
}

/* Compassion is four steps and most people stop at two. Naming the steps is
   what makes the stopping visible. */
function compassionSteps() {
    return listPicker({
        id: 'cs3', label: 'FOUR STEPS \\u00b7 WHERE PEOPLE STOP', height: 272, y0: 60, dy: 26,
        alt: 'The four steps of compassion with the point at which most people stop',
        capA: 'Step: ', capB: 'In the text: ',
        rows: [
            { btn: '1', short: 'Notice', a: 'You actually see the person',
              b: 'Matthew 9:36 — he saw the crowds and had compassion. Seeing comes first.' },
            { btn: '2', short: 'Feel', a: 'It moves something in you',
              b: 'The priest and the Levite in Luke 10 may well have felt it. They still walked past.' },
            { btn: '3', short: 'Move', a: 'You cross the road',
              b: 'The Samaritan "went to him". That verb is the whole parable.' },
            { btn: '4', short: 'Cost', a: 'It takes your time, money or plan',
              b: 'Oil, wine, bandages, his animal, two days\\u2019 wages, and a promise to return.' },
            { btn: '!', short: 'Where people stop', a: 'Between feel and move',
              b: 'Feeling sorry is not the same as helping. The parable is built to make that obvious.' },
            { btn: '?', short: 'Who the Samaritan was', a: 'Someone the audience would not have admired',
              b: 'That choice is deliberate. The person who helped was the one nobody expected to.' }
        ]
    });
}

/* Patience is abstract until it is measured. Real intervals, from the text. */
function patienceCases() {
    return listPicker({
        id: 'pc4', label: 'HOW LONG THEY ACTUALLY WAITED', height: 272, y0: 60, dy: 26,
        alt: 'Four scriptural examples of waiting, each with the length of the wait',
        capA: 'The wait: ', capB: 'What it means: ',
        rows: [
            { btn: '1', short: 'Joseph', a: 'Sold at seventeen; before Pharaoh at thirty',
              b: 'Thirteen years, including prison. Genesis 37 and 41 give both ages.' },
            { btn: '2', short: 'Abraham', a: 'Promised a son at seventy-five; Isaac born at a hundred',
              b: 'Twenty-five years. Genesis 12 and 21.' },
            { btn: '3', short: 'David', a: 'Anointed as a boy; crowned at thirty',
              b: 'Years of running and hiding between the oil and the throne. 2 Samuel 5:4.' },
            { btn: '4', short: 'The farmer', a: 'A whole season, with nothing visible for weeks',
              b: 'James 5:7 uses him on purpose: patience that is work, not waiting around.' },
            { btn: '!', short: 'What patience is not', a: 'It is not doing nothing',
              b: 'Joseph ran a household and then a prison. The waiting was active the whole time.' },
            { btn: '?', short: 'Why it is hard now', a: 'Everything else in your day is instant',
              b: 'A skill that takes months feels broken when a video loads in a second.' }
        ]
    });
}

/* Four things that get collapsed into one word, and the collapsing is what
   makes forgiveness feel impossible or fake. */
function forgiveParts() {
    return listPicker({
        id: 'fp6', label: 'FOUR THINGS, ONE WORD', height: 272, y0: 60, dy: 26,
        alt: 'Forgiveness, reconciliation, trust and consequences separated out, with what each one means',
        capA: 'Is: ', capB: 'Note: ',
        rows: [
            { btn: '1', short: 'Forgiveness', a: 'Letting go of your claim to pay them back',
              b: 'It is a decision you can make alone. It does not need them to agree.' },
            { btn: '2', short: 'Reconciliation', a: 'The relationship working again',
              b: 'This one takes two. You cannot do it by yourself, and that is not your failure.' },
            { btn: '3', short: 'Trust', a: 'Believing they will not do it again',
              b: 'Rebuilt over time, by what they do. Forgiving is immediate; trust is earned.' },
            { btn: '4', short: 'Consequences', a: 'What follows from what was done',
              b: 'Forgiving someone does not remove these, and asking for them is not revenge.' },
            { btn: '!', short: 'Why it matters', a: 'Collapsing all four makes forgiveness impossible',
              b: '"Forgive and forget" asks for four things at once and gets none of them.' },
            { btn: '?', short: 'Seventy-seven times', a: 'Matthew 18:22 \\u2014 Peter asked if seven was enough',
              b: 'The answer is a number so large it stops being a count. Some translations say seventy times seven.' }
        ]
    });
}

/* 1 Corinthians 12, drawn. The argument is anatomical, so the figure is. */
function oneBodyMany() {
    /* Markers sit on a neutral silhouette with a short leader to the label,
       so the dot reads against the body rather than disappearing into it. */
    const mark = (pid, x, y, lx, ly, anchor, label) => `
      <g data-p="${pid}">
        <path class="fig-flow" fill="none" d="M${x} ${y} L${lx + (anchor === 'end' ? 8 : -8)} ${ly - 4}"/>
        <circle class="fig-point-h" cx="${x}" cy="${y}" r="7"/>
        <circle class="fig-point" cx="${x}" cy="${y}" r="11"/>
        <text class="fig-cell" x="${lx}" y="${ly}" text-anchor="${anchor}">${label}</text>
      </g>`;
    const body = `
      <g class="fig-organ">
        <circle cx="200" cy="72" r="27"/>
        <rect x="185" y="99" width="30" height="64" rx="13"/>
        <rect x="146" y="107" width="108" height="15" rx="7"/>
        <rect x="185" y="163" width="13" height="50" rx="6"/>
        <rect x="202" y="163" width="13" height="50" rx="6"/>
      </g>
      ${mark('eye', 190, 64, 108, 58, 'end', 'eye')}
      ${mark('ear', 224, 74, 292, 70, 'start', 'ear')}
      ${mark('hand', 150, 114, 108, 132, 'end', 'hand')}
      ${mark('foot', 191, 209, 292, 206, 'start', 'foot')}`;
    return partPicker({
        id: 'ob7', height: 300, capY: 252,
        label: 'TAP A PART',
        alt: 'A single figure with eye, ear, hand and foot marked, illustrating one body with many parts',
        scene: body,
        parts: [
            { btn: 'Eye', pick: ['eye'],
              a: 'THE EYE \u2014 it sees, and that is all it does',
              b: '1 Corinthians 12:17 \u2014 if the whole body were an eye, where would the hearing be?' },
            { btn: 'Ear', pick: ['ear'],
              a: 'THE EAR \u2014 it cannot see, and nobody asks it to',
              b: 'Its limit is not a fault. A body of identical parts is not a body.' },
            { btn: 'Hand', pick: ['hand'],
              a: 'THE HAND \u2014 it reaches and holds',
              b: 'Verse 21: the eye cannot say to the hand, "I have no need of you."' },
            { btn: 'Foot', pick: ['foot'],
              a: 'THE FOOT \u2014 unglamorous, and it carries everything',
              b: 'Verse 15: the foot saying it is not a hand does not make it less part of the body.' },
            { btn: 'All of it', pick: ['eye', 'ear', 'hand', 'foot'],
              a: 'ONE BODY, MANY PARTS, DIFFERENT JOBS',
              b: 'The argument is that difference is the design, not a problem to be fixed.' }
        ]
    });
}

/* Matthew 18:15-17 is a sequence, and the sequence is the point: it starts
   as small and as private as it can. He walks it. */
function peaceSteps() {
    return orderLab({
        id: 'ps9', height: 212,
        label: 'YOU WALK THE STEPS',
        alt: 'An interactive walking through the escalation sequence for handling a wrong, smallest step first',
        steps: [
            { expr: 'Someone in your class wronged you.',
              ask: 'Matthew 18 gives an order. What is the first step?',
              choices: [
                { btn: 'Tell everyone', ok: false,
                  gives: 'Now it is a public fight and nobody can back down without losing face.',
                  why: 'The sequence starts as privately as possible precisely so that backing down stays cheap.' },
                { btn: 'Go to them alone', ok: true },
                { btn: 'Say nothing ever', ok: false,
                  gives: 'It stays unresolved and you carry it instead.',
                  why: 'Matthew 18:15 says go. Silence is not on the list.' } ] },
            { expr: 'You went alone. It did not work.',
              ask: 'They would not hear it. Next?',
              choices: [
                { btn: 'Post about it', ok: false,
                  gives: 'An audience arrives and the point stops being the wrong.',
                  why: 'Each step adds the smallest number of people that could help.' },
                { btn: 'Bring one or two', ok: true } ] },
            { expr: 'Still unresolved, with witnesses.',
              ask: 'Now what?',
              choices: [
                { btn: 'Take it to the body', ok: true },
                { btn: 'Get even', ok: false,
                  gives: 'You become the second wrong and the first one stops mattering.',
                  why: 'Romans 12:17 — do not repay evil for evil. That ends the sequence rather than finishing it.' } ] },
            { expr: 'Alone \\u2192 One or two \\u2192 The body',
              done: 'Smallest first, widening only when it must. A peacemaker is not the same as someone who avoids conflict.' }
        ]
    });
}

/* Words are usually discussed as niceness. James compares the tongue to
   three pieces of machinery, which is a far better frame. */
function wordsWeight() {
    return listPicker({
        id: 'ww10', label: 'WHAT JAMES COMPARES IT TO', height: 272, y0: 60, dy: 26,
        alt: 'The three images James uses for the tongue, plus the practical tests for speech',
        capA: 'The image: ', capB: 'Why it fits: ',
        rows: [
            { btn: '1', short: 'A bit in a horse\\u2019s mouth', a: 'James 3:3 — a small part steering a large animal',
              b: 'A few words decide the direction of a whole conversation.' },
            { btn: '2', short: 'A ship\\u2019s rudder', a: 'James 3:4 — tiny, against wind and weight',
              b: 'The smallest control surface on the vessel sets its course.' },
            { btn: '3', short: 'A small fire', a: 'James 3:5 — one spark, a whole forest',
              b: 'Damage out of all proportion to the effort of starting it.' },
            { btn: '4', short: 'The test before speaking', a: 'Is it true? Is it needed? Is it the moment?',
              b: 'Ephesians 4:29 sets the bar at "building up", not merely "not lying".' },
            { btn: '5', short: 'Encouragement, specifically', a: 'Name the thing, not the person',
              b: '"You kept going after that round" lands. "You\\u2019re great" does not.' },
            { btn: '6', short: 'Why it cannot be taken back', a: 'Proverbs 18:21 — life and death are in its power',
              b: 'An apology repairs a relationship. It does not unsay the sentence.' }
        ]
    });
}

/* The term's review board. */
function devT2Map() {
    return examMap({
        id: 'dvt2', label: 'TEN WEEKS \\u00b7 THE TERM',
        alt: 'The ten Devotion topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Self-control',
              a: 'The gap between feeling and acting, used on purpose',
              b: 'It is not feeling less. Proverbs 25:28 is about walls, not calm.' },
            { btn: '2', short: 'Gratitude',
              a: 'Four kinds; named and said out loud',
              b: '1 Thessalonians 5:18 says thanks *in* all circumstances, not *for* them.' },
            { btn: '3', short: 'Compassion',
              a: 'Notice, feel, move, cost',
              b: 'People stop between feel and move. Feeling sorry is not helping.' },
            { btn: '4', short: 'Patience',
              a: 'Joseph 13 years, Abraham 25, David to thirty',
              b: 'Patience is not doing nothing. Joseph ran a household and a prison.' },
            { btn: '5', short: 'Respect & kindness',
              a: 'Respect is owed; kindness is given',
              b: 'Philippians 2:3 is about counting others ahead, not about being quiet.' },
            { btn: '6', short: 'Forgiveness',
              a: 'Forgiveness, reconciliation, trust, consequences \\u2014 four things',
              b: '"Forgive and forget" asks for all four at once and gets none.' },
            { btn: '7', short: 'Unity in diversity',
              a: 'One body, many parts, different jobs',
              b: 'Unity is not sameness. A body of identical parts is not a body.' },
            { btn: '8', short: 'Friendship',
              a: 'Proverbs 27:6 and 13:20; David and Jonathan',
              b: 'A friend who never disagrees with you is not being a friend.' },
            { btn: '9', short: 'Peacemaker',
              a: 'Matthew 18: alone, then one or two, then the body',
              b: 'A peacemaker makes peace. Avoiding conflict is a different thing.' },
            { btn: '10', short: 'Speaking life',
              a: 'Bit, rudder, fire; true, needed, timely',
              b: 'An apology repairs the relationship. It does not unsay the sentence.' }
        ]
    });
}


/* Friendship is usually described by feeling. Proverbs describes it by
   behaviour, which is testable. */
function friendTests() {
    return listPicker({
        id: 'ft8', label: 'SIX TESTS, FROM THE TEXT', height: 272, y0: 60, dy: 26,
        alt: 'Six scriptural tests of friendship, each with the passage and what it means in practice',
        capA: 'The passage: ', capB: 'In practice: ',
        rows: [
            { btn: '1', short: 'Will they tell you the truth?',
              a: 'Proverbs 27:6 \u2014 "faithful are the wounds of a friend"',
              b: 'A friend who never disagrees with you is not doing the job.' },
            { btn: '2', short: 'Are they there when it is bad?',
              a: 'Proverbs 17:17 \u2014 "a friend loves at all times"',
              b: 'Easy to find in a good week. The bad week is the test.' },
            { btn: '3', short: 'Who are you becoming?',
              a: 'Proverbs 13:20 \u2014 walk with the wise and become wise',
              b: 'You end up like the people you spend hours with. No exceptions.' },
            { btn: '4', short: 'Do they cost you anything?',
              a: '1 Samuel 18:1-4 \u2014 Jonathan gives David his own robe and weapons',
              b: 'Jonathan was the king\u2019s son. He gave away his own claim.' },
            { btn: '5', short: 'Quality over number',
              a: 'Proverbs 18:24 \u2014 many companions, one who sticks closer',
              b: 'The verse itself makes the distinction. Count is not the measure.' },
            { btn: '6', short: 'The hard one',
              a: 'Are you that friend to anyone?',
              b: 'Every test above, read the other way round.' }
        ]
    });
}

/* ==========================================================================
   SCIENCE FIGURES — Term 2.
   Separation, forces, energy and machines are all processes, and a process
   drawn as a still picture is just a picture. Each of these moves: the jar
   settles, the vacuum pump runs, the lever arm gets longer and the numbers
   underneath change with it.
   ========================================================================== */

/* Four stages of one jar, so settling and decanting stop being two words and
   become two things that happen to the same muddy water. */
function settleStack() {
    const jar = `<path class="fig-jar" d="M150 60 h100 v150 a10 10 0 0 1 -10 10 h-80 a10 10 0 0 1 -10 -10 Z" fill="none"/>`;
    const mud = (y, h, cls = 'fig-liquid') => `<rect class="${cls}" x="152" y="${y}" width="96" height="${h}"/>`;
    return demoSwitch({
        id: 'ss2', height: 288, capY: 242,
        label: 'TAP THROUGH THE STAGES',
        alt: 'One jar of muddy water shown mixed, settled, decanted and filtered',
        demos: [
            { btn: 'Mixed', svg: `${jar}${mud(80, 130)}
                <text class="fig-cell" x="200" y="248" text-anchor="middle">&#160;</text>`,
              a: 'MIXED — stirred, and cloudy all the way up',
              b: 'The solid is spread through the water. Nothing has sorted itself yet.' },
            { btn: 'Settled', svg: `${jar}${mud(80, 104, 'fig-soft-fill')}${mud(184, 26)}`,
              a: 'SETTLED — left alone, and gravity did it',
              b: 'Sedimentation. You did nothing; the heavy particles went down on their own.' },
            { btn: 'Decanted', svg: `${jar}${mud(184, 26)}
                <path class="fig-flow" fill="none" d="M250 70 q34 14 34 44"/>`,
              a: 'DECANTED — the clear part poured off',
              b: 'Decantation. Cheap and quick, and it always leaves some behind.' },
            { btn: 'Filtered', svg: `${jar}
                <path class="fig-divide" fill="none" d="M152 150 h96"/>
                ${mud(150, 60, 'fig-soft-fill')}`,
              a: 'FILTERED — through paper, to catch the rest',
              b: 'The paper keeps anything bigger than its holes. This is what decanting misses.' }
        ]
    });
}

/* Five ways to pull a mixture apart, each named by the force doing the work
   rather than by the apparatus, because the force is the transferable part. */
function forceSort() {
    return listPicker({
        id: 'fs3', label: 'WHICH FORCE DOES THE WORK?', height: 272, y0: 60, dy: 26,
        alt: 'Five separation methods, each named by the force that does the separating',
        capA: 'The force: ', capB: 'Works because: ',
        rows: [
            { btn: '1', short: 'Sieving', a: 'None — it is geometry',
              b: 'Big stays, small passes. Nothing is pulled; the holes decide.' },
            { btn: '2', short: 'Winnowing', a: 'Moving air against weight',
              b: 'Heavy grain is barely pushed. Light chaff is carried away.' },
            { btn: '3', short: 'Magnetic', a: 'Magnetism, on iron only',
              b: 'Ignores everything that is not magnetic, however heavy or fine it is.' },
            { btn: '4', short: 'Centrifuging', a: 'Spin, standing in for gravity',
              b: 'Settling takes hours. Spinning makes the same sort happen in minutes.' },
            { btn: '5', short: 'Flotation', a: 'Buoyancy against density',
              b: 'Less dense than the liquid floats, denser sinks. Density, not weight.' },
            { btn: '?', short: 'Choosing one', a: 'Ask what the two parts differ in',
              b: 'Size, weight, magnetism or density. The difference picks the method.' }
        ]
    });
}

/* Evaporation and distillation do the same first half and differ entirely in
   what they keep, which is the only thing the exam ever asks. */
function distillLab() {
    const flask = `<path class="fig-jar" fill="none" d="M176 70 h14 v30 a44 44 0 1 1 -28 0 v-30 Z"/>`;
    const heat = `<path class="fig-force" fill="none" d="M166 206 q8 -12 0 -22 M176 208 q8 -12 0 -22 M186 206 q8 -12 0 -22"/>`;
    return demoSwitch({
        id: 'dl4', height: 280, capY: 236,
        label: 'WHICH HALF DO YOU WANT?',
        alt: 'Evaporation losing the solvent to the air beside distillation collecting it in a beaker',
        demos: [
            { btn: 'Evaporation', svg: `${flask}${heat}
                <path class="fig-breath" fill="none" d="M183 66 q-10 -18 2 -32 M183 66 q12 -16 0 -34"/>
                <rect class="fig-grain" x="166" y="176" width="34" height="8" rx="3"/>`,
              a: 'EVAPORATION — you keep the solid',
              b: 'The solvent leaves as vapour and is gone. Salt stays in the pan; the water is lost.' },
            { btn: 'Distillation', svg: `${flask}${heat}
                <path class="fig-flow" fill="none" d="M190 76 q50 0 62 44 q6 26 -10 40"/>
                <path class="fig-jar" fill="none" d="M228 170 h44 v38 h-44 Z"/>
                <rect class="fig-liquid" x="230" y="192" width="40" height="15"/>`,
              a: 'DISTILLATION — you keep both',
              b: 'The same vapour is cooled back to liquid and collected. Nothing is thrown away.' }
        ]
    });
}

/* Friction as a number you can press, with the stopping distance it actually
   produces. The distances are worked from v²/2μg at 60 km/h and are real. */
function frictionLab() {
    const dist = v => Math.round(14.2 / v);
    const note = {
        '0.1': 'Ice. Almost nothing to grip. Steering and braking both stop working.',
        '0.4': 'Wet road. Half the grip of dry, so twice the distance. This is rain, not ice.',
        '0.8': 'Dry road, good tyres. This is the number everything else is compared to.',
        '1.1': 'Soft racing rubber, warm. More grip than the road is usually asked to give.'
    };
    return ruleLab({
        id: 'fl5', label: 'PRESS A SURFACE',
        alt: 'A lab showing how the grip of different surfaces changes the distance needed to stop from 60 km/h',
        input: { name: 'Grip', values: [0.1, 0.4, 0.8, 1.1],
                 label: v => ({ 0.1: 'Ice', 0.4: 'Wet road', 0.8: 'Dry road', 1.1: 'Race tyre' }[v]) },
        outputs: [
            { name: 'Grip', f: v => v, fmt: o => o.toFixed(2) },
            { name: 'Stopping from 60', f: v => dist(v), fmt: o => `${o} m` }
        ],
        rule: v => note[String(v)]
    });
}

/* The hammer and the feather. Drawn rather than described because the claim
   sounds false until you watch it: Apollo 15, 1971, and they landed together. */
function fallPair() {
    const scene = (sepL, sepR) => `
      <text class="fig-cell" x="128" y="56" text-anchor="middle">feather</text>
      <text class="fig-cell" x="272" y="56" text-anchor="middle">hammer</text>
      <path class="fig-divide" fill="none" d="M40 212 h320"/>
      <circle class="fig-point-h" cx="128" cy="${sepL}" r="8"/>
      <rect class="fig-grain" x="262" y="${sepR - 8}" width="20" height="16" rx="3"/>`;
    return demoSwitch({
        id: 'fp6', height: 282, capY: 240,
        label: 'DROP THEM TOGETHER',
        alt: 'A feather and a hammer dropped together, falling apart in air and together in a vacuum',
        demos: [
            { btn: 'In air', svg: scene(104, 196),
              a: 'IN AIR — the hammer is already down',
              b: 'Air resistance acts on the feather far more, because it has huge area for its mass.' },
            { btn: 'No air', svg: scene(196, 196),
              a: 'IN A VACUUM — they land together',
              b: 'Gravity pulls both the same. Apollo 15 did this on the Moon in 1971 and filmed it.' }
        ]
    });
}

/* Sound needs something to travel through. Light does not. One jar, one pump,
   and the two behave completely differently. */
function waveNeeds() {
    const jar = `<path class="fig-jar" fill="none" d="M140 64 h120 v146 h-120 Z"/>
                 <rect class="fig-grain" x="178" y="118" width="44" height="38" rx="5"/>
                 <path class="fig-flow" fill="none" d="M260 190 h40"/>`;
    const ring = n => Array.from({ length: n }, (_, i) =>
        `<circle class="fig-point" cx="200" cy="137" r="${30 + i * 16}" fill="none"/>`).join('');
    const beam = `<path class="fig-track" fill="none" d="M60 137 h118 M222 137 h118"/>`;
    return demoSwitch({
        id: 'wn8', height: 282, capY: 238,
        label: 'PUMP THE AIR OUT',
        alt: 'A bell ringing in a jar, with sound waves present in air and absent in a vacuum while light passes either way',
        demos: [
            { btn: 'With air', svg: `${jar}${ring(3)}${beam}`,
              a: 'WITH AIR — you hear it and you see it',
              b: 'Sound is a squeeze passed from particle to particle. Air gives it something to squeeze.' },
            { btn: 'Air pumped out', svg: `${jar}${beam}`,
              a: 'VACUUM — you still see it. You hear nothing.',
              b: 'No particles, no squeeze. Light is not a squeeze, so it crosses empty space unbothered.' }
        ]
    });
}

/* The lever, as a trade rather than as a magic force multiplier. The second
   bar is the one that matters: nothing is gained, it is only rearranged. */
function leverLab() {
    return ruleLab({
        id: 'll10', label: 'MAKE THE ARM LONGER',
        alt: 'A lab showing that lengthening a lever arm lowers the effort needed and raises the distance moved by the same factor',
        input: { name: 'Effort arm', unit: '×', values: [1, 2, 3, 4] },
        outputs: [
            { name: 'Effort needed', f: v => Math.round(100 / v), fmt: o => `${o} N` },
            { name: 'Distance you move', f: v => v * 10, fmt: o => `${o} cm` }
        ],
        rule: v => v === 1
            ? 'Arms equal: 100 N to lift 100 N, and your end moves the same 10 cm. No help at all.'
            : `Arm ${v}× longer: ${Math.round(100 / v)} N instead of 100 N — but your end travels ${v * 10} cm to lift the load 10 cm.`
    });
}

/* The term's review board. */
function sciT2Map() {
    return examMap({
        id: 'sct2', label: 'TEN WEEKS · THE TERM',
        alt: 'The ten Science topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Suspensions & colloids',
              a: 'Solution, colloid, suspension by particle size',
              b: 'A colloid never settles. A suspension does, given time.' },
            { btn: '2', short: 'Gravity methods',
              a: 'Sedimentation, decantation, filtration',
              b: 'Decanting always leaves some behind. That is why filtering follows it.' },
            { btn: '3', short: 'Adding a force',
              a: 'Sieving, winnowing, magnetism, centrifuging',
              b: 'Winnowing sorts by weight, sieving by size. Not the same thing.' },
            { btn: '4', short: 'Separating solutions',
              a: 'Evaporation keeps the solid; distillation keeps both',
              b: 'Dissolved is not gone. Evaporation is the proof.' },
            { btn: '5', short: 'Gravity & friction',
              a: 'Friction depends on the surfaces, not the speed',
              b: 'Starting friction is higher than sliding friction.' },
            { btn: '6', short: 'Living with forces',
              a: 'Air resistance, grip, downforce',
              b: 'In a vacuum a feather and a hammer land together.' },
            { btn: '7', short: 'Mechanical energy',
              a: 'Potential and kinetic, and the swap between them',
              b: 'Kinetic energy goes with the square of speed, not with speed.' },
            { btn: '8', short: 'Sound, heat, light',
              a: 'What each one needs in order to travel',
              b: 'Sound needs a medium. Light does not. Space is silent.' },
            { btn: '9', short: 'Electricity',
              a: 'Energy transformations in a circuit',
              b: 'Heat is produced whether you wanted it or not.' },
            { btn: '10', short: 'Simple machines',
              a: 'Lever, pulley, ramp, wheel, wedge, screw',
              b: 'A machine trades force for distance. It never gives you work for free.' }
        ]
    });
}


/* Percentage off, as the two numbers that actually matter at a counter: what
   leaves your hand and what stays in it. */
function discountLab() {
    const P = 1200;
    return ruleLab({
        id: 'dc2', label: 'PRESS A DISCOUNT',
        alt: 'A lab showing what you pay and what you save on a 1200 peso item at four different discounts',
        input: { name: 'Discount', unit: '%', values: [10, 20, 25, 50] },
        sharedScale: true,
        outputs: [
            { name: 'You pay', f: v => Math.round(P * (1 - v / 100)), fmt: o => `\u20b1${o}` },
            { name: 'You save', f: v => Math.round(P * v / 100), fmt: o => `\u20b1${o}` }
        ],
        rule: v => `${v}% off \u20b11,200 is \u20b1${Math.round(P * v / 100)} off. The two bars always add up to the same total.`
    });
}

/* One amount of water, four names for it. The conversion is only ever a
   decimal point moving, and seeing all four move together is the point. */
function volumeUnitLab() {
    const name = { 250: 'a glass', 1000: 'a bottle', 20000: 'a water drum', 1000000: 'a small pool' };
    return ruleLab({
        id: 'vu8', label: 'PRESS AN AMOUNT',
        alt: 'A lab showing the same volume of water written in millilitres, cubic centimetres, litres and cubic metres',
        input: { name: 'Amount', values: [250, 1000, 20000, 1000000], label: v => name[v] },
        outputs: [
            { name: 'In mL', f: v => v, fmt: o => `${o.toLocaleString()} mL` },
            { name: 'In cm\u00b3', f: v => v, fmt: o => `${o.toLocaleString()} cm\u00b3` },
            { name: 'In litres', f: v => v / 1000, fmt: o => `${o.toLocaleString()} L` },
            { name: 'In m\u00b3', f: v => v / 1e6, fmt: o => `${o} m\u00b3` }
        ],
        rule: v => `1 mL and 1 cm\u00b3 are the same size, always. From there it is only the decimal point moving.`
    });
}

/* ==========================================================================
   ENGLISH FIGURES — Term 2.
   Grammar is the easiest subject to turn into a wall of rules, and the
   hardest to make anything happen on screen. Every one of these makes the
   learner do the sorting rather than read the sorted list.
   ========================================================================== */

/* The four spelling patterns behind -ed, which is the whole of the regular
   past tense and is normally given as a paragraph nobody reads. */
function pastSpelling() {
    return listPicker({
        id: 'ps1', label: 'TAP A PATTERN', height: 272, y0: 60, dy: 26,
        alt: 'The four spelling patterns for forming the regular past tense, each with examples',
        capA: 'Rule: ', capB: 'Examples: ',
        rows: [
            { btn: '1', short: 'Most verbs', a: 'Just add -ed',
              b: 'train \\u2192 trained. kick \\u2192 kicked. wrap \\u2192 wrapped? No \\u2014 see rule 3.' },
            { btn: '2', short: 'Already ends in e', a: 'Add -d only',
              b: 'race \\u2192 raced. score \\u2192 scored. You never write "racced".' },
            { btn: '3', short: 'Short vowel, one consonant', a: 'Double the consonant, then -ed',
              b: 'wrap \\u2192 wrapped. stop \\u2192 stopped. jab \\u2192 jabbed.' },
            { btn: '4', short: 'Consonant then y', a: 'The y becomes i, then -ed',
              b: 'carry \\u2192 carried. try \\u2192 tried. But play \\u2192 played: that is a vowel before the y.' },
            { btn: '!', short: 'The irregular ones', a: 'No rule at all',
              b: 'catch \\u2192 caught. build \\u2192 built. These are learned by meeting them.' },
            { btn: '?', short: 'How to tell', a: 'Try adding -ed and listen',
              b: 'If it sounds wrong, it is probably irregular. "Catched" sounds wrong because it is.' }
        ]
    });
}

/* A phrasal verb is a verb plus a particle that rewrites it. Same verb, five
   particles, five unrelated meanings — which is exactly why they cannot be
   worked out and have to be met. */
function phrasalLab() {
    return listPicker({
        id: 'pl3', label: 'ONE VERB \\u00b7 FIVE PARTICLES', height: 272, y0: 60, dy: 26,
        alt: 'The verb take with five different particles, each producing an unrelated meaning',
        capA: 'Means: ', capB: 'In a sentence: ',
        rows: [
            { btn: '1', short: 'take off', a: 'Remove \\u2014 or leave the ground',
              b: 'He took off his gloves. The plane took off late.' },
            { btn: '2', short: 'take apart', a: 'Dismantle into pieces',
              b: 'I took the fan apart on the kitchen floor.' },
            { btn: '3', short: 'take up', a: 'Start doing something new',
              b: 'She took up boxing in January.' },
            { btn: '4', short: 'take in', a: 'Absorb, or be deceived by',
              b: 'He took in the whole room. Do not be taken in by that.' },
            { btn: '5', short: 'take over', a: 'Assume control',
              b: 'The second driver took over at the pit stop.' },
            { btn: '?', short: 'Where the object goes', a: 'A pronoun sits in the middle',
              b: 'Took it apart \\u2014 never "took apart it". The noun can go either side.' }
        ]
    });
}

/* Three futures, which English speakers choose between without noticing.
   The choice encodes when the decision was made, and that is the lesson. */
function futureChoice() {
    const clock = (x, lbl) => `
      <circle class="fig-wheel" cx="${x}" cy="118" r="34"/>
      <text class="fig-cell" x="${x}" y="176" text-anchor="middle">${lbl}</text>`;
    const mark = x => `<circle class="fig-point-h" cx="${x}" cy="118" r="9"/>`;
    const line = `<path class="fig-chain" d="M40 118 H360"/>`;
    return demoSwitch({
        id: 'fc4', height: 268, capY: 222,
        label: 'WHEN WAS IT DECIDED?',
        alt: 'Three future forms placed by when the decision behind each one was made',
        demos: [
            { btn: 'will', svg: `${line}${clock(110,'decided')}${clock(250,'happens')}${mark(250)}`,
              a: 'WILL \\u2014 decided right now, as you speak',
              b: '"The bag is heavy." "I will carry it." Nobody planned that a second earlier.' },
            { btn: 'going to', svg: `${line}${clock(110,'decided')}${clock(250,'happens')}${mark(110)}`,
              a: 'GOING TO \\u2014 decided earlier, already a plan',
              b: '"I am going to replace the capacitor." You worked that out before now.' },
            { btn: 'am -ing', svg: `${line}${clock(110,'decided')}${clock(250,'happens')}${mark(110)}${mark(250)}`,
              a: 'PRESENT CONTINUOUS \\u2014 planned AND arranged',
              b: '"I am fighting on Saturday." The decision is made and the date is fixed.' }
        ]
    });
}

/* Three tenses on one line, with a single verb moving across it, because the
   commonest fault is not choosing the wrong tense but changing tense inside
   one sentence without meaning to. */
function tenseLine() {
    const axis = `<path class="fig-chain" d="M40 132 H360"/>
      <line class="fig-rule-strong" x1="200" y1="100" x2="200" y2="164"/>
      <text class="fig-step" x="200" y="92" text-anchor="middle">NOW</text>
      <text class="fig-note-dim" x="46" y="184">before</text>
      <text class="fig-note-dim" x="354" y="184" text-anchor="end">after</text>`;
    const span = (x, w) => `<rect class="fig-bar" x="${x}" y="124" width="${w}" height="16" rx="8"/>`;
    const verb = t => `<text class="fig-expr" x="200" y="60" text-anchor="middle">${t}</text>`;
    return demoSwitch({
        id: 'tl5', height: 258, capY: 212,
        label: 'ONE VERB, THREE PLACES',
        alt: 'The verb train shown in past, present and future on a timeline marked now',
        demos: [
            { btn: 'trained', svg: `${verb('he trained')}${axis}${span(56, 110)}`,
              a: 'PAST \\u2014 finished before now',
              b: 'He trained yesterday. It is over; nothing about it is still happening.' },
            { btn: 'is training', svg: `${verb('he is training')}${axis}${span(142, 118)}`,
              a: 'PRESENT CONTINUOUS \\u2014 happening across now',
              b: 'He is training. Started, not finished, and you could walk in and see it.' },
            { btn: 'will train', svg: `${verb('he will train')}${axis}${span(234, 110)}`,
              a: 'FUTURE \\u2014 has not started',
              b: 'He will train tomorrow. The commonest fault is sliding between these inside one sentence.' }
        ]
    });
}

/* Prefix and suffix do two different jobs, and saying so once is worth more
   than a list of thirty affixes. */
function affixJobs() {
    return listPicker({
        id: 'aj6', label: 'FRONT CHANGES MEANING \\u00b7 BACK CHANGES JOB', height: 272, y0: 60, dy: 26,
        alt: 'Six affixes split into prefixes that change meaning and suffixes that change word class',
        capA: 'Does: ', capB: 'Examples: ',
        rows: [
            { btn: '1', short: 'un- , dis- , in-', a: 'PREFIX \\u2014 reverses the meaning',
              b: 'unbreakable, disconnect, incomplete. Still the same kind of word.' },
            { btn: '2', short: 'over- , under-', a: 'PREFIX \\u2014 too much, or too little',
              b: 'overtrain, overheat, underfed. The amount is what changed.' },
            { btn: '3', short: 're- , pre-', a: 'PREFIX \\u2014 again, or before',
              b: 'rebuild, rematch, preheat, preview.' },
            { btn: '4', short: '-less , -ful', a: 'SUFFIX \\u2014 makes an adjective',
              b: 'fearless, useless, powerful. Describes a thing now.' },
            { btn: '5', short: '-er , -or', a: 'SUFFIX \\u2014 makes a person or thing that does it',
              b: 'boxer, driver, generator. A doer, not an action.' },
            { btn: '6', short: '-ly', a: 'SUFFIX \\u2014 makes an adverb',
              b: 'quickly, carefully. It now points at a verb instead of a noun.' }
        ]
    });
}

/* Comparison as counting. One thing is a description, two is a comparison,
   three or more has a winner — and the form has to follow the count. */
function degreeBars() {
    const track = y => `<rect class="fig-bar-track" x="150" y="${y - 11}" width="212" height="16" rx="8"/>`;
    const bar = (y, w) => `<rect class="fig-bar" x="150" y="${y - 11}" width="${w}" height="16" rx="8"/>`;
    const name = (y, t) => `<text class="fig-cell" x="20" y="${y + 5}">${t}</text>`;
    const tag = t => `<text class="fig-label" x="200" y="46" text-anchor="middle">${t}</text>`;
    return demoSwitch({
        id: 'db7', height: 258, capY: 212,
        label: 'HOW MANY ARE YOU COMPARING?',
        alt: 'One, two and three bars showing when to use the positive, comparative and superlative',
        demos: [
            { btn: 'fast', svg: `${tag('ONE')}${name(100,'Vios')}${track(100)}${bar(100,96)}`,
              a: 'POSITIVE \\u2014 nothing to compare it with',
              b: 'The Vios is fast. A plain description, and no second thing in the sentence.' },
            { btn: 'faster', svg: `${tag('TWO')}${name(100,'Vios')}${track(100)}${bar(100,96)}
                 ${name(150,'Civic')}${track(150)}${bar(150,148)}`,
              a: 'COMPARATIVE \\u2014 two things, one ahead',
              b: 'The Civic is faster than the Vios. Signals: -er, or "more" for long words.' },
            { btn: 'fastest', svg: `${tag('THREE OR MORE')}${name(100,'Vios')}${track(100)}${bar(100,96)}
                 ${name(150,'Civic')}${track(150)}${bar(150,148)}
                 ${name(200,'GT-R')}${track(200)}${bar(200,206)}`,
              a: 'SUPERLATIVE \\u2014 nothing beats it',
              b: 'The GT-R is the fastest. Signals: -est, or "most". Never both: "more faster" is wrong.' }
        ]
    });
}

/* Four questions, four kinds of adverb. The question is the test: if none of
   them fits, the word is not an adverb. */
function adverbKinds() {
    return listPicker({
        id: 'ak9', label: 'WHICH QUESTION DOES IT ANSWER?', height: 272, y0: 60, dy: 26,
        alt: 'Five kinds of adverb, each with the question it answers and an example',
        capA: 'Answers: ', capB: 'Example: ',
        rows: [
            { btn: '1', short: 'Manner', a: 'HOW was it done?',
              b: 'He unscrewed it carefully. Most, but not all, end in -ly.' },
            { btn: '2', short: 'Time', a: 'WHEN did it happen?',
              b: 'She trains early. We leave tomorrow.' },
            { btn: '3', short: 'Place', a: 'WHERE did it happen?',
              b: 'He waited outside. Put it there.' },
            { btn: '4', short: 'Frequency', a: 'HOW OFTEN?',
              b: 'He never skips. She always warms up first.' },
            { btn: '5', short: 'Degree', a: 'HOW MUCH?',
              b: 'A very fast lap. He almost finished. These point at adjectives too.' },
            { btn: '?', short: 'The test', a: 'If no question fits, it is not an adverb',
              b: '"Fast car" answers "which car" \\u2014 that is an adjective, same word.' }
        ]
    });
}

/* Adjective or adverb is one decision, made over and over, so he makes it
   rather than reading about it. A wrong pick is answered with what the
   sentence would then mean. */
function pointsAtLab() {
    return orderLab({
        id: 'pa10', height: 212,
        label: 'WHAT IS THE WORD POINTING AT?',
        alt: 'An interactive where the learner decides whether a modifier points at a noun or a verb',
        steps: [
            { expr: 'He drives ___ . (quick / quickly)',
              ask: 'The word points at "drives". Which form?',
              choices: [
                { btn: 'quick', ok: false,
                  gives: '"He drives quick" points an adjective at a verb.',
                  why: 'Adjectives point at nouns. "Drives" is an action, so it needs the -ly form.' },
                { btn: 'quickly', ok: true } ] },
            { expr: 'He is a ___ driver. (quick / quickly)',
              ask: 'Now it points at "driver". Which form?',
              choices: [
                { btn: 'quickly', ok: false,
                  gives: '"A quickly driver" points an adverb at a noun.',
                  why: '"Driver" is a person, a noun. Nouns take adjectives.' },
                { btn: 'quick', ok: true } ] },
            { expr: 'She fights ___ . (good / well)',
              ask: 'Points at "fights". Which form?',
              choices: [
                { btn: 'good', ok: false,
                  gives: '"She fights good" is the commonest version of this mistake.',
                  why: '"Well" is the adverb of "good". The irregular pair catches everyone.' },
                { btn: 'well', ok: true } ] },
            { expr: 'Same word, two jobs. Ask what it points at.',
              done: 'Pointing at a noun: adjective. Pointing at a verb: adverb. The word alone never tells you.' }
        ]
    });
}

/* ==========================================================================
   SOCIAL STUDIES FIGURES — Term 2.
   History taught as a list of dates is the fastest thing in this app to
   forget. A timeline he taps gives each date a place relative to the others,
   which is the part that actually has to be learned; the pickers do the same
   job for things that happened at once rather than in sequence.
   ========================================================================== */

function commonwealthRoad() {
    return timeline({
        id: 'cr1', label: 'A TEN-YEAR COUNTDOWN',
        alt: 'A timeline from the Tydings-McDuffie Act in 1934 to the Japanese invasion in 1941',
        stops: [
            { year: '1934', tag: 'the promise',
              head: 'Tydings-McDuffie Act',
              body: 'Independence promised after a ten-year transition. The clock starts.' },
            { year: '1935', tag: 'self-rule',
              head: 'The Commonwealth begins',
              body: 'Quezon president. Self-rule in most things \\u2014 but not defence or foreign policy.' },
            { year: '1935', tag: 'an army',
              head: 'National Defense Act',
              body: 'Conscription and a reserve army, because self-rule means defending yourself.' },
            { year: '1937', tag: 'a language',
              head: 'A national language chosen',
              body: 'Based on Tagalog. A country being assembled on purpose, piece by piece.' },
            { year: '1941', tag: 'interrupted',
              head: 'December: the invasion',
              body: 'Four years short of the target. The countdown stops here.' }
        ]
    });
}

function commonwealthWork() {
    return listPicker({
        id: 'cw2', label: 'WHAT IT COULD AND COULD NOT DO', height: 272, y0: 60, dy: 26,
        alt: 'Six powers of the Commonwealth government, three held and three withheld',
        capA: 'Status: ', capB: 'Why it mattered: ',
        rows: [
            { btn: '1', short: 'Its own president', a: 'HELD \\u2014 elected by Filipinos',
              b: 'Quezon, 1935. The first time the head of government was chosen here.' },
            { btn: '2', short: 'Its own laws', a: 'HELD \\u2014 a National Assembly',
              b: 'Land reform, education and labour laws were all passed in this period.' },
            { btn: '3', short: 'Its own army', a: 'HELD \\u2014 the National Defense Act',
              b: 'A reserve force built from scratch, and it was not ready in 1941.' },
            { btn: '4', short: 'Foreign policy', a: 'WITHHELD \\u2014 Washington kept it',
              b: 'The country could not make a treaty or an alliance of its own.' },
            { btn: '5', short: 'Defence command', a: 'WITHHELD \\u2014 ultimately American',
              b: 'Which is why the war arrived here as somebody else\\u2019s decision.' },
            { btn: '6', short: 'Currency and trade', a: 'WITHHELD \\u2014 tied to the US',
              b: 'The shape of the economy was set elsewhere, and outlasted 1946.' }
        ]
    });
}

function occupationLine() {
    return timeline({
        id: 'ol3', label: 'THREE YEARS',
        alt: 'A timeline of the Japanese occupation from December 1941 to February 1945',
        stops: [
            { year: 'Dec 1941', tag: 'invasion',
              head: 'The attack begins',
              body: 'Hours after Pearl Harbor. The air force is caught on the ground.' },
            { year: 'Apr 1942', tag: 'Bataan',
              head: 'Bataan falls',
              body: 'Then the march. Corregidor holds out until May.' },
            { year: 'Oct 1943', tag: 'Second Republic',
              head: 'The Second Republic',
              body: 'Jose P. Laurel president, under Japanese authority. Still argued about.' },
            { year: 'Oct 1944', tag: 'Leyte',
              head: 'The landing at Leyte',
              body: 'Liberation begins in the south and works north.' },
            { year: 'Feb 1945', tag: 'Manila',
              head: 'Manila is destroyed',
              body: 'One of the most destructive urban battles of the whole war.' }
        ]
    });
}

function resistKinds() {
    return listPicker({
        id: 'rk4', label: 'FOUR THINGS PEOPLE DID', height: 272, y0: 60, dy: 26,
        alt: 'Four responses to the occupation, from armed resistance to collaboration',
        capA: 'Who: ', capB: 'What it meant: ',
        rows: [
            { btn: '1', short: 'USAFFE guerrillas', a: 'Soldiers who never surrendered',
              b: 'Held ground, mapped positions and radioed them out for three years.' },
            { btn: '2', short: 'Hukbalahap', a: 'A peasant army in Central Luzon',
              b: 'Fought the occupation \\u2014 and carried land grievances that outlasted it.' },
            { btn: '3', short: 'Ordinary people', a: 'The great majority',
              b: 'Hid, queued, grew food and tried not to be noticed. Not a lesser choice.' },
            { btn: '4', short: 'Makapili', a: 'Those who helped the occupiers',
              b: 'Some from belief, some from fear. The reckoning after 1945 was bitter.' },
            { btn: '5', short: 'The money', a: 'A replacement currency',
              b: 'Nicknamed Mickey Mouse money. It lost value faster than it could be spent.' },
            { btn: '6', short: 'The hard part', a: 'Most people were not given a clean choice',
              b: 'That is what the week is about, and what a list of sides hides.' }
        ]
    });
}

function conditionsPicker() {
    return listPicker({
        id: 'cp5', label: 'INDEPENDENCE, WITH STRINGS', height: 272, y0: 60, dy: 26,
        alt: 'The conditions attached to Philippine independence in 1946 and what each one allowed',
        capA: 'The condition: ', capB: 'What it did: ',
        rows: [
            { btn: '1', short: '4 July 1946', a: 'The Third Republic begins',
              b: 'Sovereignty is real. Everything below is attached to it.' },
            { btn: '2', short: 'Bell Trade Act', a: 'Pegged the peso to the dollar',
              b: 'And set the terms of trade. The economy\\u2019s shape was decided outside it.' },
            { btn: '3', short: 'Parity rights', a: 'Equal American rights to Philippine resources',
              b: 'It needed a constitutional amendment to pass, which tells you how large it was.' },
            { btn: '4', short: 'Military Bases Agreement', a: '1947, originally for 99 years',
              b: 'Later shortened. The bases stayed a live argument into the 1990s.' },
            { btn: '5', short: 'War damage payments', a: 'Reconstruction money',
              b: 'Conditional on accepting the above. That is why they were accepted.' },
            { btn: '6', short: 'The question', a: 'Is sovereignty with conditions still sovereignty?',
              b: 'The honest answer is that it is partial, and that later governments spent decades on it.' }
        ]
    });
}

function landQuestion() {
    return listPicker({
        id: 'lq6', label: 'WHY A REBELLION STARTED', height: 272, y0: 60, dy: 26,
        alt: 'The chain from tenancy to the Huk rebellion and the attempt to settle it',
        capA: 'Step: ', capB: 'Detail: ',
        rows: [
            { btn: '1', short: 'Tenancy', a: 'Most farmers did not own the land',
              b: 'A share of every harvest went to a landlord many of them never met.' },
            { btn: '2', short: 'Debt', a: 'A bad season meant borrowing',
              b: 'And the debt passed to the next generation with the tenancy.' },
            { btn: '3', short: 'The Huks organised', a: 'Already armed from the occupation',
              b: 'The same men, the same province, and now no occupier to fight.' },
            { btn: '4', short: 'Exclusion', a: 'Elected Huk representatives barred from Congress',
              b: '1946. The legal route closed, and the armed one did not.' },
            { btn: '5', short: 'Magsaysay', a: 'Settlement rather than only force',
              b: 'Surrender terms, resettlement land, and a government that answered letters.' },
            { btn: '6', short: 'What was left', a: 'The land problem itself',
              b: 'The rebellion ended. Tenancy did not, and it returns in 1963 and after.' }
        ]
    });
}

function presidentsPicker() {
    return listPicker({
        id: 'pp8', label: 'SIX PRESIDENTS, ONE FACT EACH', height: 320, y0: 60, dy: 26,
        alt: 'Six post-war presidents with the single fact most often asked about each',
        capA: 'Term: ', capB: 'Known for: ',
        rows: [
            { btn: '1', short: 'Roxas', a: '1946\\u20131948, the first of the Third Republic',
              b: 'Accepted the parity amendment and the trade terms. Died in office.' },
            { btn: '2', short: 'Quirino', a: '1948\\u20131953',
              b: 'Rebuilding, and an administration dogged by corruption allegations.' },
            { btn: '3', short: 'Magsaysay', a: '1953\\u20131957',
              b: 'Settled the Huk rebellion. Died in a plane crash in 1957.' },
            { btn: '4', short: 'Garcia', a: '1957\\u20131961',
              b: 'Filipino First Policy \\u2014 priority for Filipino businesses.' },
            { btn: '5', short: 'Macapagal', a: '1961\\u20131965',
              b: 'Moved Independence Day to 12 June, in 1962. Land reform code, 1963.' },
            { btn: '6', short: 'Marcos', a: '1965\\u20131986',
              b: 'Elected on infrastructure, re-elected 1969, martial law 1972.' },
            { btn: '?', short: 'The thread', a: 'The land question runs through all six',
              b: 'Every one of them met it, and none of them finished it.' }
        ]
    });
}

function martialLawLine() {
    return timeline({
        id: 'ml10', label: 'FOURTEEN YEARS',
        alt: 'A timeline from the declaration of martial law in 1972 to the EDSA revolution in 1986',
        stops: [
            { year: '1972', tag: 'declared',
              head: 'Proclamation 1081',
              body: 'Signed 21 September. Congress closed, the press shut, opposition arrested.' },
            { year: '1973', tag: 'new charter',
              head: 'A new constitution',
              body: 'Ratified by show of hands in citizens\\u2019 assemblies rather than by secret ballot.' },
            { year: '1981', tag: 'lifted',
              head: 'Martial law formally lifted',
              body: 'The powers were kept. Very little changed in practice.' },
            { year: '1983', tag: 'assassination',
              head: 'Aquino is killed at the airport',
              body: 'On his return. The protests after it do not stop.' },
            { year: '1986', tag: 'EDSA',
              head: 'People Power',
              body: 'A snap election widely seen as rigged, then four days of demonstrations.' }
        ]
    });
}

function ssT2Map() {
    return examMap({
        id: 'sst2', label: 'TEN WEEKS \\u00b7 THE TERM',
        alt: 'The ten Social Studies topics of the term, each with what to know and the usual trap',
        rows: [
            { btn: '1', short: 'Preparing',
              a: 'Tydings-McDuffie 1934, Commonwealth 1935',
              b: 'Ten years, not five. The countdown is interrupted, not cancelled.' },
            { btn: '2', short: 'Building the state',
              a: 'What the Commonwealth held and what Washington kept',
              b: 'Foreign policy and defence were never Filipino in this period.' },
            { btn: '3', short: 'Occupation',
              a: 'Bataan April 1942, Second Republic 1943',
              b: 'The 1943 republic governed under Japanese authority.' },
            { btn: '4', short: 'Resistance',
              a: 'Guerrillas, Huks, Makapili, and everyone else',
              b: 'Most people were never offered a clean choice.' },
            { btn: '5', short: 'Independence',
              a: '4 July 1946, with parity, trade terms and bases',
              b: 'Parity needed a constitutional amendment to pass.' },
            { btn: '6', short: 'The land question',
              a: 'Tenancy, the Huks, and Magsaysay\\u2019s settlement',
              b: 'The rebellion ended. Tenancy did not.' },
            { btn: '7', short: 'A sovereign country',
              a: 'Two independence days, and why the date moved',
              b: '1898 declared, 1946 granted. Macapagal chose the declaration.' },
            { btn: '8', short: 'Roxas to Magsaysay',
              a: 'Rebuilding, corruption, the Huk settlement',
              b: 'Magsaysay settled the Huks; Quirino did not.' },
            { btn: '9', short: 'Garcia to Marcos',
              a: 'Filipino First, 12 June, the 1969 re-election',
              b: 'Infrastructure and debt are both the record, not one or the other.' },
            { btn: '10', short: 'Martial law',
              a: 'Proclamation 1081; the documented figures; EDSA',
              b: 'The human rights record is documented, not a matter of opinion.' }
        ]
    });
}


/* The supermarket question: which packet is actually cheaper. The sizes and
   prices are chosen so the bigger box is the worse deal, because that is the
   case the rule exists for. */
function unitRateLab() {
    const packs = { 200: 48, 500: 135, 900: 261 };
    return ruleLab({
        id: 'ur6', label: 'PRESS A PACK SIZE',
        alt: 'A lab comparing three pack sizes by price per hundred grams',
        input: { name: 'Pack', unit: ' g', values: [200, 500, 900] },
        outputs: [
            { name: 'Price', f: v => packs[v], fmt: o => `\u20b1${o}` },
            { name: 'Per 100 g', f: v => +(packs[v] / v * 100).toFixed(2), fmt: o => `\u20b1${o}` }
        ],
        rule: v => v === 500
            ? 'The 500 g is the best value here, at \u20b127.00 per 100 g.'
            : `The ${v} g works out at \u20b1${(packs[v] / v * 100).toFixed(2)} per 100 g. Bigger is not automatically cheaper.`
    });
}


/* The alphabet question, which is the whole of week one: twenty letters
   became twenty-eight, and the eight that were added have a specific job. */
function alpabetoLab() {
    return listPicker({
        id: 'al1', label: 'DALAWAMPU, NAGING DALAWAMPU\u2019T WALO', height: 272, y0: 60, dy: 26,
        alt: 'The twenty-letter abakada beside the twenty-eight-letter alphabet and the job of the eight added letters',
        capA: 'Ano ito: ', capB: 'Halimbawa: ',
        rows: [
            { btn: '1', short: 'Abakada \u2014 dalawampung titik', a: 'Ang lumang palatitikan',
              b: 'A B K D E G H I L M N NG O P R S T U W Y. Walang C, F, J, \u00d1, Q, V, X, Z.' },
            { btn: '2', short: 'Alpabeto \u2014 dalawampu\u2019t walo', a: 'Ang kasalukuyang palatitikan ng KWF',
              b: 'Idinagdag ang walong titik para sa mga salitang hiram at pantangi.' },
            { btn: '3', short: 'C, Q, X', a: 'Para sa hiram at pangalan',
              b: 'Cebu, Quezon, Xavier. Hindi ito isinusulat bilang Sebu o Kezon.' },
            { btn: '4', short: 'F, V, Z', a: 'May tunog na wala sa abakada',
              b: 'Ifugao, Ivatan, Zambales. Mga katutubong wika rin ang pinagmulan.' },
            { btn: '5', short: '\u00d1 at J', a: 'Mula sa Espanyol',
              b: 'Ni\u00f1o, Ca\u00f1ete, Jose. Nananatili ang anyo ng pangalan.' },
            { btn: '?', short: 'Ang patakaran', a: 'Kailan ginagamit ang hiram na titik?',
              b: 'Kapag pantangi o teknikal ang salita. Kung hindi, isinasa-Filipino ang baybay.' }
        ]
    });
}


/* Trust and obedience are treated as one word and are not. The last two rows
   are the partial-obedience case, which is the one the passage is about. */
function obeyParts() {
    return listPicker({
        id: 'ob2', label: 'INWARD AND OUTWARD', height: 272, y0: 60, dy: 26,
        alt: 'Trust and obedience separated out, with partial obedience as the case that matters',
        capA: 'Is: ', capB: 'Note: ',
        rows: [
            { btn: '1', short: 'Trust', a: 'Inward \u2014 what you believe about someone',
              b: 'Proverbs 3:5 \u2014 lean not on your own understanding. Nobody can see this part.' },
            { btn: '2', short: 'Obedience', a: 'Outward \u2014 what you actually do',
              b: 'Everyone can see this part, including you. It is the testable half.' },
            { btn: '3', short: 'Trust without obedience', a: 'A belief nothing follows from',
              b: 'James 2 calls this dead. Not wrong \u2014 dead. It produces nothing.' },
            { btn: '4', short: 'Obedience without trust', a: 'Compliance, and it does not last',
              b: 'It holds while someone is watching and stops the moment nobody is.' },
            { btn: '5', short: 'Partial obedience', a: '1 Samuel 15 \u2014 Saul kept the best animals',
              b: 'He did most of it and called it done. Samuel\u2019s reply is the whole chapter.' },
            { btn: '6', short: '"To obey is better than sacrifice"', a: '1 Samuel 15:22',
              b: 'Saul offered what he had kept back. The offering was not the point.' }
        ]
    });
}

/* Faith in the text is never a feeling that stays still, so every row here is
   something somebody physically did. */
function faithActs() {
    return listPicker({
        id: 'fa3', label: 'WHAT THEY ACTUALLY DID', height: 272, y0: 60, dy: 26,
        alt: 'Five examples where faith in the text is shown by an action rather than a feeling',
        capA: 'The act: ', capB: 'Why it counts: ',
        rows: [
            { btn: '1', short: 'Four friends', a: 'Dug through a roof to lower a man in',
              b: 'Mark 2 \u2014 "when he saw THEIR faith". He saw what they had done to the roof.' },
            { btn: '2', short: 'Noah', a: 'Built, for years, with no rain',
              b: 'Hebrews 11:7. Nothing visible supported it for the whole build.' },
            { btn: '3', short: 'Abraham', a: 'Left without being told where',
              b: 'Hebrews 11:8. He moved first and found out after.' },
            { btn: '4', short: 'The woman in the crowd', a: 'Pushed through to reach him',
              b: 'Mark 5. Wanting to was not what got her there.' },
            { btn: '5', short: 'Peter', a: 'Stepped out of the boat',
              b: 'Matthew 14. He also sank. Both halves are in the passage.' },
            { btn: '?', short: 'The pattern', a: 'Faith is visible in the text, every time',
              b: 'Wishing sits still. In every one of these something moved first.' }
        ]
    });
}

/* Love as a standard you can check, rather than a feeling you wait for. */
function loveStandard() {
    return listPicker({
        id: 'ls4', label: 'A STANDARD YOU CAN CHECK', height: 272, y0: 60, dy: 26,
        alt: 'Six marks of love from 1 Corinthians 13 and John 13, each stated as something testable',
        capA: 'Says: ', capB: 'Test: ',
        rows: [
            { btn: '1', short: 'Patient', a: '1 Corinthians 13:4 \u2014 it waits',
              b: 'How do you speak to them on the third time they ask the same question?' },
            { btn: '2', short: 'Kind', a: 'It does something, not just feels something',
              b: 'Name the last thing you did for them that cost you time you wanted.' },
            { btn: '3', short: 'Not envious or boastful', a: 'It does not compete with them',
              b: 'When something good happens to them, what is your first reaction?' },
            { btn: '4', short: 'Not easily angered', a: 'It is slow, not never',
              b: 'The verse allows the anger. It is about the fuse, not the fire.' },
            { btn: '5', short: 'Keeps no record of wrongs', a: 'It does not store them up',
              b: 'Could you list theirs right now? That list is the thing being described.' },
            { btn: '6', short: '"As I have loved you"', a: 'John 13:34 \u2014 the measure is given',
              b: 'Not "as much as you like yourself". A specific, visible standard.' }
        ]
    });
}

export const FIGURES = {
    obeyParts,
    faithActs,
    loveStandard,

    alpabetoLab,

    unitRateLab,

    commonwealthRoad,
    commonwealthWork,
    occupationLine,
    resistKinds,
    conditionsPicker,
    landQuestion,
    presidentsPicker,
    martialLawLine,
    ssT2Map,

    pastSpelling,
    phrasalLab,
    futureChoice,
    tenseLine,
    affixJobs,
    degreeBars,
    adverbKinds,
    pointsAtLab,

    discountLab,
    volumeUnitLab,

    settleStack,
    forceSort,
    distillLab,
    frictionLab,
    fallPair,
    waveNeeds,
    leverLab,
    sciT2Map,

    friendTests,

    impulseGap,
    gratitudeKinds,
    compassionSteps,
    patienceCases,
    forgiveParts,
    oneBodyMany,
    peaceSteps,
    wordsWeight,
    devT2Map,

    tleT2Map,

    kitchenTools,
    kitchenZones,
    dangerZone,
    pantryOrder,
    knifeCuts,
    miseOrder,
    laundryCodes,
    stitchKinds,

    mapehT2Map,

    instrumentFamilies,
    pinoyEnsembles,
    musicTech,
    artPeriods,
    pinoySymbols,
    storyPanels,
    pinoyGames,
    pinggangPinoy,
    projectOrder,

    kaukulanPangngalan,
    panghalipPanao,
    pamatligLapit,
    panaklawTakip,
    kailananPanghalip,
    uriPangUri,
    kaantasanPangUri,
    kasingSalungat,
    aspektoPandiwa,
    uriPangAbay,

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
    irregularVerbs,
    gemdasLab,
    squareLawLab,
    percentLab,
    volumeLab,
    fanParts,
    colloidKinds,
    airway,
    urinary,
    nervous,
    heartParts,
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
    americanChanges,
    colorSchemes,
    sportCategories,
    healthHabits,
    fitnessParts,
    hygieneRoutine,
    careKit,
    schoolKit,
    fileTree,
    homeJobs,
    portfolioSteps,
    worshipForms,
    perseverChain,
    honestyCases,
    serviceActs,
    courageStands,
    uriPangungusap,
    walangPaksa,
    uriPangngalan,
    kasarianPangngalan,
    kailananPangngalan,
    sciExam,
    mathExam,
    engExam,
    ssExam,
    filExam,
    mapehExam,
    tleExam,
    devExam
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
