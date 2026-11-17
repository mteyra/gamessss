# Group Games research brief
Create JSON arrays of 24 well-chosen physical group games per assigned agent, 12 per family. Distinct documented games/variants, broad geographic associations; no invented "official" rules. Practical starter rules not exhaustive competition rules. User memory and designed adaptations labeled. English copy, native names/aliases useful for search. Avoid exoticizing cultures, false origin certainty and arbitrary world-best rankings. No scraped source prose. Read sources, cite actual URLs. Respect source word limits. Suggested counts/time/age are our hosting suggestions, not official.

Each object:
{
 "id":"slug", "name":"Islands", "aliases":["Partner tag"], "family":"chase|dodge|target|world|team|together", "tagline":"A tiny hook, 12 words maximum.", "region":"Germany / playgrounds worldwide", "country":"Germany" or "Worldwide", "players":[8,30], "minutes":[5,10], "ages":"8+", "energy":1|2|3, "space":"small|medium|large", "equipment":["Soft ball"], "noEquipment":false,
 "hook":"25–40 words explaining what is uniquely delightful.",
 "setup":"One or two clear practical sentences.",
 "steps":["4 to 5 precise, ordered playable steps. Include who acts, scoring, out/rescue rules and restart."],
 "win":"Clear end condition in one sentence.",
 "twist":"The memorable mechanic in one sentence.",
 "variation":"One clear optional change, labeled adaptation when designed.",
 "care":"One or two concrete safety/access adjustments relevant to the game; short.",
 "ruleStatus":"documented|starter|house",
 "ruleNote":"Explain disputed names, simplifications, adaptations or regional variants in one short sentence.",
 "sources":[{"title":"Publisher / page title","url":"https://..."}],
 "diagram":"chase|islands|dodge|target|net|circle|territory|relay|line|scatter",
 "spotlight":false
}

Use no more than ~200-260 words per entry across prose fields. At least one trustworthy actual observed source per documented game, primary/federation/teacher/cultural education preferred; Wikipedia useful fallback for regional games. Source title and URL must support mechanics. Never invent verification. House adaptation sources can support parent game but note exact change was designed, not sourced. Avoid rigid invented origins; region is association, not invention claim. Collect bibliography and evidence/gaps in matching research .md file. Do not edit other agents' files.
