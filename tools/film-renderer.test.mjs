import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveCamera,sceneMarkup,filmFrameAt,filmEase,filmPointOnRoute,routeGeometry} from '../dist/film-renderer.js';
import {FILM_THEME,filmColor,legendColor} from '../dist/film-theme.js';
import {LESSONS} from '../dist/lessons.js';

const near=(a,b,detail='')=>assert.ok(Math.abs(a-b)<1e-7,`${detail}: ${a} ≠ ${b}`);
const samePoint=(a,b,detail='')=>{near(a[0],b[0],detail);near(a[1],b[1],detail);};

test('All 72 films preserve every authored actor and court endpoint',()=>{
 assert.equal(Object.keys(LESSONS).length,72);
 for(const [id,lesson] of Object.entries(LESSONS))for(let i=1;i<lesson.steps.length;i++)for(const p of [0,1]){
  const previous=lesson.steps[i-1],current=lesson.steps[i],expected=(p?current:previous).nodes;
  const nodes=new Map(filmFrameAt(previous,current,p).map(n=>[n.id,n]));
  for(const original of expected){
   const actual=nodes.get(original.id);assert.ok(actual,`${id}/${i}: ${original.id} retained`);
   for(const key of ['x','y','x2','y2','w','h','r','rotate','opacity'])if(typeof original[key]==='number')near(actual[key],original[key],`${id}/${i}/${p}/${original.id}.${key}`);
  }
 }
});

test('Arc-length routes visit every waypoint exactly and preserve legal straight lanes',()=>{
 for(const [id,lesson] of Object.entries(LESSONS))for(const step of lesson.steps)for(const track of step.tracks||[]){
  const geometry=routeGeometry(track.points);
  samePoint(filmPointOnRoute(track.points,0),track.points[0],id);
  samePoint(filmPointOnRoute(track.points,1),track.points.at(-1),id);
  geometry.points.forEach((point,i)=>samePoint(filmPointOnRoute(track.points,geometry.waypoints[i]/geometry.length),point,`${id}/${track.id}: waypoint ${i}`));
  for(let i=0;i<geometry.points.length-1;i++){
   const a=geometry.points[i],b=geometry.points[i+1],begin=geometry.waypoints[i]/geometry.length,end=geometry.waypoints[i+1]/geometry.length;
   for(const portion of [.1,.4,.7,.9]){
    const p=filmPointOnRoute(track.points,begin+(end-begin)*portion);
    for(const axis of [0,1])assert.ok(p[axis]>=Math.min(a[axis],b[axis])-1e-7&&p[axis]<=Math.max(a[axis],b[axis])+1e-7,`${id}: no corner shortcut`);
    if(a[0]===b[0])near(p[0],a[0],`${id}: vertical lane`);
    if(a[1]===b[1])near(p[1],a[1],`${id}: horizontal lane`);
   }
  }
 }
 const duplicate=[[5,5],[5,5],[5,5]];samePoint(filmPointOnRoute(duplicate,.6),[5,5]);
});

test('Film velocity stays near constant instead of stopping at each chapter edge',()=>{
 for(let i=0;i<1000;i++){
  const velocity=(filmEase((i+1)/1000)-filmEase(i/1000))*1000;
  assert.ok(velocity>=.839&&velocity<=1.161,`relative velocity ${velocity}`);
 }
 const a={nodes:[{id:'p',kind:'player',x:20,y:50}]},b={nodes:[{id:'p',kind:'player',x:620,y:50}]};
 const poses=[0,.001,.5,.999,1].map(p=>filmFrameAt(a,b,p)[0].x);
 assert.ok(poses[1]-poses[0]>.5);assert.ok(poses[4]-poses[3]>.5);near(poses[2],320);
});

test('Human Knot preserves every connected hand while all six players move',()=>{
 const lesson=LESSONS['human-knot'],pairs=[[0,2],[2,4],[4,1],[1,5],[5,3],[3,0]];
 const previous=lesson.steps[2],current=lesson.steps[3];
 for(const p of [0,.025,.15,.4,.7,.98,1]){
  const nodes=new Map(filmFrameAt(previous,current,p).map(n=>[n.id,n]));
  pairs.forEach(([a,b],i)=>{
   const hand=nodes.get(`hand${i}`),left=nodes.get(`p${a+1}`),right=nodes.get(`p${b+1}`);
   samePoint([hand.x,hand.y],[left.x,left.y],`hand${i}: first partner`);
   samePoint([hand.x2,hand.y2],[right.x,right.y],`hand${i}: second partner`);
  });
 }
});

test('Absolute-time camera joins every chapter without a reset or position jump',()=>{
 for(const [id,lesson] of Object.entries(LESSONS))for(let i=0;i<lesson.steps.length-1;i++){
  const a=deriveCamera(lesson.steps[i-1],lesson.steps[i],1,{time:12});
  const b=deriveCamera(lesson.steps[i],lesson.steps[i+1],0,{time:12});
  for(const key of ['x','y','width','height','zoom'])near(a[key],b[key],`${id}/${i}: ${key}`);
 }
 const [a,b]=LESSONS.islands.steps;
 assert.ok(deriveCamera(a,b,1,{time:12}).zoom>1);
});

test('Framing never crops the court, including extreme explicit focus or zoom',()=>{
 for(const lesson of Object.values(LESSONS))for(let i=0;i<lesson.steps.length;i++)for(const progress of [0,.25,.5,.75,1]){
  const options={time:12,camera:{zoom:5,focus:progress<.5?[-1000,-1000]:[1000,1000]}};
  const c=deriveCamera(lesson.steps[i-1],lesson.steps[i],progress,options);
  assert.ok(c.zoom>=1&&c.zoom<=1.12);assert.ok(c.x<=-4+1e-8);assert.ok(c.y<=-4+1e-8);
  assert.ok(c.x+c.width>=644-1e-8);assert.ok(c.y+c.height>=404-1e-8);near(c.width/c.height,704/432);
 }
});

test('Film palette is isolated, legible, and preserves Croquet’s four named balls',()=>{
 const original=JSON.stringify(LESSONS);
 for(const lesson of Object.values(LESSONS))for(const step of lesson.steps){
  const svg=sceneMarkup(null,step,1);
  assert.ok(!/#(?:bbda63|e9977c|a99bd8|e6cb62|f7f7ef)\b/i.test(svg));
 }
 assert.equal(JSON.stringify(LESSONS),original);
 assert.equal(filmColor('#bbda63'),FILM_THEME.white);assert.equal(legendColor('#e9977c'),FILM_THEME.slate);
 const balls=filmFrameAt(null,LESSONS.croquet.steps[0],1).filter(n=>n.kind==='ball');
 assert.equal(new Set(balls.map(n=>n.fill)).size,4);
 assert.equal(balls.find(n=>n.id==='black').stroke,FILM_THEME.line);
 const players=filmFrameAt(null,{nodes:[{id:'a',kind:'player',fill:'#bbda63'},{id:'b',kind:'player',fill:'#e9977c'}]},1);
 assert.equal(players[0].color,FILM_THEME.background);assert.equal(players[1].color,FILM_THEME.ink);
});

test('All 467 authored states export deterministic finite SVG without a browser',()=>{
 let count=0;
 for(const lesson of Object.values(LESSONS))for(let i=0;i<lesson.steps.length;i++){
  count++;
  for(const p of [0,.5,1]){
   const options={time:7+p,chapterProgress:p,setupProgress:i?1:p};
   const svg=sceneMarkup(lesson.steps[i-1],lesson.steps[i],p,options);
   assert.ok(svg.startsWith('<svg'));assert.ok(svg.endsWith('</svg>'));assert.ok(!/NaN|Infinity|undefined/.test(svg));
   assert.equal(svg,sceneMarkup(lesson.steps[i-1],lesson.steps[i],p,options));
  }
 }
 assert.equal(count,467);
});

test('Setup draws the actual court and reduced motion shows its final readable state',()=>{
 const [setup,move]=LESSONS.islands.steps;
 const options={id:'test',width:960,height:540,title:'A < B & C',time:1,setupProgress:.25};
 const partial=sceneMarkup(null,setup,1,options);
 assert.match(partial,/width="960" height="540"/);assert.match(partial,/A &lt; B &amp; C/);
 assert.match(partial,/class="film-setup-draw"/);assert.match(partial,/stroke-dashoffset=/);
 const full=sceneMarkup(null,setup,1,{...options,setupProgress:1});assert.ok(!full.includes('film-setup-draw'));
 const still=sceneMarkup(setup,move,.5,{motion:false,setupProgress:.25,time:10});
 assert.ok(!/film-route-tail|film-change-ring|film-player-stride|film-setup-draw/.test(still));
 assert.ok(still.includes('translate(250 185)'));
 assert.deepEqual(deriveCamera(setup,move,.5,{motion:false}),deriveCamera(null,setup,1,{camera:false}));
});

test('Delayed actions wait, and only actually moving projectiles spin',()=>{
 const previous={nodes:[{id:'runner',kind:'player',x:100,y:100,label:'1',fill:'#bbda63'}]};
 const current={nodes:[{...previous.nodes[0],x:250}],tracks:[{id:'runner',start:.5,end:1,points:[[100,100],[250,100]]}]};
 for(const p of [0,.25,.5])samePoint([filmFrameAt(previous,current,p)[0].x,100],[100,100]);
 assert.ok(!sceneMarkup(previous,current,.509).includes('class="film-route-tail"'));
 assert.ok(sceneMarkup(previous,current,.75).includes('class="film-route-tail"'));
 const ball={nodes:[{id:'ball',kind:'ball',x:100,y:100}]},throwBall={nodes:[{id:'ball',kind:'ball',x:250,y:100}]};
 assert.ok(sceneMarkup(ball,throwBall,.5).includes('film-projectile-spin'));
 assert.ok(!sceneMarkup(ball,throwBall,1).includes('film-projectile-spin'));
 assert.ok(!sceneMarkup(ball,ball,.5).includes('film-projectile-spin'));
});

test('Static explanations trace existing diagram geometry without displacing actors',()=>{
 const previous={nodes:[{id:'court',kind:'zone',x:40,y:60,w:520,h:240},{id:'p',kind:'player',x:100,y:100}]};
 const quarter=sceneMarkup(previous,previous,.25,{time:12}),threeQuarter=sceneMarkup(previous,previous,.75,{time:12});
 assert.ok(quarter.includes('film-boundary-trace'));assert.notEqual(quarter,threeQuarter);
 for(const p of [.1,.25,.75,.9]){
  const actor=filmFrameAt(previous,previous,p).find(n=>n.id==='p');samePoint([actor.x,actor.y],[100,100]);
 }
 const [setup,explain]=LESSONS['human-knot'].steps;
 assert.ok(sceneMarkup(setup,explain,.5).includes('film-connection-trace'));
});

test('Every non-setup chapter has visible mechanism motion or a diagram trace',()=>{
 let count=0;
 for(const [id,lesson] of Object.entries(LESSONS))for(let i=1;i<lesson.steps.length;i++){
  count++;
  // Hold the absolute camera clock fixed: the diagram itself must change.
  const a=sceneMarkup(lesson.steps[i-1],lesson.steps[i],.27,{time:12});
  const b=sceneMarkup(lesson.steps[i-1],lesson.steps[i],.73,{time:12});
  assert.notEqual(a,b,`${id}/${i}: static court throughout chapter`);
 }
 assert.equal(count,395);
});

test('Opening actors are visible immediately and the final shot keeps moving',()=>{
 const setup=LESSONS.islands.steps[0];
 const opening=sceneMarkup(null,setup,1,{time:0,setupProgress:0});
 assert.ok(opening.includes('class="film-setup-draw" opacity="0.6"'));
 const final=LESSONS.islands.steps.at(-1),previous=LESSONS.islands.steps.at(-2);
 const a=deriveCamera(previous,final,1,{time:60}),b=deriveCamera(previous,final,1,{time:61});
 assert.ok(b.zoom>a.zoom);assert.ok(b.width<a.width);
 for(const c of [a,b]){assert.ok(c.x<=-4&&c.y<=-4);assert.ok(c.x+c.width>=644&&c.y+c.height>=404);}
});

test('Outgoing diagram labels clear before new labels enter while actors keep moving',()=>{
 const previous={nodes:[{id:'old',kind:'text',x:100,y:50,label:'THREE',opacity:.7},{id:'p',kind:'player',x:10,y:80}]};
 const current={nodes:[{id:'new',kind:'text',x:100,y:50,label:'TWO',opacity:.8},{id:'p',kind:'player',x:210,y:80}]};
 for(const progress of [0,.02,.04,.06,.08,.12,.16,.5,1]){
  const nodes=new Map(filmFrameAt(previous,current,progress).map(node=>[node.id,node]));
  const old=nodes.get('old').opacity,fresh=nodes.get('new').opacity;
  assert.ok(old===0||fresh===0,`labels overlap at ${progress}`);
  if(progress===0){near(old,.7);near(fresh,0);}
  if(progress>=.06)near(old,0);
  if(progress>=.16)near(fresh,.8);
  near(nodes.get('p').x,10+200*filmEase(progress));
 }
 const reduced=new Map(filmFrameAt(previous,current,.02,{motion:false}).map(node=>[node.id,node]));
 near(reduced.get('old').opacity,0);near(reduced.get('new').opacity,.8);
});

test('Every chapter clears removed text by6% and restores new text’s authored opacity by16%',()=>{
 for(const [id,lesson] of Object.entries(LESSONS))for(let i=1;i<lesson.steps.length;i++){
  const previous=lesson.steps[i-1],current=lesson.steps[i],before=new Map(previous.nodes.map(n=>[n.id,n])),after=new Map(current.nodes.map(n=>[n.id,n]));
  const atHandoff=filmFrameAt(previous,current,.06),atMiddle=filmFrameAt(previous,current,.5);
  for(const node of atHandoff)if(node.kind==='text'&&!after.has(node.id))near(node.opacity,0,`${id}/${i}: old text cleared`);
  for(const node of atMiddle)if(node.kind==='text'){
   if(!after.has(node.id))near(node.opacity,0,`${id}/${i}: no stale midchapter text`);
   else if(!before.has(node.id))near(node.opacity,after.get(node.id).opacity??1,`${id}/${i}: new label fully legible`);
  }
 }
});

test('An island player gets up at departure and lies down only on arrival',()=>{
 const player={id:'person',kind:'player',x:100,y:100,label:'2',fill:'#bbda63',r:15};
 const lying={nodes:[{...player,pose:'lying'}]},standing={nodes:[{...player,x:250}]};
 const draw=(a,b,p)=>sceneMarkup(a,b,p,{camera:false,emphasis:false});
 assert.ok(draw(lying,standing,0).includes('height="39"'));
 assert.ok(draw(lying,standing,.06).includes('film-pose-blend'));
 for(const p of [.12,.25,.48,1]){
  const svg=draw(lying,standing,p);assert.ok(!svg.includes('height="39"'),`still lying while running at ${p}`);assert.ok(svg.includes('<circle r="15"'));
 }
 for(const p of [0,.48,.87])assert.ok(!draw(standing,lying,p).includes('height="39"'),`lies down before arrival at ${p}`);
 assert.ok(draw(standing,lying,.94).includes('film-pose-blend'));
 assert.ok(draw(standing,lying,1).includes('height="39"'));
 assert.ok(!draw(standing,standing,.5).includes('film-pose-blend'));
 const midway=filmFrameAt(lying,standing,.06)[0],blend=draw(lying,standing,.06);
 assert.equal(blend.split(`translate(${midway.x} ${midway.y}) rotate`).length-1,2,'both silhouettes share the same unchanged route centre');
});
