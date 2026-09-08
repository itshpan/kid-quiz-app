# Filipino — awaiting review before going live

These five lessons are written and pass `tools/check-content.mjs`, but they are
deliberately **not** switched on in `content/courses.json`. Their weeks are
still `"status": "soon"` and carry no `file`, so nothing links to them from the
course page. They are reachable by direct URL for review:

    /lesson.html?file=filipino/w1-ortograpiya.json
    /lesson.html?file=filipino/w2-pagbuo-salita.json
    /lesson.html?file=filipino/w3-kayarian-salita.json
    /lesson.html?file=filipino/w4-bahagi-ayos-pangungusap.json
    /lesson.html?file=filipino/w5-kayarian-pangungusap.json

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

Supply the book — or chapter summaries — and the chapter-specific cards can be
added without touching anything else.

## To switch them on

Set `status` to `"live"` and add the `file` path for each week under the
`filipino` course in `content/courses.json`, then deploy.
