#!/usr/bin/env node
/**
 * Validate the authored game catalogue, then optionally regenerate its field guide.
 * Usage: node tools/validate-data.mjs [--report]
 * Uses Node built-ins; does not install packages or make network requests.
 */
import {readFile, readdir, writeFile, rename} from 'node:fs/promises';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = join(root, 'site');
const args = process.argv.slice(2);
if (args.some(arg => !['--report', '--help'].includes(arg))) {
  console.error('Usage: node tools/validate-data.mjs [--report]');
  process.exit(2);
}
if (args.includes('--help')) {
  console.log('Validates all game data and static game links. --report regenerates site/research-report.md after validation passes.');
  process.exit(0);
}

const families = {
  chase: 'Chase & escape',
  dodge: 'Dodge & rescue',
  target: 'Aim & throw',
  world: 'World & tradition',
  team: 'Teams & tactics',
  together: 'Everybody in'
};
const files = ['chase-dodge.json', 'world-target.json', 'team-together.json'];
const keys = [
  'id', 'name', 'aliases', 'family', 'tagline', 'region', 'country', 'players',
  'minutes', 'ages', 'energy', 'space', 'equipment', 'noEquipment', 'hook',
  'setup', 'steps', 'win', 'twist', 'variation', 'care', 'ruleStatus',
  'ruleNote', 'sources', 'diagram', 'spotlight'
];
const proseFields = ['hook', 'setup', 'win', 'twist', 'variation', 'care', 'ruleNote'];
const strings = [
  'id', 'name', 'family', 'tagline', 'region', 'country', 'ages', ...proseFields,
  'space', 'ruleStatus', 'diagram'
];
const diagrams = ['chase', 'islands', 'dodge', 'target', 'net', 'circle', 'territory', 'relay', 'line', 'scatter'];
const required = ['islands', 'manhunt', 'hoop-rescue', 'noodle-keeper', 'flunkyball'];
const problems = [];
const games = [];
const wordCount = value => String(value ?? '').trim().split(/\s+/u).filter(Boolean).length;
const normalize = value => String(value).normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{Letter}\p{Number}]/gu, '');
const check = (condition, text) => { if (!condition) problems.push(text); };
const isString = value => typeof value === 'string' && value.trim().length > 0;

for (const file of files) {
  try {
    const batch = JSON.parse(await readFile(join(siteDir, 'data', file), 'utf8'));
    check(Array.isArray(batch), `${file}: expected a JSON array`);
    if (!Array.isArray(batch)) continue;
    check(batch.length === 24, `${file}: expected 24 entries, found ${batch.length}`);
    games.push(...batch);
  } catch (error) {
    problems.push(`${file}: ${error.message}`);
  }
}

const ids = new Set();
const names = new Map();
const sources = new Map();
const familyCounts = Object.fromEntries(Object.keys(families).map(key => [key, 0]));
const statusCounts = {documented: 0, starter: 0, house: 0};

games.forEach((game, index) => {
  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    problems.push(`Entry ${index + 1}: expected an object`);
    return;
  }
  const label = game.id || `Entry ${index + 1}`;
  for (const key of keys) check(Object.hasOwn(game, key), `${label}: missing ${key}`);
  for (const key of Object.keys(game)) check(keys.includes(key), `${label}: unknown field ${key}`);
  for (const key of strings) {
    check(isString(game[key]), `${label}: ${key} must be a nonempty string`);
    if (typeof game[key] === 'string') {
      check(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(game[key]), `${label}: control characters in ${key}`);
      check(game[key] === game[key].trim(), `${label}: surrounding whitespace in ${key}`);
    }
  }
  check(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(game.id), `${label}: invalid ID slug`);
  check(!ids.has(game.id), `${label}: duplicate ID`);
  ids.add(game.id);
  const normalizedName = normalize(game.name);
  check(!names.has(normalizedName), `${label}: duplicate title after normalization (${names.get(normalizedName)})`);
  names.set(normalizedName, game.id);
  check(Object.hasOwn(families, game.family), `${label}: unsupported family`);
  if (Object.hasOwn(familyCounts, game.family)) familyCounts[game.family]++;
  check(Object.hasOwn(statusCounts, game.ruleStatus), `${label}: unsupported ruleStatus`);
  if (Object.hasOwn(statusCounts, game.ruleStatus)) statusCounts[game.ruleStatus]++;
  check(diagrams.includes(game.diagram), `${label}: unsupported diagram`);
  check([1, 2, 3].includes(game.energy), `${label}: energy must be 1, 2 or 3`);
  check(['small', 'medium', 'large'].includes(game.space), `${label}: unsupported space`);
  check(typeof game.spotlight === 'boolean', `${label}: spotlight must be boolean`);
  check(typeof game.noEquipment === 'boolean', `${label}: noEquipment must be boolean`);
  check(/^\d{1,2}\+$/.test(game.ages) && parseInt(game.ages, 10) >= 3 && parseInt(game.ages, 10) <= 18, `${label}: ages must be a suggested minimum such as 8+`);
  for (const key of ['players', 'minutes']) {
    const range = game[key];
    check(Array.isArray(range) && range.length === 2, `${label}: ${key} must contain [min,max]`);
    if (Array.isArray(range)) {
      check(range.every(value => Number.isInteger(value) && value > 0 && value <= (key === 'players' ? 100 : 180)), `${label}: ${key} values must be positive, reasonable integers`);
      check(range[0] <= range[1], `${label}: reversed ${key} range`);
      if (key === 'players') check(range[0] >= 2, `${label}: expected a group game`);
    }
  }
  for (const key of ['aliases', 'equipment', 'steps']) {
    check(Array.isArray(game[key]), `${label}: ${key} must be an array`);
    if (!Array.isArray(game[key])) continue;
    check(game[key].every(isString), `${label}: ${key} contains an empty or non-string entry`);
    const normalized = game[key].map(normalize);
    check(new Set(normalized).size === normalized.length, `${label}: duplicate ${key} entries`);
  }
  if (Array.isArray(game.equipment)) {
    check(game.noEquipment === (game.equipment.length === 0), `${label}: equipment list and noEquipment disagree`);
  }
  if (Array.isArray(game.steps)) {
    check(game.steps.length >= 4 && game.steps.length <= 5, `${label}: expected 4–5 playable steps`);
    check(game.steps.every(step => wordCount(step) >= 5 && wordCount(step) <= 80), `${label}: steps should each contain 5–80 words`);
  }
  check(wordCount(game.tagline) <= 12, `${label}: tagline exceeds 12 words`);
  check(wordCount(game.hook) >= 25 && wordCount(game.hook) <= 40, `${label}: hook should contain 25–40 words`);
  const words = wordCount([...proseFields.map(key => game[key] || ''), ...(Array.isArray(game.steps) ? game.steps : [])].join(' '));
  check(words >= 120 && words <= 260, `${label}: rules prose must contain 120–260 words, found ${words}`);

  check(Array.isArray(game.sources) && game.sources.length > 0, `${label}: at least one source is required`);
  const gameURLs = new Set();
  for (const source of Array.isArray(game.sources) ? game.sources : []) {
    check(source && typeof source === 'object' && isString(source.title) && isString(source.url), `${label}: malformed source`);
    if (!source || !isString(source.url)) continue;
    try {
      const url = new URL(source.url);
      check(url.protocol === 'https:' || url.protocol === 'http:', `${label}: unsupported source protocol`);
      check(!url.username && !url.password, `${label}: source URL must not contain credentials`);
      check(url.hostname.includes('.') && !['example.com', 'example.org', 'example.net', 'localhost'].includes(url.hostname), `${label}: source must be a real external hostname`);
      check(!gameURLs.has(source.url), `${label}: duplicate source URL`);
      gameURLs.add(source.url);
      if (!sources.has(source.url)) sources.set(source.url, {...source, games: []});
      sources.get(source.url).games.push(game.id);
    } catch {
      problems.push(`${label}: invalid source URL ${source.url}`);
    }
  }
});

check(games.length === 72, `Catalogue: expected 72 entries, found ${games.length}`);
for (const [family, count] of Object.entries(familyCounts)) check(count === 12, `${family}: expected 12 games, found ${count}`);
for (const id of required) check(ids.has(id), `User-requested game missing: ${id}`);
check(games.find(game => game?.id === 'noodle-keeper')?.ruleStatus === 'house', 'Noodle Keeper must remain labeled as house rules');
check(games.find(game => game?.id === 'manhunt')?.aliases?.some(alias => normalize(alias) === 'onetouchtouchall'), 'Manhunt should retain the user’s remembered one-touch-touch-all alias');

// Check literal game links in authored HTML and JS without evaluating site code.
// Runtime expressions (${...}) are intentionally ignored.
let snippetCount = 0;
for (const filename of await readdir(siteDir)) {
  if (!/\.(html|js)$/u.test(filename)) continue;
  const content = await readFile(join(siteDir, filename), 'utf8');
  const patterns = [
    /data-open-game\s*=\s*["']([a-z][a-z0-9-]*)["']/gu,
    /(?:[?&#]game=)([a-z][a-z0-9-]*)/gu,
    /\bopenGame\(\s*["']([a-z][a-z0-9-]*)["']/gu
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      snippetCount++;
      check(ids.has(match[1]), `${filename}: game link references missing ID ${match[1]}`);
    }
  }
}

if (problems.length) {
  console.error(`Catalogue validation failed (${problems.length}):\n${problems.map(problem => `- ${problem}`).join('\n')}`);
  process.exit(1);
}

const sorted = Object.keys(families).flatMap(family => games.filter(game => game.family === family));
const range = values => values[0] === values[1] ? String(values[0]) : values.join('–');
const md = value => String(value).replace(/([\\`*_[\]<>])/gu, '\\$1');
const statusLabel = {documented: 'Documented game', starter: 'Starter rules', house: 'House adaptation'};
function gameMarkdown(game, number) {
  return [
    `<a id="${game.id}"></a>`,
    `### ${number}. ${md(game.name)}`,
    `*${md(game.tagline)}*`,
    `${md(game.region)} · ${range(game.players)} people · ${range(game.minutes)} minutes · Suggested age ${md(game.ages)} · ${md(game.space)} space · Energy ${game.energy}/3`,
    `**Also known as:** ${game.aliases.length ? game.aliases.map(md).join(', ') : '—'}`,
    `**Equipment:** ${game.equipment.length ? game.equipment.map(md).join(', ') : 'None'}`,
    md(game.hook),
    `**Set up:** ${md(game.setup)}`,
    game.steps.map((step, i) => `${i + 1}. ${md(step)}`).join('\n'),
    `**How it ends:** ${md(game.win)}`,
    `**The twist:** ${md(game.twist)}`,
    `**Mix it up:** ${md(game.variation)}`,
    `**Make it work:** ${md(game.care)}`,
    `**${statusLabel[game.ruleStatus]}:** ${md(game.ruleNote)}`,
    `**Sources:**\n\n${game.sources.map(source => `- [${md(source.title)}](<${source.url}>)`).join('\n')}`
  ].join('\n\n');
}

if (args.includes('--report')) {
  const sectionIntros = {
    chase: 'Change who runs, who helps, or which routes remain open. These games show how a single tagging rule can transform a familiar chase.',
    dodge: 'Change what being “out” means. This chapter includes rescues, special roles and target-only relatives as well as elimination games.',
    target: 'A place to aim and a reason to try again. These games reward accuracy, judgement and the pleasure of a satisfying hit.',
    world: 'An invitation to discover living traditions and regional favourites. Learn local names and context alongside a clearly labeled starter version.',
    team: 'Passing, positioning and shared decisions create different kinds of teamwork. Adaptations make specialised sports approachable without claiming to reproduce every regulation.',
    together: 'Small shared challenges, circle games and icebreakers. Some have winners; others work because everyone keeps the same thing going.'
  };
  const houseNames = sorted.filter(game => game.ruleStatus === 'house').map(game => `[${md(game.name)}](#${game.id})`);
  let number = 0;
  const body = [
    '# Group Games — the field guide',
    '**72 ways to get together and play.** Research edition: 14 November 2026.',
    'This companion to the Group Games website collects the complete starter rules, game variations and source links in a portable form. It is a curated introduction to physical group games, not an exhaustive inventory or a ranking of the world’s best games.',
    '## How to use the atlas',
    'Choose a game that fits the people, space and equipment you actually have. Explain its aim, demonstrate one turn, agree the boundary and stop signal, and try a short round. Change one rule together when it would improve the experience. The game becomes yours through playing it.',
    '## Research and provenance',
    `The catalogue contains six families of twelve games, drawing on ${sources.size} distinct linked source URLs. Sources include governing bodies, cultural and educational organisations, municipal resources, teachers, camp practitioners and reference works. Links support the particular mechanics described; their presence does not imply endorsement by the source.`,
    'Text is newly written. Names, mechanics and cultural associations were checked against linked resources where available. No source illustrations or video files have been copied into the site. Every game includes its own rule note so a local or simplified form is not presented as universal.',
    `The current editorial labels are **${statusCounts.documented} documented games**, **${statusCounts.starter} starter rulesets** and **${statusCounts.house} house adaptations**. “Documented” identifies a described form of play, not a claim of one worldwide rulebook. “Starter” means a concise, usable version with selected clarifications. “House” marks an explicit adaptation or newly composed version; sources may document the parent game rather than the exact adaptation.`,
    'Player ranges, session lengths, age suggestions, energy ratings and space categories are hosting guidance. They are not official eligibility rules, measured exertion, or universal accessibility ratings. The upper player count is a suggested practical group size, and may require equal teams or an even number; check the setup. Session duration can include repeated short rounds.',
    'Country and region labels describe associations, not proven places of invention. Traditional games often have multiple names and regional rules. The linked organisations and local players remain the best route to deeper cultural context or formal competition.',
    'The user’s Islands memory is preserved as the lying-pairs chase. “One-touch-touch-all” is retained as a remembered name for infection-style Manhunt without claiming a standard alias. Noodle Keeper is labeled as a user-inspired house game. The Flunkyball entry explicitly separates its accessible adaptation from the familiar drinking-game format.',
    `**House adaptations in this edition:** ${houseNames.join(', ')}.`,
    'External pages can change. This validation checks catalogue structure and link syntax; it does not certify that every external website is online, verify an organisation’s current regulations, or replace the game-specific editorial source review. Detailed research logs live in the repository’s research directory.',
    '## Find a game',
    [
      '| Family | Games |',
      '| --- | --- |',
      ...Object.entries(families).map(([family, title]) => `| ${title} | ${sorted.filter(game => game.family === family).map(game => `[${md(game.name)}](#${game.id})`).join(' · ')} |`)
    ].join('\n')
  ].join('\n\n');
  const sections = Object.entries(families).map(([family, title]) => {
    const entries = sorted.filter(game => game.family === family).map(game => gameMarkdown(game, ++number)).join('\n\n---\n\n');
    return `## ${title}\n\n${sectionIntros[family]}\n\n${entries}`;
  });
  const bibliography = [
    '## Source index',
    'Each URL is listed once below; the game entries above show which source supports which game.',
    ...[...sources.values()].map((source, i) => `${i + 1}. [${md(source.title)}](<${source.url}>) — ${source.games.map(id => `[${md(games.find(game => game.id === id).name)}](#${id})`).join(', ')}`)
  ].join('\n\n');
  const report = [body, ...sections, bibliography].join('\n\n---\n\n') + '\n';
  const target = join(siteDir, 'research-report.md');
  await writeFile(`${target}.tmp`, report, 'utf8');
  await rename(`${target}.tmp`, target);
  console.log(`Generated site/research-report.md (${number} games, ${sources.size} source URLs).`);
}
console.log(`Validated ${games.length} unique games: ${Object.entries(familyCounts).map(([family, count]) => `${family} ${count}`).join(', ')}.`);
console.log(`Validated ${sources.size} source URLs, ${snippetCount} static game-link snippets, all schema fields and ranges.`);
console.log(`Rule labels: ${statusCounts.documented} documented, ${statusCounts.starter} starter, ${statusCounts.house} house.`);
