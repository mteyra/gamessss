#!/usr/bin/env node
// Decode every frame and verify the media against current source and captions.
// Default: all 72 production films, 1280×720, 30 fps, CRF 20, manifest v2.
// Preview: --output=/tmp/game-previews [--game=islands,flunkyball] [--report=/tmp/check.json]
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {LESSONS} from '../dist/lessons.js';
import {compileFilm} from '../dist/film-timeline.js';
import {FILM_RELEASE,getFilmProvenance,filmFingerprint,filmChapters} from './render-films.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),run=promisify(execFile);
const options={output:path.join(root,'dist','films'),report:null,games:[]};
for(const arg of process.argv.slice(2)){
 if(arg==='--help'||arg==='-h'){console.log('Usage: node tools/validate-films.mjs [--output=/tmp/previews] [--game=islands,flunkyball] [--report=/tmp/check.json]');process.exit(0);}
 else if(arg.startsWith('--output='))options.output=path.resolve(arg.slice(9));
 else if(arg.startsWith('--report='))options.report=path.resolve(arg.slice(9));
 else if(arg.startsWith('--game='))options.games.push(...arg.slice(7).split(',').filter(Boolean));
 else throw new Error(`Unknown option ${arg}`);
}
const production=options.output===path.join(root,'dist','films');
if(production&&options.games.length)throw new Error('Production validation requires all 72 films; use --output for an isolated preview.');
options.report??=production?path.join(root,'research','film-media-check.json'):path.join(options.output,'media-check.json');
const games=(await Promise.all(['chase-dodge','world-target','team-together'].map(name=>fs.readFile(path.join(root,'dist','data',name+'.json'),'utf8').then(JSON.parse)))).flat();
const manifest=JSON.parse(await fs.readFile(path.join(options.output,'manifest.json'),'utf8'));
assert.equal(games.length,72);assert.equal(manifest.version,FILM_RELEASE.version,'A v2 manifest is required; old videos must be regenerated.');
assert(Number.isInteger(manifest.width)&&manifest.width>=320&&manifest.width<=2560&&manifest.width%32===0);
assert.equal(manifest.height,manifest.width*9/16);
assert(Number.isInteger(manifest.fps)&&manifest.fps>=1&&manifest.fps<=60);
assert(Number.isInteger(manifest.encoding?.crf)&&manifest.encoding.crf>=0&&manifest.encoding.crf<=30);
if(production){
 for(const key of ['width','height','fps'])assert.equal(manifest[key],FILM_RELEASE[key],`Release ${key}`);
 assert.equal(manifest.encoding.crf,FILM_RELEASE.crf,'Release CRF');
 assert.equal(manifest.films.length,games.length);
 assert.deepEqual(manifest.films.map(f=>f.id).sort(),games.map(g=>g.id).sort());
}
assert(manifest.films.length>0,'No completed films to validate');
assert.equal(new Set(manifest.films.map(f=>f.id)).size,manifest.films.length,'Duplicate film IDs');
const provenance=await getFilmProvenance({...manifest,crf:manifest.encoding.crf});
assert.deepEqual(manifest.encoding,provenance.encoding);
assert.equal(manifest.sourceRevision,provenance.sourceRevision,'Rendering source or encoding settings changed; regenerate the films.');
const requested=new Set(options.games);
for(const id of requested)assert(manifest.films.some(f=>f.id===id),`No completed preview for ${id}`);
const records=manifest.films.filter(f=>!requested.size||requested.has(f.id)),rows=[];
for(const record of records){
 const game=games.find(g=>g.id===record.id);assert(game,`Unknown film ${record.id}`);
 const compiled=compileFilm(game,LESSONS[game.id]);
 assert.equal(record.sourceFingerprint,filmFingerprint(provenance.sourceRevision,game,LESSONS[game.id],compiled),`${game.id}: game, lesson or timeline changed; regenerate this film.`);
 assert.equal(record.src,`${production?'films/':''}${game.id}.mp4`);assert.equal(record.poster,`${production?'films/':''}${game.id}.webp`);
 const mediaPath=path.join(options.output,game.id+'.mp4'),bytes=await fs.readFile(mediaPath);
 const {stdout}=await run(process.env.FFPROBE||'ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,avg_frame_rate,nb_frames:format=duration','-of','json',mediaPath]);
 const meta=JSON.parse(stdout),stream=meta.streams[0],expectedFrames=Math.ceil(compiled.duration*manifest.fps);
 assert.equal(stream.codec_name,'h264');assert.equal(stream.pix_fmt,'yuv420p');assert.equal(stream.width,manifest.width);assert.equal(stream.height,manifest.height);assert.equal(stream.avg_frame_rate,`${manifest.fps}/1`);assert.equal(Number(stream.nb_frames),expectedFrames);
 assert(Math.abs(Number(meta.format.duration)-record.duration)<.05);assert(Math.abs(record.duration-expectedFrames/manifest.fps)<.05);
 assert.equal(bytes.length,record.bytes);assert(bytes.length>1000&&bytes.length<100*1024*1024);
 // Parse top-level ISO BMFF atoms, rather than searching compressed bytes.
 const atoms=[];let at=0;
 while(at+8<=bytes.length){
  let size=bytes.readUInt32BE(at);const type=bytes.toString('ascii',at+4,at+8);
  if(size===1){assert(at+16<=bytes.length);size=Number(bytes.readBigUInt64BE(at+8));}
  else if(size===0)size=bytes.length-at;
  assert(Number.isSafeInteger(size)&&size>=8&&at+size<=bytes.length);atoms.push(type);at+=size;
 }
 assert.equal(at,bytes.length);assert(atoms.includes('moov')&&atoms.includes('mdat')&&atoms.indexOf('moov')<atoms.indexOf('mdat'),'Fast-start metadata must precede media');
 assert.deepEqual(record.chapters,filmChapters(compiled));
 const posterPath=path.join(options.output,game.id+'.webp'),poster=JSON.parse((await run(process.env.FFPROBE||'ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height','-of','json',posterPath])).stdout);
 assert.equal(poster.streams[0].codec_name,'webp');assert.equal(poster.streams[0].width,manifest.width);assert.equal(poster.streams[0].height,manifest.height);
 const decoded=await run(process.env.FFMPEG||'ffmpeg',['-v','error','-xerror','-nostdin','-err_detect','explode','-threads','1','-i',mediaPath,'-map','0:v:0','-progress','pipe:1','-nostats','-fps_mode','passthrough','-f','null','-']);
 const decodedFrames=Number([...decoded.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1]);assert.equal(decodedFrames,expectedFrames,`${game.id}: every expected frame must decode`);
 rows.push({id:game.id,sourceFingerprint:record.sourceFingerprint,decodedFrames,duration:record.duration,bytes:record.bytes,frames:expectedFrames,chapters:record.chapters.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 if(rows.length%12===0)console.log(`Fully decoded and validated ${rows.length}/${records.length} films`);
}
assert.equal(new Set(rows.map(r=>r.sha256)).size,records.length,'Every game must have a distinct movie');
assert.equal((await getFilmProvenance({...manifest,crf:manifest.encoding.crf})).sourceRevision,provenance.sourceRevision,'Rendering source changed during validation; rerun against stable source.');
const report={checkedAt:new Date().toISOString(),manifestVersion:manifest.version,sourceRevision:provenance.sourceRevision,scope:production?'release':'preview',films:rows.length,width:manifest.width,height:manifest.height,fps:manifest.fps,encoding:manifest.encoding,codec:'H.264',pixelFormat:'yuv420p',fastStart:true,fullyDecoded:true,seconds:rows.reduce((n,r)=>n+r.duration,0),bytes:rows.reduce((n,r)=>n+r.bytes,0),chapters:rows.reduce((n,r)=>n+r.chapters,0),files:rows};
await fs.mkdir(path.dirname(options.report),{recursive:true});
const temp=options.report+`.${process.pid}.tmp`;await fs.writeFile(temp,JSON.stringify(report,null,2)+'\n');await fs.rename(temp,options.report);
console.log(`Validated ${report.films} distinct H.264 films at ${report.fps} fps, ${report.chapters} chapters, ${(report.seconds/60).toFixed(2)} minutes, ${(report.bytes/1048576).toFixed(2)} MiB; current source fingerprints, every decoded frame, captions, posters and fast-start headers.`);
