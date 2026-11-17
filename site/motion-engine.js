import {escapeHTML as esc} from './core.js';
import {INK,PAPER,A} from './lesson-kit.js';
const clamp=n=>Math.max(0,Math.min(1,n));
const numeric=['x','y','x2','y2','w','h','r','rotate','opacity','size','width'];
const ease=t=>t<.5?2*t*t:1-((-2*t+2)**2)/2;
const numericDefault=(key,n)=>{
 if(key==='opacity')return 1;
 if(key==='width')return n.kind==='hoop'?5:1.8;
 if(key==='size')return n.kind==='text'?14:11;
 if(key==='w')return n.kind==='pin'?20:n.kind==='bottle'?22:26;
 if(key==='h')return n.kind==='pin'?48:n.kind==='bottle'?58:32;
 if(key==='r')return n.kind==='ball'?9:n.kind==='target'?30:n.kind==='hoop'?23:15;
 return 0;
};
let engineId=0;
function mixColor(a,b,t){
 const hex=value=>/^#[\da-f]{6}$/i.test(value||'')?[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)):null;
 const ca=hex(a),cb=hex(b);return ca&&cb?'#'+ca.map((v,i)=>Math.round(v+(cb[i]-v)*t).toString(16).padStart(2,'0')).join(''):t<.5?a:b;
}
export function pointOnRoute(points,t){
 if(!points?.length)return[0,0];if(points.length===1)return points[0];
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);let distance=clamp(t)*total;
 if(!total)return points.at(-1);
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const f=lengths[i]?distance/lengths[i]:1;return[points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f];}distance-=lengths[i];}
 return points.at(-1);
}
export function frameAt(from,to,progress,tracks=[]){
 const t=clamp(progress),f=new Map(from.map(n=>[n.id,n])),e=new Map(to.map(n=>[n.id,n]));
 const ids=[...new Set([...to.map(n=>n.id),...from.filter(n=>!e.has(n.id)).map(n=>n.id)])];
 return ids.map(id=>{
  const end=e.get(id),start=f.get(id),a=start||{...end,opacity:0},b=end||{...start,opacity:0},n={...(t<.5?a:b),id};
  for(const key of numeric){if(typeof a[key]==='number'||typeof b[key]==='number'){const av=a[key]??numericDefault(key,a),bv=b[key]??numericDefault(key,b);n[key]=av+(bv-av)*ease(t);}}
  if(a.fill&&b.fill)n.fill=mixColor(a.fill,b.fill,ease(t));
  const route=tracks.find(track=>track.id===id);
  if(route){const rt=clamp((t-(route.start??0))/Math.max(.001,(route.end??1)-(route.start??0)));[n.x,n.y]=pointOnRoute(route.points,ease(rt));}
  return n;
 });
}
function words(n){
 const lines=String(n.label??'').split('\n'),anchor=n.anchor||'middle',color=n.color||n.stroke||INK;
 return `<text text-anchor="${esc(anchor)}" fill="${esc(color)}" font-size="${n.size||14}" font-weight="${n.weight||650}" font-family="Manrope,system-ui,sans-serif">${lines.map((s,i)=>`<tspan x="0" dy="${i?1.3+'em':'.35em'}">${esc(s)}</tspan>`).join('')}</text>`;
}
export function nodeMarkup(n,marker='lesson-arrow'){
 const {kind,x=0,y=0}=n,fill=n.fill||PAPER,stroke=n.stroke||INK,w=n.w||26,h=n.h||32,r=n.r||15;
 const attr=`stroke="${esc(stroke)}" stroke-width="${n.width??1.8}" stroke-linejoin="round"`,line=`fill="none" ${attr}`,label=n.label?words({...n,size:n.size||11}):'';
 const dash=n.dash?`stroke-dasharray="${typeof n.dash==='string'?esc(n.dash):'5 6'}"`:'',arrow=n.arrow?`marker-end="url(#${marker})"`:'';
 let shape='';
 if(kind==='line')return `<g data-node="${esc(n.id)}" opacity="${n.opacity??1}"><path d="M${x} ${y}L${n.x2} ${n.y2}" ${line} ${dash} ${arrow}/></g>`;
 if(kind==='zone')shape=`<rect width="${w}" height="${h}" rx="${n.rx??10}" fill="${esc(fill)}" ${attr} ${dash}/>${n.label?`<g transform="translate(${w/2} ${n.labelY??15})">${words({...n,size:n.size||11})}</g>`:''}`;
 else if(kind==='player'){
  const seated=n.pose==='seated',lying=n.pose==='lying';
  shape=lying?`<rect x="-9" y="-8" width="18" height="39" rx="8" fill="${esc(fill)}" ${attr}/><circle cy="-18" r="9" fill="${esc(fill)}" ${attr}/><path d="M-3 12v15M3 12v15" ${line}/><g transform="translate(0 -18)">${label}</g>`:
   `<ellipse cy="${seated?8:4}" rx="${r+2}" ry="${r+1}" fill="${INK}" opacity=".1"/><circle r="${r}" fill="${esc(fill)}" ${attr}/>${label||`<path d="M-4 -2v3M4 -2v3" ${line}/>`}${seated?`<path d="M-12 14l-5 6h11M12 14l5 6H6" ${line}/>`:''}`;
 }else if(kind==='ball')shape=`<circle r="${n.r||9}" fill="${esc(n.fill||'#e6cb62')}" ${attr}/><path d="M-${n.r||9} 0q${n.r||9} 8 ${(n.r||9)*2} 0M0 -${n.r||9}q-6 ${n.r||9} 0 ${(n.r||9)*2}" fill="none" stroke="${esc(stroke)}" stroke-width="1"/>${label}`;
 else if(kind==='ring')shape=`<circle r="${r}" fill="${esc(n.fill||'none')}" ${attr} ${dash}/>${label}`;
 else if(kind==='hoop')shape=`<ellipse rx="${n.r||n.w/2||23}" ry="${n.h/2||n.r||23}" fill="none" stroke="${esc(n.stroke||n.fill||A)}" stroke-width="${n.width||5}"/><ellipse rx="${n.r||n.w/2||23}" ry="${n.h/2||n.r||23}" fill="none" stroke="${INK}" stroke-width="1"/>${label}`;
 else if(kind==='disc')shape=`<ellipse rx="${n.r||w/2}" ry="${n.h/2||7}" fill="${esc(fill)}" ${attr}/>${label}`;
 else if(kind==='pin'||kind==='bottle'){
  shape=kind==='bottle'?`<g transform="scale(${(n.w||22)/22} ${(n.h||58)/58})"><path d="M-5 -27h10v13l6 7v30q0 4-4 4H-7q-4 0-4-4V-7l6-7z" fill="${esc(fill)}" ${attr}/><path d="M-11 1h22v12h-22z" fill="${A}" opacity=".6"/></g>`:`<rect x="-${(n.w||20)/2}" y="-${(n.h||48)/2}" width="${n.w||20}" height="${n.h||48}" rx="5" fill="${esc(fill)}" ${attr}/>`;shape+=label;
 }else if(kind==='flag')shape=`<path d="M-10 27v-51h29l-7 13 7 12H-10" fill="${esc(fill)}" ${attr}/>${label}`;
 else if(kind==='cone')shape=`<path d="M0 -${h/2}L${w/2} ${h/2}H-${w/2}z" fill="${esc(fill)}" ${attr}/><path d="M-${w/2+3} ${h/2+2}h${w+6}" ${line}/>${label}`;
 else if(kind==='block')shape=`<rect x="-${w/2}" y="-${h/2}" width="${w}" height="${h}" rx="${n.rx??3}" fill="${esc(fill)}" ${attr}/>${label}`;
 else if(kind==='target')shape=`<circle r="${n.r||30}" fill="${esc(fill)}" ${attr}/><circle r="${(n.r||30)*.65}" ${line}/><circle r="${(n.r||30)*.28}" fill="${A}" ${attr}/>${label}`;
 else if(kind==='net')shape=n.r?`<circle r="${r}" fill="${esc(n.fill||'#e7e7dc')}" ${attr}/>${[-.66,-.33,0,.33,.66].map(f=>{const offset=f*r,edge=Math.sqrt(r*r-offset*offset);return `<path d="M${offset} ${-edge}V${edge}M${-edge} ${offset}H${edge}" ${line} opacity=".5"/>`;}).join('')}${label}`:`<rect x="-${w/2}" y="-${h/2}" width="${w}" height="${h}" fill="${esc(n.fill||'#e7e7dc')}" ${attr}/>${Array.from({length:5},(_,i)=>`<path d="M${-w/2+(i+1)*w/6} -${h/2}v${h}M-${w/2} ${-h/2+(i+1)*h/6}h${w}" ${line} opacity=".5"/>`).join('')}${label}`;
 else if(kind==='shuttle')shape=`<path d="M-4 8L-18-20-7-17 0-24 7-17 18-20 4 8" fill="${esc(fill)}" ${attr}/><circle cy="10" r="6" fill="${A}" ${attr}/>`;
 else if(kind==='star')shape=`<path d="M-15 0H15M0-15V15M-10-10L10 10M-10 10L10-10" ${line}/>${label}`;
 else if(kind==='text')shape=words(n);
 else if(kind==='path')shape=`<path d="${esc(n.d||'')}" fill="${esc(n.fill||'none')}" ${attr} ${dash} ${arrow}/>${label}`;
 else shape=`<circle r="${r}" fill="${esc(fill)}" ${attr}/>${label}`;
 return `<g data-node="${esc(n.id)}" transform="translate(${x} ${y}) rotate(${n.rotate||0})" opacity="${n.opacity??1}"${n.name?` aria-label="${esc(n.name)}"`:''}>${shape}</g>`;
}
export class MotionEngine{
 constructor(container,{onProgress=()=>{},onState=()=>{}}={}){
  this.container=container;this.onProgress=onProgress;this.onState=onState;this.id=`lesson-arrow-${engineId++}`;this.progress=1;this.playing=false;this.speed=1;this.animation=null;this.from=[];this.to=[];this.tracks=[];this.duration=1700;
  container.innerHTML=`<svg class="lesson-canvas" viewBox="0 0 640 400" role="img" aria-label="Animated example of the current game" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="${this.id}-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="${INK}" opacity=".09"/></pattern><marker id="${this.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L8 5 1 9" fill="none" stroke="${INK}" stroke-width="1.6"/></marker></defs><rect width="640" height="400" fill="url(#${this.id}-grid)"/><g class="lesson-nodes"></g></svg>`;
  this.layer=container.querySelector('.lesson-nodes');this.svg=container.querySelector('svg');
 }
 setSteps(previous,current,{animate=true,reduced=false}={}){
  this.pause();this.from=previous?.nodes||current.nodes;this.to=current.nodes;this.tracks=current.tracks||[];this.duration=current.duration||1700;this.svg.setAttribute('aria-label',`${current.title}. ${current.text}`);
  this.progress=animate&&!reduced&&previous?0:1;this.draw();if(this.progress===0)this.play();else this.onState(false);
 }
 draw(){const nodes=frameAt(this.from,this.to,this.progress,this.tracks);this.layer.innerHTML=nodes.map(n=>nodeMarkup(n,this.id)).join('');this.onProgress(this.progress);}
 seek(progress){this.pause();this.progress=clamp(progress);this.draw();}
 play(){
  this.pause();if(this.progress>=1)this.progress=0;this.playing=true;this.onState(true);let last;
  const tick=now=>{if(!this.playing)return;if(last!==undefined)this.progress=clamp(this.progress+(now-last)*this.speed/this.duration);last=now;this.draw();if(this.progress<1)this.animation=requestAnimationFrame(tick);else{this.playing=false;this.animation=null;this.onState(false);}};
  this.animation=requestAnimationFrame(tick);
 }
 pause(){if(this.animation!==null)cancelAnimationFrame(this.animation);this.animation=null;const wasPlaying=this.playing;this.playing=false;if(wasPlaying)this.onState(false);}
 destroy(){this.pause();this.container.replaceChildren();}
}
