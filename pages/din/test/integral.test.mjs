import test from 'node:test';
import assert from 'node:assert/strict';
import ManifoldModule from 'manifold-3d';
import {createGenerator,PRESETS,normalizeParameters,ParameterError,toSTL,meshBounds} from '../core.mjs';
import {createGenerator as oldCreate,PRESETS as oldPresets,toSTL as oldSTL} from './core.screw-baseline.mjs';
const generator=await createGenerator(), old=await oldCreate();
const wasm=await ManifoldModule();wasm.setup();
const {Manifold:M}=wasm;
const input=p=>({...PRESETS.pcb4,retention:'snap',...p});
function solid(part){return new M({numProp:3,vertProperties:part.mesh.positions,triVerts:part.mesh.indices});}
function checkExport(part){
  const bytes=toSTL(part.mesh),v=new DataView(bytes.buffer),count=v.getUint32(80,true),edges=new Map();let volume=0;
  assert.equal(bytes.length,84+50*count);
  const key=p=>p.map(x=>Math.round(x*1e5)).join(',');
  for(let t=0;t<count;t++){
    const off=84+t*50,p=[0,1,2].map(i=>[0,1,2].map(j=>v.getFloat32(off+12+i*12+j*4,true)));
    assert.ok(p.flat().every(Number.isFinite));
    for(let i=0;i<3;i++){const a=key(p[i]),b=key(p[(i+1)%3]);const k=a<b?`${a}|${b}`:`${b}|${a}`;const e=edges.get(k)||[0,0];e[0]++;e[1]+=a<b?1:-1;edges.set(k,e);}
    const [a,b,c]=p;volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  }
  for(const [count,balance] of edges.values()){assert.equal(count,2);assert.equal(balance,0);}
  assert.ok(volume>0);assert.ok(Math.abs(volume-part.volumeMm3)/part.volumeMm3<1e-5);
}
test('original screw STL bytes are identical for all original presets and a varied configuration',()=>{
  for(const p of [...Object.values(oldPresets),{...oldPresets.psu2,plateThickness:7,hookDepth:8,railHeight:15}]){
    const a=old.generate(p),b=generator.generate(p),explicit=generator.generate({...p,retention:'screw'});
    for(const category of ['parts','printParts'])for(let i=0;i<a[category].length;i++){
      assert.deepEqual(toSTL(b[category][i].mesh),oldSTL(a[category][i].mesh));
      assert.deepEqual(toSTL(explicit[category][i].mesh),oldSTL(a[category][i].mesh));
    }
  }
});
test('snap acceptance: one watertight part, no clamp hardware, Y line at 50 mm allowed',()=>{
  for(const p of [input({}),input({pattern:'line-y',pitchY:50}),{...PRESETS.psu2,retention:'snap'},{...PRESETS.fitCoupon,retention:'snap',width:48,height:66}]){
    const r=generator.generate(p);assert.equal(r.parts.length,1);assert.equal(r.hardware.clampScrews.count,0);assert.equal(r.hardware.clampNuts.count,0);
    checkExport(r.parts[0]);checkExport(r.printParts[0]);
    assert.ok(Math.abs(meshBounds(r.printParts[0].mesh).min[2])<1e-5);
    // Translation only: print preserves XY bending plane and Z layer normal.
    const a=r.parts[0].mesh.positions,b=r.printParts[0].mesh.positions;
    for(let i=0;i<a.length;i+=3){assert.equal(a[i],b[i]);assert.equal(a[i+1],b[i+1]);}
  }
});
test('real clearance separates blade from plate except at its anchor',()=>{
  const p=input({}),r=generator.generate(p),d=r.dimensions.snap;
  const main=solid(r.parts[0]);
  const q=M.cube([d.length, d.thickness, r.dimensions.flangeGap-0.02]);
  const probe=q.translate([d.freeStart,d.bladeInner,-r.dimensions.flangeGap+0.01]);
  const hit=main.intersect(probe);
  try{assert.ok(hit.volume()<1e-7);}finally{hit.delete();probe.delete();q.delete();main.delete();}
});
test('actual exported head: ramp causes insertion contact, released head clears flange, relaxed seated head clears',()=>{
  const p=input({}),r=generator.generate(p),d=r.dimensions.snap,main=solid(r.parts[0]);
  const allocated=[main],keep=o=>(allocated.push(o),o);
  try{
    const crop=keep(keep(M.cube([d.headLength+0.001,100,100])).translate([d.headStart,-5,-100]));
    const head=keep(main.intersect(crop));
    const released=keep(head.translate([0,d.travel,0]));
    const flange=keep(keep(M.cube([d.headLength+2,p.railWidth/2-11,p.flangeThickness])).translate([d.headStart-1,11,-p.flangeThickness-p.fitClearance/2]));
    assert.ok(keep(head.intersect(flange)).volume()<1e-6);
    let collided=false;
    for(let i=0;i<=24;i++){
      const offset=-(d.rampHeight+p.flangeThickness+0.2)*(1-i/24);
      const f=keep(flange.translate([0,0,offset]));
      if(keep(head.intersect(f)).volume()>1e-5)collided=true;
      assert.ok(keep(released.intersect(f)).volume()<1e-6);
    }
    assert.ok(collided,'Unflexed ramp must encounter incoming flange, otherwise it cannot cam.');
  }finally{allocated.reverse().forEach(o=>o.delete());}
});
test('snap nominal and screened strain plus force are exposed with explicit modulus assumptions',()=>{
  const d=generator.generate(input({})).dimensions.snap;
  assert.ok(Math.abs(d.strain-3*1.2*2.3/28**2)<1e-12);
  assert.ok(d.screenedStrain<=0.03);assert.deepEqual(d.modulusAssumptionMPa,[1200,2200]);
  assert.ok(d.releaseForceEstimateN[0]>1.7&&d.releaseForceEstimateN[1]<3.3);
});
test('derived constraints reject wrong enum, obsolete depth, excessive strain, short spacing and anchor-hole collision',()=>{
  const d=normalizeParameters(input({})).snapGeometry;
  for(const p of [input({retention:'other'}),input({snapArmDepth:20}),input({snapBladeThickness:2,snapFreeLength:18,hookOverlap:3,fitClearance:0.8}),input({height:150}),input({clipCount:2,clipSpacing:30}),input({pattern:'custom',holes:[{x:d.rootStart+2,y:d.bladeInner+1}]})])assert.throws(()=>normalizeParameters(p),ParameterError);
});
test('256 corner combinations: connected manifold, assembled zero interference, no negative print Z',()=>{
  let count=0;
  for(const railWidth of [34,36])for(const railHeight of [15])for(const flangeThickness of [0.8,2])for(const fitClearance of [0.1,0.8])for(const hookOverlap of [1,3])for(const plateThickness of [3,12])for(const clipWidth of [24,50])for(const clipCount of [1,2])for(const snapBladeThickness of [0.8,1.2]){
    const r=generator.generate(input({width:220,height:84,snapFreeLength:36,pattern:'custom',holes:[],railWidth,railHeight,flangeThickness,fitClearance,hookOverlap,plateThickness,clipWidth,clipCount,clipSpacing:72,hookDepth:8,snapBladeThickness}));
    toSTL(r.parts[0].mesh);toSTL(r.printParts[0].mesh);
    assert.equal(r.parts.length,1);assert.ok(r.parts[0].volumeMm3>0);assert.ok(meshBounds(r.printParts[0].mesh).min[2]>=-1e-5);count++;
  }
  assert.equal(count,256);
});

// Isolate head and stationary supports from actual mesh. Test contact boundaries,
// not just arithmetic fields; this is rigid head kinematics, not an FEA solution.
test('load shelf and travel stop are separate at rest and arrest the intended head motions',()=>{
 const r=generator.generate(input({})),d=r.dimensions.snap,p=r.parameters,m=solid(r.parts[0]);
 const objs=[m],k=o=>(objs.push(o),o),box=(x,y,z,a,b,c)=>k(k(M.cube([a,b,c])).translate([x,y,z]));
 try{
  const head=k(m.intersect(box(d.headStart+0.03,d.bladeInner-2.5,-r.dimensions.flangeGap-d.depth+0.01,d.headLength-0.06,d.headOuter-d.bladeInner+2.51,d.depth-0.02)));
  const stop=k(m.intersect(box(d.stopStartX,d.stopY,-r.dimensions.flangeGap-d.depth,d.wallEnd-d.stopStartX,d.stopOuter-d.stopY,r.dimensions.flangeGap+d.depth)));
  const shelf=k(m.intersect(box(d.headStart-0.5,d.bladeInner+0.1,d.bearingBottom,d.wallEnd-d.headStart+0.5,d.headOuter+d.stopTravel+0.5-d.bladeInner-0.1,d.shelf)));
  assert.ok(head.volume()>0&&stop.volume()>0&&shelf.volume()>0);
  assert.ok(k(head.intersect(stop)).volume()<1e-6);assert.ok(k(head.intersect(shelf)).volume()<1e-6);
  assert.ok(k(k(head.translate([0,d.travel,0])).intersect(stop)).volume()<1e-6);
  assert.ok(k(k(head.translate([0,d.stopTravel+0.1,0])).intersect(stop)).volume()>0.001);
  assert.ok(k(k(head.translate([0,0,-p.snapClearance+0.03])).intersect(shelf)).volume()<1e-6);
  assert.ok(k(k(head.translate([0,0,-p.snapClearance-0.1])).intersect(shelf)).volume()>0.001);
 }finally{objs.reverse().forEach(o=>o.delete());}
});
