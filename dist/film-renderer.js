import {frameAt,nodeMarkup} from './motion-engine.js';
import {escapeHTML as esc} from './core.js';
import {FILM_THEME as THEME,filmColor} from './film-theme.js';

// The director supplies time. No mutable playhead, animation loop or timers:
// each frame is identical whether played forwards, backwards or scrubbed.
const FULL={x:-32,y:-16,width:704,height:432};
const SAFE={left:-4,top:-4,right:644,bottom:404};
const movable=new Set(['player','ball','disc','shuttle','pin','bottle','flag','block']);
const projectile=new Set(['ball','disc','shuttle']);
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const lerp=(a,b,t)=>a+(b-a)*t;
const number=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
const rounded=n=>Number(n.toFixed(4));
const markerId=id=>'film-'+String(id||'scene').replace(/[^a-zA-Z0-9_-]/g,'-');
const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const smooth=t=>t*t*(3-2*t);
let rendererId=0;

// Velocity stays at least 84% of the mean. Arriving at every caption no longer
// creates a full stop. Delayed route windows still preserve rule-critical waits.
export const filmEase=t=>{const p=clamp(t);return p-.16*Math.sin(2*Math.PI*p)/(2*Math.PI);};
const undoEngineEase=t=>t<.5?Math.sqrt(t/2):1-Math.sqrt((1-t)/2);
const routeCache=new WeakMap();
const themeCache=new WeakMap();
function unit(a,b){const d=length(a,b);return d?[(b[0]-a[0])/d,(b[1]-a[1])/d]:[0,0];}
function bezier(a,b,c,d,t){const u=1-t;return [0,1].map(i=>u*u*u*a[i]+3*u*u*t*b[i]+3*u*t*t*c[i]+t*t*t*d[i]);}

/** Cubic route sampled by arc length, passing through every authored waypoint.
 * Handles stay inside each segment's bounds: legal horizontal/vertical lanes
 * remain exact, while diagonal approaches round gently without shortcutting. */
export function routeGeometry(points){
 if(!Array.isArray(points)||!points.length)return {points:[[0,0]],samples:[[0,0]],distances:[0],waypoints:[0],length:0};
 if(routeCache.has(points))return routeCache.get(points);
 const clean=points.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))
  .filter((p,i,all)=>!i||length(all[i-1],p)>1e-8).map(p=>[...p]);
 if(!clean.length)clean.push([0,0]);
 const samples=[clean[0]],distances=[0],waypoints=[0];let total=0;
 for(let i=0;i<clean.length-1;i++){
  const a=clean[i],d=clean[i+1],distance=length(a,d),direction=unit(a,d);
  const incoming=i?unit(clean[i-1],a):direction,outgoing=i+2<clean.length?unit(d,clean[i+2]):direction;
  const tangentA=unit([0,0],[incoming[0]+direction[0],incoming[1]+direction[1]]);
  const tangentB=unit([0,0],[direction[0]+outgoing[0],direction[1]+outgoing[1]]);
  const handle=Math.min(8,distance*.16);
  const bounded=(origin,tangent,sign)=>origin.map((v,k)=>clamp(v+sign*tangent[k]*handle,Math.min(a[k],d[k]),Math.max(a[k],d[k])));
  const b=bounded(a,tangentA,1),c=bounded(d,tangentB,-1);
  const count=Math.max(12,Math.min(36,Math.ceil(distance/7)));
  for(let j=1;j<=count;j++){
   const point=j===count?d:bezier(a,b,c,d,j/count);
   total+=length(samples.at(-1),point);samples.push(point);distances.push(total);
  }
  waypoints.push(total);
 }
 const geometry={points:clean,samples,distances,waypoints,length:total};
 routeCache.set(points,geometry);return geometry;
}
export function filmPointOnRoute(points,progress){
 const g=routeGeometry(points),distance=clamp(progress)*g.length;
 if(distance<=0)return [...g.points[0]];
 if(distance>=g.length)return [...g.points.at(-1)];
 let lo=1,hi=g.distances.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(g.distances[mid]<distance)lo=mid+1;else hi=mid;}
 const start=g.distances[lo-1],span=g.distances[lo]-start;
 return mix(g.samples[lo-1],g.samples[lo],span?(distance-start)/span:1);
}
function localProgress(track,progress){
 const begin=track?.start??0,end=track?.end??1;
 return clamp((progress-begin)/Math.max(.001,end-begin));
}
function themeNode(node){
 const n={...node};
 for(const key of ['fill','stroke','color'])if(n[key])n[key]=filmColor(n[key]);
 const structural=['zone','line','path','ring','net','hoop'].includes(n.kind);
 const originalFill=String(node.fill||'').toLowerCase();
 if(n.kind==='text'){n.color=n.color||THEME.ink;return n;}
 n.stroke=n.stroke||(structural?THEME.court:THEME.line);
 if(structural&&[THEME.slate,THEME.inactive].includes(n.stroke))n.stroke=THEME.muted;
 if(n.kind==='zone'){
  // Low-opacity ground shadows need a light footprint on the inverted court.
  n.fill=originalFill==='#222522'?THEME.line:n.fill||THEME.surface;
  n.color=n.color||THEME.label;n.width=n.width??1.1;
 }else if(n.kind==='line'||n.kind==='path'){
  n.width=n.width??1.25;
 }else if(n.kind==='ring'||n.kind==='hoop'){
  n.color=n.color||THEME.label;
  if(n.kind==='hoop'){
   n.stroke=node.stroke?filmColor(node.stroke):n.fill||THEME.accent;
   if([THEME.slate,THEME.inactive].includes(n.stroke))n.stroke=THEME.muted;
  }
 }else if(n.kind==='player'){
  n.fill=n.fill||THEME.surfaceAlt;
  const light=originalFill==='#bbda63'||originalFill==='#a99bd8';
  n.stroke=node.stroke?filmColor(node.stroke):light?THEME.ink:THEME.line;
  n.color=node.color?filmColor(node.color):light?THEME.background:THEME.ink;
  n.width=n.width??1.45;
 }else{
  n.fill=n.fill||(projectile.has(n.kind)?THEME.accent:THEME.surfaceAlt);
  if(originalFill==='#222522')n.fill=THEME.slate;
  n.color=n.color||(['#bbda63','#a99bd8','#e6cb62'].includes(originalFill)?THEME.background:THEME.ink);
  if(projectile.has(n.kind))n.stroke=[THEME.slate,THEME.inactive,THEME.surface,THEME.surfaceAlt].includes(n.fill)?THEME.line:THEME.background;
  n.width=n.width??1.45;
 }
 return n;
}
function themed(nodes){
 if(!themeCache.has(nodes))themeCache.set(nodes,nodes.map(themeNode));
 return themeCache.get(nodes);
}
/** Numeric film poses for deterministic exports and mechanic checks. The same
 * interpolation drives attached line endpoints and player centres. */
export function filmFrameAt(previous,current,progress,{motion=true}={}){
 const end=current?.nodes||[],start=previous?.nodes||end,p=motion?clamp(progress):1;
 const nodes=frameAt(themed(start),themed(end),undoEngineEase(filmEase(p)),[]);
 const before=new Map(start.map(node=>[node.id,node])),after=new Map(end.map(node=>[node.id,node]));
 // Captions inside the drawing use a short, non-overlapping handoff even
 // though the actors continue travelling throughout the whole chapter.
 for(const node of nodes)if(node.kind==='text'){
  if(!after.has(node.id))node.opacity=(before.get(node.id)?.opacity??1)*(1-smooth(clamp(p/.06)));
  else if(!before.has(node.id))node.opacity=(after.get(node.id).opacity??1)*smooth(clamp((p-.06)/.1));
 }
 if(motion)for(const node of nodes){
  const track=current?.tracks?.find(t=>t.id===node.id);
  if(track)[node.x,node.y]=filmPointOnRoute(track.points,filmEase(localProgress(track,p)));
 }
 return nodes;
}
function actorMotion(previous,current){
 const from=new Map((previous?.nodes||[]).map(n=>[n.id,n]));
 return (current?.nodes||[]).filter(n=>movable.has(n.kind)&&from.has(n.id)).map(node=>{
  const start=from.get(node.id),track=current.tracks?.find(t=>t.id===node.id);
  const points=track?.points||[[start.x,start.y],[node.x,node.y]],distance=routeGeometry(points).length;
  return {node,start,track,points,distance};
 }).filter(a=>a.distance>1).sort((a,b)=>(Number(projectile.has(b.node.kind))-Number(projectile.has(a.node.kind)))||b.distance-a.distance);
}
const positionAt=(actor,progress)=>filmPointOnRoute(actor.points,filmEase(localProgress(actor.track,progress)));

/** Absolute time keeps zoom continuous at chapter boundaries. Focus comes from
 * visible object positions, so previous→current(1) joins current→next(0). */
export function deriveCamera(previous,current,progress,{cameraProgress=progress,camera=true,motion=true,time}={}){
 if(!motion||camera===false)return {...FULL,zoom:1,cx:320,cy:200};
 const p=clamp(progress),continuous=Number.isFinite(time);
 // A small, sustained push continues through static rule diagrams and the
 // final second. It does not reset or oscillate when a new caption appears.
 const envelope=continuous?.68*smooth(clamp(time/4))+.32*clamp(time/100):Math.sin(Math.PI*clamp(cameraProgress))**2;
 const requested=typeof camera==='object'?number(camera.zoom,1.038):1.038;
 const maxZoom=Math.min(1.12,FULL.width/(SAFE.right-SAFE.left),FULL.height/(SAFE.bottom-SAFE.top));
 const zoom=1+(clamp(requested,1,maxZoom)-1)*envelope,width=FULL.width/zoom,height=FULL.height/zoom;
 let weight=7,fx=320*weight,fy=200*weight;
 for(const node of filmFrameAt(previous,current,p)){
  const w=(node.kind==='player'?.45:projectile.has(node.kind)?2.5:0)*clamp(node.opacity??1);
  if(w&&Number.isFinite(node.x)&&Number.isFinite(node.y)){fx+=node.x*w;fy+=node.y*w;weight+=w;}
 }
 const focus=typeof camera==='object'&&Array.isArray(camera.focus)?camera.focus:[fx/weight,fy/weight];
 const desiredX=320+(number(focus[0],320)-320)*.22*envelope;
 const desiredY=200+(number(focus[1],200)-200)*.17*envelope;
 const cx=clamp(desiredX,SAFE.right-width/2,SAFE.left+width/2);
 const cy=clamp(desiredY,SAFE.bottom-height/2,SAFE.top+height/2);
 return {x:cx-width/2,y:cy-height/2,width,height,zoom,cx,cy};
}

function effectsMarkup(previous,current,progress,nodes,{motion=true,emphasis=true,chapterProgress=progress}={}){
 if(!previous||!motion||!emphasis)return '';
 const p=clamp(progress),effects=[],at=new Map(nodes.map(n=>[n.id,n]));
 for(const actor of actorMotion(previous,current).slice(0,3)){
  const begin=actor.track?.start??0,end=actor.track?.end??1;
  if(p<=begin||p>=end||actor.distance<18)continue;
  const start=Math.max(begin,p-.13),finish=Math.max(start,p-.018);
  const points=Array.from({length:9},(_,i)=>positionAt(actor,lerp(start,finish,i/8)));
  if(points.slice(1).reduce((sum,point,i)=>sum+length(points[i],point),0)<.4)continue;
  const path=points.map(([x,y],i)=>`${i?'L':'M'}${rounded(x)} ${rounded(y)}`).join(' ');
  effects.push(`<path class="film-route-tail" d="${path}" fill="none" stroke="${projectile.has(actor.node.kind)?THEME.accent:THEME.line}" stroke-width="${projectile.has(actor.node.kind)?2.1:1.5}" stroke-linecap="round" opacity=".38"/>`);
 }
 const old=new Map(previous.nodes.map(n=>[n.id,n]));
 // Trace an actual changed connection during a static grip explanation.
 for(const target of current.nodes.filter(n=>n.kind==='line'&&old.has(n.id)).filter(n=>{
  const before=old.get(n.id);return before.stroke!==n.stroke||before.width!==n.width;
 }).slice(0,3)){
  const n=at.get(target.id),d=Math.hypot(n.x2-n.x,n.y2-n.y),q=clamp(chapterProgress);
  if(d<1||(n.opacity??1)<.05||q<=0||q>=1)continue;
  const center=filmEase(q),a=clamp(center-.12),b=clamp(center+.12);
  effects.push(`<path class="film-connection-trace" d="M${rounded(lerp(n.x,n.x2,a))} ${rounded(lerp(n.y,n.y2,a))}L${rounded(lerp(n.x,n.x2,b))} ${rounded(lerp(n.y,n.y2,b))}" stroke="${THEME.accent}" stroke-width="${number(n.width,2)+1.5}" stroke-linecap="round" opacity="${rounded(.7*Math.sin(Math.PI*q))}"/>`);
 }
 // Trace a role, scoring object or pose change once, never pulse idle actors.
 for(const target of current.nodes.filter(n=>{
  const before=old.get(n.id);return before&&movable.has(n.kind)&&(before.fill!==n.fill||before.label!==n.label||before.pose!==n.pose);
 }).slice(0,3)){
  const n=at.get(target.id),q=clamp(chapterProgress),radius=(n.r||15)+5,circumference=2*Math.PI*radius;
  if(q<=0||q>=1||(n.opacity??1)<.05)continue;
  effects.push(`<circle class="film-change-ring" cx="${rounded(n.x)}" cy="${rounded(n.y)}" r="${rounded(radius)}" fill="none" stroke="${THEME.accent}" stroke-width="1.2" stroke-dasharray="${rounded(circumference*.26)} ${rounded(circumference*.74)}" stroke-dashoffset="${rounded(-circumference*q)}" opacity="${rounded(.42*Math.sin(Math.PI*q))}"/>`);
 }
 if(!effects.length&&p>0&&p<1){
  // A rule with a static diagram can still be read visually. Trace its changed
  // in-court label, or the actual playing boundary, once during that chapter.
  const label=current.nodes.find(n=>n.kind==='text'&&old.get(n.id)?.label!==n.label&&(n.opacity??1)>.1);
  const q=filmEase(clamp(chapterProgress)),alpha=.55*Math.sin(Math.PI*q);
  if(label){
   const width=Math.max(...String(label.label||'').split('\n').map(line=>line.length))*(label.size||14)*.51;
   const start=label.anchor==='start'?label.x:label.anchor==='end'?label.x-width:label.x-width/2;
   effects.push(`<path class="film-rule-trace" d="M${rounded(start)} ${rounded(label.y+(label.size||14)*.85)}H${rounded(start+width*q)}" fill="none" stroke="${THEME.accent}" stroke-width="1.2" opacity="${rounded(alpha)}"/>`);
  }else{
   const boundary=current.nodes.filter(n=>n.kind==='zone'&&(n.opacity??1)>.1).sort((a,b)=>b.w*b.h-a.w*a.h)[0];
   if(boundary){
    const n=at.get(boundary.id),d=2*(n.w+n.h);
    effects.push(`<rect class="film-boundary-trace" x="${rounded(n.x)}" y="${rounded(n.y)}" width="${rounded(n.w)}" height="${rounded(n.h)}" rx="${n.rx??10}" fill="none" stroke="${THEME.line}" stroke-width="1.1" stroke-dasharray="${rounded(d*.16)} ${rounded(d*.84)}" stroke-dashoffset="${rounded(-d*q)}" opacity="${rounded(alpha*.6)}"/>`);
   }
  }
 }
 return effects.join('');
}
function perimeter(node){
 if(node.kind==='line')return Math.hypot(node.x2-node.x,node.y2-node.y);
 if(node.kind==='zone')return 2*(number(node.w,26)+number(node.h,32));
 if(node.kind==='ring'||node.kind==='target'||node.kind==='net'&&node.r)return 2*Math.PI*(node.r||30);
 return 0;
}
function setupEffects(nodes,{setupProgress=1,motion=true}={}){
 const setup=clamp(setupProgress);
 if(!motion||setup<=0||setup>=1)return '';
 const zones=nodes.filter(n=>n.kind==='zone'&&(n.opacity??1)>.2).sort((a,b)=>perimeter(b)-perimeter(a));
 const outlines=zones.length?zones.slice(0,1):nodes.filter(n=>['line','ring','net'].includes(n.kind)&&perimeter(n)>1&&(n.opacity??1)>.2).slice(0,8);
 const alpha=.86*smooth(clamp(setup/.08))*smooth(clamp((1-setup)/.08));
 return outlines.map(node=>{
  const d=perimeter(node),head=Math.min(70,d*.075),offset=head-d*smooth(setup);
  // The bright segment is the advancing head of the real court/connection
  // stroke. Actors stay in their authored starting positions.
  return nodeMarkup({...node,id:`${node.id}-drawing`,fill:'none',stroke:THEME.accent,width:1.9,label:'',opacity:alpha,dash:false,arrow:false})
   .replace(/(<(?:path|rect|circle)\b[^>]*)(\/>)/,`$1 stroke-linecap="round" stroke-dasharray="${rounded(head)} ${rounded(d-head)}" stroke-dashoffset="${rounded(offset)}"$2`);
 }).join('');
}
function renderedNode(node,id,{setupProgress=1,motion=true}={},actor,progress){
 const draw=pose=>nodeMarkup({...node,pose},id)
  .replaceAll('#222522',THEME.line).replaceAll('#f7f7ef',THEME.surfaceAlt).replaceAll('#bbda63',THEME.accent);
 let markup=draw(node.pose);
 if(motion&&actor&&node.kind==='player'&&actor.start.pose!==actor.node.pose&&
  (actor.start.pose==='lying'||actor.node.pose==='lying')){
  const local=localProgress(actor.track,progress);
  // Get upright at departure; lie down on arrival. Both silhouettes share
  // the current route position and label, so the mechanic never teleports.
  const blend=actor.node.pose==='lying'?smooth(clamp((local-.88)/.12)):smooth(clamp(local/.12));
  markup=blend<=0?draw(actor.start.pose):blend>=1?draw(actor.node.pose):
   `<g class="film-pose-blend"><g opacity="${rounded(1-blend)}">${draw(actor.start.pose)}</g><g opacity="${rounded(blend)}">${draw(actor.node.pose)}</g></g>`;
 }
 const setup=motion?clamp(setupProgress):1;
 if(setup<1){
  const amount=smooth(setup),outline=perimeter(node);
  if(outline>.1&&!node.dash){
   markup=markup.replace(/(<(?:path|rect|circle)\b[^>]*)(\/>)/,
    `$1 stroke-dasharray="${rounded(outline)} ${rounded(outline)}" stroke-dashoffset="${rounded(outline*(1-amount))}"$2`);
  }
  const structural=['zone','line','ring','path','net','hoop'].includes(node.kind);
  const alpha=structural?.6+.4*smooth(clamp(setup*3)):.6+.4*smooth(clamp(setup*4));
  markup=`<g class="film-setup-draw" opacity="${rounded(alpha)}">${markup}</g>`;
 }
 if(motion&&actor&&projectile.has(node.kind)&&actor.distance>18){
  const local=localProgress(actor.track,progress);
  // Whole turns return the object to its exact authored endpoint orientation.
  if(local>0&&local<1){
   const turns=Math.max(1,Math.round(actor.distance/90)),angle=360*turns*filmEase(local);
   markup=`<g class="film-projectile-spin" transform="rotate(${rounded(angle)} ${rounded(node.x)} ${rounded(node.y)})">${markup}</g>`;
  }
 }
 if(motion&&actor&&node.kind==='player'&&!node.pose&&actor.distance>18){
  const local=localProgress(actor.track,progress);
  if(local>0&&local<1){
   const before=positionAt(actor,Math.max(0,progress-.005)),after=positionAt(actor,Math.min(1,progress+.005));
   const angle=Math.atan2(after[1]-before[1],after[0]-before[0])*180/Math.PI;
   const stride=.016*Math.sin(actor.distance*filmEase(local)/11)*Math.sin(Math.PI*local);
   // A restrained stride deformation keeps the centre (and held hands) fixed.
   markup=`<g class="film-player-stride" transform="translate(${rounded(node.x)} ${rounded(node.y)}) rotate(${rounded(angle)}) scale(${rounded(1+stride)} ${rounded(1-stride*.55)}) rotate(${rounded(-angle)}) translate(${rounded(-node.x)} ${rounded(-node.y)})">${markup}</g>`;
  }
 }
 return markup;
}
function frameParts(previous,current,progress,options={}){
 const p=clamp(progress),step=current||{nodes:[]},id=markerId(options.id),camera=deriveCamera(previous,step,p,options);
 const nodes=filmFrameAt(previous,step,p,options),actors=new Map(actorMotion(previous,step).map(actor=>[actor.node.id,actor]));
 return {id,progress:p,camera,
  nodes:nodes.map(node=>renderedNode(node,id,options,actors.get(node.id),p)).join(''),
  effects:setupEffects(nodes,options)+effectsMarkup(previous,step,p,nodes,options)};
}
function defsMarkup(id){return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L8 5 1 9" fill="none" stroke="${THEME.line}" stroke-width="1.4"/></marker></defs>`;}
const viewBox=c=>[c.x,c.y,c.width,c.height].map(rounded).join(' ');
const backgroundMarkup=background=>`<rect class="film-paper" x="-200" y="-200" width="1040" height="800" fill="${esc(background??THEME.background)}"/>`;

/** Full SVG for raster export or a nested court. Options: x/y/width/height/id,
 * title/background, time (absolute seconds), setupProgress/chapterProgress/
 * cameraProgress (0..1), camera false/{zoom,focus}, motion and emphasis. */
export function sceneMarkup(previous,current,progress,options={}){
 const parts=frameParts(previous,current,progress,options),title=options.title||current?.title||'Game example';
 return `<svg xmlns="http://www.w3.org/2000/svg" class="film-canvas" x="${number(options.x)}" y="${number(options.y)}" width="${number(options.width,1280)}" height="${number(options.height,720)}" viewBox="${viewBox(parts.camera)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}">${defsMarkup(parts.id)}${backgroundMarkup(options.background)}<g class="film-scene-nodes">${parts.nodes}</g><g class="film-scene-effects" pointer-events="none" aria-hidden="true">${parts.effects}</g></svg>`;
}

/** Stable outer SVG/definitions/accessible label; only vector layers change. */
export class FilmRenderer{
 constructor(container,options={}){
  this.container=container;this.options={...options,id:options.id||`player-${rendererId++}`};
  container.innerHTML=sceneMarkup(null,{nodes:[],title:'Game example'},1,this.options);
  this.svg=container.querySelector('svg');this.layer=this.svg.querySelector('.film-scene-nodes');this.effects=this.svg.querySelector('.film-scene-effects');this.paper=this.svg.querySelector('.film-paper');this.lastMarkup=null;this.lastEffects=null;
 }
 showFrame(previous,current,progress,options={}){
  const combined={...this.options,...options,id:this.options.id},parts=frameParts(previous,current,progress,combined);
  this.svg.setAttribute('viewBox',viewBox(parts.camera));
  const title=combined.title||current?.title||'Game example';if(this.svg.getAttribute('aria-label')!==title)this.svg.setAttribute('aria-label',title);
  if(parts.nodes!==this.lastMarkup){this.layer.innerHTML=parts.nodes;this.lastMarkup=parts.nodes;}
  if(parts.effects!==this.lastEffects){this.effects.innerHTML=parts.effects;this.lastEffects=parts.effects;}
  this.paper.setAttribute('fill',combined.background??THEME.background);
  return {progress:parts.progress,camera:parts.camera};
 }
 render(previous,current,progress,options={}){return this.showFrame(previous,current,progress,options);}
 destroy(){this.svg.remove();this.lastMarkup=null;this.lastEffects=null;}
}
