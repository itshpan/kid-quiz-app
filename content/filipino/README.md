# Filipino — reviewed and live

All eleven lessons are switched on in `content/courses.json`. This file records
what the language review found, and the one thing that is still open.

## The review (September 2026)

Every lesson, every figure and every quiz item was read against the grammar it
teaches. Twenty corrections were made. The ones that mattered:

| Where | Was | Now |
|---|---|---|
| `walangPaksa` figure | "Masakit ang ulo" given as a subjectless sentence | It has a paksa — replaced with "Nilalagnat mula kagabi" |
| W7 card + 3 quiz items | Taught that pautos is *not* walang paksa, while the figure listed it as one | Reframed: both are walang paksa; they differ in whether a paksa could be inserted |
| `kailananPangngalan` figure | "Dalawahan — inuulit ang unang pantig" | False; reduplication gives *maramihan*. Now "karaniwang nagsisimula sa mag-" |
| W3 card + order question | Decision order put pag-uulit before panlapi, so "naglalaro" came out *inuulit* | Reordered: tambalan → maylapi → inuulit → payak |
| W4 checkpoint | Asked to front the simuno of "Umuulan sa Maynila", which has none | Replaced with a sentence that has one |
| `uriPangungusap` figure | Labelled "APAT NA URI" above five types | "LIMANG URI" |
| W8 card | "May itak siyang hawak, hindi baril" | The Caloocan monument shows both — claim removed |
| W2 card | "Ipinatapon si Rizal tatlong araw matapos…" | He was *arrested* after three days; exile came later |
| W6 card | Fighting continued "apat pang taon" | May 1897 to July 1902 is five |
| W7 card | Aguinaldo returned "makalipas ang labing-siyam na araw" | Replaced with the date, 19 May 1898 |

Smaller fixes: `kaban` dropped from the palansak examples (it is a container,
not a collective noun); the Spanish -o/-a pair relabelled from "Panlapi" to
"Hiram"; a garbled recap line in W5; a doubled "ay" in W1; the gitling
checkpoint no longer turns on the contested `na` linker after a numeral.

**This review was done by Claude, not by a native speaker.** The grammar rules,
examples and orthography were checked against standard usage and the KWF
alphabet, and the errors above are real ones that were found and fixed. What a
native speaker would still add is a judgement on register and naturalness —
whether the lens cards in particular sound like someone actually talking. If
you get that read, the places to look first are the lens cards, since they use
idiom rather than textbook language.

## Still open: the PAGBASA half is background, not chapter summary

Each week's scope pairs a grammar topic with chapters of *Supremo*. The edition
the school uses still has not been seen, so **no chapter is summarised anywhere
in these files.** Inventing plot would break the rule in CLAUDE.md that facts
must be true.

What the second half of each lesson carries instead is real history that holds
whatever the edition: the background needed to follow a novel about Andrés
Bonifacio. Every lesson is framed to the student as preparation ("Bago mo
buksan ang Supremo", "Ito ang kailangan mong malaman bago iyon") rather than as
the chapter itself, and every teacher note says so explicitly.

| Week | Scope says | What is here instead |
|---|---|---|
| 1 | Kabanata 1–2 | Bonifacio's early life; Tondo in the 1880s; tauhan / tagpuan / suliranin |
| 2 | Kabanata 3–4 | Why the Katipunan was secret; its three ranks; his pen name |
| 3 | Kabanata 5–6 | Cedula, polo and tributo — what people were carrying |
| 4 | Kabanata 7 | August 1896: the discovery and the Cry |
| 5 | Kabanata 8 | Tejeros, and Bonifacio's death at the hands of his own side |
| 6 | Kabanata 9 | Aguinaldo takes over; the Republic of Biak-na-Bato |
| 7 | Kabanata 10 | May 1898, the Kawit declaration, the Treaty of Paris |
| 8 | Kabanata 11 | How Bonifacio was remembered: Bonifacio Day, the Caloocan monument |
| 9 | Kabanata 12 | The national hero question — no law names one |
| 10 | Kabanata 13 | Why the story is still read, and the question it leaves open |
| 11 | Exam week | Revision + a 24-question paper, drawing only on the history above |

Weeks 6–10 are the ones to re-check against the book. Bonifacio dies in the
week 5 material, so those later chapters could be an aftermath, a framing
device, or a different narrator entirely.

Supply the book — or chapter summaries — and the chapter-specific cards can be
added without touching anything else.

---

# Term 2 — written, live, and not yet read by a native speaker

Eleven lessons, all switched on. Same structure as Term 1: a grammar half and,
on the five weeks whose scope names a book, a background half.

## What the grammar half covers

| Linggo | Paksa | Ang aktuwal na kaisipan |
|---|---|---|
| 1 | Kaukulan ng Pangngalan | Hindi nagbabago ang pangngalan — ang pananda ang nagbabago |
| 2 | Panghalip Panao | Tayo laban sa kami: saklaw, hindi bilang |
| 3 | Pananong at Pamatlig | Layo, hindi laki, ang pumipili sa ito / iyan / iyon |
| 4 | Panghalip Panaklaw | May bilang ba? Kung oo, pamilang iyon |
| 5 | Kailanan ng Panghalip | Muling pagtaas ng tayo-kami, dahil hindi ito isahang aral |
| 6 | Uri ng Pang-uri | Uri at kayarian ay dalawang magkaibang tanong |
| 7 | Kaantasan ng Pang-uri | Bilangin muna ang pinaghahambing |
| 8 | Singkahulugan at Salungat | Hindi laging palitan ang kasingkahulugan |
| 9 | Pandiwa: Aspekto at Pokus | Hanapin ang pananda na `ang`, huwag kabisahin ang panlapi |
| 10 | Pang-abay | Ano ang tinuturo nito? At: `na` sa pangngalan, `nang` sa kilos |
| 11 | Pagsusulit | 24 tanong, nakahanay sa apat na sinulid |

Ten new interactive figures carry it — one per lesson — all in
`assets/js/figures.js`: `kaukulanPangngalan`, `panghalipPanao`,
`pamatligLapit`, `panaklawTakip`, `kailananPanghalip`, `uriPangUri`,
`kaantasanPangUri`, `kasingSalungat`, `aspektoPandiwa`, `uriPangAbay`.
Two of them are drawn rather than listed, because the rule is spatial:
`pamatligLapit` moves an object between two people, and `aspektoPandiwa`
puts the action on a timeline with NGAYON marked.

## Still open: the same gap as Term 1, for five different books

The scope pairs five weeks with named books. **None of those editions has been
seen, so no plot is summarised anywhere in these files.** Inventing one would
break the rule in `CLAUDE.md` that facts must be true.

| Linggo | Akda sa scope | Ano ang nasa lesson instead |
|---|---|---|
| 1 | *Papa's House, Mama's House* | OFW statistics, extended-family households, and the four reading questions (tauhan, tagpuan, suliranin, damdamin) |
| 3 | *Naging Pintor si Tominaman sa Rogong* | Maranao culture: Lake Lanao, the chanted *Darangen*, `okir`, `sarimanok`, the `panolong` of a torogan |
| 5 | *Si Diwayen, Noong Bago Dumating ang mga Espanyol* | Pre-colonial society: barangay, datu, baybayin, the three ranks, the Laguna Copperplate |
| 7 | *Si Segunda, Noong Panahon ng Mga Espanyol* | Tributo, polo y servicio, cedula personal, and the colonial ranking |
| 9 | *Si Pitong, Noong Panahon ng Mga Hapon* | Occupation life: rationing, the replacement currency, guerrillas and the Makapili |

Each of these halves opens with "Hindi pa nakikita ang edisyong gamit ng klase
mo, kaya walang buod ng kuwento dito", so the learner is told plainly what he
is getting. Every teacher note says the same.

This background is worth having on its own: weeks 5, 7 and 9 line up exactly
with the Term 2 Social Studies weeks on the same three periods, so the reading
half reinforces history he is learning in another subject the same week.

Supply the books — or chapter summaries — and the chapter-specific cards drop
in without touching the grammar half or any figure.

## The language review has NOT been done for Term 2

Term 1's twenty corrections are listed above, and they were real. **Term 2 has
had no equivalent pass.** The grammar was written against standard usage and
checked for internal consistency, but it has not been read line by line against
a reference the way Term 1 was, and it has not been read by a native speaker at
all.

The places to look first, in order:

1. **`aspektoPandiwa` and the W9 pokus cards.** Pokus is the hardest topic in
   the term and the one where textbooks disagree with each other. The four
   example sentences (`naglinis` / `nilinis` / `pinaglinisan` / `ipinanglinis`)
   follow the standard patterning, but `ipinanglinis` in particular is the kind
   of form a speaker may find stilted.
2. **W5's `kata` / `kanita`.** The dual forms are in the scope and in the
   textbooks, and are close to dead in speech. They are taught here as exam
   material and labelled as such ("Bihira na sa usapan ngayon, pero nasa
   pagsusulit"). A native speaker should confirm that framing is fair.
3. **The lens cards, everywhere.** Same as Term 1: they use idiom rather than
   textbook language, so they are where register will sound wrong if it sounds
   wrong anywhere.
4. **W8's three degrees of tiredness** (`pagod`, `hapo`, `lupaypay`). The whole
   card rests on the claim that these are not interchangeable and that
   `lupaypay` is the strongest. That is a judgement about feel, which is
   exactly what a native speaker is for.
