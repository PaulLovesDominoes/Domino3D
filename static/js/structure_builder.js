// ---------------------------------------------------------------------------
// Domino structure generation — pure logic
//
// This module has no dependencies on Three.js, the DOM, or fetch, so it can be
// imported both by the browser scene (static/js/scene.js) and by the Node test
// suite (tests/structure_builder.test.js). Callers pass already-parsed JSON
// (dimensions + pattern); this module only computes.
// ---------------------------------------------------------------------------

// Parse a layout cell spec like "standing:90" or "sideways" into its parts.
// A missing rotation defaults to 0 degrees.
export function parseCell(spec) {
  const [position, rot] = spec.split(":");
  return { position, rotation: rot === undefined ? 0 : Number(rot) };
}

// Turn a `next` entry for one axis into a plain array of candidate tile names.
//   null   -> []            (no tile allowed / end of structure in this axis)
//   "any"  -> every tile type name
//   "name" -> ["name"]
//   [...]  -> the list unchanged
export function candidateTiles(nextEntry, tileTypes) {
  if (nextEntry === null || nextEntry === undefined) return [];
  if (nextEntry === "any") return Object.keys(tileTypes);
  if (Array.isArray(nextEntry)) return nextEntry;
  return [nextEntry];
}

// Build the left-to-right (X) sequence of tile types, starting from `startTile`
// and following each tile's `next` rule (index 0 is the +X neighbour). The last
// tile must be an "end" tile (its own next[0] is null); earlier tiles must be
// continuing tiles (next[0] not null). Any anomalies are appended to `warnings`.
export function chooseXSequence(pattern, startTile, count, warnings = []) {
  const tileTypes = pattern.tile_types;
  const seq = [startTile];
  for (let i = 1; i < count; i++) {
    const prev = tileTypes[seq[i - 1]];
    const candidates = candidateTiles(prev.next[0], tileTypes);
    if (candidates.length === 0) {
      warnings.push(
        `No tile can follow "${seq[i - 1]}" in +X; stopping the sequence early at ${i} of ${count} tiles.`
      );
      break;
    }
    const isLast = i === count - 1;
    const wantEnd = (name) => tileTypes[name].next[0] === null;
    let chosen = candidates.find((name) => (isLast ? wantEnd(name) : !wantEnd(name)));
    if (chosen === undefined) {
      chosen = candidates[0];
      warnings.push(
        `No ${isLast ? "end" : "continuing"} tile among [${candidates.join(", ")}] after "${seq[i - 1]}"; falling back to "${chosen}".`
      );
    }
    seq.push(chosen);
  }
  return seq;
}

// Compute the list of dominoes for a structure. Pure: no I/O, no logging.
//   dimensions - parsed data/dimensions.json
//   pattern    - parsed data/patterns/<type>.json
//   startTile  - one of the pattern's start_tiles
//   tilesX/Y/Z - integer tile counts per axis
// Returns { error, warnings, sequence, countX, countY, countZ, dominoes }.
export function buildDominoStructure(dimensions, pattern, startTile, tilesX, tilesY, tilesZ) {
  const warnings = [];
  const fail = (error) => ({
    error,
    warnings,
    sequence: [],
    countX: 0,
    countY: 0,
    countZ: 0,
    dominoes: [],
  });

  if (!pattern.start_tiles.includes(startTile)) {
    return fail(
      `Start tile "${startTile}" is not valid. Allowed: ${pattern.start_tiles.join(", ")}`
    );
  }

  const cell = dimensions.cell_types[pattern.cell_type];
  if (!cell) {
    return fail(`Cell type "${pattern.cell_type}" not found in dimensions.`);
  }

  // Spacing between neighbouring cell origins = cell size minus its overlap.
  const stride = {
    x: cell.width.size - cell.width.overlap,
    y: cell.height.size - cell.height.overlap,
    z: cell.depth.size - cell.depth.overlap,
  };
  const tileCells = {
    x: pattern.tile_size.width.cells,
    y: pattern.tile_size.height.cells,
    z: pattern.tile_size.depth.cells,
  };

  // Honour the per-axis repeat flag: an axis that cannot repeat is 1 tile.
  const clamp = (requested, repeat, axis) => {
    if (repeat !== "no") return requested;
    if (requested > 1) {
      warnings.push(
        `Pattern does not repeat in ${axis}; clamping ${requested} tiles to 1.`
      );
    }
    return 1;
  };
  const countX = clamp(tilesX, pattern.tile_size.width.repeat, "X");
  const countY = clamp(tilesY, pattern.tile_size.height.repeat, "Y");
  const countZ = clamp(tilesZ, pattern.tile_size.depth.repeat, "Z");

  const sequence = chooseXSequence(pattern, startTile, countX, warnings);

  const dominoes = [];
  for (let tileY = 0; tileY < countY; tileY++) {
    for (let tileZ = 0; tileZ < countZ; tileZ++) {
      for (let tileX = 0; tileX < countX; tileX++) {
        const layout = pattern.tile_types[sequence[tileX]].layout; // [X][Y][Z]
        for (let lx = 0; lx < tileCells.x; lx++) {
          for (let ly = 0; ly < tileCells.y; ly++) {
            for (let lz = 0; lz < tileCells.z; lz++) {
              const spec = layout[lx][ly][lz];
              if (spec === null) continue; // empty cell, no domino
              const { position, rotation } = parseCell(spec);
              // global cell index = tileIndex * cellsPerTile + local cell index
              const gx = tileX * tileCells.x + lx;
              const gy = tileY * tileCells.y + ly;
              const gz = tileZ * tileCells.z + lz;
              dominoes.push({
                x: gx * stride.x,
                y: gy * stride.y,
                // depth extends toward the back (−Z); avoid a signed -0 for the front row
                z: gz === 0 ? 0 : -(gz * stride.z),
                position,
                rotation,
              });
            }
          }
        }
      }
    }
  }

  return { error: null, warnings, sequence, countX, countY, countZ, dominoes };
}

// Convert a single domino record from buildDominoStructure — {x,y,z,position,rotation}
// where (x,y,z) is the scene location of the domino's origin/pivot point — into the
// parameters needed to create the rectangular prism in Three.js.
//
// Returns { size, position, rotationY }:
//   size      - {x,y,z} box dimensions -> new THREE.BoxGeometry(size.x, size.y, size.z)
//   position  - {x,y,z} world position of the box CENTER -> mesh.position.set(...)
//   rotationY - rotation in DEGREES about Y -> mesh.rotation.y = degToRad(rotationY)
//
// Three.js BoxGeometry is centered on the mesh origin, so we place the mesh at the box
// center. The center is the local box center offset from the pivot, rotated about the
// vertical axis through the pivot, then translated to the domino's scene location.
export function dominoToPrism(domino, dimensions, cellType) {
  const dom = dimensions.domino;
  const mapping = dom.positions[domino.position];
  if (!mapping) {
    throw new Error(`Unknown domino position "${domino.position}".`);
  }
  const cell = dimensions.cell_types[cellType];
  if (!cell) {
    throw new Error(`Unknown cell type "${cellType}".`);
  }

  // Map the position's "w,h,d" letters onto XYZ box dimensions.
  const dims = { w: dom.width, h: dom.height, d: dom.depth };
  const [ax, ay, az] = mapping.split(",");
  const size = { x: dims[ax], y: dims[ay], z: dims[az] };

  // Pivot (domino origin) offset from the box's minimum corner.
  const [ox, oy, oz] = cell.domino_origin;

  // Box center relative to the pivot.
  const cRel = {
    x: size.x / 2 - ox,
    y: size.y / 2 - oy,
    z: size.z / 2 - oz,
  };

  // Rotate the relative center about the vertical (Y) axis through the pivot.
  const theta = (domino.rotation * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const center = {
    x: domino.x + (cRel.x * cos + cRel.z * sin),
    y: domino.y + cRel.y,
    z: domino.z + (-cRel.x * sin + cRel.z * cos),
  };

  return { size, position: center, rotationY: domino.rotation };
}
