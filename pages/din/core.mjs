/** DIN mount core. Millimetres; +Z toward device, X along rail, Y across rail. */
import ManifoldModule from 'manifold-3d';

export const VERSION = '1.0.0';
export const DEFAULTS = Object.freeze({
  width: 90, height: 66, plateThickness: 4, cornerRadius: 3,
  lightening: false, slotWidth: 4, ribWidth: 2,
  pattern: 'rectangle', pitchX: 70, pitchY: 44, holeDiameter: 3.4,
  standoffHeight: 6, standoffWall: 2, holes: [],
  railWidth: 35, railHeight: 7.5, flangeThickness: 1,
  fitClearance: 0.3, hookOverlap: 2, hookDepth: 6,
  clipWidth: 26, clipCount: 1, clipSpacing: 50,
  clampHoleDiameter: 3.4, nutAcrossFlats: 5.8, nutDepth: 2.6,
  segments: 64,
  retention: 'screw', snapBladeThickness: 1.2, snapFreeLength: 28, snapClearance: 0.4,
});
export const PRESETS = Object.freeze({
  pcb4: { ...DEFAULTS },
  psu2: { ...DEFAULTS, width: 130, height: 70, pattern: 'line-x', pitchX: 90,
    holeDiameter: 4.5, standoffHeight: 3, clipCount: 2, clipSpacing: 64 },
  custom: { ...DEFAULTS, pattern: 'custom', holes: [
    { x: -30, y: -22, diameter: 3.4 }, { x: 30, y: -22, diameter: 3.4 },
    { x: -28, y: 22, diameter: 3.4 }, { x: 28, y: 22, diameter: 3.4 },
  ] },
  fitCoupon: { ...DEFAULTS, width: 36, height: 62, pattern: 'custom', holes: [], standoffHeight: 0 },
});

/** Snap examples: the screw presets with snap retention, plus a wider coupon for the paired flexure. */
export const SNAP_PRESETS = Object.freeze({
  pcb4: { ...PRESETS.pcb4, retention: 'snap' },
  psu2: { ...PRESETS.psu2, retention: 'snap' },
  yline50: { ...PRESETS.pcb4, retention: 'snap', pattern: 'line-y', pitchY: 50 },
  fitCoupon: { ...PRESETS.fitCoupon, retention: 'snap', width: 48, height: 66 },
});
export const LIMITS = Object.freeze({
  snapBladeThickness:[0.8,1.6], snapFreeLength:[24,40], snapClearance:[0.3,0.6],
  width:[32,300], height:[62,300], plateThickness:[3,12], cornerRadius:[0,12],
  slotWidth:[2.5,8], ribWidth:[1.2,4],
  pitchX:[0.5,280], pitchY:[0.5,280], holeDiameter:[2,8], standoffHeight:[0,30],
  standoffWall:[1.5,6], railWidth:[34,36], railHeight:[7.5,15],
  flangeThickness:[0.8,2], fitClearance:[0.1,0.8], hookOverlap:[1,3],
  hookDepth:[5,10], clipWidth:[24,50], clipSpacing:[26,250],
  clampHoleDiameter:[3.2,3.8], nutAcrossFlats:[5.5,6.3], nutDepth:[2.4,3.2], segments:[32,128],
});
export class ParameterError extends Error {
  constructor(errors) { super(errors.join('\n')); this.name='ParameterError'; this.errors=errors; }
}
const ownsParameter = (parameterSet, key) => Object.prototype.hasOwnProperty.call(parameterSet, key);

/** Centreline of a hole or slot, as [start, end] points in the plate's XY plane. */
const holeSegment = (hole) => {
  const halfSlot = ((hole.slotLength ?? hole.diameter) - hole.diameter) / 2;
  return hole.slotAxis === 'y'
    ? [[hole.x, hole.y - halfSlot], [hole.x, hole.y + halfSlot]]
    : [[hole.x - halfSlot, hole.y], [hole.x + halfSlot, hole.y]];
};

/** Exact 2D distance between two segments, used for round and slotted footprint clashes. */
function segmentDistance(startA, endA, startB, endB) {
  const distanceToSegment = (point, start, end) => {
    const spanX = end[0] - start[0];
    const spanY = end[1] - start[1];
    const projection = Math.max(0, Math.min(1, ((point[0] - start[0]) * spanX + (point[1] - start[1]) * spanY) / (spanX * spanX + spanY * spanY || 1)));
    return Math.hypot(point[0] - start[0] - projection * spanX, point[1] - start[1] - projection * spanY);
  };
  const cross = (origin, first, second) => (first[0] - origin[0]) * (second[1] - origin[1]) - (first[1] - origin[1]) * (second[0] - origin[0]);
  if (cross(startA, endA, startB) * cross(startA, endA, endB) < 0 && cross(startB, endB, startA) * cross(startB, endB, endA) < 0) return 0;
  return Math.min(
    distanceToSegment(startA, startB, endB),
    distanceToSegment(endA, startB, endB),
    distanceToSegment(startB, startA, endA),
    distanceToSegment(endB, startA, endA),
  );
}
const MAX_LIGHTENING_SLOT_LENGTH = 22; // mm; longer free runs are split so the ribs stay evenly spaced

/**
 * Plan for the rounded-slot plate lightening, in the plate's XY plane. Pure 2D geometry, no CSG:
 * slots run along X, so every print orientation builds them as channels open on both plate faces.
 * Each entry is one slot: its centre, its row Y and its overall length.
 */
export function lighteningSlots(configuration) {
  const { parameters, holes, stationCenters, isSnap, snapGeometry, railHalfWidth, barOuterY, hookOuterY } = configuration;
  if (!parameters.lightening) return [];

  const { slotWidth, ribWidth, cornerRadius, height, width } = parameters;
  const halfSlotWidth = slotWidth / 2;
  const border = Math.max(2.5, ribWidth);
  const minimumRunLength = slotWidth + 4;

  // Half-width of the rounded plate outline at a given |acrossRail|, so the rows follow the corners.
  const plateHalfWidthAt = (acrossRail) => {
    const pastCorner = Math.abs(acrossRail) - (height / 2 - cornerRadius);
    return pastCorner <= 0 ? width / 2 : width / 2 - cornerRadius + Math.sqrt(Math.max(0, cornerRadius * cornerRadius - pastCorner * pastCorner));
  };

  // Rectangles that must stay solid: bores and bosses, the hook, the retaining bar or snap root.
  const keepOuts = [];
  const reserve = (minX, minY, maxX, maxY) => keepOuts.push({ minX, maxX, minY, maxY });

  for (const hole of holes) {
    const [start, end] = holeSegment(hole);
    // A screw head needs a seating face on plain bores; a bossed hole needs its own wall kept.
    const margin = hole.standoffHeight > 0
      ? hole.diameter / 2 + parameters.standoffWall
      : hole.diameter / 2 + Math.max(3.2, ribWidth);
    reserve(
      Math.min(start[0], end[0]) - margin, Math.min(start[1], end[1]) - margin,
      Math.max(start[0], end[0]) + margin, Math.max(start[1], end[1]) + margin,
    );
  }

  for (const stationCenterX of stationCenters) {
    const minX = stationCenterX - parameters.clipWidth / 2 - ribWidth;
    const maxX = stationCenterX + parameters.clipWidth / 2 + ribWidth;
    // Retaining bar, its clamp screw seats and (snap) the root shoulder, all beside the rail.
    reserve(minX, railHalfWidth - ribWidth, maxX, barOuterY + ribWidth);
    // The fixed hook only ever sits on the negative Y side.
    reserve(minX, -hookOuterY - ribWidth, maxX, -railHalfWidth + ribWidth);
    // Snap: only the anchor and the rigid wall / travel stop reach the plate, so keep those solid.
    if (isSnap && snapGeometry) {
      reserve(
        stationCenterX + snapGeometry.rootStart - ribWidth, railHalfWidth - ribWidth,
        stationCenterX + snapGeometry.anchorEnd + ribWidth,
        snapGeometry.outerBladeInner + snapGeometry.thickness + snapGeometry.radius + ribWidth,
      );
      reserve(
        stationCenterX + snapGeometry.wallStart - ribWidth, railHalfWidth - ribWidth,
        stationCenterX + snapGeometry.wallEnd + ribWidth, snapGeometry.stopOuter + ribWidth,
      );
      reserve(
        stationCenterX + snapGeometry.stopStartX - ribWidth, snapGeometry.stopY - ribWidth,
        stationCenterX + snapGeometry.wallEnd + ribWidth, snapGeometry.stopOuter + ribWidth,
      );
    }
  }

  const slots = [];
  const halfPatternHeight = height / 2 - border - halfSlotWidth;
  const rowPitch = slotWidth + ribWidth;
  const rowCount = Math.floor((2 * halfPatternHeight) / rowPitch) + 1;
  if (rowCount < 1) return slots;

  const firstRowY = -((rowCount - 1) * rowPitch) / 2;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowY = firstRowY + rowIndex * rowPitch;
    const halfRun = plateHalfWidthAt(Math.abs(rowY) + halfSlotWidth) - border;
    if (halfRun <= 0) continue;

    let freeRuns = [[-halfRun, halfRun]];
    for (const keepOut of keepOuts) {
      if (rowY + halfSlotWidth <= keepOut.minY || rowY - halfSlotWidth >= keepOut.maxY) continue;
      const remainingRuns = [];
      for (const [runStart, runEnd] of freeRuns) {
        if (keepOut.maxX <= runStart || keepOut.minX >= runEnd) {
          remainingRuns.push([runStart, runEnd]);
          continue;
        }
        if (keepOut.minX > runStart) remainingRuns.push([runStart, keepOut.minX]);
        if (keepOut.maxX < runEnd) remainingRuns.push([keepOut.maxX, runEnd]);
      }
      freeRuns = remainingRuns;
    }

    for (const [runStart, runEnd] of freeRuns) {
      const runLength = runEnd - runStart;
      if (runLength < minimumRunLength) continue;
      const slotCount = Math.max(1, Math.ceil((runLength + ribWidth) / (MAX_LIGHTENING_SLOT_LENGTH + ribWidth)));
      const slotLength = (runLength - (slotCount - 1) * ribWidth) / slotCount;
      for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
        slots.push({ x: runStart + slotIndex * (slotLength + ribWidth) + slotLength / 2, y: rowY, length: slotLength });
      }
    }
  }
  return slots;
}
export function normalizeParameters(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ParameterError(['Parameters must be an object.']);

  const errors = [];
  const parameters = { ...DEFAULTS, ...input };

  for (const key of Object.keys(input)) if (!ownsParameter(DEFAULTS, key)) errors.push(`Unknown parameter: ${key}`);
  for (const [key, [minimum, maximum]] of Object.entries(LIMITS)) {
    const value = parameters[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
      errors.push(`${key}: expected a number from ${minimum} to ${maximum} mm (segments is a count).`);
    }
  }
  if (!['screw', 'snap'].includes(parameters.retention)) errors.push("retention must be 'screw' or 'snap'.");
  if (typeof parameters.lightening !== 'boolean') errors.push('lightening must be true or false.');
  if (![1, 2].includes(parameters.clipCount)) errors.push('clipCount must be 1 or 2.');
  if (!Number.isInteger(parameters.segments)) errors.push('segments must be an integer.');
  if (![7.5, 15].includes(parameters.railHeight)) errors.push('railHeight must be 7.5 or 15.');
  if (!['rectangle', 'line-x', 'line-y', 'custom'].includes(parameters.pattern)) errors.push('Unknown hole pattern.');
  if (!Array.isArray(parameters.holes) || parameters.holes.length > 32) errors.push('holes must be an array with at most 32 entries.');
  if (errors.length) throw new ParameterError(errors);

  const patternPositions = parameters.pattern === 'rectangle'
    ? [[-parameters.pitchX / 2, -parameters.pitchY / 2], [parameters.pitchX / 2, -parameters.pitchY / 2], [-parameters.pitchX / 2, parameters.pitchY / 2], [parameters.pitchX / 2, parameters.pitchY / 2]]
    : parameters.pattern === 'line-x' ? [[-parameters.pitchX / 2, 0], [parameters.pitchX / 2, 0]]
    : parameters.pattern === 'line-y' ? [[0, -parameters.pitchY / 2], [0, parameters.pitchY / 2]]
    : null;

  const holes = patternPositions
    ? patternPositions.map(([holeX, holeY]) => ({ x: holeX, y: holeY, diameter: parameters.holeDiameter }))
    : parameters.holes.map((hole) => (hole && typeof hole === 'object' ? { ...hole } : {}));

  holes.forEach((hole, index) => {
    for (const key of Object.keys(hole)) {
      if (!['x', 'y', 'diameter', 'slotLength', 'slotAxis', 'standoffHeight'].includes(key)) errors.push(`Hole ${index + 1}: unknown field ${key}.`);
    }
    hole.diameter ??= parameters.holeDiameter;
    hole.slotLength ??= hole.diameter;
    hole.slotAxis ??= 'x';
    hole.standoffHeight ??= parameters.standoffHeight;
    const coordinatesFinite = [hole.x, hole.y, hole.diameter, hole.slotLength, hole.standoffHeight].every(Number.isFinite);
    const sizesInRange = hole.diameter >= 2 && hole.diameter <= 8
      && hole.slotLength >= hole.diameter && hole.slotLength <= 80
      && hole.standoffHeight >= 0 && hole.standoffHeight <= 30
      && ['x', 'y'].includes(hole.slotAxis);
    if (!coordinatesFinite || !sizesInRange) errors.push(`Hole ${index + 1}: invalid coordinates, diameter, slot, or standoff height.`);
  });
  if (errors.length) throw new ParameterError(errors);
  const stationCenters = parameters.clipCount === 1 ? [0] : [-parameters.clipSpacing / 2, parameters.clipSpacing / 2];
  const railHalfWidth = parameters.railWidth / 2;
  const clampScrewY = railHalfWidth + 6.5;
  const barOuterY = railHalfWidth + 11.5;
  const hookOuterY = railHalfWidth + parameters.fitClearance + 4;
  const flangeGap = parameters.flangeThickness + parameters.fitClearance;
  const isSnap = parameters.retention === 'snap';
  let snapGeometry = null;

  if (isSnap) {
    const bladeThickness = parameters.snapBladeThickness;
    const freeLength = parameters.snapFreeLength;
    const rootRadius = Math.max(1.2, bladeThickness);
    const anchorLength = 4;
    const headLength = 4;
    const leafSpacing = 5;
    const bladeInnerY = railHalfWidth + parameters.fitClearance;
    const outerBladeInnerY = bladeInnerY + leafSpacing;
    const travel = parameters.hookOverlap + parameters.fitClearance;
    const stopTravel = travel + parameters.snapClearance;
    // Fixed 45 degree insertion ramp; the paired leaves flex in XY, bending toward +Y.
    const rampHeight = travel;
    const bladeDepth = Math.max(4, rampHeight + 0.4);
    const span = anchorLength + 2 * rootRadius + freeLength + headLength;
    const rootStart = -span / 2;
    const anchorEnd = rootStart + anchorLength;
    const freeStart = anchorEnd + rootRadius;
    const freeEnd = freeStart + freeLength;
    const headStart = freeEnd + rootRadius;
    const headEnd = headStart + headLength;
    const releaseOuterY = parameters.height / 2 + 4; // reachable beyond the +Y plate edge
    const headOuterY = outerBladeInnerY + bladeThickness;
    const tabReach = releaseOuterY - headOuterY;
    const tabWidth = headLength - 1.8;
    const wallStart = headEnd + 0.8;
    const wallEnd = wallStart + 2.4;
    const stopStartX = headEnd - 1.2;
    const stopY = headOuterY + stopTravel;
    const stopOuterY = stopY + 2.4;
    // Bearing shelf sits one clearance below the jaw and is carried by the side wall.
    const bearingTopZ = -flangeGap - bladeDepth - parameters.snapClearance;
    const bearingBottomZ = bearingTopZ - 1.6;
    // Two approximately fixed-guided leaves, not one free-ended cantilever.
    const strain = (3 * bladeThickness * travel) / (freeLength * freeLength);
    const maxStrain = (3 * bladeThickness * stopTravel) / (freeLength * freeLength);
    // Conservative screening allowance, not a proven FDM stress concentration factor.
    const screenedStrain = 2 * maxStrain;

    if (screenedStrain > 0.03) errors.push('Snap strain screen at the travel stop exceeds 3%; increase snapFreeLength or reduce snapBladeThickness / hookOverlap.');
    if (tabReach > 35 || tabReach < 4) errors.push('Snap release tab reach must be 4 to 35 mm; adjust plate height.');
    if (stationCenters.some((centerX) => centerX + wallEnd + 1 > parameters.width / 2 || centerX + rootStart - 1 < -parameters.width / 2)) {
      errors.push('Insufficient plate width for the paired flexure and its rigid support.');
    }
    if (parameters.clipCount === 2 && parameters.clipSpacing < wallEnd - rootStart + 3) {
      errors.push('Increase clipSpacing to clear the paired flexure supports.');
    }
    if (stopOuterY + 0.5 > parameters.height / 2 - parameters.cornerRadius) {
      errors.push('Insufficient plate above the travel stop; increase height or reduce cornerRadius.');
    }
    if (-bearingBottomZ > parameters.railHeight + parameters.fitClearance / 2 - 0.2) {
      errors.push('Load support crosses the schematic rail mounting plane; use a 15 mm rail or reduce flange / overlap / clearance.');
    }

    // Paired fixed-guided beam model: two leaves sharing one rigid jaw.
    const releaseForceAt = (modulusMPa) => (2 * modulusMPa * bladeDepth * bladeThickness ** 3 * travel) / freeLength ** 3;
    snapGeometry = {
      design: 'paired-leaf-with-load-support',
      thickness: bladeThickness,
      length: freeLength,
      radius: rootRadius,
      anchorLength,
      headLength,
      spacing: leafSpacing,
      bladeInner: bladeInnerY,
      outerBladeInner: outerBladeInnerY,
      headOuter: headOuterY,
      travel,
      stopTravel,
      rampHeight,
      depth: bladeDepth,
      span,
      rootStart,
      anchorEnd,
      freeStart,
      freeEnd,
      headStart,
      headEnd,
      releaseOuter: releaseOuterY,
      tabReach,
      tabWidth,
      wallStart,
      wallEnd,
      stopStartX,
      stopY,
      stopOuter: stopOuterY,
      bearingTop: bearingTopZ,
      bearingBottom: bearingBottomZ,
      strain,
      maxStrain,
      screenedStrain,
      releaseForceEstimateN: [releaseForceAt(1200), releaseForceAt(2200)],
      modulusAssumptionMPa: [1200, 2200],
      rampAngleToInsertionDeg: 45,
      printZShift: Math.max(parameters.hookDepth, -bearingBottomZ),
    };
  }
  if (parameters.hookDepth - flangeGap < 2.5) errors.push('hookDepth must leave at least 2.5 mm below the rail flange gap.');
  if (!isSnap && parameters.hookDepth - parameters.nutDepth < 2.4) errors.push('Retaining bar must leave at least 2.4 mm above the nut pocket.');
  if (parameters.cornerRadius > Math.min(parameters.width, parameters.height) / 4) errors.push('cornerRadius is too large.');
  if (!isSnap && parameters.height / 2 < barOuterY + 1.5) errors.push(`height must be at least ${2 * (barOuterY + 1.5)} mm.`);
  if (parameters.clipCount === 2 && parameters.clipSpacing < parameters.clipWidth + 4) errors.push('Clips need at least 4 mm separation.');
  if (stationCenters.some((centerX) => Math.abs(centerX) + parameters.clipWidth / 2 > parameters.width / 2 - 2)) {
    errors.push('Clip extends too close to a plate side; increase width or reduce clip spacing/width.');
  }

  const clampScrewHoles = isSnap
    ? []
    : stationCenters.flatMap((centerX) => [-1, 1].map((side) => ({
      x: centerX + side * (parameters.clipWidth / 2 - 6),
      y: clampScrewY,
      diameter: parameters.clampHoleDiameter,
    })));
  const screwHeadClearance = 3.2; // M3 socket head plus a little tool clearance

  holes.forEach((hole, index) => {
    const [start, end] = holeSegment(hole);
    const footprintRadius = hole.diameter / 2 + (hole.standoffHeight > 0 ? parameters.standoffWall : 1.5);
    const minX = Math.min(start[0], end[0]) - hole.diameter / 2 - 1.5;
    const maxX = Math.max(start[0], end[0]) + hole.diameter / 2 + 1.5;
    const minY = Math.min(start[1], end[1]) - hole.diameter / 2 - 1.5;
    const maxY = Math.max(start[1], end[1]) + hole.diameter / 2 + 1.5;

    // Conservative inset box, so the footprint cannot clip a rounded corner either.
    if (Math.max(Math.abs(start[0]), Math.abs(end[0])) + footprintRadius > parameters.width / 2 - parameters.cornerRadius
      || Math.max(Math.abs(start[1]), Math.abs(end[1])) + footprintRadius > parameters.height / 2 - parameters.cornerRadius) {
      errors.push(`Hole ${index + 1}: insufficient plate edge / corner clearance.`);
    }

    for (const screw of clampScrewHoles) {
      if (segmentDistance(start, end, [screw.x, screw.y], [screw.x, screw.y]) < footprintRadius + screwHeadClearance + 0.5) {
        errors.push(`Hole ${index + 1}: overlaps clamp screw/head clearance. Move the hole or clip.`);
      }
    }

    // A drill must not weaken the fixed hook or the concealed retaining bar contact region.
    for (const centerX of stationCenters) {
      const stationBands = isSnap
        ? [[-hookOuterY, -railHalfWidth + parameters.hookOverlap]]
        : [[-hookOuterY, -railHalfWidth + parameters.hookOverlap], [railHalfWidth - parameters.hookOverlap, barOuterY]];
      for (const [bandMinY, bandMaxY] of stationBands) {
        if (maxX > centerX - parameters.clipWidth / 2 && minX < centerX + parameters.clipWidth / 2 && maxY > bandMinY && minY < bandMaxY) {
          errors.push(`Hole ${index + 1}: too close to a rail hook / retaining bar footprint. Move hole or clip.`);
        }
      }
    }

    if (isSnap && snapGeometry) {
      for (const centerX of stationCenters) {
        // Only the anchor reaches the plate; do not reserve a fictitious full-width jaw.
        const hitsAnchor = maxX > centerX + snapGeometry.rootStart && minX < centerX + snapGeometry.anchorEnd
          && maxY > snapGeometry.bladeInner && minY < snapGeometry.outerBladeInner + snapGeometry.thickness + snapGeometry.radius;
        const hitsSupport = (maxX > centerX + snapGeometry.wallStart && minX < centerX + snapGeometry.wallEnd
          && maxY > snapGeometry.bladeInner && minY < snapGeometry.stopOuter)
          || (maxX > centerX + snapGeometry.stopStartX && minX < centerX + snapGeometry.wallEnd
            && maxY > snapGeometry.stopY && minY < snapGeometry.stopOuter);
        if (hitsAnchor) errors.push(`Hole ${index + 1}: too close to the snap anchor. Move hole or clip.`);
        if (hitsSupport) errors.push(`Hole ${index + 1}: too close to the rigid snap support or travel stop.`);
      }
    }

    for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
      const previousHole = holes[previousIndex];
      const [previousStart, previousEnd] = holeSegment(previousHole);
      const previousFootprintRadius = previousHole.diameter / 2 + (previousHole.standoffHeight > 0 ? parameters.standoffWall : 0);
      const minimumSeparation = footprintRadius + previousFootprintRadius + 1;
      if (segmentDistance(start, end, previousStart, previousEnd) < minimumSeparation) {
        errors.push(`Holes ${previousIndex + 1} and ${index + 1}: need at least ${minimumSeparation.toFixed(1)} mm between their footprints; move them apart or reduce the hole diameter / standoff wall.`);
      }
    }
  });
  if (errors.length) throw new ParameterError([...new Set(errors)]);

  return {
    parameters,
    holes,
    stationCenters,
    clampScrewHoles,
    flangeGap,
    railHalfWidth,
    clampScrewY,
    barOuterY,
    hookOuterY,
    isSnap,
    snapGeometry,
  };
}

/** Initialize once. Supply { locateFile: name => wasmUrl } in a browser bundler. */
export async function createGenerator(wasmOptions = {}) {
  const wasm = await ManifoldModule(wasmOptions);
  wasm.setup();
  const { Manifold, CrossSection } = wasm;

  return { generate };

  function generate(input = {}) {
    const configuration = normalizeParameters(input);
    const { parameters, holes, stationCenters, clampScrewHoles, flangeGap, railHalfWidth, barOuterY, hookOuterY, isSnap, snapGeometry } = configuration;
    const slots = lighteningSlots(configuration);

    // Manifold objects hold WASM memory, so every one created here is released in the finally block.
    const disposables = [];
    const retain = (manifoldObject) => (disposables.push(manifoldObject), manifoldObject);
    const translated = (manifoldObject, offset) => retain(manifoldObject.translate(offset));
    const box = (minX, minY, minZ, width, height, depth) => translated(retain(Manifold.cube([width, height, depth])), [minX, minY, minZ]);
    const cylinder = (centerX, centerY, baseZ, diameter, height, facetCount = parameters.segments) =>
      translated(retain(Manifold.cylinder(height, diameter / 2, diameter / 2, facetCount)), [centerX, centerY, baseZ]);
    const union = (shapes) => (shapes.length === 1 ? shapes[0] : retain(Manifold.union(shapes)));
    const subtract = (base, tools) => retain(base.subtract(union(tools)));

    /** A bore, or a slot as a capsule: two rounded ends joined by a straight side. */
    const holeCapsule = (hole, wallThickness, baseZ, depth, facetCount = parameters.segments) => {
      const [start, end] = holeSegment(hole);
      const diameter = hole.diameter + wallThickness * 2;
      if (hole.slotLength === hole.diameter) return cylinder(hole.x, hole.y, baseZ, diameter, depth, facetCount);
      return union([
        cylinder(start[0], start[1], baseZ, diameter, depth, facetCount),
        cylinder(end[0], end[1], baseZ, diameter, depth, facetCount),
        hole.slotAxis === 'x'
          ? box(start[0], hole.y - diameter / 2, baseZ, end[0] - start[0], diameter, depth)
          : box(hole.x - diameter / 2, start[1], baseZ, diameter, end[1] - start[1], depth),
      ]);
    };

    /** The plate alone: a rounded rectangle extruded upward from Z = 0. */
    const buildPlate = () => {
      const { width, height, plateThickness, cornerRadius } = parameters;
      if (cornerRadius === 0) return box(-width / 2, -height / 2, 0, width, height, plateThickness);

      const outline = [];
      for (let corner = 0; corner < 4; corner += 1) {
        const cornerX = (corner === 0 || corner === 3 ? 1 : -1) * (width / 2 - cornerRadius);
        const cornerY = (corner < 2 ? 1 : -1) * (height / 2 - cornerRadius);
        for (let step = 0; step <= 12; step += 1) {
          const angle = ((corner * 90 + (step * 90) / 12) * Math.PI) / 180;
          outline.push([cornerX + cornerRadius * Math.cos(angle), cornerY + cornerRadius * Math.sin(angle)]);
        }
      }
      return retain(retain(new CrossSection([outline])).extrude(plateThickness));
    };

    /**
     * One integral snap station: a common anchor carrying two paired leaves and the rigid jaw,
     * plus the retaining tooth, pull tab, fixed side wall, bearing shelf and outward travel stop.
     */
    const appendSnapStation = (shapeList, stationCenterX) => {
      const {
        rootStart, anchorEnd, anchorLength, freeStart, headStart, headLength,
        bladeInner, outerBladeInner, headOuter, thickness, radius, depth, spacing,
        rampHeight, tabWidth, releaseOuter, wallStart, wallEnd, stopStartX, stopY,
        stopOuter, stopTravel, bearingTop, bearingBottom, length: freeLength,
      } = snapGeometry;
      const baseZ = -flangeGap - depth;
      const atStation = (outline) => outline.map(([pointX, pointY]) => [stationCenterX + pointX, pointY]);

      // Common fixed anchor; leaves, jaw and moving head are all printed integrally.
      shapeList.push(box(stationCenterX + rootStart, bladeInner, baseZ, anchorLength, spacing + thickness + radius, depth + flangeGap + 0.02));
      // Wider root shoulder below flange level, carrying both XY root fillets.
      shapeList.push(box(stationCenterX + rootStart, bladeInner - radius, baseZ, anchorLength + 0.02, spacing + thickness + 2 * radius, depth));

      for (const leafInnerY of [bladeInner, outerBladeInner]) {
        shapeList.push(box(stationCenterX + anchorEnd - 0.02, leafInnerY, baseZ, 2 * radius + freeLength + headLength + 0.02, thickness, depth));
        for (const side of [-1, 1]) {
          for (const end of ['root', 'head']) {
            const bladeEdgeY = side < 0 ? leafInnerY : leafInnerY + thickness;
            const filletCenterY = bladeEdgeY + side * radius;
            let outline = [
              [anchorEnd - 0.02, bladeEdgeY - side * 0.02],
              [anchorEnd - 0.02, filletCenterY],
            ];
            for (let step = 1; step <= 16; step += 1) {
              const angle = ((180 + (side < 0 ? -1 : 1) * ((90 * step) / 16)) * Math.PI) / 180;
              outline.push([freeStart + radius * Math.cos(angle), filletCenterY + radius * Math.sin(angle)]);
            }
            // The last arc point is (freeStart, bladeEdgeY), closing onto the straight leaf edge.
            outline.push([freeStart, bladeEdgeY - side * 0.02]);
            if (side > 0) outline.reverse();
            if (end === 'head') {
              outline = outline.map(([pointX, pointY]) => [anchorEnd + headStart - pointX, pointY]);
              outline.reverse();
            }
            shapeList.push(translated(retain(retain(new CrossSection([atStation(outline)])).extrude(depth)), [0, 0, baseZ]));
          }
        }
      }

      // Rigid common jaw makes the two leaves act as a compliant parallelogram.
      shapeList.push(box(stationCenterX + headStart - 0.02, bladeInner, baseZ, headLength + 0.02, spacing + thickness, depth));

      // Retaining tooth: a triangle in YZ extruded along +X, so the upper outer flange corner
      // rides the diagonal as the rail moves +Z relative to the mount.
      const toothSection = retain(new CrossSection([[
        [railHalfWidth - parameters.hookOverlap, -flangeGap],
        [bladeInner + 0.02, -flangeGap - rampHeight],
        [bladeInner + 0.02, -flangeGap],
      ]]));
      shapeList.push(translated(retain(retain(toothSection.extrude(headLength)).rotate([90, 0, 90])), [stationCenterX + headStart, 0, 0]));

      // Narrower pull tab bypasses the outboard stop in X.
      shapeList.push(box(stationCenterX + headStart, headOuter - 0.02, -flangeGap - 2, tabWidth, releaseOuter - headOuter + 0.02, 2));

      // Fixed side wall and bearing shelf carry the downward jaw reaction into the plate.
      shapeList.push(box(stationCenterX + wallStart, bladeInner, bearingBottom, wallEnd - wallStart, stopOuter - bladeInner, -bearingBottom + 0.02));
      shapeList.push(box(stationCenterX + headStart - 0.5, bladeInner + 0.1, bearingBottom, wallEnd - headStart + 0.5, headOuter + stopTravel + 0.5 - bladeInner - 0.1, bearingTop - bearingBottom));

      // Outward travel stop, tied to both the plate and the side wall.
      shapeList.push(box(stationCenterX + stopStartX, stopY, baseZ, wallEnd - stopStartX, stopOuter - stopY, -baseZ + 0.02));
    };

    /** Suggested print orientation, with the lowest feature on the bed (STL z >= 0). */
    const printPosition = (point, partIndex) => {
      const [alongRail, acrossRail, throughPlate] = point;
      if (isSnap) return [alongRail, acrossRail, throughPlate + snapGeometry.printZShift];
      // Main body onto its X edge; each retaining bar onto its flat plate-contact face.
      if (partIndex === 0) return [-throughPlate, acrossRail, alongRail + parameters.width / 2];
      return [alongRail - stationCenters[partIndex - 1], -acrossRail, -throughPlate];
    };

    /** Copy one solid out as a plain mesh, so no WASM handle escapes into the result. */
    const packSolid = (name, solid, quantity) => {
      if (solid.status() !== 'NoError' || solid.isEmpty()) throw new Error(`Invalid solid: ${name} (${solid.status()})`);

      const components = solid.decompose();
      const componentCount = components.length;
      components.forEach((component) => component.delete());
      if (componentCount !== 1) throw new Error(`${name} must have one connected component; got ${componentCount}.`);

      const rawMesh = solid.getMesh();
      const positions = new Float32Array(rawMesh.numVert * 3);
      for (let vertex = 0; vertex < rawMesh.numVert; vertex += 1) {
        for (let component = 0; component < 3; component += 1) {
          positions[3 * vertex + component] = rawMesh.vertProperties[rawMesh.numProp * vertex + component];
        }
      }
      const mesh = { positions, indices: new Uint32Array(rawMesh.triVerts) };
      return { name, quantity, mesh, volumeMm3: solid.volume(), bounds: solid.boundingBox(), triangles: mesh.indices.length / 3 };
    };

    try {
      const mainBodySolids = [buildPlate()];

      // Standoffs are capsule bosses rising from the plate top.
      for (const hole of holes) {
        if (hole.standoffHeight > 0) mainBodySolids.push(holeCapsule(hole, parameters.standoffWall, parameters.plateThickness - 0.02, hole.standoffHeight + 0.02));
      }

      // The fixed hook reaches under the far flange and seats the plate onto the rail.
      for (const stationCenterX of stationCenters) {
        const hookMinX = stationCenterX - parameters.clipWidth / 2;
        mainBodySolids.push(box(hookMinX, -hookOuterY, -parameters.hookDepth, parameters.clipWidth, hookOuterY - railHalfWidth - parameters.fitClearance, parameters.hookDepth + 0.02));
        mainBodySolids.push(box(hookMinX, -hookOuterY, -parameters.hookDepth, parameters.clipWidth, hookOuterY - railHalfWidth + parameters.hookOverlap, parameters.hookDepth - flangeGap));
      }

      if (isSnap) for (const stationCenterX of stationCenters) appendSnapStation(mainBodySolids, stationCenterX);

      // Bores and slots are cut last, so nothing can hollow out a standoff, hook or anchor.
      const cutSolids = holes.map((hole) => (isSnap
        ? holeCapsule(hole, 0, -0.02, parameters.plateThickness + hole.standoffHeight + 1)
        : holeCapsule(hole, 0, -parameters.hookDepth - 1, parameters.hookDepth + parameters.plateThickness + hole.standoffHeight + 2)));
      for (const screw of clampScrewHoles) cutSolids.push(cylinder(screw.x, screw.y, -1, parameters.clampHoleDiameter, parameters.plateThickness + 2));
      // Lightening slots cut the plate only, with 16 facets per rounded end.
      for (const slot of slots) {
        cutSolids.push(holeCapsule({ x: slot.x, y: slot.y, diameter: parameters.slotWidth, slotLength: slot.length, slotAxis: 'x' }, 0, -0.5, parameters.plateThickness + 1, 16));
      }

      let mainBody = cutSolids.length === 0 ? union(mainBodySolids) : subtract(union(mainBodySolids), cutSolids);
      if (isSnap) {
        // Re-importing through Float32, then simplifying, keeps sub-micron CSG slivers out of the STL.
        const rawMesh = mainBody.getMesh();
        const rounded = retain(new Manifold({
          numProp: rawMesh.numProp,
          vertProperties: Float32Array.from(rawMesh.vertProperties),
          triVerts: rawMesh.triVerts,
          mergeFromVert: rawMesh.mergeFromVert,
          mergeToVert: rawMesh.mergeToVert,
        }));
        mainBody = retain(retain(rounded.asOriginal()).setTolerance(0.0001));

        const tighterMesh = mainBody.getMesh();
        const simplified = retain(new Manifold({
          numProp: tighterMesh.numProp,
          vertProperties: Float32Array.from(tighterMesh.vertProperties),
          triVerts: tighterMesh.triVerts,
          mergeFromVert: tighterMesh.mergeFromVert,
          mergeToVert: tighterMesh.mergeToVert,
        }));
        mainBody = retain(retain(simplified.asOriginal()).simplify(0.001));
      }

      const parts = [packSolid('main', mainBody, 1)];
      const retainingBars = [];
      if (!isSnap) {
        stationCenters.forEach((stationCenterX, stationIndex) => {
          const barMinX = stationCenterX - parameters.clipWidth / 2;
          const barBody = box(barMinX, railHalfWidth + parameters.fitClearance, -parameters.hookDepth, parameters.clipWidth, barOuterY - railHalfWidth - parameters.fitClearance, parameters.hookDepth);
          const barLip = box(barMinX, railHalfWidth - parameters.hookOverlap, -parameters.hookDepth, parameters.clipWidth, barOuterY - railHalfWidth + parameters.hookOverlap, parameters.hookDepth - flangeGap);
          const barCuts = [];
          for (const screw of clampScrewHoles.slice(stationIndex * 2, stationIndex * 2 + 2)) {
            barCuts.push(cylinder(screw.x, screw.y, -parameters.hookDepth - 1, parameters.clampHoleDiameter, parameters.hookDepth + 2));
            barCuts.push(cylinder(screw.x, screw.y, -parameters.hookDepth - 0.02, (2 * parameters.nutAcrossFlats) / Math.sqrt(3), parameters.nutDepth + 0.02, 6));
          }
          const retainingBar = subtract(union([barBody, barLip]), barCuts);
          retainingBars.push(retainingBar);
          parts.push(packSolid(`jaw-${stationIndex + 1}`, retainingBar, 1));
        });
      }
      // Dimensionally illustrative reference rail; never fabricated or exported.
      const railLength = parameters.width + 30;
      const webWidth = 24;
      const railTopZ = -parameters.fitClearance / 2;
      const railThickness = parameters.flangeThickness;
      const referenceRail = union([
        box(-railLength / 2, -webWidth / 2, railTopZ - parameters.railHeight, railLength, webWidth, railThickness),
        box(-railLength / 2, -webWidth / 2, railTopZ - parameters.railHeight, railLength, railThickness, parameters.railHeight),
        box(-railLength / 2, webWidth / 2 - railThickness, railTopZ - parameters.railHeight, railLength, railThickness, parameters.railHeight),
        box(-railLength / 2, -railHalfWidth, railTopZ - railThickness, railLength, railHalfWidth - webWidth / 2 + railThickness, railThickness),
        box(-railLength / 2, webWidth / 2 - railThickness, railTopZ - railThickness, railLength, railHalfWidth - webWidth / 2 + railThickness, railThickness),
      ]);
      const referencePart = packSolid('reference-rail', referenceRail, 1);

      // Exact Boolean interference checks, excluding contact surfaces.
      for (const solid of [mainBody, ...retainingBars]) {
        const collision = retain(solid.intersect(referenceRail));
        if (collision.volume() > 1e-6) throw new Error('Internal error: part interferes with reference rail.');
      }

      const printParts = parts.map((part, partIndex) => ({
        ...part,
        mesh: transformMesh(part.mesh, (point) => printPosition(point, partIndex)),
      }));
      for (const part of printParts) part.bounds = meshBounds(part.mesh);
      const warnings = [
        'Prototype geometry: rail fit, load capacity, vibration resistance and temperature performance have NOT been physically tested.',
        'Main body: suggested X-edge orientation needs a brim and supports under projecting hooks/standoffs and some bores. Inspect the sliced toolpaths. Jaws: plate-contact face on bed; support the flange recess as needed.',
        'The retaining bar captures the rail lips; it does not friction-lock travel along X. Use rail end stops where longitudinal movement matters.',
        'Install rail clamp screws before the electronics. Use appropriate device screws; prevent their tips contacting rail, components or conductors.',
      ];
      if (isSnap) {
        warnings.splice(1, 3,
          'One-piece paired-leaf snap: print with the XY bending plane parallel to the bed, and keep support out of the moving clearances so the shelf gap cannot be welded shut.',
          'Pull the tab in +Y until the flange clears, then tilt the mount off the fixed hook. The integral stop limits intended outward travel; do not pry past it or twist the tab.',
          'Snap is positive capture with clearance, not preload or an X-axis friction lock. Use rail end stops if needed. Fit, fatigue, PETG elasticity and load capacity require physical testing.',
          'Keep device screw tips/nuts and cables clear of the entire moving beam/tab envelope; hole validation checks the printed anchor, not hardware.');
      }
      if (!isSnap && holes.some((hole) => hole.standoffHeight < 5)) warnings.push('Low device clearance: M3 socket heads protrude above the plate. Confirm the device underside clears them; increase standoffs if needed.');
      if (parameters.width > 150 || parameters.height > 150 || holes.some((hole) => hole.standoffHeight > 15)) warnings.push('Large spans/tall standoffs: stiffness and load capacity require particular attention.');
      holes.forEach((hole, index) => {
        const [start, end] = holeSegment(hole);
        const hardwareRadius = Math.max(3.2, hole.diameter);
        const lowestY = Math.min(start[1], end[1]) - hardwareRadius;
        const highestY = Math.max(start[1], end[1]) + hardwareRadius;
        if ((highestY >= 11 && lowestY <= railHalfWidth) || (highestY >= -railHalfWidth && lowestY <= -11)) {
          warnings.push(`Hole ${index + 1}: back-side hardware may overlap a rail lip/sidewall. Check your screw/nut envelope before printing.`);
        }
      });

      const screwGrip = parameters.plateThickness + parameters.hookDepth - parameters.nutDepth;
      const lighteningOpeningArea = slots.reduce(
        (total, slot) => total + (slot.length - parameters.slotWidth) * parameters.slotWidth + (Math.PI * parameters.slotWidth ** 2) / 4,
        0,
      );

      return {
        version: VERSION,
        units: 'mm',
        parameters,
        resolvedHoles: holes,
        parts,
        printParts,
        reference: referencePart,
        hardware: {
          clampScrews: {
            count: isSnap ? 0 : parameters.clipCount * 2,
            type: isSnap ? 'None (integral snap)' : 'M3 socket-head machine screw',
            lengthUnderHeadRange: isSnap ? null : [Number((screwGrip + 2.4).toFixed(2)), Number((parameters.plateThickness + parameters.hookDepth + 1).toFixed(2))],
          },
          clampNuts: {
            count: isSnap ? 0 : parameters.clipCount * 2,
            type: isSnap ? 'None (integral snap)' : 'M3 hex nut; verify actual thickness and across-flats',
          },
          deviceScrews: {
            count: holes.length,
            type: 'Choose for your device; mounting bores are plain clearance holes, NOT threads.',
          },
        },
        dimensions: {
          flangeGap,
          clipCentersX: stationCenters,
          clampScrewCenters: clampScrewHoles.map((screw) => [screw.x, screw.y]),
          railRunsAlong: 'X',
          ...(isSnap ? { retention: 'snap', snap: snapGeometry } : {}),
          ...(parameters.lightening
            ? { lightening: { slots: slots.length, removedMm3: Number((lighteningOpeningArea * parameters.plateThickness).toFixed(1)) } }
            : {}),
        },
        warnings,
      };
    } finally {
      for (let index = disposables.length - 1; index >= 0; index -= 1) disposables[index].delete();
    }
  }
}

/** Apply a point transform to every vertex of a mesh, keeping its index buffer. */
export function transformMesh(mesh, transformPoint) {
  const positions = new Float32Array(mesh.positions.length);
  for (let offset = 0; offset < positions.length; offset += 3) {
    positions.set(transformPoint(Array.from(mesh.positions.subarray(offset, offset + 3))), offset);
  }
  return { positions, indices: new Uint32Array(mesh.indices) };
}
/** Binary STL has no unit metadata. Import into a slicer as millimetres. */
export function toSTL(mesh, description = 'DIN mount core; units mm') {
  const { positions, indices } = mesh;
  if (!(positions instanceof Float32Array) || !(indices instanceof Uint32Array) || positions.length % 3 || indices.length % 3 || !indices.length) {
    throw new Error('Expected nonempty indexed triangle mesh.');
  }
  if (!positions.every(Number.isFinite) || indices.some((index) => index * 3 + 2 >= positions.length)) throw new Error('Invalid mesh vertices or indices.');

  const triangleCount = indices.length / 3;
  const buffer = new ArrayBuffer(84 + triangleCount * 50);
  const view = new DataView(buffer);
  new Uint8Array(buffer, 0, 80).set(new TextEncoder().encode(description).slice(0, 80));
  view.setUint32(80, triangleCount, true);

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const first = indices[triangle * 3] * 3;
    const second = indices[triangle * 3 + 1] * 3;
    const third = indices[triangle * 3 + 2] * 3;
    const edgeA = [positions[second] - positions[first], positions[second + 1] - positions[first + 1], positions[second + 2] - positions[first + 2]];
    const edgeB = [positions[third] - positions[first], positions[third + 1] - positions[first + 1], positions[third + 2] - positions[first + 2]];
    const normal = [edgeA[1] * edgeB[2] - edgeA[2] * edgeB[1], edgeA[2] * edgeB[0] - edgeA[0] * edgeB[2], edgeA[0] * edgeB[1] - edgeA[1] * edgeB[0]];
    const normalLength = Math.hypot(...normal);
    if (!normalLength) throw new Error('Degenerate triangle in STL export.');

    const face = [...normal.map((component) => component / normalLength), ...positions.subarray(first, first + 3), ...positions.subarray(second, second + 3), ...positions.subarray(third, third + 3)];
    let offset = 84 + triangle * 50;
    for (const value of face) {
      view.setFloat32(offset, value, true);
      offset += 4;
    }
    view.setUint16(offset, 0, true);
  }
  return new Uint8Array(buffer);
}

export function meshBounds(mesh) {
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  for (let offset = 0; offset < mesh.positions.length; offset += 1) {
    const axis = offset % 3;
    minimum[axis] = Math.min(minimum[axis], mesh.positions[offset]);
    maximum[axis] = Math.max(maximum[axis], mesh.positions[offset]);
  }
  return { min: minimum, max: maximum };
}
