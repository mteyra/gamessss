import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveCamera,sceneMarkup} from '../dist/film-renderer.js';
import {LESSONS} from '../dist/lessons.js';

test('A film chapter joins the same wide camera at both endpoints',()=>{
 for(const lesson of Object.values(LESSONS))for(let i=1;i<lesson.steps.length;i++){
  const a=deriveCamera(lesson.steps[i-1],lesson.steps[i],0),b=deriveCamera(lesson.steps[i-1],lesson.steps[i],1);
  for(const key of ['x','y','width','height'])assert.ok(Math.abs(a[key]-b[key])<1e-8);
  assert.equal(a.width/a.height,16/9);
 }
});
test('Camera movement preserves the entire court and never exceeds the zoom ceiling',()=>{
 for(const lesson of Object.values(LESSONS))for(let i=1;i<lesson.steps.length;i++)for(const progress of [0,.1,.25,.5,.75,.9,1]){
  const c=deriveCamera(lesson.steps[i-1],lesson.steps[i],progress);
  assert.ok(c.zoom>=1&&c.zoom<=1.12);assert.ok(c.x<=-4+1e-8);assert.ok(c.y<=-4+1e-8);assert.ok(c.x+c.width>=644-1e-8);assert.ok(c.y+c.height>=404-1e-8);
  assert.ok(Math.abs(c.width/c.height-16/9)<1e-8);
 }
});
test('Pure SVG export is deterministic, self-contained and respects reduced motion',()=>{
 const [setup,move]=LESSONS.islands.steps;
 const one=sceneMarkup(setup,move,.5,{id:'test',width:960,height:540,title:'A < B & C'});
 assert.equal(one,sceneMarkup(setup,move,.5,{id:'test',width:960,height:540,title:'A < B & C'}));
 assert.match(one,/width="960" height="540"/);assert.match(one,/A &lt; B &amp; C/);assert.ok(!one.includes('NaN'));
 const still=sceneMarkup(setup,move,.5,{motion:false});assert.ok(!still.includes('film-route-tail'));assert.ok(!still.includes('film-change-ring'));assert.ok(still.includes('translate(250 185)'));
 assert.deepEqual(deriveCamera(setup,move,.5,{motion:false}),deriveCamera(null,setup,1));
});
test('Every game can export finite complete film frames without a browser',()=>{
 for(const lesson of Object.values(LESSONS))for(let i=0;i<lesson.steps.length;i++)for(const p of [0,.5,1]){
  const svg=sceneMarkup(lesson.steps[i-1],lesson.steps[i],p);
  assert.ok(svg.startsWith('<svg'));assert.ok(svg.endsWith('</svg>'));assert.ok(!/NaN|Infinity|undefined/.test(svg));
  assert.match(svg,/class="film-scene-nodes"/);
 }
});
test('A delayed route emits a tail only after the actor has actually moved',()=>{
 const previous={nodes:[{id:'runner',kind:'player',x:100,y:100,label:'1',fill:'#334455'}]};
 const current={nodes:[{...previous.nodes[0],x:250}],tracks:[{id:'runner',start:.5,end:1,points:[[100,100],[250,100]]}]};
 assert.ok(!sceneMarkup(previous,current,.509).includes('class="film-route-tail"'));
 assert.ok(sceneMarkup(previous,current,.75).includes('class="film-route-tail"'));
});
