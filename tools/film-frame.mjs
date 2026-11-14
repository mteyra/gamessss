import {sceneMarkup} from '../dist/film-renderer.js';
import {FAMILIES,escapeHTML as esc,fmtRange} from '../dist/core.js';
const INK='#17221c',PAPER='#f2f2e9',MUTED='#627064';
const text=(x,y,value,size=24,extra='')=>`<text x="${x}" y="${y}" fill="${INK}" font-family="Manrope" font-size="${size}" ${extra}>${esc(value)}</text>`;
export function wrapWords(value,max=76){const result=[];let line='';for(const word of String(value).split(/\s+/)){if(line&&(line+' '+word).length>max){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);return result;}
function lines(x,y,value,size,max,gap=size*1.4,extra=''){return wrapWords(value,max).map((line,i)=>text(x,y+i*gap,line,size,extra)).join('');}
const ease=t=>1-(1-t)**3;
export function renderFrame(game,film,sample){
 const family=FAMILIES[game.family],s=sample.current,opening=sample.phase==='title',closing=sample.phase==='outro';
 const number=String(film.segments.findIndex(seg=>seg.current===s)+1).padStart(2,'0');
 const scene=sceneMarkup(sample.previous,s,sample.progress,{x:80,y:85,width:1120,height:464,id:game.id,background:PAPER,accent:family.color,cameraProgress:sample.progress,motion:true,emphasis:true});
 const legend=film.lesson.legend;const lengths=legend.map(l=>l.label.length*6.7+44),sum=lengths.reduce((a,b)=>a+b,0);let lx=(1280-sum)/2;
 const legendMarkup=legend.map((item,i)=>{const x=lx;lx+=lengths[i];return `<circle cx="${x+5}" cy="557" r="5" fill="${item.color}" stroke="${INK}" stroke-width=".7"/>${text(x+18,562,item.label,14)}`;}).join('');
 let content=`<rect width="1280" height="720" fill="${PAPER}"/><rect x="54" y="43" width="5" height="29" rx="2" fill="${family.color}"/>${text(74,66,game.name,28,'font-weight="800"')}${text(1226,62,`${sample.index===0?'SETUP':'THE MOVES'}  /  ${film.segments.length}`,13,'text-anchor="end" letter-spacing="1.6"')}${scene}${legendMarkup}<path d="M58 582H1222" stroke="#cbd2c5" stroke-width="1"/><circle cx="76" cy="625" r="20" fill="${family.color}"/>${text(76,632,number,16,'text-anchor="middle" font-weight="800"')}${text(110,630,s.title,28,'font-weight="800"')}${lines(110,664,s.text,21,97,28)}<text x="1218" y="707" text-anchor="end" fill="${MUTED}" font-family="Manrope" font-size="10" letter-spacing="1.5">GAMESSSS  /  HOW TO PLAY</text>`;
 if(opening){
  const fade=sample.openingOpacity,offset=(1-ease(Math.min(1,sample.time/.8)))*24,name=game.name.toUpperCase(),size=name.length>30?62:(name.length>20||game.id==='money-ball')?76:98;
  content=`<rect width="1280" height="720" fill="${INK}"/><g opacity=".095">${scene}</g><g opacity="${fade}" transform="translate(0 ${offset})"><rect x="74" y="162" width="32" height="5" rx="2" fill="${family.color}"/><text x="121" y="170" fill="${family.color}" font-family="Manrope" font-size="16" letter-spacing="3">${esc(family.name.toUpperCase())}</text><g fill="#f4f5ec">${lines(74,290,name,size,22,size*1.09,'font-weight="800"').replaceAll(`fill="${INK}"`,'fill="#f4f5ec"')}</g>${lines(78,505,film.lesson.summary,28,74,38).replaceAll(`fill="${INK}"`,'fill="#d5ddce"')}<text x="78" y="640" fill="#aab9a3" font-family="Manrope" font-size="15" letter-spacing="1.5">${esc(fmtRange(game.players))} PEOPLE  ·  ${esc(fmtRange(game.minutes))} MINUTES  ·  A GAME IN MOTION</text></g>`;
 }else if(closing){
  content+=`<rect width="1280" height="720" fill="${INK}" opacity="${sample.closingOpacity*.96}"/><g opacity="${sample.closingOpacity}"><text x="640" y="250" text-anchor="middle" fill="${family.color}" font-family="Manrope" font-size="15" letter-spacing="4">THAT'S HOW TO PLAY</text>${lines(640,325,game.name,54,30,66,'text-anchor="middle" font-weight="800"').replaceAll(`fill="${INK}"`,'fill="#f4f5ec"')}<text x="640" y="522" text-anchor="middle" fill="#c5d0be" font-family="Manrope" font-size="23">Full rules, variations and sources in the field guide.</text><path d="M612 573H668" stroke="${family.color}" stroke-width="3"/></g>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">${content}</svg>`;
}
