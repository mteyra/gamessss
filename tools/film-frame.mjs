import {sceneMarkup} from '../dist/film-renderer.js';
import {FILM_THEME as T,legendColor} from '../dist/film-theme.js';
import {FAMILIES,escapeHTML as esc} from '../dist/core.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const out=t=>1-(1-clamp(t))**3;
const num=v=>Number(v.toFixed(4));
const text=(x,y,value,size=24,extra='')=>`<text x="${x}" y="${y}" ${/\bfill=/.test(extra)?'':`fill="${T.text}"`} font-family="Manrope" font-size="${size}" ${extra}>${esc(value)}</text>`;
const mono=(x,y,value,size=10,extra='')=>`<text x="${x}" y="${y}" fill="${T.muted}" font-family="JetBrains Mono" font-size="${size}" ${extra}>${esc(value)}</text>`;
export function wrapWords(value,max=106){const result=[];let line='';for(const word of String(value).split(/\s+/)){if(line&&(line+' '+word).length>max){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);return result;}
const lines=(x,y,value,size,max,gap=size*1.35,extra='')=>wrapWords(value,max).map((line,i)=>text(x,y+i*gap,line,size,extra)).join('');

/** One continuous dark canvas. Titles and captions share the moving scene;
 * there are no interstitial cards, frozen chapter endings or blackout cuts. */
export function renderFrame(game,film,sample){
 const family=FAMILIES[game.family],s=sample.current;
 const chapter=String(sample.index+1).padStart(2,'0'),count=String(film.segments.length).padStart(2,'0');
 const scene=sceneMarkup(sample.previous,s,sample.progress,{
  x:22,y:70,width:1236,height:482,id:game.id,background:T.background,accent:T.accent,
  time:sample.time,chapterProgress:sample.chapterProgress,cameraProgress:sample.chapterProgress,
  setupProgress:sample.setupProgress,motion:true,emphasis:true
 });
 const legend=film.lesson.legend,lengths=legend.map(item=>item.label.length*6.45+44),total=lengths.reduce((a,b)=>a+b,0);let lx=(1280-total)/2;
 const legendMarkup=legend.map((item,i)=>{const x=lx;lx+=lengths[i];return `<circle cx="${num(x+5)}" cy="560" r="4" fill="${legendColor(item.color)}" stroke="#b6c0d0" stroke-width=".7"/>${text(num(x+18),565,item.label,12.5,`fill="${T.muted}"`)}`;}).join('');
 // A slight title entrance lives over an already drawing court.
 const entrance=out(sample.time/.8),nameSize=game.name.length>33?27:31;
 const name=text(46,46,game.name,nameSize,'font-weight="600" letter-spacing="-.8"');
 const familyName=mono(1234,31,family.name.toUpperCase(),10.5,'text-anchor="end" letter-spacing="1.3"');
 const sequence=mono(1234,51,`${chapter} / ${count}`,10,'text-anchor="end"');
 const progress=clamp(sample.time/film.duration);
 const header=`<g opacity="${num(.25+.75*entrance)}" transform="translate(0 ${num((1-entrance)*9)})">${name}${familyName}${sequence}</g><path d="M46 68H1234" stroke="#28303d" stroke-width=".7"/><path d="M46 68H${num(46+1188*progress)}" stroke="#b8d3ed" stroke-width="1"/>`;
 // Keep the setup explanation visible from the first frame. Short generic
 // opening/ending captions would flash too quickly to read.
 const captionTitle=s.title,captionText=s.text;
 const captionAge=sample.index===0?sample.time:sample.phase==='outro'?film.outro+sample.chapterTime:sample.chapterTime;
 const captionIn=out(captionAge/.23),captionOffset=(1-captionIn)*7;
 const cue=`${chapter}  /  ${count}`;
 const caption=`<path d="M46 585H1234" stroke="#222936" stroke-width=".7"/><g opacity="${num(.35+.65*captionIn)}" transform="translate(0 ${num(captionOffset)})">${mono(47,608,cue,9,'letter-spacing="1.4"')}${text(46,642,captionTitle,27,'font-weight="600" letter-spacing="-.45"')}${lines(46,674,captionText,20.5,112,27,`fill="#bdc4cf"`)}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${T.background}"/>${scene}${header}${legendMarkup}${caption}</svg>`;
}
