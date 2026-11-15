# GAMESSSS

**72 animated films about physical group games, across six families.** Watch an example unfold from setup to play, with movement, rule consequences and outcomes shown on the court. It starts with the games you might only discover through a particular gym teacher—Islands, Manhunt, Flunkyball, unexpected dodgeball variations—and keeps exploring.

[Watch on GitHub Pages](https://mteyra.github.io/gamessss/) · [GitHub source](https://github.com/mteyra/gamessss) · [Field guide](https://mteyra.github.io/gamessss/field-guide/) · [Browse the atlas](https://mteyra.github.io/gamessss/atlas.html) · [Complete research report](dist/research-report.md)

Each game is an actual, downloadable **MP4 film** with five to seven authored chapters. The **V4 design** turns **467 authored game states** into continuous animation: movement spans each chapter, with no added pauses between chapters. The setup caption is visible from the first frame, and the final chapter stays visible through the end. Players keep their identities, objects follow their routes, and short captions explain what changes. Captions are part of the video, so the silent films make sense without a presenter or audio.

The video fills a dark player with crisp white type, muted steel controls and a restrained blue playback highlight. A compact category tag at the top opens the game navigator; controls recede during playback. Skip whole games with the arrow keys, seek within a film, or open its chapter transcript. The original field guide retains its own design and remains available for the complete rules, adaptations and sources.

This is a curated collection with playable introductions and meaningful variations. It does not claim to contain every game worldwide or rank the “best” games.

**Run locally**

Requires **Node.js 22+ with npm** and **Python 3** for the commands below. The committed `dist/` directory includes the finished films and needs no build step or installed npm dependencies to serve.

```sh
npm start
```

Open **http://127.0.0.1:8879**. Serve the files over HTTP; opening `index.html` directly from the filesystem will prevent the game-data requests from working reliably.

```sh
npm run check    # Validate canonical game data and source URL syntax
npm test         # Check core behaviour, motion, film rendering and film timelines
npm run report   # Regenerate the research report from current game data
npm run check-films  # Decode every frame and validate all 72 MP4s and posters
npm run check-film-layout  # Measure all film captions and legends
npm run check-film-motion  # Measure decoded motion inside the court
```

Media, layout and motion validation use the authoring dependencies listed under **Generate the films**; serving the committed website does not require them.

The website uses static HTML, CSS, JavaScript modules, JSON, MP4 films and WebP posters. Film generation is a separate, optional authoring step described below.

**Learn, choose, take it outside**

- **Films:** native HTML video playback, a seek bar, replay, playback speed and full screen. The next game can start automatically when a film ends; this preference is in the help dialog.
- **Chapters and captions:** open the transcript to read every chapter, jump directly to one, or download the current MP4. Films have embedded captions, and the player also provides a live text caption for small screens.
- **Pace:** pause at any point to inspect a rule or movement. Reduced-motion preferences start the player paused; opening a navigator or rules dialog also pauses playback.
- **Navigator and atlas:** click the category tag or press **G** to open the searchable navigator. The separate [atlas](dist/atlas.html) searches names, aliases, places and equipment, and filters by family, group size, available space and no-equipment options. Each card opens its film.
- **Lineup:** save favourites, open **Your lineup**, reorder games, then watch the selection, print it or download the rules as text. The order is saved in this browser. A link containing game IDs preserves the order independently of browser storage.
- **Print:** download the [complete 72-page PDF](dist/gamessss-field-guide.pdf), or print an ordered lineup with an option to hide illustrations. The browser’s print dialog can save a PDF.
- **Field guide:** [hosting notes and searchable sources](dist/field-guide.html), plus the approximately **21,000-word report** containing all 72 rulesets, methodology and the source index.

Film keyboard controls work outside text inputs, selectors and open dialogs. Space keeps its normal behaviour on focused buttons and links.

| Key | Action |
| --- | --- |
| Left / Right | Previous / next whole game |
| Space | Pause or play the film |
| J / L | Seek backward / forward 10 seconds |
| R | Restart the film |
| G | Open the category and game navigator |
| F | Toggle full screen |
| ? | Open controls and help |
| Escape | Close a dialog or leave full screen |

Useful URL forms, relative to the site root:

```text
/?game=islands
/presentation.html?game=kho-kho
/presentation.html?game=tchoukball&step=3
/presentation.html?game=islands&time=20
/presentation.html?games=islands,flunkyball,hoop-pass
/presentation.html?set=lineup
/atlas.html
/field-guide/
/print.html?games=islands,flunkyball,hoop-pass
/print.html?set=lineup
```

`index.html` and `presentation.html` open the same film player. `?game=` opens a game directly; `?step=` starts at an authored chapter, with setup numbered 1, and `?time=` starts at a number of seconds. Changing games updates the URL. `?games=` defines an ordered selection and starts at its first game. `?set=lineup` reads the browser’s saved selection. An empty or invalid selection falls back to the full library.

`/field-guide/` redirects to the preserved `field-guide.html`, carrying its query string and fragment. Both addresses work beneath the GitHub project path `/gamessss/`.

**Generate the films**

Serving the committed films does not need these tools. To regenerate them, install **Node.js 22+**, **Python 3**, and **ffmpeg/ffprobe with libx264 and libwebp**. Install the pinned rasterizer and font tools outside the website:

```sh
npm install --prefix /tmp/gamessss-film-deps @resvg/resvg-js@2.6.2 wawoff2@2.0.1
python3 -m pip install --target /tmp/gamessss-film-deps/python fonttools==4.60.1
```

`uv pip install --target /tmp/gamessss-film-deps/python fonttools==4.60.1` is an alternative for environments managed with uv.

```sh
npm run render-films -- --game=islands
npm run render-films -- --all --jobs=3
npm run render-films -- --game=islands,flunkyball --output=/tmp/game-previews
```

The default output is **1280 × 720, 30 fps, H.264 Main, yuv420p, CRF 20**, with fast-start metadata for streaming. Films are silent and captions are rendered into every relevant frame. The pipeline creates one MP4 and WebP poster per game in `dist/films/`, plus a version 2 `manifest.json` containing source fingerprints, encoding settings, durations, sizes and chapter timestamps/text.

The V4 timeline includes **1.1 seconds at the start and 1 second at the end** of the moving court scene, with the first and last chapter captions continuing through those intervals. It has no separate title or closing cards. Each chapter uses its full duration for the authored action, while preserving waits that explain a rule. The 72 source timelines total approximately **56 minutes 12 seconds before rounding to video frames**. The finished films total **56 minutes 13 seconds and 102.03 MiB**.

The renderer generates static weights from the bundled variable fonts, samples each game on an absolute timeline, rasterizes the SVG to raw RGBA frames and pipes them to ffmpeg. `ffprobe` checks codec, pixel format, dimensions, frame rate, frame count and duration before the manifest is updated atomically. Source and encoding fingerprints cover the renderer, fonts, game content and compiled lesson. Resuming reuses films only when those fingerprints and the actual movie, poster and chapter metadata remain valid. Changed content or settings trigger regeneration automatically; **`--force`** also replaces otherwise valid encodes.

`--game=` accepts comma-separated IDs. Other options include `--width=1280`, `--fps=30`, `--crf=20`, `--jobs=1` through `3`, and `--deps=/path/to/dependencies`. Width must be a multiple of 32. `--output=/tmp/game-previews` keeps experimental output separate from the release; `--stills=1,12,24` writes PNG frames at those times instead of encoding a movie. Preview times must fall within each selected film.

`GAME_FILM_DEPS`, `PYTHON`, `FFMPEG` and `FFPROBE` can override the corresponding paths. Keep generated dependencies and previews outside the repository; commit the finished release films and manifest with the authored changes.

**GitHub hosting**

Source lives in [mteyra/gamessss](https://github.com/mteyra/gamessss), and the deployment target is [mteyra.github.io/gamessss](https://mteyra.github.io/gamessss/). The [GitHub Actions workflow](.github/workflows/pages.yml) publishes the complete `dist/` directory through GitHub Pages when website files change on `main`, or when manually dispatched. Set the repository’s Pages source to **GitHub Actions**. The workflow publishes already generated assets; it does not encode films during deployment.

Relative asset links support the GitHub project path. `dist/.nojekyll` is included in the Pages artifact. Local environment files and previous hosting metadata are excluded from the repository.

The player revalidates the manifest and versions movie/poster requests with each film's source fingerprint. Returning visitors receive the rebuilt films instead of a cached earlier edition.

**Where things live**

| Path | Purpose |
| --- | --- |
| `dist/data/*.json` | Canonical game content: three files, 24 entries each |
| `dist/core.js` | Families, loading, search, storage and shared exports |
| `dist/index.html`, `presentation.html` | Two entry URLs for the same film player |
| `dist/cinema.js`, `cinema.css` | Video controls, routes, top navigator, transcripts and layout |
| `dist/films/` | Finished MP4 films, WebP posters and the chapter manifest |
| `dist/film-timeline.js` | Continuous chapter timing, film-specific labels and deterministic frame sampling |
| `dist/film-renderer.js` | Animated court composition, camera movement and motion emphasis |
| `dist/film-theme.js` | Dark film palette, separate from the preserved field-guide design |
| `dist/lesson-kit.js` | Shared SVG node helpers and colours |
| `dist/motion-engine.js` | Stable-object interpolation and movement tracks |
| `dist/lessons.js` | Combined lesson catalogue |
| `dist/lessons-chase-dodge.js` | 24 chase and dodge lessons |
| `dist/lessons-world-target.js` | 24 world and target lessons |
| `dist/lessons-team-together.js` | 24 team and cooperative lessons |
| `dist/atlas.html`, `atlas.js` | Filterable illustrated catalogue |
| `dist/dialogs.js` | Complete rules and lineup management |
| `dist/visuals.js` | SVG field sketches |
| `dist/print.*`, `field-guide.*`, `field-guide/index.html` | Printable rules, preserved editorial companion and its URL alias |
| `tools/render-films.mjs` | Reproducible film encoding, font preparation and media validation |
| `tools/film-frame.mjs` | Complete frame assembly, captions and film typography |
| `tools/validate-data.mjs` | Catalogue validation and report generation |
| `.github/workflows/pages.yml` | Publish the static website to GitHub Pages |
| `research/` | Schema, animation contract, source reviews and verification evidence |

**Editing and adding games**

Read [research/SCHEMA.md](research/SCHEMA.md), then edit the relevant JSON file. This data is the authority for the rules. Keep IDs stable: bookmarks, lessons and saved lineups use them. Each game needs a clear objective, setup, four or five written rule steps, scoring or ending, restart rules, an interesting twist, a practical access note and observed source URLs.

Read [research/ANIMATION-CONTRACT.md](research/ANIMATION-CONTRACT.md) before authoring or changing its lesson. Each game needs five to seven complete visual states in the appropriate lesson module. These states define the action's endpoints; the V4 film compiler supplies the continuous chapter timing. Preserve object IDs across states; tracks must start at the preceding coordinates and finish at the new coordinates. Captions and visual consequences must agree with the canonical rules. Keep setup, roles, possession, scoring and resets understandable without spoken explanation.

Use an existing `diagram` category for the companion field sketch, or add a specific illustration in `visuals.js`. The static sketch and animated example should describe the same game.

Run `npm run check`, `npm test` and `npm run report` after content changes. Check typography with `npm run check-film-layout`; this requires the static fonts prepared by the film renderer. Regenerate the affected films, then run `npm run check-films` and `npm run check-film-motion` against the completed release. Review full playback, captions, chapter transitions, rules, atlas cards and print pages in a browser. Source fingerprints prevent a stale encode from passing the media audit. The validator enforces this edition’s 72-game / 12-per-family scope. To expand it, update those checks and visible totals, including this README and the field guide; add a matching authored lesson and render its film. Add a new data file to `loadGames()` and the validator’s file list if needed.

The downloadable PDF is a saved print edition. Regenerate it from `print.html` after changing rules; use A4, 14 mm margins, background graphics and no browser headers/footers.

**Verification**

**All 72 V4 films passed full media validation: 101,188 frames decoded successfully.** The revised source passed **35 unit tests** and catalogue validation for **72 games and 83 source URLs**. The film typography audit covered all **467 chapters**, measuring **2,357 text lines across 1,006 sampled frames**, with no measured overflow. One representative composition per game was visually reviewed.

The court-motion audit analyzed every frame and found motion in all 72 films, with no unchanged one-second samples; the longest unchanged stretch was **0.267 seconds**. The final browser suite passed **55 checks locally and 55 against the published GitHub Pages site**, including loading and decoding every film with matching dimensions and durations, without console errors. Public release-file hashes and byte-range video delivery also passed. [research/QA.md](research/QA.md) records each check's scope, the deployment and historical V3 evidence.

`npm test` runs all `tools/*.test.mjs`, including checks for film rendering and timelines. Encoding additionally validates the actual MP4 streams with `ffprobe`. `npm run check-films` decodes every frame, checks the 72-film release format and source fingerprints, compares chapter text and timing with the authored scenes, verifies fast-start headers and posters, and writes `research/film-media-check.json`. Browser playback is checked separately.

`npm run check-film-layout` measures film headers, legends, chapter titles and captions using the prepared fonts, including glyph bounds and entrance offsets. Its scope excludes moving objects inside the court. `npm run check-film-motion` analyzes decoded pixels inside the court, excluding the header and captions, and reports unchanged runs and one-second differences. Pixel movement alone does not prove that a rule is clear; visual review remains necessary.

`npm run browser-check` runs the cinema-specific browser suite in `tools/cinema-browser-check.mjs` against a locally served site and its configured browser endpoint. Review real playback as well as controls, routing, dialogs, small-screen captions and chapter seeking. Results for the earlier click-through learner remain historical; they do not count as verification of the film player.

**Evidence and editorial conventions**

Each entry cites its sources and identifies its version as **Documented game**, **Starter rules** or **House adaptation**. Research favours governing bodies, educators, cultural organisations and community practitioners. Descriptions are original summaries; house adaptations identify what was changed and cite the parent game where applicable. Flunkyball’s playable token relay, for example, is an explicitly designed alcohol-free adaptation of the bottle-and-reset game.

Country and region labels describe associations, not proven places of invention. Player ranges, ages, durations, energy and space categories are hosting suggestions. Some groups need equal teams, partners or rotation; the setup gives the relevant detail. Local practices and formal competition rules may differ. The teaching adaptations are desk research and design, not claims of universal field testing.

The [source reviews](research/) record game-specific evidence. The [14 November 2026 link check](research/SOURCE-STATUS.md) observed **75 HTTP 200 responses out of 83 URLs**, seven HTTP 403 responses and one timeout. Those eight automated reads remain unverified by that pass; they were not classified as unavailable sources. HTTP 200 also does not validate the accuracy of a page. `npm run check` checks structure and URL syntax without making network requests.

**Credits**

The visual approach draws inspiration from the many interactive renditions in [Aloha Robotics](https://github.com/clschulzer/Aloha-Robotics-HH2.0). The playground design, SVG field sketches, authored game scenes and animated films were created for GAMESSSS.

The local **Manrope** and **JetBrains Mono** font files were reused from that repository. Their project credits and SIL Open Font License notices are retained in [dist/assets/fonts/LICENSES.txt](dist/assets/fonts/LICENSES.txt). The bundled **GAMESSSS Symbols** font is a renamed DejaVu Sans subset covering additional letters and diagram symbols; its [license and attribution](dist/assets/fonts/film-symbols-LICENSE.txt) are included beside the font. The renderer checks caption glyph coverage before encoding.

The films and diagrams are generated from this project’s authored scenes; no third-party photographs or videos are embedded. Game names and source links preserve the connection to the communities, educators and organisations whose play this atlas introduces.
