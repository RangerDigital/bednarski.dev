/** DIN mount core. Millimetres; +Z toward device, X along rail, Y across rail. */
import ManifoldModule from 'manifold-3d';

export const VERSION = '1.0.0';
export const DEFAULTS = Object.freeze({
  width: 90, height: 66, plateThickness: 4, cornerRadius: 3,
  pattern: 'rectangle', pitchX: 70, pitchY: 44, holeDiameter: 3.4,
  standoffHeight: 6, standoffWall: 2, holes: [],
  railWidth: 35, railHeight: 7.5, flangeThickness: 1,
  fitClearance: 0.3, hookOverlap: 2, hookDepth: 6,
  clipWidth: 26, clipCount: 1, clipSpacing: 50,
  clampHoleDiameter: 3.4, nutAcrossFlats: 5.8, nutDepth: 2.6,
  segments: 64,
  retention: 'screw', snapBladeThickness: 1.2, snapFreeLength: 22,
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
export const LIMITS = Object.freeze({
  snapBladeThickness:[0.8,2], snapFreeLength:[18,36],
  width:[32,300], height:[62,300], plateThickness:[3,12], cornerRadius:[0,12],
  pitchX:[1,280], pitchY:[1,280], holeDiameter:[2,8], standoffHeight:[0,30],
  standoffWall:[1.5,6], railWidth:[34,36], railHeight:[7.5,15],
  flangeThickness:[0.8,2], fitClearance:[0.1,0.8], hookOverlap:[1,3],
  hookDepth:[5,10], clipWidth:[24,50], clipSpacing:[26,250],
  clampHoleDiameter:[3.2,3.8], nutAcrossFlats:[5.5,6.3], nutDepth:[2.4,3.2], segments:[32,128],
});
export class ParameterError extends Error {
  constructor(errors) { super(errors.join('\n')); this.name='ParameterError'; this.errors=errors; }
}
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const segment = h => {
  const n = ((h.slotLength ?? h.diameter) - h.diameter)/2;
  return h.slotAxis === 'y' ? [[h.x,h.y-n],[h.x,h.y+n]] : [[h.x-n,h.y],[h.x+n,h.y]];
};
// Exact segment distance in 2D, for round/slot footprint collision checks.
function segmentDistance(a,b,c,d) {
  const point = (p,u,v) => { const dx=v[0]-u[0],dy=v[1]-u[1];
    const t=Math.max(0,Math.min(1,((p[0]-u[0])*dx+(p[1]-u[1])*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(p[0]-u[0]-t*dx,p[1]-u[1]-t*dy); };
  const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  if (cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0) return 0;
  return Math.min(point(a,c,d),point(b,c,d),point(c,a,b),point(d,a,b));
}
export function normalizeParameters(input={}) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new ParameterError(['Parameters must be an object.']);
  const errors=[]; const p={...DEFAULTS,...input};
  for (const k of Object.keys(input)) if (!own(DEFAULTS,k)) errors.push(`Unknown parameter: ${k}`);
  for (const [k,[lo,hi]] of Object.entries(LIMITS))
    if (typeof p[k]!=='number' || !Number.isFinite(p[k]) || p[k]<lo || p[k]>hi) errors.push(`${k}: expected a number from ${lo} to ${hi} mm (segments is a count).`);
  if (!['screw','snap'].includes(p.retention)) errors.push("retention must be 'screw' or 'snap'.");
  if (![1,2].includes(p.clipCount)) errors.push('clipCount must be 1 or 2.');
  if (!Number.isInteger(p.segments)) errors.push('segments must be an integer.');
  if (![7.5,15].includes(p.railHeight)) errors.push('railHeight must be 7.5 or 15.');
  if (!['rectangle','line-x','line-y','custom'].includes(p.pattern)) errors.push('Unknown hole pattern.');
  if (!Array.isArray(p.holes) || p.holes.length>32) errors.push('holes must be an array with at most 32 entries.');
  if (errors.length) throw new ParameterError(errors);
  const coords=p.pattern==='rectangle' ? [[-p.pitchX/2,-p.pitchY/2],[p.pitchX/2,-p.pitchY/2],[-p.pitchX/2,p.pitchY/2],[p.pitchX/2,p.pitchY/2]]
    :p.pattern==='line-x' ? [[-p.pitchX/2,0],[p.pitchX/2,0]] :p.pattern==='line-y' ? [[0,-p.pitchY/2],[0,p.pitchY/2]] : null;
  const holes=coords ? coords.map(([x,y])=>({x,y,diameter:p.holeDiameter})) : p.holes.map(h=>h && typeof h==='object' ? {...h} : {});
  holes.forEach((h,i)=>{
    for(const k of Object.keys(h)) if(!['x','y','diameter','slotLength','slotAxis','standoffHeight'].includes(k)) errors.push(`Hole ${i+1}: unknown field ${k}.`);
    h.diameter ??= p.holeDiameter; h.slotLength ??= h.diameter; h.slotAxis ??= 'x'; h.standoffHeight ??= p.standoffHeight;
    if(![h.x,h.y,h.diameter,h.slotLength,h.standoffHeight].every(Number.isFinite) || h.diameter<2 || h.diameter>8 || h.slotLength<h.diameter || h.slotLength>80 || h.standoffHeight<0 || h.standoffHeight>30 || !['x','y'].includes(h.slotAxis)) errors.push(`Hole ${i+1}: invalid coordinates, diameter, slot, or standoff height.`);
  });
  if(errors.length) throw new ParameterError(errors);
  const centers=p.clipCount===1 ? [0] : [-p.clipSpacing/2,p.clipSpacing/2];
  const railHalf=p.railWidth/2, screwY=railHalf+6.5, jawOuter=railHalf+11.5;
  const fixedOuter=railHalf+p.fitClearance+4;
  const gap=p.flangeThickness+p.fitClearance;
  const snap=p.retention==='snap';
  let snapGeometry=null;
  if(snap){
    const thickness=p.snapBladeThickness, length=p.snapFreeLength;
    const radius=Math.max(1.2,thickness), anchorLength=4, headLength=4;
    const bladeInner=railHalf+p.fitClearance;
    const travel=p.hookOverlap+p.fitClearance;
    // Fixed 45-degree insertion ramp. XY flexure, bending toward +Y.
    const rampHeight=travel, depth=Math.max(4,rampHeight+0.4);
    const span=anchorLength+radius+length+headLength;
    const rootStart=-span/2, anchorEnd=rootStart+anchorLength;
    const freeStart=anchorEnd+radius, headStart=freeStart+length;
    const releaseOuter=p.height/2+4; // accessible beyond +Y plate edge
    const tabReach=releaseOuter-bladeInner-thickness;
    const strain=1.5*thickness*travel/(length*length);
    // Conservative screening allowance, NOT a proven FDM stress concentration factor.
    const screenedStrain=2*strain;
    const slope=1.5*travel/length;
    const sweptXAllowance=tabReach*Math.sin(Math.atan(slope))+1;
    if(screenedStrain>0.03) errors.push('Snap strain screen exceeds 3%; increase snapFreeLength or reduce snapBladeThickness / hookOverlap.');
    if(tabReach>35) errors.push('Snap release tab would reach over 35 mm; reduce plate height (or redesign release access).');
    if(centers.some(x=>Math.abs(x)+span/2+1>p.width/2)) errors.push('Snap flexure extends beyond plate X edges; increase width or reduce snapFreeLength / clipSpacing.');
    if(p.clipCount===2 && p.clipSpacing<span+sweptXAllowance+1) errors.push('Snap stations lack clearance for the moving release tabs; increase clipSpacing.');
    if(bladeInner+thickness+radius+1>p.height/2-p.cornerRadius) errors.push('Insufficient plate support above snap root; increase height or reduce cornerRadius.');
    if(gap+depth>p.railHeight+p.fitClearance/2-0.2) errors.push('Snap blade extends behind the schematic rail mounting plane; use deeper rail or reduce flange / overlap / clearance.');
    // Simplified beam load at x=L; a head-end force has a longer lever arm.
    const forceAtE=E=>E*depth*thickness**3*travel/(4*length**3);
    snapGeometry={thickness,length,radius,anchorLength,headLength,bladeInner,travel,
      rampHeight,depth,span,rootStart,anchorEnd,freeStart,headStart,releaseOuter,
      tabReach,strain,screenedStrain,sweptXAllowance,
      releaseForceEstimateN:[forceAtE(1200),forceAtE(2200)],
      modulusAssumptionMPa:[1200,2200],rampAngleToInsertionDeg:45,
      printZShift:Math.max(p.hookDepth,gap+depth)};
  }
  if(p.hookDepth-gap<2.5) errors.push('hookDepth must leave at least 2.5 mm below the rail flange gap.');
  if(!snap && p.hookDepth-p.nutDepth<2.4) errors.push('Retaining bar must leave at least 2.4 mm above the nut pocket.');
  if(p.cornerRadius>Math.min(p.width,p.height)/4) errors.push('cornerRadius is too large.');
  if(!snap && p.height/2<jawOuter+1.5) errors.push(`height must be at least ${2*(jawOuter+1.5)} mm.`);
  if(p.clipCount===2 && p.clipSpacing<p.clipWidth+4) errors.push('Clips need at least 4 mm separation.');
  if(centers.some(x=>Math.abs(x)+p.clipWidth/2>p.width/2-2)) errors.push('Clip extends too close to a plate side; increase width or reduce clip spacing/width.');
  const screws=snap?[]:centers.flatMap(x=>[-1,1].map(s=>({x:x+s*(p.clipWidth/2-6),y:screwY,diameter:p.clampHoleDiameter})));
  const headRadius=3.2; // reserve M3 socket head + a little tool clearance
  holes.forEach((h,i)=>{
    const [a,b]=segment(h),r=h.diameter/2+(h.standoffHeight>0?p.standoffWall:1.5);
    // Conservative inset box avoids rounded-corner clipping too.
    if(Math.max(Math.abs(a[0]),Math.abs(b[0]))+r>p.width/2-p.cornerRadius || Math.max(Math.abs(a[1]),Math.abs(b[1]))+r>p.height/2-p.cornerRadius) errors.push(`Hole ${i+1}: insufficient plate edge / corner clearance.`);
    for(const s of screws) if(segmentDistance(a,b,[s.x,s.y],[s.x,s.y])<r+headRadius+0.5) errors.push(`Hole ${i+1}: overlaps clamp screw/head clearance. Move the hole or clip.`);
    // Hole drills must not weaken the fixed hook or concealed jaw contact region.
    for(const x of centers){
      const ranges=snap?[[-fixedOuter,-railHalf+p.hookOverlap]]:[[-fixedOuter,-railHalf+p.hookOverlap],[railHalf-p.hookOverlap,jawOuter]];
      for(const [y0,y1] of ranges){
        const minX=Math.min(a[0],b[0])-h.diameter/2-1.5,maxX=Math.max(a[0],b[0])+h.diameter/2+1.5;
        const minY=Math.min(a[1],b[1])-h.diameter/2-1.5,maxY=Math.max(a[1],b[1])+h.diameter/2+1.5;
        if(maxX>x-p.clipWidth/2 && minX<x+p.clipWidth/2 && maxY>y0 && minY<y1) errors.push(`Hole ${i+1}: too close to a rail hook / retaining bar footprint. Move hole or clip.`);
      }
    }
    if(snap){
      const d=snapGeometry;
      for(const x of centers){
        const minX=Math.min(a[0],b[0])-h.diameter/2-1.5,maxX=Math.max(a[0],b[0])+h.diameter/2+1.5;
        const minY=Math.min(a[1],b[1])-h.diameter/2-1.5,maxY=Math.max(a[1],b[1])+h.diameter/2+1.5;
        // Only the anchor reaches the plate; do not reserve a fictitious full-width jaw.
        if(maxX>x+d.rootStart && minX<x+d.anchorEnd && maxY>d.bladeInner && minY<d.bladeInner+d.thickness+d.radius)
          errors.push(`Hole ${i+1}: too close to the snap anchor. Move hole or clip.`);
      }
    }
    for(let j=0;j<i;j++){
      const q=holes[j], [c,d]=segment(q),rq=q.diameter/2+(q.standoffHeight>0?p.standoffWall:0);
      if(segmentDistance(a,b,c,d)<r+rq+1) errors.push(`Holes ${j+1} and ${i+1}: insufficient separation.`);
    }
  });
  if(errors.length) throw new ParameterError([...new Set(errors)]);
  return { parameters:p, holes, centers, screws, gap, railHalf, screwY, jawOuter, fixedOuter, snap, snapGeometry };
}

/** Initialize once. Supply { locateFile: name => wasmURL } in a browser bundler. */
export async function createGenerator(wasmOptions={}) {
  const wasm=await ManifoldModule(wasmOptions); wasm.setup();
  const {Manifold:M,CrossSection:CS}=wasm;
  return {generate};
  function generate(input={}) {
    const n=normalizeParameters(input),{parameters:p,holes,centers,screws,gap,railHalf,jawOuter,fixedOuter,snap,snapGeometry}=n;
    const objects=[]; const keep=o=>(objects.push(o),o);
    const moved=(o,v)=>keep(o.translate(v));
    const box=(x,y,z,w,h,d)=>moved(keep(M.cube([w,h,d])),[x,y,z]);
    const cyl=(x,y,z,d,h,segments=p.segments)=>moved(keep(M.cylinder(h,d/2,d/2,segments)),[x,y,z]);
    const union=a=>a.length===1?a[0]:keep(M.union(a));
    const subtract=(a,b)=>keep(a.subtract(union(b)));
    const capsule=(h,wall,z,depth)=>{
      const [a,b]=segment(h),d=h.diameter+wall*2;
      if(h.slotLength===h.diameter) return cyl(h.x,h.y,z,d,depth);
      return union([cyl(...a,z,d,depth),cyl(...b,z,d,depth),
        h.slotAxis==='x'?box(a[0],h.y-d/2,z,b[0]-a[0],d,depth):box(h.x-d/2,a[1],z,d,b[1]-a[1],depth)]);
    };
    try {
      let plate;
      if(p.cornerRadius===0) plate=box(-p.width/2,-p.height/2,0,p.width,p.height,p.plateThickness);
      else {
        const path=[],r=p.cornerRadius;
        for(let q=0;q<4;q++){
          const cx=(q===0||q===3?1:-1)*(p.width/2-r), cy=(q<2?1:-1)*(p.height/2-r);
          for(let i=0;i<=12;i++){const a=(q*90+i*90/12)*Math.PI/180;path.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
        }
        plate=keep(keep(new CS([path])).extrude(p.plateThickness));
      }
      const solids=[plate];
      for(const h of holes) if(h.standoffHeight>0) solids.push(capsule(h,p.standoffWall,p.plateThickness-0.02,h.standoffHeight+0.02));
      for(const x of centers){
        solids.push(box(x-p.clipWidth/2,-fixedOuter,-p.hookDepth,p.clipWidth,fixedOuter-railHalf-p.fitClearance,p.hookDepth+0.02));
        solids.push(box(x-p.clipWidth/2,-fixedOuter,-p.hookDepth,p.clipWidth,fixedOuter-railHalf+p.hookOverlap,p.hookDepth-gap));
      }
      if(snap) for(const x of centers){
        const d=snapGeometry, b=d.bladeInner, t=d.thickness, r=d.radius;
        const z=-gap-d.depth;
        // Root block alone reaches the plate. Positive overlap is intentional here only.
        solids.push(box(x+d.rootStart,b,z,d.anchorLength,t+r,d.depth+gap+0.02));
        // Wider root shoulder below flange level, with both XY root fillets.
        solids.push(box(x+d.rootStart,b-r,z,d.anchorLength+0.02,t+2*r,d.depth));
        solids.push(box(x+d.anchorEnd-0.02,b,z,r+d.length+d.headLength+0.02,t,d.depth));
        for(const side of [-1,1]){
          const edge=side<0?b:b+t, cy=edge+side*r;
          const path=[[x+d.anchorEnd-0.02,edge-side*0.02],[x+d.anchorEnd-0.02,cy]];
          for(let i=1;i<=16;i++){
            const a=(180+(side<0?-1:1)*90*i/16)*Math.PI/180;
            path.push([x+d.freeStart+r*Math.cos(a),cy+r*Math.sin(a)]);
          }
          // final arc point is (freeStart, edge); closes onto straight blade edge.
          path.push([x+d.freeStart,edge-side*0.02]);
          if(side>0) path.reverse();
          solids.push(moved(keep(keep(new CS([path])).extrude(d.depth)),[0,0,z]));
        }
        // Triangle in YZ extruded along +X: local [u,v,w] -> [w,u,v].
        // Upper outer flange corner rides the diagonal as rail moves +Z relative to mount.
        const toothSection=keep(new CS([[ [railHalf-p.hookOverlap,-gap], [b+0.02,-gap-d.rampHeight], [b+0.02,-gap] ]]));
        const tooth=keep(toothSection.extrude(d.headLength));
        solids.push(moved(keep(tooth.rotate([90,0,90])),[x+d.headStart,0,0]));
        // Release ledge belongs to the FREE HEAD, never to the fixed root.
        // Pull outward (+Y); this directly bends the XY blade, with no deep return leg.
        solids.push(box(x+d.headStart,b+t-0.02,-gap-2,d.headLength,d.releaseOuter-b-t+0.02,2));
      }
      // Snap holes stop just below plate, so a drill never cuts a free blade/tab under it.
      const cuts=holes.map(h=>snap ? capsule(h,0,-0.02,p.plateThickness+h.standoffHeight+1) : capsule(h,0,-p.hookDepth-1,p.hookDepth+p.plateThickness+h.standoffHeight+2));
      for(const s of screws) cuts.push(cyl(s.x,s.y,-1,p.clampHoleDiameter,p.plateThickness+2));
      const rawMain=snap && cuts.length===0?union(solids):subtract(union(solids),cuts);
      // Snap-only cleanup prevents sub-micron CSG slivers collapsing in Float32 STL.
      let main=rawMain;
      if(snap){
        const mesh=rawMain.getMesh();
        const rounded=keep(new M({numProp:mesh.numProp,vertProperties:Float32Array.from(mesh.vertProperties),triVerts:mesh.triVerts,mergeFromVert:mesh.mergeFromVert,mergeToVert:mesh.mergeToVert}));
        main=keep(keep(rounded.asOriginal()).setTolerance(0.0001));
      }
      const parts=[pack('main',main,1)];
      const jaws=[];
      if(!snap) centers.forEach((x,i)=>{
        const a=box(x-p.clipWidth/2,railHalf+p.fitClearance,-p.hookDepth,p.clipWidth,jawOuter-railHalf-p.fitClearance,p.hookDepth);
        const lip=box(x-p.clipWidth/2,railHalf-p.hookOverlap,-p.hookDepth,p.clipWidth,jawOuter-railHalf+p.hookOverlap,p.hookDepth-gap);
        const jawCuts=[];
        for(const s of screws.slice(i*2,i*2+2)) {
          jawCuts.push(cyl(s.x,s.y,-p.hookDepth-1,p.clampHoleDiameter,p.hookDepth+2));
          jawCuts.push(cyl(s.x,s.y,-p.hookDepth-0.02,2*p.nutAcrossFlats/Math.sqrt(3),p.nutDepth+0.02,6));
        }
        const jaw=subtract(union([a,lip]),jawCuts); jaws.push(jaw);
        parts.push(pack(`jaw-${i+1}`,jaw,1));
      });
      // Dimensionally illustrative reference rail. Not a fabrication/export part.
      const t=p.flangeThickness,top=-p.fitClearance/2,railLength=p.width+30,web=24;
      const rail=union([
        box(-railLength/2,-web/2,top-p.railHeight,railLength,web,t),
        box(-railLength/2,-web/2,top-p.railHeight,railLength,t,p.railHeight),
        box(-railLength/2,web/2-t,top-p.railHeight,railLength,t,p.railHeight),
        box(-railLength/2,-railHalf,top-t,railLength,railHalf-web/2+t,t),
        box(-railLength/2,web/2-t,top-t,railLength,railHalf-web/2+t,t),
      ]);
      const reference=pack('reference-rail',rail,1);
      // Exact Boolean interference checks, excluding contact surfaces.
      for(const solid of [main,...jaws]){
        const collision=keep(solid.intersect(rail));
        if(collision.volume()>1e-6) throw new Error('Internal error: part interferes with reference rail.');
      }
      const printParts=parts.map((part,i)=>({
        ...part,
        // Main on X edge, jaws on their flat plate-contact side; STL z>=0.
        mesh: transformMesh(part.mesh,snap ? ([x,y,z])=>[x,y,z+snapGeometry.printZShift] : i===0 ? ([x,y,z])=>[-z,y,x+p.width/2] : ([x,y,z])=>[x-centers[i-1],-y,-z]),
      }));
      for (const part of printParts) part.bounds = meshBounds(part.mesh);
      const warnings=[
        'Prototype geometry: rail fit, load capacity, vibration resistance and temperature performance have NOT been physically tested.',
        'Main body: suggested X-edge orientation needs a brim and supports under projecting hooks/standoffs and some bores. Inspect the sliced toolpaths. Jaws: plate-contact face on bed; support the flange recess as needed.',
        'The retaining bar captures the rail lips; it does not friction-lock travel along X. Use rail end stops where longitudinal movement matters.',
        'Install rail clamp screws before the electronics. Use appropriate device screws; prevent their tips contacting rail, components or conductors.',
      ];
      if(snap){
        warnings.splice(1,3,
          'Snap prototype: beam runs along X, flexes +Y, and must stay in XY print layers. Suggested transform keeps Z up and puts the lowest feature on the bed; support the plate, beam, tab and ramp as needed. Remove support without fusing the flexure to the plate.',
          'Pull the free-head tab outward (+Y), clear the +Y flange, then tilt off the fixed hook. Release each station. Stop once clear; there is no overtravel stop.',
          'Snap is positive capture with clearance, not preload or an X-axis friction lock. Use rail end stops if needed. Fit, fatigue, PETG elasticity and load capacity require physical testing.',
          'Keep device screw tips/nuts and cables clear of the entire moving beam/tab envelope; hole validation checks the printed anchor, not hardware.');
      }
      if(!snap && holes.some(h=>h.standoffHeight<5)) warnings.push('Low device clearance: M3 socket heads protrude above the plate. Confirm the device underside clears them; increase standoffs if needed.');
      if(p.width>150 || p.height>150 || holes.some(h=>h.standoffHeight>15)) warnings.push('Large spans/tall standoffs: stiffness and load capacity require particular attention.');
      holes.forEach((h,i)=>{
        const [a,b]=segment(h), hardwareRadius=Math.max(3.2,h.diameter);
        const lo=Math.min(a[1],b[1])-hardwareRadius,hi=Math.max(a[1],b[1])+hardwareRadius;
        if ((hi>=11 && lo<=railHalf) || (hi>=-railHalf && lo<=-11)) warnings.push(`Hole ${i+1}: back-side hardware may overlap a rail lip/sidewall. Check your screw/nut envelope before printing.`);
      });
      const grip=p.plateThickness+p.hookDepth-p.nutDepth;
      return {version:VERSION,units:'mm',parameters:p,resolvedHoles:holes,parts,printParts,reference,
        hardware:{clampScrews:{count:snap?0:p.clipCount*2,type:snap?'None (integral snap)':'M3 socket-head machine screw',lengthUnderHeadRange:snap?null:[Number((grip+2.4).toFixed(2)),Number((p.plateThickness+p.hookDepth+1).toFixed(2))]},
          clampNuts:{count:snap?0:p.clipCount*2,type:snap?'None (integral snap)':'M3 hex nut; verify actual thickness and across-flats'},deviceScrews:{count:holes.length,type:'Choose for your device; mounting bores are plain clearance holes, NOT threads.'}},
        dimensions:{flangeGap:gap,clipCentersX:centers,clampScrewCenters:screws.map(({x,y})=>[x,y]),railRunsAlong:'X',...(snap?{retention:'snap',snap:snapGeometry}:{})},warnings};
    } finally { for(let i=objects.length-1;i>=0;i--) objects[i].delete(); }
    function pack(name,solid,quantity) {
      if(solid.status()!=='NoError'||solid.isEmpty()) throw new Error(`Invalid solid: ${name} (${solid.status()})`);
      const components=solid.decompose(); const count=components.length; components.forEach(o=>o.delete());
      if(count!==1) throw new Error(`${name} must have one connected component; got ${count}.`);
      const raw=solid.getMesh();
      const positions=new Float32Array(raw.numVert*3);
      for(let i=0;i<raw.numVert;i++)for(let j=0;j<3;j++) positions[3*i+j]=raw.vertProperties[raw.numProp*i+j];
      const mesh={positions,indices:new Uint32Array(raw.triVerts)};
      return {name,quantity,mesh,volumeMm3:solid.volume(),bounds:solid.boundingBox(),triangles:mesh.indices.length/3};
    }
  }
}
export function transformMesh(mesh,transform) {
  const positions=new Float32Array(mesh.positions.length);
  for(let i=0;i<positions.length;i+=3)positions.set(transform(Array.from(mesh.positions.subarray(i,i+3))),i);
  return {positions,indices:new Uint32Array(mesh.indices)};
}
/** Binary STL has no unit metadata. Import into slicer as millimetres. */
export function toSTL(mesh,description='DIN mount core; units mm') {
  const {positions:p,indices:idx}=mesh;
  if(!(p instanceof Float32Array)||!(idx instanceof Uint32Array)||p.length%3||idx.length%3||!idx.length) throw new Error('Expected nonempty indexed triangle mesh.');
  if(!p.every(Number.isFinite)||idx.some(i=>i*3+2>=p.length)) throw new Error('Invalid mesh vertices or indices.');
  const count=idx.length/3,buffer=new ArrayBuffer(84+count*50),v=new DataView(buffer);
  new Uint8Array(buffer,0,80).set(new TextEncoder().encode(description).slice(0,80)); v.setUint32(80,count,true);
  for(let t=0;t<count;t++){
    const a=idx[t*3]*3,b=idx[t*3+1]*3,c=idx[t*3+2]*3;
    const u=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],w=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]];
    const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],length=Math.hypot(...n);
    if(!length) throw new Error('Degenerate triangle in STL export.');
    let offset=84+t*50;
    for(const f of [...n.map(x=>x/length),...p.subarray(a,a+3),...p.subarray(b,b+3),...p.subarray(c,c+3)]){v.setFloat32(offset,f,true);offset+=4;}
    v.setUint16(offset,0,true);
  }
  return new Uint8Array(buffer);
}

export function meshBounds(mesh) {
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<mesh.positions.length;i++) {const a=i%3;min[a]=Math.min(min[a],mesh.positions[i]);max[a]=Math.max(max[a],mesh.positions[i]);}
  return {min,max};
}
