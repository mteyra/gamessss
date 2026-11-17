import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {frameAt,pointOnRoute,nodeMarkup} from '../site/motion-engine.js';
import {LESSONS} from '../site/lessons.js';
const games=['chase-dodge','world-target','team-together'].flatMap(file=>JSON.parse(readFileSync(new URL(`../site/data/${file}.json`,import.meta.url),'utf8')));
test('Every catalogue game has an original complete lesson with usable controls',()=>{
 assert.deepEqual(Object.keys(LESSONS).sort(),games.map(g=>g.id).sort());
 for(const game of games){const lesson=LESSONS[game.id];assert.ok(lesson.summary);assert.ok(lesson.legend.length);assert.ok(lesson.steps.length>=5&&lesson.steps.length<=7,game.id);
  for(const [index,step] of lesson.steps.entries()){assert.ok(step.title&&step.text&&step.action,`${game.id}:${index} missing caption/action`);assert.ok(step.nodes.length>4);assert.equal(new Set(step.nodes.map(n=>n.id)).size,step.nodes.length);assert.ok(step.text.split(/\s+/).length<=35);for(const node of step.nodes)for(const key of ['x','y','x2','y2','w','h','r','rotate','opacity'])if(node[key]!==undefined)assert.ok(Number.isFinite(node[key]),`${game.id}:${index}:${node.id}.${key}`);
   if(index)assert.notEqual(JSON.stringify(step.nodes),JSON.stringify(lesson.steps[index-1].nodes),`${game.id} has duplicate stills`);
  }
 }
});
test('Routes follow distance, handle stationary nodes, and clamp endpoints',()=>{
 assert.deepEqual(pointOnRoute([[0,0],[10,0],[10,30]],.5),[10,10]);
 assert.deepEqual(pointOnRoute([[5,5],[5,5]],.5),[5,5]);
 assert.deepEqual(pointOnRoute([[0,0],[10,0]],-1),[0,0]);
 assert.deepEqual(pointOnRoute([[0,0],[10,0]],3),[10,0]);
});
test('Scrubbing preserves identities, authored endpoints and delayed actions',()=>{
 const from=[{id:'runner',x:0,y:0,fill:'#000000',label:'R'},{id:'old',x:4,y:5}],to=[{id:'runner',x:100,y:0,fill:'#ffffff',label:'C'},{id:'new',x:7,y:8}];
 const tracks=[{id:'runner',points:[[0,0],[50,50],[100,0]],start:.25,end:.75}];
 assert.equal(frameAt(from,to,.1,tracks).find(n=>n.id==='runner').x,0);
 const middle=frameAt(from,to,.5,tracks);assert.equal(middle.find(n=>n.id==='runner').y,50);assert.equal(middle.find(n=>n.id==='runner').fill,'#808080');
 const end=frameAt(from,to,1,tracks);assert.deepEqual([end[0].x,end[0].y],[100,0]);assert.equal(end.find(n=>n.id==='old').opacity,0);assert.equal(end.find(n=>n.id==='new').opacity,1);
});
test('Every route starts and ends on the authored object, with finite intermediate frames',()=>{
 for(const [id,lesson] of Object.entries(LESSONS))for(let i=1;i<lesson.steps.length;i++){
  const previous=lesson.steps[i-1],current=lesson.steps[i];
  for(const track of current.tracks||[]){const start=previous.nodes.find(n=>n.id===track.id),end=current.nodes.find(n=>n.id===track.id);assert.ok(end,`${id}/${i}/${track.id} missing track target`);if(start)assert.deepEqual(track.points[0],[start.x,start.y],`${id}/${i}/${track.id} jumps at start`);assert.deepEqual(track.points.at(-1),[end.x,end.y],`${id}/${i}/${track.id} jumps at end`);assert.ok((track.start??0)<(track.end??1));}
  for(const progress of [0,.2,.5,.8,1])for(const node of frameAt(previous.nodes,current.nodes,progress,current.tracks)){for(const key of ['x','y','x2','y2','rotate','opacity'])if(node[key]!==undefined)assert.ok(Number.isFinite(node[key]),`${id}/${i}/${node.id} at ${progress}`);assert.ok(!nodeMarkup(node).includes('NaN'));}
 }
});

test('Reset states restore an omitted rotation to upright',()=>{
 const from=[{id:'pin',kind:'pin',x:20,y:30,rotate:90}],to=[{id:'pin',kind:'pin',x:20,y:30}];
 assert.equal(frameAt(from,to,0)[0].rotate,90);assert.equal(frameAt(from,to,.5)[0].rotate,45);assert.equal(frameAt(from,to,1)[0].rotate,0);
});
