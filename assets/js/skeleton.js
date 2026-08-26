/* ==========================================================================
   skeleton.js — interactive front-facing skeleton diagram.
   Used twice: as a lesson explorer block, and as the "hotspot" quiz type.
   Each bone carries a car fact and a boxing fact, per the interest lenses.
   ========================================================================== */

export const BONES = {
    skull: {
        name: 'Skull (Cranium)',
        latin: 'cranium',
        facts: {
            job: 'Rigid armour for the brain. Unlike ribs, it is not designed to flex at all.',
            car: 'This is the passenger safety cell. A helmet is just a second skull bolted on outside the first one.',
            box: 'Everything in boxing defence exists to stop force reaching what is inside this.'
        },
        svg: '<ellipse cx="100" cy="34" rx="23" ry="27"/><rect x="88" y="55" width="24" height="10" rx="3"/>'
    },
    mandible: {
        name: 'Mandible (Jaw)',
        latin: 'mandibula',
        facts: {
            job: 'The only bone in your skull that moves freely. Anchors the strongest muscle in your body for its size.',
            car: 'Not protected by anything — which is why full-face helmets have a chin bar.',
            box: 'Tuck your chin. A clean shot here rotates the skull fast, and the brain keeps moving after the skull stops. That rotation is the knockout.'
        },
        svg: '<path d="M79 50 Q100 74 121 50 Q117 64 100 66 Q83 64 79 50 Z"/>'
    },
    clavicle: {
        name: 'Clavicle (Collarbone)',
        latin: 'clavicula',
        facts: {
            job: 'Connects your arm to your chest. The most commonly fractured bone in the human body.',
            car: 'The shoulder belt runs directly across it. It breaks at a lower force than your neck or spine — a fuse blowing to protect the circuit.',
            box: 'Every punch you throw transmits through here on the way from your body to your fist.'
        },
        svg: '<rect x="62" y="70" width="34" height="6" rx="3" transform="rotate(-8 79 73)"/><rect x="104" y="70" width="34" height="6" rx="3" transform="rotate(8 121 73)"/>'
    },
    sternum: {
        name: 'Sternum (Breastbone)',
        latin: 'sternum',
        facts: {
            job: 'The flat plate down the centre of your chest. All your ribs anchor to it.',
            car: 'Spreads seatbelt force sideways into the whole ribcage instead of one point.',
            box: 'Body shots aimed here hit bone. Aimed slightly lower, they hit liver. Guess which one fighters aim for.'
        },
        svg: '<rect x="95" y="80" width="10" height="46" rx="4"/>'
    },
    ribs: {
        name: 'Ribcage (Ribs)',
        latin: 'costae',
        facts: {
            job: '12 pairs of bones caging the heart and lungs — and flexible enough to let you breathe.',
            car: 'This is the crumple zone. Ribs flex and can break, absorbing energy, because bone heals and organs do not.',
            box: 'Ribs bruise and crack from body shots. They also expand and contract every breath, which is why body work drains a fighter faster than head shots.'
        },
        svg: '<g fill="none" stroke-width="4" stroke-linecap="round">' +
             '<path d="M94 86 Q66 92 64 106"/><path d="M106 86 Q134 92 136 106"/>' +
             '<path d="M94 98 Q62 104 61 119"/><path d="M106 98 Q138 104 139 119"/>' +
             '<path d="M94 110 Q64 116 66 131"/><path d="M106 110 Q136 116 134 131"/>' +
             '<path d="M95 122 Q70 128 73 142"/><path d="M105 122 Q130 128 127 142"/>' +
             '</g>'
    },
    spine: {
        name: 'Spine (Vertebrae)',
        latin: 'columna vertebralis',
        facts: {
            job: '33 stacked bones forming a tunnel that protects the spinal cord.',
            car: 'A headrest is not for comfort. It stops your neck vertebrae whipping backwards in a rear-end collision.',
            box: 'Rotation through the spine is where punch power actually comes from — not the arm.'
        },
        svg: '<rect x="96" y="128" width="8" height="52" rx="3"/>'
    },
    humerus: {
        name: 'Humerus (Upper arm)',
        latin: 'humerus',
        facts: {
            job: 'The single long bone from shoulder to elbow.',
            car: 'Sticking an elbow out the window puts this bone outside the safety cell. Dont.',
            box: 'Your triceps attaches here and pulls the elbow straight. That is the mechanism of a straight punch.'
        },
        svg: '<rect x="55" y="82" width="9" height="66" rx="4.5" transform="rotate(6 59 115)"/><rect x="136" y="82" width="9" height="66" rx="4.5" transform="rotate(-6 141 115)"/>'
    },
    forearm: {
        name: 'Radius & Ulna (Forearm)',
        latin: 'radius, ulna',
        facts: {
            job: 'Two bones side by side. The radius rotates around the ulna — that is how you turn your palm over.',
            car: 'Hands at 9 and 3 keeps these bones out of the airbag path. Hands at 12 puts your forearms in front of it.',
            box: 'Turning the fist over at the end of a punch is literally the radius crossing the ulna. Blocks land here too — that is why forearms get conditioned.'
        },
        svg: '<rect x="50" y="150" width="7" height="60" rx="3.5" transform="rotate(4 53 180)"/><rect x="59" y="150" width="7" height="60" rx="3.5" transform="rotate(4 62 180)"/>' +
             '<rect x="143" y="150" width="7" height="60" rx="3.5" transform="rotate(-4 146 180)"/><rect x="134" y="150" width="7" height="60" rx="3.5" transform="rotate(-4 137 180)"/>'
    },
    metacarpals: {
        name: 'Metacarpals (Hand)',
        latin: 'ossa metacarpi',
        facts: {
            job: '27 bones per hand — over a quarter of every bone you own is in your two hands.',
            car: 'Gripping the wheel with thumbs inside the rim can break these if the airbag fires. Thumbs go outside.',
            box: 'These are the striking bones. The 5th metacarpal — pinky side — is the "boxer\'s fracture", and hand wraps exist to compress all 27 into one solid block.'
        },
        svg: '<rect x="46" y="212" width="18" height="20" rx="6"/><rect x="136" y="212" width="18" height="20" rx="6"/>'
    },
    pelvis: {
        name: 'Pelvis (Hip bones)',
        latin: 'pelvis',
        facts: {
            job: 'A basin of fused bone carrying your upper body weight into your legs, and shielding the organs inside it.',
            car: 'The lap belt is designed to load exactly this. Worn too high, the same force goes into your intestines instead. This is why "low and snug" matters.',
            box: 'Hip rotation here is the engine of every power punch. The hands just deliver what the hips generate.'
        },
        svg: '<path d="M74 182 Q100 176 126 182 Q130 206 112 216 Q100 210 88 216 Q70 206 74 182 Z"/>'
    },
    femur: {
        name: 'Femur (Thigh bone)',
        latin: 'femur',
        facts: {
            job: 'The longest and strongest bone in the human body. Gram for gram it outperforms structural steel.',
            car: 'In a frontal crash the femur takes the load through the knee. Crash-test dummies measure femur force as a primary injury score.',
            box: 'Everything starts here. Drive from the legs or the punch is arm-only.'
        },
        svg: '<rect x="80" y="216" width="11" height="84" rx="5.5" transform="rotate(3 85 258)"/><rect x="109" y="216" width="11" height="84" rx="5.5" transform="rotate(-3 115 258)"/>'
    },
    patella: {
        name: 'Patella (Kneecap)',
        latin: 'patella',
        facts: {
            job: 'A floating bone inside the knee tendon. It works as a pulley, increasing the leverage of your thigh muscle.',
            car: 'The dashboard is directly in front of it. This is why a knee bolster airbag exists in most modern cars.',
            box: 'Pivot on the ball of the foot, not the knee. This joint does not like rotation under load.'
        },
        svg: '<ellipse cx="86" cy="306" rx="8" ry="9"/><ellipse cx="114" cy="306" rx="8" ry="9"/>'
    },
    tibia: {
        name: 'Tibia & Fibula (Lower leg)',
        latin: 'tibia, fibula',
        facts: {
            job: 'The tibia is your shin and carries almost all the weight. The thin fibula beside it is mostly a muscle anchor.',
            car: 'Pedal-area intrusion in a crash is the main cause of lower-leg injury, which is why footwells are reinforced.',
            box: 'Shin conditioning works by Wolff\'s Law — repeated controlled loading makes the tibia remodel denser over years.'
        },
        svg: '<rect x="81" y="314" width="10" height="82" rx="5"/><rect x="93" y="316" width="6" height="78" rx="3"/>' +
             '<rect x="109" y="314" width="10" height="82" rx="5"/><rect x="101" y="316" width="6" height="78" rx="3"/>'
    },
    feet: {
        name: 'Feet (Tarsals & Metatarsals)',
        latin: 'ossa pedis',
        facts: {
            job: '26 bones per foot, arranged into arches that act as springs and shock absorbers.',
            car: 'Your entire relationship with a car happens through these three pedals.',
            box: 'Footwork is bone mechanics. Every bit of force in a punch is borrowed from the floor through here.'
        },
        svg: '<path d="M76 396 h20 v10 h-26 a4 4 0 0 1 0-10 Z"/><path d="M124 396 h-20 v10 h26 a4 4 0 0 0 0-10 Z"/>'
    }
};

/** Builds the SVG markup for the skeleton. */
export function skeletonSVG() {
    const parts = Object.entries(BONES)
        .map(([id, b]) => `<g class="bone" data-bone="${id}" role="button" tabindex="0" aria-label="${b.name}"><title>${b.name}</title>${b.svg}</g>`)
        .join('');
    return `<svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const HIT_PAD = 5;

/**
 * Several bones are thin (clavicle) or come as a left/right pair with a wide
 * empty gap between them (femur, forearm). Tapping the shape itself is fiddly
 * on a phone, so we lay a transparent, padded rectangle under every individual
 * shape. Visible art still sits on top and wins a direct hit; the hit layer
 * only catches near-misses.
 *
 * Rects are sorted largest-area-first so that small bones (sternum, spine)
 * end up last in document order and win where regions overlap.
 */
function buildHitLayer(svg) {
    if (svg.querySelector('.hitlayer')) return;

    const rects = [];
    svg.querySelectorAll('.bone').forEach(group => {
        group.querySelectorAll('rect, ellipse, path, circle').forEach(shape => {
            let box;
            try { box = shape.getBBox(); } catch { return; }
            if (!box || !box.width || !box.height) return;
            rects.push({
                bone: group.dataset.bone,
                x: box.x - HIT_PAD,
                y: box.y - HIT_PAD,
                w: box.width + HIT_PAD * 2,
                h: box.height + HIT_PAD * 2
            });
        });
    });

    rects.sort((a, b) => b.w * b.h - a.w * a.h);

    const layer = document.createElementNS(SVG_NS, 'g');
    layer.setAttribute('class', 'hitlayer');
    rects.forEach(r => {
        const el = document.createElementNS(SVG_NS, 'rect');
        el.setAttribute('x', r.x);
        el.setAttribute('y', r.y);
        el.setAttribute('width', r.w);
        el.setAttribute('height', r.h);
        el.setAttribute('fill', 'transparent');
        el.dataset.bone = r.bone;
        layer.appendChild(el);
    });
    svg.insertBefore(layer, svg.firstChild);
}

/**
 * Wires click/keyboard selection on a rendered skeleton.
 * @param {HTMLElement} root element containing the svg
 * @param {(boneId: string) => void} onSelect
 */
export function bindSkeleton(root, onSelect) {
    const svg = root.querySelector('svg');
    if (svg) buildHitLayer(svg);

    const groups = root.querySelectorAll('.bone');
    const select = id => {
        if (!BONES[id]) return;
        groups.forEach(g => g.classList.toggle('active', g.dataset.bone === id));
        onSelect(id);
    };

    // One delegated listener covers both the visible art and the hit layer.
    root.addEventListener('click', e => {
        const target = e.target.closest('[data-bone]');
        if (target) select(target.dataset.bone);
    });
    groups.forEach(g => {
        g.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.bone); }
        });
    });

    return { select, clear: () => groups.forEach(g => g.classList.remove('active')) };
}

/** Renders the info panel for a selected bone. */
export function boneInfoHTML(id) {
    const b = BONES[id];
    if (!b) return '<p class="placeholder">Tap a bone on the skeleton to see what it does.</p>';
    return `
        <h3>${b.name}</h3>
        <div class="latin">${b.latin}</div>
        <div class="bone-fact"><span class="ico">🦴</span><span>${b.facts.job}</span></div>
        <div class="bone-fact"><span class="ico">🚗</span><span>${b.facts.car}</span></div>
        <div class="bone-fact"><span class="ico">🥊</span><span>${b.facts.box}</span></div>
    `;
}
