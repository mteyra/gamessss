import {escapeHTML as esc,FAMILIES} from './core.js';
const ink='#222522',paper='#f2f0e7',lime='#ddf66a',red='#df765c',blue='#9db9d5',pink='#edb4c1';
let serial=0;
const path=(d,stroke=ink,width=2,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle=(x,y,r,fill=paper,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}" stroke-width="2" ${extra}/>`;
const rect=(x,y,w,h,fill='none',r=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${ink}" stroke-width="2" ${extra}/>`;
const label=(x,y,text,extra='')=>`<text x="${x}" y="${y}" fill="${ink}" ${extra}>${esc(text)}</text>`;
const player=(x,y,color=paper,letter='',r=15)=>`<g class="player" transform="translate(${x} ${y})">${circle(2,4,r,ink,'opacity=".17" stroke="none"')}${circle(0,0,r,color)}${letter?label(0,4,letter,'text-anchor="middle" style="font-size:10px;font-weight:700"'):path('M-5 -1v3M5 -1v3',ink,2.5)}</g>`;
const ball=(x,y,r=9)=>`<g>${circle(x,y,r,lime)}${path(`M${x-r+1} ${y-2}q${r} 7 ${r*2-2} 0M${x} ${y-r}q-5 ${r} 0 ${r*2}`,ink,1)}</g>`;
const arrow=(d,id,color=ink)=>path(d,color,2,`stroke-dasharray="5 7" marker-end="url(#${id})"`);
function wrap(content,title='',cls='diagram-svg'){
 const id=`arrow-${serial++}`;return `<svg class="${cls}" viewBox="0 0 500 310" ${title?`role="img" aria-label="${esc(title)}"`:'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg"><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5 0 9" fill="none" stroke="${ink}" stroke-width="1.5"/></marker></defs>${content.replaceAll('ARROW_ID',id)}</svg>`;
}
const court=(split=true)=>`${rect(35,36,430,240,'none',8)}${split?path('M250 36V276',ink,1.5,'stroke-dasharray="5 6"'):''}`;
const hoop=(x,y)=>`${path(`M${x-28} ${y-11}h56`,ink,4)}<ellipse cx="${x}" cy="${y}" rx="18" ry="8" fill="none" stroke="${ink}" stroke-width="2"/>${path(`M${x-15} ${y+2}l5 25h20l5-25M${x-6} ${y+6}l2 21M${x+6} ${y+6}l-2 21`,ink,1)}`;
const cone=(x,y,color=red)=>`<path d="M${x} ${y-14}l-11 25h22z" fill="${color}" stroke="${ink}" stroke-width="2"/>${path(`M${x-15} ${y+12}h30`,ink,2)}`;
const lying=(x,y,c=paper)=>`<g>${rect(x-9,y-3,18,43,c,8)}${circle(x,y-15,10,c)}${path(`M${x-3} ${y+24}v12M${x+3} ${y+24}v12`,ink,1.2)}</g>`;
const star=(x,y,r=18)=>path(`M${x-r} ${y}h${2*r}M${x} ${y-r}v${2*r}M${x-r*.7} ${y-r*.7}l${r*1.4} ${r*1.4}M${x-r*.7} ${y+r*.7}l${r*1.4} -${r*1.4}`,ink,3);
export function heroArt(){
 return `<svg class="hero-court-svg" viewBox="0 0 580 570" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hero-dots" width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="${ink}" opacity=".2"/></pattern><marker id="hero-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L9 5 0 10" fill="none" stroke="${ink}" stroke-width="1.5"/></marker></defs>
 ${rect(58,45,457,470,'#d7ddca',9)}<rect x="59" y="46" width="455" height="468" rx="8" fill="url(#hero-dots)"/>
 ${rect(82,70,409,421,'none',160)}${rect(95,83,383,396,pink,153)}${path('M95 278h383',ink,1.5)}${circle(286,278,70,'none')}
 ${path('M235 88v58h100V86M236 480v-59h100v59',ink,1.5)}
 ${path('M204 180C120 234 157 341 241 332S393 416 425 311 381 145 331 184',ink,2.5,'stroke-dasharray="9 10" marker-end="url(#hero-arrow)"')}
 <g style="transform-origin:286px 278px" class="hero-orbit">${player(182,216,lime,'',26)}${path('M163 236l-13 13M202 233l15 13',ink,4)}</g>
 ${player(380,307,red,'',26)}${path('M361 284l-15-16M399 289l18-12',ink,4)}
 ${player(287,139,paper,'',24)}${player(252,388,paper,'',24)}
 ${ball(359,183,25)}${star(133,365,17)}${star(415,431,16)}
 <g transform="rotate(10 125 125)">${rect(40,102,116,45,lime,2)}<text x="98" y="130" text-anchor="middle" fill="${ink}" font-family="monospace" font-weight="700" font-size="12">YOUR TURN ↗</text></g>
 <g transform="rotate(-5 447 470)">${rect(382,459,154,40,paper,2)}<text x="459" y="484" text-anchor="middle" fill="${ink}" font-family="monospace" font-size="10">NO EXPERIENCE NEEDED</text></g>
 </svg>`;
}
export const islandCaptions=[
 'The cat chases the mouse. Everyone else is paired up.',
 'The mouse slows down and joins one end of an island.',
 'Three is too many. The person at the opposite end is the new mouse!'
];
export function islandsArt(step=0){
 let art=rect(25,28,450,250,'none',16,'stroke-dasharray="4 7" opacity=".35"');
 art+=lying(100,200)+lying(134,200)+lying(336,211)+lying(370,211)+lying(355,74)+lying(389,74);
 art+=lying(177,89)+(step===2?'':lying(211,89));
 if(step===0)art+=player(265,156,lime,'M',18)+player(357,156,red,'C',18)+arrow('M333 142Q301 107 283 137','ARROW_ID')+label(256,194,'MOUSE')+label(345,191,'CAT');
 if(step===1)art+=lying(143,89,lime)+player(255,177,red,'C',18)+arrow('M266 130Q235 42 155 54','ARROW_ID')+label(111,20,'JOIN THIS END')+path('M119 25l15 16',ink,1.5);
 if(step===2)art+=lying(143,89,lime)+player(301,89,lime,'M',18)+player(251,169,red,'C',18)+arrow('M221 84Q249 52 283 72','ARROW_ID')+label(258,40,'NEW MOUSE!')+label(121,153,'TWO. SAFE AGAIN.');
 return wrap(art,`Islands step ${step+1}: ${islandCaptions[step]}`);
}
function dodgeArt(id){
 let s=court()+label(115,22,'TEAM A','text-anchor="middle"')+label(360,22,'TEAM B','text-anchor="middle"');
 s+=[[115,90],[85,193],[193,227]].map(([x,y])=>player(x,y,paper)).join('')+[[380,190],[395,95],[318,221]].map(([x,y])=>player(x,y,red)).join('');
 if(id==='hoop-rescue'){
  s+=hoop(373,65)+ball(226,103)+arrow('M160 166Q253 0 362 50','ARROW_ID')+rect(398,224,58,40,lime,4)+label(427,249,'BACK!','text-anchor="middle" style="font-size:9px"')+label(250,303,'SCORE A BASKET → RESCUE YOUR TEAM','text-anchor="middle" style="font-size:10px"');
 }else if(id==='noodle-keeper'){
  s+=path('M58 117v65M58 117h30M58 182h30',ink,4)+path('M444 117v65M444 117h-30M444 182h-30',ink,4)+player(398,153,lime,'K')+path('M376 147Q371 120 404 122',lime,10)+path('M376 147Q371 120 404 122',ink,1.5)+ball(299,140)+arrow('M206 143L354 146','ARROW_ID')+label(250,303,'DEFEND THE GOAL. MIND THE NOODLE.','text-anchor="middle" style="font-size:10px"');
 }else if(id==='medic-dodgeball'){
  s+=player(323,135,lime,'+',20)+player(364,231,paper,'×')+arrow('M332 154q42 19 34 58','ARROW_ID')+ball(217,132)+label(250,303,'PROTECT THE PLAYER WHO CAN SAVE YOU','text-anchor="middle" style="font-size:10px"');
 }else{
  s+=ball(224,115)+ball(278,186)+arrow('M175 149q85-33 152 3','ARROW_ID');
 }
 return s;
}
function targetArt(id){
 let s=path('M70 249H435',ink,1.5,'stroke-dasharray="4 6"');
 if(id==='flunkyball'){
  s=court()+label(97,22,'THROW / RELAY')+label(318,22,'RESET / STOP');
  s+=rect(241,115,22,69,paper,6)+rect(247,103,10,15,paper,2)+path('M244 150h16',blue,5);
  s+=player(111,163,paper)+player(102,87,paper)+player(112,231,paper)+player(382,101,red)+player(389,219,red)+player(333,157,red)+ball(204,150)+arrow('M148 158h62','ARROW_ID')+arrow('M333 126q-18-48-59-18','ARROW_ID');
  s+=rect(45,123,25,49,lime,4)+circle(56,139,4,ink)+circle(56,155,4,ink);
  s+=label(250,304,'THE FASTER THE RESET, THE FEWER TOKENS','text-anchor="middle" style="font-size:10px"');
 }else if(id==='kubb'||id==='gorodki'){
  s+=rect(140,105,222,105,'none',3,'stroke-dasharray="4 6"');
  for(let i=0;i<5;i++)s+=rect(150+i*46,76,15,37,paper,1);
  s+=rect(243,148,22,47,lime,2)+path('M244 148v-8l6 5 5-10 5 10 5-5v8',ink,2)+rect(242,234,12,48,red,6)+arrow('M255 226q40-56-30-103','ARROW_ID');
  s+=label(250,302,id==='kubb'?'SAVE THE KING FOR LAST':'CLEAR THE FIGURE','text-anchor="middle" style="font-size:10px"');
 }else if(id==='lagori'||id==='castleball'){
  if(id==='lagori'){for(let i=0;i<7;i++)s+=rect(207+i*2,195-i*13,88-i*4,13,i%2?paper:lime,5);}
  else{s+=`<ellipse cx="263" cy="205" rx="85" ry="15" fill="none" stroke="${ink}" stroke-width="3"/>`+path('M184 203Q155 70 257 112Q369 51 340 203M211 204Q189 96 263 111Q333 94 317 204M214 111Q260 93 310 111',ink,3);}
  s+=player(93,210,red)+ball(150,170,12)+arrow('M130 177q28-49 70-27','ARROW_ID')+player(405,159,paper)+arrow('M393 187q-12 40-59 47','ARROW_ID');
  s+=label(250,297,id==='lagori'?'TOPPLE IT. THEN REBUILD IT.':'BUILD. DEFEND. REBUILD.','text-anchor="middle" style="font-size:10px"');
 }else if(id==='tchoukball'){
  s=court(false)+path('M42 179l28-70 30 14-27 72zM400 120l28-13 30 70-29 16z',ink,3)+path('M55 172l31-43M64 180l29-41M408 128l34 44M417 120l32 42',ink,1)+path('M36 67a89 89 0 0 1 0 178M465 66a90 90 0 0 0 0 179',ink,1.5,'stroke-dasharray="5 5"');
  s+=player(221,193,paper)+player(284,92,red)+player(199,83,red)+player(356,212,paper)+ball(106,134)+arrow('M191 180L96 147 170 99','ARROW_ID')+label(250,301,'EITHER TEAM. EITHER REBOUND FRAME.','text-anchor="middle" style="font-size:10px"');
 }else if(['cornhole','kanjam','disc-golf'].includes(id)){
  s+=rect(280,84,104,142,paper,7)+circle(332,118,21,ink)+rect(178,201,27,27,red,5,'transform="rotate(14 191 214)"')+arrow('M191 186Q220 40 313 96','ARROW_ID')+player(120,248,paper);
 }else if(id==='ladder-toss'){
  s+=path('M172 254V74M339 254V74M172 97h167M172 153h167M172 211h167',ink,6)+path('M223 118q23 68 54 0',red,3)+circle(223,118,9,red)+circle(277,118,9,red)+player(90,232,paper);
 }else if(id==='molkky'){
  for(let i=0;i<6;i++){let x=190+(i%3)*40,y=90+Math.floor(i/3)*62;s+=rect(x,y,24,43,i%2?paper:lime,7)+label(x+12,y+21,String(i*2+2),'text-anchor="middle" style="font-size:10px"');}
  s+=rect(113,202,18,65,red,7,'transform="rotate(24 122 232)"')+arrow('M148 206Q164 149 201 153','ARROW_ID');
 }else{
  s+=circle(307,150,81,'none')+circle(307,150,50,'none')+circle(307,150,20,lime)+ball(159,202,14)+ball(251,141,12)+player(85,236,paper)+arrow('M148 178Q198 76 269 114','ARROW_ID');
 }
 return s;
}
export function gameArt(game,{compact=false}={}){
 const id=game.id,d=game.diagram;let s='';
 if(id==='islands')return islandsArt(0);
 if(id==='kin-ball'){
  s=circle(254,157,75,pink)+path('M186 130q66 38 132 5M247 86q-37 76 11 144',ink,2);
  [[183,236,paper],[318,226,paper],[355,111,red],[387,211,red],[152,88,lime],[104,184,lime]].forEach(([x,y,c])=>s+=player(x,y,c));
  s+=rect(314,34,125,39,lime,10)+label(376,59,'“GREEN!”','text-anchor="middle" style="font-size:13px;font-weight:700"')+path('M333 73l-8 18',ink,2);
 }else if(id==='kho-kho'){
  s=court(false)+path('M70 155H429',ink,2)+circle(72,155,8,red)+circle(429,155,8,red);
  for(let i=0;i<6;i++){s+=player(130+i*48,155,paper,i%2?'↓':'↑');}
  s+=player(211,79,lime,'R')+player(363,220,red,'C')+arrow('M338 223Q281 242 232 196','ARROW_ID')+label(227,264,'TAP. “KHO!” GO.','text-anchor="middle"');
 }else if(id==='ki-o-rahi'){
  s=circle(250,155,119,'none')+circle(250,155,83,'none')+circle(250,155,42,'none')+rect(241,139,18,34,lime,4);
  for(let i=0;i<7;i++){let a=i*Math.PI*2/7;s+=cone(250+132*Math.cos(a),155+132*Math.sin(a),paper);}
  s+=player(205,90,red)+player(303,216,red)+player(358,134,paper)+player(159,232,paper)+ball(290,162)+arrow('M309 147L270 150','ARROW_ID');
 }else if(id==='gaga'||id==='roundnet'){
  if(id==='gaga')s+=`<polygon points="180,40 320,40 411,123 411,217 320,279 180,279 90,217 90,123" fill="none" stroke="${ink}" stroke-width="3"/>`;
  else s+=circle(250,158,64,ink)+circle(250,158,58,lime)+path('M208 120l79 79M229 105l70 72M196 142l72 71M196 174l69-69M208 194l79-79M236 211l67-67',ink,1);
  s+=player(146,102,paper)+player(348,224,red)+player(151,215,red)+player(358,99,paper)+ball(290,97)+arrow('M324 81L287 134 290 216','ARROW_ID');
 }else if(['hoop-rescue','noodle-keeper','medic-dodgeball'].includes(id)||d==='dodge')s=dodgeArt(id);
 else if(d==='target'||['flunkyball','kubb','molkky','tchoukball','disc-golf','gorodki'].includes(id))s=targetArt(id);
 else if(d==='net'){
  s=court()+path('M249 36V276',ink,5);
  for(let i=0;i<10;i++)s+=path(`M241 ${44+i*24}h16`,ink,1);
  s+=player(120,154,paper)+player(182,235,paper)+player(365,195,red)+player(336,88,red)+ball(256,97)+arrow('M145 136Q221-4 330 127','ARROW_ID');
  if(['peteca','sepak-takraw','jianzi'].includes(id))s+=label(250,303,id==='peteca'?'PALMS, NOT RACKETS':'FEET, NOT HANDS','text-anchor="middle" style="font-size:10px"');
 }else if(d==='territory'){
  s=court()+rect(36,37,55,238,lime,5,'stroke="none" opacity=".5"')+rect(409,37,55,238,red,5,'stroke="none" opacity=".4"');
  [[133,86],[169,165],[100,237]].forEach(([x,y])=>s+=player(x,y,paper));
  [[345,213],[332,111],[397,156]].forEach(([x,y])=>s+=player(x,y,red));
  s+=arrow('M180 160Q260 70 379 80','ARROW_ID')+ball(260,109);
  if(id==='capture-the-flag')s+=path('M57 125v61M431 125v61',ink,3)+`<path d="M57 125h24l-4 18H57zM431 125h23l-5 18h-18z" fill="${lime}" stroke="${ink}" stroke-width="2"/>`;
 }else if(d==='circle'){
  s=circle(250,157,91,'none','stroke-dasharray="4 7" opacity=".5"');
  for(let i=0;i<8;i++){let a=i*Math.PI/4;s+=player(250+105*Math.cos(a),157+105*Math.sin(a),i%3===0?lime:paper);}
  s+=arrow('M206 116Q264 62 302 121','ARROW_ID')+ball(270,102);
  if(id==='parachute-popcorn')s+=circle(250,158,72,pink)+path('M179 158h142M250 87v142M199 107l102 102M199 209l102-102',ink,1)+ball(234,144)+ball(272,173);
  if(id==='human-knot')s+=path('M166 101l173 103-179 0 161-127-71 176-84-152',ink,3);
 }else if(d==='line'||d==='relay'){
  s=path('M59 228H443',ink,1.5,'stroke-dasharray="5 7"');
  for(let i=0;i<5;i++)s+=player(106+i*73,174,i%2?lime:paper);
  s+=arrow('M93 127Q221 21 393 123','ARROW_ID')+label(250,268,'WATCH THE NEXT MOVE','text-anchor="middle" style="font-size:10px"');
 }else{
  s=court(false);
  [[98,110],[169,220],[315,93],[386,220]].forEach(([x,y])=>s+=player(x,y,paper));
  s+=player(253,173,lime,'M')+player(382,105,red,'C')+arrow('M359 100Q270 29 223 90T238 146','ARROW_ID');
  if(id==='manhunt')s+=player(333,211,red,'C');
  if(id==='sardines')s+=rect(86,66,133,123,lime,12)+player(113,119,paper)+player(152,123,paper)+player(191,117,paper)+label(151,168,'SHHH…','text-anchor="middle"');
 }
 return wrap(s,compact?'':`${game.name}: an illustrative sketch of the main playing mechanic, not a regulation court.`);
}
