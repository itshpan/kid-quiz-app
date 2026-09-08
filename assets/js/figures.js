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
  <text class="fig-note" x="320" y="128">Heart only · it branches</text>
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
                { w: 3.0, drop: 0.06, pct: 'High',     cap: 'Regular running and lifting.',     verdict: 'A real buffer against ageing.' },
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
                title.textContent = gap < 0.01 ? 'It tessellates' : "It can't";
                title.setAttribute('class', gap < 0.01 ? 'fig-big' : 'fig-big fig-big-no');
                angle.textContent = `${nm}: each corner is ${A % 1 ? A.toFixed(2) : A}°`;
                sum.textContent = `${fit} of them = ${(fit * A) % 1 ? (fit * A).toFixed(2) : fit * A}°`;
                verdict.textContent = gap < 0.01
                    ? 'Exactly 360°. No gap, no overlap.'
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
  <text class="fig-note fig-note-key" x="8" y="160">These are the only three regular shapes that work alone.</text>
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
  <text class="fig-note" x="248" y="54">Cut a piece off the left edge.</text>
  <text class="fig-note" x="248" y="74">Slide it to the right edge.</text>
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
                state.textContent = b === 0
                    ? 'A plain square. Still a tessellation.'
                    : 'Not a square any more. Still no gaps.';
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
                    title.textContent = 'Square landing';
                    title.setAttribute('class', 'fig-big');
                    boneEl.textContent = '2nd and 3rd metacarpals';
                    why.textContent = 'The thickest striking bones.';
                    why2.textContent = 'Braced straight through the wrist.';
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
                title.textContent = tucked ? 'Chin tucked' : 'Chin exposed';
                title.setAttribute('class', tucked ? 'fig-big' : 'fig-big fig-big-no');
                rotTxt.textContent = tucked ? 'Short lever · small rotation' : 'Long lever · fast rotation';
                why.textContent = tucked ? 'The head barely turns.' : 'The skull whips round.';
                why2.textContent = tucked ? 'The brain moves with it.' : 'The brain lags, then catches up.';
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
        none:       { t: '', name: 'Starting position', desc: 'This is the shape before any move.', tag: '' },
        translate:  { t: 'translate(96,34)', name: 'Translation', desc: 'Slid 96 right and 34 down. Still facing the same way.', tag: 'A slide' },
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

  <text class="fig-label" x="276" y="30">THE MOVE</text>
  <text class="fig-big" id="tlName" x="276" y="60">—</text>
  <text class="fig-note fig-note-key" id="tlTag" x="276" y="82"> </text>
  <text class="fig-note fig-note-dim" x="276" y="150">Faint outline = where it started</text>
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
    const WRONG = { rows: ['12.5', '3.75'], pad: 'right', sum: '(nonsense)', note: 'The 5 tenths is now under 7 hundredths. Every column means something different.' };
    const RIGHT = { rows: ['12.50', ' 3.75'], pad: 'point', sum: '16.25', note: 'Tenths under tenths, hundredths under hundredths. Add the empty space as a zero.' };

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
        { label: 'James',    base: 'James',    out: "James's horse",          rule: 'Singular already ending in s', why: "James's or James' — both accepted. Pick one and be consistent." },
        { label: 'its',      base: 'its',      out: "the car lost its wheel", rule: 'The trap',                   why: "No apostrophe. it's always means 'it is'. This is the most common error in English." }
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
    possessiveRule
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
