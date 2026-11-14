# Visual lesson contract — revision 2

Each game gets a self-guided, concrete example of a full round or representative sequence. Use the existing canonical rules. Every game needs **5–7 authored states**: setup, start, meaningful action, rule consequence, outcome and reset where needed. The animation should explain the rule through positions, roles, targets, possessions, links, scores and changed eligibility. Never substitute an unrelated generic chase or throw.

Modules export a named object: `export const LESSONS = { 'game-id': {...} }`.

```js
import {P,B,O,Z,L,T,S,ring,INK,PAPER,A,BTEAM,C,WAIT} from './lesson-kit.js';
const base=[Z('court',20,30,600,330,'PLAY AREA'),P('mouse',300,180,'a','M'),P('cat',450,180,'b','C')];
const next=S(base,{mouse:{x:130,y:100},cat:{x:320,y:150}});
export const LESSONS={
 'game-id':{
   summary:'One factual sentence about what you are trying to do.',
   legend:[{color:A,label:'Mouse'},{color:BTEAM,label:'Cat'}],
   steps:[
     {title:'Choose a cat and mouse',text:'The mouse runs. Everyone else is in a pair.',action:'Set up',nodes:base},
     {title:'Join a pair',text:'The mouse joins the left end. The pair temporarily has three people.',action:'Join this pair',focus:[130,100],nodes:next,duration:1700,tracks:[{id:'mouse',points:[[300,180],[230,80],[130,100]]},{id:'cat',points:[[450,180],[350,100],[320,150]],start:.15,end:1}]}
   ]
 }
};
```

- Canvas coordinates: **640 × 400**. Keep actors inside x 25–615 and y 25–375. Important action stays away from very top/bottom. Default player radius 15, ball radius 9.
- All steps contain their complete `nodes` array. Give recurring objects stable IDs so motion actually interpolates them.
- `title`: literal action/rule being shown, typically 3–7 words. `text`: one or two clear factual sentences, ideally under 35 words. A viewer has no presenter.
- `action`: short verb phrase for the button that animates **into** this step. First step action is unused. `focus:[x,y]` gives the optional clickable target in the preceding state. Use meaningful court targets; avoid covering actor labels.
- `duration`: 1200–2400 ms suggested. Optional `tracks` give each animated node an ordered polyline with at least two `[x,y]` points. `start`/`end` (0..1) stage sequential motions.
- A step is a finished, legible still after its animation. Keep movement trails as short, relevant `path` or `line` nodes if useful. No perpetual ambient motion.
- `legend`: 2–4 colors/role labels relevant to this game. `summary` gives the objective. Sources, full setup/rules, equipment and care remain available from canonical data beside the lesson.

## Helpers

- `P(id,x,y,team='a',label='',extra={})`: player. team `'a'`, `'b'`, `'c'`, `'wait'`, `'neutral'` choose colors. Labels are short identity/role marks (A, B, C, 1, 2, K, M), **not long words**. Optional `name` for accessibility, `pose:'lying'|'seated'`, `rotate`, `opacity`, `r`.
- `B(id,x,y,extra={})`: ball. Optional `r`, `fill`, `label`.
- `O(id,kind,x,y,extra={})`: object. Kinds: `disc`, `cone`, `pin`, `bottle`, `flag`, `hoop`, `shuttle`, `block`, `target`, `net`, `star`, `text`, `ring`, `zone`, `line`, `path`, `player`, `ball`. Use `w/h`, `r`, `rotate`, `fill`, `stroke`, `label`, `opacity` as relevant.
- `Z(id,x,y,w,h,label='',fill='#e5e9df',extra={})`: rectangle/zone, x/y is **top left**; label appears top center. Prefer light fills.
- `L(id,x1,y1,x2,y2,extra={})`: line, supports `stroke`, `width`, `dash`, `arrow`.
- `T(id,x,y,label,extra={})`: short annotation, centered, font `size` default 14. Use explicit little labels such as SAFE, +1, STOP, OUT, NO HANDS; ordinary explanation belongs outside the drawing.
- `ring(id,x,y,r,extra={})`: circle outline; `label` at center.
- `S(base,changes={},add=[],remove=[])`: clones an array, merges keyed object changes, appends new nodes, omits listed IDs. Does not mutate base. You may chain from earlier frames.
- Exported colors `INK='#222522'`, `PAPER='#f7f7ef'`, `A='#bbda63'` (green), `BTEAM='#e9977c'` (coral), `C='#a99bd8'` (purple), `WAIT='#ced2cb'`.

Do not use imported photographs or research anew. Work from the existing rules; communicate actual ambiguity to root. An animation may use fewer representative players than suggested group size but must preserve meaningful structure (pairs, team membership, turn order, court zones, scoring conditions). Label it a small example when necessary. Root owns the engine and UI; authors own only their lesson module.
