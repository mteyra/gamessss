export const FAMILIES = {
  chase: {name:'Chase & escape', short:'Chase', color:'#df765c', symbol:'↝', description:'A chase. A hiding place. A spectacular change of direction.', title:'CATCH ME.\nIF YOU CAN.'},
  dodge: {name:'Dodge & rescue', short:'Dodge', color:'#b4a0e7', symbol:'✳', description:'Duck the ball. Save a friend. Rewrite what “out” means.', title:'OUT IS JUST\nTHE BEGINNING.'},
  target: {name:'Aim & throw', short:'Target', color:'#dfcb76', symbol:'◎', description:'One target. A very satisfying sound. Another go.', title:'A LITTLE AIM.\nA LOT OF JOY.'},
  world: {name:'World & tradition', short:'World', color:'#a9c9ba', symbol:'✺', description:'Games passed between neighbours, generations, and places.', title:'PLAY HAS\nMANY ACCENTS.'},
  team: {name:'Teams & tactics', short:'Team', color:'#9db9d5', symbol:'⇄', description:'Find the gap. Make the pass. Be more than the sum of your players.', title:'BETTER\nTOGETHER.'},
  together: {name:'Everybody in', short:'Together', color:'#edb4c1', symbol:'∞', description:'Make a circle. Break the ice. Keep the good thing going.', title:'EVERYBODY\nBELONGS HERE.'}
};
export const FAMILY_ORDER = Object.keys(FAMILIES);
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmtRange = values => values[0] === values[1] ? values[0] : values.join('–');
export const icon = (name) => ({plus:'+',check:'✓',arrow:'↗',close:'×',back:'←',next:'→'})[name] || name;
export function readSaved() {
  try { const value = JSON.parse(localStorage.getItem('gamessss-lineup-v1') || '[]'); return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string'))] : []; } catch { return []; }
}
export function writeSaved(ids) {
  try { localStorage.setItem('gamessss-lineup-v1', JSON.stringify(ids)); return true; } catch { return false; }
}
let gamesPromise;
export function loadGames() {
  if (!gamesPromise) gamesPromise = Promise.all(['chase-dodge','world-target','team-together'].map(name => fetch(`data/${name}.json`).then(r => {if(!r.ok) throw new Error(`Could not load ${name}`); return r.json();}))).then(arrays => arrays.flat().sort((a,b) => FAMILY_ORDER.indexOf(a.family)-FAMILY_ORDER.indexOf(b.family)));
  return gamesPromise;
}
export const statusText = game => ({documented:'Documented game', starter:'Starter rules', house:'House adaptation'})[game.ruleStatus] || 'Starter rules';
export function searchGames(games, {query='',family='all',players='',space='',gear=false}={}) {
  const normalize = s => String(s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return games.filter(g => {
    const haystack = normalize([g.name,...g.aliases,g.region,g.country,...g.equipment,g.tagline,g.hook,g.variation].join(' '));
    return (family==='all'||g.family===family) && (!players||(+players>=g.players[0]&&+players<=g.players[1])) && (!space||['small','medium','large'].indexOf(g.space)<=['small','medium','large'].indexOf(space)) && (!gear||g.noEquipment) && terms.every(term=>haystack.includes(term));
  });
}
export function toast(message) {
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=message; el.classList.add('show');
  clearTimeout(toast.timeout); toast.timeout=setTimeout(()=>el.classList.remove('show'),3200);
}
export function sourceLinks(game) {
  return game.sources.map(s=>`<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)} <span aria-hidden="true">↗</span></a>`).join('');
}
export function downloadText(filename,text,type='text/markdown') {
  const blob=new Blob([text],{type:`${type};charset=utf-8`}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function gameMarkdown(g,i=0) {
  return `## ${i?i+'. ':''}${g.name}\n\n${g.tagline}\n\n${g.region} · ${fmtRange(g.players)} people · ${fmtRange(g.minutes)} min · Suggested age ${g.ages}\n\nEquipment: ${g.equipment.join(', ')||'None'}\n\n${g.hook}\n\n### Set up\n\n${g.setup}\n\n### How to play\n\n${g.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\n**How it ends:** ${g.win}\n\n**The twist:** ${g.twist}\n\n**Mix it up:** ${g.variation}\n\n**Make it work:** ${g.care}\n\n**Rules note — ${statusText(g)}:** ${g.ruleNote}\n\n**Sources:**\n\n${g.sources.map(s=>`- [${s.title}](${s.url})`).join('\n')}\n`;
}
