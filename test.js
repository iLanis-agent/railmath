const e = require('./engine.js');
const cases = require('./expected.json');
let pass=0, fail=0;
const close=(a,b)=>Math.abs(a-b) <= 1e-9*Math.max(1,Math.abs(b));
function cmp(a,b,path){
  if (typeof b==='number'){ if(!(typeof a==='number'&&close(a,b))) throw new Error(path+': '+a+' != '+b); return; }
  if (typeof b==='object'&&b!==null){ for(const k of Object.keys(b)) cmp(a&&a[k],b[k],path+'.'+k); return; }
  if (a!==b) throw new Error(path+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
}
const fns={speed:e.scaleSpeed,grade:e.grade,helix:e.helix,cap:e.capacity};
for(const c of cases){
  try{ cmp(fns[c.fn](...c.args),c.exp,c.fn+'('+c.args+')'); pass++; }
  catch(err){ fail++; console.log('FAIL',err.message); }
}
// anchors: exact unit conversions + published scale ratios
const A=[[e.MPH_TO_INPS,17.6],[e.SCALES.HO,87.1],[e.SCALES.N,160],[e.SCALES.O,48],[e.SCALES.Z,220],[e.SCALES.G,22.5],
  [e.scaleSpeed(60,'HO',40).passSec, 40/(60*5280/3600)]];
for(const [g,w] of A){ if(close(g,w)) pass++; else { fail++; console.log('ANCHOR FAIL',g,w);} }
function prop(name,f){ try{ if(!f()) throw 0; pass++; }catch{ fail++; console.log('PROP FAIL',name); } }
prop('scale-time invariance: passage seconds identical across scales',()=>{
  const a=e.scaleSpeed(60,'N',40).passSec, b=e.scaleSpeed(60,'G',40).passSec; return close(a,b); });
prop('model mph shrinks with ratio',()=> e.scaleSpeed(60,'Z',40).modelMph < e.scaleSpeed(60,'O',40).modelMph);
prop('grade is linear in rise',()=> close(e.grade(4,100).pct, 2*e.grade(2,100).pct));
prop('grade bands order correctly',()=> e.grade(1,100).band!==e.grade(5,100).band && e.grade(3,100).band.includes('steep'));
prop('helix turns cover the climb',()=>{ const h=e.helix(24,2.5,16,3.5,0.5); return h.turns*h.risePerTurn>=h.climbIn; });
prop('helix track = circ x exact turns',()=>{ const h=e.helix(30,2,12,3,0.5); return close(h.trackIn,h.circ*h.turnsExact); });
prop('bigger radius raises rise per turn',()=> e.helix(36,2,16,3.5,0.5).risePerTurn > e.helix(18,2,16,3.5,0.5).risePerTurn);
prop('capacity cars fit on track',()=>{ const c=e.capacity(60,40,'HO'); return c.cars*c.pitch<=60 && (c.cars+1)*c.pitch>60; });
prop('longer cars mean fewer cars',()=> e.capacity(96,89,'HO').cars < e.capacity(96,40,'HO').cars);
prop('speed doubles halves passage time',()=> close(e.scaleSpeed(120,'HO',40).passSec, e.scaleSpeed(60,'HO',40).passSec/2));
for(const bad of [[0,'HO',40],[60,'HO',0],[-5,'N',40]]){ try{ e.scaleSpeed(...bad); fail++; console.log('ERR FAIL',bad);}catch{ pass++; } }
try{ e.scaleSpeed(60,'H0',40); fail++; console.log('ERR FAIL unknown scale'); }catch{ pass++; }
for(const bad of [[0,100],[2,0],[-1,50]]){ try{ e.grade(...bad); fail++; console.log('ERR FAIL grade',bad);}catch{ pass++; } }
for(const bad of [[0,2,10,3,0.5],[24,0,10,3,0.5],[24,2,0,3,0.5],[24,2,10,0,0.5],[24,2,10,3,-1]]){ try{ e.helix(...bad); fail++; console.log('ERR FAIL helix',bad);}catch{ pass++; } }
for(const bad of [[0,40,'HO'],[60,0,'HO']]){ try{ e.capacity(...bad); fail++; console.log('ERR FAIL cap',bad);}catch{ pass++; } }
console.log(pass+'/'+(pass+fail)+' checks pass');
process.exit(fail?1:0);
