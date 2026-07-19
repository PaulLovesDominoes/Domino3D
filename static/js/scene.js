import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildDominoStructure, dominoToPrism } from "./structure_builder.js";

// Scene unit convention: 1 Three.js unit = 1 mm (the data model is already in mm).

const SURFACE_SIZE = 1500; // mm, the build surface is a square this wide/deep
const STRUCTURE_MARGIN = 100; // mm inset from the surface's front-left corner
const STRUCTURE_START_X = -(SURFACE_SIZE / 2) + STRUCTURE_MARGIN; // -650

const container = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  1,
  10000
);
camera.position.set(350, 300, 450);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Camera controls: orbit the camera around the scene; objects stay put.
// Right-drag = rotate, Shift+right-drag = pan, scroll wheel = zoom.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false; // immediate stop on release, no inertia
controls.enableZoom = true;     // scroll wheel zoom
controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,                   // left button does nothing
  MIDDLE: null,                 // wheel handles zoom; middle button unused
  RIGHT: THREE.MOUSE.ROTATE,    // right-drag rotates
};
controls.target.set(STRUCTURE_START_X + 75, 75, -50); // look toward where the structure is built
controls.update();


const light = new THREE.DirectionalLight(0xffffff, 4);
light.position.set(3, 3, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x808080, 4));

// Build surface: a 1500mm light-tan square at Y=0. X=0 is the square's middle; Z=0 is
// 100mm from the front (+Z) edge, so the front edge is at Z=+100 and the square extends
// back to Z=-1400, giving a center at (0, 0, -650).
const surfaceGeometry = new THREE.PlaneGeometry(SURFACE_SIZE, SURFACE_SIZE);
const surfaceMaterial = new THREE.MeshStandardMaterial({
  color: 0xe0d2b4,
  side: THREE.DoubleSide,
});
const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
surface.rotation.x = -Math.PI / 2; // lay the plane flat in the XZ plane (normal +Y)
surface.position.set(0, 0, STRUCTURE_MARGIN - SURFACE_SIZE / 2); // center Z = -650
scene.add(surface);

// All dominoes live in one group so they can be cleared and rebuilt together. A single
// shared material is reused across every domino mesh. The group is offset in X so the
// structure's local origin (its left edge, per patterns.md's construction convention)
// starts 100mm in from the surface's actual left edge, instead of at the surface's
// horizontal middle.
const dominoGroup = new THREE.Group();
dominoGroup.position.x = STRUCTURE_START_X;
scene.add(dominoGroup);
const dominoMaterial = new THREE.MeshStandardMaterial({ color: 0xf2efe6 });
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });

// Re-fit the canvas to its container. A ResizeObserver (rather than a window
// "resize" listener) also catches the form collapsing/expanding, which changes
// the container size without firing a window resize.
const resizeObserver = new ResizeObserver(() => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w === 0 || h === 0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
resizeObserver.observe(container);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// ---------------------------------------------------------------------------
// Domino structure generation (browser glue)
//
// The pure computation lives in structure_builder.js. Here we load the JSON
// model over HTTP, run the builder, and report the result to the console. For
// now nothing is rendered.
// ---------------------------------------------------------------------------

// Load the domino + cell dimensions once. This resolves to the parsed JSON.
const dimensionsPromise = fetch("/data/dimensions.json").then((r) => {
  if (!r.ok) throw new Error(`dimensions.json: HTTP ${r.status}`);
  return r.json();
});

// Fetch the model + pattern, run the builder, and log the result.
//   structureType - pattern name, e.g. "wall" (loads data/patterns/<name>.json)
//   startTile     - one of the pattern's start_tiles
//   tilesX/Y/Z    - integer tile counts per axis
async function runBuild(structureType, startTile, tilesX, tilesY, tilesZ) {
  let dimensions;
  let pattern;
  try {
    dimensions = await dimensionsPromise;
    const res = await fetch(`/data/patterns/${structureType}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pattern = await res.json();
  } catch (err) {
    console.error(`Could not load structure type "${structureType}":`, err);
    return;
  }

  const result = buildDominoStructure(
    dimensions,
    pattern,
    startTile,
    tilesX,
    tilesY,
    tilesZ
  );

  if (result.error) {
    console.error(`Cannot build "${structureType}": ${result.error}`);
    return;
  }
  result.warnings.forEach((w) => console.warn(w));
  console.log(
    `Structure "${structureType}" (start "${startTile}", tiles ${result.countX}×${result.countY}×${result.countZ}) — ${result.dominoes.length} dominoes:`
  );
  console.table(result.dominoes);
  renderDominoes(result.dominoes, dimensions, pattern.cell_type);
  return result.dominoes;
}

// Replace the on-screen dominoes with a freshly built set. Existing meshes (and their
// dark-grey border outlines) are removed and their geometries disposed (each domino has
// its own sized BoxGeometry/EdgesGeometry).
function renderDominoes(dominoes, dimensions, cellType) {
  for (const mesh of dominoGroup.children) {
    mesh.geometry.dispose();
    for (const child of mesh.children) child.geometry.dispose();
  }
  dominoGroup.clear();

  for (const domino of dominoes) {
    const prism = dominoToPrism(domino, dimensions, cellType);
    const geometry = new THREE.BoxGeometry(prism.size.x, prism.size.y, prism.size.z);
    const mesh = new THREE.Mesh(geometry, dominoMaterial);
    mesh.position.set(prism.position.x, prism.position.y, prism.position.z);
    mesh.rotation.y = THREE.MathUtils.degToRad(prism.rotationY);

    const border = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial);
    mesh.add(border); // inherits the mesh's position/rotation

    dominoGroup.add(mesh);
  }
}

// Wire the Build button to the form fields.
const buildBtn = document.getElementById("build-btn");
if (buildBtn) {
  const form = document.getElementById("controls");
  buildBtn.addEventListener("click", () => {
    const val = (name) => form.elements[name].value.trim();
    const count = (name) => {
      const n = parseInt(val(name), 10);
      if (!Number.isFinite(n) || n < 1) {
        console.warn(`Tile count "${name}" is empty or invalid; using 1.`);
        return 1;
      }
      return n;
    };
    runBuild(
      val("structureType"),
      val("startTileType"),
      count("tilesX"),
      count("tilesY"),
      count("tilesZ")
    );
  });
}
