import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {searchGames,escapeHTML,gameMarkdown,readSaved,writeSaved} from '../site/core.js';
import {gameArt,islandsArt} from '../site/visuals.js';
const data=(await Promise.all(['chase-dodge','world-target','team-together'].map(name=>readFile(new URL(`../site/data/${name}.json`,import.meta.url),'utf8').then(JSON.parse)))).flat();
test('remembered names and accents find the actual game',()=>{
 assert.equal(searchGames(data,{query:'one touch touch all'})[0]?.id,'manhunt');
 assert.equal(searchGames(data,{query:'flankyball'})[0]?.id,'flunkyball');
 assert.equal(searchGames(data,{query:'molkky'})[0]?.id,'molkky');
 assert.equal(searchGames(data,{query:'ki o rahi'})[0]?.id,'ki-o-rahi');
});
test('combined filters only return feasible choices',()=>{
 const results=searchGames(data,{family:'together',players:12,space:'small',gear:true});
 assert.ok(results.length>0);
 assert.ok(results.every(g=>g.family==='together'&&g.players[0]<=12&&g.players[1]>=12&&g.space==='small'&&g.noEquipment));
 assert.equal(searchGames(data,{query:'there is no such game xyz'}).length,0);
});
test('larger venues include games needing less room',()=>{
 const small=searchGames(data,{space:'small'}),medium=searchGames(data,{space:'medium'}),large=searchGames(data,{space:'large'});
 assert.ok(small.length>0);assert.ok(medium.length>small.length);assert.equal(large.length,72);
});
test('browser storage failure remains a usable empty collection',()=>{
 assert.deepEqual(readSaved(),[]);assert.equal(writeSaved(['islands']),false);
});
test('downloaded rules retain all steps and evidence',()=>{
 const g=data.find(g=>g.id==='noodle-keeper'),text=gameMarkdown(g,1);
 for(const step of g.steps)assert.ok(text.includes(step));
 assert.ok(text.includes(g.ruleNote));assert.ok(text.includes(g.sources[0].url));
 assert.ok(text.includes('House adaptation'));
});
test('all 72 illustrated views render; referenced SVG marker IDs are unique',()=>{
 const art=data.map(g=>gameArt(g));
 assert.equal(art.length,72);assert.ok(art.every(svg=>svg.startsWith('<svg')&&svg.endsWith('</svg>')&&!svg.includes('undefined')));
 const ids=art.flatMap(svg=>[...svg.matchAll(/id="(arrow-\d+)"/g)].map(m=>m[1]));
 assert.equal(new Set(ids).size,72);
 assert.notEqual(islandsArt(0),islandsArt(1));assert.notEqual(islandsArt(1),islandsArt(2));
});
test('external prose is escaped before HTML rendering',()=>assert.equal(escapeHTML('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;'));
