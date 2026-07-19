# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal FastAPI app whose only job is to serve a static Three.js page locally. `main.py` is a thin static file server (no API endpoints, no database, no templates) — all actual behavior lives in the browser-side JS.

## Context Files

Read the following files for additional information.
* static/data/dimensions.md - Describes the contents of the dimensions.json file, providing common dimensions and tiling patterns needed by the program

## Commands

Install dependencies:
```
pip install -r requirements.txt
```

Run the server (auto-restarts on `.py` changes):
```
start_server.bat
```
or directly:
```
python -m uvicorn main:app --reload
```
Then browse to `http://127.0.0.1:8000`.

Run the unit tests (Node's built-in test runner; no dependencies to install):
```
run_tests.bat
```
or `npm test`, or `node --test`. Tests live in `tests/` and cover the pure domino logic.

Regenerate the offline bundle (only needed after changing `scene.js`, `structure_builder.js`, or any `static/data/**` file — see "Offline entry point" below):
```
build_offline.bat
```
or `npm run build`. Requires `npm install` first (installs `esbuild` and `three` as devDependencies).

There is no build step or linter for the main (server-served) app. The offline entry point is the one exception — see below.

## Architecture

- `main.py` — FastAPI app. Mounts `static/` at `/` (the whole directory tree is served from the URL root — e.g. `static/js/scene.js` is at `/js/scene.js`, `static/data/dimensions.json` is at `/data/dimensions.json`) and returns `static/index.html` at `/` (registered before the mount so the explicit route wins for the exact root path). Any new backend logic (API routes, etc.) would go here.
- `static/index.html` — page shell. Loads Three.js as an ES module directly from a CDN (jsdelivr) via an `importmap` — there is no bundler/npm build; a different Three.js version is changed by editing the importmap URL in this file.
- `static/js/scene.js` — all client-side scene logic (renderer, camera, lights, meshes, animation loop) as a single ES module imported by `index.html`. Also loads the JSON data model over HTTP (from `static/data/`, served under `/data/...`) and calls the builder to log a structure to the console.
- `static/js/structure_builder.js` — the pure, dependency-free domino generation logic (no THREE/DOM/fetch), imported by both `scene.js` and the tests, so the tests exercise the real shipping code.
- `static/data/` — the JSON data model (`dimensions.json`, `patterns/*.json`) and its schema docs (`dimensions.md`, `patterns.md`). Lives under `static/` so it's served by the same root mount with no separate route.

## Offline entry point (`static/index_click_this_one.html`)

Modern browsers block ES module (`<script type="module">`) loading *and* `fetch()` when
a page is opened via `file://` (a `file://` document gets a unique/opaque origin, so even
a same-folder module script or JSON file is refused as "cross-origin"). This means
`static/index.html` — which relies on both — only works when served over HTTP; it cannot
be double-clicked directly. `static/index_click_this_one.html` is a second, independent
entry point for that: it loads two plain classic `<script>` tags instead
(`dist/data.js` then `dist/bundle.js`), which are never subject to that restriction.

- `static/index.html` is never modified for this purpose — it stays exactly as the
  server-only entry point (ES modules, `fetch()`).
- `static/js/scene.js` has one small addition to support both paths from the same
  source: its two data-loading spots check `window.EMBEDDED_DOMINO_DATA` first (set by
  `dist/data.js` in the offline case) and fall back to `fetch()` otherwise (the normal,
  served case).
- `scripts/build.mjs` (run via `build_offline.bat` / `npm run build`) generates:
  - `static/dist/data.js` — every file under `static/data/` (auto-discovered, no manual
    list to maintain) embedded as `window.EMBEDDED_DOMINO_DATA`.
  - `static/dist/bundle.js` — `scene.js` + `structure_builder.js` + Three.js +
    `OrbitControls`, bundled by esbuild into one self-contained classic script. A small
    resolve-alias plugin in the build script maps the existing
    `three/addons/controls/OrbitControls.js` import (a CDN-only shorthand) to the real
    npm export path (`three/examples/jsm/...`) purely at bundle time, so neither
    `scene.js`'s import line nor `index.html`'s importmap needs to change for this.
- **`static/dist/` is committed to the repo** (not gitignored) so a fresh clone/download
  can open `index_click_this_one.html` immediately with no `npm install`/build step.
  This means it can go stale: **whenever `scene.js`, `structure_builder.js`, or any
  `static/data/**` file changes, re-run `build_offline.bat` and commit the regenerated
  `static/dist/` output.** Nothing enforces this automatically (no CI) — it's a manual
  step to remember.

## Reload behavior (important, easy to get wrong)

- `--reload` only watches `.py` files, so editing `main.py` restarts the server automatically.
- Editing files under `static/` (HTML/JS) needs no server restart — `StaticFiles`/`FileResponse` read from disk on every request.
- Neither case auto-refreshes the browser. A manual reload (or hard refresh, if a static asset seems stale/cached) is always required to see changes.
