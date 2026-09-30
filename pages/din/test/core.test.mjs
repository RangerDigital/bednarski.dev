import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenerator, PRESETS, normalizeParameters, ParameterError, toSTL, meshBounds } from '../core.mjs';
const g=await createGenerator();
// Independent verification of serialized STL: welded topology, directed edges,
// signed volume, finite vertices and unit-length normals.
function checkSTL(bytes,expectedVolume){
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=v.getUint32(80,true);
  assert.equal(bytes.length,84+n*50);let volume=0;const edges=new Map();
  const key=p=>p.map(x=>Math.round(x*1e5)).join(',');
  for(let t=0;t<n;t++){
    const off=84+t*50,normal=[0,1,2].map(i=>v.getFloat32(off+i*4,true));
    assert.ok(Math.abs(Math.hypot(...normal)-1)<1e-5);
    const p=[0,1,2].map(i=>[0,1,2].map(j=>v.getFloat32(off+12+i*12+j*4,true)));
    assert.ok(p.flat().every(Number.isFinite));
    for(let i=0;i<3;i++){
      const a=key(p[i]),b=key(p[(i+1)%3]);assert.notEqual(a,b);
      const k=a<b?`${a}|${b}`:`${b}|${a}`,e=edges.get(k)||[0,0];e[0]++;e[1]+=a<b?1:-1;edges.set(k,e);
    }
    const [a,b,c]=p;
    volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  }
  for(const [edge,[count,direction]] of edges){assert.equal(count,2,`open/nonmanifold edge ${edge}`);assert.equal(direction,0,'inconsistent winding');}
  assert.ok(volume>0);assert.ok(Math.abs(volume-expectedVolume)/expectedVolume<1e-5);
}
const cases={...PRESETS,
  slots:{...PRESETS.custom,holes:[{x:-30,y:-20,diameter:3.4,slotLength:12,slotAxis:'y',standoffHeight:9},{x:30,y:20,diameter:4.5,slotLength:10,slotAxis:'x',standoffHeight:0}]},
  vertical:{...PRESETS.pcb4,height:100,pattern:'line-y',pitchY:80},
  thickRail:{...PRESETS.psu2,railHeight:15,flangeThickness:2,fitClearance:0.6,hookDepth:8},
  noBosses:{...PRESETS.pcb4,standoffHeight:0,cornerRadius:0},
  minimum:{...PRESETS.fitCoupon,width:32,clipWidth:24,plateThickness:3},
};
for(const [name,params] of Object.entries(cases))test(`${name}: watertight STL, orientation, dimensions and parts`,()=>{
  const model=g.generate(params);assert.equal(model.parts.length,1+params.clipCount);
  for(const part of [...model.parts,...model.printParts])checkSTL(toSTL(part.mesh),part.volumeMm3);
  for(const part of model.printParts){const b=meshBounds(part.mesh);assert.ok(Math.abs(b.min[2])<1e-5);assert.deepEqual(b,part.bounds);}
  const main=model.parts[0],b=meshBounds(main.mesh);
  assert.ok(Math.abs(b.max[0]-b.min[0]-params.width)<1e-5);
  assert.ok(Math.abs(b.max[1]-b.min[1]-params.height)<1e-5);
  assert.equal(model.resolvedHoles.length,params.pattern==='rectangle'?4:params.pattern==='custom'?params.holes.length:2);
});
test('invalid inputs are rejected before geometry, without state corruption',()=>{
  for(const p of [null,{width:NaN},{height:Infinity},{clipCount:0},{widht:90},{pattern:'custom',holes:[{x:0,y:24}]},{pitchX:299},{clipCount:2,clipSpacing:28},{pattern:'custom',holes:[{x:20,y:0},{x:20,y:0}]},{holeDiameter:-1},{pattern:'custom',holes:[{x:20,y:0,slotLength:1}]}]) assert.throws(()=>normalizeParameters(p),ParameterError);
  assert.equal(g.generate(PRESETS.pcb4).parts.length,2);
});
test('clearance changes actual geometry, not only metadata',()=>{
  const tight=g.generate({...PRESETS.fitCoupon,fitClearance:0.1});
  const loose=g.generate({...PRESETS.fitCoupon,fitClearance:0.6});
  assert.notEqual(tight.parts[0].volumeMm3,loose.parts[0].volumeMm3);
  assert.ok(loose.parts[1].volumeMm3<tight.parts[1].volumeMm3);
});
test('snap clip: one integral part, watertight, and it unlocks close centre-line holes',()=>{
  // A Y-line pattern at 50 mm puts holes where the bar and its screw heads sit, so it only
  // exists in snap mode (or with two clip stations).
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,pattern:'line-y',pitchY:50}),ParameterError);
  const y50={...PRESETS.pcb4,retention:'snap',pattern:'line-y',pitchY:50};
  assert.ok(normalizeParameters(y50));
  for(const params of [y50,{...PRESETS.psu2,retention:'snap'},{...PRESETS.pcb4,retention:'snap',railHeight:15,flangeThickness:2,snapFreeLength:30}]){
    const model=g.generate(params);
    assert.equal(model.dimensions.retention,'snap');
    assert.equal(model.parts.length,1);
    assert.equal(model.hardware.clampScrews.count,0);
    assert.equal(model.hardware.clampScrews.lengthUnderHeadRange,null);
    assert.ok(model.dimensions.snap.strain>0 && model.dimensions.snap.screenedStrain<=0.03);
    assert.equal(model.dimensions.snap.rampAngleToInsertionDeg,45);
    assert.equal(model.resolvedHoles.length,params.pattern==='rectangle'?4:2);
    for(const part of [...model.parts,...model.printParts]) checkSTL(toSTL(part.mesh),part.volumeMm3);
    for(const part of model.printParts) assert.ok(Math.abs(meshBounds(part.mesh).min[2])<1e-5);
  }
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,retention:'glue'}),ParameterError);
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,retention:'snap',snapFreeLength:14,snapBladeThickness:5}),ParameterError);
  // Derived constraint, not an input range: a short, thick blade with large travel fails the
  // strain screen even though every individual value is inside its own limit.
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,retention:'snap',snapFreeLength:18,snapBladeThickness:2,hookOverlap:3,fitClearance:0.8}),ParameterError);
});
