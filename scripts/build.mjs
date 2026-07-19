// Generates the offline bundle used by static/index_click_this_one.html:
//   static/dist/data.js   - all JSON data pre-embedded as a global (no fetch() needed)
//   static/dist/bundle.js - scene.js + structure_builder.js + Three.js + OrbitControls,
//                           bundled into one self-contained classic script
//
// Run via build_offline.bat or `npm run build`. Re-run (and commit the result) whenever
// scene.js, structure_builder.js, or any static/data/** file changes.

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const root = process.cwd();
const dataDir = path.join(root, "static/data");
const distDir = path.join(root, "static/dist");

mkdirSync(distDir, { recursive: true });

// --- 1. Embed all JSON data as a global, keyed the same way scene.js already expects. ---
const dimensions = JSON.parse(readFileSync(path.join(dataDir, "dimensions.json"), "utf8"));

const patternFiles = readdirSync(path.join(dataDir, "patterns")).filter((f) => f.endsWith(".json"));
const patterns = {};
for (const file of patternFiles) {
  const name = file.replace(/\.json$/, "");
  patterns[name] = JSON.parse(readFileSync(path.join(dataDir, "patterns", file), "utf8"));
}

const dataJs = `window.EMBEDDED_DOMINO_DATA = ${JSON.stringify({ dimensions, patterns }, null, 2)};\n`;
writeFileSync(path.join(distDir, "data.js"), dataJs);
console.log(`Wrote static/dist/data.js (dimensions + ${patternFiles.length} pattern(s): ${Object.keys(patterns).join(", ")})`);

// --- 2. Bundle scene.js (+ its imports) into one classic, non-module script. ---
// The existing "three/addons/..." import is the CDN-only shorthand; the real npm
// package only exports "./examples/jsm/*", so resolve that specifier to
// node_modules/three/examples/jsm/... here, at bundle time only. Neither scene.js's
// import line nor index.html's importmap needs to change for this.
const threeAddonsAlias = {
  name: "three-addons-alias",
  setup(build) {
    build.onResolve({ filter: /^three\/addons\// }, (args) => ({
      path: path.join(root, "node_modules/three/examples/jsm", args.path.replace(/^three\/addons\//, "")),
    }));
  },
};

await esbuild.build({
  entryPoints: [path.join(root, "static/js/scene.js")],
  outfile: path.join(distDir, "bundle.js"),
  bundle: true,
  format: "iife",
  plugins: [threeAddonsAlias],
});
console.log("Wrote static/dist/bundle.js");
