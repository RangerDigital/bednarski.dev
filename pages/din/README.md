# DIN Mount Core

Parametric JavaScript geometry engine for 3D-printable adapters on **35 mm top-hat DIN rails**, plus the Nuxt page that drives it. The engine itself has no UI or Three.js dependency.

**Prototype, not a physically qualified product.** Numerical mesh verification does not establish fit, strength, retention, temperature performance or electrical suitability. Print a fit coupon first. Two retention styles are generated: a **screw-retained bar** (default) and an integral **cantilever snap clip** (`retention: 'snap'`), whose beam is strain-screened at design time and still needs a physical print test.

## Quick start

Node.js 22 or newer. The engine dependency is installed at the repository root, not in this folder:

```sh
# from the repository root
npm install
npm --prefix pages/din test
```

In your JavaScript application:

```js
import { createGenerator, PRESETS, toSTL } from './core.mjs';
const generator = await createGenerator(); // initialize once
const result = generator.generate({
  ...PRESETS.pcb4,
  width: 100,
  pitchX: 80,
  pitchY: 44,
  holeDiameter: 3.4,
  standoffHeight: 6,
});
const bytes = toSTL(result.printParts[0].mesh); // Uint8Array, main body
```

`generate()` is synchronous after initialization. Run it in a Worker for the UI. It returns independent typed arrays and releases its temporary WASM geometry, including when it fails. Do not rerun the WASM initializer for every slider event.

## Mechanical construction

The main part contains a solid plate, optional integral standoffs, through bores, and one or two fixed hooks on its underside. Each hook has a separate opposite retaining bar (`jaw-1`, and optionally `jaw-2`). Two M3 machine screws per bar pass through the plate into hex nuts inserted from the bar's exposed rear face. No printed threads or flexing latch are required.

The bar seats against the plate; the rail occupies a clearance pocket between the plate and the hooks. **Tightening the screws retains the bar, but does not clamp out rail sliding.** Add commercial DIN rail end stops as appropriate.

The snap variant (`retention: 'snap'`) replaces the bar with an integral paired-leaf mechanism. One or two stations sit beside the rail: a common anchor carries two parallel leaves 5 mm apart that support a rigid jaw, so the jaw translates outward with little rotation. The jaw ends in an inward retaining tooth that captures the opposite flange, a 45 degree ramp on the head cams the jaw outward during installation, and a narrow pull tab beyond the plate's +Y edge releases it. A fixed side wall carries a bearing shelf that takes the downward jaw reaction into the plate, and an outward travel stop limits intended movement. No screws or nuts are generated in this mode. `dimensions.snap` reports the design name, those dimensions, `strain`, `maxStrain`, `stopTravel`, `screenedStrain` and `releaseForceEstimateN` (bracketed for 1200 and 2200 MPa modulus assumptions). The engine rejects a screened stop strain above 3 percent, a tab reach outside 4 to 35 mm, and any station that does not fit the plate with room for its rigid support. The bearing shelf hangs `snapClearance` plus its own thickness below the leaves, so the top of the allowed range needs a 15 mm rail reference or a reduced flange, overlap and fit clearance. Snap parts print translated in Z only, so the flexure plane stays parallel to the bed and the plate, leaves and shelf need supports, unlike the screw variant, which prints on its X edge.

Lightening (`lightening: true`) cuts the plate through with rounded slots, saving roughly a third of the plate material. A solid border is kept at the plate edge, and material is kept around every bore and standoff, the hook and retaining-bar footprints, the clamp screw seats, and the snap anchor, side wall and travel stop. Slots run along the rail axis, so the suggested print orientations build them either as vertical channels that open onto both plate faces (main body standing on its X edge) or as plain through-holes (snap parts flat on the bed). Neither orientation has to bridge across a slot. The layout is derived, not stored: the free runs between the keep-out zones are split into slots of at most 22 mm with `ribWidth` of material left between them, so the pattern follows whatever plate, holes and clips you configure. `dimensions.lightening` reports the slot count and the removed volume.

Assembly:

1. Print the fit-coupon main body and bar. Confirm the rail's overall width and flange thickness with calipers; tune `fitClearance` if necessary.
2. Hook one edge of the actual metal rail under the fixed hook.
3. Put the retaining bar under the opposite rail lip. Insert the M3 nuts in its hex pockets, then install the M3 screws from the device side of the plate. Hold the nuts during initial assembly; the pockets are not closed cages.
4. Check secure capture and screw engagement without crushing the plastic. Use suitable fastening retention for the application.
5. Install the electronics. Confirm clearance to screw heads, component leads and all conductors, and to the rail behind the plate.

Default clamp hardware: **2 × M3 × 10 mm screws and 2 × M3 hex nuts per bar**, assuming ordinary approximately 2.4 mm thick M3 nuts. Measure your hardware. `result.hardware` provides the derived under-head screw-length range for modified thicknesses. This range assumes no washer; add its thickness if used. Hardware itself is not included in STL geometry.

Mounting bores for the electronics are **plain clearance holes**, not tapped holes. Supply suitable screws/nuts, or use the equipment's existing threaded mounting points. Threaded inserts and countersinks are not generated. Two-hole PSU mode assumes mounting holes on a **common face parallel to the rail**. Side-mounted, opposing-face, and noncoplanar holes need a different bracket design. Generic presets are not manufacturer-specific patterns.

## Coordinates and parameters

All dimensions are **millimetres**. X runs along the rail, Y across its 35 mm width, and +Z points toward the electronics. The plate is centered at X=Y=0. Its underside is Z=0; the plate top is `plateThickness`. A standoff's height is measured above the plate. STL carries no unit metadata: import as millimetres.

| Parameter                        | Purpose                                                          |     Default |
| -------------------------------- | ---------------------------------------------------------------- | ----------: |
| `width`, `height`                | Plate size along X and Y                                         |      90, 66 |
| `plateThickness`, `cornerRadius` | Solid plate and outside corner radius                            |        4, 3 |
| `lightening`, `slotWidth`, `ribWidth` | Through-slot plate lightening, open width and kept rib width |  false, 4, 2 |
| `pattern`                        | `rectangle`, `line-x`, `line-y`, or `custom`                     | `rectangle` |
| `pitchX`, `pitchY`               | Center-to-center hole separation, in 0.5 mm steps from 0.5       |      70, 44 |
| `holeDiameter`                   | Finished design diameter of mounting bore                        |         3.4 |
| `standoffHeight`                 | Height above plate; zero disables boss                           |           6 |
| `standoffWall`                   | Radial material around each bore/slot                            |           2 |
| `holes`                          | Arbitrary hole objects in custom mode; maximum 32                |        `[]` |
| `railWidth`                      | Measured rail width; allowed 34–36, intended TH35                |          35 |
| `railHeight`                     | Reference rail depth, 7.5 or 15; does not change lip capture     |         7.5 |
| `flangeThickness`                | Measured rail-lip thickness                                      |           1 |
| `fitClearance`                   | Clearance on each rail side and total added flange-gap height    |         0.3 |
| `hookOverlap`                    | Capture inward from each nominal rail edge                       |           2 |
| `hookDepth`                      | Total rearward hook/bar depth                                    |           6 |
| `clipCount`                      | One or two hook/bar stations                                     |           1 |
| `clipWidth`                      | Width of each station along rail                                 |          26 |
| `clipSpacing`                    | Center spacing along X for two stations                          |          50 |
| `clampHoleDiameter`              | Through bore for M3 clamp screws                                 |         3.4 |
| `retention`                      | `screw` (retaining bar) or `snap` (integral paired-leaf clip)    |     `screw` |
| `snapBladeThickness` | Snap mode: thickness of each paired leaf, allowed 0.8–1.6 | 1.2 |
| `snapFreeLength` | Snap mode: straight leaf length between the end fillets, allowed 24–40 | 28 |
| `snapClearance` | Snap mode: gap to the bearing shelf, allowed 0.3–0.6 | 0.4 |
| `nutAcrossFlats`, `nutDepth`     | M3 hex-pocket fit                                                |    5.8, 2.6 |
| `segments`                       | Cylinder facets, integer 32–128                                  |          64 |

The nominal flange pocket is `flangeThickness + fitClearance`. The illustrative rail is centered in this vertical clearance; each rail side has `fitClearance` lateral room. The hook overlap is measured from nominal rail edges, not from the outside of the clearance gap. `holeDiameter` and nut-pocket dimensions are actual modeled sizes, with no hidden printer compensation. Circular holes are polygonal approximations; at 64 facets a 3.4 mm bore has about 0.004 mm less inscribed diameter.

`LIMITS` exposes field ranges. `normalizeParameters(input)` applies defaults, resolves hole patterns and throws `ParameterError` with an `errors` array for invalid configurations. Derived constraints take precedence over individual ranges, so not every combination of values in `LIMITS` is valid. For example, two wide clips need sufficient plate width, and mounting holes need at least a diameter and wall's worth of separation from each other.

The `SNAP_PRESETS` export mirrors `PRESETS` with snap retention, including a wider 48 × 66 mm coupon sized for the paired flexure. `PRESETS` itself is unchanged, so screw-mode output stays byte-identical. `holes` only affects `pattern: 'custom'`.

### Custom holes and slots

```js
const result = generator.generate({
  ...PRESETS.custom,
  holes: [
    { x: -30, y: -20, diameter: 3.4, standoffHeight: 8 },
    { x: 30, y: 20, diameter: 4.5, slotLength: 10, slotAxis: 'x', standoffHeight: 3 },
  ],
});
```

`slotLength` is the **overall end-to-end length**, not the distance between arc centers. It must be at least the diameter. Bosses follow the slot's capsule footprint. Per-hole heights override the global standoff height. X and Y are measured from the plate center, not a corner. Standard patterns are centered; use custom coordinates for offsets.

The engine rejects insufficient plate-edge margins, overlapping mounting footprints, screw-head clearance conflicts, and bores too near the rail-hook/bar footprints. It allows an empty custom pattern for the fit coupon. It does not validate the complete electronics body, cables, tools, components, or the actual screw/nut envelopes. Standoffs may be low enough that clamp screw heads collide with equipment; warnings are returned rather than inventing equipment dimensions.

## Returned model

- `parts`: assembly-coordinate printable solids. Use these for the assembled 3D preview. Each has `name`, `quantity`, `mesh`, `volumeMm3`, `bounds`, and `triangles`.
- `printParts`: the same solids separately rotated for a **suggested** slicer orientation and moved onto Z=0. Each is a separate STL; do not concatenate them without arranging them on a bed. Bounds are in print coordinates.
- `reference`: an illustrative metal rail, exclusively for preview. **Never include it in the printed/exported adapter.** Its 24 mm internal web is schematic; actual vendor profiles differ.
- `parameters`, `resolvedHoles`, `dimensions`, `hardware`, `warnings`: information for form state, dimension overlays and assembly guidance.

A mesh is `{ positions: Float32Array, indices: Uint32Array }`, three position coordinates per vertex and three indices per triangle. Coordinates remain Z-up. Positions use mm; either keep Three.js scene units in mm or scale all geometry, cameras and grids consistently. For crisp flat shading, convert indexed geometry to non-indexed geometry before computing normals. For smooth cylinders with sharp feature edges, add an appropriate crease-normal implementation in the viewer.

```js
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(part.mesh.positions, 3));
geometry.setIndex(new THREE.BufferAttribute(part.mesh.indices, 1));
const flat = geometry.toNonIndexed();
flat.computeVertexNormals();
geometry.dispose();
```

Dispose of previous Three.js geometry/material resources after regeneration. The generator does not own your renderer.

## Browser / Vite integration

`worker.mjs` is a ready-to-integrate module worker, not a UI:

```js
const worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: 'module' });
worker.postMessage({ id: 1, action: 'generate', parameters: PRESETS.pcb4 });
worker.onmessage = ({ data }) => {
  if (!data.ok) {
    showErrors(data.errors);
    return;
  }
  // Use data.model.parts + optional data.model.reference in preview.
};
// Download one part:
worker.postMessage({ id: 2, action: 'stl', partName: 'main', parameters: PRESETS.pcb4 });
// On response: new Blob([data.bytes], { type: 'model/stl' }).
```

The worker imports `manifold-3d/manifold.wasm?url`, which Vite must emit as a local asset. Other bundlers should pass their emitted WASM URL to `createGenerator({ locateFile: () => wasmURL })`. No CDN, remote geometry service, or secret key is required. Serve over HTTP(S), not `file://`. Keep parameters as numbers, debounce edits, and ignore responses older than the most recently requested `id`. Generation errors must disable export of the _current_ configuration rather than silently downloading a stale mesh. `index.vue` and the `Din*` components in `components/` are the reference UI built on this contract; `core.mjs` and `worker.mjs` stay usable without them.

## Printing and verification

Use a material suited to actual load, heat and environment. PETG is a reasonable **fit-prototype** starting point; it is not a qualification for hot/heavy power supplies. Do not assume printed plastic provides electrical enclosure, protective earth, or mains insulation. Retain required equipment earthing and appropriate mounting safeguards. No load rating is claimed.

The suggested main-body orientation stands the plate on its X edge. **It requires a brim and supports for projecting hooks/standoffs and possibly horizontal bores.** Review the slicer layer preview. The retaining bar is placed on its plate-contact face; its lip recess may need support. A snap part is only translated in Z, so its flexure plane stays parallel to the bed; the plate, leaves and bearing shelf need support, and no support may sit in the moving clearances or across the 0.4 mm shelf gap. Orientation is a starting point, not support-free optimization. Export `parts` instead if you prefer to choose the orientation yourself. Start with a small fit coupon, then test the assembled adapter with representative load and operating temperature.

`npm test` independently parses exported binary STL and checks welded edge pairing, face winding, positive signed volume, agreement with CAD volume, print-bed placement and main dimensions. It tests default PCB, two-station PSU, arbitrary holes, slots, vertical two-hole pattern, thicker flange/15 mm rail, no standoffs and minimum-size variants, plus rejection of invalid parameters. The CAD engine checks each output is one connected solid and has no volumetric collision with the schematic reference rail. The snap suite adds byte-identical screw-mode STL regression against `core.screw-baseline.mjs`, a single watertight snap part, clearance and print-placement assertions, and a 512-combination rail and plate sweep. The lightening tests check that the analytic removed volume matches the exported mesh within 2 percent, which also proves no slot reaches a bore or a clip footprint. These checks do **not** establish real-world fit or strength.

## Files

- `core.mjs`: reusable geometry, validation and STL exporter.
- `worker.mjs`: browser worker adapter.
- `index.vue`: the Nuxt page, with its UI in `components/Din*.vue`.
- `test/core.test.mjs`, `test/integral.test.mjs`: mesh, parameter and snap-mechanism tests; `test/core.screw-baseline.mjs` is the frozen screw-only engine used for the byte-identity regression.
- `test/core.screw-baseline.mjs`: screw-only reference engine, used by the STL regression test.
- `package.json`: test script and the pinned `manifold-3d` version.

Primary references: [Manifold](https://github.com/elalish/manifold), [Manifold JavaScript API](https://manifoldcad.org/docs/jsapi/), [Phoenix Contact NS 35/7.5 rail](https://www.phoenixcontact.com/en-us/products/din-rail-ns-35-75-unperf-1000mm-1207649), [Prusa PETG material guidance](https://help.prusa3d.com/article/petg_2059). The adapter design itself is original prototype geometry, not a manufacturer-approved mount.
