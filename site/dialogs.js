import {FAMILIES,escapeHTML as esc,fmtRange,statusText,sourceLinks,readSaved,writeSaved,gameMarkdown,downloadText,toast} from './core.js';
import {gameArt} from './visuals.js';
import {mountDemo} from './demo-player.js';
let games=[],saved=readSaved(),activeDialog,opener,lineupRefresh=null,onChange=()=>{};
export function initDialogs(data,changed=()=>{}){games=data;saved=saved.filter(id=>games.some(g=>g.id===id));onChange=changed;syncSaved();window.addEventListener('storage',e=>{if(e.key==='gamessss-lineup-v1'||e.key===null){saved=readSaved().filter(id=>games.some(g=>g.id===id));syncSaved();lineupRefresh?.();}});}
export const savedGames=()=>saved.map(id=>games.find(g=>g.id===id)).filter(Boolean);
export const isSaved=id=>saved.includes(id);
function syncSaved(){
 document.querySelectorAll('[data-lineup-count]').forEach(el=>el.textContent=saved.length);
 document.querySelectorAll('[data-save]').forEach(el=>{let yes=saved.includes(el.dataset.save);el.classList.toggle('saved',yes);el.setAttribute('aria-pressed',yes);el.innerHTML=el.classList.contains('card-save')?(yes?'✓':'+'):(yes?'✓ In your lineup':'+ Add to lineup');let g=games.find(g=>g.id===el.dataset.save);if(g)el.setAttribute('aria-label',`${yes?'Remove':'Add'} ${g.name} ${yes?'from':'to'} your lineup`);});
 onChange(saved);
}
export function toggleSave(id){
 if(!games.some(g=>g.id===id))return;
 const had=saved.includes(id);saved=had?saved.filter(v=>v!==id):[...saved,id];
 const persisted=writeSaved(saved);syncSaved();toast(persisted?(had?'Removed from your lineup.':'Added to your lineup. A good afternoon is taking shape.'):'Lineup updated for this visit; browser storage is unavailable.');
}
function createDialog(classes=''){
 const root=document.getElementById('dialog-root');if(!root)return;lineupRefresh=null;
 const replacing=activeDialog?.open;
 if(!replacing)opener=document.activeElement;
 if(replacing){const previous=activeDialog;activeDialog=null;previous.close();previous.remove();}
 const returnFocus=opener;
 const d=document.createElement('dialog');d.className=classes;d.setAttribute('aria-labelledby','dialog-title');root.append(d);activeDialog=d;
 d.addEventListener('close',()=>{if(activeDialog===d){document.body.style.overflow='';activeDialog=null;lineupRefresh=null;if(returnFocus?.isConnected)returnFocus.focus?.({preventScroll:true});}d.remove();});
 d.addEventListener('click',e=>{if(e.target===d){let r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 d.addEventListener('click',e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.hasAttribute('data-close'))d.close();
  if(b.dataset.save)toggleSave(b.dataset.save);
  if(b.dataset.related)openGame(b.dataset.related);
 });
 document.body.style.overflow='hidden';return d;
}
export function openGame(id){
 const g=games.find(g=>g.id===id);if(!g){toast('This game could not be found. Try the atlas.');return;}
 const f=FAMILIES[g.family],d=createDialog('game-dialog');if(!d)return;
 d.style.setProperty('--family',f.color);
 d.innerHTML=`<header class="dialog-header"><span class="mono">${f.symbol} ${esc(f.name.toUpperCase())} / ${esc(g.region.toUpperCase())}</span><button class="dialog-close" data-close aria-label="Close game rules">×</button></header>
 <div class="game-dialog-hero"><div class="game-dialog-heading"><p class="eyebrow">${esc(statusText(g).toUpperCase())}</p><h2 id="dialog-title">${esc(g.name)}</h2><p>${esc(g.tagline)}</p><div class="mini-stats"><span>${fmtRange(g.players)} PEOPLE</span><span>${fmtRange(g.minutes)} MIN</span><span>AGE ${esc(g.ages)}</span></div></div><div class="game-dialog-art">${gameArt(g)}<span>ILLUSTRATIVE FIELD SKETCH · NOT TO SCALE</span></div></div>
 <div class="dialog-actionbar"><button class="button button-dark" data-save="${g.id}" aria-pressed="${isSaved(g.id)}">+ Add to lineup</button><a class="text-button" href="presentation.html?game=${g.id}">Watch the moves ↗</a><button class="text-button" id="copy-game-link">Copy link ↗</button><a class="text-button" href="print.html?games=${g.id}" target="_blank" rel="noopener">Print rules ↗</a></div>
 <div class="rule-body"><div class="rule-main"><p>${esc(g.hook)}</p><h3>Set the scene</h3><p>${esc(g.setup)}</p><h3>How to play</h3><ol class="rule-list">${g.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="win-rule"><b>How it ends</b><br>${esc(g.win)}</p></div>
 <aside class="rule-sidebar"><h3>The one thing that changes everything</h3><p>${esc(g.twist)}</p><h3>Bring this</h3><p>${g.equipment.length?g.equipment.map(esc).join(' · '):'Just people. No equipment needed.'}</p><h3>Mix it up</h3><p>${esc(g.variation)}</p><h3>Make it work for your group</h3><p>${esc(g.care)}</p><p class="rule-note">Group size, age and time are hosting suggestions. Agree on boundaries and a stop signal before playing.</p><div class="rule-source"><h3>Where these rules come from</h3><p class="rule-note"><b>${esc(statusText(g))}.</b> ${esc(g.ruleNote)}</p>${sourceLinks(g)}</div></aside></div>
 <div class="dialog-related"><span>KEEP EXPLORING</span>${games.filter(o=>o.family===g.family&&o.id!==g.id).slice(0,3).map(o=>`<button data-related="${o.id}">${esc(o.name)} ↗</button>`).join('')}</div>`;
 const art=d.querySelector('.game-dialog-art'),demoContainer=document.createElement('div');
 if(mountDemo(demoContainer,id)){art.replaceChildren(demoContainer);art.classList.add('has-demo');const note=document.createElement('span');note.textContent='3 MOVES TO GET THE IDEA · SEE FULL RULES BELOW';art.append(note);}
 d.querySelector('#copy-game-link').addEventListener('click',async()=>{let url=new URL('./',location.href);url.searchParams.set('game',id);try{await navigator.clipboard.writeText(url.href);toast('Game link copied.');}catch{let row=d.querySelector('.copy-fallback');if(!row){row=document.createElement('label');row.className='copy-fallback';row.innerHTML=`Copy this link: <input aria-label="Game link" readonly value="${esc(url.href)}">`;d.querySelector('.dialog-actionbar').append(row);}row.querySelector('input').select();}});
 d.showModal();syncSaved();d.querySelector('[data-close]').focus({preventScroll:true});
}
export function openLineup(){
 const d=createDialog('lineup-dialog');if(!d)return;
 function render(){
  const gs=savedGames(),mins=gs.reduce((a,g)=>a+g.minutes[0],0),max=gs.reduce((a,g)=>a+g.minutes[1],0),gear=[...new Set(gs.flatMap(g=>g.equipment))];
  d.innerHTML=`<header class="dialog-header"><span class="mono">YOUR NEXT VERY GOOD AFTERNOON</span><button class="dialog-close" data-close aria-label="Close your lineup">×</button></header><div class="lineup-content"><p class="eyebrow">JUST ADD PEOPLE</p><h2 id="dialog-title">Your lineup<span style="color:#849840">.</span></h2><p>Start with an easy win. Add some excellent chaos. Finish with everybody together. Use the arrows to set your running order.</p>
  ${gs.length?`<ol class="lineup-items">${gs.map((g,i)=>`<li class="lineup-item" style="--family:${FAMILIES[g.family].color}"><span class="lineup-item-num">${String(i+1).padStart(2,'0')}</span><i class="lineup-dot"></i><button class="lineup-item-name" data-related="${g.id}">${esc(g.name)}<small>${fmtRange(g.players)} PEOPLE · ${fmtRange(g.minutes)} MIN</small></button><div class="lineup-item-controls"><button data-move="${g.id}" data-dir="-1" aria-label="Move ${esc(g.name)} earlier" ${i===0?'disabled':''}>↑</button><button data-move="${g.id}" data-dir="1" aria-label="Move ${esc(g.name)} later" ${i===gs.length-1?'disabled':''}>↓</button><button data-remove="${g.id}" aria-label="Remove ${esc(g.name)} from lineup">×</button></div></li>`).join('')}</ol><div class="lineup-totals">${gs.length} GAMES · APPROX. ${mins}–${max} MIN OF PLAY, PLUS SETUP & BREAKS<br>PACK: ${esc(gear.join(' · ')||'No equipment needed')}</div><div class="lineup-buttons"><a class="button button-dark" href="presentation.html?games=${gs.map(g=>g.id).join(',')}">Watch your lineup ↗</a><a class="button" href="print.html?games=${gs.map(g=>g.id).join(',')}" target="_blank" rel="noopener">Print field guide ↗</a><button class="text-button" id="download-lineup">Download as text ↓</button></div><p class="rule-note" style="margin-top:20px">Saved in this browser. Printed guides and film links preserve this order.</p>`:`<div class="lineup-empty"><div class="empty-symbol">✳</div><p>There’s room for a whole afternoon here.<br>Tap + on any game to save it.</p><button class="button button-dark" data-close>Keep exploring ↗</button></div><button class="text-button" id="starter-lineup">Start with a suggested three-game lineup ↗</button>`}</div>`;
  d.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{let at=saved.indexOf(b.dataset.move),to=at+Number(b.dataset.dir);if(at<0||to<0||to>=saved.length)return;[saved[at],saved[to]]=[saved[to],saved[at]];writeSaved(saved);syncSaved();render();const arrow=d.querySelector(`[data-move="${b.dataset.move}"][data-dir="${b.dataset.dir}"]`);(arrow&&!arrow.disabled?arrow:d.querySelector(`[data-related="${b.dataset.move}"]`))?.focus();}));
  d.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{saved=saved.filter(id=>id!==b.dataset.remove);writeSaved(saved);syncSaved();render();d.querySelector('[data-close]').focus();}));
  d.querySelector('#download-lineup')?.addEventListener('click',()=>downloadText('group-games-your-lineup.md',`# Your Group Games lineup\n\n${gs.length} games · approximately ${mins}–${max} minutes plus setup and breaks.\n\n${gs.map((g,i)=>gameMarkdown(g,i+1)).join('\n---\n\n')}`));
  d.querySelector('#starter-lineup')?.addEventListener('click',()=>{saved=['islands','flunkyball','hoop-pass'].filter(id=>games.some(g=>g.id===id));writeSaved(saved);syncSaved();render();d.querySelector('.lineup-item-name')?.focus();});
 }
 lineupRefresh=()=>{const hadFocus=d.contains(document.activeElement);render();if(hadFocus)d.querySelector('[data-close]').focus({preventScroll:true});};
 render();d.showModal();d.querySelector('[data-close]').focus({preventScroll:true});
}
