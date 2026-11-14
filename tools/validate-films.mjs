#!/usr/bin/env node
// Validate the committed MP4s against the source clock and authored captions.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {LESSONS} from '../dist/lessons.js';
import {compileFilm} from '../dist/film-timeline.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),run=promisify(execFile);
const games=(await Promise.all(['chase-dodge','world-target','team-together'].map(name=>fs.readFile(path.join(root,'dist','data',name+'.json'),'utf8').then(JSON.parse)))).flat();
const manifest=JSON.parse(await fs.readFile(path.join(root,'dist/films/manifest.json'),'utf8'));
assert.equal(games.length,72);assert.equal(manifest.version,1);assert.equal(manifest.width,1280);assert.equal(manifest.height,720);assert.equal(manifest.fps,24);
assert.equal(manifest.films.length,games.length);assert.equal(new Set(manifest.films.map(f=>f.id)).size,games.length);
assert.deepEqual(manifest.films.map(f=>f.id).sort(),games.map(g=>g.id).sort());
const rows=[];
for(const record of manifest.films){
 const game=games.find(g=>g.id===record.id),compiled=compileFilm(game,LESSONS[game.id]);
 assert.equal(record.src,`films/${game.id}.mp4`);assert.equal(record.poster,`films/${game.id}.webp`);
 const mediaPath=path.join(root,'dist',record.src),bytes=await fs.readFile(mediaPath);
 const {stdout}=await run(process.env.FFPROBE||'ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,avg_frame_rate,nb_frames:format=duration','-of','json',mediaPath]);
 const meta=JSON.parse(stdout),stream=meta.streams[0],expectedFrames=Math.ceil(compiled.duration*manifest.fps);
 assert.equal(stream.codec_name,'h264');assert.equal(stream.pix_fmt,'yuv420p');assert.equal(stream.width,1280);assert.equal(stream.height,720);assert.equal(stream.avg_frame_rate,`${manifest.fps}/1`);assert.equal(Number(stream.nb_frames),expectedFrames);
 assert(Math.abs(Number(meta.format.duration)-record.duration)<.05);assert(Math.abs(record.duration-expectedFrames/manifest.fps)<.05);
 assert.equal(bytes.length,record.bytes);assert(bytes.length>1000&&bytes.length<100*1024*1024);
 // Parse top-level ISO BMFF atoms, rather than searching compressed bytes.
 const atoms=[];let at=0;while(at+8<=bytes.length){let size=bytes.readUInt32BE(at);const type=bytes.toString('ascii',at+4,at+8);if(size===1){size=Number(bytes.readBigUInt64BE(at+8));}else if(size===0)size=bytes.length-at;assert(size>=8&&at+size<=bytes.length);atoms.push(type);at+=size;}assert.equal(at,bytes.length);assert(atoms.includes('moov')&&atoms.includes('mdat')&&atoms.indexOf('moov')<atoms.indexOf('mdat'),'Fast-start metadata must precede media');
 assert.deepEqual(record.chapters,compiled.segments.map(s=>({index:s.index,start:s.start,end:s.end,title:s.current.title,text:s.current.text})));
 const posterPath=path.join(root,'dist',record.poster),poster=JSON.parse((await run(process.env.FFPROBE||'ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height','-of','json',posterPath])).stdout);
 assert.equal(poster.streams[0].codec_name,'webp');assert.equal(poster.streams[0].width,1280);assert.equal(poster.streams[0].height,720);
 const decoded=await run(process.env.FFMPEG||'ffmpeg',['-v','error','-xerror','-nostdin','-err_detect','explode','-threads','1','-i',mediaPath,'-map','0:v:0','-progress','pipe:1','-nostats','-fps_mode','passthrough','-f','null','-']);
 const decodedFrames=Number([...decoded.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1]);assert.equal(decodedFrames,expectedFrames,`${game.id}: every expected frame must decode`);
 rows.push({id:game.id,decodedFrames,duration:record.duration,bytes:record.bytes,frames:expectedFrames,chapters:record.chapters.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 if(rows.length%12===0)console.log(`Fully decoded and validated ${rows.length}/${games.length} films`);
}
assert.equal(new Set(rows.map(r=>r.sha256)).size,games.length,'Every game must have a distinct movie');
const report={checkedAt:new Date().toISOString(),films:rows.length,width:1280,height:720,fps:manifest.fps,codec:'H.264',pixelFormat:'yuv420p',fastStart:true,fullyDecoded:true,seconds:rows.reduce((n,r)=>n+r.duration,0),bytes:rows.reduce((n,r)=>n+r.bytes,0),chapters:rows.reduce((n,r)=>n+r.chapters,0),files:rows};
await fs.writeFile(path.join(root,'research/film-media-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Validated ${report.films} distinct H.264 films, ${report.chapters} chapters, ${(report.seconds/60).toFixed(2)} minutes, ${(report.bytes/1048576).toFixed(2)} MiB; matching source captions/timing, posters and fast-start headers.`);
