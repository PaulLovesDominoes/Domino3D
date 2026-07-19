import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  parseCell,
  chooseXSequence,
  buildDominoStructure,
  dominoToPrism,
} from "../static/js/structure_builder.js";

// Load the real data-model fixtures from disk (no server needed).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const dimensions = readJson("data/dimensions.json");
const wall = readJson("data/patterns/wall.json");

test("parseCell splits position and rotation, defaulting rotation to 0", () => {
  assert.deepEqual(parseCell("standing:90"), { position: "standing", rotation: 90 });
  assert.deepEqual(parseCell("sideways"), { position: "sideways", rotation: 0 });
  assert.deepEqual(parseCell("standing:-180"), { position: "standing", rotation: -180 });
});

test("chooseXSequence follows the wall's next rules to an end tile", () => {
  assert.deepEqual(chooseXSequence(wall, "start-back", 3), [
    "start-back",
    "middle-front",
    "end-front",
  ]);
});

test("wall 3x2x1 produces the expected total number of dominoes", () => {
  const { dominoes } = buildDominoStructure(dimensions, wall, "start-back", 3, 2, 1);
  assert.equal(dominoes.length, 24);
});

test("first tile (start-back) dominoes have the expected placements", () => {
  const { dominoes } = buildDominoStructure(dimensions, wall, "start-back", 3, 2, 1);
  // Covers: first-domino origin at (0,0,0); the specific occupied cells;
  // strides X/Z = 40.5 and Y = 24; negative Z toward the back; rotations.
  assert.deepEqual(dominoes.slice(0, 5), [
    { x: 0, y: 0, z: 0, position: "sideways", rotation: 90 },
    { x: 0, y: 24, z: 0, position: "standing", rotation: 90 },
    { x: 0, y: 24, z: -40.5, position: "sideways", rotation: 0 },
    { x: 0, y: 48, z: -40.5, position: "standing", rotation: 0 },
    { x: 0, y: 72, z: 0, position: "sideways", rotation: 0 },
  ]);
});

test("distinct coordinates reflect Y-course offset and X stride", () => {
  const { dominoes } = buildDominoStructure(dimensions, wall, "start-back", 3, 2, 1);
  const sortedUnique = (vals) => [...new Set(vals)].sort((a, b) => a - b);
  // Two Y courses of 4 cells each, second offset by 4*24 = 96mm.
  assert.deepEqual(
    sortedUnique(dominoes.map((d) => d.y)),
    [0, 24, 48, 72, 96, 120, 144, 168]
  );
  // Three tiles wide, cell stride 40.5 in X.
  assert.deepEqual(sortedUnique(dominoes.map((d) => d.x)), [0, 40.5, 81]);
});

test("depth does not repeat: Z tiles clamp to 1 with a warning", () => {
  const result = buildDominoStructure(dimensions, wall, "start-back", 3, 2, 2);
  assert.equal(result.countZ, 1);
  assert.ok(
    result.warnings.some((w) => /repeat in Z/i.test(w)),
    `expected a depth-repeat warning, got: ${JSON.stringify(result.warnings)}`
  );
});

test("an invalid start tile returns an error and no dominoes", () => {
  const result = buildDominoStructure(dimensions, wall, "bogus", 1, 1, 1);
  assert.ok(result.error);
  assert.equal(result.dominoes.length, 0);
});

// Compare a {x,y,z} point to an expected one within a tolerance (rotating by 90°
// introduces ~1e-16 floating-point dust).
function closeToXYZ(actual, expected, eps = 1e-9) {
  for (const k of ["x", "y", "z"]) {
    assert.ok(
      Math.abs(actual[k] - expected[k]) < eps,
      `${k}: expected ~${expected[k]}, got ${actual[k]}`
    );
  }
}

test("dominoToPrism: standing, no rotation, pivot at origin", () => {
  const p = dominoToPrism({ x: 0, y: 0, z: 0, position: "standing", rotation: 0 }, dimensions, "standard");
  assert.deepEqual(p.size, { x: 24, y: 48, z: 7.5 });
  closeToXYZ(p.position, { x: 8.25, y: 24, z: 0 });
  assert.equal(p.rotationY, 0);
});

test("dominoToPrism: standing rotated 90 reproduces the patterns.md example", () => {
  // Pivot at (3.75,0,3.75) puts the unrotated box corner at the scene origin.
  const p = dominoToPrism({ x: 3.75, y: 0, z: 3.75, position: "standing", rotation: 90 }, dimensions, "standard");
  assert.deepEqual(p.size, { x: 24, y: 48, z: 7.5 });
  closeToXYZ(p.position, { x: 3.75, y: 24, z: -4.5 });
  assert.equal(p.rotationY, 90);
  // Box (centered) after 90° has X-extent 7.5, Z-extent 24 -> X[0,7.5], Z[-16.5,7.5].
  assert.ok(Math.abs(p.position.x - p.size.z / 2 - 0) < 1e-9); // min X = 0
  assert.ok(Math.abs(p.position.z - p.size.x / 2 - -16.5) < 1e-9); // min Z = -16.5
});

test("dominoToPrism: sideways and flat sizes/placement", () => {
  const s = dominoToPrism({ x: 0, y: 0, z: 0, position: "sideways", rotation: 0 }, dimensions, "standard");
  assert.deepEqual(s.size, { x: 48, y: 24, z: 7.5 });
  closeToXYZ(s.position, { x: 20.25, y: 12, z: 0 });

  const f = dominoToPrism({ x: 0, y: 0, z: 0, position: "flat", rotation: 0 }, dimensions, "standard");
  assert.deepEqual(f.size, { x: 48, y: 7.5, z: 24 });
  closeToXYZ(f.position, { x: 20.25, y: 3.75, z: 8.25 });
});
