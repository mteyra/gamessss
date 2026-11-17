import {P,B,O,Z,L,T,S,ring,INK,PAPER,A,BTEAM,C,WAIT} from './lesson-kit.js';

// Complete, authored stills. Stable IDs let the lesson engine interpolate each turn.
const lessons = {};
const teams = [{color:A,label:'Green'},{color:BTEAM,label:'Coral'}];
const shot = (id,points,start=0,end=1)=>({id,points,start,end});
const beat = (title,text,action,nodes,tracks=[],focus,duration=1900)=>({title,text,action,nodes,tracks,...(focus?{focus}:{}),duration});
const score = (label)=>T('score',320,355,label,{size:17});
const court = (label='')=>[Z('court',55,65,530,250,label),L('mid',320,65,320,315,{dash:'5 6'})];
const token = (id,x,y,fill=A,label='')=>O(id,'disc',x,y,{r:7,fill,label});
const pin = (id,x,y,label='',fill=PAPER)=>O(id,'pin',x,y,{w:16,h:34,label,fill});

{
 const base=[Z('court',55,70,530,245,'CHASE COURT'),L('lane',95,195,545,195,{width:4}),O('west','cone',95,195),O('east','cone',545,195),
  P('c',570,258,'a','C'),P('s1',180,195,'a','↑',{pose:'seated'}),P('s2',265,195,'a','↓',{pose:'seated'}),P('s3',350,195,'a','↑',{pose:'seated'}),P('s4',435,195,'a','↓',{pose:'seated'}),
  P('r1',440,265,'b','1'),P('r2',215,115,'b','2'),P('r3',480,110,'b','3'),score('TAGS 0')];
 const run=S(base,{c:{x:400,y:260},r1:{x:390,y:120}},[T('cross',320,290,'RUNNERS MAY CROSS')]);
 const handover=S(run,{c:{x:350,y:195,pose:'seated',label:'↑'},s3:{x:350,y:155,pose:'standing',label:'C'}},[T('call',350,235,'KHO!')],['cross']);
 const tag=S(handover,{s3:{x:430,y:120},r1:{x:450,y:120,fill:WAIT},score:{label:'TAGS 1'}},[T('tag',475,150,'+1')],['call']);
 const batch=S(tag,{r1:{x:600,y:120},r2:{x:600,y:180,fill:WAIT},r3:{x:600,y:240,fill:WAIT},score:{label:'TAGS 3'}},[T('batch',320,110,'THREE OUT → NEXT THREE')],['tag']);
 const fresh=S(batch,{r1:{x:430,y:265,fill:BTEAM},r2:{x:215,y:115,fill:BTEAM},r3:{x:480,y:110,fill:BTEAM}},[],['batch']);
 const swap=S(base,{c:{fill:BTEAM},s1:{fill:BTEAM},s2:{fill:BTEAM},s3:{fill:BTEAM},s4:{fill:BTEAM},r1:{fill:A},r2:{fill:A},r3:{fill:A},score:{label:'SWAP ROLES AFTER 5 MIN'}});
 lessons['kho-kho']={summary:'Tag runners by handing the chase to seated teammates.',legend:[{color:A,label:'Chasers'},{color:BTEAM,label:'Three runners'},{color:WAIT,label:'Tagged'}],steps:[
  beat('One chaser, three runners','This small example has four seated chasers facing alternate sides. One teammate chases; three opponents run.','Set up',base),
  beat('The runner crosses the lane','Runners may cross. The active chaser cannot cross or reverse direction except around an end cone.','Cross the lane',run,[shot('r1',[[440,265],[390,210],[390,120]]),shot('c',[[570,258],[480,280],[400,260]])],[390,195]),
  beat('Tap a back: “Kho!”','The chaser taps a seated teammate’s back, calls “kho” and takes their seat. That teammate starts on the side they face.','Pass the chase',handover,[shot('c',[[400,260],[350,230],[350,195]],0,.6),shot('s3',[[350,195],[350,155]],.55,1)],[350,195]),
  beat('A gentle tag scores one','The new chaser reaches runner 1. A gentle tag scores one; that runner leaves this batch.','Make the tag',tag,[shot('s3',[[350,155],[380,120],[430,120]]),shot('r1',[[390,120],[450,120]])],[450,120]),
  beat('Finish the batch','After the other two runners are tagged, all three are out. The chasing team has three points.','Finish three tags',batch),
  beat('Send the next three','A fresh batch enters. Keep chasing and handing over until the five-minute turn ends.','Send fresh runners',fresh,[shot('r1',[[600,120],[550,265],[430,265]]),shot('r2',[[600,180],[450,80],[215,115]]),shot('r3',[[600,240],[550,150],[480,110]])]),
  beat('Now exchange roles','Coral chases; green runs. Give both teams equal time. The side with more tags wins.','Swap teams',swap)
 ]};
}

{
 const supply=Array.from({length:10},(_,i)=>token(`t${i}`,110+(i%5)*15,160+Math.floor(i/5)*18));
 const base=[Z('court',55,65,530,250,'TOKEN RELAY'),L('aline',200,80,200,310,{dash:'5 6'}),L('bline',440,80,440,310,{dash:'5 6'}),
  O('bottle','bottle',320,200,{w:22,h:54}),ring('bowl',85,270,23,{fill:PAPER}),T('bowl-label',85,308,'BOWL',{size:11}),
  P('a1',180,210,'a','1'),P('a2',150,230,'a','2'),P('a3',150,290,'a','3'),
  P('b1',475,130,'b','1'),P('b2',475,210,'b','2'),P('b3',475,290,'b','3'),B('ball',193,208),...supply,score('GREEN BANKED 0 / 10')];
 const hit=S(base,{ball:{x:337,y:205},bottle:{rotate:90,y:218}},[T('go',315,125,'FALLEN → RELAY!')]);
 const bank=S(hit,{a1:{x:96,y:270},t0:{x:82,y:267},b1:{x:327,y:172},b2:{x:368,y:230},score:{label:'GREEN BANKED 1 / 10'}},[],['go']);
 const returnTag=S(bank,{a1:{x:180,y:210},a2:{x:122,y:240},t1:{x:123,y:221},b1:{x:340,y:190},bottle:{rotate:0,y:200},b2:{x:392,y:226},ball:{x:403,y:226}},[T('next',165,110,'TAG → NEXT RUNNER')]);
 const stop=S(returnTag,{b1:{x:475,y:130},b2:{x:475,y:210},ball:{x:487,y:210},a2:{x:150,y:230},t1:{x:125,y:160}},[T('stop',320,130,'STOP!')],['next']);
 const miss=S(stop,{ball:{x:306,y:268},b1:{x:457,y:140},score:{label:'MISS → NO RELAY'}},[],['stop']);
 const reset=S(base,{t0:{x:82,y:267},ball:{x:160,y:290},score:{label:'GREEN 1 / 10 · NEXT THROWER'}});
 lessons.flunkyball={summary:'Bank all ten tokens while the other team resets the fallen bottle.',legend:[{color:A,label:'Throwing / relay team'},{color:BTEAM,label:'Reset team'}],steps:[
  beat('Two teams, ten tokens each','This lesson follows green’s ten tokens. Each team has a bowl behind its line; a bottle stands halfway between them.','Set up',base),
  beat('Knock the bottle down','A green throw topples the bottle. Only a hit starts the token relay.','Topple the bottle',hit,[shot('ball',[[193,208],[260,165],[337,205]])],[320,200]),
  beat('Bank one token','One green runner carries one token to the bowl. Meanwhile coral races to the bottle and ball.','Run one token',bank,[shot('a1',[[180,210],[112,230],[96,270]]),shot('t0',[[110,160],[180,210],[82,267]]),shot('b1',[[475,130],[380,140],[327,172]]),shot('b2',[[475,210],[420,250],[368,230]])],[85,270]),
  beat('Return and tag the next','The first runner returns and tags the second. Coral stands the bottle and collects the ball, but must still get everybody behind its line.','Tag the next runner',returnTag,[shot('a1',[[96,270],[120,280],[180,210]],0,.5),shot('a2',[[150,230],[122,240]],.5,1),shot('t1',[[125,160],[150,212],[123,221]],.5,1)]),
  beat('Everyone back: “Stop!”','Coral has the ball, an upright bottle and everyone behind its line. Stop the relay. The unbanked carried token returns to the supply.','Call Stop',stop,[shot('b1',[[340,190],[400,150],[475,130]]),shot('b2',[[392,226],[440,225],[475,210]]),shot('t1',[[123,221],[125,160]])],[440,200]),
  beat('A miss earns no relay','Coral throws next and misses. Nobody moves tokens; the bottle is already upright.','Try the next throw',miss,[shot('ball',[[487,210],[390,230],[306,268]])],[320,260]),
  beat('Rotate throwers and repeat','Green keeps its banked token and rotates throwers. The first team with all ten banked after a stop call wins.','Prepare the next turn',reset)
 ]};
}

{
 const base=[...court('TAG-BELT KABADDI'),P('a1',260,200,'a','1'),P('a2',145,130,'a','2'),P('a3',145,270,'a','3'),
  P('b1',425,130,'b','1'),P('b2',495,200,'b','2'),P('b3',430,275,'b','3'),
  token('ta1',273,184,A),token('ta2',158,114,A),token('ta3',158,254,A),
  token('tb1',438,114,BTEAM),token('tb2',508,184,BTEAM),token('tb3',443,259,BTEAM),score('GREEN 0 : 0 CORAL'),T('timer',320,40,'20 SECONDS')];
 const raid=S(base,{a1:{x:395,y:165},ta1:{x:408,y:149}},[T('raid',445,305,'ONE RAIDER')]);
 const collect=S(raid,{a1:{x:404,y:130},ta1:{x:417,y:114},tb1:{x:390,y:114}},[T('collected',480,95,'TAG TAKEN')],['raid']);
 const home=S(collect,{a1:{x:260,y:200},ta1:{x:273,y:184},tb1:{x:246,y:184},score:{label:'GREEN 1 : 0 CORAL'}},[T('safe',240,245,'HOME → +1')],['collected']);
 const reverse=S(base,{a1:{x:160,y:205},ta1:{x:173,y:189},b2:{x:225,y:130},tb2:{x:238,y:114},score:{label:'GREEN 1 : 0 CORAL'}},[T('turn',245,275,'CORAL RAIDS NEXT')]);
 const stopped=S(reverse,{a2:{x:202,y:145},ta2:{x:215,y:129},tb2:{x:189,y:129},score:{label:'GREEN 2 : 0 CORAL'}},[T('lost',280,245,'RAIDER TAG LOST')],['turn']);
 const reset=S(base,{score:{label:'GREEN 2 : 0 CORAL'},timer:{label:'TAGS RETURNED · NEXT RAIDER'}});
 lessons.kabaddi={summary:'Take defenders’ tags and get home before your own tag is taken.',legend:teams,steps:[
  beat('Tags replace tackles','This is the tag-belt adaptation. Teams stay in their halves until one raider crosses; every player begins with a removable tag.','Set up',base),
  beat('One raider enters','Green sends one raider across. They have up to twenty seconds to collect tags and return.','Start the raid',raid,[shot('a1',[[260,200],[335,215],[395,165]]),shot('ta1',[[273,184],[348,199],[408,149]])],[320,200]),
  beat('Take a defender’s tag','The raider removes coral 1’s tag. It is only a potential point until the raider gets back home.','Collect one tag',collect,[shot('a1',[[395,165],[404,130]]),shot('tb1',[[438,114],[390,114]])],[425,130]),
  beat('Cross home to score','The raider returns safely. One collected tag becomes one point. All tags are returned after the raid.','Get back home',home,[shot('a1',[[404,130],[355,155],[300,185],[260,200]]),shot('tb1',[[390,114],[341,139],[286,169],[246,184]]),shot('ta1',[[417,114],[368,139],[313,169],[273,184]])],[300,200]),
  beat('The other team raids','Now coral sends one raider into green’s half. Teams alternate and rotate who raids.','Send coral’s raider',reverse,[shot('b2',[[495,200],[350,200],[225,130]]),shot('tb2',[[508,184],[363,184],[238,114]])]),
  beat('Lose your tag, lose the raid','Green removes the raider’s tag before they return. Green gets one defence point. Timeout or stepping out has the same result.','Take the raider’s tag',stopped,[shot('a2',[[145,130],[202,145]]),shot('tb2',[[238,114],[189,129]])],[225,130]),
  beat('Reset tags and take turns','Restore every tag. After equal numbers of raids, the higher total wins. There is no tackling, holding or contact blocking.','Reset the raid',reset)
 ]};
}

{
 const blocks=Array.from({length:7},(_,i)=>O(`d${i}`,'block',320,225-i*10,{w:50-i*3,h:9,fill:i%2?A:PAPER}));
 const base=[Z('court',55,65,530,250,'REBUILD ALL SEVEN'),ring('stack-zone',320,210,52),L('throw-line',170,85,170,300,{dash:'5 5'}),
  P('a1',145,135,'a','1'),P('a2',145,210,'a','2'),P('a3',145,285,'a','3'),
  P('b1',445,115,'b','1'),P('b2',495,205,'b','2'),P('b3',440,285,'b','3'),B('ball',160,210),...blocks,score('GREEN 0 : 0 CORAL')];
 const fallen=S(base,{ball:{x:390,y:228},d0:{x:282,y:245,rotate:20},d1:{x:345,y:248,rotate:-15},d2:{x:360,y:195,rotate:40},d3:{x:298,y:170,rotate:20},d4:{x:330,y:145,rotate:55},d5:{x:280,y:207,rotate:-30},d6:{x:350,y:278,rotate:25}},[T('go',320,100,'REBUILD!')]);
 const rebuild=S(fallen,{a2:{x:300,y:260},a3:{x:358,y:250},b2:{x:405,y:228},ball:{x:393,y:212},d0:{x:320,y:225,rotate:0},d1:{x:320,y:215,rotate:0},d2:{x:320,y:205,rotate:0}},[T('count',320,295,'3 / 7')],['go']);
 const hit=S(rebuild,{a1:{x:355,y:120,fill:WAIT},b1:{x:408,y:135},ball:{x:350,y:139}},[T('out',355,45,'1 OUT')]);
 const done=S(hit,Object.fromEntries([...blocks.map((n,i)=>[n.id,{x:320,y:225-i*10,rotate:0}]),['score',{label:'GREEN 1 : 0 CORAL'}],['count',{label:'7 / 7'}]]),[T('call',320,115,'LAGORI!')],['out']);
 const reset=S(base,{a1:{fill:BTEAM},a2:{fill:BTEAM},a3:{fill:BTEAM},b1:{fill:A},b2:{fill:A},b3:{fill:A},score:{label:'CORAL ATTACKS NEXT · ROUND 2 / 6'}});
 lessons.lagori={summary:'Topple the seven-disc tower, then rebuild it before every attacker is hit.',legend:[{color:A,label:'Attackers'},{color:BTEAM,label:'Fielders'},{color:WAIT,label:'Out this round'}],steps:[
  beat('Stack seven discs','Green attacks from the throwing line. Coral fields. The attackers have up to three throws total to topple the stack.','Set up',base),
  beat('One hit starts the scramble','The stack falls. Attackers can now rebuild while defenders recover the ball. Three missed opening throws would swap the roles.','Topple the stack',fallen,[shot('ball',[[160,210],[245,190],[320,207],[390,228]])],[320,210]),
  beat('Rebuild while they retrieve','Two attackers replace three discs. Coral retrieves the ball and can pass it between fielders.','Rebuild three discs',rebuild,[shot('a2',[[145,210],[225,265],[300,260]]),shot('a3',[[145,285],[260,290],[358,250]]),shot('b2',[[495,205],[405,228]])],[320,225]),
  beat('A low hit puts one out','Coral passes and gently hits attacker 1 below the knees. That player leaves this round; the other attackers keep rebuilding.','Make a low hit',hit,[shot('ball',[[393,212],[408,150],[350,139]]),shot('b1',[[445,115],[408,135]]),shot('a1',[[145,135],[235,100],[355,120]])],[355,139]),
  beat('Seven discs: “Lagori!”','The remaining attackers complete all seven and call “Lagori!” Green scores one. If every attacker were out first, coral would score.','Finish the tower',done,blocks.slice(3).map(n=>shot(n.id,[[rebuild.find(q=>q.id===n.id).x,rebuild.find(q=>q.id===n.id).y],[n.x,n.y]])),[320,190]),
  beat('Reset and swap roles','Rebuild the starting tower and swap attackers and fielders. Play six rounds with equal attacking turns; most points wins.','Swap roles',reset)
 ]};
}

{
 const base=[...court(),T('rule-label',320,40,'ONE OPEN-HAND STRIKE'),O('net','net',320,190,{w:9,h:250}),P('a',40,240,'a','A'),P('b',465,150,'b','B'),O('shuttle','shuttle',54,217,{r:12}),score('GREEN 0 : 0 CORAL')];
 const serve=S(base,{a:{x:150,y:240},shuttle:{x:453,y:170}},[T('one',450,110,'1 HIT')]);
 const back=S(serve,{b:{x:453,y:195},shuttle:{x:170,y:170}},[T('hand',170,120,'OPEN HAND')],['one']);
 const down=S(back,{a:{x:175,y:195},shuttle:{x:545,y:285,rotate:90},score:{label:'GREEN 1 : 0 CORAL'}},[ring('landing',545,285,22,{stroke:A}),T('point',515,250,'IN → +1')],['hand']);
 const again=S(base,{score:{label:'GREEN 1 : 0 CORAL'}},[T('winner',150,120,'RALLY WINNER SERVES')]);
 const set=S(base,{a:{x:465,y:150},b:{x:40,y:240},shuttle:{x:54,y:217},score:{label:'EXAMPLE: 11–9 · GREEN WINS SET'}},[T('sets',320,110,'FIRST TO TWO SETS')]);
 lessons.peteca={summary:'Strike the feathered shuttle over the net once and make it land in the opposite court.',legend:teams,steps:[
  beat('Start behind the baseline','Play singles here. Each side has one open-hand strike to return the peteca; there are no teammate passes.','Set up',base),
  beat('Serve with an open hand','Green strikes the peteca from behind the baseline. The shuttle crosses the net into coral’s court.','Serve the peteca',serve,[shot('shuttle',[[54,217],[245,95],[390,110],[453,170]])],[465,170]),
  beat('Return it with one strike','Coral returns it immediately with one open-hand strike. Catching, double touches and failed returns lose the rally.','Return once',back,[shot('shuttle',[[453,170],[390,95],[280,105],[170,170]])],[170,170]),
  beat('Land it inside the court','Green sends the next strike into an empty corner. The peteca lands inside coral’s court: one point to green.','Aim for the corner',down,[shot('shuttle',[[170,170],[285,90],[435,130],[545,285]])],[545,285]),
  beat('The rally winner serves','Reset the shuttle behind green’s baseline. In these starter rules, the side that won the rally serves next.','Serve the next rally',again),
  beat('Win a short set','Continue to eleven with a two-point lead; 11–9 is one winning example. Change ends during the set and win two sets for the match.','Finish a set',set)
 ]};
}

{
 const base=[...court(),T('rule-label',320,40,'THREE TOUCHES · NO HANDS'),O('net','net',320,190,{w:9,h:250}),ring('service',145,200,25),
  P('a1',145,200,'a','S'),P('a2',230,270,'a','T'),P('a3',230,115,'a','3'),P('b1',470,125,'b','1'),P('b2',490,260,'b','2'),P('b3',385,200,'b','3'),B('ball',218,251),score('GREEN 0 : 0 CORAL')];
 const toss=S(base,{ball:{x:158,y:179}},[T('call',150,145,'TOSS → KICK')]);
 const serve=S(toss,{ball:{x:454,y:144}},[T('touch',465,80,'RECEIVE')],['call']);
 const one=S(serve,{ball:{x:485,y:218}},[T('count',465,300,'TOUCH 1 · FOOT')],['touch']);
 const two=S(one,{ball:{x:398,y:165},count:{label:'TOUCH 2 · KNEE'}});
 const three=S(two,{ball:{x:195,y:120},count:{label:'TOUCH 3 · OVER'}});
 const point=S(three,{ball:{x:95,y:105},score:{label:'GREEN 0 : 1 CORAL'},count:{label:'CORAL SERVES NEXT'}},[ring('ground',95,105,24,{stroke:BTEAM})]);
 lessons['sepak-takraw']={summary:'Keep the ball airborne and return it over the net within three body touches.',legend:teams,steps:[
  beat('Three players on each side','The server stands on the service mark. A teammate supplies the toss. Use feet, legs, torso or head; hands and arms cannot touch the ball.','Set up',base),
  beat('Toss to the server','The teammate tosses to the server. The server kicks this ball over the net to start the rally.','Toss the ball',toss,[shot('ball',[[218,251],[195,160],[158,179]])],[145,200]),
  beat('Kick it across','Green’s serve travels into coral’s court. Coral now has up to three touches to return it.','Kick the serve',serve,[shot('ball',[[158,179],[260,80],[380,75],[454,144]])],[454,144]),
  beat('First touch keeps it up','Coral 1 lifts the ball with a foot towards teammate 2. Count one touch.','Make the first touch',one,[shot('ball',[[454,144],[520,125],[485,218]])],[490,260]),
  beat('Second touch sets it','Coral 2 raises the ball towards teammate 3. Count two. One player may also take multiple touches.','Set with the knee',two,[shot('ball',[[485,218],[455,110],[398,165]])],[385,200]),
  beat('Third touch goes over','Coral 3 returns it across. A fourth touch would lose the point; three is the limit.','Return on three',three,[shot('ball',[[398,165],[325,70],[260,70],[195,120]])],[250,130]),
  beat('Grounded ball: coral scores','The ball lands in green’s court. Coral gains one and serves next: serving teams alternate after every point. Win two sets; sets are to fifteen, or seventeen after 14–14.','Let it land',point,[shot('ball',[[195,120],[150,85],[95,105]])],[95,105])
 ]};
}

{
 const posts=[[470,200],[414,317],[287,346],[185,265],[185,135],[287,54],[414,83]];
 const base=[ring('outside',320,200,150),ring('inside',320,200,95),ring('central',320,200,35),O('tupu','bottle',320,195,{w:22,h:40,fill:C}),
  ...posts.map(([x,y],i)=>O(`pou${i}`,'cone',x,y,{fill:PAPER,label:String(i+1)})),
  P('k1',130,200,'a','K'),P('k2',505,270,'a','K'),P('g1',290,190,'a','G'),P('g2',350,190,'a','G'),
  P('t1',375,150,'b','T'),P('t2',265,250,'b','T'),P('t3',515,170,'b','T'),P('t4',175,65,'b','T'),B('ball',145,200),
  T('pending',95,330,'POU 0'),T('score',320,375,'KĪOMA 0 : 0 TANIWHA',{size:15})];
 const first=S(base,{k1:{x:166,y:268},ball:{x:185,y:265},pou3:{fill:A},pending:{label:'POU 1'}});
 const second=S(first,{k1:{x:166,y:135},ball:{x:185,y:135},pou4:{fill:A},pending:{label:'POU 2'}});
 const bank=S(second,{k1:{x:320,y:228},ball:{x:327,y:227},pending:{label:'POU 0'},score:{label:'KĪOMA 2 : 0 TANIWHA'}},[T('bank',320,310,'GROUND → BANK 2')]);
 const restart=S(base,{ball:{x:500,y:170},score:{label:'KĪOMA 2 : 0 TANIWHA'}},[T('restart',535,220,'RESTART',{size:11})]);
 const pass=S(restart,{ball:{x:369,y:133}},[T('shoot',370,105,'INNER SHOOTER')],['restart']);
 const hit=S(pass,{ball:{x:320,y:192},score:{label:'KĪOMA 2 : 1 TANIWHA'}},[T('next',320,310,'KĪOMA RESTART OUTSIDE')],['shoot']);
 lessons['ki-o-rahi']={summary:'Kīoma bank points from posts; Taniwha score by hitting the central tupu.',legend:[{color:A,label:'Kīoma / guards'},{color:BTEAM,label:'Taniwha'},{color:C,label:'Tupu target'}],steps:[
  beat('Two roles, three zones','This teaching adaptation has seven pou outside. Kīoma stay outside except two central guards; Taniwha have two inner players and outside teammates.','Set up',base),
  beat('Touch one new pou','A Kīoma carrier touches a pou with the ball: one pending point. Touching this same post again adds nothing.','Touch the first post',first,[shot('k1',[[130,200],[135,245],[166,268]]),shot('ball',[[145,200],[150,245],[185,265]])],[185,265]),
  beat('A different pou adds one','Kīoma travel outside to another post. Two different pou now mean two pending points; they have not yet been banked.','Touch another post',second,[shot('k1',[[166,268],[140,205],[166,135]]),shot('ball',[[185,265],[159,202],[185,135]])],[185,135]),
  beat('Carry in and ground','The scoring carrier crosses the inner ring and grounds centrally, banking both points. No passing during the crossing. A lost tag or ball would erase the pending total.','Bank both points',bank,[shot('k1',[[166,135],[220,140],[270,190],[320,228]]),shot('ball',[[185,135],[239,140],[289,190],[327,227]])],[320,228]),
  beat('Opponents restart outside','After either side scores, the other side restarts at the outer edge. Pending pou points reset to zero.','Restart with Taniwha',restart),
  beat('Pass to an inner player','Taniwha pass from outside to an inner shooter. Kīoma’s two central guards may block or catch without touching the barrel.','Pass into the ring',pass,[shot('ball',[[500,170],[440,130],[369,133]])],[375,150]),
  beat('Hit the tupu for one','The shot hits the central target: one Taniwha point. Kīoma restart outside. Swap roles every five minutes and compare totals after equal time.','Hit the target',hit,[shot('ball',[[369,133],[345,155],[320,192]])],[320,195])
 ]};
}

{
 const base=[Z('field',55,65,530,250),T('rule-label',320,40,'CLEAR HITTING FIELD'),Z('wait-zone',65,75,210,70,'WAIT BEHIND LINE','#e5e0ee'),L('safe-line',65,150,275,150,{dash:'5 6'}),
  ring('base',145,255,24),P('hitter',110,247,'a','A'),P('next',130,120,'b','B'),P('third',210,120,'c','C'),
  O('bat','block',125,235,{w:10,h:80,rotate:45,fill:A}),O('lippa','block',150,251,{w:29,h:8,rotate:10,fill:PAPER}),score('A · ATTEMPT 1 / 5')];
 const lift=S(base,{lippa:{x:174,y:194,rotate:65},bat:{x:153,y:233,rotate:25}},[T('up',202,185,'LIFT')]);
 const hit=S(lift,{lippa:{x:480,y:257,rotate:160},bat:{x:153,y:218,rotate:90}},[T('land',478,220,'STOPPED')],['up']);
 const measure=S(hit,{score:{label:'4 WHOLE BAT-LENGTHS = 4'}},[
  ...Array.from({length:4},(_,i)=>L(`measure${i}`,150+i*80,290,230+i*80,290,{stroke:i%2?BTEAM:A,width:5})),
  ...Array.from({length:4},(_,i)=>T(`number${i}`,190+i*80,310,String(i+1),{size:12})),
  L('remainder',470,290,480,290,{dash:'2 3'}),T('measure-label',325,335,'COUNT WHOLE LENGTHS',{size:12})
 ],['land']);
 const retrieve=S(measure,{hitter:{x:464,y:240}},[T('go',425,170,'RETRIEVE NOW')]);
 const next=S(base,{hitter:{x:130,y:120},next:{x:110,y:247},bat:{fill:BTEAM},score:{label:'A: 4+3+5+2+4 = 18 · B NEXT'}});
 lessons.lippa={summary:'Lift the short stick, strike it away and total the distance of five attempts.',legend:[{color:A,label:'Current hitter'},{color:BTEAM,label:'Next player'},{color:C,label:'Waiting player'}],steps:[
  beat('Clear the hitting area','The short lippa rests on a base with one tapered end exposed. Only the hitter is in front of the waiting line.','Set up',base),
  beat('Tap the tapered end','The long bat taps one end. The short stick lifts into the air.','Lift the lippa',lift,[shot('lippa',[[150,251],[158,218],[174,194]])],[150,251]),
  beat('Strike it while airborne','Strike the lifted stick away. Everybody waits until it lands and stops. A complete miss still uses an attempt.','Strike it away',hit,[shot('lippa',[[174,194],[285,100],[405,140],[480,257]])],[174,194]),
  beat('Measure whole bat-lengths','Measure from the base to the stopped stick. This throw reaches four whole bat-lengths; the short remainder adds nothing.','Measure the distance',measure,[],[310,290]),
  beat('Retrieve only on the signal','The leader gives the signal after measuring. The hitter retrieves the stick; the next attempt starts from the same base.','Give the retrieval signal',retrieve,[shot('hitter',[[110,247],[270,270],[464,240]])],[480,257]),
  beat('Five attempts, then the next player','An example five-throw total is eighteen. Give every player five attempts; the highest combined distance wins.','Pass the bat',next)
 ]};
}

{
 const base=[Z('field',55,65,530,250,'BOWL · HIT · EXCHANGE ENDS'),ring('left-base',180,200,30),ring('right-base',460,200,30),
  pin('left-target',176,194),pin('right-target',464,194),P('a1',180,228,'a','1'),P('a2',460,228,'a','2'),
  O('bat1','block',184,211,{w:7,h:38,fill:A}),O('bat2','block',456,211,{w:7,h:38,fill:A}),
  P('b1',75,200,'b','1'),P('b2',570,200,'b','2'),B('ball',90,200),score('GREEN RUNS 0 · CORAL RUNS 0')];
 const bowl=S(base,{ball:{x:443,y:201}},[T('bowl',315,155,'BOWL TO FAR TARGET')]);
 const hit=S(bowl,{ball:{x:420,y:90},bat2:{rotate:-55,y:204},b2:{x:500,y:125}},[],['bowl']);
 const exchange=S(hit,{a1:{x:460,y:228},a2:{x:180,y:228},bat1:{x:456,y:211},bat2:{x:184,y:211,rotate:0},b2:{x:430,y:108},ball:{x:443,y:110},score:{label:'ONE COMPLETE EXCHANGE → GREEN +1'}});
 const exposed=S(exchange,{a1:{x:320,y:275},a2:{x:320,y:130},bat1:{x:331,y:271},bat2:{x:331,y:126},ball:{x:176,y:195},'left-target':{rotate:90}},[T('out',180,155,'UNPROTECTED!')]);
 const swap=S(base,{a1:{x:75,y:200},a2:{x:570,y:200},b1:{x:180,y:228},b2:{x:460,y:228},bat1:{fill:BTEAM},bat2:{fill:BTEAM},score:{label:'GREEN RUNS 1 · CORAL BATS NEXT'}});
 lessons['bete-ombro']={summary:'Defend the targets, hit away and exchange batting ends to score runs.',legend:[{color:A,label:'Batting pair'},{color:BTEAM,label:'Fielding pair'}],steps:[
  beat('Two targets, two batters','A batter defends each target. A grounded bat inside its base makes that batter safe. Fielders bowl from behind the opposite ends.','Set up',base),
  beat('Bowl at the far target','Coral bowls the soft ball towards the right-hand target. Its batter tries to hit the ball away.','Bowl the ball',bowl,[shot('ball',[[90,200],[260,200],[443,201]])],[460,200]),
  beat('Hit away, then decide to run','The batter sends the ball into space. Fielders chase it; the batters may now exchange ends.','Hit into space',hit,[shot('ball',[[443,201],[405,145],[420,90]]),shot('b2',[[570,200],[500,125]])],[420,90]),
  beat('One exchange scores one','Both batters reach the opposite bases and ground their bats. This completed exchange scores one run in the teaching adaptation.','Exchange ends',exchange,[shot('a1',[[180,228],[300,270],[460,228]]),shot('a2',[[460,228],[320,135],[180,228]]),shot('bat1',[[184,211],[304,253],[456,211]]),shot('bat2',[[456,204],[316,111],[184,211]])]),
  beat('An exposed target can fall','On another attempted exchange, a fielder knocks over an unprotected target. Batting and fielding roles must switch; an airborne catch also switches them.','Hit the exposed target',exposed,[shot('ball',[[443,110],[335,165],[176,195]],.4,1),shot('a1',[[460,228],[320,275]],0,.5),shot('a2',[[180,228],[320,130]],0,.5)],[180,200]),
  beat('The other pair bats','Reset the targets. Coral now bats and green fields. Continue until one pair completes its tenth run.','Swap batting and fielding',swap)
 ]};
}

{
 const base=[P('a',200,155,'a','A',{r:23}),P('b',440,155,'b','B',{r:23}),
  O('al','block',179,231,{w:17,h:38,fill:WAIT}),O('ar','block',221,231,{w:17,h:38,fill:WAIT}),O('bl','block',419,231,{w:17,h:38,fill:WAIT}),O('br','block',461,231,{w:17,h:38,fill:WAIT}),
  T('al-label',179,270,'L'),T('ar-label',221,270,'R'),T('bl-label',419,270,'L'),T('br-label',461,270,'R'),
  T('a-role',200,85,'A: MATCH'),T('b-role',440,85,'B: DIFFERENT'),score('A 0 : 0 B')];
 const clap=S(base,{},[T('beat',320,155,'CLAP'),ring('clap',320,155,42,{stroke:C,dash:'4 6'})]);
 const jump=S(clap,{a:{y:125},b:{y:125},al:{y:205},ar:{y:205},bl:{y:205},br:{y:205},beat:{label:'JUMP'}});
 const same=S(base,{al:{y:195,fill:A},bl:{y:195,fill:BTEAM},score:{label:'LEFT + LEFT → A SCORES 1'}},[T('choice',320,205,'MATCH')]);
 const different=S(base,{al:{y:195,fill:A},br:{y:195,fill:BTEAM},score:{label:'LEFT + RIGHT → B SCORES 1'}},[T('choice',320,205,'DIFFERENT')]);
 const end=S(base,{'a-role':{label:'NEXT: A DIFFERENT'},'b-role':{label:'NEXT: B MATCH'},score:{label:'EXAMPLE: A REACHES 10 · SWAP ROLES'}});
 lessons.ampe={summary:'Clap, jump and choose a foot: matching or different feet decide who scores.',legend:[{color:A,label:'Player A'},{color:BTEAM,label:'Player B'},{color:C,label:'Shared beat'}],steps:[
  beat('Choose opposite scoring roles','A scores for matching feet; B scores for different feet. The L and R labels refer to each player’s own left and right.','Set up',base),
  beat('Clap on one shared beat','Clap together so both players make their choice at the same moment.','Clap together',clap,[],[320,155]),
  beat('Make a small jump','Jump together. Each player chooses one foot to put forward when landing.','Jump together',jump,[shot('a',[[200,155],[200,110],[200,125]]),shot('b',[[440,155],[440,110],[440,125]])]),
  beat('Both choose left: a match','Both land with their own left foot forward. The feet match, so A earns one point. Both choosing right would also match.','Land with matching feet',same,[],[320,205]),
  beat('Left and right: different','On the next beat, A chooses left and B chooses right. The feet differ, so B earns one point.','Try different feet',different,[],[461,195]),
  beat('Reach ten, then switch roles','Repeat until one player reaches ten. Swap matching and different scoring roles for the next game; groups can then rotate partners.','Switch scoring roles',end)
 ]};
}

{
 const base=[Z('area',55,65,530,250,'SEARCH AREA'),L('finish',75,290,565,290,{width:4}),T('finish-label',320,280,'START / FINISH',{size:12}),
  Z('hide1',145,130,65,55,'?','#dfe5d2'),Z('hide2',415,90,65,55,'?','#dfe5d2'),Z('hide3',385,205,65,55,'?','#dfe5d2'),
  token('t1',175,155,A),token('t2',445,115,BTEAM),token('t3',415,230,C),
  P('leader',320,50,'neutral','L'),P('a',175,330,'a','A'),P('b',320,330,'b','B'),P('c',460,330,'c','C'),score('ONE TOKEN PER SEARCHER')];
 const hidden=S(base,{t1:{opacity:0},t2:{opacity:0},t3:{opacity:0}});
 const search=S(hidden,{a:{x:170,y:195},b:{x:390,y:165},c:{x:485,y:220}},[T('call',320,105,'PILOLO!')]);
 const find=S(search,{a:{x:172,y:176},t1:{x:186,y:159,opacity:1},hide1:{opacity:.25}},[T('found',160,115,'FOUND ONE')],['call']);
 const first=S(find,{a:{x:175,y:330},t1:{x:189,y:314},b:{x:438,y:157},t2:{x:451,y:141,opacity:1},hide2:{opacity:.25},score:{label:'A FINISHES FIRST → ROUND WIN'}},[],['found']);
 const all=S(first,{b:{x:320,y:330},c:{x:460,y:330},t2:{x:334,y:314},t3:{x:474,y:314,opacity:1},hide3:{opacity:.25}});
 const next=S(hidden,{a:{x:320,y:50},leader:{x:175,y:330},score:{label:'A HIDES NEXT · NEW ROUND'}});
 lessons.pilolo={summary:'Find one hidden token and carry it back across the finish line first.',legend:[{color:A,label:'Searcher A'},{color:BTEAM,label:'Searcher B'},{color:C,label:'Searcher C'}],steps:[
  beat('Hide one token per player','The leader hides three tokens while these three searchers wait out of sight. Everybody then gathers behind the shared start-and-finish line.','Set up',hidden),
  beat('“Pilolo!” means search','The leader calls “Pilolo!” Searchers enter the agreed area, each looking for one token.','Start searching',search,[shot('a',[[175,330],[150,255],[170,195]]),shot('b',[[320,330],[360,245],[390,165]]),shot('c',[[460,330],[505,280],[485,220]])],[320,290]),
  beat('Find one, then go home','A finds a token. Take just one and head back; never take a token from another player.','Pick up one token',find,[shot('t1',[[175,155],[186,159]])],[175,155]),
  beat('Cross the line carrying it','A crosses the finish line with the token first and wins this round. B has also found one and is returning.','Run to the finish',first,[shot('a',[[172,176],[145,260],[175,330]]),shot('t1',[[186,159],[159,243],[189,314]])],[175,310]),
  beat('Let everyone finish','B and C complete their searches and return with one token each. Keep the round open until everyone finishes.','Bring everyone home',all,[shot('b',[[438,157],[385,255],[320,330]]),shot('c',[[485,220],[415,245],[460,330]]),shot('t2',[[451,141],[398,239],[334,314]]),shot('t3',[[415,230],[430,245],[474,314]])]),
  beat('Change the leader and hide again','A becomes the next leader. Hide the tokens again. Play five rounds and count first finishes, or celebrate each round separately.','Hide a new round',next)
 ]};
}

{
 const base=[ring('circle',320,195,120,{dash:'5 8'}),P('a',320,80,'a','A'),P('b',440,160,'b','B'),P('c',395,290,'c','C'),P('d',245,290,'a','D'),P('e',200,160,'b','E'),
  O('shuttle','shuttle',334,109,{r:12}),T('count',320,175,'CONTACTS 0'),T('rule',320,35,'NO HANDS / ARMS',{size:12}),score('BEST 0 · FIVE-MINUTE CHALLENGE')];
 const one=S(base,{shuttle:{x:402,y:135},count:{label:'CONTACTS 1'}});
 const two=S(one,{shuttle:{x:398,y:243},count:{label:'CONTACTS 2'}},[T('limb',488,195,'FOOT',{size:12})]);
 const three=S(two,{shuttle:{x:281,y:243},count:{label:'CONTACTS 3'}},[T('knee',410,330,'KNEE',{size:12})],['limb']);
 const ground=S(three,{shuttle:{x:285,y:320,rotate:90},count:{label:'RALLY ENDS: 3'},score:{label:'BEST 3'}},[ring('drop',285,320,20,{stroke:WAIT})],['knee']);
 const reset=S(base,{shuttle:{x:453,y:140},score:{label:'BEST 3 · B STARTS NEXT'}});
 lessons.jianzi={summary:'Keep the shuttle airborne together and beat your best contact count.',legend:[{color:A,label:'Circle players'},{color:BTEAM,label:'Circle players'},{color:C,label:'Circle players'}],steps:[
  beat('A circle shares one shuttle','This is a cooperative keep-up circle. Everyone has room to lift a leg. Count successful contacts together.','Set up',base),
  beat('Kick upward to start','A drops the jianzi towards a foot and kicks it up. The first successful contact makes the count one.','Make the first kick',one,[shot('shuttle',[[334,109],[340,65],[402,135]])],[334,109]),
  beat('Pass with another foot touch','B keeps the shuttle airborne and directs it towards C. That is contact two. Hands and arms cannot help.','Pass to C',two,[shot('shuttle',[[402,135],[460,120],[460,210],[398,243]])],[440,180]),
  beat('A knee can keep it alive','C lifts the shuttle with a knee towards D. Count three; feet are not the only legal body part.','Lift with a knee',three,[shot('shuttle',[[398,243],[350,185],[281,243]])],[395,270]),
  beat('The floor ends this rally','The shuttle falls before D returns it. The rally ends at three; record three as the group’s current best.','Let the rally end',ground,[shot('shuttle',[[281,243],[273,280],[285,320]])],[285,320]),
  beat('Start from zero with someone new','B starts the next rally at zero. Keep the best score and try to beat it before the five-minute session ends.','Begin another rally',reset)
 ]};
}

{
 const base=[Z('field',55,65,530,250,'CROSS TO SCORE'),Z('home',65,175,75,120,'SAFE','#d9e6bd'),Z('away',505,175,75,120,'SAFE','#d9e6bd'),
  L('half',320,80,320,305,{dash:'5 6'}),ring('kick-area',170,245,23),P('a1',170,244,'a','1'),P('a2',100,205,'a','2'),P('a3',100,267,'a','3'),
  P('roller',320,115,'b','R'),P('f1',425,135,'b','1'),P('f2',425,270,'b','2'),B('ball',320,135),score('RUNS 0')];
 const roll=S(base,{ball:{x:182,y:252}},[T('name',260,160,'“RUNNER 1!”')]);
 const kick=S(roll,{ball:{x:432,y:232},a1:{x:385,y:250},a2:{x:250,y:185}},[T('valid',385,195,'BEYOND HALFWAY')],['name']);
 const safe=S(kick,{a1:{x:540,y:250},a2:{x:360,y:185},f2:{x:430,y:235},ball:{x:443,y:224},score:{label:'RUNNER 1 HOME → RUNS 1'}},[],['valid']);
 const out=S(safe,{a2:{fill:WAIT},ball:{x:360,y:207}},[T('out',355,150,'2 OUT')]);
 const next=S(base,{a1:{x:540,y:250},a2:{x:598,y:120,fill:WAIT},a3:{x:170,y:244},score:{label:'RUNS 1 · ROLL TO RUNNER 3'}});
 const swap=S(base,{a1:{fill:BTEAM},a2:{fill:BTEAM},a3:{fill:BTEAM},roller:{fill:A},f1:{fill:A},f2:{fill:A},score:{label:'EQUAL INNINGS · CORAL RUNS NEXT'}});
 lessons.dibeke={summary:'Kick beyond halfway, then reach a safe box before the fielding ball hits you.',legend:[{color:A,label:'Runners'},{color:BTEAM,label:'Fielders'},{color:WAIT,label:'Out this innings'}],steps:[
  beat('Safe boxes at opposite ends','Green runs and coral fields. The roller calls one runner into the kicking area. Only the end boxes are safe.','Set up',base),
  beat('Call a name and roll','The roller calls runner 1 and rolls the ball towards them. They must kick it beyond halfway.','Roll to runner 1',roll,[shot('ball',[[320,135],[250,190],[182,252]])],[170,245]),
  beat('Kick long and run','The kick passes halfway, so runner 1 must cross. Runner 2 chooses to join. Missed or short kicks retry; three failures dismiss the kicker.','Kick beyond halfway',kick,[shot('ball',[[182,252],[300,220],[432,232]],0,.5),shot('a1',[[170,244],[280,260],[385,250]],.25,1),shot('a2',[[100,205],[170,180],[250,185]],.3,1)],[390,235]),
  beat('Reach the far safe box','Runner 1 reaches safety and scores one crossing in this adaptation. Coral retrieves the ball while runner 2 is still exposed.','Reach the safe box',safe,[shot('a1',[[385,250],[460,255],[540,250]]),shot('a2',[[250,185],[360,185]]),shot('f2',[[425,270],[430,235]])],[540,250]),
  beat('A low hit outside puts you out','The fielder gently throws below runner 2’s knees. That runner leaves this innings; a runner already inside the safe box cannot be put out.','Make the low throw',out,[shot('ball',[[443,224],[402,185],[360,207]])],[360,207]),
  beat('Everyone safe or out: restart','The action stops once everyone is safe or out. The roller calls the next runner; keep the completed crossing on the scoreboard.','Call runner 3',next),
  beat('Give each team an innings','Swap after five minutes or when everyone is out. Give equal innings; the team with more completed crossings wins.','Swap the teams',swap)
 ]};
}

{
 const ys=[100,150,200,250,300];
 const base=[Z('field',185,75,285,250,'KUBB'),L('left-line',185,75,185,325,{width:3}),L('right-line',470,75,470,325,{width:3}),
  ...ys.map((y,i)=>O(`ak${i}`,'block',185,y,{w:16,h:26,fill:A})),...ys.map((y,i)=>O(`bk${i}`,'block',470,y,{w:16,h:26,fill:BTEAM})),
  O('king','pin',327,200,{w:25,h:46,fill:C,label:'K'}),P('a',135,205,'a','A'),P('b',520,205,'b','B'),
  ...Array.from({length:6},(_,i)=>O(`bat${i}`,'block',85,110+i*32,{w:9,h:28,fill:PAPER})),score('SIX BATONS PER TURN')];
 const down=S(base,{bk1:{x:490,y:153,rotate:90},bat0:{x:518,y:153,rotate:180}},[T('fallen',490,115,'FALLEN')]);
 const field=S(down,{bk1:{x:275,y:155,rotate:0,label:'F'},bat0:{x:560,y:125},bat1:{x:560,y:160},bat2:{x:560,y:195},bat3:{x:560,y:230},bat4:{x:560,y:265},bat5:{x:560,y:300},score:{label:'CORAL’S REPLY · FIELD KUBB FIRST'}},[],['fallen']);
 const clear=S(field,{bk1:{x:258,y:163,rotate:90},bat0:{x:245,y:173,rotate:180}},[T('first',280,120,'FIELD CLEARED')]);
 const later=S(clear,Object.fromEntries([...ys.map((y,i)=>[`ak${i}`,{x:170,y,rotate:90,opacity:.45}]),['score',{label:'LATER: ALL GREEN KUBBS CLEARED'}]]),[],['first']);
 const win=S(later,{king:{rotate:90},bat1:{x:340,y:203,rotate:180},score:{label:'CORAL TOPPLES KING → CORAL WINS'}},[T('last',325,255,'KING LAST')]);
 lessons.kubb={summary:'Clear the field kubbs, then baseline kubbs, then topple the king last.',legend:[...teams,{color:C,label:'King'}],steps:[
  beat('Five kubbs on each baseline','The king stands in the middle. Green begins with six underarm, end-over-end baton throws from its baseline.','Set up',base),
  beat('A baseline kubb falls','Green knocks over one coral kubb. Finish the six-throw turn before coral replies. Never hit the king this early.','Knock over a kubb',down,[shot('bat0',[[85,110],[265,100],[450,150],[518,153]])],[470,150]),
  beat('Throw fallen kubbs back in','Before throwing batons, coral tosses its fallen kubb into green’s half. Stand it where it lands: it is now a field kubb.','Place the field kubb',field,[shot('bk1',[[490,153],[370,90],[275,155]])],[275,155]),
  beat('Clear the field kubb first','Coral must knock down this field kubb before attacking baseline kubbs. Surviving field kubbs would let green advance its next throwing line.','Clear the field kubb',clear,[shot('bat0',[[560,125],[410,110],[245,173]])],[275,155]),
  beat('Then clear the baseline','Continue through later turns. Here coral has finally cleared every green kubb. The king is now its legal final target.','Clear the remaining kubbs',later),
  beat('Return to the original baseline','The king shot comes from coral’s original baseline. Topple it now to win; toppling it before clearing the opposing kubbs loses immediately.','Topple the king last',win,[shot('bat1',[[560,160],[460,180],[340,203]])],[327,200])
 ]};
}

{
 const layout=[[1,350,215],[2,350,260],[3,390,195],[10,390,240],[4,390,285],[5,430,175],[11,430,220],[12,430,265],[6,430,310],[7,470,195],[9,470,240],[8,470,285]];
 const base=[Z('field',55,65,530,260,'NUMBERED PINS'),L('line',160,80,160,310,{dash:'5 6'}),P('a',115,235,'a','A'),P('b',105,115,'b','B'),
  O('thrower','block',135,225,{w:12,h:42,fill:PAPER}),...layout.map(([n,x,y])=>pin(`p${n}`,x,y,String(n))),score('A 0 : 0 B')];
 const single=S(base,{p12:{x:500,y:305,rotate:80},thrower:{x:465,y:283,rotate:140},score:{label:'ONE PIN: ITS NUMBER · A +12'}},[T('value',515,270,'12')]);
 const stand=S(single,{p12:{rotate:0},thrower:{x:135,y:225,rotate:0},a:{x:105,y:115},b:{x:115,y:235},score:{label:'A 12 : 0 B · B THROWS NEXT'}},[],['value']);
 const many=S(stand,{p7:{x:530,y:160,rotate:70},p9:{x:555,y:240,rotate:90},p8:{x:535,y:300,rotate:110},thrower:{x:505,y:230,rotate:160},score:{label:'THREE PINS: COUNT THEM · B +3'}});
 const late=S(many,{p7:{rotate:0},p9:{rotate:0},p8:{rotate:0},a:{x:115,y:235},b:{x:105,y:115},thrower:{x:135,y:225,rotate:0},score:{label:'LATER EXAMPLE: A HAS 47'}});
 const bust=S(late,{p8:{x:562,y:310,rotate:90},thrower:{x:544,y:291,rotate:160},score:{label:'47 + 8 = 55 → RESET A TO 25'}});
 const exact=S(many,{p7:{rotate:0},p9:{rotate:0},p8:{rotate:0},p6:{x:456,y:330,rotate:80},thrower:{x:443,y:318,rotate:160},score:{label:'WINNING EXAMPLE: B 44 + 6 = 50'}});
 lessons.molkky={summary:'Choose between one numbered pin and several pins to reach exactly fifty.',legend:teams,steps:[
  beat('Twelve pins and one thrower','Players take turns throwing the wooden pin underarm. The twelve numbered targets start together and will spread across the field.','Set up',base),
  beat('Exactly one falls: score its number','Only pin twelve falls fully. A scores twelve, even though just one pin fell.','Hit only twelve',single,[shot('thrower',[[135,225],[290,160],[465,283]])],[430,265]),
  beat('Stand it where it fell','Return pin twelve upright at its new position. Do not rebuild the original cluster. B takes the next throw.','Stand the pin in place',stand,[],[500,305]),
  beat('Several fall: score the count','B knocks down three pins. That scores three, regardless of the numbers printed on those pins.','Knock down three',many,[shot('thrower',[[135,225],[320,175],[505,230]])],[470,240]),
  beat('Keep the spread-out targets','Stand each fallen pin where it stopped and keep adding scores. In this later example, A has reached forty-seven.','Continue the game',late),
  beat('Above fifty resets to twenty-five','A knocks down only pin eight. Forty-seven plus eight is fifty-five, so A’s total resets to twenty-five.','See an overshoot',bust,[shot('thrower',[[135,225],[350,200],[544,291]])],[535,300]),
  beat('Exactly fifty wins','Retrieve the thrower for a winning example: B has forty-four and topples only six, reaching fifty exactly. Three consecutive scoreless throws eliminate a player.','Reach exactly fifty',exact,[shot('thrower',[[544,291],[310,335],[135,225],[300,245],[443,318]])],[430,310],2400)
 ]};
}

{
 const base=[Z('ground',55,65,530,250,'PÉTANQUE'),ring('circle',115,215,35),P('a',115,215,'a','A'),P('b',205,300,'b','B'),
  B('jack',135,205,{r:5,fill:C}),...Array.from({length:3},(_,i)=>B(`a${i}`,75+i*25,100,{fill:A,r:10})),...Array.from({length:3},(_,i)=>B(`b${i}`,175+i*25,100,{fill:BTEAM,r:10})),score('GREEN 0 : 0 CORAL')];
 const lead=S(base,{jack:{x:450,y:200},a0:{x:415,y:175}},[T('close',450,130,'JACK')]);
 const behind=S(lead,{a:{x:205,y:300},b:{x:115,y:215},b0:{x:515,y:205}},[T('again',475,260,'CORAL STILL FARTHER')]);
 const closer=S(behind,{b1:{x:477,y:205}},[T('turn',315,135,'GREEN MUST PLAY')],['again']);
 const end=S(closer,{a:{x:115,y:215},b:{x:205,y:300},a1:{x:434,y:195},a2:{x:450,y:218},b2:{x:535,y:260},score:{label:'TWO GREEN BOULES CLOSER → +2'}},
  [ring('cutoff',450,200,27,{stroke:BTEAM,dash:'3 5'}),T('one',407,214,'1',{size:12}),T('two',448,247,'2',{size:12})],['turn','close']);
 const reset=S(base,{circle:{x:450,y:200},a:{x:450,y:200},b:{x:535,y:285},jack:{x:436,y:184},score:{label:'GREEN 2 : 0 CORAL · GREEN STARTS'}});
 lessons.petanque={summary:'Finish with more boules closer to the jack than the opponents’ nearest boule.',legend:[...teams,{color:C,label:'Jack'}],steps:[
  beat('Throw from one shared circle','Singles uses three boules each. Keep both feet grounded in the circle during a throw. The jack is the small target ball.','Set up',base),
  beat('Jack, then the first boule','Green throws the jack six to ten metres, then sends its first boule near it.','Throw jack and boule',lead,[shot('jack',[[135,205],[290,115],[450,200]],0,.4),shot('a0',[[75,100],[135,200],[290,135],[415,175]],.4,1)],[450,200]),
  beat('Farther away means play again','Coral’s first boule finishes farther from the jack. Coral must throw again; turns do not simply alternate.','Try coral’s first boule',behind,[shot('b0',[[175,100],[135,200],[310,140],[515,205]])],[515,205]),
  beat('Become closest: switch the turn','Coral’s second boule is now closer than green’s first. Green must play until closer or out of boules.','Move closer to the jack',closer,[shot('b1',[[200,100],[135,200],[330,120],[477,205]])],[477,205]),
  beat('Count only the closer team','After all six boules, two green boules lie inside the distance of coral’s nearest. Green scores two; coral scores zero.','Finish and count the end',end,[shot('a1',[[100,100],[135,200],[434,195]],0,.4),shot('a2',[[125,100],[135,200],[450,218]],.3,.7),shot('b2',[[225,100],[135,200],[535,260]],.6,1)],[450,200]),
  beat('The scoring team starts again','Make the next throwing circle near the old jack. Green starts the new end. Continue until a team reaches thirteen.','Start the next end',reset)
 ]};
}

{
 const base=[Z('lane',55,95,530,220,'BOCCE LANE'),L('half',320,100,320,310,{dash:'4 7'}),P('a',90,195,'a','A'),P('b',90,270,'b','B'),
  B('pallino',110,182,{r:5,fill:C}),...Array.from({length:4},(_,i)=>B(`a${i}`,135+i*24,130,{r:10,fill:A})),...Array.from({length:4},(_,i)=>B(`b${i}`,135+i*24,285,{r:10,fill:BTEAM})),score('GREEN 0 : 0 CORAL')];
 const first=S(base,{pallino:{x:465,y:195},a0:{x:425,y:225}},[T('target',465,145,'PALLINO')]);
 const far=S(first,{b0:{x:535,y:225}},[T('again',425,285,'CORAL PLAYS AGAIN')]);
 const close=S(far,{b1:{x:481,y:195}},[T('turn',300,165,'GREEN’S TURN')],['again']);
 const bump=S(close,{a1:{x:425,y:180},a2:{x:465,y:217},a3:{x:481,y:195},b1:{x:535,y:165}},[T('bump',520,130,'CONTACT MOVES BALLS')],['turn','target']);
 const count=S(bump,{b2:{x:465,y:165},b3:{x:540,y:275},score:{label:'TWO GREEN BALLS CLOSER → +2'}},[ring('measure',465,195,30,{stroke:BTEAM,dash:'3 5'})],['bump']);
 const reverse=S(base,{a:{x:550,y:195},b:{x:550,y:270},pallino:{x:200,y:205},score:{label:'GREEN 2 : 0 CORAL · PLAY BACK'}},[L('direction',490,230,245,230,{arrow:true})]);
 lessons.bocce={summary:'Roll close to the pallino; the farther team keeps playing until it becomes closer.',legend:[...teams,{color:C,label:'Pallino'}],steps:[
  beat('Four balls per team','Eight large balls share a narrow lane. Green starts with the small pallino.','Set up',base),
  beat('Roll into the far half','Green rolls the pallino beyond halfway, then rolls its first ball towards it.','Roll pallino and ball',first,[shot('pallino',[[110,182],[290,190],[465,195]],0,.4),shot('a0',[[135,130],[110,200],[425,225]],.4,1)],[465,195]),
  beat('Coral is farther away','Coral’s first ball finishes farther from the pallino. Coral keeps rolling until it gets closer or runs out of balls.','Roll from coral',far,[shot('b0',[[135,285],[110,220],[535,225]])],[535,225]),
  beat('Now green must play','Coral’s second ball becomes the nearest. Green now has to improve its position.','Get closer',close,[shot('b1',[[159,285],[110,220],[481,195]])],[481,195]),
  beat('A ball can move another','Green uses its remaining balls. The last roll displaces coral’s close ball; contact is part of the game.','Move the closest ball',bump,[shot('a1',[[159,130],[110,200],[425,180]],0,.3),shot('a2',[[183,130],[110,200],[465,217]],.25,.6),shot('a3',[[207,130],[110,200],[481,195]],.55,.9),shot('b1',[[481,195],[515,180],[535,165]],.85,1)],[481,195],2400),
  beat('Finish all eight, then measure','Coral rolls its last two. Two green balls are nearer than coral’s nearest: two points to green only.','Finish the end',count,[shot('b2',[[183,285],[110,220],[465,165]],0,.5),shot('b3',[[207,285],[110,220],[540,275]],.5,1)],[465,195]),
  beat('Reverse direction for the next end','The scoring team begins again from the other end. First to twelve wins this starter game.','Play back the other way',reverse)
 ]};
}

{
 const bag=(id,x,y,fill)=>O(id,'block',x,y,{w:19,h:19,fill,rotate:12});
 const base=[Z('near-board',65,160,80,120,'', '#dfd3ad'),ring('near-hole',105,185,13,{fill:INK}),Z('far-board',425,110,130,185,'','#dfd3ad'),ring('hole',490,150,20,{fill:INK}),
  P('a',185,160,'a','A'),P('b',185,280,'b','B'),...Array.from({length:4},(_,i)=>bag(`a${i}`,235+i*32,90,A)),...Array.from({length:4},(_,i)=>bag(`b${i}`,235+i*32,315,BTEAM)),
  T('round',320,40,'ROUND: GREEN 0 : 0 CORAL'),score('TOTAL: GREEN 0 : 0 CORAL')];
 const hole=S(base,{a0:{x:490,y:150,opacity:.35},round:{label:'ROUND: GREEN 3 : 0 CORAL'}},[T('three',570,150,'+3',{size:15})]);
 const board=S(hole,{b0:{x:452,y:205},round:{label:'ROUND: GREEN 3 : 1 CORAL'}},[T('one',404,205,'+1',{size:15})]);
 const end=S(board,{a1:{x:520,y:240},a2:{x:385,y:285},a3:{x:455,y:270},b1:{x:490,y:150,opacity:.35},b2:{x:573,y:307},b3:{x:390,y:220},round:{label:'ALL 8 BAGS: GREEN 5 : 4 CORAL'}},[],['three','one']);
 const cancel=S(end,{score:{label:'5 − 4 = GREEN +1'}},[T('math',320,185,'ONLY THE DIFFERENCE',{size:12})]);
 const reset=S(base,{a:{x:590,y:150},b:{x:590,y:280},score:{label:'TOTAL: GREEN 1 : 0 CORAL'},round:{label:'NEXT ROUND · GREEN FIRST'}},[L('back',400,210,165,210,{arrow:true})]);
 lessons.cornhole={summary:'Alternate four bags each, then add only the difference between the round scores.',legend:teams,steps:[
  beat('Four bags each, one far board','Opponents alternate underarm throws towards the board at the other end. Finish all eight bags before scoring.','Set up',base),
  beat('Through the hole scores three','Green’s first bag goes through the hole: three potential round points.','Throw through the hole',hole,[shot('a0',[[235,90],[210,170],[365,75],[490,150]])],[490,150]),
  beat('On the board scores one','Coral’s bag rests on the board: one point. A ground-first bag scores zero and is removed.','Land on the board',board,[shot('b0',[[235,315],[210,265],[365,100],[452,205]])],[452,205]),
  beat('Alternate until every bag settles','The remaining throws leave green with five and coral with four: green has one hole and two board bags; coral has one hole and one board bag.','Finish all eight throws',end,[shot('a1',[[267,90],[370,100],[520,240]],0,.2),shot('b1',[[267,315],[380,80],[490,150]],.15,.35),shot('a2',[[299,90],[360,220],[385,285]],.3,.5),shot('b2',[[299,315],[460,220],[573,307]],.45,.65),shot('a3',[[331,90],[380,150],[455,270]],.6,.8),shot('b3',[[331,315],[360,250],[390,220]],.8,1)],[490,220],2400),
  beat('Cancel the smaller score','Subtract coral’s four from green’s five. Only one point is added to green’s running total.','Calculate the difference',cancel,[],[320,355]),
  beat('Play back from the other end','Collect the bags and throw towards the other board. Green scored, so green starts. First to twenty-one or more after a round wins; there is no bust.','Reverse the round',reset)
 ]};
}

{
 const goal=(id,x)=>[Z(`${id}-body`,x-29,155,58,115,'',PAPER),ring(`${id}-top`,x,155,29,{fill:WAIT}),L(`${id}-slot`,x-17,205,x+17,205,{width:8})];
 const base=[...goal('left',155),...goal('right',485),P('a1',100,250,'a','1'),P('a2',545,190,'a','2'),P('b1',100,110,'b','1'),P('b2',545,110,'b','2'),
  O('disc','disc',125,235,{r:12,fill:A}),T('example',320,65,'SHOT EXAMPLES'),score('DEFLECT 1 · DIRECT 2 · IN 3')];
 const one=S(base,{a2:{x:518,y:175},disc:{x:453,y:220}},[T('touch',535,155,'TOUCH',{size:12}),T('points',320,300,'DEFLECTED OUTSIDE → 1')]);
 const two=S(base,{disc:{x:456,y:238}},[T('points',320,300,'UNASSISTED OUTSIDE → 2')]);
 const three=S(base,{a2:{x:523,y:162},disc:{x:485,y:178,opacity:.5}},[T('points',320,300,'DEFLECTED INSIDE → 3')]);
 const partner=S(base,{disc:{x:560,y:240},a2:{x:545,y:255},a1:{x:100,y:180},example:{label:'PARTNER NOW THROWS BACK'}},[L('back',430,115,205,115,{arrow:true})]);
 const bust=S(partner,{disc:{x:155,y:178,opacity:.5},score:{label:'AT 20: A 3-POINT THROW → 17'}},[T('exact',320,300,'EXACTLY 21; OVERSHOOT SUBTRACTS')]);
 const instant=S(base,{disc:{x:485,y:204,opacity:.4},score:{label:'UNASSISTED ENTRY → INSTANT WIN'}},[T('win',320,300,'SLOT OR TOP · STAYS INSIDE')]);
 lessons.kanjam={summary:'Throw to your partner’s goal and compare assisted hits, direct hits and direct entries.',legend:teams,steps:[
  beat('Partners stand at opposite goals','Each pair has a thrower and a redirecting partner. The partner may touch the disc once, without catching or carrying it.','Set up',base),
  beat('Deflect onto the outside: one','The partner redirects the throw into the outside of the goal. This assisted outside hit scores one.','Redirect onto the goal',one,[shot('disc',[[125,235],[330,120],[520,170],[453,220]])],[518,175]),
  beat('Hit directly: two','Return the disc and compare another throw: it hits the outside with no partner touch. This direct outside hit scores two.','Try an unassisted hit',two,[shot('disc',[[453,220],[320,275],[125,235],[315,145],[456,238]])],[456,238],2400),
  beat('Deflect inside: three','Return the disc, then the partner redirects a fresh throw into the goal. An assisted entry scores three. A ground-first throw scores zero.','Deflect it inside',three,[shot('disc',[[456,238],[320,275],[125,235],[310,110],[523,155],[485,178]])],[485,155],2400),
  beat('Both partners throw once','The partner throws back towards the other goal. After both partners have thrown once, the opposing pair takes its team turn.','Throw back from the other end',partner),
  beat('An overshoot subtracts the throw','Exactly twenty-one is required. At twenty, a three-point throw would overshoot, so subtract three: the total becomes seventeen. Complete equal team turns.','See the overshoot rule',bust,[shot('disc',[[560,240],[365,120],[110,160],[155,178]])],[155,155]),
  beat('Direct entry wins immediately','Collect the disc. A fresh shot goes through the slot unassisted and stays inside: an immediate win, regardless of score. An unassisted top entry also wins.','Make a direct entry',instant,[shot('disc',[[155,178],[125,235],[330,205],[485,204]])],[485,205])
 ]};
}

{
 const bola=(id,x,y,fill)=>[token(`${id}l`,x-9,y+22,fill),token(`${id}r`,x+9,y+22,fill),O(`${id}cord`,'path',x,y,{d:'M-9 22Q0 -12 9 22',stroke:fill,width:3})];
 const moveBola=(id,x,y)=>({[`${id}l`]:{x:x-9,y:y+22},[`${id}r`]:{x:x+9,y:y+22},[`${id}cord`]:{x,y}});
 const flyBola=(id,points,start=0,end=1)=>[
  shot(`${id}l`,points.map(([x,y])=>[x-9,y+22]),start,end),
  shot(`${id}r`,points.map(([x,y])=>[x+9,y+22]),start,end),
  shot(`${id}cord`,points,start,end)
 ];
 const base=[L('left',430,80,430,310,{width:5}),L('right',550,80,550,310,{width:5}),
  L('top',430,115,550,115,{width:5}),L('middle',430,190,550,190,{width:5}),L('bottom',430,265,550,265,{width:5}),
  T('three',585,120,'3'),T('two',585,195,'2'),T('one',585,270,'1'),L('line',225,80,225,310,{dash:'5 6'}),P('a',130,130,'a','A'),P('b',130,270,'b','B'),
  ...bola('a1',175,115,A),...bola('a2',175,165,A),...bola('a3',175,215,A),...bola('b1',285,115,BTEAM),...bola('b2',285,165,BTEAM),...bola('b3',285,215,BTEAM),score('THREE BOLAS PER SIDE')];
 const green=S(base,{...moveBola('a1',455,106),...moveBola('a2',472,181),...moveBola('a3',525,181),score:{label:'GREEN: 3 + 2 + 2 ON THE FRAME'}});
 const coral=S(green,{...moveBola('a1',405,295),...moveBola('b1',455,106),...moveBola('b2',490,256),...moveBola('b3',568,295),score:{label:'ALL SIX THROWN · COUNT HANGING'}},[T('off',350,280,'KNOCKED OFF → 0',{size:12})]);
 const count=S(coral,{score:{label:'GREEN +4 · CORAL +4 · NO CANCELLATION'}});
 const finish=S(count,{score:{label:'LATER: GREEN 19+4 →19 · CORAL 17+4 →21'}},[T('bust',320,55,'OVER 21? DISCARD THE ROUND')],['off']);
 const reset=S(base,{score:{label:'CORAL WINS AT EXACTLY 21'},a:{x:130,y:270},b:{x:130,y:130}},[T('new',455,55,'CLEAR FRAME FOR A NEW GAME')]);
 lessons['ladder-toss']={summary:'Leave bolas hanging for points and finish a round on exactly twenty-one.',legend:teams,steps:[
  beat('Three rungs, three values','The top rung is three points, middle two, bottom one. Each side has three bolas and takes all three throws before the other side.','Set up',base),
  beat('Green throws all three','Green leaves one bola on top and two on the middle. Do not score or remove them yet.','Throw green’s three',green,[
   ...flyBola('a1',[[175,115],[155,150],[305,55],[455,106]],0,.34),
   ...flyBola('a2',[[175,165],[155,150],[305,85],[472,181]],.33,.67),
   ...flyBola('a3',[[175,215],[155,150],[350,85],[525,181]],.66,1)
  ],[490,190],2400),
  beat('Coral can knock one off','Coral’s top-rung throw dislodges green’s top bola. Coral also lands one on the bottom and misses one. Knocked-off bolas no longer count.','Throw coral’s three',coral,[
   ...flyBola('b1',[[285,115],[155,265],[310,65],[455,106]],0,.34),
   ...flyBola('a1',[[455,106],[420,180],[405,295]],.3,.55),
   ...flyBola('b2',[[285,165],[155,265],[330,150],[490,256]],.33,.67),
   ...flyBola('b3',[[285,215],[155,265],[350,165],[568,295]],.66,1)
  ],[455,115],2400),
  beat('Count what is still hanging','Green has two middle bolas: four. Coral has top plus bottom: four. This starter version adds both totals, with no bonuses or cancellation.','Count the hanging bolas',count,[],[490,190]),
  beat('Discard a round that overshoots','Later example: green’s nineteen plus four exceeds twenty-one, so green stays on nineteen. Coral’s seventeen plus four reaches exactly twenty-one.','Apply the exact-score rule',finish),
  beat('Complete the round, then declare it','Coral wins after the complete round. Clear the frame. Alternate the starting side; if both reach twenty-one together, play another round.','Clear the frame',reset)
 ]};
}

{
 const washer=(id,x,y,fill)=>ring(id,x,y,9,{stroke:fill,width:5});
 const base=[Z('near',65,155,90,115,'', '#dfd3ad'),ring('near-cup',110,212,20,{fill:PAPER}),
  Z('box',400,125,155,160,'', '#dfd3ad'),ring('cup',477,205,28,{fill:PAPER,stroke:INK}),P('a',205,145,'a','A'),P('b',205,270,'b','B'),
  ...Array.from({length:3},(_,i)=>washer(`a${i}`,265+i*32,100,A)),...Array.from({length:3},(_,i)=>washer(`b${i}`,265+i*32,305,BTEAM)),
  T('round',320,55,'ROUND GREEN 0 : 0 CORAL'),score('TOTAL GREEN 0 : 0 CORAL')];
 const cup=S(base,{a0:{x:477,y:205},round:{label:'IN THE CUP: GREEN 3'}},[T('three',477,160,'+3')]);
 const box=S(cup,{b0:{x:425,y:250},round:{label:'IN THE BOX: CORAL 1'}},[T('one',380,250,'+1')]);
 const end=S(box,{a1:{x:520,y:250},a2:{x:575,y:315},b1:{x:380,y:190},b2:{x:385,y:300},round:{label:'ALL 6 WASHERS: GREEN 4 : 1 CORAL'}},[],['one','three']);
 const cancel=S(end,{score:{label:'4 − 1 = GREEN +3'}},[T('math',320,180,'ONLY THE DIFFERENCE',{size:12})]);
 const reset=S(base,{a:{x:590,y:145},b:{x:590,y:270},round:{label:'NEXT ROUND: GREEN FIRST'},score:{label:'TOTAL GREEN 3 : 0 CORAL'}},[L('back',380,205,180,205,{arrow:true})]);
 lessons['washer-toss']={summary:'Toss into a cup-in-box target, then add only the difference in round scores.',legend:teams,steps:[
  beat('Three washers per side','Opponents alternate tossing towards the far box. Finish all six washers before working out the score.','Set up',base),
  beat('Inside the cup scores three','Green’s washer finishes inside the centre cup. It is worth three round points.','Find the centre cup',cup,[shot('a0',[[265,100],[235,170],[375,110],[477,205]])],[477,205]),
  beat('Elsewhere in the box scores one','Coral’s washer lands inside the box but outside its cup: one round point. Outside the box is zero.','Land inside the box',box,[shot('b0',[[265,305],[235,250],[350,140],[425,250]])],[425,250]),
  beat('Finish the alternating throws','Green adds one box washer and misses once. Coral’s other two miss. The settled round totals are four for green and one for coral.','Finish all six washers',end,[shot('a1',[[297,100],[380,140],[520,250]],0,.3),shot('b1',[[297,305],[350,160],[380,190]],.2,.5),shot('a2',[[329,100],[460,220],[575,315]],.45,.75),shot('b2',[[329,305],[380,230],[385,300]],.7,1)],[477,205],2400),
  beat('Subtract the lower score','Four minus one leaves three. Add three to green’s running total; coral adds nothing.','Cancel the round scores',cancel,[],[320,355]),
  beat('Play back towards the other box','Collect washers and reverse direction. The scoring side starts. First to twenty-one or more after a round wins.','Reverse the next round',reset)
 ]};
}

{
 const blue='#6095cf',red='#de7769',yellow='#ddc956';
 const base=[Z('lawn',55,65,530,250,'ONE CURRENT HOOP'),...[[150,130],[490,130],[490,270],[150,270],[265,195],[375,195]].map(([x,y],i)=>O(`h${i+1}`,'hoop',x,y,{w:30,h:36,fill:i===0?A:WAIT,label:String(i+1)})),
  B('blue',105,240,{fill:blue,r:10}),B('red',185,230,{fill:red,r:10}),B('black',230,280,{fill:INK,r:10}),B('yellow',270,245,{fill:yellow,r:10}),
  L('direction',150,210,150,95,{arrow:true}),T('turn',320,40,'BLUE → RED → BLACK → YELLOW'),score('BLUE / BLACK 0 : 0 RED / YELLOW')];
 const approach=S(base,{blue:{x:135,y:184}},[T('next',315,105,'RED NEXT')]);
 const contact=S(approach,{red:{x:150,y:184},blue:{x:105,y:175},next:{label:'HIT ≠ EXTRA STROKE · BLACK NEXT'}});
 const point=S(contact,{black:{x:150,y:95},score:{label:'BLACK COMPLETELY THROUGH → BLUE/BLACK +1'},next:{label:'YELLOW NEXT'}},[T('through',150,55,'+1')]);
 const nextHoop=S(point,{h1:{fill:WAIT},h2:{fill:A},direction:{x:490,y:205,x2:490,y2:95},yellow:{x:585,y:244},next:{label:'OUT? REPLACE AT THE BOUNDARY'}},[T('out',535,285,'BACK HERE')],['through']);
 const continueGame=S(nextHoop,{blue:{x:420,y:160},next:{label:'RED NEXT · FIXED ORDER CONTINUES'}},[],['out']);
 lessons.croquet={summary:'Take one stroke in a fixed colour order; the first ball through the current hoop scores.',legend:[{color:blue,label:'Blue + black team'},{color:red,label:'Red + yellow team'},{color:A,label:'Current hoop'}],steps:[
  beat('Everyone aims at the same hoop','This example begins at hoop one from its marked playing side. The stroke order is always blue, red, black, yellow.','Set up',base),
  beat('Blue takes one stroke','Blue approaches the current hoop. That uses its turn; red plays next.','Play blue’s stroke',approach,[shot('blue',[[105,240],[125,215],[135,184]])],[150,130]),
  beat('A hit gives no extra stroke','Red hits blue’s ball away. Contact is allowed, but red gets no bonus stroke. Black is still next.','Play red’s stroke',contact,[shot('red',[[185,230],[165,210],[150,184]],0,.7),shot('blue',[[135,184],[105,175]],.65,1)],[135,184]),
  beat('Completely through earns one','Black passes completely through the hoop from the correct side. Blue and black’s team earns one point.','Run the hoop',point,[shot('black',[[230,280],[170,180],[150,130],[150,95]])],[150,130]),
  beat('Next hoop, same ball positions','Everyone now contests the next hoop. Yellow’s stroke goes out; replace its ball where it crossed the boundary. Other balls stay where they stopped.','Play towards the next hoop',nextHoop,[shot('yellow',[[270,245],[455,243],[612,244],[585,244]])],[490,130]),
  beat('Keep the colour order','Blue plays again, then red. Follow the source’s twelve-hoop route. First to seven points wins; at six-all, contest hoop three again.','Continue towards seven points',continueGame,[shot('blue',[[105,175],[265,170],[420,160]])],[490,130])
 ]};
}

{
 const base=[Z('fairway',55,65,530,250,'HOLE 1'),Z('tee',70,200,85,65,'TEE','#d9e6bd'),
  L('pole',510,140,510,265,{width:4}),ring('basket',510,215,28,{fill:WAIT}),O('chains','net',510,183,{w:50,h:55}),
  P('a',100,225,'a','A'),P('b',100,285,'b','B'),O('da','disc',120,210,{r:10,fill:A}),O('db','disc',120,270,{r:10,fill:BTEAM}),score('THROWS: A 0 · B 0')];
 const drives=S(base,{da:{x:320,y:160},db:{x:255,y:260},a:{x:305,y:185},b:{x:240,y:285},score:{label:'THROWS: A 1 · B 1'}},[ring('lieA',320,160,15,{stroke:A,dash:'3 4'}),ring('lieB',255,260,15,{stroke:BTEAM,dash:'3 4'})]);
 const bnext=S(drives,{db:{x:430,y:245},b:{x:415,y:270},score:{label:'THROWS: A 1 · B 2'}});
 const ob=S(bnext,{da:{x:395,y:78},a:{x:380,y:95},score:{label:'A: 2 THROWS + 1 PENALTY = 3'}},[T('ob',440,40,'OUT OF BOUNDS'),ring('crossing',395,65,15,{stroke:BTEAM})]);
 const approach=S(ob,{da:{x:485,y:210},a:{x:470,y:235},score:{label:'THROWS INCLUDING PENALTY: A 4 · B 2'}},[],['ob','crossing']);
 const finish=S(approach,{db:{x:515,y:215},da:{x:505,y:225},score:{label:'HOLE TOTAL: A 5 · B 3'}},[T('in',510,290,'BOTH IN')]);
 const next=S(base,{fairway:{label:'HOLE 2'},score:{label:'RECORD A 5 · B 3, THEN NEXT TEE'}});
 lessons['disc-golf']={summary:'Play from each landing place and count every throw until the disc finishes in the basket.',legend:teams,steps:[
  beat('Start at the marked tee','Choose tees, baskets and boundaries before playing. Everyone throws one at a time from this tee.','Set up',base),
  beat('Each first throw counts one','A and B take their first throws. Their landing places become their next throwing positions. B is farther from the basket.','Throw from the tee',drives,[shot('da',[[120,210],[215,125],[320,160]],0,.45),shot('db',[[120,270],[180,200],[255,260]],.5,1)],[510,215],2300),
  beat('The farther player throws next','B throws from the previous landing place, not from the tee. B has now used two throws.','Throw from B’s lie',bnext,[shot('db',[[255,260],[350,170],[430,245]])],[255,260]),
  beat('Out adds one penalty','A’s second throw crosses the boundary. Add one penalty, making three strokes. Resume just inside where the disc last crossed out.','See an out-of-bounds throw',ob,[shot('da',[[320,160],[365,100],[395,65],[440,40],[395,78]])],[395,65]),
  beat('Continue from the new lie','A is farther away, so A throws again from the boundary lie. This approach makes A’s count four.','Approach the basket',approach,[shot('da',[[395,78],[455,115],[485,210]])],[395,78]),
  beat('Every finishing throw still counts','B finishes in three. A then finishes in five, including the penalty. A disc must finish in the basket for this hole to end.','Finish both putts',finish,[shot('db',[[430,245],[475,190],[515,215]],0,.45),shot('da',[[485,210],[500,190],[505,225]],.5,1)],[510,215]),
  beat('Record and move together','Record both hole totals, then move to the next tee. Lowest combined throw count across the agreed course wins.','Go to the next hole',next)
 ]};
}

{
 const base=[Z('square',355,105,175,205,'TARGET SQUARE'),L('throw-line',170,85,170,315,{dash:'5 6'}),P('a',120,200,'a','A'),P('b',110,110,'b','B'),
  ...Array.from({length:5},(_,i)=>O(`block${i}`,'block',380+i*30,205,{w:24,h:16,fill:PAPER})),
  O('bat1','block',135,180,{w:10,h:48,fill:A}),O('bat2','block',135,265,{w:10,h:48,fill:A}),score('A · THROWS 0 · CLEARED 0 / 5')];
 const hit=S(base,{block0:{x:560,y:145,rotate:20},block1:{x:570,y:195,rotate:60},block2:{x:558,y:250,rotate:110},block3:{x:532,y:210,rotate:0},bat1:{x:588,y:290,rotate:145},score:{label:'A · THROWS 1'}});
 const edge=S(hit,{score:{label:'FULLY OUT: 3 · STILL IN: 2'}},[ring('edge',530,210,25,{stroke:BTEAM}),T('edge-label',440,275,'EDGE IS STILL IN',{size:12})]);
 const clear=S(edge,{block3:{x:565,y:300},block4:{x:575,y:335,rotate:30},bat2:{x:535,y:340,rotate:140},score:{label:'ALL 5 CLEARED IN 2 THROWS'}},[],['edge','edge-label']);
 const reset=S(base,{a:{x:110,y:110},b:{x:120,y:200},bat1:{fill:BTEAM},bat2:{fill:BTEAM},score:{label:'RECORD A: 2 · REBUILD THE SAME FIGURE'}});
 const cross=S(reset,{block0:{x:440,y:200},block1:{x:440,y:170,rotate:90},block2:{x:440,y:230,rotate:90},block3:{x:410,y:200},block4:{x:470,y:200},score:{label:'NEXT AGREED FIGURE: CROSS'}});
 const well=S(cross,{block0:{x:425,y:165,w:70,h:14,rotate:0},block1:{x:460,y:200,w:14,h:70,rotate:0},block2:{x:425,y:235,w:70,h:14,rotate:0},block3:{x:390,y:200,w:14,h:70,rotate:0},block4:{x:425,y:200,w:30,h:14,rotate:0},score:{label:'ROW + CROSS + WELL · FEWEST THROWS WINS'}});
 lessons.gorodki={summary:'Clear every block completely outside the square using as few baton throws as possible.',legend:teams,steps:[
  beat('Build one five-block figure','Both sides play the same agreed figure. This example starts with a row. Use soft practice pieces and a clear throwing area.','Set up',base),
  beat('Take the first underarm throw','The baton scatters the row. Several blocks move outside, but a block’s centre crossing the line is not enough.','Scatter the row',hit,[shot('bat1',[[135,180],[330,180],[485,205],[588,290]])],[440,205]),
  beat('Count only fully cleared blocks','Three blocks are completely outside. One still overlaps the square’s edge and one remains inside. Leave them where they stopped.','Check the boundary',edge,[],[530,210]),
  beat('Use the second throw','The second baton clears the last two pieces completely. A used two throws for this figure.','Clear the last two',clear,[shot('bat2',[[135,265],[340,240],[515,210],[535,340]])],[500,205]),
  beat('Rebuild identically for the opponent','Record two throws for A. Rebuild the same row for B; each turn allows two baton throws, repeating as needed until the square is empty.','Reset for B',reset),
  beat('Repeat with the cross','After both sides finish the row, play the same agreed cross figure. Record every throw used.','Build the next figure',cross),
  beat('Then play the five-block well','Finish the short game with the well. Add each side’s throws across all three figures; the smaller total wins.','Build the final figure',well)
 ]};
}

export const LESSONS = lessons;
