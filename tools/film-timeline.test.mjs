import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LESSONS} from '../dist/lessons.js';
import {compileFilm,sampleFilm,timecode} from '../dist/film-timeline.js';

const names=['chase-dodge','team-together','world-target'];
const games=(await Promise.all(names.map(name=>readFile(new URL(`../dist/data/${name}.json`,import.meta.url),'utf8').then(JSON.parse)))).flat();
const original=JSON.stringify(LESSONS);
const films=games.map(game=>compileFilm(game,LESSONS[game.id]));
const epsilon=1e-7;
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<epsilon,`${message}: ${actual} ≠ ${expected}`);

test('All 72 films preserve all 467 authored chapters in order without changing the field-guide lessons',()=>{
 assert.equal(films.length,72);
 assert.equal(new Set(films.map(film=>film.game.id)).size,72);
 assert.equal(films.reduce((sum,film)=>sum+film.segments.length,0),467);
 assert.equal(JSON.stringify(LESSONS),original);
 for(const film of films){
  assert.equal(film.segments.length,LESSONS[film.game.id].steps.length,film.game.id);
  assert.ok(film.duration>=30&&film.duration<=65,`${film.game.id}: short-film length`);
  let cursor=film.intro;
  film.segments.forEach((segment,index)=>{
   assert.equal(segment.index,index);
   assert.strictEqual(segment.current,film.lesson.steps[index]);
   assert.strictEqual(segment.previous,index?film.lesson.steps[index-1]:null);
   near(segment.start,cursor,`${film.game.id}: chapter ${index} joins its predecessor`);
   assert.ok(segment.end>segment.start);
   cursor=segment.end;
  });
  near(cursor+film.outro,film.duration,`${film.game.id}: ending completes total duration`);
 }
});

test('Actions span each entire caption with no lead or settled hold and at most 210 words/minute',()=>{
 for(const film of films)for(const segment of film.segments){
  const duration=segment.end-segment.start;
  const words=(segment.current.title+' '+segment.current.text).trim().split(/\s+/).length;
  assert.ok(duration>=4.6-epsilon,`${film.game.id}/${segment.index}: minimum reading time`);
  assert.ok(words/duration*60<=210,`${film.game.id}/${segment.index}: readable narration`);
  assert.equal(segment.lead,0);
  near(segment.move,duration,`${film.game.id}: motion uses whole chapter`);
 }
});

test('Title and setup share one drawing clock while chapter boundaries retain their actual scenes',()=>{
 for(const film of films){
  const first=film.segments[0],last=film.segments.at(-1);
  assert.equal(sampleFilm(film,0).setupProgress,0);
  for(const time of [0,film.intro/2,film.intro-epsilon]){
   const sample=sampleFilm(film,time);
   assert.equal(sample.phase,'title',film.game.id);
   assert.strictEqual(sample.current,first.current);
   assert.equal(sample.progress,1);
   near(sample.setupProgress,time/first.end,`${film.game.id}: absolute setup clock`);
  }
  const setup=sampleFilm(film,film.intro);
  assert.equal(setup.phase,'setup');
  near(setup.setupProgress,film.intro/first.end,`${film.game.id}: opening joins setup without restarting`);
  near(sampleFilm(film,first.end-epsilon).setupProgress,1,`${film.game.id}: setup ends completely drawn`);
  for(let index=1;index<film.segments.length;index++){
   const segment=film.segments[index];
   assert.equal(sampleFilm(film,segment.start-epsilon).index,index-1,film.game.id);
   const at=sampleFilm(film,segment.start);
   assert.equal(at.index,index,film.game.id);
   assert.strictEqual(at.previous,film.segments[index-1].current);
   assert.strictEqual(at.current,segment.current);
   assert.equal(at.phase,'move');
   assert.equal(at.progress,0);
   assert.equal(at.setupProgress,1);
  }
  assert.equal(sampleFilm(film,last.end-epsilon).phase,'move');
  const outro=sampleFilm(film,last.end);
  assert.equal(outro.phase,'outro');
  assert.strictEqual(outro.current,last.current);
  assert.equal(outro.progress,1);
  assert.equal(outro.closingOpacity,0);
  assert.equal(sampleFilm(film,film.duration).closingOpacity,1);
 }
});

test('Motion progresses throughout each action and approaches its endpoint only at the next chapter',()=>{
 for(const film of films)for(const segment of film.segments.slice(1)){
  for(const fraction of [0,.01,.1,.5,.9,.99]){
   const sample=sampleFilm(film,segment.start+segment.move*fraction);
   near(sample.progress,fraction,`${film.game.id}/${segment.index}: full-span action`);
   assert.equal(sample.phase,'move');
  }
  near(sampleFilm(film,segment.end-epsilon).progress,1,`${film.game.id}: exact destination approached`);
 }
});

test('Film colour names match the neutral actors without changing the original or Croquet turn order',()=>{
 const renamed=films.find(film=>film.game.id==='flunkyball');
 const prose=film=>JSON.stringify({summary:film.lesson.summary,legend:film.lesson.legend.map(x=>x.label),steps:film.lesson.steps.map(s=>[s.title,s.text,s.action,...s.nodes.map(n=>n.label)])});
 for(const film of films)assert.doesNotMatch(prose(film),/\b(green|coral|purple)\b/i,film.game.id);
 assert.match(prose(renamed),/white/i);
 assert.match(JSON.stringify(LESSONS.flunkyball),/green/i);
 const croquet=films.find(film=>film.game.id==='croquet');
 for(const name of ['BLUE','RED','BLACK','YELLOW'])assert.ok(prose(croquet).includes(name),`Croquet keeps ${name}`);
 assert.equal(JSON.stringify(LESSONS),original);
});

test('Seeking is deterministic, clamps outside the film and never exposes a hold phase or invalid clock',()=>{
 const phases=new Set(['title','setup','move','outro']);
 for(const film of films){
  assert.deepEqual(sampleFilm(film,-20),sampleFilm(film,0));
  assert.deepEqual(sampleFilm(film,NaN),sampleFilm(film,0));
  assert.deepEqual(sampleFilm(film,film.duration+20),sampleFilm(film,film.duration));
  for(let tick=0;tick<=Math.ceil(film.duration*10);tick++){
   const time=tick/10,sample=sampleFilm(film,time);
   assert.deepEqual(sample,sampleFilm(film,time));
   assert.ok(phases.has(sample.phase),film.game.id);
   for(const key of ['progress','chapterProgress','setupProgress'])assert.ok(Number.isFinite(sample[key])&&sample[key]>=0&&sample[key]<=1,`${film.game.id}: ${key}`);
   assert.ok(sample.time>=0&&sample.time<=film.duration);
   assert.ok(sample.chapterTime>=0&&sample.chapterTime<=sample.chapterEnd-sample.chapterStart+epsilon);
  }
 }
});

test('Timecodes round down consistently at minute boundaries',()=>{
 assert.equal(timecode(0),'0:00');assert.equal(timecode(.99),'0:00');
 assert.equal(timecode(9.99),'0:09');assert.equal(timecode(59.99),'0:59');
 assert.equal(timecode(60),'1:00');assert.equal(timecode(71.4),'1:11');
 assert.equal(timecode(3599.99),'59:59');
});
