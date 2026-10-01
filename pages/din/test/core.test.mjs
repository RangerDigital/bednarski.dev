import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenerator, PRESETS, normalizeParameters, ParameterError, toSTL, meshBounds, lighteningSlots } from '../core.mjs';
const generator = await createGenerator();
// Independent verification of serialized STL: welded topology, directed edges,
// signed volume, finite vertices and unit-length normals.
function checkSTL(bytes,expectedVolume){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),triangleCount=view.getUint32(80,true);
  assert.equal(bytes.length,84+triangleCount*50);let volume=0;const edges=new Map();
  const vertexKey=point=>point.map(component=>Math.round(component*1e5)).join(',');
  for(let triangle=0;triangle<triangleCount;triangle++){
    const offset=84+triangle*50,normal=[0,1,2].map(axis=>view.getFloat32(offset+axis*4,true));
    assert.ok(Math.abs(Math.hypot(...normal)-1)<1e-5);
    const vertices=[0,1,2].map(vertex=>[0,1,2].map(axis=>view.getFloat32(offset+12+vertex*12+axis*4,true)));
    assert.ok(vertices.flat().every(Number.isFinite));
    for(let vertex=0;vertex<3;vertex++){
      const from=vertexKey(vertices[vertex]),to=vertexKey(vertices[(vertex+1)%3]);assert.notEqual(from,to);
      const edgeKey=from<to?`${from}|${to}`:`${to}|${from}`,edge=edges.get(edgeKey)||[0,0];edge[0]++;edge[1]+=from<to?1:-1;edges.set(edgeKey,edge);
    }
    const [vertexA,vertexB,vertexC]=vertices;
    volume+=(vertexA[0]*(vertexB[1]*vertexC[2]-vertexB[2]*vertexC[1])+vertexA[1]*(vertexB[2]*vertexC[0]-vertexB[0]*vertexC[2])+vertexA[2]*(vertexB[0]*vertexC[1]-vertexB[1]*vertexC[0]))/6;
  }
  for(const [edgeKey,[uses,direction]] of edges){assert.equal(uses,2,`open/nonmanifold edge ${edgeKey}`);assert.equal(direction,0,'inconsistent winding');}
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
  const model=generator.generate(params);assert.equal(model.parts.length,1+params.clipCount);
  for(const part of [...model.parts,...model.printParts])checkSTL(toSTL(part.mesh),part.volumeMm3);
  for(const part of model.printParts){const printBounds=meshBounds(part.mesh);assert.ok(Math.abs(printBounds.min[2])<1e-5);assert.deepEqual(printBounds,part.bounds);}
  const mainBounds=meshBounds(model.parts[0].mesh);
  assert.ok(Math.abs(mainBounds.max[0]-mainBounds.min[0]-params.width)<1e-5);
  assert.ok(Math.abs(mainBounds.max[1]-mainBounds.min[1]-params.height)<1e-5);
  assert.equal(model.resolvedHoles.length,params.pattern==='rectangle'?4:params.pattern==='custom'?params.holes.length:2);
});
test('invalid inputs are rejected before geometry, without state corruption',()=>{
  for(const invalid of [null,{width:NaN},{height:Infinity},{clipCount:0},{widht:90},{pattern:'custom',holes:[{x:0,y:24}]},{pitchX:299},{clipCount:2,clipSpacing:28},{pattern:'custom',holes:[{x:20,y:0},{x:20,y:0}]},{holeDiameter:-1},{pattern:'custom',holes:[{x:20,y:0,slotLength:1}]}]) assert.throws(()=>normalizeParameters(invalid),ParameterError);
  assert.equal(generator.generate(PRESETS.pcb4).parts.length,2);
});
test('clearance changes actual geometry, not only metadata',()=>{
  const tight=generator.generate({...PRESETS.fitCoupon,fitClearance:0.1});
  const loose=generator.generate({...PRESETS.fitCoupon,fitClearance:0.6});
  assert.notEqual(tight.parts[0].volumeMm3,loose.parts[0].volumeMm3);
  assert.ok(loose.parts[1].volumeMm3<tight.parts[1].volumeMm3);
});
test('snap clip: one integral part, watertight, and it unlocks close centre-line holes',()=>{
  // A Y-line pattern at 50 mm puts holes where the bar and its screw heads sit, so it only
  // exists in snap mode (or with two clip stations).
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,pattern:'line-y',pitchY:50}),ParameterError);
  const snapYLine50={...PRESETS.pcb4,retention:'snap',pattern:'line-y',pitchY:50};
  assert.ok(normalizeParameters(snapYLine50));
  for(const params of [snapYLine50,{...PRESETS.psu2,retention:'snap'},{...PRESETS.pcb4,retention:'snap',railHeight:15,flangeThickness:2,snapFreeLength:30}]){
    const model=generator.generate(params);
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
  // Derived constraint, not an input range: the screen is evaluated at the travel stop, so leaves
  // that release inside the limit still fail once the stop clearance is added to the travel.
  const stopTravelLeaves={...PRESETS.pcb4,retention:'snap',snapFreeLength:28,snapBladeThickness:1.2,hookOverlap:2.2,fitClearance:0.7,height:80,railHeight:15};
  assert.ok(normalizeParameters({...stopTravelLeaves,snapClearance:0.3}).snapGeometry.screenedStrain<=0.03);
  assert.throws(()=>normalizeParameters({...stopTravelLeaves,snapClearance:0.6}),ParameterError);
});
test('lightening: one watertight part, and exactly the reported volume is removed',()=>{
  const configurations=[['pcb4',PRESETS.pcb4],['psu2',PRESETS.psu2],['snap',{...PRESETS.pcb4,retention:'snap'}]];
  for(const [name,baseParameters] of configurations){
    const params={...baseParameters,lightening:true};
    const solid=generator.generate(baseParameters);
    const lightened=generator.generate(params),info=lightened.dimensions.lightening;
    assert.equal(lightened.parts.length,params.retention==='snap'?1:1+params.clipCount,name);
    assert.ok(info.slots>2,`${name}: expected a slot pattern`);
    checkSTL(toSTL(lightened.parts[0].mesh),lightened.parts[0].volumeMm3);
    // The report is the analytic capsule volume, so a slot clipping a bore, a clip footprint or a
    // snap blade would remove a different amount of material and show up as drift here.
    const removed=solid.parts[0].volumeMm3-lightened.parts[0].volumeMm3;
    assert.ok(Math.abs(removed-info.removedMm3)/info.removedMm3<0.02,`${name}: removed ${removed} vs reported ${info.removedMm3}`);
    assert.ok(removed>solid.parts[0].volumeMm3*0.2,`${name}: expected a real saving`);
    assert.ok(lightened.parts[0].triangles>solid.parts[0].triangles,name);
  }
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,lightening:true,slotWidth:12}),ParameterError);
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,lightening:true,ribWidth:0.4}),ParameterError);
  assert.throws(()=>normalizeParameters({...PRESETS.pcb4,lightening:'yes'}),ParameterError);
});
test('lightening layout: inside the plate, clear of every bore and clip footprint',()=>{
  const configuration=normalizeParameters({...PRESETS.psu2,lightening:true});
  const slots=lighteningSlots(configuration), {width,height,slotWidth}=configuration.parameters;
  assert.ok(slots.length>20);
  for(const slot of slots){
    assert.ok(Math.abs(slot.x)+slot.length/2<=width/2+1e-9);
    assert.ok(Math.abs(slot.y)+slotWidth/2<=height/2+1e-9);
    for(const hole of configuration.holes){
      const gapX=Math.abs(slot.x-hole.x)-(slot.length/2+hole.diameter/2);
      const gapY=Math.abs(slot.y-hole.y)-(slotWidth/2+hole.diameter/2);
      assert.ok(gapX>0||gapY>0,`slot at (${slot.x},${slot.y}) reaches hole at (${hole.x},${hole.y})`);
    }
  }
  assert.deepEqual(lighteningSlots({parameters:{lightening:false}}),[]);
});
