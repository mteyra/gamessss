# Verification

## V3 — animated film player, 15 November 2026

The current homepage and `presentation.html` use native MP4 video playback, a top category navigator and chapter transcripts. Source, layout, full media and browser checks passed. Times in the linked JSON records are UTC; this section uses Europe/Berlin.

### Completed evidence

- **23 unit tests passed**, covering core behaviour, motion, film composition and film timelines. The timeline checks cover all 72 lessons and **467 chapters**, including ordering, chapter boundaries, reading time, settled holds, deterministic seeking and motion endpoints. These checks exercise the authored source and renderer, not every finished MP4.
- [cinema-layout-check.json](cinema-layout-check.json) records a source-layout audit across **72 games, 467 chapters, 1,744 text lines and 182 legend labels** at 1280 × 720. Captions use at most two lines; no measured overflows remain. The recorded frame-source hash matches the reviewed source. Font advance measurements omit kerning and do not inspect actor text inside the court.
- The same record documents visual review of **one representative action or scoring frame per game** in six family contact sheets, with suspect details rechecked at full resolution. Corrections cover Money Ball's opening title, missing symbol/macron glyphs, Jianzi's rule label and Capture the Flag's holding-area labels. This is sampled composition evidence; it does not establish complete playback quality for all films.
- [film-media-check.json](film-media-check.json) records successful decoding of **all 102,622 frames across 72 distinct MP4s**. The films total **71 minutes 16 seconds**, **467 chapters** and **64.92 MiB**. Every film is 1280 × 720, 24 fps, H.264/yuv420p, with fast-start metadata; every poster is a matching 1280 × 720 WebP. The audit compares frame counts, duration, chapter text and timing with the authored source, checks file sizes and records a unique SHA-256 digest for every movie. It validates media integrity and source consistency, not the factual accuracy of every rule.
- [cinema-browser-check.json](cinema-browser-check.json) records **50 passing checks** in an isolated headless Firefox profile, with no console errors, against `http://127.0.0.1:8878/gamessss/`. **All 72 MP4s loaded and decoded in the browser** with matching dimensions and durations. Interaction coverage includes visible movement between decoded frames, pause stability, whole-game navigation, seeking, transcripts, downloads, speed, full screen, dialog pause/resume, saved selections, preservation of a reordered 72-game selection and auto-next. It also checks the top navigator, alias search, time links, atlas and print links, plus layouts at 1440 × 900, 1280 × 720, 390 × 844 and 360 × 640. The earlier [46-check smoke run](cinema-smoke-check.json), made with seven indexed films, is retained separately.
- An independent static audit resolved **99 HTML, CSS, module, fetch, generated-link and then-completed film references** beneath the GitHub project prefix `/gamessss/`, with no missing targets or references escaping that prefix. The preserved `/field-guide/` alias also passed query-string and fragment redirect checks.
- The field guide retains its original content and script; its only HTML change is the navigation label from “Learn games” to “Watch games.” The **72-page PDF is unchanged** from the retained print edition. Its prior text-extraction and layout evidence remains recorded under V1 below. The full browser pass confirms all 72 field-guide entries and ordered print output still work.

## V2 — historical self-guided animated learner, 14 November 2026

The learner replaces the first version's homepage and presentation. Both `index.html` and `presentation.html` load `learn.js` and `learn.css`; `atlas.html` provides the separate filterable catalogue. The historical presentation checks below do not establish the behaviour of this replacement.

### Independently verified

- The canonical catalogue validator passed again: 72 unique games, 12 in each family, 83 source URLs and valid schema fields/ranges. Version labels remain 8 documented games, 50 starter rules and 14 house adaptations. This validation checks structure and URL syntax without fetching sources.
- All 12 core and motion tests pass. They cover search, filters, storage fallback, rule exports, static field sketches, escaping, catalogue-to-lesson coverage, route continuity, finite interpolation, delayed motion, scrubbing endpoints and upright resets. Browser interactions are checked separately below.
- The combined lesson module imports successfully and has exactly one lesson for every canonical game, with no unknown game IDs.
- All 72 lessons contain five to seven states, totalling **467 authored game states**. The two introduction screens are additional. Every state has a title, explanatory caption, action and complete node array. The longest explanatory caption is 29 whitespace-separated words.
- All states have unique node IDs, supported node kinds and finite coordinates. All **374 movement tracks** finish at their corresponding state's node coordinates; tracks for existing nodes begin at the preceding state's coordinates.
- Sampling every transition at 0%, 25%, 50%, 75% and 100% produced **2,335 finite intermediate frames**. Rendering those samples with `nodeMarkup()` produced 2,335 SVG documents that parsed successfully with Python's XML parser. This checks geometry data and markup, not visual clarity or browser layout.
- Human Knot's player routes now interpolate with their hand connections. A separate check at seven progress values confirmed that every hand-line endpoint remains attached to its corresponding player throughout the untangling transition.

### Browser and visual review

[learner-browser-check.json](learner-browser-check.json) records **39 passing browser checks** in an isolated Firefox profile, with no console errors. That version used `tools/learner-browser-check.mjs`; the current `tools/browser-check.mjs` now forwards to the cinema suite.

- Clickable introductory example and forward/backward navigation tutorial.
- All 72 lessons and all 467 states, with matching captions, valid SVG and horizontal fit at 1440 × 900.
- Actual intermediate player movement, pause stability, replay, scrubbing to both endpoints, and timed sequence playback that stops at the final move.
- Still-frame mode, including a scrubbed sequence and the retained full-rules examples.
- Per-move arrows, Shift + Arrow game skipping, keyboard replay/pause/help and alias search in the library.
- Saving from a lesson, ordered selections, state deep links, and preserving a reordered selection containing all 72 games.
- Mobile learner, library and atlas at 390 × 844, including returning the court to view after advancing from below it.
- Compact desktop layout at 1280 × 720.
- Direct lesson links in the atlas, alias filtering, all 72 field-guide entries and ordered print output.

Rendered views were reviewed for both introductions, Islands, Flunkyball, Kho Kho, Tchoukball, Hoop Rescue, the phone library and atlas. The authoring pass also reviewed every game's stills in contact sheets. Visual corrections included court layers hiding rescued players, reset rotations, overlapping annotations, connected hands in Human Knot, and the phone layout. The court expands with its control or F; small-screen pages also remain scrollable.

## V1 — historical atlas and presentation, 14 November 2026

The following evidence belongs to the first published implementation, before the self-guided learner replaced its homepage and presentation. Browser testing used an isolated headless Firefox profile; no personal browser session was attached. The print edition evidence remains recorded here because its rules and PDF were retained.

### Catalogue and source

- 72 unique game IDs; 12 games in each of six families.
- Each entry has setup, four or five ordered steps, ending, variation, practical hosting notes, version status and source links.
- All data validation and seven core tests passed.
- Local HTML links, named anchors, CSS assets, JavaScript imports, font signatures and literal game references resolve.
- All seven teaching demonstrations have three distinct beats. Every SVG parses; animated beats play once for 620 ms. Initial stills and reduced-motion renders contain no animation.
- The source URL check is recorded separately in [SOURCE-STATUS.md](SOURCE-STATUS.md). Successful HTTP responses do not establish factual accuracy.

### Browser behavior

[browser-check.json](browser-check.json) records 36 passing checks, including:

- Every rules dialog opens with its complete steps and no horizontal overflow.
- Search aliases, family filters, combined equipment/group-size filters and empty-result recovery.
- Teaching-demo step controls and rule-lab changes.
- Saving, reloading, reordering and removing lineup entries.
- Updating an open lineup after another tab changes the saved collection.
- Keyboard focus after reordering to the first position and after closing replaced dialogs.
- Ordered presentation and print links.
- Source search and expansion.
- Presentation keyboard navigation, full rules, notes and overview.
- Responsive atlas and rules dialogs at 390 × 844.
- No browser console errors.

An additional presentation pass checked all **81 scenes** at **1440 × 900** and **1280 × 720**. Every scene fit without horizontal or vertical overflow. Phone scenes intentionally scroll; their rules and action controls remain reachable. Eighteen navigation/overview/keyboard checks passed in that pass. The presentation also honors the homepage motion preference, updates it across tabs, and respects system reduced motion.

### Print edition

The complete guide is a 72-page, tagged A4 PDF: one game on each page. The body uses 12 px type in the print stylesheet. Font ligatures are disabled in the printed edition to preserve text extraction.

Poppler text extraction verified every title, setup, rule step, ending, care note and version note against the canonical game data on the corresponding PDF page. No segments were missing. Rendered pages were checked for layout and text legibility.

## Practical limits

The catalogue is researched and edited, not a record of field-testing every variation. Suggested ages, durations and group sizes are hosting guidance. Cultural context and formal competition rules may require a practitioner or the linked full source. Browser checks cover Firefox at the listed sizes; they are not a claim of exhaustive testing across devices or assistive technologies.
