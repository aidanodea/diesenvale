# Diesenvale website: design review

**Open the live site: https://aidanodea.github.io/diesenvale-review/**

Static, clickable versions of three design concepts (Variant A, Variant B, New website),
plus the Flow Space configurator. Open the link above and pick one — no download needed.
Viewing the files here on GitHub shows their source, not the rendered pages.

| | |
|---|---|
| Variant A | https://aidanodea.github.io/diesenvale-review/variant-a/ |
| Variant B | https://aidanodea.github.io/diesenvale-review/variant-b/ |
| New website | https://aidanodea.github.io/diesenvale-review/new-website/ |
| Flow configurator | https://aidanodea.github.io/diesenvale-review/flow-configurator/ |

To preview locally instead: `python3 -m http.server 8000` in this folder, then open
http://localhost:8000/.

---

Unlisted: every page carries `<meta name="robots" content="noindex, nofollow">` and
`robots.txt` disallows all crawlers, so this will not surface in search. That is
obscurity, not access control — anyone with the link can read it.

Content note: the "New website" concept names real companies as customers and carries
real contact details. Confirm permission before sharing the link beyond the review group.

## Flow Space configurator

Added as a fourth item. It is not a website concept — it is an interactive 3D
space-planning tool for the 9 × 20 m Rathgoggan Middle building: remodel walls and
rooms, assign uses, and place Flow walls.

It was authored as a Claude Design artboard (`.dc.html`) and expected the Design
runtime, which is not redistributable. `flow-configurator/support.js` is a small
stand-in written for this repository, implementing only what the file uses:
`{{path}}` interpolation, `sc-for`, the pointer and click bindings, and
`DCLogic` with `state` / `setState`. Rendering morphs into the live DOM rather than
replacing it, so drags survive a re-render. The original artboard is unmodified
apart from a `noindex` tag.

Fixed 1440 × 900 canvas, so it needs a desktop screen.
