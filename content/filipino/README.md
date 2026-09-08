# Filipino — awaiting review before going live

These ten lessons are written and pass `tools/check-content.mjs`, but they are
deliberately **not** switched on in `content/courses.json`. Their weeks are
still `"status": "soon"` and carry no `file`, so nothing links to them from the
course page. They are reachable by direct URL for review:

    /lesson.html?file=filipino/w1-ortograpiya.json
    /lesson.html?file=filipino/w2-pagbuo-salita.json
    /lesson.html?file=filipino/w3-kayarian-salita.json
    /lesson.html?file=filipino/w4-bahagi-ayos-pangungusap.json
    /lesson.html?file=filipino/w5-kayarian-pangungusap.json
    /lesson.html?file=filipino/w6-uri-pangungusap.json
    /lesson.html?file=filipino/w7-walang-paksa.json
    /lesson.html?file=filipino/w8-uri-pangngalan.json
    /lesson.html?file=filipino/w9-kasarian-pangngalan.json
    /lesson.html?file=filipino/w10-kailanan-pangngalan.json

Two things need a human before these ship.

## 1. A native speaker has to read the Filipino

Every other subject here is written in English. These are not. The grammar
content is standard and the structure matches the rest of the site, but
phrasing, register and naturalness need a native speaker's eye — particularly
the lens cards, which use idiom rather than textbook language.

## 2. The PAGBASA half is preparation, not chapter summary

Each week's scope pairs a grammar topic with chapters of the novel *Supremo*.
The specific edition the school uses has not been seen, so **no chapter is
summarised anywhere in these files** — inventing plot would break the rule in
CLAUDE.md that facts must be true.

What the second half of each lesson contains instead is real and useful whatever
the edition: the historical background needed to follow a novel about Andrés
Bonifacio, and the comprehension questions to answer after each chapter.

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

Weeks 6–10 need a second look in particular. Bonifacio dies in the week 5
material, so the later chapters could be almost anything: an aftermath, a
framing device, a different narrator. What those five lessons carry is the
history of what actually followed — Biak-na-Bato, the Kawit declaration, the
Treaty of Paris, and how Bonifacio came to be remembered afterwards. All of it
is true and all of it is relevant to a novel about him, but none of it claims
to be what the chapters contain.

Supply the book — or chapter summaries — and the chapter-specific cards can be
added without touching anything else.

## To switch them on

Set `status` to `"live"` and add the `file` path for each week under the
`filipino` course in `content/courses.json`, then deploy.
