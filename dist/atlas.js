import {FAMILIES,FAMILY_ORDER,escapeHTML as esc,fmtRange,loadGames,searchGames} from './core.js';
import {gameArt} from './visuals.js';
import {initDialogs,openLineup,toggleSave,isSaved} from './dialogs.js';
const $=id=>document.getElementById(id);let games=[],filtered=[],family='all';
function renderTabs(){
 $('family-tabs').innerHTML=`<button class="family-tab ${family==='all'?'active':''}" data-family="all" aria-pressed="${family==='all'}">All games <span class="tab-count">${games.length}</span></button>`+FAMILY_ORDER.map(id=>`<button class="family-tab ${family===id?'active':''}" data-family="${id}" aria-pressed="${family===id}"><span class="tab-symbol">${FAMILIES[id].symbol}</span>${FAMILIES[id].name}<span class="tab-count">${games.filter(g=>g.family===id).length}</span></button>`).join('');
 $('family-tabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{family=b.dataset.family;renderTabs();renderGames();$('family-tabs').querySelector(`[data-family="${family}"]`)?.focus({preventScroll:true});}));
}
function card(g){
 const f=FAMILIES[g.family],n=String(games.indexOf(g)+1).padStart(2,'0');
 return `<article class="game-card" style="--family:${f.color}"><button class="card-save ${isSaved(g.id)?'saved':''}" data-save="${g.id}" aria-label="${isSaved(g.id)?'Remove':'Add'} ${esc(g.name)} ${isSaved(g.id)?'from':'to'} your lineup" aria-pressed="${isSaved(g.id)}">${isSaved(g.id)?'✓':'+'}</button><a class="card-open" href="presentation.html?game=${g.id}" aria-label="Learn to play ${esc(g.name)}"><div class="card-art"><span class="card-number">NO. ${n}</span>${gameArt(g,{compact:true})}<span class="card-region">${esc(g.country.toUpperCase())}</span></div><div class="card-content"><p class="card-family">${esc(f.name.toUpperCase())}</p><h3>${esc(g.name)}</h3><p class="card-tagline">${esc(g.tagline)}</p><div class="card-stats"><span>${fmtRange(g.players)} PEOPLE</span><span>${fmtRange(g.minutes)} MIN</span><span class="energy" aria-label="Energy ${g.energy} of 3">${[1,2,3].map(i=>`<i class="${i<=g.energy?'on':''}"></i>`).join('')}</span><span class="card-watch">WATCH THE MOVES →</span></div></div></a></article>`;
}
function filters(){return{query:$('game-search').value,family,players:$('players-filter').value,space:$('space-filter').value,gear:$('gear-filter').checked};}
function renderGames(){
 filtered=searchGames(games,filters());
 $('game-grid').innerHTML=filtered.map(card).join('');
 $('results-count').textContent=`${filtered.length} ${filtered.length===1?'game':'games'}${family==='all'?' to make your own':` in ${FAMILIES[family].name.toLowerCase()}`}`;
 $('empty-state').hidden=!!filtered.length;$('atlas-random').disabled=!filtered.length;
 $('clear-filters').hidden=family==='all'&&!$('game-search').value&&!$('players-filter').value&&!$('space-filter').value&&!$('gear-filter').checked;
}
function clearFilters(){family='all';$('game-search').value='';$('players-filter').value='';$('space-filter').value='';$('gear-filter').checked=false;renderTabs();renderGames();}
function randomGame(source=games){if(source.length)location.href='presentation.html?game='+source[Math.floor(Math.random()*source.length)].id;}

try{
 games=await loadGames();initDialogs(games);renderTabs();renderGames();
 $('game-search').addEventListener('input',renderGames);['players-filter','space-filter','gear-filter'].forEach(id=>$(id).addEventListener('change',renderGames));
 $('clear-filters').addEventListener('click',clearFilters);$('reset-empty').addEventListener('click',clearFilters);$('atlas-random').addEventListener('click',()=>randomGame(filtered));
 document.body.addEventListener('click',e=>{if(e.target.closest('dialog'))return;const b=e.target.closest('[data-open-lineup],[data-save]');if(!b)return;if(b.hasAttribute('data-open-lineup'))openLineup();else if(b.dataset.save)toggleSave(b.dataset.save);});
}catch(error){console.error(error);$('results-count').textContent='The atlas could not load.';$('game-grid').innerHTML='<p>Reload, or open the <a href="gamessss-field-guide.pdf">complete field guide PDF</a>.</p>';}
