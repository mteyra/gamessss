import {P,B,O,Z,L,T,S,ring,INK,PAPER,A,BTEAM,C,WAIT} from './lesson-kit.js';

const frame=(title,text,action,nodes,extra={})=>({title,text,action,nodes,duration:1800,...extra});
const legend=(a='Green team',b='Coral team',c)=>[{color:A,label:a},{color:BTEAM,label:b},...(c?[{color:C,label:c}]:[])];
const court=(label='')=>[Z('court',35,70,570,270,label)];
const netCourt=()=>[...court(),L('net',320,75,320,335,{width:5,dash:'7 5'})];
const trail=(id,points)=>O(id,'path',0,0,{d:points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' '),stroke:INK,width:2,dash:'5 6',fill:'none'});
const score=(a,b,c)=>T('score',320,45,c===undefined?`GREEN ${a} : ${b} CORAL`:`GREEN ${a} · CORAL ${b} · PURPLE ${c}`,{size:16});
const circlePositions=[[320,85],[450,145],[450,270],[320,325],[190,270],[190,145]];
const circlePeople=(prefix='p',team='a')=>circlePositions.map(([x,y],i)=>P(`${prefix}${i+1}`,x,y,team,String(i+1)));
const links=(positions=circlePositions,prefix='link')=>positions.map(([x,y],i)=>{const next=positions[(i+1)%positions.length];return L(`${prefix}${i}`,x,y,next[0],next[1],{stroke:INK,width:3});});
const titled=(base,label)=>S(base,{},[T('instruction',320,370,label,{size:13})],['instruction']);

const tchoukball=(()=>{
  const a=[Z('court',70,70,500,270),O('left-area','path',0,0,{d:'M70 141 A64 64 0 0 1 70 269',stroke:C,dash:'5 5',fill:'none'}),O('right-area','path',0,0,{d:'M570 141 A64 64 0 0 0 570 269',stroke:C,dash:'5 5',fill:'none'}),O('left-frame','net',70,205,{w:25,h:72}),O('right-frame','net',570,205,{w:25,h:72}),P('g1',240,250,'a','1'),P('g2',360,120,'a','2'),P('c1',420,255,'b','1'),P('c2',160,125,'b','2'),B('ball',223,234),score(0,0),T('area-note',320,360,'DASHED AREAS: NO SCORING LANDINGS')];
  const b=S(a,{ball:{x:344,y:111},g1:{x:270,y:220}},[T('limits',320,90,'3 SECONDS · 3 STEPS · 3 TEAM PASSES',{size:12}),trail('pass',[[223,234],[285,140],[344,111]])]);
  const c=S(b,{ball:{x:165,y:143}},[trail('shot',[[344,111],[70,205],[165,143]])],['pass']);
  const d=S(c,{ball:{x:173,y:117},c2:{x:180,y:127}},[T('catch',210,170,'CAUGHT: CORAL ATTACKS',{size:12})],['shot']);
  const e=S(d,{ball:{x:435,y:135},c2:{x:245,y:140}},[trail('coral-shot',[[173,117],[570,205],[435,135]]),ring('landing',435,135,22,{stroke:BTEAM}),T('land-label',410,98,'REBOUND LANDS +1',{size:12}),score(0,1)],['score','catch']);
  const f=S(e,{g1:{x:598,y:285},ball:{x:580,y:270},g2:{x:390,y:115}},[T('restart',490,315,'GREEN RESTART',{size:12})],['coral-shot','landing','land-label']);
  const g=S(f,{ball:{x:92,y:217}},[ring('fault',92,217,23,{stroke:BTEAM}),T('fault-label',190,300,'INSIDE THE AREA: CORAL +1',{size:12}),score(0,2)],['score','restart']);
  return {summary:'Make a frame rebound land in court where nobody catches it.',legend:legend('Green','Coral','No-score area'),steps:[
    frame('Two frames, either end','Both teams may shoot at either frame. The marked semicircles are not scoring landing areas. This drawing uses a small example.','Place the frames',a),
    frame('Pass without interference','Defenders do not intercept or block passes. Hold for at most three seconds, take at most three steps, and shoot within three team passes.','Pass to a teammate',b,{tracks:[{id:'ball',points:[[223,234],[285,140],[344,111]]}]}),
    frame('Shoot, then watch the rebound','Green shoots at the left frame. The rebound is still live: coral can catch it before it lands outside the semicircle.','Hit the frame',c,{tracks:[{id:'ball',points:[[344,111],[70,205],[165,143]]}]}),
    frame('A catch changes the attack','Coral catches the rebound. There is no point. Coral now attacks, with the same passing and shooting limits.','Catch the rebound',d,{focus:[180,127]}),
    frame('An uncaught rebound scores','Coral shoots at the other frame. This rebound lands in court outside its semicircle, so coral scores one.','Let the rebound land',e,{tracks:[{id:'ball',points:[[173,117],[570,205],[435,135]]}]}),
    frame('The conceding team restarts','Green restarts behind that baseline. After three consecutive shots at one frame, the next shot must use the other frame.','Restart with green',f),
    frame('A bad landing rewards opponents','A shot landing inside the semicircle gives opponents one point. Missing the frame or rebounding out does too. A dropped pass instead changes possession.','See a shooting fault',g,{tracks:[{id:'ball',points:[[580,270],[360,110],[70,205],[92,217]]}]})
  ]};
})();

const kinBall=(()=>{
  const a=[...court(),P('g1',200,195,'a','1'),P('g2',245,160,'a','2'),P('g3',280,205,'a','3'),P('g4',245,255,'a','4'),P('c1',440,145,'b','1'),P('c2',485,180,'b','2'),P('c3',475,235,'b','3'),P('c4',420,245,'b','4'),P('p1',95,110,'c','1'),P('p2',125,160,'c','2'),P('p3',110,260,'c','3'),P('p4',150,295,'c','4'),B('ball',240,195,{r:37,fill:PAPER}),score(0,0,0)];
  const b=S(a,{},[T('call',330,88,'“OMNIKIN, CORAL!”',{size:18}),T('hitter',300,280,'4 HITS',{size:12})]);
  const c=S(b,{ball:{x:448,y:195},g4:{x:280,y:245}},[trail('flight',[[240,195],[340,115],[448,195]]),T('distance',345,320,'OUTWARD / UPWARD · AT LEAST 3 m',{size:12})],['hitter']);
  const d=S(c,{c1:{x:411,y:190},c2:{x:449,y:160},c3:{x:486,y:202},c4:{x:450,y:265},ball:{x:450,y:200}},[T('caught',440,295,'CORAL CONTROLS IT',{size:12})],['flight','call']);
  const e=S(d,{ball:{x:140,y:215}},[T('call',350,85,'“OMNIKIN, PURPLE!”',{size:18}),trail('flight',[[450,200],[320,100],[140,215]])],['caught']);
  const f=S(e,{ball:{x:140,y:305},p4:{x:200,y:280}},[ring('floor',140,305,45,{stroke:C}),T('miss',320,355,'PURPLE MISSES · BOTH OTHER TEAMS +1',{size:12}),score(1,1,0)],['score','flight','call']);
  const g=S(f,{ball:{x:140,y:215},p1:{x:100,y:215},p2:{x:140,y:180},p3:{x:180,y:220},p4:{x:140,y:275}},[T('restart',320,355,'PURPLE SUPPORTS, CALLS, THEN HITS',{size:12})],['floor','miss']);
  return {summary:'The called colour must control the giant ball before it touches the floor.',legend:legend('Green: four players','Coral: four players','Purple: four players'),steps:[
    frame('Three teams surround one ball','Each colour has four players. Three green players support the ball; the fourth prepares to hit.','Build the three teams',a),
    frame('Call before the hit','The hitter calls “Omnikin” and another team’s colour. Only that called team must make the catch.','Call coral',b),
    frame('Send the ball outward','Hit outward or upward, never downward. This introduction requires at least three metres of travel. Give the called team room.','Send it to coral',c,{tracks:[{id:'ball',points:[[240,195],[340,115],[448,195]]}]}),
    frame('Catch, support, prepare again','Coral controls the ball before it lands. Coral’s players now support it and prepare their next hit. Rotate hitters within each team.','Control the giant ball',d),
    frame('Choose the next receivers','Coral calls purple before sending the ball away. Green and coral leave purple space to catch.','Call purple',e,{tracks:[{id:'ball',points:[[450,200],[320,100],[140,215]]}]}),
    frame('A miss scores for both rivals','The ball reaches the floor before purple controls it. Green and coral each score one point.','Watch the scoring consequence',f),
    frame('The faulting team restarts','Purple supports the ball and starts again. After ten minutes, the highest score wins; a tie may stand.','Restart with purple',g)
  ]};
})();

const ultimate=(()=>{
  const a=[...court(),Z('green-end',35,70,80,270,'GREEN','#e2ebc7'),Z('coral-end',525,70,80,270,'CORAL','#f3d7cb'),P('g1',115,145,'a','1'),P('g2',115,240,'a','2'),P('g3',115,305,'a','3'),P('c1',525,135,'b','1'),P('c2',525,235,'b','2'),P('c3',525,300,'b','3'),O('disc','disc',505,120,{r:10,fill:PAPER}),score(0,0)];
  const b=S(a,{g1:{x:180,y:145},g2:{x:270,y:270},g3:{x:350,y:115},c1:{x:235,y:145},c2:{x:370,y:250},c3:{x:470,y:140},disc:{x:167,y:125}},[trail('pull',[[505,120],[345,85],[167,125]])]);
  const c=S(b,{g2:{x:350,y:280},disc:{x:167,y:125}},[ring('pivot',180,145,25,{stroke:A}),T('stop',180,193,'STOP + PIVOT',{size:12}),T('stall',240,105,'1…2… UP TO 10',{size:12})],['pull']);
  const d=S(c,{g3:{x:550,y:135},disc:{x:535,y:119}},[trail('pass',[[167,125],[360,80],[535,119]]),T('goal',550,190,'CATCH +1',{size:14}),score(1,0)],['pivot','stop','stall','score']);
  const e=S(d,{g1:{x:525,y:145},g2:{x:525,y:240},g3:{x:525,y:305},c1:{x:115,y:135},c2:{x:115,y:235},c3:{x:115,y:300},disc:{x:505,y:130}},[T('switch',320,205,'CHANGE ENDS',{size:16})],['pass','goal']);
  const f=S(e,{c1:{x:210,y:140},c2:{x:320,y:265},g1:{x:350,y:140},disc:{x:370,y:290}},[ring('drop',370,290,25,{stroke:A}),T('turnover',360,330,'DROP: GREEN POSSESSION',{size:12})],['switch']);
  return {summary:'Catch a teammate’s pass inside the opponents’ end zone.',legend:legend(),steps:[
    frame('Start behind the end-zone lines','Coral defends and holds the opening disc. Green attacks the end zone at the right.','Set the end zones',a),
    frame('The defence throws the pull','Coral throws to green to start the point. Green teammates spread out to offer passing options.','Throw the opening disc',b,{tracks:[{id:'disc',points:[[505,120],[345,85],[167,125]]}]}),
    frame('Catch, stop, and pivot','The holder cannot run with the disc. A nearby marker counts ten seconds aloud while teammates move into space.','Find a passing option',c),
    frame('Catch inside the end zone','Green 3 catches a teammate’s pass inside the coral end zone. Green scores one point.','Throw the scoring pass',d,{tracks:[{id:'disc',points:[[167,125],[360,80],[535,119]]},{id:'g3',points:[[350,115],[450,115],[550,135]],end:.75}]}),
    frame('Switch ends after each point','The scoring team now throws the next opening disc. Both teams change ends.','Reset for coral’s attack',e),
    frame('A failed pass changes possession','After the next pull, coral drops a pass. Green takes possession immediately. Interceptions, out-of-bounds passes and a completed ten-count also turn it over.','See a turnover',f)
  ]};
})();

const jugger=(()=>{
  const a=[...court(),O('goal-g','hoop',65,205,{r:20}),O('goal-c','hoop',575,205,{r:20}),P('gr',100,205,'a','R'),P('gs1',105,110,'a','1'),P('gs2',105,155,'a','2'),P('gs3',105,260,'a','3'),P('gs4',105,305,'a','4'),P('cr',540,205,'b','R'),P('cs1',535,110,'b','1'),P('cs2',535,155,'b','2'),P('cs3',535,260,'b','3'),P('cs4',535,305,'b','4'),B('ball',320,205),score(0,0)];
  const b=S(a,{gr:{x:300,y:200},ball:{x:315,y:185},cr:{x:380,y:225},gs2:{x:275,y:130},cs2:{x:330,y:140},gs3:{x:270,y:285},cs3:{x:370,y:280}});
  const c=S(b,{gs2:{fill:WAIT,pose:'seated'},cs2:{x:300,y:150}},[L('foam',300,150,277,140,{stroke:BTEAM,width:8}),T('beats',235,95,'1…2…3…4…5',{size:13})]);
  const d=S(c,{gr:{x:355,y:200,fill:WAIT,pose:'seated'},ball:{x:375,y:215},cr:{x:410,y:225},cs3:{x:365,y:245}},[L('foam2',365,245,360,215,{stroke:BTEAM,width:8}),T('drop',430,185,'RUNNER TAGGED: DROP',{size:12})]);
  const e=S(d,{cr:{x:85,y:205},ball:{x:66,y:205},gs2:{fill:A,pose:undefined,x:300,y:130}},[trail('runner-path',[[410,225],[375,215],[240,230],[85,205],[66,205]]),T('point',100,255,'CORAL +1',{size:15}),score(0,1)],['score','foam','foam2','beats','drop']);
  const f=S(a,{},[score(0,1),T('rotate',320,365,'ROTATE RUNNERS BETWEEN POINTS',{size:13})],['score']);
  return {summary:'Only the unarmed runner can carry the ball into the opposing ground goal.',legend:legend('Green: R + four spar players','Coral: R + four spar players'),steps:[
    frame('Choose the unarmed runners','R marks each team’s runner. Spar players use inspected padded equipment for gentle tags below the shoulders. This introduction excludes chains, wrestling and pinning.','Choose roles',a),
    frame('Runners collect the centre ball','On “Jugger!”, runners approach the ball. Only a runner may pick it up, carry it or place it in a goal.','Run for the ball',b,{tracks:[{id:'gr',points:[[100,205],[220,205],[300,200]]}]}),
    frame('A gentle tag pauses a player','A tagged spar player raises a hand and sits or kneels if comfortable. Count five audible beats, one-and-a-half seconds apart, before rejoining.','Tag a spar player',c),
    frame('A tagged runner drops immediately','Green’s runner is tagged and puts the ball down immediately. Nobody may grab a body or block a player with their body.','Tag the ball carrier',d),
    frame('A runner places the ball','Coral’s active runner collects the loose ball and places it in green’s goal. Coral scores one. The five-beat player can now rejoin.','Carry to the ground goal',e,{tracks:[{id:'cr',points:[[410,225],[375,215],[240,230],[85,205]]},{id:'ball',points:[[375,215],[240,230],[100,190],[66,205]],start:.2}]}),
    frame('Reset everyone after a point','Return to the baselines with the ball at centre. Rotate runners. First to three points wins this introductory match.','Reset the point',f)
  ]};
})();

const roundnet=(()=>{
  const a=[ring('clear',320,210,140,{stroke:WAIT,dash:'4 6'}),O('net','net',320,210,{w:100,h:55,r:48}),P('g1',180,210,'a','1'),P('g2',390,315,'a','2'),P('c1',465,210,'b','1'),P('c2',260,95,'b','2'),B('ball',195,192),score(0,0),T('space',320,375,'CLEAR SPACE ALL AROUND',{size:12})];
  const b=S(a,{ball:{x:450,y:195}},[trail('serve',[[195,192],[320,210],[450,195]])]);
  const c=S(b,{ball:{x:300,y:102},c2:{x:300,y:120}},[T('touch',485,155,'1',{size:18}),T('touch2',300,75,'2',{size:18}),trail('set',[[450,195],[380,95],[300,102]])],['serve']);
  const d=S(c,{c1:{x:390,y:135},ball:{x:240,y:290},g1:{x:245,y:320},g2:{x:190,y:235}},[trail('return',[[300,102],[375,125],[320,210],[240,290]]),T('touch3',425,105,'3 → NET',{size:13})],['set']);
  const e=S(d,{ball:{x:150,y:285}},[ring('ground',150,285,24,{stroke:BTEAM}),score(0,1),T('point',155,325,'GROUND: CORAL +1',{size:12})],['score','return','touch','touch2','touch3']);
  const f=S(a,{g1:{x:465,y:210},c1:{x:180,y:210},ball:{x:195,y:192}},[score(0,1),T('server',180,255,'CORAL SERVES',{size:12})],['score']);
  return {summary:'Use up to three alternating touches to bounce the ball off the round net.',legend:legend(),steps:[
    frame('Two pairs, one round net','The server faces the receiver. Leave clear space in every direction; there are no fixed sides after the serve.','Stand around the net',a),
    frame('Serve down onto the net','Green strikes down onto the net. The rebound travels towards coral’s receiver.','Serve to coral',b,{tracks:[{id:'ball',points:[[195,192],[320,210],[450,195]]}]}),
    frame('Alternate your team’s touches','Coral 1 sends the ball to coral 2. These are touches one and two. Nobody catches or carries the ball.','Use two touches',c,{tracks:[{id:'ball',points:[[450,195],[380,95],[300,102]]}]}),
    frame('Return by the third touch','Coral 2 sets to coral 1, who uses touch three to hit the net. Green moves around it to receive. Give opponents room.','Send the third touch back',d,{tracks:[{id:'ball',points:[[300,102],[375,125],[320,210],[240,290]]}]}),
    frame('A ground touch ends the rally','Green cannot return the ball before it lands. Coral scores one. Rim hits, double net bounces and too many touches also lose the rally.','Let the ball land',e),
    frame('The point winner serves','Coral serves next. Alternate your team’s server when regaining service. Play to eleven, winning by two.','Reset the serve',f)
  ]};
})();

const danishLongball=(()=>{
  const a=[...court(),Z('home',65,150,60,110,'HOME','#e2ebc7'),Z('far',500,150,65,110,'FAR','#e2ebc7'),P('bat',105,205,'a','1'),P('next',75,305,'a','2'),P('pitch',265,205,'b','P'),P('f1',375,130,'b','1'),P('f2',435,280,'b','2'),O('bat-object','block',125,220,{w:9,h:50,rotate:-35,fill:'#cda878'}),B('ball',249,188),T('score',320,45,'RUNS 0 · OUTS 0',{size:16})];
  const b=S(a,{ball:{x:390,y:100},bat:{x:340,y:210},'bat-object':{x:105,y:250,rotate:90}},[trail('hit',[[249,188],[117,201],[390,100]]),L('run',150,225,470,225,{arrow:true,dash:'5 5'}),ring('bounce',390,100,18,{stroke:WAIT}),T('bounce-label',450,85,'BOUNCED FIRST',{size:10})]);
  const c=S(b,{bat:{x:532,y:205},f1:{x:390,y:130},ball:{x:403,y:115}},[T('safe',530,295,'WAIT SAFELY',{size:12})],['hit','run','bounce','bounce-label']);
  const d=S(c,{bat:{x:325,y:245},ball:{x:249,y:188}},[T('freeze',270,110,'“FREEZE!”',{size:18}),trail('field-return',[[403,115],[249,188]])],['safe']);
  const e=S(d,{bat:{x:532,y:205}},[T('last-base',430,295,'BACK TO LAST SAFE BASE',{size:12})],['field-return']);
  const f=S(e,{bat:{x:90,y:205},next:{x:115,y:275},ball:{x:435,y:280}},[T('score',320,45,'RUNS 1 · OUTS 0',{size:16}),trail('return-run',[[532,205],[350,290],[90,205]])],['score','freeze','last-base']);
  const g=S(f,{next:{x:360,y:270,fill:WAIT},f2:{x:388,y:270},ball:{x:372,y:255}},[T('out',385,325,'BALL-IN-HAND TAG: OUT',{size:12}),T('score',320,45,'RUNS 1 · OUTS 1',{size:16})],['score','return-run']);
  return {summary:'Run to the far base and back home to score, avoiding catches and ball-in-hand tags.',legend:legend('Batting team','Fielding team'),steps:[
    frame('Mark home and the far base','Choose batting order and a pitcher. Keep waiting players outside the bat area.','Set the bases',a),
    frame('One swing, then run','The pitcher tosses underarm. After one swing, hit or miss, put the bat down and run to the far base.','Swing and run',b,{tracks:[{id:'ball',points:[[249,188],[117,201],[390,100]]},{id:'bat',points:[[105,205],[220,225],[340,210]],start:.25}]}),
    frame('The far base is safe','The runner reaches safety while a fielder retrieves the bounced ball. An airborne catch would put the batter out. The runner may wait at this base.','Reach the far base',c),
    frame('The pitcher can freeze play','The runner starts home. Fielders return the ball to the pitcher, who calls “Freeze”.','Return the fielded ball',d,{tracks:[{id:'ball',points:[[403,115],[249,188]]}]}),
    frame('Return to the last safe base','In this version, the untagged runner returns to the far base. Wait until play is live to try again.','Apply the freeze rule',e),
    frame('An out-and-back scores one','On a later live play, the runner commits to coming home and completes the return. That scores one run.','Run all the way home',f,{tracks:[{id:'bat',points:[[532,205],[350,290],[90,205]]}]}),
    frame('Fielders tag with ball in hand','The next runner is gently tagged between bases and is out. Never throw at runners. Three outs switch teams and clear waiting runners.','See an out',g)
  ]};
})();

const newcomb=(()=>{
  const a=[...netCourt(),P('g1',25,200,'a','1'),P('g2',225,125,'a','2'),P('g3',230,285,'a','3'),P('c1',455,160,'b','1'),P('c2',470,265,'b','2'),P('c3',575,215,'b','3'),B('ball',40,183),score(0,0)];
  const b=S(a,{ball:{x:442,y:143}},[trail('serve',[[40,183],[320,100],[442,143]])]);
  const c=S(b,{},[ring('stay',455,160,27,{stroke:BTEAM}),T('count',480,110,'≤ 3 SECONDS',{size:12})],['serve']);
  const d=S(c,{ball:{x:216,y:268}},[trail('return',[[442,143],[320,110],[216,268]])],['stay','count']);
  const e=S(d,{ball:{x:515,y:105}},[ring('landing',515,105,23,{stroke:A}),T('point',510,75,'GREEN +1',{size:14}),score(1,0)],['score','return']);
  const f=S(a,{},[score(1,0),T('serve-label',150,355,'GREEN WON THE POINT: GREEN SERVES',{size:12})],['score']);
  return {summary:'Catch the ball and throw it directly back before three seconds pass.',legend:legend(),steps:[
    frame('Spread out on each side','A low net divides the court. Green’s server begins behind the back line.','Set up the court',a),
    frame('Throw a serve over the net','Coral catches the serve before it lands. Newcomb uses catches and throws instead of volleyball contacts.','Throw the serve',b,{tracks:[{id:'ball',points:[[40,183],[320,100],[442,143]]}]}),
    frame('Stay where you catch','The catcher stays in place, with feet on the ground, and must throw back within three seconds. No blocking or spiking.','Start the three-second limit',c),
    frame('Return directly to opponents','Coral throws directly over the net. This starter version does not allow passes between teammates.','Throw straight back',d,{tracks:[{id:'ball',points:[[442,143],[320,110],[216,268]]}]}),
    frame('Make the return land inside','Green catches, then returns into an empty part of coral’s court. It lands inside: green scores one. Drops, net throws and out-balls lose a point.','Find an empty space',e,{tracks:[{id:'ball',points:[[216,268],[320,140],[515,105]]}]}),
    frame('Serve after winning the point','Green serves again. Rotate the server when your team gains service so everyone has a turn. First to eleven wins; nobody goes out.','Prepare the next serve',f)
  ]};
})();

const endball=(()=>{
  const a=[...court(),Z('left-end',35,70,55,270,'C','#f3d7cb'),Z('right-end',550,70,55,270,'G','#e2ebc7'),P('g1',150,240,'a','1'),P('g2',280,120,'a','2'),P('g3',430,260,'a','3'),P('gc',578,190,'a','C'),P('c1',245,235,'b','1'),P('c2',420,155,'b','2'),P('cc',62,205,'b','C'),B('ball',133,224),score(0,0),T('touches',320,365,'GREEN TOUCHES: 1 ✓ · 2 — · 3 —',{size:12})];
  const b=S(a,{ball:{x:263,y:104}},[T('touches',320,365,'GREEN TOUCHES: 1 ✓ · 2 ✓ · 3 —',{size:12}),trail('pass',[[133,224],[220,110],[263,104]])],['touches']);
  const c=S(b,{g3:{x:450,y:280},ball:{x:433,y:264}},[T('touches',320,365,'GREEN TOUCHES: 1 ✓ · 2 ✓ · 3 ✓',{size:12}),trail('pass2',[[263,104],[350,210],[433,264]])],['touches','pass']);
  const d=S(c,{gc:{x:578,y:275},ball:{x:564,y:260}},[trail('score-pass',[[433,264],[564,260]]),score(1,0),T('catch',515,315,'LEGAL CATCH +1',{size:12})],['score','pass2']);
  const e=S(d,{g1:{x:578,y:190,label:'C'},gc:{x:450,y:280,label:'1'},c1:{x:480,y:240},ball:{x:464,y:224}},[T('restart',320,365,'ROTATE GREEN CATCHER · CORAL RESTARTS',{size:12})],['touches','score-pass','catch']);
  const f=S(e,{ball:{x:360,y:125},g2:{x:373,y:141}},[T('intercept',320,85,'INTERCEPTION: GREEN BALL',{size:12})]);
  return {summary:'Include every court teammate before passing to your catcher behind the end line.',legend:legend('Green, attacking right','Coral, attacking left'),steps:[
    frame('Put catchers behind opposite lines','Each team has a catcher behind the far end line. The other players stay inside the court.','Place the end-line catchers',a),
    frame('Pass and stay still','Green 1 passes underarm to green 2. The holder stays still. Defenders can intercept passes, but cannot touch the holder or their held ball.','Pass to green 2',b,{tracks:[{id:'ball',points:[[133,224],[220,110],[263,104]]}]}),
    frame('Include every court teammate','Green 3 receives next. All three court players in this small example have now touched the ball, so a scoring pass becomes legal.','Include green 3',c,{tracks:[{id:'ball',points:[[263,104],[350,210],[433,264]]}]}),
    frame('Find the end-line catcher','The catcher moves along the line while staying behind it. A caught legal pass scores one.','Pass beyond the end line',d,{tracks:[{id:'ball',points:[[433,264],[564,260]]}]}),
    frame('Rotate the catcher and restart','Green rotates its catcher. Coral receives the restart and must include all its court players before scoring.','Give coral the ball',e),
    frame('An interception turns it over','Green intercepts a coral pass. Green starts a new possession. Dropped passes and out-balls also give the opponents possession.','Intercept the next pass',f)
  ]};
})();

const speedball=(()=>{
  const a=[...court(),Z('end-g',35,70,70,270,'END','#e2ebc7'),Z('end-c',535,70,70,270,'END','#f3d7cb'),O('cone1','cone',580,165),O('cone2','cone',580,245),O('cone3','cone',60,165),O('cone4','cone',60,245),P('g1',215,245,'a','1'),P('g2',350,115,'a','2'),P('g3',475,270,'a','3'),P('c1',330,240,'b','1'),P('c2',485,160,'b','2'),B('ball',235,260),score(0,0),T('mode',320,365,'GROUND BALL: FEET ONLY',{size:14})];
  const b=S(a,{ball:{x:330,y:108}},[trail('loft',[[235,260],[275,130],[330,108]])]);
  const c=S(b,{ball:{x:337,y:99}},[T('mode',320,365,'AIR BALL: THROW + CATCH',{size:14}),T('limit',355,75,'3 SECONDS / 3 STEPS',{size:12})],['mode','loft']);
  const d=S(c,{g3:{x:565,y:285},ball:{x:551,y:270}},[trail('pass',[[337,99],[440,170],[551,270]]),score(1,0),T('catch',490,315,'END-ZONE CATCH +1',{size:12})],['score','limit']);
  const e=S(d,{c1:{x:320,y:205},ball:{x:305,y:188}},[T('restart',320,90,'CORAL FREE PASS AT CENTRE',{size:13})],['pass','catch']);
  const f=S(e,{c1:{x:260,y:230},ball:{x:275,y:250}},[T('mode',320,365,'DROPPED BALL: FEET ONLY AGAIN',{size:14})],['mode','restart']);
  const g=S(f,{ball:{x:60,y:205}},[trail('kick',[[275,250],[160,225],[60,205]]),score(1,3),T('goal',170,310,'GROUND GOAL +3',{size:14})],['score']);
  return {summary:'The ball’s position changes the rules: kick on the ground, pass after an airborne catch.',legend:legend(),steps:[
    frame('Ground balls use feet','Dribble or kick a ball on the ground. Nobody may simply pick it up. Cone goals and end zones offer different scoring routes.','Start with a ground ball',a),
    frame('Kick into a controlled catch','Green lofts a controlled kick towards a teammate. The receiver must catch it before it touches the ground.','Loft the ball',b,{tracks:[{id:'ball',points:[[235,260],[275,130],[330,108]]}]}),
    frame('Now throwing is allowed','The airborne catch changes the ball to aerial play. The holder must pass, shoot or drop within three seconds or three steps.','Catch and change modes',c),
    frame('An end-zone catch scores one','Green 3 catches a teammate’s pass in the opposing end zone. Green scores one.','Pass for one point',d,{tracks:[{id:'ball',points:[[337,99],[440,170],[551,270]]}]}),
    frame('Opponents restart at centre','Coral takes a free pass at centre after the score.','Restart with coral',e),
    frame('A drop restores feet-only play','Coral drops the aerial ball. It is a ground ball again immediately; coral must now kick it.','Drop into ground play',f),
    frame('A ground goal scores three','Coral kicks the ground ball between the opposing goal cones. Coral scores three, then green restarts at centre.','Kick for three points',g,{tracks:[{id:'ball',points:[[275,250],[160,225],[60,205]]}]})
  ]};
})();

const korfball=(()=>{
  const a=[...court(),L('half-line',320,75,320,335,{width:2,dash:'5 5'}),O('basket-left','hoop',120,205,{r:24}),O('basket-right','hoop',520,205,{r:24}),P('ga',425,135,'a','A'),P('ga2',425,280,'a','B'),P('cd',470,175,'b','A'),P('cd2',470,280,'b','B'),P('gd',205,130,'a','D'),P('ca',220,260,'b','A'),B('ball',410,120),score(0,0),T('halves',320,365,'STAY IN YOUR ASSIGNED HALF',{size:13})];
  const b=S(a,{cd:{x:448,y:155}},[L('reach',448,155,425,135,{stroke:BTEAM,width:3}),T('defended',465,95,'MATCHED DEFENDER IN REACH',{size:11})]);
  const c=S(b,{ball:{x:520,y:205}},[T('no-goal',450,245,'DEFENDED SHOT: NO GOAL',{size:12})]);
  const d=S(c,{ball:{x:207,y:245}},[T('turnover',175,305,'CORAL POSSESSION',{size:12})],['reach','defended','no-goal']);
  const e=S(d,{ball:{x:120,y:205}},[score(0,1),T('point',175,305,'UNDEFENDED SHOT +1',{size:12})],['score','turnover']);
  const f=S(e,{ball:{x:520,y:205},cd:{x:375,y:100}},[score(1,1),T('second',420,245,'SECOND TOTAL GOAL',{size:12})],['score','point']);
  const g=S(f,{ga:{x:180,y:135,label:'D'},ga2:{x:180,y:280,label:'D'},cd:{x:240,y:155,label:'A'},cd2:{x:240,y:280,label:'B'},gd:{x:430,y:130,label:'A'},ca:{x:425,y:260,label:'D'},ball:{x:335,y:190}},[T('swap',320,365,'TWO TOTAL GOALS: SWAP HALVES + ROLES',{size:12})],['halves','second']);
  return {summary:'Find an undefended basket shot while staying in your assigned half.',legend:legend(),steps:[
    frame('Assign halves and matched defenders','A full team has four attackers in one half and four defenders in the other. This small drawing shows the roles, with agreed defending pairs.','Assign the halves',a),
    frame('Recognise a defended shot','Coral A faces green A, stands between player and basket, is within arm’s reach, and actively blocks. All four conditions matter.','Bring the defender into reach',b),
    frame('A defended basket does not score','Green shoots anyway. Even though the ball goes through, a defended shot gives possession to the defence.','Try the defended shot',c),
    frame('Pass to the attacking half','Coral passes towards its attackers. Players stay in their assigned halves and cannot run or dribble while holding the ball.','Move possession by passing',d),
    frame('An undefended basket scores one','Coral’s attacker shoots without a qualifying defender and scores. Green receives a centre restart.','Take the open shot',e),
    frame('Count goals across both teams','On the next attack, green scores an undefended basket. There have now been two total goals: one by each team.','Score the second total goal',f,{tracks:[{id:'ball',points:[[120,205],[320,205],[410,120],[520,205]]}]}),
    frame('Swap halves after two goals','Both teams exchange attacking and defending halves after every two total goals. The conceding team restarts at centre.','Exchange roles',g)
  ]};
})();

const sittingVolleyball=(()=>{
  const a=[...netCourt(),P('g1',25,205,'a','1',{pose:'seated'}),P('g2',230,135,'a','2',{pose:'seated'}),P('g3',220,280,'a','3',{pose:'seated'}),P('c1',355,190,'b','1',{pose:'seated'}),P('c2',470,125,'b','2',{pose:'seated'}),P('c3',470,290,'b','3',{pose:'seated'}),B('ball',40,180),score(0,0),T('floor',320,365,'TORSO CONTACT WITH FLOOR',{size:13})];
  const b=S(a,{ball:{x:340,y:165}},[trail('serve',[[40,180],[240,100],[340,165]]),T('block',390,220,'SERVE BLOCK ALLOWED',{size:12})]);
  const c=S(b,{ball:{x:180,y:240},g3:{x:190,y:265}},[trail('blocked',[[340,165],[250,185],[180,240]])],['serve','block']);
  const d=S(c,{ball:{x:230,y:120},g1:{x:135,y:215}},[T('touches',160,90,'1 → 2 → 3',{size:14}),trail('set',[[180,240],[135,200],[230,120]])],['blocked']);
  const e=S(d,{ball:{x:565,y:280}},[trail('attack',[[230,120],[320,90],[565,280]]),ring('land',565,280,23,{stroke:A}),score(1,0)],['score','set','touches']);
  const f=S(a,{},[score(1,0),T('next',320,365,'GREEN WON THE RALLY: GREEN SERVES',{size:12})],['score','floor']);
  return {summary:'Keep floor contact while using up to three team touches to send the ball over a low net.',legend:legend(),steps:[
    frame('Begin seated on a smooth court','The server waits behind the end line. In this introduction, keep part of your torso on the floor when playing the ball.','Set up seated teams',a),
    frame('The serve may be blocked','Green serves. Unlike standing volleyball, coral may block the serve at the net.','Serve towards the block',b,{tracks:[{id:'ball',points:[[40,180],[240,100],[340,165]]}]}),
    frame('Move along the floor','Coral’s block sends the ball back. Green moves along the floor to cover its landing path.','Cover the rebound',c,{tracks:[{id:'ball',points:[[340,165],[250,185],[180,240]]}]}),
    frame('Use up to three contacts','Green keeps the ball up with separate contacts. No catching or throwing; consecutive touches by one player are normally faults.','Build a three-touch return',d,{tracks:[{id:'ball',points:[[180,240],[135,200],[230,120]]}]}),
    frame('Every rally awards a point','Green returns the ball into coral’s court, where it lands. Green scores one. Faults and out-balls also award the opponents a point.','Land the return inside',e,{tracks:[{id:'ball',points:[[230,120],[320,90],[565,280]]}]}),
    frame('The point winner serves next','Green serves next. Rotate the serving order when service changes teams. The introductory set ends at fifteen with a two-point lead.','Prepare the next rally',f)
  ]};
})();

const hooverball=(()=>{
  const a=[...netCourt(),Z('gback',35,70,135,270,'BACK','#e2ebc7'),Z('gfront',170,70,150,270,'FRONT','#edf1df'),Z('cfront',320,70,150,270,'FRONT','#fae8df'),Z('cback',470,70,135,270,'BACK','#f3d7cb'),L('net-top',320,75,320,335,{width:5,dash:'7 5'}),P('g1',25,230,'a','1'),P('g2',230,140,'a','2'),P('c1',400,200,'b','1'),P('c2',540,280,'b','2'),B('ball',40,212),score(0,0)];
  const b=S(a,{ball:{x:386,y:183}},[trail('serve',[[40,212],[320,115],[386,183]])]);
  const c=S(b,{ball:{x:120,y:260},g1:{x:135,y:278}},[trail('deep-return',[[386,183],[320,110],[120,260]]),T('deep',210,305,'FRONT CATCH → OPPOSITE BACK',{size:11})],['serve']);
  const d=S(c,{ball:{x:383,y:183}},[trail('choice',[[120,260],[300,105],[383,183]]),T('choice-label',130,100,'BACK CATCH: EITHER HALF',{size:10})],['deep-return','deep']);
  const e=S(d,{ball:{x:245,y:200}},[ring('short',245,200,24,{stroke:A}),T('fault',210,315,'FRONT → FRONT IS SHORT',{size:12}),score(1,0)],['score','choice','choice-label']);
  const f=S(a,{g1:{x:230,y:140},g2:{x:25,y:230}},[score(1,0),T('rotate',320,365,'ROTATE GREEN’S SERVER',{size:13})],['score']);
  return {summary:'Catch and throw straight back; a front-half catch must be returned into the opponents’ back half.',legend:legend(),steps:[
    frame('Mark front and back halves','Use a comfortable net height and a light ball for this version. Divide both sides into front and back halves.','Mark the four zones',a),
    frame('Throw the serve over','Green serves from behind the back line. Coral catches it in the front half.','Serve to the front half',b,{tracks:[{id:'ball',points:[[40,212],[320,115],[386,183]]}]}),
    frame('A front catch must go deep','Coral returns directly from the catch position into green’s back half. No running or passing to teammates.','Return into the back half',c,{tracks:[{id:'ball',points:[[386,183],[320,110],[120,260]]}]}),
    frame('A back catch has both options','Green caught in the back half, so its return may reach either coral half. Green chooses the front again.','Choose either opposing half',d,{tracks:[{id:'ball',points:[[120,260],[300,105],[383,183]]}]}),
    frame('A short front return is a fault','Coral catches in front but returns into green’s front half. That is too short: green scores one. Drops, net throws and out-balls also lose points.','See the short-return fault',e),
    frame('Rotate the rally winner’s server','Green won the rally and serves. Rotate its server after this point. Play to eleven with a two-point lead.','Start the next rally',f)
  ]};
})();

const hoopPass=(()=>{
  const a=[...links(),...circlePeople(),O('hoop','hoop',385,115,{r:32,stroke:C,width:6}),T('direction',320,205,'ONE DIRECTION ↻',{size:16})];
  const b=S(a,{hoop:{x:450,y:145,r:37}},[T('through',490,105,'STEP THROUGH',{size:12})]);
  const c=S(b,{hoop:{x:450,y:207,r:32}},[T('next',495,240,'TO PERSON 3',{size:12})],['through']);
  const d=S(c,{link2:{opacity:0}},[T('pause',320,45,'PAUSE · RELEASE IF NEEDED',{size:14})],['next']);
  const e=S(d,{link2:{opacity:1},hoop:{x:255,y:297}},[trail('route',[[450,207],[450,270],[320,325],[255,297]])],['pause']);
  const f=S(e,{hoop:{x:385,y:115}},[T('done',320,245,'ONE COMPLETE CIRCUIT ✓',{size:15})],['route']);
  const g=S(a,{},[T('again',320,245,'TRY A SMOOTHER SECOND CIRCUIT',{size:12})]);
  return {summary:'Move a hoop all the way around a linked circle without changing hand partners.',legend:[{color:A,label:'Linked players'},{color:C,label:'Hoop'}],steps:[
    frame('Link hands around the hoop','With everyone’s agreement, close the circle with a hoop around one joined pair of hands. Choose one direction.','Build the linked circle',a),
    frame('Pass your body through','Person 2 carefully steps through the hoop. Neighbours lift or lower their joined hands to help; nobody pulls anyone through.','Move through the hoop',b,{focus:[450,145]}),
    frame('Keep the hand chain intact','The hoop is now between people 2 and 3. It moves along the existing hand link, ready for person 3.','Pass to the next person',c),
    frame('Comfort comes before the chain','If someone needs to release a grip, pause. Nobody is eliminated and there is no penalty for stopping.','Pause and release safely',d),
    frame('Reconnect and continue together','Restore a comfortable link and continue in the same direction. The hoop passes people 3 and 4.','Continue around the circle',e,{tracks:[{id:'hoop',points:[[450,207],[450,270],[320,325],[255,297]]}]}),
    frame('Return to the starting link','After people 5, 6 and 1 pass through, the hoop returns to its original link. The whole group succeeds.','Complete the circuit',f,{tracks:[{id:'hoop',points:[[255,297],[190,270],[190,145],[320,85],[385,115]]}]}),
    frame('Make the next circuit smoother','Discuss what helped. Reset comfortably and try a second circuit together. An opening hoop or agreed seated adaptation can change the movement.','Start another circuit',g)
  ]};
})();

const ninja=(()=>{
  const a=[P('p1',250,140,'a','1'),P('p2',380,140,'a','2'),P('p3',380,270,'a','3'),P('p4',250,270,'a','4'),O('h1','ball',277,155,{r:8,fill:PAPER,label:'H'}),O('h2','ball',353,155,{r:8,fill:PAPER,label:'H'}),O('h3','ball',353,252,{r:8,fill:PAPER,label:'H'}),O('h4','ball',277,252,{r:8,fill:PAPER,label:'H'}),T('order',320,55,'TURN ORDER: 1 → 2 → 3 → 4',{size:15}),T('freeze',320,355,'CHOOSE A POSE, THEN FREEZE',{size:14})];
  const b=S(a,{p1:{x:315,y:145},h1:{x:345,y:152},p2:{x:425,y:125},h2:{x:450,y:110}},[L('attempt',345,152,375,145,{arrow:true,dash:'4 5'}),T('dodge',450,85,'ONE DODGE',{size:12}),T('order',320,55,'NEXT: 2 → 3 → 4 → 1',{size:15})],['order']);
  const c=S(b,{p2:{x:405,y:210},h2:{x:362,y:245},p3:{fill:WAIT},h3:{fill:WAIT}},[ring('tap',357,250,20,{stroke:BTEAM}),T('order',320,55,'NEXT: 4 → 1 → 2',{size:15}),T('freeze',320,355,'3 WAS TAPPED: OUT THIS ROUND',{size:13})],['order','freeze','attempt','dodge']);
  const d=S(c,{p4:{x:285,y:190},h4:{x:342,y:152},p1:{fill:WAIT},h1:{fill:WAIT}},[T('order',320,55,'NEXT: 2 → 4',{size:15}),T('freeze',320,355,'SKIP 3 · PLAYER 4 TAPS PLAYER 1',{size:13})],['order','freeze','tap']);
  const e=S(d,{p2:{x:345,y:190},h2:{x:342,y:152},p4:{fill:WAIT},h4:{fill:WAIT}},[T('order',320,55,'PLAYER 2 REMAINS',{size:17}),O('winner','star',400,120,{r:18,fill:A}),T('freeze',320,355,'2 TAPS 4 · ROUND OVER',{size:14})],['order','freeze']);
  const f=S(a,{},[T('order',320,55,'NEXT ROUND: 2 → 3 → 4 → 1',{size:15})],['order']);
  return {summary:'On your turn, use one continuous movement to tap a hand while the target gets one dodge.',legend:[{color:A,label:'Active player'},{color:WAIT,label:'Out for this short round'}],steps:[
    frame('Agree an order and freeze','Count down, take one step into a starting pose, then freeze. H marks a hand: only gentle taps to the back of a hand count.','Take starting poses',a),
    frame('One action, one possible dodge','Player 1 makes one continuous attempt. Only targeted player 2 may dodge once. The tap misses; both freeze in their new poses.','Attempt a hand tap',b,{tracks:[{id:'h1',points:[[277,155],[315,143],[345,152]]},{id:'h2',points:[[353,155],[420,120],[450,110]]}]}),
    frame('A hand tap ends that player’s round','Player 2 uses the next turn to tap player 3’s hand. Player 3 leaves this short round.','Tap player 3’s hand',c,{focus:[353,252]}),
    frame('Keep the original turn order','Skip eliminated player 3. Player 4 acts next and taps player 1. Nobody else moves in response.','Continue with player 4',d),
    frame('The last active player wins','Player 2 taps player 4’s hand. Only player 2 remains, so this round ends.','Finish the final duel',e),
    frame('Everybody returns for another round','Everyone rejoins. Move the starting player one place around the original circle: player 2 starts the next round.','Reset with a new starter',f)
  ]};
})();

const zipZapZop=(()=>{
  const a=[...circlePeople(),T('sequence',320,45,'ZIP → ZAP → ZOP → ZIP…',{size:17}),ring('active',320,85,23,{stroke:C}),T('count',320,370,'SHARED TARGET: 30 PASSES',{size:13})];
  const b=S(a,{active:{x:450,y:270}},[L('send',320,85,450,270,{arrow:true,stroke:C,width:3}),T('word',355,175,'ZIP',{size:24})]);
  const c=S(b,{active:{x:190,y:145},send:{x:450,y:270,x2:190,y2:145},word:{x:305,y:205,label:'ZAP'}});
  const d=S(c,{active:{x:320,y:325},send:{x:190,y:145,x2:320,y2:325},word:{x:230,y:245,label:'ZOP'}});
  const e=S(d,{word:{label:'…ZAP?',x:360,y:250}},[T('pause',320,105,'PAUSE · EXPECTED ZIP',{size:14})],['send']);
  const f=S(e,{active:{x:190,y:270},word:{label:'ZIP',x:255,y:285}},[L('send',320,325,190,270,{arrow:true,stroke:C,width:3}),T('count',320,370,'RESTART THE UNINTERRUPTED COUNT',{size:12})],['count','pause']);
  return {summary:'Send a clear gesture around the circle while keeping the repeating Zip–Zap–Zop order.',legend:[{color:A,label:'Everyone stays in'},{color:C,label:'Current receiver / gesture'}],steps:[
    frame('Learn the repeating sequence','Everyone can see one another. Practise a comfortable passing gesture and agree a target of thirty uninterrupted passes.','Make the circle',a),
    frame('Send Zip to a clear receiver','Player 1 gestures to player 3 and says “Zip”. The receiver must know the gesture is for them.','Send Zip',b),
    frame('The receiver sends Zap','Player 3 chooses player 6 and sends “Zap”. The direction is unpredictable, but the word order is fixed.','Send Zap',c),
    frame('The next receiver sends Zop','Player 6 sends “Zop” to player 4. The next word must return to “Zip”.','Send Zop',d),
    frame('Pause when the order breaks','Player 4 says the wrong word. Pause together. Nobody is eliminated. An unclear receiver also triggers a pause.','Try the wrong word',e),
    frame('Restart with the last receiver','Player 4 restarts at “Zip” and sends it to player 5. Reset the uninterrupted count and work towards thirty together.','Restart at Zip',f)
  ]};
})();

const roshamboRockstar=(()=>{
  const a=[P('p1',110,125,'a','1'),P('p2',180,125,'b','2'),P('p3',110,275,'a','3'),P('p4',180,275,'b','4'),P('p5',450,125,'a','5'),P('p6',520,125,'b','6'),P('p7',450,275,'a','7'),P('p8',520,275,'b','8'),T('cycle',320,45,'ROCK > SCISSORS > PAPER > ROCK',{size:14}),T('shoot',320,370,'REVEAL ON “SHOOT” · REPLAY TIES',{size:13})];
  const b=S(a,{p2:{fill:C},p4:{fill:C},p6:{fill:C},p8:{fill:C}},[T('r1',145,165,'ROCK > SCISSORS',{size:10}),T('r2',145,315,'PAPER > ROCK',{size:10}),T('r3',485,165,'SCISSORS > PAPER',{size:10}),T('r4',485,315,'ROCK > SCISSORS',{size:10})]);
  const c=S(b,{p1:{x:235,y:135},p2:{x:185,y:110},p3:{x:235,y:255},p4:{x:185,y:280},p5:{x:425,y:135},p6:{x:475,y:110},p7:{x:425,y:255},p8:{x:475,y:280}},[T('duel1',235,200,'1 vs 3',{size:16}),T('duel2',425,200,'5 vs 7',{size:16})],['r1','r2','r3','r4']);
  const d=S(c,{p1:{x:260,y:205},p2:{x:180,y:135},p3:{x:160,y:205,fill:C},p4:{x:180,y:275},p5:{x:380,y:205},p6:{x:460,y:135},p7:{x:480,y:205,fill:C},p8:{x:460,y:275}},[T('final',320,125,'THE FINAL DUEL',{size:17})],['duel1','duel2']);
  const e=S(d,{p5:{fill:C}},[T('choices',320,250,'PAPER > ROCK',{size:14}),O('star','star',260,165,{r:18,fill:A})]);
  const f=S(e,{p1:{x:320,y:170},p2:{x:220,y:155},p3:{x:205,y:230},p4:{x:265,y:285},p5:{x:375,y:285},p6:{x:435,y:230},p7:{x:420,y:155},p8:{x:320,y:320},star:{x:320,y:125}},[T('celebrate',320,60,'ONE ROCKSTAR · EVERYONE INVOLVED',{size:14})],['final','choices','cycle']);
  const g=S(a,{p2:{x:450,y:125},p5:{x:180,y:125},p4:{x:450,y:275},p7:{x:180,y:275}},[T('fresh',320,205,'MIX PARTNERS · START AGAIN',{size:14})]);
  return {summary:'Win a duel to compete again; lose one and your whole group becomes the winner’s supporters.',legend:[{color:A,label:'Competing player'},{color:BTEAM,label:'First-round opponent'},{color:C,label:'Supporter'}],steps:[
    frame('Begin in individual pairs','Introduce yourselves. Reveal rock, paper or scissors together on “shoot”. Replay ties until each pair has a winner.','Meet a partner',a),
    frame('The other player becomes a supporter','Players 1, 3, 5 and 7 win these example duels. Their partners remain involved as supporters.','Play the first duels',b),
    frame('Winners challenge other winners','Each winner finds another winner. Supporters follow at a comfortable distance and cheer without crowding.','Combine into the next duels',c),
    frame('Whole supporter groups transfer','Players 1 and 5 win. Players 3 and 7, together with their existing supporters, join the new winners. Only two competitors remain.','Bring whole groups together',d),
    frame('Play the final duel','Player 1 reveals paper; player 5 reveals rock. Paper wins. Both finalists have supporters around them.','Reveal the final choices',e),
    frame('Celebrate the whole group','Player 1 is this round’s rockstar. The other finalist and their supporters join in; everyone remains part of the event.','Celebrate together',f),
    frame('Restart from individual pairs','Mix partners so people meet someone new. Everyone becomes a competitor again.','Make fresh pairs',g)
  ]};
})();

const parachutePopcorn=(()=>{
  const edgePlayers=[[320,75],[432,140],[432,270],[320,335],[208,270],[208,140]].map(([x,y],i)=>P(`p${i+1}`,x,y,'a',String(i+1)));
  const a=[ring('fabric',320,205,115,{fill:'#ded5ee',stroke:C,width:4}),...edgePlayers,B('b1',285,185),B('b2',335,170),B('b3',355,225),B('b4',295,235),T('left',320,45,'POPCORN ON FABRIC: 4',{size:16}),T('edge',320,370,'KEEP HOLD OF THE EDGE',{size:13})];
  const b=S(a,{b1:{x:280,y:160},b2:{x:345,y:140},b3:{x:370,y:210},b4:{x:295,y:205}},[T('pop',320,110,'“POP!”',{size:19})]);
  const c=S(b,{b1:{x:140,y:210},b2:{x:520,y:215},b3:{x:370,y:155},b4:{x:290,y:265}},[T('left',320,45,'POPCORN ON FABRIC: 2',{size:16}),trail('pop1',[[280,160],[230,110],[140,210]]),trail('pop2',[[345,140],[430,110],[520,215]])],['left','pop']);
  const d=S(c,{b3:{x:535,y:300},b4:{x:125,y:310}},[T('left',320,45,'POPCORN ON FABRIC: 0 ✓',{size:16}),T('stop',320,200,'LOWER + STOP',{size:19})],['left','pop1','pop2']);
  const e=S(d,{fabric:{fill:'#ebe5f3',opacity:.65},b1:{x:190,y:200},b2:{x:455,y:215},b3:{x:450,y:300},b4:{x:185,y:310}},[T('collect',320,245,'ONLY NOW COLLECT',{size:13})]);
  const f=S(a,{},[T('rhythm',320,205,'TRY A SHARED RHYTHM',{size:12})]);
  return {summary:'Bounce every soft ball off the parachute, then stop before collecting it.',legend:[{color:A,label:'Players holding the edge'},{color:C,label:'Parachute'}],steps:[
    frame('Place popcorn in the centre','Everyone holds the edge comfortably, around waist height. Use soft, lightweight balls and agree a stop signal.','Load the parachute',a),
    frame('Shake together on Pop','Practise lifting and lowering together. On “Pop!”, bounce the fabric while keeping hold and staying in place.','Start the popcorn',b),
    frame('Bounce balls over the edge','Two balls leave the parachute. Steer with the fabric rather than reaching in with your hands. Keep working on the remaining two.','Pop the first balls out',c,{tracks:[{id:'b1',points:[[280,160],[230,110],[140,210]]},{id:'b2',points:[[345,140],[430,110],[520,215]]}]}),
    frame('The final ball ends the attempt','All four balls are off. Lower the parachute and stop moving it. The group has succeeded.','Pop out the last two',d),
    frame('Collect only after stopping','With the parachute lowered and still, collect the balls. Nobody chases a ball while the group is still shaking.','Collect safely',e),
    frame('Refill and try another rhythm','Return the balls to the centre. Try another round with a shared lifting rhythm or smaller comfortable movements.','Refill the popcorn',f)
  ]};
})();

const humanKnot=(()=>{
  const pairings=[[0,2],[2,4],[4,1],[1,5],[5,3],[3,0]];
  const knotLinks=positions=>pairings.map(([i,j],k)=>L(`hand${k}`,positions[i][0],positions[i][1],positions[j][0],positions[j][1],{stroke:k%2?C:A,width:4}));
  const a=[...knotLinks(circlePositions),...circlePeople(),T('hands',320,45,'SAME HAND PARTNERS THROUGHOUT',{size:15}),T('choice',320,370,'RIGHT TO ONE PERSON · LEFT TO ANOTHER',{size:12})];
  const b=S(a,{hand2:{stroke:BTEAM,width:6}},[T('plan',320,205,'DISCUSS ONE MOVE',{size:16})]);
  const c=S(b,{hand2:{opacity:0}},[T('cut',320,205,'ONE AGREED CUT',{size:16}),T('choice',320,370,'TEMPORARILY RELEASE 5 ↔ 2',{size:13})],['plan','choice']);
  const finalPositions=[[320,85],[320,325],[450,145],[190,145],[450,270],[190,270]];
  const d=[...knotLinks(finalPositions).map(n=>n.id==='hand2'?{...n,opacity:0}:n),...finalPositions.map(([x,y],i)=>P(`p${i+1}`,x,y,'a',String(i+1))),T('hands',320,45,'SAME HAND PARTNERS THROUGHOUT',{size:15}),T('cut',320,205,'MOVE SLOWLY THROUGH THE OPENING',{size:12}),T('choice',320,370,'KEEP EVERY OTHER CONNECTION',{size:12})];
  const e=S(d,{hand2:{opacity:1}},[T('restored',320,205,'RESTORE 5 ↔ 2',{size:16})],['cut']);
  const f=S(e,{},[T('done',320,45,'ONE UNTANGLED LOOP ✓',{size:17}),T('choice',320,370,'ONE OR MORE LOOPS CAN BE A SUCCESS',{size:12})],['hands','choice','restored']);
  const g=S(f,{hand0:{opacity:0},hand1:{opacity:0},hand2:{opacity:0},hand3:{opacity:0},hand4:{opacity:0},hand5:{opacity:0}},[T('release',320,205,'RELEASE · DISCUSS · RESET',{size:15})],['done']);
  return {summary:'Untangle the hand connections together, keeping the same partners and stopping for comfort.',legend:[{color:A,label:'One set of joined hands'},{color:C,label:'The other joined hands'},{color:BTEAM,label:'Connection being discussed'}],steps:[
    frame('Choose two different hand partners','Each person joins right hands with a non-neighbour, then left hands with a different non-neighbour. This six-person drawing shows the resulting connections.','Make the knot',a),
    frame('Agree on one movement','Trace who is connected to whom. Suggest one slow movement at a time. Nobody should pull, twist or lift another person.','Look at the connections',b),
    frame('A facilitator may allow a cut','This example uses one of the two optional cuts. Players 5 and 2 briefly release their connection, with everyone’s agreement.','Open one agreed connection',c),
    frame('Move without changing partners','Use the opening to rearrange slowly. All the other hand partners stay connected. The drawing spreads the same connection chain into a loop.','Move through the opening',d),
    frame('Restore the exact same connection','Players 5 and 2 join hands again. A cut is a temporary release, not permission to choose different partners.','Reconnect players 5 and 2',e),
    frame('Recognise a workable ending','This knot becomes one loop. Some become several loops, and some cannot untangle safely. Explaining why is also a valid finish.','Check the finished loop',f),
    frame('Release and make a fresh knot','Release all grips, discuss what helped, and start a fresh knot if everyone wants another round. Anyone may release immediately for discomfort.','Release the circle',g)
  ]};
})();

const silentLineup=(()=>{
  const starts=[[150,145],[450,125],[320,260],[170,290],[480,285]],values=[4,1,5,2,3];
  const people=positions=>positions.flatMap(([x,y],i)=>[P(`p${i}`,x,y,'a',String.fromCharCode(65+i)),T(`value${i}`,x,y-30,String(values[i]),{size:19})]);
  const a=[...people(starts),L('direction',110,355,530,355,{arrow:true}),T('criterion',320,45,'ORDER THESE CARDS: 1 → 5',{size:17})];
  const wrong=[[320,220],[110,220],[530,220],[215,220],[425,220]];
  const b=[...people(wrong),L('direction',110,355,530,355,{arrow:true}),T('criterion',320,45,'GESTURES ONLY',{size:17}),T('quiet',320,110,'POINT · SIGN · WRITE',{size:14})];
  const c=S(b,{},[T('ready',320,290,'EVERYONE SIGNALS READY',{size:15})]);
  const d=S(c,{},[ring('wrong4',320,220,26,{stroke:BTEAM}),ring('wrong3',425,220,26,{stroke:BTEAM}),T('check',320,45,'READ ALOUD: 1, 2, 4, 3, 5',{size:17})],['criterion']);
  const correct=[[425,220],[110,220],[530,220],[215,220],[320,220]];
  const e=[...people(correct),L('direction',110,355,530,355,{arrow:true}),T('criterion',320,45,'BACK TO GESTURES: SWAP 4 AND 3',{size:16}),T('correct',320,290,'1 · 2 · 3 · 4 · 5 ✓',{size:18})];
  const f=S(a,{},[T('new',320,205,'CHOOSE ANOTHER SHARED CRITERION',{size:13})]);
  return {summary:'Use gestures to arrange the group in an agreed order, then check it together.',legend:[{color:A,label:'Players with example number cards'},{color:BTEAM,label:'Out-of-order neighbours'}],steps:[
    frame('Choose the order and first end','This example uses number cards. You could instead agree on birthday month and day, without the year, or another comfortable shared criterion.','Choose an order',a),
    frame('Communicate without speech','Players gesture and move themselves into a line. Nobody pulls or pushes another person. Signing, writing or agreed aids can help.','Build the line silently',b),
    frame('Signal when the line is ready','When everyone believes the order is correct, signal completion together. Now it is time to check.','Signal ready',c),
    frame('Read the values from one end','Read aloud: one, two, four, three, five. Four and three are reversed. The group can repair the line rather than starting over.','Check the order aloud',d),
    frame('Return to gestures and repair','Players carrying three and four swap places using gestures. Check again: the whole line is now correctly ordered.','Repair the two positions',e,{tracks:[{id:'p0',points:[[320,220],[350,280],[425,220]]},{id:'value0',points:[[320,190],[350,250],[425,190]]},{id:'p4',points:[[425,220],[380,160],[320,220]]},{id:'value4',points:[[425,190],[380,130],[320,190]]}]}),
    frame('Choose a new challenge together','The group has completed one correct line. Try a new criterion or split into smaller groups for the next round.','Reset the group',f)
  ]};
})();

const balloonBop=(()=>{
  const a=[...links(),...circlePeople(),B('balloon',320,190,{r:22,fill:C}),T('touches',320,45,'TOUCHES: 0 · TARGET: 20',{size:17}),T('rule',320,370,'GENTLE TOUCHES · NO KICKS',{size:13})];
  const b=S(a,{balloon:{x:440,y:240}},[T('touches',320,45,'TOUCHES: 1',{size:17}),trail('float',[[320,190],[385,160],[440,240]])],['touches']);
  const shift=circlePositions.map(([x,y])=>[x+35,y]);
  const c=[...links(shift),...shift.map(([x,y],i)=>P(`p${i+1}`,x,y,'a',String(i+1))),B('balloon',490,205,{r:22,fill:C}),T('touches',320,45,'TOUCHES: 7',{size:17}),T('rule',320,370,'MOVE THE LINKED CIRCLE TOGETHER',{size:13})];
  const d=S(c,{balloon:{x:540,y:315}},[ring('floor',540,315,29,{stroke:BTEAM}),T('touches',320,45,'LANDED · PAUSE · COUNT RESETS TO 0',{size:15})],['touches']);
  const e=S(a,{},[T('plan',320,235,'AGREE HOW TO COVER THE DRIFT',{size:12})]);
  const f=S(a,{balloon:{x:205,y:220}},[T('touches',320,45,'TOUCHES: 20 ✓',{size:19}),T('win',320,235,'SHARED TARGET REACHED',{size:13})],['touches']);
  return {summary:'Keep a balloon off the floor while the circle stays linked.',legend:[{color:A,label:'Linked players'},{color:C,label:'Balloon'},{color:BTEAM,label:'Floor contact'}],steps:[
    frame('Link only with everyone’s agreement','Float the balloon into the centre of a clear space. Agree a shared target, such as twenty touches.','Float the balloon',a),
    frame('Use a gentle first touch','Keep the balloon up using hands, arms or shoulders. Do not kick. Count every touch aloud.','Make the first touch',b,{tracks:[{id:'balloon',points:[[320,190],[385,160],[440,240]]}]}),
    frame('Move the whole circle together','The balloon drifts right. Everyone adjusts while keeping the hand chain linked. After several touches, the count has reached seven.','Cover the drifting balloon',c),
    frame('A landing resets the count','The balloon reaches the floor. Pause and reset the count. A broken hand chain also means pausing and resetting.','Let the attempt finish',d),
    frame('Plan a better next attempt','Regroup comfortably. Discuss how to cover the drifting side, then float the balloon again with the count at zero.','Reset and plan',e),
    frame('Reach the group’s target','On a later attempt, the group reaches twenty touches. Celebrate the shared target, or use your previous best as the next challenge.','See a successful attempt',f)
  ]};
})();

const groupJuggle=(()=>{
  const pos=[[320,85],[470,185],[400,315],[240,315],[170,185]],names=['A','B','C','D','E'],order=[0,3,1,4,2,0];
  const people=pos.map(([x,y],i)=>P(`p${names[i]}`,x,y,'a',names[i]));
  const routes=order.slice(0,-1).map((v,i)=>L(`route${i}`,pos[v][0],pos[v][1],pos[order[i+1]][0],pos[order[i+1]][1],{stroke:WAIT,arrow:true,dash:'4 6'}));
  const a=[...people,B('b1',335,72),T('order',320,45,'BUILD ONE REPEATABLE ORDER',{size:15})];
  const b=S(a,{b1:{x:455,y:170}},[L('r1',320,85,240,315,{arrow:true,dash:'4 6'}),L('r2',240,315,470,185,{arrow:true,dash:'4 6'}),T('order',320,45,'A → D → B …',{size:18})],['order']);
  const c=[...routes,...people,B('b1',335,72),T('order',320,45,'A → D → B → E → C → A',{size:16}),T('once',320,375,'EVERYONE RECEIVES ONCE',{size:13})];
  const d=S(c,{b1:{x:455,y:170}},[B('b2',225,300,{fill:C}),T('two',320,375,'SECOND OBJECT FOLLOWS THE SAME ORDER',{size:12})],['once']);
  const e=S(d,{b1:{x:435,y:225}},[ring('drop',435,225,22,{stroke:BTEAM}),T('pause',320,375,'DROPPED OBJECT PAUSES AT B',{size:13})],['two']);
  const f=S(e,{b1:{x:185,y:170}},[trail('resume',[[435,225],[455,170],[185,170]]),T('resume-label',320,375,'B RETRIEVES, THEN SENDS TO E',{size:13})],['pause','drop']);
  const g=S(c,{b1:{x:304,y:66}},[B('b2',338,66,{fill:C}),T('done',320,375,'BOTH OBJECTS COMPLETE THEIR CIRCUITS ✓',{size:12})],['once']);
  return {summary:'Learn one everyone-included passing order, then send several objects around that same circuit.',legend:[{color:A,label:'Players'},{color:'#e6cb62',label:'First object'},{color:C,label:'Second object'}],steps:[
    frame('Begin with one soft object','A says someone’s name and checks they are ready before an underarm toss. Each receiver chooses someone who has not yet received.','Choose the first receiver',a),
    frame('Choose a new receiver each time','A sends to D, then D sends to B. No receiver repeats while the first circuit is being built.','Build the passing order',b,{tracks:[{id:'b1',points:[[335,72],[225,300],[455,170]]}]}),
    frame('Return to the starter','B sends to E, E to C, and C back to A. Everyone has received once. Repeat this exact order until the group remembers it.','Complete the first circuit',c,{tracks:[{id:'b1',points:[[455,170],[185,170],[385,300],[335,72]]}]}),
    frame('Add a second object behind','Restart the same sequence, then introduce a second object behind the first. Both follow A–D–B–E–C–A.','Add the second object',d,{tracks:[{id:'b1',points:[[335,72],[225,300],[455,170]]},{id:'b2',points:[[335,72],[225,300]],start:.4}]}),
    frame('Pause the dropped object’s journey','B drops the first object. Retrieve it and resume from B; do not restart it from A or change its next receiver.','Pause a dropped object',e),
    frame('Resume from the same player','B retrieves the object, then sends it to E. Check readiness before the toss; the original order stays intact.','Resume B’s pass to E',f,{tracks:[{id:'b1',points:[[435,225],[455,170],[185,170]]}]}),
    frame('Finish every object’s circuit','Continue the same order until both objects have completed their circuits back to A. Add more objects only when the group is ready.','Complete both circuits',g,{tracks:[{id:'b1',points:[[185,170],[385,300],[304,66]]},{id:'b2',points:[[225,300],[455,170],[185,170],[385,300],[338,66]],start:.2}]})
  ]};
})();

const giantsWizardsElves=(()=>{
  const gesture=(id,x,y,kind)=>kind==='giant'
    ?[L(`${id}left`,x-12,y-3,x-25,y-30,{width:3}),L(`${id}right`,x+12,y-3,x+25,y-30,{width:3})]
    :kind==='elf'
      ?[L(`${id}left`,x-13,y-7,x-21,y-21,{width:3}),L(`${id}right`,x+13,y-7,x+21,y-21,{width:3})]
      :[L(`${id}left`,x-12,y,x-36,y-5,{width:3}),L(`${id}right`,x+12,y,x+36,y-5,{width:3})];
  const teamGestures=(green,coral)=>[155,215,275].flatMap((y,i)=>[...gesture(`g-gesture${i}`,210,y,green),...gesture(`c-gesture${i}`,430,y,coral)]);
  const a=[Z('g-side',50,110,220,210,'GREEN','#e2ebc7'),Z('c-side',370,110,220,210,'CORAL','#f3d7cb'),P('g1',210,155,'a','1'),P('g2',210,215,'a','2'),P('g3',210,275,'a','3'),P('c1',430,155,'b','1'),P('c2',430,215,'b','2'),P('c3',430,275,'b','3'),T('cycle',320,45,'GIANT > ELF > WIZARD > GIANT',{size:15}),T('gap',320,365,'STAY ON YOUR SIDE OF THE GAP',{size:13})];
  const b=S(a,{g1:{x:135,y:165},g2:{x:185,y:200},g3:{x:135,y:235},c1:{x:455,y:165},c2:{x:505,y:200},c3:{x:455,y:235}},[T('gh',155,285,'SECRET: GIANT',{size:12}),T('ch',485,285,'SECRET: ELF',{size:12})]);
  const c=S(a,{},[T('gchoice',155,90,'GIANTS',{size:17}),T('cchoice',485,90,'ELVES',{size:17}),...teamGestures('giant','elf')]);
  const d=S(c,{},[score(1,0),T('result',320,210,'GIANTS BEAT ELVES',{size:14})],['cycle']);
  const e=S(a,{},[T('gchoice',155,90,'WIZARDS',{size:17}),T('cchoice',485,90,'WIZARDS',{size:17}),T('tie',320,210,'TIE: NO POINT',{size:15}),score(1,0),...teamGestures('wizard','wizard')],['cycle']);
  const f=S(b,{},[T('new-leader',320,360,'NEW HUDDLE LEADER EACH ROUND',{size:12}),score(1,0)],['cycle','gap','gh','ch']);
  const g=S(a,{},[score(4,2),T('done',320,190,'7 ROUNDS COMPLETE',{size:18}),T('record',320,235,'4 GREEN · 2 CORAL · 1 TIE',{size:13})],['cycle']);
  return {summary:'Teams secretly choose a character, reveal together, and score by the giant–elf–wizard cycle.',legend:legend(),steps:[
    frame('Learn the three-way cycle','Giants beat elves, elves beat wizards, and wizards beat giants. Practise tall, pointy-ear and spell-casting gestures with a clear gap between teams.','Learn the character cycle',a),
    frame('Choose one secret team character','Each team huddles and agrees on one character. Everyone in that team must reveal the same choice.','Huddle and agree',b),
    frame('Reveal together across the gap','On the shared countdown, green performs giants and coral performs elves. Stay on your own side; this is the points version.','Reveal the characters',c),
    frame('Award one point to the winner','Giants beat elves, so green earns one point. No chasing or capturing follows the reveal.','Score the round',d),
    frame('Matching characters produce a tie','In the next round, both teams choose wizards. Neither team scores; huddle and choose again.','Reveal a tied round',e),
    frame('Change who leads the huddle','Choose a new huddle leader for each round. Continue revealing one shared character per team until seven rounds are complete.','Choose the next characters',f),
    frame('Compare points after seven rounds','This example ends with four green wins, two coral wins and one tie. Green wins four–two. Equal totals would share the win.','Finish the seven rounds',g)
  ]};
})();

const winkMurder=(()=>{
  const a=[...circlePeople(),P('detective',550,330,'b','D',{rotate:180}),T('secret',320,45,'SECRET WINKER: PLAYER 2',{size:16}),T('guesses',320,370,'DETECTIVE: 3 GUESSES · 2 MINUTES',{size:13})];
  const b=S(a,{detective:{x:320,y:205,rotate:0}},[T('secret',320,45,'THE DIAGRAM SHOWS THE SECRET; D DOES NOT',{size:12})],['secret']);
  const c=S(b,{},[L('wink',450,145,190,270,{arrow:true,stroke:C,dash:'3 6'}),T('cue',430,100,'WINK',{size:14}),L('look',320,205,320,85,{arrow:true,stroke:BTEAM})]);
  const d=S(c,{p5:{fill:WAIT,pose:'seated'}},[L('fold1',179,264,201,279,{width:3}),L('fold2',201,264,179,279,{width:3}),T('out',175,315,'SEATED EXIT',{size:12})],['wink','cue']);
  const e=S(d,{},[L('guess',320,205,320,325,{arrow:true,stroke:BTEAM}),T('wrong',400,330,'GUESS 1: WRONG',{size:12}),T('guesses',320,370,'2 GUESSES LEFT',{size:15})],['guesses','look']);
  const f=S(e,{},[L('guess2',320,205,450,145,{arrow:true,stroke:BTEAM}),ring('found',450,145,25,{stroke:BTEAM}),T('correct',320,245,'GUESS 2: CORRECT ✓',{size:16})],['guess','wrong']);
  const g=S(a,{p3:{x:550,y:330,fill:BTEAM,label:'D',rotate:180},detective:{x:450,y:270,fill:A,label:'3',rotate:0}},[T('secret',320,45,'NEW WINKER: PLAYER 6',{size:16}),T('reset',320,205,'EVERYONE RETURNS · CHANGE ROLES',{size:13})],['secret']);
  return {summary:'The detective must identify the secret winker before three wrong guesses or the short time limit.',legend:[{color:A,label:'Circle players'},{color:BTEAM,label:'Detective'},{color:C,label:'Secret wink cue'}],steps:[
    frame('Select the winker in secret','The detective looks away while a facilitator selects player 2. This teaching diagram reveals the secret; the detective must not be told.','Choose the secret winker',a),
    frame('The detective watches from the centre','The detective returns. Everyone looks around naturally without announcing who the winker is.','Bring the detective in',b),
    frame('Wink at one player quietly','Player 2 makes eye contact and winks at player 5 while trying to avoid the detective’s attention. Only one player is targeted at a time.','Send the secret wink',c),
    frame('The target makes a seated exit','Player 5 pauses briefly, then performs a seated dramatic exit and folds their arms. They are out of this short round.','React to the wink',d),
    frame('A wrong guess uses one chance','The detective guesses player 4. That is wrong, leaving two guesses. Three wrong guesses would let the winker win.','Make the first guess',e),
    frame('A correct guess ends the round','The detective identifies player 2 on the second guess and wins. Also stop after two minutes; otherwise the winker wins.','Identify the winker',f),
    frame('Reveal, rotate, invite everyone back','Reveal the winker, change roles and bring every player back into the circle for another short round.','Reset everyone’s roles',g)
  ]};
})();

const bigWindBlows=(()=>{
  const spots=circlePositions.map(([x,y],i)=>ring(`spot${i}`,x,y,24,{stroke:INK,fill:'#e8ecdc'}));
  const a=[...spots,...circlePeople('p','neutral'),P('caller',320,205,'b','C'),T('spots',320,45,'7 PEOPLE · 6 SPOTS',{size:17}),T('walk',320,370,'WALK · MOVE MORE THAN ONE SPOT AWAY',{size:12})];
  const b=S(a,{p1:{fill:A},p3:{fill:A},p5:{fill:A},caller:{fill:A}},[T('fact',320,245,'“…LIKES MUSIC!”',{size:16})]);
  const c=S(b,{p1:{x:450,y:270},p3:{x:190,y:270},caller:{x:320,y:85},p5:{x:320,y:205}},[trail('route1',[[320,85],[500,170],[450,270]]),trail('route3',[[450,270],[320,345],[190,270]]),trail('routec',[[320,205],[320,85]])],['fact']);
  const d=S(c,{p5:{fill:BTEAM},p1:{fill:PAPER},p3:{fill:PAPER},caller:{fill:PAPER,label:'7'}},[T('new',320,245,'5 IS THE NEW CALLER',{size:15})],['route1','route3','routec']);
  const e=S(d,{},[T('nobody',320,45,'NOBODY ELSE SHARES THIS FACT',{size:14}),T('new',320,245,'TRY ANOTHER TRUE FACT',{size:13})],['spots','new']);
  const f=S(d,{p2:{fill:A},p4:{fill:A},p6:{fill:A},p5:{fill:A}},[T('next',320,45,'NEW FACT · NEW GROUP MOVES',{size:15}),T('new',320,245,'EVERYONE STAYS IN',{size:14})],['spots','new']);
  return {summary:'Share a true fact, change non-adjacent spots with people who share it, and welcome a new caller.',legend:[{color:A,label:'People who share the fact'},{color:BTEAM,label:'Current caller'},{color:PAPER,label:'People staying in place'}],steps:[
    frame('Leave one player without a spot','There is one fewer marked spot than people. One caller starts in the centre. Keep paths clear.','Mark the circle',a),
    frame('Call a fact true about yourself','The caller says, “The big wind blows for everyone who likes music!” In this example, players 1, 3 and 5 share that fact.','Reveal who shares it',b),
    frame('Walk to a non-adjacent open spot','Those players and the caller move. Choose a different spot more than one position away. Walk without grabbing or pushing.','Change spots',c,{tracks:[{id:'p1',points:[[320,85],[500,170],[450,270]]},{id:'p3',points:[[450,270],[320,345],[190,270]]},{id:'caller',points:[[320,205],[320,85]]},{id:'p5',points:[[190,270],[180,140],[285,100],[320,205]]}]}),
    frame('The person left becomes caller','Player 5 has no spot, so becomes the new caller. Nobody is eliminated. If two people reach one spot together, pause and agree who stays.','Welcome the new caller',d),
    frame('No movement means another statement','Player 5 tries a true fact nobody else shares. Everyone stays put, so player 5 tries a new statement.','Try a fact nobody shares',e),
    frame('Keep discovering common ground','The new statement involves different people. Continue until several have called or five minutes pass, then share something the group discovered.','Invite the next group to move',f)
  ]};
})();

export const LESSONS={
  'tchoukball':tchoukball,
  'kin-ball':kinBall,
  'ultimate':ultimate,
  'jugger':jugger,
  'roundnet':roundnet,
  'danish-longball':danishLongball,
  'newcomb':newcomb,
  'endball':endball,
  'speedball':speedball,
  'korfball':korfball,
  'sitting-volleyball':sittingVolleyball,
  'hooverball':hooverball,
  'hoop-pass':hoopPass,
  'ninja':ninja,
  'zip-zap-zop':zipZapZop,
  'roshambo-rockstar':roshamboRockstar,
  'parachute-popcorn':parachutePopcorn,
  'human-knot':humanKnot,
  'silent-lineup':silentLineup,
  'balloon-bop':balloonBop,
  'group-juggle':groupJuggle,
  'giants-wizards-elves':giantsWizardsElves,
  'wink-murder':winkMurder,
  'big-wind-blows':bigWindBlows
};

// Attach each hand target to its owner in every Ninja state.
for(const scene of LESSONS.ninja.steps){
  const arms=[1,2,3,4].map(i=>{
    const person=scene.nodes.find(n=>n.id===`p${i}`),hand=scene.nodes.find(n=>n.id===`h${i}`);
    return L(`arm${i}`,person.x,person.y,hand.x,hand.y,{stroke:person.fill===WAIT?WAIT:INK,width:2});
  });
  scene.nodes=[...arms,...scene.nodes];
}
