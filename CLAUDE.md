# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal FastAPI app whose only job is to serve a static Three.js page locally. `main.py` is a thin static file server (no API endpoints, no database, no templates) — all actual behavior lives in the browser-side JS.

## Context Files

Read the following files for additional information.
* data/dimensions.md - Describes the contents of the dimensions.json file, providing common dimensions and tiling patterns needed by the program

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

There is no build step or linter in this repo.

## Architecture

- `main.py` — FastAPI app. Mounts `static/` at `/static` and returns `static/index.html` at `/`. Any new backend logic (API routes, etc.) would go here.
- `static/index.html` — page shell. Loads Three.js as an ES module directly from a CDN (jsdelivr) via an `importmap` — there is no bundler/npm build; a different Three.js version is changed by editing the importmap URL in this file.
- `static/js/scene.js` — all client-side scene logic (renderer, camera, lights, meshes, animation loop) as a single ES module imported by `index.html`. Also loads the JSON data model over HTTP and calls the builder to log a structure to the console.
- `static/js/structure_builder.js` — the pure, dependency-free domino generation logic (no THREE/DOM/fetch), imported by both `scene.js` and the tests, so the tests exercise the real shipping code.

## Reload behavior (important, easy to get wrong)

- `--reload` only watches `.py` files, so editing `main.py` restarts the server automatically.
- Editing files under `static/` (HTML/JS) needs no server restart — `StaticFiles`/`FileResponse` read from disk on every request.
- Neither case auto-refreshes the browser. A manual reload (or hard refresh, if a static asset seems stale/cached) is always required to see changes.
