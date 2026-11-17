#!/usr/bin/env node
/**
 * Render the authored game films to real, captioned H.264 videos.
 *
 * Prerequisites: Node.js 22+, Python 3, ffmpeg/ffprobe with libx264 and libwebp.
 * Keep build-only native dependencies outside the deployed website:
 *   npm install --prefix /tmp/group-games-film-deps @resvg/resvg-js@2.6.2 wawoff2@2.0.1
 *   uv pip install --target /tmp/group-games-film-deps/python fonttools==4.60.1
 * (Or use python3 -m pip install --target with the same arguments.)
 *
 *   node tools/render-films.mjs --game=islands
 *   node tools/render-films.mjs --all --jobs=3
 *   node tools/render-films.mjs --all --width=1280 --fps=30 --crf=20
 *   node tools/render-films.mjs --game=islands --output=/tmp/game-previews
 *   node tools/render-films.mjs --game=islands --stills=1,12,24 --output=/tmp/game-stills
 *
 * --deps=/path overrides /tmp/group-games-film-deps (also GAME_FILM_DEPS).
 * --force regenerates even when current source fingerprints match.
 * Without --force, only matching v2 entries are probed and reused.
 * A custom --output directory is independent of the production media directory.
 * WOFF2 fonts are decompressed and instanced to static weights locally, because
 * SVG rasterizers use a variable font's default outlines. Original OFL notices
 * remain in site/assets/fonts/LICENSES.txt. A bundled DejaVu symbol subset has
 * its own adjacent license. PYTHON overrides python3 if needed.
 * Frames stream as lossless RGBA, avoiding a redundant PNG encode/decode.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const FILM_RELEASE=Object.freeze({version:2,width:1280,height:720,fps:30,crf:20});
const fontSources=['manrope.woff2','jetbrains-mono.woff2','film-symbols.ttf'].map(name=>`site/assets/fonts/${name}`);
const sha256=value=>createHash('sha256').update(value).digest('hex');
function stableJSON(value){
 if(Array.isArray(value))return `[${value.map(stableJSON).join(',')}]`;
 if(value&&typeof value==='object')return `{${Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>`${JSON.stringify(key)}:${stableJSON(value[key])}`).join(',')}}`;
 return JSON.stringify(value);
}
async function moduleGraph(entrypoints){
 const sources=new Map();
 async function visit(relative){
  relative=path.relative(root,path.resolve(root,relative)).split(path.sep).join('/');
  if(relative.startsWith('../'))throw new Error(`Film dependency escapes the project: ${relative}`);
  if(sources.has(relative))return;
  const bytes=await fs.readFile(path.join(root,relative));sources.set(relative,sha256(bytes));
  if(!/\.(?:m?js)$/.test(relative))return;
  for(const match of bytes.toString().matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"](\.[^'"]+)['"]|\bimport\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g)){
   await visit(path.join(path.dirname(relative),match[1]||match[2]));
  }
 }
 for(const entrypoint of entrypoints)await visit(entrypoint);
 return [...sources].sort(([a],[b])=>a.localeCompare(b)).map(([file,digest])=>({file,sha256:digest}));
}
/** Content identity, independent of Git HEAD, mtimes, output location or job count. */
export async function getFilmProvenance({width=FILM_RELEASE.width,height=width*9/16,fps=FILM_RELEASE.fps,crf=FILM_RELEASE.crf}={}){
 const encoding={codec:'h264',pixelFormat:'yuv420p',profile:'main',preset:'fast',crf,rasterizer:'@resvg/resvg-js@2.6.2'};
 // Resolved game/lesson objects belong in each film fingerprint, not this graph.
 const sources=await moduleGraph(['tools/render-films.mjs','tools/film-frame.mjs','site/film-timeline.js',...fontSources]);
 return{sourceRevision:sha256(stableJSON({version:2,width,height,fps,encoding,sources})),encoding};
}
export function filmFingerprint(sourceRevision,game,lesson,film){
 return sha256(stableJSON({sourceRevision,game,lesson,film}));
}
export function filmChapters(film){
 return film.segments.map(segment=>({index:segment.index,start:segment.start,end:segment.end,title:segment.current.title,text:segment.current.text}));
}
async function main(){
const argv=process.argv.slice(2),options={...FILM_RELEASE,jobs:3,force:false,all:false,games:[],stills:null,output:path.join(root,'site','films'),deps:process.env.GAME_FILM_DEPS||'/tmp/group-games-film-deps'};
const usage=()=>console.log('Usage: node tools/render-films.mjs --game=islands | --all [--jobs=3] [--width=1280] [--fps=30] [--crf=20] [--output=/tmp/previews] [--stills=1,12,24] [--force] [--deps=/tmp/group-games-film-deps]');
for(const arg of argv){
 if(arg==='--help'||arg==='-h'){usage();process.exit(0);}
 if(arg==='--all')options.all=true;
 else if(arg==='--force')options.force=true;
 else if(arg.startsWith('--game='))options.games.push(...arg.slice(7).split(',').filter(Boolean));
 else if(arg.startsWith('--width='))options.width=Number(arg.slice(8));
 else if(arg.startsWith('--fps='))options.fps=Number(arg.slice(6));
 else if(arg.startsWith('--crf='))options.crf=Number(arg.slice(6));
 else if(arg.startsWith('--jobs='))options.jobs=Number(arg.slice(7));
 else if(arg.startsWith('--output='))options.output=path.resolve(arg.slice(9));
 else if(arg.startsWith('--stills='))options.stills=arg.slice(9).split(',').map(Number);
 else if(arg.startsWith('--deps='))options.deps=path.resolve(arg.slice(7));
 else throw new Error(`Unknown option ${arg}`);
}
if(!options.all&&!options.games.length){usage();process.exit(1);}
if(!Number.isInteger(options.width)||options.width<320||options.width>2560||options.width%32)throw new Error('--width must be 320–2560 and a multiple of 32, so 16:9 H.264 dimensions are even.');
if(!Number.isInteger(options.fps)||options.fps<1||options.fps>60)throw new Error('--fps must be an integer between 1 and 60.');
if(!Number.isInteger(options.crf)||options.crf<0||options.crf>30)throw new Error('--crf must be an integer between 0 and 30 (lower is higher quality).');
if(!Number.isInteger(options.jobs)||options.jobs<1||options.jobs>3)throw new Error('--jobs must be 1, 2, or 3.');
if(options.stills?.some(time=>!Number.isFinite(time)||time<0))throw new Error('--stills must contain non-negative times in seconds.');
options.height=options.width*9/16;
const ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe';
const children=new Set();let interrupted=false;
function interrupt(){interrupted=true;for(const child of children){child.stdin?.destroy();child.kill('SIGTERM');}}
process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
function subprocess(executable,args,{stdin=false}={}){
 const child=spawn(executable,args,{stdio:[stdin?'pipe':'ignore','pipe','pipe']});children.add(child);
 const stdout=[],stderr=[];let stderrBytes=0;
 child.stdout.on('data',b=>stdout.push(b));child.stderr.on('data',b=>{if(stderrBytes<128*1024){stderr.push(b);stderrBytes+=b.length;}});
 // Keep a handler attached even when failure precedes the awaited drain event.
 child.stdin?.on('error',()=>{});
 const done=new Promise((resolve,reject)=>{
  child.once('error',error=>{children.delete(child);reject(error);});
  child.once('close',(code,signal)=>{children.delete(child);const err=Buffer.concat(stderr).toString();if(code!==0)reject(new Error(`${path.basename(executable)} ${signal||`exit ${code}`}: ${err.trim()||'no diagnostic output'}`));else resolve({stdout:Buffer.concat(stdout),stderr:err});});
 });
 // The stream can error before the producer awaits completion.
 done.catch(()=>{});
 return{child,done};
}
async function run(executable,args,input){const {child,done}=subprocess(executable,args,{stdin:input!==undefined});if(input!==undefined)child.stdin.end(input);return done;}
async function probe(file){const result=await run(ffprobe,['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,avg_frame_rate,nb_frames:format=duration,size','-of','json',file]);return JSON.parse(result.stdout.toString());}
function validateVideo(meta,film,file){
 const stream=meta.streams?.[0],duration=Number(meta.format?.duration),bytes=Number(meta.format?.size),expectedFrames=Math.ceil(film.duration*options.fps);
 if(!stream||stream.codec_name!=='h264'||stream.pix_fmt!=='yuv420p')throw new Error(`${file}: expected H.264 yuv420p`);
 if(stream.width!==options.width||stream.height!==options.height)throw new Error(`${file}: unexpected dimensions ${stream.width}×${stream.height}`);
 const rate=String(stream.avg_frame_rate).split('/').map(Number),fps=rate[0]/rate[1];if(Math.abs(fps-options.fps)>.001)throw new Error(`${file}: unexpected frame rate ${fps}`);
 if(!Number.isFinite(duration)||Math.abs(duration-expectedFrames/options.fps)>Math.max(.12,1/options.fps))throw new Error(`${file}: duration ${duration} does not match compiled film ${film.duration}`);
 if(Number(stream.nb_frames)!==expectedFrames)throw new Error(`${file}: expected ${expectedFrames} frames, received ${stream.nb_frames}`);
 if(!Number.isFinite(bytes)||bytes<1000)throw new Error(`${file}: missing video bytes`);
 return{duration,bytes};
}

await run(ffmpeg,['-version']);await run(ffprobe,['-version']);
const require=createRequire(path.join(path.resolve(options.deps),'package.json'));
let renderAsync,decompress;
try{({renderAsync}=require('@resvg/resvg-js'));({decompress}=require('wawoff2'));}
catch(error){throw new Error(`Film renderer dependencies are missing. Run: npm install --prefix ${options.deps} @resvg/resvg-js@2.6.2 wawoff2@2.0.1\n${error.message}`);}
const rasterizerPackage=JSON.parse(await fs.readFile(path.join(path.dirname(require.resolve('@resvg/resvg-js')),'package.json'),'utf8'));
if(rasterizerPackage.version!=='2.6.2')throw new Error(`Expected @resvg/resvg-js 2.6.2 for reproducible rendering; found ${rasterizerPackage.version}.`);
const fontDir=path.join(options.deps,'fonts');await fs.mkdir(fontDir,{recursive:true});
const fontFiles=[];
let prepareInstances=false;
for(const [name,weights] of [['manrope',[400,600,800]],['jetbrains-mono',[400,700]]]){
 const source=path.join(root,'site','assets','fonts',name+'.woff2'),target=path.join(fontDir,name+'.ttf');
 const sourceBytes=await fs.readFile(source),identity=sha256(sourceBytes),stamp=path.join(fontDir,name+'.source-sha256');
 let regenerate=true;try{regenerate=(await fs.readFile(stamp,'utf8')).trim()!==identity;await fs.access(target);}catch{regenerate=true;}
 if(regenerate){
  await fs.writeFile(target,await decompress(sourceBytes));
  await Promise.all(weights.map(weight=>fs.rm(path.join(fontDir,`${name}-${weight}.ttf`),{force:true})));
  await fs.writeFile(stamp,identity+'\n');
 }
 for(const weight of weights){
  const instance=path.join(fontDir,`${name}-${weight}.ttf`);fontFiles.push(instance);
  try{if((await fs.stat(target)).mtimeMs>(await fs.stat(instance)).mtimeMs)prepareInstances=true;}catch{prepareInstances=true;}
 }
}
if(prepareInstances){
 const python=process.env.PYTHON||'python3';
 const instanceFonts=`
import sys
from pathlib import Path
sys.path.insert(0,sys.argv[1])
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
folder=Path(sys.argv[2])
for filename,family,weights in [('manrope','Manrope',[400,600,800]),('jetbrains-mono','JetBrains Mono',[400,700])]:
 source=TTFont(folder/(filename+'.ttf'))
 for weight in weights:
  output=folder/f'{filename}-{weight}.ttf'
  if output.exists() and output.stat().st_mtime >= (folder/(filename+'.ttf')).stat().st_mtime:
   continue
  font=instantiateVariableFont(source,{'wght':weight},inplace=False)
  font.flavor=None
  style={400:'Regular',600:'SemiBold',700:'Bold',800:'ExtraBold'}[weight]
  names={1:family,2:style,3:f'{family};{style}',4:f'{family} {style}',6:family.replace(' ','')+'-'+style,16:family,17:style}
  font['name'].names=[name for name in font['name'].names if name.nameID not in names]
  for name_id,value in names.items():
   font['name'].setName(value,name_id,3,1,0x409)
   font['name'].setName(value,name_id,1,0,0)
  font['OS/2'].usWeightClass=weight
  font['OS/2'].fsSelection=(font['OS/2'].fsSelection&~(1|32|64))|(32 if weight>=700 else 64 if weight==400 else 0)
  font['head'].macStyle=(font['head'].macStyle&~3)|(1 if weight>=700 else 0)
  font.save(output)
`;
 try{await run(python,['-c',instanceFonts,path.join(options.deps,'python'),fontDir]);}
 catch(error){throw new Error(`Static film fonts could not be generated. Run: uv pip install --target ${path.join(options.deps,'python')} fonttools==4.60.1\n${error.message}`);}
}
fontFiles.push(path.join(root,'site','assets','fonts','film-symbols.ttf'));
const provenance=await getFilmProvenance(options);
const [{LESSONS},{compileFilm,sampleFilm},{renderFrame}]=await Promise.all([
 import(pathToFileURL(path.join(root,'site','lessons.js'))),
 import(pathToFileURL(path.join(root,'site','film-timeline.js'))),
 import(pathToFileURL(path.join(root,'tools','film-frame.mjs')))
]);
const families=['chase','dodge','target','world','team','together'];
const games=(await Promise.all(['chase-dodge','world-target','team-together'].map(async file=>JSON.parse(await fs.readFile(path.join(root,'site','data',file+'.json'),'utf8'))))).flat().sort((a,b)=>families.indexOf(a.family)-families.indexOf(b.family));
const ids=new Set(games.map(g=>g.id));for(const id of options.games)if(!ids.has(id))throw new Error(`Unknown game: ${id}`);
const selected=options.all?games:[...new Set(options.games)].map(id=>games.find(g=>g.id===id));
const films=new Map(games.map(game=>[game.id,compileFilm(game,LESSONS[game.id])]));
const fingerprints=new Map(games.map(game=>[game.id,filmFingerprint(provenance.sourceRevision,game,LESSONS[game.id],films.get(game.id))]));
// Fail before a long encode if a new caption or game name needs an absent glyph.
const glyphs=new Set(),entities={'amp':'&','lt':'<','gt':'>','quot':'"','apos':"'"};
for(const game of selected){
 const film=films.get(game.id);
 for(const time of [film.intro*.6,...film.segments.flatMap(segment=>[(segment.start+segment.end)/2,segment.end-.01]),film.duration-1]){
  const svg=renderFrame(game,film,sampleFilm(film,time));
  for(const match of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)){
   const text=match[1].replace(/<[^>]*>/g,'').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_,value)=>value[0]==='#'?String.fromCodePoint(parseInt(value.slice(value[1].toLowerCase()==='x'?2:1),value[1].toLowerCase()==='x'?16:10)):entities[value.toLowerCase()]);
   for(const char of text)if(!/\s/u.test(char))glyphs.add(char.codePointAt(0));
  }
 }
}
const checkGlyphs=`
import sys,json
sys.path.insert(0,sys.argv[1])
from fontTools.ttLib import TTFont
covered=set().union(*(TTFont(path).getBestCmap() for path in sys.argv[2:]))
missing=sorted(set(json.load(sys.stdin))-covered)
if missing:
 raise SystemExit('Missing film glyphs: '+', '.join(f'U+{code:04X} {chr(code)}' for code in missing))
`;
await run(process.env.PYTHON||'python3',['-c',checkGlyphs,path.join(options.deps,'python'),...fontFiles],Buffer.from(JSON.stringify([...glyphs])));
async function assertCurrentSource(){
 if((await getFilmProvenance(options)).sourceRevision!==provenance.sourceRevision){
  interrupted=true;
  throw new Error('Rendering source changed during this process. Restart to load the current modules; completed matching films remain resumable.');
 }
}
await assertCurrentSource();
const output=options.output,production=output===path.join(root,'site','films');await fs.mkdir(output,{recursive:true});
const assetPath=(id,extension)=>`${production?'films/':''}${id}.${extension}`;
const manifestPath=path.join(output,'manifest.json');let entries=new Map();
try{
 const old=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 if(old.version===2&&old.sourceRevision===provenance.sourceRevision&&old.width===options.width&&old.height===options.height&&old.fps===options.fps&&stableJSON(old.encoding)===stableJSON(provenance.encoding)){
  entries=new Map(old.films.filter(f=>ids.has(f.id)&&f.sourceFingerprint===fingerprints.get(f.id)&&f.src===assetPath(f.id,'mp4')&&f.poster===assetPath(f.id,'webp')).map(f=>[f.id,f]));
 }
}catch(error){if(error.code!=='ENOENT')console.log(`Starting a fresh manifest: ${error.message}`);}
let manifestWrites=Promise.resolve();
function writeManifest(){
 manifestWrites=manifestWrites.then(async()=>{
  const manifest={version:2,width:options.width,height:options.height,fps:options.fps,...provenance,films:games.map(g=>entries.get(g.id)).filter(Boolean)};
  const temp=manifestPath+`.${process.pid}.tmp`;await fs.writeFile(temp,JSON.stringify(manifest,null,2)+'\n');await fs.rename(temp,manifestPath);
 });return manifestWrites;
}
// Glyph coverage is checked above. Symbol fallback is intentional and resvg logs
// it once per frame at warning level, so keep its error diagnostics only.
const rasterOptions={fitTo:{mode:'width',value:options.width},font:{loadSystemFonts:false,fontFiles,defaultFontFamily:'Manrope',sansSerifFamily:'Manrope',monospaceFamily:'JetBrains Mono'},shapeRendering:2,textRendering:2,logLevel:'error'};
if(options.stills){
 for(const game of selected){
  const film=films.get(game.id);
  for(const time of options.stills){
   if(time>=film.duration)throw new Error(`${game.id}: still time ${time} is outside its ${film.duration.toFixed(2)}s film.`);
   const target=path.join(output,`${game.id}-${String(time).replace('.','_')}s.png`),temp=target+`.${process.pid}.tmp`;
   const svg=renderFrame(game,film,sampleFilm(film,time));
   await fs.writeFile(temp,(await renderAsync(svg,rasterOptions)).asPng());await fs.rename(temp,target);
   console.log(target);
  }
 }
 await assertCurrentSource();return;
}
let completed=0,reused=0;const started=performance.now();
async function encode(game){
 if(interrupted)throw new Error('Film render interrupted. Completed videos remain resumable.');
 const film=films.get(game.id),frames=Math.ceil(film.duration*options.fps);
 if(!Number.isFinite(film.duration)||film.duration<=0||!frames)throw new Error(`${game.id}: invalid compiled duration`);
 const movie=path.join(output,game.id+'.mp4'),poster=path.join(output,game.id+'.webp');
 if(!options.force&&entries.has(game.id)){
  try{
   const actual=validateVideo(await probe(movie),film,movie),image=await probe(poster),record=entries.get(game.id);
   if(image.streams?.[0]?.codec_name!=='webp'||image.streams?.[0]?.width!==options.width||image.streams?.[0]?.height!==options.height)throw new Error('Invalid poster');
   if(actual.bytes!==record.bytes||Math.abs(actual.duration-record.duration)>.001||stableJSON(record.chapters)!==stableJSON(filmChapters(film)))throw new Error('Manifest metadata does not match the video or source chapters');
   await assertCurrentSource();reused++;completed++;console.log(`[${completed}/${selected.length}] Reusing verified ${game.id}`);return;
  }catch(error){console.log(`Rebuilding ${game.id}: ${error.message}`);}
 }
 const tempMovie=path.join(output,`.${game.id}.${process.pid}.tmp.mp4`),tempPoster=path.join(output,`.${game.id}.${process.pid}.tmp.webp`);
 const jobStart=performance.now();let rendered=0,cached=0,lastNotice=jobStart,lastSVG=null,lastPixels=null,svgMs=0,rasterMs=0,pipeMs=0;
 console.log(`Rendering ${game.id}: ${film.duration.toFixed(2)}s, ${frames} frames, ${options.width}×${options.height}`);
 const encoder=subprocess(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${options.width}x${options.height}`,'-framerate',String(options.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf',String(options.crf),'-profile:v','main','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',tempMovie],{stdin:true});
 let encoderFailed=null;encoder.done.catch(error=>{encoderFailed=error;});
 try{
  for(let frame=0;frame<frames;frame++){
   if(interrupted)throw new Error('Film render interrupted.');if(encoderFailed)throw encoderFailed;
   let tick=performance.now();
   const sample=sampleFilm(film,Math.min(frame/options.fps,film.duration)),svg=renderFrame(game,film,sample);svgMs+=performance.now()-tick;
   let pixels;if(svg===lastSVG){pixels=lastPixels;cached++;}else{tick=performance.now();pixels=(await renderAsync(svg,rasterOptions)).pixels;rasterMs+=performance.now()-tick;lastSVG=svg;lastPixels=pixels;rendered++;}
   tick=performance.now();
   if(!encoder.child.stdin.write(pixels))await Promise.race([once(encoder.child.stdin,'drain'),encoder.done.then(()=>{throw new Error('Encoder ended before receiving every frame');})]);
   pipeMs+=performance.now()-tick;
   const now=performance.now();if(now-lastNotice>10000){console.log(`  ${game.id}: ${Math.round((frame+1)/frames*100)}% · ${rendered} rasterized / ${cached} reused`);lastNotice=now;}
  }
  encoder.child.stdin.end();await encoder.done;
  const actual=validateVideo(await probe(tempMovie),film,tempMovie);
  const posterChapter=film.segments[1]||film.segments[0],posterTime=(posterChapter.start+posterChapter.end)/2;
  const posterSVG=renderFrame(game,film,sampleFilm(film,posterTime)),posterPNG=(await renderAsync(posterSVG,rasterOptions)).asPng();
  await run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-f','image2pipe','-i','pipe:0','-frames:v','1','-c:v','libwebp','-quality','90','-compression_level','4',tempPoster],posterPNG);
  const image=await probe(tempPoster);if(image.streams?.[0]?.width!==options.width||image.streams?.[0]?.height!==options.height||(await fs.stat(tempPoster)).size<100)throw new Error(`${game.id}: poster verification failed`);
  await assertCurrentSource();
  await fs.rename(tempMovie,movie);await fs.rename(tempPoster,poster);
  entries.set(game.id,{id:game.id,src:assetPath(game.id,'mp4'),poster:assetPath(game.id,'webp'),sourceFingerprint:fingerprints.get(game.id),duration:actual.duration,bytes:actual.bytes,chapters:filmChapters(film)});
  await writeManifest();completed++;
  console.log(`[${completed}/${selected.length}] ${game.id}: ${(actual.bytes/1048576).toFixed(2)} MiB, ${((performance.now()-jobStart)/1000).toFixed(1)}s render, ${rendered} rasterized / ${cached} reused`);
  console.log(`  Profile ${game.id}: SVG ${(svgMs/1000).toFixed(2)}s, raster ${(rasterMs/1000).toFixed(2)}s, encoder pipe ${(pipeMs/1000).toFixed(2)}s; ${rendered?(rasterMs/rendered).toFixed(2):0}ms per unique raster`);
 }catch(error){encoder.child.stdin.destroy();encoder.child.kill('SIGTERM');await encoder.done.catch(()=>{});await Promise.all([fs.rm(tempMovie,{force:true}),fs.rm(tempPoster,{force:true})]);throw error;}
}
let cursor=0;const failures=[];
async function worker(){while(cursor<selected.length&&!interrupted){const game=selected[cursor++];try{await encode(game);}catch(error){failures.push({id:game.id,error:error.message});console.error(`FAILED ${game.id}: ${error.message}`);}}}
await Promise.all(Array.from({length:Math.min(options.jobs,selected.length)},worker));await manifestWrites;
const elapsed=(performance.now()-started)/1000;
console.log(JSON.stringify({selected:selected.length,completed,reused,failed:failures.length,seconds:Math.round(elapsed*10)/10,manifest:path.relative(root,manifestPath),failures},null,2));
if(failures.length||interrupted)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
