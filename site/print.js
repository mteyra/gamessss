import {FAMILIES,loadGames,readSaved,escapeHTML as esc,fmtRange,statusText} from './core.js';
import {gameArt} from './visuals.js';
const params=new URLSearchParams(location.search);
const page=(g,i,n)=>`<article class="print-page"><div class="print-page-top"><b>GROUP GAMES / TAKE IT OUTSIDE</b><span>${esc(FAMILIES[g.family].name.toUpperCase())} · ${String(i+1).padStart(2,'0')} / ${n}</span></div><header class="print-page-header"><div><h1>${esc(g.name)}</h1><p class="print-tagline">${esc(g.tagline)}</p><div class="mini-stats"><span>${fmtRange(g.players)} PEOPLE</span><span>${fmtRange(g.minutes)} MIN</span><span>AGE ${esc(g.ages)}</span></div></div>${gameArt(g)}</header><div class="print-equipment"><b>BRING:</b> ${esc(g.equipment.join(' · ')||'Just people. No equipment needed.')}</div><div class="print-columns"><section><h2>Set the scene</h2><p>${esc(g.setup)}</p><h2>How to play</h2><ol>${g.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="print-finish"><b>How it ends</b><br>${esc(g.win)}</p></section><aside><h2>The good part</h2><p>${esc(g.hook)}</p><h2>The twist</h2><p>${esc(g.twist)}</p><h2>Mix it up</h2><p>${esc(g.variation)}</p><h2>Make it work for your group</h2><p>${esc(g.care)}</p><p class="print-small">Group size, age and time are hosting suggestions. Agree boundaries and a stop signal. Sketches illustrate the main mechanic and are not regulation courts.</p></aside></div><div class="print-sources"><p class="print-small"><b>${esc(statusText(g))}:</b> ${esc(g.ruleNote)}</p>${g.sources.map(s=>`<a href="${esc(s.url)}">${esc(s.title)} — ${esc(s.url)}</a>`).join('')}</div><footer class="print-bottom"><span>${esc(g.region)}</span><span>72 GAMES. ENDLESS GOOD AFTERNOONS.<br>GROUP GAMES · VOL. 01 · NOVEMBER 2026</span></footer></article>`;
try{
 const games=await loadGames();let selected=games;
 if(params.has('games')||params.get('set')==='lineup'){
  const ids=params.has('games')?params.get('games').split(','):readSaved();
  selected=[...new Set(ids)].map(id=>games.find(g=>g.id===id)).filter(Boolean);
 }
 document.getElementById('print-count').textContent=`${selected.length} ${selected.length===1?'game':'games'} · ready to take outside`;
 document.getElementById('print-pages').innerHTML=selected.length?selected.map((g,i)=>page(g,i,selected.length)).join(''):'<p class="print-loading">No games in this guide yet. <a href="atlas.html">Choose some from the atlas ↗</a></p>';
 document.getElementById('print-button').disabled=!selected.length;
 document.getElementById('print-button').addEventListener('click',()=>window.print());
 document.getElementById('show-illustrations').addEventListener('change',e=>document.body.classList.toggle('hide-sketches',!e.target.checked));
}catch(error){document.getElementById('print-pages').innerHTML='<p class="print-loading">The rules couldn’t load. <a href="research-report.md">Read the text guide instead.</a></p>';console.error(error);}
