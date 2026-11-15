import {FAMILIES, FAMILY_ORDER, loadGames, searchGames, escapeHTML as esc, readSaved, toast} from './core.js';
import {initDialogs, openGame, openLineup} from './dialogs.js';
import {timecode, clamp} from './film-timeline.js';

const $=s=>document.querySelector(s), video=$('#game-film');
const navigator=$('#film-navigator'), transcript=$('#transcript-dialog'), help=$('#film-help-dialog');
const storage={get(key,fallback){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
let games=[],records=new Map(),pool=[],game,film,browseFamily='chase',loadToken=0,pendingSeek=0,customPool=false,frameRate=30;
let modalResume=false,hiddenResume=false,hideTimer,frameRequest,captionKey='',seekActive=false;
let autoNext=storage.get('gamessss-auto-next','true')==='true';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isModalOpen=()=>!!document.querySelector('dialog[open]');

function reveal(){
 document.body.classList.remove('controls-hidden');clearTimeout(hideTimer);
 if(!video.paused&&!isModalOpen())hideTimer=setTimeout(()=>{if(!isModalOpen()&&!$('#film-controls').contains(document.activeElement))document.body.classList.add('controls-hidden');},2800);
}
function updateTransport(){
 const paused=video.paused||video.ended;
 $('#play-film').textContent=paused?'▶':'Ⅱ';$('#play-film').setAttribute('aria-label',paused?'Play film':'Pause film');
 document.body.classList.toggle('film-paused',paused);reveal();
}
async function play(){
 if(!film||isModalOpen())return;
 const token=loadToken;
 if(video.ended)video.currentTime=0;
 $('#film-ended').hidden=true;
 try{await video.play();if(token===loadToken)$('#start-film').hidden=true;}
 catch(error){if(token!==loadToken||error.name==='AbortError')return;if(video.error){showError('The video could not load. Reload this page, or open the field guide above.');return;}$('#start-film').hidden=false;$('#film-loading').hidden=true;reveal();}
}
function togglePlay(){if(video.paused)play();else video.pause();}
// A chapter can begin between encoded frames. Seek just past its first frame,
// so pausing a chapter link displays that chapter's embedded caption too.
const chapterSeekTime=chapter=>(Math.ceil(chapter.start*frameRate)+.01)/frameRate;
function seekTo(seconds){
 if(!film)return;
 pendingSeek=clamp(seconds,0,Number.isFinite(video.duration)?video.duration:film.duration);
 if(video.readyState>0){video.currentTime=pendingSeek;pendingSeek=0;}
 $('#film-ended').hidden=true;updateClock();reveal();
}
function updateClock(){
 if(!film)return;
 const time=video.currentTime||0,duration=Number.isFinite(video.duration)?video.duration:film.duration;
 $('#elapsed').textContent=timecode(time);$('#duration').textContent=timecode(duration);
 if(!seekActive)$('#film-seek').value=Math.round(time/duration*1000);
 $('#film-seek').style.setProperty('--played',`${time/duration*100}%`);
 $('#film-seek').setAttribute('aria-valuetext',`${timecode(time)} of ${timecode(duration)}`);
 const chapter=film.chapters.find(c=>time>=c.start&&time<c.end)||(time<film.chapters[0].start?film.chapters[0]:film.chapters.at(-1));
 const key=`${game.id}:chapter-${chapter.index}`;
 if(key!==captionKey){
  captionKey=key;
  $('#chapter-label').textContent=`${chapter.index+1} / ${film.chapters.length} · ${chapter.title}`;
  $('[data-caption-number]').textContent=`MOVE ${chapter.index+1} / ${film.chapters.length}`;
  $('[data-caption-title]').textContent=chapter.title;
  $('[data-caption-text]').textContent=chapter.text;
 }
}
function clockLoop(){updateClock();if(!video.paused)frameRequest=requestAnimationFrame(clockLoop);}
function currentIndex(){return pool.findIndex(g=>g.id===game?.id);}
function updatePosition(){
 const index=currentIndex();$('[data-film-count]').textContent=`${String(index+1).padStart(2,'0')} / ${pool.length}`;
 $('#previous-film').disabled=index<=0;$('#next-film').disabled=index>=pool.length-1;
}
function chooseGame(id,{autoplay=true,historyMode='push',time=0}={}){
 const selected=games.find(g=>g.id===id);if(!selected)return;
 const token=++loadToken;video.pause();game=selected;film=records.get(id);pendingSeek=time;captionKey='';
 $('#film-ended').hidden=true;$('#start-film').hidden=true;$('#film-loading').hidden=false;
 $('#film-loading p').textContent='Preparing the film…';$('#film-loading').classList.remove('has-error');
 if(!pool.some(g=>g.id===id)){pool=games.slice();customPool=false;}
 browseFamily=game.family;
 $('[data-family-label]').textContent=FAMILIES[game.family].name;$('#film-title').textContent=game.name;
 video.setAttribute('aria-label',`${game.name} · animated explanation`);document.title=`${game.name} · GAMESSSS`;
 $('#film-announcement').textContent=`${game.name}. ${FAMILIES[game.family].name}. Film ${currentIndex()+1} of ${pool.length}.`;
 updatePosition();reveal();
 if(historyMode){const url=new URL(location.href);url.searchParams.set('game',id);url.searchParams.delete('step');if(time>0)url.searchParams.set('time',String(time));else url.searchParams.delete('time');url.searchParams.delete('tour');url.searchParams.delete('set');if(customPool)url.searchParams.set('games',pool.map(g=>g.id).join(','));else url.searchParams.delete('games');history[historyMode==='replace'?'replaceState':'pushState']({},'',url);}
 if(!film){video.removeAttribute('src');video.querySelectorAll('source').forEach(s=>s.remove());video.load();showError('This film could not be loaded. The full rules are available in the field guide.');return;}
 video.poster=film.poster;video.src=film.src;video.load();video.playbackRate=+$('#film-speed').value;
 updateClock();
 video.addEventListener('loadedmetadata',()=>{if(token!==loadToken)return;if(pendingSeek){video.currentTime=Math.min(pendingSeek,video.duration);pendingSeek=0;}updateClock();},{once:true});
 if(autoplay)play();else{$('#start-film').hidden=false;}
}
function nextGame(direction,automatic=false){const at=currentIndex()+direction;if(at>=0&&at<pool.length)chooseGame(pool[at].id,{autoplay:automatic||!reduced});}
function showError(message){$('#film-loading').hidden=false;$('#film-loading').classList.add('has-error');$('#film-loading p').textContent=message;$('#start-film').hidden=true;reveal();}
function suspend(){if(!isModalOpen())modalResume=!video.paused;video.pause();reveal();}
function closeResume(){
 setTimeout(()=>{if(!isModalOpen()){document.body.classList.remove('menu-open');$('#category-pill').setAttribute('aria-expanded','false');const resume=modalResume;modalResume=false;if(resume)play();reveal();}},0);
}
function openPanel(dialog){suspend();dialog.showModal();}
function renderNavigator(){
 $('#navigator-families').innerHTML=FAMILY_ORDER.map(key=>`<button data-family="${key}" class="${browseFamily===key?'active':''}" aria-pressed="${browseFamily===key}"><i></i>${esc(FAMILIES[key].short)}</button>`).join('');
 const query=$('#navigator-search').value.trim(),results=searchGames(games,{family:query?'all':browseFamily,query});
 $('#navigator-family-name').textContent=query?'Across all six families':FAMILIES[browseFamily].name;
 $('#navigator-count').textContent=`${results.length} FILM${results.length===1?'':'S'}`;
 $('#navigator-games').innerHTML=results.length?results.map(g=>`<button data-film="${g.id}" ${g.id===game?.id?'aria-current="true"':''}><i class="nav-dot"></i><span class="nav-game-name">${esc(g.name)}<small>${esc(query?FAMILIES[g.family].name:g.region)}</small></span><em class="nav-game-time">${records.has(g.id)?timecode(records.get(g.id).duration):'—'}</em></button>`).join(''):'<p class="navigator-empty">No games found. Try a different name, place or piece of equipment.</p>';
}
function openNavigator(){browseFamily=game.family;$('#navigator-search').value='';renderNavigator();openPanel(navigator);document.body.classList.add('menu-open');$('#category-pill').setAttribute('aria-expanded','true');}
function fullRules(){suspend();openGame(game.id);}
function openTranscript(){
 if(!film)return;
 $('#transcript-title').textContent=game.name;
 $('#transcript-content').innerHTML=`<p class="transcript-note">Click a chapter to jump to that part of the film.</p><ol>${film.chapters.map(c=>`<li><button class="transcript-chapter" data-chapter="${c.index}"><span>${timecode(c.start)} · CHAPTER ${c.index+1}</span><b>${esc(c.title)}</b><p>${esc(c.text)}</p></button></li>`).join('')}</ol>`;
 $('#download-film').href=film.src;$('#download-film').download=`gamessss-${game.id}.mp4`;openPanel(transcript);
}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Full screen is unavailable in this browser.');}}

$('#play-film').addEventListener('click',togglePlay);$('#start-film').addEventListener('click',play);video.addEventListener('click',togglePlay);
$('#previous-film').addEventListener('click',()=>nextGame(-1));$('#next-film').addEventListener('click',()=>nextGame(1));
$('#film-replay').addEventListener('click',()=>{seekTo(0);play();});
$('#film-seek').addEventListener('pointerdown',()=>seekActive=true);
$('#film-seek').addEventListener('input',e=>seekTo(+e.target.value/1000*(Number.isFinite(video.duration)?video.duration:film.duration)));
window.addEventListener('pointerup',()=>seekActive=false);window.addEventListener('pointercancel',()=>seekActive=false);$('#film-seek').addEventListener('change',()=>seekActive=false);
$('#film-speed').addEventListener('change',e=>{video.playbackRate=+e.target.value;reveal();});
$('#film-fullscreen').addEventListener('click',fullscreen);$('#film-rules').addEventListener('click',fullRules);
$('#film-transcript').addEventListener('click',openTranscript);$('#film-help').addEventListener('click',()=>openPanel(help));
$('#category-pill').addEventListener('click',openNavigator);$('[data-open-picker]').addEventListener('click',openNavigator);
$('[data-close-navigator]').addEventListener('click',()=>navigator.close());$('[data-close-transcript]').addEventListener('click',()=>transcript.close());$('[data-close-help]').addEventListener('click',()=>help.close());
$('#navigator-search').addEventListener('input',renderNavigator);
navigator.addEventListener('click',e=>{
 const family=e.target.closest('[data-family]'),choice=e.target.closest('[data-film]');
 if(family){browseFamily=family.dataset.family;$('#navigator-search').value='';renderNavigator();$('#navigator-families [data-family="'+browseFamily+'"]').focus();}
 if(choice){modalResume=false;navigator.close();chooseGame(choice.dataset.film);}
});
$('#navigator-lineup').addEventListener('click',()=>{navigator.close();openLineup();});
$('#transcript-rules').addEventListener('click',()=>{transcript.close();openGame(game.id);});
transcript.addEventListener('click',e=>{const chapter=e.target.closest('[data-chapter]');if(chapter){modalResume=false;seekTo(chapterSeekTime(film.chapters[+chapter.dataset.chapter]));transcript.close();play();}});
for(const dialog of [navigator,transcript,help]){dialog.addEventListener('close',closeResume);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
new MutationObserver(()=>{$('#dialog-root').querySelectorAll('dialog:not([data-cinema-watched])').forEach(d=>{d.dataset.cinemaWatched='true';d.addEventListener('close',closeResume);});}).observe($('#dialog-root'),{childList:true});
$('#auto-next').checked=autoNext;$('#auto-next').addEventListener('change',e=>{autoNext=e.target.checked;storage.set('gamessss-auto-next',String(autoNext));});
$('#controls-hint button').addEventListener('click',()=>{$('#controls-hint').classList.add('dismissed');storage.set('gamessss-film-hint','seen');});
if(storage.get('gamessss-film-hint','')==='seen')$('#controls-hint').classList.add('dismissed');else setTimeout(()=>$('#controls-hint').classList.add('dismissed'),9500);
video.addEventListener('play',()=>{cancelAnimationFrame(frameRequest);clockLoop();updateTransport();});video.addEventListener('pause',()=>{cancelAnimationFrame(frameRequest);updateClock();updateTransport();});
video.addEventListener('timeupdate',updateClock);video.addEventListener('seeked',updateClock);
video.addEventListener('loadeddata',()=>$('#film-loading').hidden=true);video.addEventListener('playing',()=>{$('#film-loading').hidden=true;$('#start-film').hidden=true;});
video.addEventListener('waiting',()=>{if(!video.paused)$('#film-loading').hidden=false;});
video.addEventListener('canplay',()=>{if(!video.error)$('#film-loading').hidden=true;});
video.addEventListener('error',()=>{if(film)showError('The video could not load. Try reloading, or open the field guide above.');});
video.addEventListener('ended',()=>{if(autoNext&&currentIndex()<pool.length-1)nextGame(1,true);else if(autoNext){$('#film-ended').hidden=false;reveal();}else reveal();});
document.addEventListener('pointermove',reveal);document.addEventListener('pointerdown',reveal);document.addEventListener('focusin',reveal);
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||isModalOpen()||!game)return;
 if(e.target.closest('input,select,textarea,[contenteditable="true"]'))return;
 if(e.key===' '&&e.target.closest('button,a'))return;
 const action={'ArrowLeft':()=>nextGame(-1),'ArrowRight':()=>nextGame(1),' ':togglePlay,'r':()=>{seekTo(0);play();},'j':()=>seekTo(video.currentTime-10),'l':()=>seekTo(video.currentTime+10),'g':openNavigator,'f':fullscreen,'?':()=>openPanel(help)}[e.key.length===1?e.key.toLowerCase():e.key];
 if(action){e.preventDefault();action();reveal();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenResume=!video.paused;video.pause();}else if(hiddenResume){hiddenResume=false;play();}});
function route(historyMode){
 const params=new URL(location.href).searchParams;
 const ids=params.get('games')?.split(',')||(params.get('set')==='lineup'?readSaved():null);
 customPool=!!ids;pool=ids?[...new Set(ids)].map(id=>games.find(g=>g.id===id)).filter(Boolean):games.slice();if(!pool.length){pool=games.slice();customPool=false;}
 const selected=pool.find(g=>g.id===params.get('game'))||pool[0];
 const record=records.get(selected.id),step=Number(params.get('step'));
 const time=params.has('time')?Math.max(0,Number(params.get('time'))||0):step>0&&record?.chapters[step-1]?chapterSeekTime(record.chapters[step-1]):0;
 chooseGame(selected.id,{autoplay:!reduced,historyMode,time});
}
window.addEventListener('popstate',()=>route(false));
try{
 [games,records]=await Promise.all([loadGames(),fetch('films/manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Film index unavailable');return r.json();}).then(m=>{frameRate=m.fps||30;return new Map(m.films.map(f=>{const revision=f.sourceFingerprint?.slice(0,16);return[f.id,revision?{...f,src:`${f.src}?v=${revision}`,poster:`${f.poster}?v=${revision}`}:f];}));})]);
 initDialogs(games);video.controls=false;route('replace');document.body.dataset.ready='true';
}catch(error){video.controls=true;showError('The film library could not load. Reload this page, or open the field guide above.');console.error(error);}
