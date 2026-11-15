#!/usr/bin/env node
// Measure decoded court motion without the header, progress bar or captions.
//   node tools/validate-film-motion.mjs --films=/tmp/previews --output=/tmp/motion.json
//   node tools/validate-film-motion.mjs --game=islands,human-knot --films=/tmp/previews
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),run=promisify(execFile);
const options={films:path.join(root,'dist/films'),output:null,games:[]};
for(const arg of process.argv.slice(2)){
 if(arg.startsWith('--films='))options.films=path.resolve(arg.slice(8));
 else if(arg.startsWith('--output='))options.output=path.resolve(arg.slice(9));
 else if(arg.startsWith('--game='))options.games.push(...arg.slice(7).split(',').filter(Boolean));
 else if(arg==='--help'||arg==='-h'){console.log('Usage: node tools/validate-film-motion.mjs [--films=/tmp/previews] [--game=islands,human-knot] [--output=/tmp/motion.json]');process.exit(0);}
 else throw new Error(`Unknown option ${arg}`);
}
const production=options.films===path.join(root,'dist/films')&&!options.games.length;
options.output??=production?path.join(root,'research/cinema-motion-check.json'):path.join(options.films,'motion-check.json');
const manifest=JSON.parse(await fs.readFile(path.join(options.films,'manifest.json'),'utf8'));
assert.equal(manifest.width,1280);assert.equal(manifest.height,720);assert.equal(manifest.fps,30);
for(const id of options.games)assert(manifest.films.some(f=>f.id===id),`No completed movie for ${id}`);
const selected=manifest.films.filter(f=>!options.games.length||options.games.includes(f.id));
assert(selected.length,'No completed films to measure');
const crop={x:30,y:78,width:1220,height:466};
const frameBytes=crop.width*crop.height,round=value=>Math.round(value*100000)/100000;
function sceneDelta(current,previous){
 let total=0,changed=0;
 for(let i=0;i<current.length;i++){const delta=Math.abs(current[i]-previous[i]);total+=delta;if(delta>=3)changed++;}
 return {meanAbsoluteDelta:round(total/current.length),changedPixelFraction:round(changed/current.length)};
}
async function measure(record){
 const file=path.join(options.films,record.id+'.mp4');
 const meta=JSON.parse((await run(process.env.FFPROBE||'ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,avg_frame_rate,nb_frames:format=duration','-of','json',file])).stdout);
 const stream=meta.streams[0],fps=manifest.fps,expectedFrames=Number(stream.nb_frames);
 assert.equal(stream.width,manifest.width);assert.equal(stream.height,manifest.height);assert.equal(stream.avg_frame_rate,`${fps}/1`);
 const decoder=spawn(process.env.FFMPEG||'ffmpeg',['-v','error','-xerror','-nostdin','-err_detect','explode','-threads','1','-i',file,'-map','0:v:0','-an','-vf',`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},format=gray`,'-fps_mode','passthrough','-f','rawvideo','pipe:1'],{stdio:['ignore','pipe','pipe']});
 const buffer=Buffer.allocUnsafe(frameBytes),errors=[],unique=new Set(),runs=[],windows=[];
 let offset=0,frames=0,lastHash=null,runStart=0,runFrames=0,identicalAdjacentFrames=0,previousSecond=null,previousSecondFrame=0;
 const rememberRun=()=>{if(runFrames>1)runs.push({start:round(runStart/fps),end:round((runStart+runFrames-1)/fps),frames:runFrames,unchangedSeconds:round((runFrames-1)/fps)});};
 decoder.stderr.on('data',data=>errors.push(data));
 decoder.stdout.on('data',chunk=>{
  let at=0;
  while(at<chunk.length){
   const length=Math.min(chunk.length-at,frameBytes-offset);chunk.copy(buffer,offset,at,at+length);offset+=length;at+=length;
   if(offset!==frameBytes)continue;
   const hash=createHash('sha256').update(buffer).digest('hex');unique.add(hash);
   if(hash===lastHash){identicalAdjacentFrames++;runFrames++;}
   else{rememberRun();runStart=frames;runFrames=1;lastHash=hash;}
   if(frames%fps===0){
    if(previousSecond)windows.push({start:round(previousSecondFrame/fps),end:round(frames/fps),...sceneDelta(buffer,previousSecond)});
    previousSecond=Buffer.from(buffer);previousSecondFrame=frames;
   }
   frames++;offset=0;
  }
 });
 await new Promise((resolve,reject)=>{decoder.on('error',reject);decoder.on('close',code=>code===0?resolve():reject(new Error(`${record.id}: ffmpeg ${code}: ${Buffer.concat(errors).toString()}`)));});
 rememberRun();assert.equal(offset,0,'Partial decoded frame');assert.equal(frames,expectedFrames,`${record.id}: every frame must be analyzed`);
 runs.sort((a,b)=>b.frames-a.frames||a.start-b.start);
 const largest=runs[0]||{start:0,end:0,frames:1,unchangedSeconds:0};
 return {id:record.id,sourceFingerprint:record.sourceFingerprint,sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex'),duration:Number(meta.format.duration),frames,uniqueCourtFrames:unique.size,courtHasMotion:unique.size>1,identicalAdjacentFrames,identicalAdjacentFraction:round(identicalAdjacentFrames/Math.max(1,frames-1)),longestUnchangedRun:largest,longestRuns:runs.slice(0,8),oneSecondDelta:{windows:windows.length,minimum:windows.length?Math.min(...windows.map(w=>w.meanAbsoluteDelta)):null,median:windows.length?[...windows].sort((a,b)=>a.meanAbsoluteDelta-b.meanAbsoluteDelta)[Math.floor(windows.length/2)].meanAbsoluteDelta:null,maximum:windows.length?Math.max(...windows.map(w=>w.meanAbsoluteDelta)):null,zeroChangeWindows:windows.filter(w=>w.meanAbsoluteDelta===0).length,samples:windows}};
}
const films=[];
for(const record of selected){
 const result=await measure(record);films.push(result);
 console.log(`${record.id}: ${result.uniqueCourtFrames}/${result.frames} unique court frames; ${(100*result.identicalAdjacentFraction).toFixed(2)}% identical neighbors; longest unchanged ${result.longestUnchangedRun.unchangedSeconds}s; 1s MAD min/median ${result.oneSecondDelta.minimum}/${result.oneSecondDelta.median}`);
}
const report={checkedAt:new Date().toISOString(),status:films.every(f=>f.courtHasMotion)?'measured':'static_court_detected',sourceRevision:manifest.sourceRevision,scope:production?'release':'preview',films:films.length,fps:manifest.fps,method:{crop,referenceCourt:{x:22,y:70,width:1236,height:482},guardPixels:8,reason:'An eight-pixel inset excludes compression bleed from the header progress line and the legend boundary.',exactMotion:'SHA-256 of every decoded grayscale crop, with adjacent equality and unchanged runs.',oneSecondMotion:'Mean absolute grayscale difference (0–255) at one-second sample intervals; changedPixelFraction counts pixels differing by at least 3 gray levels.',limits:'Pixel changes can include lines, labels or effects inside the court. This measures actual raster motion but does not replace reviewing whether the demonstrated action is understandable.'},files:films};
await fs.mkdir(path.dirname(options.output),{recursive:true});const temp=options.output+`.${process.pid}.tmp`;await fs.writeFile(temp,JSON.stringify(report,null,2)+'\n');await fs.rename(temp,options.output);
console.log(options.output);if(report.status==='static_court_detected')process.exitCode=1;
