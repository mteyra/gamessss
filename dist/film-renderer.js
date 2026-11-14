import {frameAt,pointOnRoute,nodeMarkup} from './motion-engine.js';
import {escapeHTML as esc} from './core.js';
import {A,INK} from './lesson-kit.js';

// The film director supplies time. Nothing in this module runs a timer or RAF.
// A fixed 16:9 frame leaves a little breathing room around the 640×400 drawings.
const FULL={x:-64,y:-16,width:768,height:432};
const SAFE={left:-4,top:-4,right:644,bottom:404};
const movable=new Set(['player','ball','disc','shuttle','pin','bottle','flag','block']);
const projectile=new Set(['ball','disc','shuttle']);
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const ease=t=>t<.5?2*t*t:1-((-2*t+2)**2)/2;
const lerp=(a,b,t)=>a+(b-a)*t;
const number=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
const rounded=n=>Number(n.toFixed(4));
const markerId=id=>'film-'+String(id||'scene').replace(/[^a-zA-Z0-9_-]/g,'-');
let rendererId=0;

function actorMotion(previous,current){
 const from=new Map((previous?.nodes||[]).map(n=>[n.id,n]));
 return (current?.nodes||[]).filter(n=>movable.has(n.kind)&&from.has(n.id)).map(node=>{
  const start=from.get(node.id),track=current.tracks?.find(t=>t.id===node.id);
  const points=track?.points||[[start.x,start.y],[node.x,node.y]];
  const distance=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
  return {node,start,track,points,distance};
 }).filter(a=>a.distance>24).sort((a,b)=>(Number(projectile.has(b.node.kind))-Number(projectile.has(a.node.kind)))||b.distance-a.distance);
}
function positionAt(actor,progress){
 const begin=actor.track?.start??0,end=actor.track?.end??1;
 const local=clamp((progress-begin)/Math.max(.001,end-begin));
 return pointOnRoute(actor.points,ease(local));
}
function focusAt(previous,current,progress){
 if(current?.focus?.length===2&&current.focus.every(Number.isFinite))return current.focus;
 const action=actorMotion(previous,current)[0];
 return action?positionAt(action,progress):[320,200];
}

/** A restrained push/pan that cannot crop any part of the authored court.
 * cameraProgress should advance from 0 to 1 over a chapter. Both endpoints are
 * the same wide view, so independently encoded chapters join without a jump.
 */
export function deriveCamera(previous,current,progress,{cameraProgress=progress,camera=true,motion=true}={}){
 const p=clamp(progress),cp=clamp(cameraProgress);
 if(!previous||!motion||camera===false)return {...FULL,zoom:1,cx:320,cy:200};
 const envelope=Math.sin(Math.PI*cp)**2;
 const requested=typeof camera==='object'?number(camera.zoom,1.055):1.055;
 const maxZoom=Math.min(1.12,FULL.width/(SAFE.right-SAFE.left),FULL.height/(SAFE.bottom-SAFE.top));
 const zoom=1+(clamp(requested,1,maxZoom)-1)*envelope;
 const width=FULL.width/zoom,height=FULL.height/zoom;
 const focus=typeof camera==='object'&&Array.isArray(camera.focus)?camera.focus:focusAt(previous,current,p);
 const desiredX=320+(number(focus[0],320)-320)*.17*envelope;
 const desiredY=200+(number(focus[1],200)-200)*.12*envelope;
 const cx=clamp(desiredX,SAFE.right-width/2,SAFE.left+width/2);
 const cy=clamp(desiredY,SAFE.bottom-height/2,SAFE.top+height/2);
 return {x:cx-width/2,y:cy-height/2,width,height,zoom,cx,cy};
}

function effectsMarkup(previous,current,progress,{motion=true,emphasis=true,accent=A}={}){
 if(!previous||!motion||!emphasis)return '';
 const p=clamp(progress),from=new Map(previous.nodes.map(n=>[n.id,n]));
 const moving=actorMotion(previous,current).slice(0,3),effects=[];
 // Only the most recent part of a real route is visible. There are no looping
 // particles, invented trajectories or trails left over from a previous move.
 if(p>0&&p<1){
  for(const actor of moving){
   const begin=actor.track?.start??0,end=actor.track?.end??1;
   if(p<=begin||p>=end)continue;
   const start=Math.max(begin,p-.19),finish=Math.max(start,p-.018);
   const points=Array.from({length:7},(_,i)=>positionAt(actor,lerp(start,finish,i/6)));
   const length=points.slice(1).reduce((sum,point,i)=>sum+Math.hypot(point[0]-points[i][0],point[1]-points[i][1]),0);
   if(length<=.2)continue;
   const path=points.map(([x,y],i)=>`${i?'L':'M'}${rounded(x)} ${rounded(y)}`).join(' ');
   const color=actor.node.fill||accent;
   effects.push(`<path class="film-route-tail" d="${path}" fill="none" stroke="${esc(color)}" stroke-width="${projectile.has(actor.node.kind)?4:3}" stroke-linecap="round" stroke-dasharray="1 6" opacity="${rounded(.2+.18*Math.sin(Math.PI*p))}"/>`);
  }
 }
 // A single settling ring directs attention to an actual role/pose/target
 // change. It is outside the actor, so names and team colours remain legible.
 const changed=current.nodes.filter(n=>{
  const old=from.get(n.id);return old&&movable.has(n.kind)&&(
   old.fill!==n.fill||old.label!==n.label||old.pose!==n.pose||number(old.rotate)!==number(n.rotate)
  );
 }).slice(0,4);
 if(p>=.68){
  const q=clamp((p-.68)/.32),wave=Math.sin(Math.PI*q),alpha=.11+.25*wave;
  const at=new Map(frameAt(previous.nodes,current.nodes,p,current.tracks).map(n=>[n.id,n]));
  for(const target of changed){const node=at.get(target.id),radius=(node.r||15)+8+7*q;
   effects.push(`<circle class="film-change-ring" cx="${rounded(node.x)}" cy="${rounded(node.y)}" r="${rounded(radius)}" fill="none" stroke="${esc(node.fill||accent)}" stroke-width="2.2" opacity="${rounded(alpha)}"/>`);
  }
 }
 return effects.join('');
}

function frameParts(previous,current,progress,options={}){
 const p=clamp(progress),step=current||{nodes:[]},id=markerId(options.id),camera=deriveCamera(previous,step,p,options);
 const from=previous?.nodes||step.nodes;
 const nodes=frameAt(from,step.nodes,options.motion===false?1:p,options.motion===false?[]:step.tracks||[]);
 return {id,progress:p,camera,nodes:nodes.map(node=>nodeMarkup(node,id)).join(''),effects:effectsMarkup(previous,step,p,options)};
}
function defsMarkup(id){return `<defs><pattern id="${id}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="${INK}" opacity=".06"/></pattern><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L8 5 1 9" fill="none" stroke="${INK}" stroke-width="1.6"/></marker></defs>`;}
const viewBox=c=>[c.x,c.y,c.width,c.height].map(rounded).join(' ');
const backgroundMarkup=(id,background)=>`<rect class="film-paper" x="-200" y="-200" width="1040" height="800" fill="${esc(background??'#f4f2e9')}"/><rect x="-200" y="-200" width="1040" height="800" fill="url(#${id}-grid)"/>`;

/** Complete SVG suitable for a raster frame or a nested court in a 1280×720 film.
 * options: x, y, width, height, id, title, background, accent, cameraProgress,
 * camera (false or {zoom,focus}), motion, emphasis. No external assets needed.
 */
export function sceneMarkup(previous,current,progress,options={}){
 const parts=frameParts(previous,current,progress,options),title=options.title||current?.title||'Game example';
 return `<svg xmlns="http://www.w3.org/2000/svg" class="film-canvas" x="${number(options.x)}" y="${number(options.y)}" width="${number(options.width,1280)}" height="${number(options.height,720)}" viewBox="${viewBox(parts.camera)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}">${defsMarkup(parts.id)}${backgroundMarkup(parts.id,options.background)}<g class="film-scene-nodes">${parts.nodes}</g><g class="film-scene-effects" pointer-events="none" aria-hidden="true">${parts.effects}</g></svg>`;
}

/** The optional browser renderer uses exactly the same pure frame builder. */
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
  this.paper.setAttribute('fill',combined.background??'#f4f2e9');
  return {progress:parts.progress,camera:parts.camera};
 }
 render(previous,current,progress,options={}){return this.showFrame(previous,current,progress,options);}
 destroy(){this.svg.remove();this.lastMarkup=null;this.lastEffects=null;}
}
