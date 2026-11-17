#!/usr/bin/env node
/**
 * Audit outer-film typography from renderFrame's actual SVG, including entrance
 * offsets, static TTF advances/ink bounds/descent, legends and text collisions.
 * Requires the build-only fontTools/static fonts prepared by render-films.mjs.
 *   node tools/validate-film-layout.mjs
 *   node tools/validate-film-layout.mjs --output=/tmp/layout-check.json
 * Failures write to --output, or /tmp/group-games-film-layout-failures.json, keeping
 * the last successful release report until the new composition passes.
 * The moving court is intentionally excluded; its geometry has separate QA.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {LESSONS} from '../site/lessons.js';
import {compileFilm,sampleFilm} from '../site/film-timeline.js';
import {renderFrame} from './film-frame.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const options={deps:process.env.GAME_FILM_DEPS||'/tmp/group-games-film-deps',output:null};
for(const arg of process.argv.slice(2)){
 if(arg.startsWith('--deps='))options.deps=path.resolve(arg.slice(7));
 else if(arg.startsWith('--output='))options.output=path.resolve(arg.slice(9));
 else if(arg==='--help'||arg==='-h'){console.log('Usage: node tools/validate-film-layout.mjs [--deps=/tmp/group-games-film-deps] [--output=/tmp/check.json]');process.exit(0);}
 else throw new Error(`Unknown option ${arg}`);
}
const fontFiles=[
 {family:'Manrope',weight:400,file:path.join(options.deps,'fonts','manrope-400.ttf')},
 {family:'Manrope',weight:600,file:path.join(options.deps,'fonts','manrope-600.ttf')},
 {family:'JetBrains Mono',weight:400,file:path.join(options.deps,'fonts','jetbrains-mono-400.ttf')},
 {family:'GAMESSSS Symbols',weight:400,file:path.join(root,'site/assets/fonts/film-symbols.ttf'),fallback:true},
];
for(const font of fontFiles){
 try{font.sha256=createHash('sha256').update(await fs.readFile(font.file)).digest('hex');}
 catch{throw new Error(`Missing static font ${font.file}. Prepare fonts first with tools/render-films.mjs --game=islands --stills=1 --output=/tmp/film-font-check.`);}
}
const sourceFiles=['tools/film-frame.mjs','site/film-timeline.js','site/film-theme.js','site/core.js','site/lesson-kit.js','site/lessons.js','site/lessons-chase-dodge.js','site/lessons-world-target.js','site/lessons-team-together.js',...['chase-dodge','world-target','team-together'].map(name=>`site/data/${name}.json`)];
const sources=await Promise.all(sourceFiles.map(async file=>({file,sha256:createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex')})));
const games=(await Promise.all(['chase-dodge','world-target','team-together'].map(name=>fs.readFile(path.join(root,'site/data',name+'.json'),'utf8').then(JSON.parse)))).flat();
const frames=[],expected={games:games.length,chapters:0,legendLabels:0};
for(const game of games){
 const film=compileFilm(game,LESSONS[game.id]);expected.chapters+=film.segments.length;expected.legendLabels+=film.lesson.legend.length;
 const samples=[{time:0,chapter:0,state:'opening'},...film.segments.flatMap(segment=>[
  {time:segment.start,chapter:segment.index,state:'entrance'},
  {time:segment.start+Math.min(.8,(segment.end-segment.start)/2),chapter:segment.index,state:'settled'},
 ])];
 for(const sample of samples){
  const svg=renderFrame(game,film,sampleFilm(film,sample.time));
  const court=/<svg\b[^>]*class="film-canvas"[\s\S]*?<\/svg>/;
  if(!court.test(svg))throw new Error(`${game.id}: expected a separate film-canvas SVG so outer-text coverage can be verified.`);
  frames.push({game:game.id,...sample,svg:svg.replace(court,'')});
 }
}
const python=String.raw`
import sys,json,hashlib,re,math
from pathlib import Path
from collections import defaultdict
import xml.etree.ElementTree as ET
sys.path.insert(0,sys.argv[1])
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
payload=json.load(sys.stdin)
fonts=[]
for item in payload['fonts']:
 font=TTFont(item['file']); fonts.append(dict(item,font=font,cmap=font.getBestCmap(),glyphs=font.getGlyphSet(),units=font['head'].unitsPerEm))
fallback=next(font for font in fonts if font.get('fallback'))
glyph_bounds={}
failures=[];linebox_collisions=0;maximum_linebox_overlap=0.;caption_ink_gaps=[];specimens={};observations=defaultdict(list);caption_counts=[];legend_count=0
def number(value):
 return float(value or 0)
def transform(value):
 if not value:return (0.,0.)
 match=re.fullmatch(r'translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)',value)
 if not match:raise ValueError('Unsupported outer text transform: '+value)
 return (float(match[1]),float(match[2] or 0))
def measure(value,family,weight,size,spacing):
 choices=[font for font in fonts if font['family']==family and not font.get('fallback')]
 if not choices:raise ValueError('Unaudited font family '+family)
 font=min(choices,key=lambda item:abs(item['weight']-weight))
 if font['weight']!=weight:raise ValueError('Missing exact static font weight '+str((family,weight)))
 cursor=0.;bounds=None;ascent=0.;descent=0.
 for index,char in enumerate(value):
  use=font if ord(char) in font['cmap'] else fallback
  if ord(char) not in use['cmap']:raise ValueError(f'Missing glyph U+{ord(char):04X} {char}')
  glyph=use['cmap'][ord(char)];scale=size/use['units'];key=(use['file'],glyph)
  if key not in glyph_bounds:
   pen=BoundsPen(use['glyphs']);use['glyphs'][glyph].draw(pen);glyph_bounds[key]=pen.bounds
  ink=glyph_bounds[key]
  if ink:
   part=(cursor+ink[0]*scale,-ink[3]*scale,cursor+ink[2]*scale,-ink[1]*scale)
   bounds=part if bounds is None else (min(bounds[0],part[0]),min(bounds[1],part[1]),max(bounds[2],part[2]),max(bounds[3],part[3]))
  ascent=max(ascent,use['font']['hhea'].ascent*scale);descent=max(descent,-use['font']['hhea'].descent*scale)
  cursor+=use['font']['hmtx'][glyph][0]*scale
  if index+1<len(value):cursor+=spacing
 return cursor,bounds or (0,0,0,0),ascent,descent
def kind_for(y,family):
 if y<70:return 'header' if family=='Manrope' else 'family tag' if y<40 else 'header sequence'
 if 552<=y<585:return 'legend'
 if 585<=y<620:return 'chapter cue'
 if 620<=y<660:return 'chapter title'
 if y>=660:return 'caption'
 raise ValueError('Unclassified outer text baseline '+str(y))
def overlap(a,b):
 return min(a[2],b[2])-max(a[0],b[0]),min(a[3],b[3])-max(a[1],b[1])
def issue(frame,kind,value,reason,**details):
 failures.append(dict(game=frame['game'],chapter=frame['chapter'],state=frame['state'],kind=kind,value=value,reason=reason,**details))
for frame in payload['frames']:
 root=ET.fromstring(frame['svg']);texts=[];circles=[]
 def walk(element,offset=(0,0),inherited=None):
  attrs=dict(inherited or {});attrs.update(element.attrib)
  dx,dy=transform(element.attrib.get('transform',''));offset=(offset[0]+dx,offset[1]+dy)
  tag=element.tag.rsplit('}',1)[-1]
  if tag=='text':
   if list(element):raise ValueError('Outer tspan layout needs an explicit audit implementation.')
   value=''.join(element.itertext());family=attrs.get('font-family','Manrope');weight=int(attrs.get('font-weight',400));size=number(attrs['font-size']);spacing=number(attrs.get('letter-spacing',0))
   x=number(attrs.get('x',0))+offset[0];y=number(attrs.get('y',0))+offset[1];kind=kind_for(number(attrs.get('y',0)),family)
   advance,ink,ascent,descent=measure(value,family,weight,size,spacing)
   anchor=attrs.get('text-anchor','start');shift=advance if anchor=='end' else advance/2 if anchor=='middle' else 0
   box=(x-shift+ink[0],y+ink[1],x-shift+ink[2],y+ink[3]);linebox=(x-shift,y-ascent,x-shift+advance,y+descent)
   region=(46,0,1234,68) if kind in ('header','family tag','header sequence') else (20,552,1260,585) if kind=='legend' else (46,585,1234,720)
   gaps=dict(leftGapPx=linebox[0]-region[0],rightGapPx=region[2]-max(linebox[2],box[2]),bottomGapPx=region[3]-max(linebox[3],box[3]),inkTopGapPx=box[1]-region[1])
   row=dict(game=frame['game'],chapter=frame['chapter'],state=frame['state'],kind=kind,value=value,family=family,weight=weight,size=size,advancePx=advance,box=list(box),linebox=list(linebox),**gaps)
   texts.append(row);observations[kind].append(row)
   key=(frame['game'],kind,frame['chapter'] if kind in ('chapter cue','chapter title','caption') else None,value)
   specimens[key]=row
   for edge,gap in gaps.items():
    if gap<-.05:issue(frame,kind,value,'region overflow',edge=edge,overflowPx=-gap,box=list(box),linebox=list(linebox))
   if min(box[0],box[1])<-.05 or box[2]>1280.05 or box[3]>720.05:issue(frame,kind,value,'frame clipping',box=list(box))
  elif tag=='circle' and number(attrs.get('cy',0))>=552:
   x=number(attrs['cx'])+offset[0];y=number(attrs['cy'])+offset[1];r=number(attrs['r'])+.35
   circles.append((x-r,y-r,x+r,y+r))
  for child in element:walk(child,offset,attrs)
 walk(root)
 for i,a in enumerate(texts):
  for b in texts[i+1:]:
   ox,oy=overlap(a['box'],b['box'])
   if ox>.05 and oy>.05:issue(frame,a['kind'],a['value'],'text overlap',otherKind=b['kind'],otherValue=b['value'],overlapPx=[ox,oy])
   if a['kind']==b['kind']=='caption':
    lx,ly=overlap(a['linebox'],b['linebox'])
    if lx>.05 and ly>.05:linebox_collisions+=1;maximum_linebox_overlap=max(maximum_linebox_overlap,ly)
    upper,lower=sorted((a,b),key=lambda row:row['box'][1]);caption_ink_gaps.append(lower['box'][1]-upper['box'][3])
  if a['kind']=='legend':
   for circle in circles:
    ox,oy=overlap(a['box'],circle)
    if ox>.05 and oy>.05:issue(frame,'legend',a['value'],'legend swatch overlap',overlapPx=[ox,oy])
 if frame['state']=='settled':
  titles=[row for row in texts if row['kind']=='chapter title'];captions=[row for row in texts if row['kind']=='caption']
  if len(titles)!=1:issue(frame,'chapter title','','expected exactly one title',count=len(titles))
  if not 1<=len(captions)<=2:issue(frame,'caption','','caption must use one or two lines',count=len(captions))
  caption_counts.append(len(captions))
  if frame['chapter']==0:legend_count+=sum(row['kind']=='legend' for row in texts)
unique=defaultdict(list)
for row in specimens.values():unique[row['kind']].append(row)
by_kind={}
for kind,rows in observations.items():
 worst=min(rows,key=lambda row:row['rightGapPx'])
 by_kind[kind]=dict(uniqueTextLines=len(unique[kind]),observations=len(rows),maximumAdvancePx=max(row['advancePx'] for row in rows),minimumRightGapPx=min(row['rightGapPx'] for row in rows),minimumBottomGapPx=min(row['bottomGapPx'] for row in rows),minimumInkTopGapPx=min(row['inkTopGapPx'] for row in rows),tightestHorizontalSpecimen={key:worst[key] for key in ['game','chapter','value','advancePx','rightGapPx']})
# Repeated opening/settled observations may report one underlying issue twice.
dedup={}
for finding in failures:
 key=json.dumps({key:value for key,value in finding.items() if key not in ('state','box','linebox','overflowPx','overlapPx')},sort_keys=True)
 dedup.setdefault(key,finding)
failures=list(dedup.values())
coverage=dict(games=len(unique['header']),chapters=len(caption_counts),legendLabels=legend_count,maximumCaptionLines=max(caption_counts),textLines=len(specimens),frames=len(payload['frames']))
for key in ['games','chapters','legendLabels']:
 if coverage[key]!=payload['expected'][key]:failures.append(dict(reason='coverage mismatch',kind=key,expected=payload['expected'][key],actual=coverage[key]))
report=dict(checkedAt=payload['checkedAt'],status='passed' if not failures else 'failed',edition='v4 continuous dark films',frameSource='tools/film-frame.mjs',frameSourceSHA256=payload['sources'][0]['sha256'],sources=payload['sources'],frame=dict(width=1280,height=720),coverage=coverage,method=dict(horizontal='Static TTF cmap+hmtx advances plus SVG letter-spacing and text-anchor; glyph ink bounds use fontTools BoundsPen. Font fallback is measured per glyph.',vertical='Transformed baselines, actual glyph ink bounds, and conservative hhea ascent/descent. All chapter entrance and settled offsets plus the opening frame are checked.',fonts=[{key:value for key,value in font.items() if key in ('family','weight','sha256','fallback')} for font in payload['fonts']],limits='Advance bounds omit kerning. Pairwise collision checks use glyph-ink bounding rectangles; moving court geometry is excluded and requires separate visual QA.'),lineSpacing=dict(minimumCaptionInkGapPx=min(caption_ink_gaps) if caption_ink_gaps else None,fontLineboxPaddingOverlapObservations=linebox_collisions,maximumFontLineboxPaddingOverlapPx=maximum_linebox_overlap,note='Font hhea boxes include unused ascender/descender padding. Actual caption ink separation, not overlapping blank padding, determines text collisions.'),byKind=by_kind,remainingOverflows=failures)
print(json.dumps(report,indent=2))
`;
const child=spawn(process.env.PYTHON||'python3',['-c',python,path.join(options.deps,'python')],{stdio:['pipe','pipe','pipe']});
const stdout=[],stderr=[];child.stdout.on('data',data=>stdout.push(data));child.stderr.on('data',data=>stderr.push(data));child.stdin.on('error',()=>{});
child.stdin.end(JSON.stringify({frames,fonts:fontFiles,sources,expected,checkedAt:new Date().toISOString()}));
await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(Buffer.concat(stderr).toString()||`Layout audit exited ${code}`)));});
const report=JSON.parse(Buffer.concat(stdout).toString());
for(const source of sources){
 if(createHash('sha256').update(await fs.readFile(path.join(root,source.file))).digest('hex')!==source.sha256)throw new Error(`${source.file} changed during the layout audit; rerun before saving its report.`);
}
for(const font of fontFiles){
 if(createHash('sha256').update(await fs.readFile(font.file)).digest('hex')!==font.sha256)throw new Error(`${font.file} changed during the layout audit; rerun with stable static fonts.`);
}
const target=options.output||(report.status==='passed'?path.join(root,'research/checks/cinema-layout-check.json'):'/tmp/group-games-film-layout-failures.json');
await fs.mkdir(path.dirname(target),{recursive:true});const temporary=target+`.${process.pid}.tmp`;await fs.writeFile(temporary,JSON.stringify(report,null,2)+'\n');await fs.rename(temporary,target);
console.log(`${report.status.toUpperCase()}: ${report.coverage.games} headers, ${report.coverage.chapters} chapter titles/captions, ${report.coverage.legendLabels} legends, ${report.coverage.frames} sampled outer frames. ${target}`);
if(report.remainingOverflows.length){console.log(JSON.stringify(report.remainingOverflows,null,2));process.exitCode=1;}
