# Verification

## V4 — dark player and continuous chapter motion, 15 November 2026

The V4 source uses a near-black player and court, white type, muted steel surfaces and restrained blue highlights. The compact top category navigator, video controls, chapter transcript and whole-game shortcuts remain. The standalone field guide, atlas and saved PDF retain their earlier design.

### Release design

- The catalogue remains **72 games and 467 authored chapters**. Each film chapter uses its full duration for the action; there are no added lead-in or settled holds. Waits needed to demonstrate a rule remain part of the authored movement. The moving court scene includes **1.1 seconds at the start and 1 second at the end**, with the setup caption visible from frame zero and the last chapter caption continuing through the end. There are no separate title cards or transient closing messages.
- The source timelines total approximately **56 minutes 12 seconds before rounding to video frames**. The finished release totals **56 minutes 13 seconds**, at **1280 × 720, 30 fps, H.264 Main/yuv420p, CRF 20**, silent with captions embedded in the video. Full media-validation evidence is recorded below.
- The film-specific palette and label adapter leave the canonical field-guide content unchanged. The cinema's full-rules and lineup dialogs use the dark UI styling.
- Manifest version 2 records source and encoding fingerprints. The encoder reuses a movie only after matching those fingerprints and validating its movie, poster and chapter metadata; changes to source or settings cause regeneration. The release validator checks the same fingerprints and fully decodes each completed movie.

### Completed local validation

The final V4 source passed **35 unit tests** and the canonical catalogue validator: **72 unique games, 12 in each family and 83 source URLs**, with valid schema fields and URL syntax. These checks do not fetch the cited pages or establish the quality of the encoded movies.

[cinema-layout-check.json](cinema-layout-check.json) records the final source typography audit across **72 games, 467 chapters, 182 legend labels and 2,357 text lines**, sampled in **1,006 frames** at 1280 × 720. It checks the opening frame and each chapter's entrance and settled text positions. Captions occupy at most two lines; no measured overflow or glyph-ink collision remained, and the minimum gap between caption lines was **6.7 px**. All 12 recorded content and frame-source hashes match the frozen source. The audit measures actual font advances and glyph bounds, including fallback glyphs and SVG transforms. Advance widths omit kerning, and moving court geometry is outside this audit's scope.

[cinema-visual-check.json](cinema-visual-check.json) records **one representative action frame per game** from the final film source `94469dc718c7`, with reproducible sample times, image hashes and source fingerprints. All six family montages were visually reviewed. Of the 72 final PNGs, **71 are byte-identical to the reviewed samples**; Islands changed only the departing player's posture in this sample, affecting 1,495 pixels, and received a separate review of the final departure/arrival poses and encoded video at approximately 24 seconds. A decoded Noodle Keeper frame at approximately 25 seconds was also reviewed. All recorded source-file hashes and all 72 per-film fingerprints match the final source and manifest. This is sampled composition evidence, not exhaustive viewing of every chapter or complete movie.

[film-media-check.json](film-media-check.json) records successful decoding of **all 101,188 frames across 72 distinct MP4s**, covering **467 chapters**, **3,372.93333 seconds** (56 minutes 13 seconds rounded) and **102.03 MiB**. Every movie matches the 1280 × 720, 30 fps, H.264/yuv420p release, with fast-start metadata before the media stream; all 72 WebP posters match the video dimensions. The validator checks the final source revision `94469dc718c7`, each game's source fingerprint, exact authored chapter text/timing, frame counts, file sizes and durations. Unique SHA-256 hashes establish that each game has a distinct movie. Source provenance is checked again after decoding. This establishes media integrity and source consistency, not factual accuracy of every rule or visual clarity of every moment.

[cinema-motion-check.json](cinema-motion-check.json) measures **every decoded frame inside the court** across the same 72 movies, excluding the header, progress line and captions with an additional 8 px inset. Its movie hashes and source revision match the media audit. All 72 courts show motion: **101,033 distinct court frames out of 101,188 analyzed frames**, counted within each movie. Only **0.151% of adjacent frame pairs** were identical. The longest unchanged stretch was **0.267 seconds**, in Hoop Pass's ending; none of the **3,335 one-second sample windows** was unchanged. This confirms raster movement inside the court. Lines, labels or effects can contribute to those changes, so the measurements supplement the sampled composition review rather than establish that every demonstrated action is understandable.

The cinema UI's static audit found only neutral and steel/blue colour literals, removed three family-colour assignments from the player, and confirmed that the two entry pages remained equivalent with the same 41 element IDs. The player JavaScript passed a syntax check. A direct check of the caption-selection function confirmed first/last chapter text at frame zero, chapter boundaries and the film end.

[cinema-caption-layout-check.json](cinema-caption-layout-check.json) records an independent Firefox review of **all 467 chapter captions in its recorded source snapshot at both 360 × 640 and 320 × 568**. Long captions initially scrolled underneath the fixed controls. The corrected stage leaves **16 px of clearance** above the actual control boundary, preserves the caption's natural height and moves the keyboard hint clear of the reading area. Across both sizes, every title and explanation can be reached by scrolling, with no horizontal overflow; the final text glyph has at least **36.3 px clearance** above the controls at maximum scroll. This audit places compiled source captions in the actual player DOM and measures rendered geometry; it does not decode or validate the new films. Its CSS, timeline, lesson and font hashes still match the final source. The report retains its original HTML and JavaScript hashes; the final browser run below covers the later entry-page cache revisions and player changes.

The same browser review corrected overlapping next/replay buttons at 320 px by tightening the narrow-screen controls while retaining every button. Actual button rectangles now remain separated and inside the viewport. At **2560 × 1080** and **844 × 390**, automatic side margins correct the capped-width video's former left alignment. Screenshot pixel bounds place the displayed frame's center exactly at the viewport center in both cases. These positioning checks used retained V3 media and make no claim about the new films' appearance.

A byte comparison against V3 commit `e20f253` confirmed that **30 protected files** remain unchanged, including the field guide, atlas, PDF, print files, canonical data, original lessons, shared styles, demos, core helpers and fonts. Browser review also confirmed the dark rules and lineup dialogs stay within the phone viewport.

[cinema-v4-preview-check.json](cinema-v4-preview-check.json) records **51 passing checks** in an isolated headless Firefox profile against the V4 preview, with no console errors. Coverage includes playback controls, chapter and time links, the top navigator, dialogs, lineups, phone caption clearance, distinct narrow-screen controls, ultrawide centering and the preserved guide, atlas and print routes. This record has `smoke: true`: its 72-film catalogue count does not mean all 72 final movies were decoded. It precedes the final source freeze and remains preview evidence.

[cinema-browser-check.json](cinema-browser-check.json) records the **final local run: 55 passing checks**, `smoke: false`, in isolated headless Firefox against `http://127.0.0.1:8878/gamessss/`, with **no console errors**. All **72 final MP4s loaded and decoded** with matching dimensions and durations, using the same fingerprinted URLs as the player. It covers actual movement between decoded frames, pause stability, whole-game navigation, time and chapter seeking, transcripts, downloads, speed, full screen, dialog pause/resume, saved and reordered 72-game lineups, auto-next and its saved preference. Responsive checks include phone captions and scrolling at 360 × 640 and 320 × 568, separate narrow-screen button hit areas, compact desktop and ultrawide centering. The complete field guide, atlas and ordered print routes also pass. Final screenshots of the compact-desktop 24-second seek and phone caption were visually reviewed. This browser decode check establishes that each movie opens; the separate full media audit checks every encoded frame.

A final static publication review found no missing targets among **89 distinct HTML, CSS, module, literal fetch and generated-link references** resolved beneath `/gamessss/`; runtime data files and the preserved guide redirect were also included. Dynamic external citation URLs and movie payloads were outside this reference check; the final media audit covers all movie and poster files separately. The two player entry files remain identical. The unchanged GitHub Actions workflow publishes `dist/`, including `.nojekyll`; no previous hosting metadata, environment files or encoder temporary outputs appear in the tracked or publishable working-tree file list. The player requests a revalidated manifest and fingerprinted movie/poster URLs, and both entry pages version the cinema CSS and JavaScript.

No V3 test count, frame total or playback result below establishes V4 quality. The current report files may be replaced by new runs; the V3 links below point to its saved Git commit so that historical evidence remains reproducible. All timestamps in JSON records are UTC.

### Production verification

**Pending publication and verification on GitHub Pages.** The source, full media decode, court-motion measurement, sampled visual review and final local browser checks above are complete. Deployment status and checks against the public URL will be recorded after publication.

## V3 — historical first film player, 15 November 2026

That release introduced native MP4 video playback on the homepage and `presentation.html`, a top category navigator and chapter transcripts. Its source, layout, full media and browser checks passed. The records linked here are preserved at commit [e20f253](https://github.com/mteyra/gamessss/commit/e20f2531d629fc0213e88fe46cebf73ab7a24e4c); this section uses Europe/Berlin dates.

### Completed evidence

- **23 unit tests passed**, covering core behaviour, motion, film composition and film timelines. The timeline checks cover all 72 lessons and **467 chapters**, including ordering, chapter boundaries, reading time, settled holds, deterministic seeking and motion endpoints. These checks exercise the authored source and renderer, not every finished MP4.
- [cinema-layout-check.json](https://github.com/mteyra/gamessss/blob/e20f2531d629fc0213e88fe46cebf73ab7a24e4c/research/cinema-layout-check.json) records a source-layout audit across **72 games, 467 chapters, 1,744 text lines and 182 legend labels** at 1280 × 720. Captions used at most two lines; no measured overflows remained. The recorded frame-source hash matched the reviewed V3 source. Font advance measurements omit kerning and do not inspect actor text inside the court.
- The same record documents visual review of **one representative action or scoring frame per game** in six family contact sheets, with suspect details rechecked at full resolution. Corrections cover Money Ball's opening title, missing symbol/macron glyphs, Jianzi's rule label and Capture the Flag's holding-area labels. This is sampled composition evidence; it does not establish complete playback quality for all films.
- [film-media-check.json](https://github.com/mteyra/gamessss/blob/e20f2531d629fc0213e88fe46cebf73ab7a24e4c/research/film-media-check.json) records successful decoding of **all 102,622 frames across 72 distinct MP4s**. The films totalled **71 minutes 16 seconds**, **467 chapters** and **64.92 MiB**. Every film was 1280 × 720, 24 fps, H.264/yuv420p, with fast-start metadata; every poster was a matching 1280 × 720 WebP. The audit compared frame counts, duration, chapter text and timing with the authored source, checked file sizes and recorded a unique SHA-256 digest for every movie. It validates media integrity and source consistency, not the factual accuracy of every rule.
- [cinema-browser-check.json](https://github.com/mteyra/gamessss/blob/e20f2531d629fc0213e88fe46cebf73ab7a24e4c/research/cinema-browser-check.json) records **50 passing checks** in an isolated headless Firefox profile, with no console errors, against `http://127.0.0.1:8878/gamessss/`. **All 72 MP4s loaded and decoded in the browser** with matching dimensions and durations. Interaction coverage includes visible movement between decoded frames, pause stability, whole-game navigation, seeking, transcripts, downloads, speed, full screen, dialog pause/resume, saved selections, preservation of a reordered 72-game selection and auto-next. It also checks the top navigator, alias search, time links, atlas and print links, plus layouts at 1440 × 900, 1280 × 720, 390 × 844 and 360 × 640. The earlier [46-check smoke run](https://github.com/mteyra/gamessss/blob/e20f2531d629fc0213e88fe46cebf73ab7a24e4c/research/cinema-smoke-check.json), made with seven indexed films, is retained separately.
- An independent static audit resolved **99 HTML, CSS, module, fetch, generated-link and then-completed film references** beneath the GitHub project prefix `/gamessss/`, with no missing targets or references escaping that prefix. The preserved `/field-guide/` alias also passed query-string and fragment redirect checks.
- The field guide retains its original content and script; its only HTML change is the navigation label from “Learn games” to “Watch games.” The **72-page PDF is unchanged** from the retained print edition. Its prior text-extraction and layout evidence remains recorded under V1 below. The full browser pass confirms all 72 field-guide entries and ordered print output still work.

### Historical publication

[GitHub Pages deployment 43655105803](https://github.com/mteyra/gamessss/actions/runs/43655105803) succeeded for website commit [9510397](https://github.com/mteyra/gamessss/commit/9510397a3d0b61521e06d6958798ded2f7a55250). The live URL is **https://mteyra.github.io/gamessss/**.

[cinema-production-check.json](https://github.com/mteyra/gamessss/blob/e20f2531d629fc0213e88fe46cebf73ab7a24e4c/research/cinema-production-check.json) records a further **50 passing browser checks against that public URL**, including decoding all 72 films, the complete control suite and the preserved field-guide route, with no console errors. Independent HTTP reads returned byte-for-byte matches for `index.html`, the film manifest, `field-guide.html` and the complete PDF. A byte-range request for Islands returned HTTP 206, `video/mp4` and the requested 1,024 bytes, confirming streamed video delivery.

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
