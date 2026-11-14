import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LESSONS} from '../dist/lessons.js';
import {compileFilm,sampleFilm,timecode} from '../dist/film-timeline.js';

const names=['chase-dodge','team-together','world-target'];
const games=(await Promise.all(names.map(name=>readFile(new URL(`../dist/data/${name}.json`,import.meta.url),'utf8').then(JSON.parse)))).flat();
const films=games.map(game=>compileFilm(game,LESSONS[game.id]));
const epsilon=1e-7;
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<epsilon,`${message}: ${actual} ≠ ${expected}`);

test('All 72 complete lessons compile into ordered films with no omitted chapters or time gaps',()=>{
 assert.equal(films.length,72);
 assert.equal(new Set(films.map(film=>film.game.id)).size,72);
 for(const film of films){
  assert.equal(film.segments.length,film.lesson.steps.length,film.game.id);
  assert.ok(film.duration>=40&&film.duration<=90,`${film.game.id}: practical short-film length`);
  assert.ok(film.intro>=2&&film.outro>=2,`${film.game.id}: visible title and ending`);
  let cursor=film.intro;
  film.segments.forEach((segment,index)=>{
   assert.equal(segment.index,index);
   assert.strictEqual(segment.current,film.lesson.steps[index]);
   assert.strictEqual(segment.previous,index?film.lesson.steps[index-1]:null);
   near(segment.start,cursor,`${film.game.id}: chapter ${index} starts at previous ending`);
   assert.ok(segment.end>segment.start);
   cursor=segment.end;
  });
  near(cursor+film.outro,film.duration,`${film.game.id}: ending completes total duration`);
 }
});

test('Every caption has reading time and every move settles before the following chapter',()=>{
 for(const film of films)for(const segment of film.segments){
  const duration=segment.end-segment.start;
  const words=(segment.current.title+' '+segment.current.text).trim().split(/\s+/).length;
  assert.ok(duration>=6-epsilon&&duration<=11+epsilon,`${film.game.id}/${segment.index}: chapter duration`);
  assert.ok(words/duration*60<=190,`${film.game.id}/${segment.index}: title and caption stay below 190 words/minute`);
  if(segment.index){
   assert.ok(segment.lead>=.5,`${film.game.id}: recognize the new move before motion`);
   assert.ok(segment.move>=2.6-epsilon&&segment.move<=4.2+epsilon,`${film.game.id}: action can be followed`);
   assert.ok(duration-segment.lead-segment.move>=2.2-epsilon,`${film.game.id}: final position remains visible`);
  }else{
   assert.equal(segment.move,0);
   assert.equal(segment.lead,0);
  }
 }
});

test('Title, setup, chapter and outro boundaries select the correct scene',()=>{
 for(const film of films){
  const first=film.segments[0],last=film.segments.at(-1);
  for(const time of [0,film.intro/2,film.intro-epsilon]){
   const sample=sampleFilm(film,time);
   assert.equal(sample.phase,'title',film.game.id);
   assert.strictEqual(sample.current,first.current);
   assert.equal(sample.progress,1);
   assert.ok(sample.openingOpacity>=0&&sample.openingOpacity<=1);
  }
  assert.equal(sampleFilm(film,0).openingOpacity,0);
  assert.equal(sampleFilm(film,film.intro).phase,'setup');
  assert.equal(sampleFilm(film,first.end-epsilon).phase,'setup');
  for(let index=1;index<film.segments.length;index++){
   const segment=film.segments[index];
   assert.equal(sampleFilm(film,segment.start-epsilon).index,index-1,film.game.id);
   const at=sampleFilm(film,segment.start);
   assert.equal(at.index,index,film.game.id);
   assert.strictEqual(at.previous,film.segments[index-1].current);
   assert.strictEqual(at.current,segment.current);
   assert.equal(at.phase,'move');
   assert.equal(at.progress,0);
  }
  assert.equal(sampleFilm(film,last.end-epsilon).phase,'hold');
  const outro=sampleFilm(film,last.end);
  assert.equal(outro.phase,'outro');
  assert.strictEqual(outro.current,last.current);
  assert.equal(outro.closingOpacity,0);
  assert.equal(sampleFilm(film,film.duration).closingOpacity,1);
 }
});

test('Every movement maps chapter seconds to normalized endpoints, then holds its destination',()=>{
 for(const film of films)for(const segment of film.segments.slice(1)){
  const begin=segment.start+segment.lead,finish=begin+segment.move;
  near(sampleFilm(film,begin).progress,0,`${film.game.id}: action starts at zero`);
  near(sampleFilm(film,begin+segment.move/2).progress,.5,`${film.game.id}: motion midpoint`);
  near(sampleFilm(film,finish).progress,1,`${film.game.id}: action ends at one`);
  for(const time of [finish+epsilon,(finish+segment.end)/2,segment.end-epsilon]){
   const sample=sampleFilm(film,time);
   assert.equal(sample.phase,'hold',film.game.id);
   assert.equal(sample.progress,1);
   assert.strictEqual(sample.current,segment.current);
  }
 }
});

test('Seeking is deterministic, clamps outside the film, and never yields invalid motion values',()=>{
 const phases=new Set(['title','setup','move','hold','outro']);
 for(const film of films){
  assert.deepEqual(sampleFilm(film,-20),sampleFilm(film,0));
  assert.deepEqual(sampleFilm(film,NaN),sampleFilm(film,0));
  assert.deepEqual(sampleFilm(film,film.duration+20),sampleFilm(film,film.duration));
  for(let tick=0;tick<=Math.ceil(film.duration*20);tick++){
   const time=tick/20,sample=sampleFilm(film,time);
   assert.deepEqual(sample,sampleFilm(film,time));
   assert.ok(phases.has(sample.phase),film.game.id);
   assert.ok(Number.isFinite(sample.progress)&&sample.progress>=0&&sample.progress<=1);
   assert.ok(sample.time>=0&&sample.time<=film.duration);
   assert.ok(sample.chapterTime>=0&&sample.chapterTime<=sample.chapterEnd-sample.chapterStart+epsilon);
  }
 }
});

test('Timecodes round down consistently at minute boundaries',()=>{
 assert.equal(timecode(0),'0:00');
 assert.equal(timecode(.99),'0:00');
 assert.equal(timecode(9.99),'0:09');
 assert.equal(timecode(59.99),'0:59');
 assert.equal(timecode(60),'1:00');
 assert.equal(timecode(71.4),'1:11');
 assert.equal(timecode(3599.99),'59:59');
});
