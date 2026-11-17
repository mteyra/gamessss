import { loadGames, FAMILIES, FAMILY_ORDER, escapeHTML, sourceLinks, statusText } from './core.js';

const sourcebook = document.getElementById('sourcebook');
const sourceCount = document.getElementById('source-count');
const sourceSearch = document.getElementById('source-search');
const expandButton = document.getElementById('source-expand');
const normalize = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
let games = [];
let expanded = false;

function renderSources() {
  const query = normalize(sourceSearch.value).trim();
  const terms = query.split(/\s+/).filter(Boolean);
  const matches = games.filter(game => {
    const text = normalize([game.name, ...game.aliases, game.region, game.country, game.ruleNote, ...game.sources.map(source => source.title)].join(' '));
    return terms.every(term => text.includes(term));
  });
  sourcebook.innerHTML = FAMILY_ORDER.map(family => {
    const items = matches.filter(game => game.family === family);
    if (!items.length) return '';
    const group = FAMILIES[family];
    return `<section class="source-family" aria-labelledby="source-family-${family}"><h3 class="source-family-heading" id="source-family-${family}"><span aria-hidden="true" style="background:${group.color}">${group.symbol}</span>${escapeHTML(group.name)}</h3>${items.map(game => `<details class="source-entry" id="source-${game.id}" ${expanded ? 'open' : ''}><summary><span class="source-entry-name">${escapeHTML(game.name)}</span><small>${escapeHTML(game.country)}</small></summary><div class="source-entry-content"><p><span class="rule-label">${escapeHTML(statusText(game))}</span></p><p>${escapeHTML(game.ruleNote)}</p><p class="source-context">${escapeHTML(game.region)}${game.aliases.length ? ' · Also: ' + escapeHTML(game.aliases.join(', ')) : ''}</p><div class="source-list">${sourceLinks(game)}</div><a class="source-game-link" href="./?game=${encodeURIComponent(game.id)}">Open the game & its rules ↗</a></div></details>`).join('')}</section>`;
  }).join('');
  sourceCount.textContent = matches.length ? `${matches.length} of ${games.length} games · ${new Set(matches.flatMap(game => game.sources.map(source => source.url))).size} source links` : 'No games match that search. Try a game name, place or publisher.';
  expandButton.disabled = matches.length === 0;
}

sourceSearch.addEventListener('input', renderSources);
expandButton.addEventListener('click', () => {
  expanded = !expanded;
  sourcebook.querySelectorAll('details').forEach(details => { details.open = expanded; });
  expandButton.textContent = expanded ? 'Collapse all' : 'Expand all';
  expandButton.setAttribute('aria-expanded', String(expanded));
});
loadGames().then(data => {
  games = data;
  document.getElementById('source-tools').hidden = false;
  document.getElementById('source-fallback').hidden = true;
  renderSources();
  if (location.hash.startsWith('#source-')) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.tagName === 'DETAILS') { target.open = true; target.scrollIntoView({ block: 'start' }); }
  }
}).catch(() => {
  sourceCount.textContent = 'The complete sourcebook could not load. The guide and direct links below are still available.';
});
