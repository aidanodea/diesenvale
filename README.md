# Diesenvale website: design review

**Open the live site: https://aidanodea.github.io/diesenvale-work/**

Static, clickable versions of three design concepts (Variant A, Variant B, New website),
plus the Flow Space configurator. Open the link above and pick one — no download needed.
Viewing the files here on GitHub shows their source, not the rendered pages.

| | |
|---|---|
| Variant A | https://aidanodea.github.io/diesenvale-work/variant-a/ |
| Variant B | https://aidanodea.github.io/diesenvale-work/variant-b/ |
| New website | https://aidanodea.github.io/diesenvale-work/new-website/ |
| Flow configurator | https://aidanodea.github.io/diesenvale-work/flow-configurator/ |

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

## Quote Agent

Folded in from `aidanodea/diesenvale` (which remains live at
https://aidanodea.github.io/diesenvale/). A single-page case for an AI costing agent
for fabrication quotes: the problem with quoting by instinct, what the agent does, the
data that has to exist before it can be built, the two-phase process, and a calculator
estimating the annual cost of having no system.

Not a website concept either — it sits alongside the review material because it is the
same client and the same conversation.

Changed on the way in: `noindex` added for consistency with the rest of this repository,
and the `href="#"` nav link pointed at the contact address so the page carries no dead
link. **The contact address is still the placeholder `aidan@example.com`** and needs
replacing before this is shown to anyone.
