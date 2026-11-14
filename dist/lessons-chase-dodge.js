import {P,B,O,Z,L,T,S,ring,INK,PAPER,A,BTEAM,C,WAIT} from './lesson-kit.js';

// Complete stills with persistent actor IDs. Tracks describe the actual route
// into a state; short annotations disappear before the next explanation.
const tr=(id,...points)=>({id,points});
const frame=(base,changes={},add=[],remove=[])=>S(base.filter(n=>!n.id.startsWith('note-')),changes,add,remove);
const note=(label,x=320,y=365,extra={})=>T('note-main',x,y,label,{size:16,...extra});
const cue=(id,label,x,y,extra={})=>T(`note-${id}`,x,y,label,{size:14,...extra});
const trail=(id,x,y,x2,y2)=>L(`note-${id}`,x,y,x2,y2,{dash:'5 6',arrow:true,opacity:.5});
const step=(title,text,action,nodes,focus=[320,200],tracks=[],duration=1800)=>{
 const waiting=nodes.some(n=>n.id==='wait-a');
 const layer=n=>n.kind==='zone'?0:n.kind==='line'?1:['ring','path'].includes(n.kind)?2:n.kind==='text'?4:3;
 const visible=nodes.map(n=>({...n,rotate:n.rotate??0,...(waiting&&n.kind==='text'&&n.id.startsWith('note-')&&n.y>=315?{y:321}:{})}));
 return{title,text,action,focus,nodes:visible.sort((a,b)=>layer(a)-layer(b)),tracks,duration};
};
const area=()=>[Z('court',30,48,580,300,'','#edf0e7')];
const halfCourt=({waiting=true,scoring=false}={})=>[
 Z('court',30,55,580,255,'','#edf0e7'),L('centre',320,55,320,310,{dash:'5 6'}),
 ...(waiting?[Z('wait-a',50,331,230,45,'GREEN WAITING','#e4e7e0'),Z('wait-b',360,331,230,45,'CORAL WAITING','#e4e7e0')]:[]),
 T('score-a',172,30,scoring?'GREEN 0':'GREEN TEAM'),T('score-b',468,30,scoring?'CORAL 0':'CORAL TEAM')
];
const six=()=>[
 P('a1',165,115,'a','A1'),P('a2',105,220,'a','A2'),P('a3',240,270,'a','A3'),
 P('b1',470,115,'b','B1'),P('b2',535,220,'b','B2'),P('b3',405,270,'b','B3')
];
const teamLegend=[{color:A,label:'Green team'},{color:BTEAM,label:'Coral team'},{color:WAIT,label:'Waiting / inactive'}];
export const LESSONS={};

{
 const castle=(id,x,y,fill)=>O(id,'path',x,y,{d:'M-27 22 Q0 36 27 22 Q0 9-27 22 M-25 21 Q-28-25 0-20 Q29-24 25 21 M-15 21 Q-19-23 0-20 Q20-24 15 21 M-17-21 Q0-31 18-21 Q0-12-17-21',fill:'none',stroke:fill,width:4});
 const s0=[...halfCourt({waiting:false,scoring:true}),...six(),castle('ac1',82,125,A),castle('ac2',95,272,A),castle('bc1',557,125,BTEAM),castle('bc2',552,270,BTEAM),B('ball',180,126)];
 const s1=frame(s0,{ball:{x:557,y:142},bc1:{rotate:75},'score-a':{label:'GREEN 1'}},[cue('point','CASTLE DOWN: +1',466,90)]);
 const s2=frame(s1,{ball:{x:407,y:283},b3:{x:407,y:270}},[cue('body','PLAYER HIT · STILL PLAYING',435,322)]);
 const s3=frame(s2,{bc1:{rotate:0},b2:{x:530,y:165},a3:{x:255,y:242},ball:{x:273,y:236}},[cue('build','REBUILD WHILE PLAY CONTINUES',448,90)]);
 const s4=frame(s3,{ball:{x:95,y:285},ac2:{rotate:-75},'score-b':{label:'CORAL 1'}},[cue('point','ANOTHER TOPPLE: +1',210,315)]);
 const s5=frame(s4,{},[note('FIVE MINUTES · COMPARE CASTLES TOPPLED')]);
 const s6=frame(s0,{},[note('REBUILD EVERY CASTLE · SCORES RESET')]);
 LESSONS.castleball={summary:'Knock down hoop castles for points, then keep playing while opponents rebuild them.',
  legend:[{color:A,label:'Green team and castles'},{color:BTEAM,label:'Coral team and castles'}],steps:[
   step('Build two castles per team','Each castle uses one flat hoop, four leaning sides and one top hoop. Practise stable builds before adding balls.','Build the hoop castles',s0),
   step('Throw to topple a castle','A1 throws from the green half and knocks down a coral castle. Green scores one point.','Knock down the first castle',s1,[557,125],[tr('ball',[180,126],[350,115],[557,142])]),
   step('Body hits do not eliminate players','This throw touches B3, who stays active. Players may block or catch, but nobody crosses centre.','Show a harmless player hit',s2,[407,270],[tr('ball',[557,142],[395,160],[407,283])]),
   step('Rebuild during the action','Coral rebuilds its fallen castle while other players continue. Rebuilding restores a target; it does not erase the point already scored.','Rebuild the fallen castle',s3,[557,125]),
   step('Both teams keep scoring topples','A coral throw knocks down a green castle. Coral adds one point; players remain active on both sides.','Score at the other end',s4,[95,272],[tr('ball',[273,236],[415,230],[95,285])]),
   step('Compare scores at five minutes','Call the stop and compare how many castles each team toppled. This example is tied at one each.','Stop and compare',s5,[320,365]),
   step('Rebuild before the next round','Put every castle upright again. Reset scores and start a fresh timed round.','Rebuild and reset',s6,[320,200])
  ]};
}

{
 const s0=frame([...halfCourt(),...six(),P('ap',120,170,'a','P'),P('bp',530,170,'b','P'),B('ball',455,130)],
  {a1:{x:230,y:115},a2:{x:240,y:215},a3:{x:160,y:275},b1:{x:415,y:115},b2:{x:405,y:215},b3:{x:500,y:275}},
  [cue('pres','PRESIDENTS DODGE · DO NOT THROW',320,325)]);
 const s1=frame(s0,{a2:{x:110,y:360,fill:WAIT},ball:{x:240,y:229}},[cue('out','GUARD OUT',248,250)]);
 const s2=frame(s1,{ball:{x:230,y:102},b1:{x:430,y:360,fill:WAIT},a2:{x:240,y:215,fill:A}},[cue('save','CATCH: THROWER OUT + ONE FRIEND BACK',323,325)]);
 const s3=frame(s2,{bp:{x:525,y:220},b2:{x:450,y:185},b3:{x:520,y:275},ball:{x:245,y:125}},
  [cue('space','GUARD WITH SPACE · NO GRABBING',455,105)]);
 const s4=frame(s3,{ball:{x:525,y:233},bp:{fill:WAIT},'score-a':{label:'GREEN WINS'}},[cue('hit','PRESIDENT HIT · ROUND OVER',448,325)]);
 const s5=frame(s0,{ap:{x:160,y:275,label:'A3'},a3:{x:120,y:170,label:'P'},bp:{x:500,y:275,label:'B3'},b3:{x:530,y:170,label:'P'}},
  [note('RESET ALL PLAYERS · NEW PRESIDENTS')]);
 LESSONS['protect-president']={summary:'Protect a non-throwing president; one legal hit on the opposing president ends the round.',
  legend:teamLegend,steps:[
   step('Choose a president on each team','Presidents are marked P. They may dodge within their half but do not throw. Their teammates are guards.','Choose the presidents',s0),
   step('Guards can be eliminated normally','A direct below-waist hit sends guard A2 to waiting. Bounced balls are dead.','Hit one of the guards',s1,[240,215],[
    {...tr('ball',[455,130],[240,229]),end:.5},{...tr('a2',[240,215],[110,360]),start:.55,end:1}]),
   step('A guard’s catch has two effects','B1 recovers the loose ball and throws again. A1 catches it: B1 goes out and waiting teammate A2 returns.','Catch and rescue one guard',s2,[230,115],[
    {...tr('ball',[240,229],[320,270],[415,102],[230,102]),end:.65},{...tr('b1',[415,115],[430,360]),start:.65,end:1},{...tr('a2',[110,360],[175,280],[240,215]),start:.65,end:1}],2300),
   step('The president can dodge too','The coral president moves to a new gap. Guards defend without grabbing or surrounding the president with contact.','Move the president into space',s3,[525,220]),
   step('One legal president hit wins','A1’s below-waist throw hits the coral president. The round ends immediately, even though coral still has active guards.','Hit the president',s4,[525,220],[tr('ball',[245,125],[385,225],[525,233])]),
   step('Rotate presidents and start again','Reset every guard and choose new presidents. If three minutes pass without a president hit, call a draw and rotate anyway.','Choose new presidents',s5,[530,170])
  ]};
}

{
 const s0=[Z('court',105,60,430,250,'','#edf0e7'),L('centre',320,60,320,310,{dash:'5 5'}),
  Z('outside-b',25,65,62,242,'B OUTSIDE','#ebd9d0'),Z('outside-a',553,65,62,242,'A OUTSIDE','#e1e8ce'),
  Z('buffer-left',87,65,18,242,'','#f0e6bc'),Z('buffer-right',535,65,18,242,'','#f0e6bc'),
  T('buffer-note',320,344,'2 m NO-THROW BUFFER BESIDE EACH OUTSIDE LANE',{size:12}),
  P('a1',205,110,'a','A1'),P('a2',160,210,'a','A2'),P('a3',260,270,'a','A3'),
  P('b1',435,110,'b','B1'),P('b2',485,210,'b','B2'),P('b3',380,270,'b','B3'),B('ball',420,123),B('ball2',390,280)];
 const s1=frame(s0,{a2:{x:584,y:190},ball:{x:160,y:223}},[cue('outside','STAYS ACTIVE OUTSIDE',453,30)]);
 const s2=frame(s1,{ball:{x:218,y:119}},[cue('pass','OUTSIDE PLAYERS CAN PASS',340,30)]);
 const s3=frame(s2,{b2:{x:55,y:190},ball:{x:485,y:223}},[cue('rear','A THROW FROM BEHIND',430,30)]);
 const s4=frame(s3,{ball:{x:435,y:97}},[cue('safe','CATCH IS SAFE · NO REVIVAL',345,30)]);
 const s5=frame(s4,{a1:{x:584,y:130},a3:{x:584,y:260},ball:{x:205,y:123},ball2:{x:260,y:283}},
  [cue('win','GREEN HALF EMPTY · CORAL WINS',330,30)]);
 const s6=frame(s0,Object.fromEntries(s0.filter(n=>n.kind==='player').map(n=>[n.id,{x:640-n.x}])),
  [note('EVERYONE INSIDE · SWITCH STARTING SIDES')]);
 s6.find(n=>n.id==='outside-a').label='B OUTSIDE';s6.find(n=>n.id==='outside-a').fill='#ebd9d0';
 s6.find(n=>n.id==='outside-b').label='A OUTSIDE';s6.find(n=>n.id==='outside-b').fill='#e1e8ce';
 LESSONS.nationball={summary:'Caught players keep throwing from an outside lane behind their opponents.',
  legend:[{color:A,label:'Green, inside or outside'},{color:BTEAM,label:'Coral, inside or outside'},{color:'#f0e6bc',label:'No-throw buffer'}],steps:[
   step('Give each team a lane behind the opponents','The outside lanes belong to the opposite-side teams. A two-metre no-throw buffer separates each lane from active court.','Place the outside lanes',s0),
   step('A hit moves you to your outside lane','A2 is hit below the waist and moves behind coral. The player is still on the green team, and stays outside for this round.','Send A2 behind the opponents',s1,[584,190],[
    {...tr('ball',[420,123],[160,223]),end:.5},{...tr('a2',[160,210],[320,325],[584,320],[584,190]),start:.5,end:1}],2300),
   step('Outside players can collect and pass','A2 collects a loose ball and passes it to A1. Outside players are not spectators.','Pass from the outside lane',s2,[205,110],[tr('ball',[160,223],[400,290],[584,207],[218,119])],2300),
   step('Outside players can throw at opponents','A2’s next throw hits B2 from behind. B2 moves to the coral outside lane behind green.','Attack from behind',s3,[485,210],[
    {...tr('ball',[218,119],[584,175],[485,223]),end:.6},{...tr('b2',[485,210],[320,325],[55,325],[55,190]),start:.6,end:1}],2300),
   step('Catching does not bring anyone inside','B1 catches A1’s live throw safely. No one is eliminated for this catch, and A2 and B2 stay outside.','Catch without changing the teams',s4,[435,110],[tr('ball',[485,223],[218,119],[435,97])]),
   step('An empty inside team loses','Later, the other green players are also hit and move outside. Green has nobody left inside, so coral wins.','Empty the green half',s5,[584,260],[
    {...tr('ball',[435,97],[205,123]),end:.4},{...tr('ball2',[390,280],[260,283]),start:.2,end:.5},
    {...tr('a1',[205,110],[320,40],[584,40],[584,130]),start:.5,end:1},{...tr('a3',[260,270],[320,325],[584,325],[584,260]),start:.5,end:1}],2300),
   step('Return everyone and switch sides','All players return inside. Swap starting halves and assign the outside lanes behind the new opponents.','Reset and switch ends',s6,[320,200])
  ]};
}

{
 const s0=[...area(),P('p1',145,125,'a','1'),P('p2',470,125,'a','2'),P('p3',465,270,'a','3'),P('p4',150,270,'a','4'),
  B('ball',163,132),B('spare',315,295),T('limit',320,28,'BALL HOLDER: 3 STEPS · 5 SECONDS',{size:13})];
 const s1=frame(s0,{p2:{fill:WAIT,pose:'seated'},ball:{x:470,y:139}},
  [L('got-2',470,125,145,125,{dash:'4 5',arrow:true,stroke:BTEAM}),cue('remember','2 REMEMBERS 1',320,88),cue('seed','SEED · NO BALL HANDLING',470,180)]);
 const s2=frame(s1,{p1:{fill:WAIT,pose:'seated'},p2:{fill:A,pose:'standing'},ball:{x:465,y:257}},
  [L('got-1',145,125,465,270,{dash:'4 5',arrow:true,stroke:BTEAM}),cue('revive','1 IS A SEED → 2 RETURNS',320,80)],['got-2']);
 const s3=frame(s2,{p4:{fill:WAIT,pose:'seated'},ball:{x:150,y:283}},
  [L('got-4',150,270,470,125,{dash:'4 5',arrow:true,stroke:BTEAM}),cue('remember','4 REMEMBERS 2',320,335)]);
 const s4=frame(s3,{p2:{fill:WAIT,pose:'seated'},p4:{fill:A,pose:'standing'},ball:{x:470,y:139}},
  [L('got-2b',470,125,465,270,{dash:'4 5',arrow:true,stroke:BTEAM}),cue('revive','2 IS A SEED → 4 RETURNS',320,335)],['got-4']);
 const s5=frame(s4,{p3:{fill:WAIT,pose:'seated'},p1:{fill:A,pose:'standing'},p2:{fill:A,pose:'standing'},ball:{x:150,y:257}},
  [L('got-3',465,270,150,270,{dash:'4 5',arrow:true,stroke:BTEAM}),cue('revive','3 IS A SEED → 1 AND 2 RETURN',320,83)],['got-1','got-2b']);
 const s6=frame(s0,{},[note('TIME · RESET ALL SEEDS')]);
 LESSONS['sprout-ball']={summary:'Become stationary when hit, then return when the person who got you becomes a seed.',
  legend:[{color:A,label:'Moving sprout'},{color:WAIT,label:'Seed: stationary, no ball handling'},{color:BTEAM,label:'Arrow points to who got you'}],steps:[
   step('Everyone begins as a moving sprout','There are no teams. Use two or three soft balls; a holder has at most three steps and five seconds before throwing.','Spread the sprouts',s0),
   step('Remember the player who got you','Player 1 hits player 2. Player 2 becomes a stationary seed who cannot handle balls, and remembers player 1.','Make player 2 a seed',s1,[470,125],[tr('ball',[163,132],[470,139])]),
   step('A catch can bring someone else back','Player 3 catches player 1’s live throw. Player 1 becomes a seed, so player 2 immediately sprouts again.','Catch and trigger the return',s2,[465,270],[tr('ball',[470,139],[163,132],[465,257])]),
   step('A different throw creates a new link','Player 2 hits player 4. Player 4 waits as a seed and remembers player 2; player 1 is still waiting for player 3.','Create another seed link',s3,[150,270],[tr('ball',[465,257],[470,111],[150,283])]),
   step('The next hit releases that seed','Player 3 hits player 2. Player 4 returns because the person who got them has just become a seed.','Release player 4',s4,[470,125],[tr('ball',[150,283],[465,257],[470,139])]),
   step('One catch can release several sprouts','Player 4 catches player 3’s throw. Player 3 becomes a seed, so both players 1 and 2 return: player 3 had got them both.','Release two players at once',s5,[150,270],[tr('ball',[470,139],[465,257],[150,257])]),
   step('Stop at one sprout or the timer','A sole moving sprout wins, but revivals can keep the round going. Here the timer ends; reset every seed.','Reset the growing game',s6,[320,365])
  ]};
}

{
 const s0=[...halfCourt(),...six(),B('ordinary',180,127),B('money',235,240,{r:17,label:'$'}),cue('key','LARGE $ BALL = MONEY BALL',350,325)];
 const s1=frame(s0,{ordinary:{x:535,y:207},a1:{x:120,y:360,fill:WAIT}},[cue('ordinary','ORDINARY CATCH: THROWER OUT',436,174)]);
 const s2=frame(s1,{money:{x:123,y:208}},[cue('five','THROW ACROSS CENTRE WITHIN 5 SECONDS',325,325)]);
 const s3=frame(s2,{money:{x:405,y:283},b3:{x:450,y:360,fill:WAIT},a1:{x:165,y:115,fill:A}},
  [cue('hit','MONEY HIT: TARGET OUT + ONE FRIEND BACK',320,325)]);
 const s4=frame(s3,{money:{x:452,y:129}},[cue('receive','CORAL NOW HAS THE MONEY BALL',407,75)]);
 const s5=frame(s4,{money:{x:240,y:253},'score-a':{label:'GREEN WINS'}},[cue('catch','MONEY BALL CAUGHT · INSTANT WIN',325,325)]);
 const s6=frame(s0,{},[note('RESET THE TWO BALL TYPES + ALL PLAYERS')]);
 LESSONS['money-ball']={summary:'Use the money ball to revive one teammate, but risk losing instantly if an opponent catches it.',
  legend:[{color:A,label:'Green team'},{color:BTEAM,label:'Coral team'},{color:'#e6cb62',label:'Larger $ money ball'}],steps:[
   step('Make the money ball unmistakable','Use a larger soft ball for the money ball. Ordinary balls retain their normal hit and catch rules.','Identify the two ball types',s0),
   step('An ordinary catch is only an out','B2 catches A1’s ordinary ball. A1 waits; ordinary-ball catches never revive teammates or win immediately.','Catch the ordinary ball',s1,[535,220],[
    {...tr('ordinary',[180,127],[535,207]),end:.55},{...tr('a1',[165,115],[120,360]),start:.6,end:1}]),
   step('The money ball cannot be hoarded','A2 controls the money ball. Throw it across centre within five seconds; deliberately rolling it eliminates the thrower.','Take the money ball',s2,[123,208],[tr('money',[235,240],[123,208])]),
   step('A money-ball hit has two effects','A2 legally hits B3 below the waist. B3 goes out, and one waiting green player returns.','Hit with the money ball',s3,[405,270],[
    {...tr('money',[123,208],[275,165],[405,283]),end:.6},{...tr('b3',[405,270],[450,360]),start:.6,end:1},{...tr('a1',[120,360],[180,280],[165,115]),start:.6,end:1}]),
   step('The other team prepares its throw','Coral recovers the money ball. B1 has the same five-second deadline and the same risk of a catch.','Recover the money ball',s4,[452,129],[tr('money',[405,283],[435,205],[452,129])]),
   step('A money-ball catch wins immediately','A3 catches B1’s live money-ball throw. Green wins at once, even with other coral players still active.','Catch for an instant win',s5,[240,270],[tr('money',[452,129],[345,150],[240,253])]),
   step('Return everyone for the next round','Reset all players and balls. Eliminating the whole opposing team is the other way to win.','Reset the money-ball round',s6,[320,200])
  ]};
}

{
 const s0=[Z('strip',120,90,400,140,'DODGING STRIP','#e3e9d7'),L('roll-line',115,310,525,310,{width:4}),
  Z('waiting',545,95,65,215,'WAIT','#e4e6de'),T('rolling',320,287,'ROLLING LINE'),P('roller',320,347,'b','R'),
  P('d1',175,185,'a','1'),P('d2',275,185,'a','2'),P('d3',375,185,'a','3'),P('d4',475,185,'a','4'),B('ball',320,326)];
 const s1=frame(s0,{d1:{x:150},d2:{x:578,y:135,fill:WAIT},d3:{x:400},d4:{x:495},ball:{x:275,y:199}},
  [cue('low','ROLLING HIT → WAIT',320,255)]);
 const s2=frame(s1,{ball:{x:320,y:326}},[cue('pause','PAUSE FOR RETRIEVAL',320,255)]);
 const s3=frame(s2,{d3:{x:578,y:195,fill:WAIT},d4:{x:470},ball:{x:400,y:199}},[cue('ready','READY? NEXT ROLL',320,255)]);
 const s4=frame(s3,{d1:{x:578,y:255,fill:WAIT},ball:{x:150,y:199}},[cue('last','PLAYER 4 IS THE LAST DODGER',330,255)]);
 const s5=frame(s0,{roller:{x:175,y:185,fill:A,label:'1'},d4:{x:320,y:347,fill:BTEAM,label:'R'},d1:{x:275,y:185},d2:{x:375,y:185},d3:{x:475,y:185}},
  [cue('new','LAST DODGER BECOMES ROLLER',320,255)]);
 LESSONS.rollerball={summary:'Dodge sideways inside the strip, then let the last dodger become the next roller.',
  legend:[{color:A,label:'Dodger'},{color:BTEAM,label:'Roller'},{color:WAIT,label:'Waiting this short round'}],steps:[
   step('Separate the roller from the dodgers','Mark a wide dodging strip and a rolling line a few metres away. One roller begins with the ball.','Mark the strip and rolling line',s0),
   step('Roll along the floor at the feet','Dodgers move sideways inside the strip. A below-waist rolling hit sends player 2 to waiting; a high throw would not count.','Roll at the dodgers',s1,[275,185],[
    {...tr('ball',[320,326],[300,270],[275,199]),end:.6},{...tr('d2',[275,185],[525,235],[578,135]),start:.6,end:1}]),
   step('Pause while retrieving the ball','Nobody starts the next roll yet. Retrieve the ball and wait until every dodger is ready.','Retrieve during the pause',s2,[320,326],[tr('ball',[275,199],[110,250],[110,326],[320,326])],2100),
   step('Restart only when everyone is ready','The next low roll catches player 3. Players 1 and 4 keep dodging sideways in their strip.','Roll again when ready',s3,[400,185],[
    {...tr('ball',[320,326],[365,265],[400,199]),end:.55},{...tr('d3',[400,185],[525,235],[578,195]),start:.6,end:1}]),
   step('The final remaining dodger wins','After retrieval, another low roll catches player 1. Player 4 is the last dodger in the strip.','Find the last dodger',s4,[150,185],[
    {...tr('ball',[400,199],[525,250],[320,326],[235,270],[150,199]),end:.7},{...tr('d1',[150,185],[120,245],[578,255]),start:.7,end:1}],2400),
   step('Give the winner a new job','Player 4 becomes the roller. All waiting players and the previous roller return as dodgers.','Rotate roller and reset',s5,[320,347])
  ]};
}

{
 const s0=[...halfCourt().filter(n=>!n.id.startsWith('wait-')),...six(),
  Z('rescue-a',571,140,39,165,'A','#dfe7c7'),Z('rescue-b',30,140,39,165,'B','#ebd8cd'),
  ...[125,515].flatMap((x,i)=>[
   L(`backboard-${i}`,x-30,61,x+30,61,{width:5}),
   O(`basket-net-${i}`,'path',x,77,{d:'M-20 0 L-12 29 H12 L20 0 M-8 3 L-4 29 M8 3 L4 29 M-17 11 H17 M-15 21 H15',fill:'none',stroke:INK,width:1.4}),
   O(`hoop-${i?'b':'a'}`,'hoop',x,77,{r:22,h:8,stroke:BTEAM,width:4})
  ]),
  B('ball',455,128),B('ball2',515,236),note('HITS BELOW THE WAIST · STAY IN YOUR HALF')];
 const s1=frame(s0,{a2:{x:590,y:200,fill:WAIT},a3:{x:590,y:260,fill:WAIT},ball:{x:105,y:235},ball2:{x:240,y:282}},
  [cue('wait','CAUGHT PLAYERS WAIT BEHIND OPPONENTS',350,340)]);
 const s2=frame(s1,{ball:{x:590,y:187},a2:{fill:A}},[cue('catch','CATCH YOUR TEAMMATE’S PASS',442,320)]);
 const s3=frame(s2,{a2:{x:185,y:245},ball:{x:515,y:77}},[cue('basket','BASKET!',516,140)]);
 const s4=frame(s3,{a3:{x:230,y:270,fill:A}},[cue('all','EVERY WAITING TEAMMATE RETURNS',337,340)]);
 const s5=frame(s4,{b1:{x:49,y:173,fill:WAIT},b2:{x:49,y:223,fill:WAIT},b3:{x:49,y:273,fill:WAIT},'score-a':{label:'GREEN WINS'}},
  [note('NO CORAL PLAYERS LEFT INSIDE · ROUND OVER')]);
 const s6=frame(s0,{},[note('RESET EVERYONE · ROTATE STARTING SIDES')]);
 LESSONS['hoop-rescue']={summary:'Rescue a waiting teammate with a pass, or rescue everyone with one basket.',
  legend:teamLegend,steps:[
   step('Give captured opponents a rescue zone','Each team stays in its half. Caught players wait in the floor zone behind the opposing team.','Set up the rescue court',s0),
   step('Direct hits send players to waiting','These two below-waist hits send A2 and A3 to the rescue zone. Bounced hits do not count.','Send two players to rescue',s1,[105,220],[
    {...tr('ball',[455,128],[105,235]),end:.35},{...tr('a2',[105,220],[330,320],[590,200]),start:.35,end:.7},
    {...tr('ball2',[515,236],[240,282]),start:.4,end:.65},{...tr('a3',[240,270],[400,325],[590,260]),start:.65,end:1}],2400),
   step('A waiting player can catch a pass','A1 recovers the ball and passes to waiting A2. The catch earns A2 a free walk home; an active-player catch has no extra bonus.','Catch the rescue pass',s2,[590,200],[tr('ball',[105,235],[180,125],[390,100],[590,187])],2200),
   step('Shoot a basket from your half','A2 passes back and walks safely home. A1 scores in the opposing basket without crossing centre.','Score the rescue basket',s3,[515,77],[
    tr('a2',[590,200],[595,325],[330,330],[185,245]),tr('ball',[590,187],[180,125],[315,55],[450,45],[515,77])],2400),
   step('The whole waiting team comes back','Every green player still waiting may return. Pause throws for the walk home; play then continues.','Bring everyone home',s4,[590,260],[tr('a3',[590,260],[560,325],[340,330],[230,270])]),
   step('Leave no opponents active to win','Later, all coral players have been sent to rescue. With nobody left in their half, green wins the round.','Show the round-ending condition',s5,[49,223]),
   step('Reset all players for another round','Release both rescue zones, share the balls and rotate starting sides.','Reset the rescue game',s6,[320,200])
  ]};
}

{
 const s0=[...halfCourt({scoring:true}),...six(),Z('keeper-a',35,142,65,75,'K','#e0e8cd'),Z('keeper-b',540,142,65,75,'K','#eddccf'),
  L('goal-a',40,146,40,212,{width:7}),L('goal-b',600,146,600,212,{width:7}),
  P('ak',75,180,'a','K'),P('bk',567,180,'b','K'),L('noodle-a',91,160,91,202,{width:8,stroke:A}),
  L('noodle-b',550,160,550,202,{width:8,stroke:A}),B('ball',518,230)];
 const s1=frame(s0,{ball:{x:105,y:233},a2:{x:110,y:360,fill:WAIT}},[note('DIRECT LOW HIT → WAIT UNTIL THE NEXT POINT')]);
 const s2=frame(s1,{ball:{x:540,y:179}},[cue('block','NOODLE BLOCK · KEEPER STAYS',430,83)]);
 const s3=frame(s2,{ball:{x:240,y:255},b2:{x:455,y:360,fill:WAIT}},[cue('catch','CATCH → THROWER OUT',249,218)]);
 const s4=frame(s3,{bk:{y:150},'noodle-b':{y:128,y2:163},ball:{x:605,y:199},'score-a':{label:'GREEN 1'}},
  [cue('goal','LOW BALL THROUGH GOAL: +1',430,298)]);
 const s5=frame(s4,{},[note('POINT ENDS · EVERYBODY RETURNS')]);
 const s6=frame(s0,{'score-a':{label:'GREEN 1'},ak:{x:165,y:115,label:'A1'},a1:{x:75,y:180,label:'K'},bk:{x:470,y:115,label:'B1'},b1:{x:567,y:180,label:'K'}},
  [note('ROTATE KEEPERS · FIRST TO THREE POINTS')]);
 LESSONS['noodle-keeper']={summary:'Protect a low goal with a noodle while ordinary hits and catches still eliminate players.',
  legend:teamLegend,steps:[
   step('Put one keeper in each goal area','Two teams stay on their halves. Each keeper has a low-held noodle and a wide cone goal to defend.','Set the goals and keepers',s0),
   step('Ordinary low hits still put you out','A direct hit below the waist sends A2 to waiting. Floor-bounced hits do not count.','Make a direct low hit',s1,[105,220],[
    {...tr('ball',[518,230],[105,233]),end:.55},{...tr('a2',[105,220],[110,360]),start:.6,end:1}]),
   step('The noodle stops a rolling ball','Green recovers the ball and rolls toward goal. The keeper blocks with the noodle held low; noodle contact alone does not eliminate the keeper.','Block the roll',s2,[550,180],[tr('ball',[105,233],[185,180],[380,180],[540,179])]),
   step('A clean catch eliminates the thrower','B2 collects the blocked ball, then throws. A3 catches the live throw, so B2 goes out; the keeper stays active.','Catch a live throw',s3,[240,270],[
    {...tr('ball',[540,179],[535,206],[390,225],[240,255]),end:.65},{...tr('b2',[535,220],[455,360]),start:.65,end:1}]),
   step('Send a low ball through the goal','The keeper misses this roll. It passes below knee height through the goal and scores green one point.','Roll through the open gap',s4,[600,199],[tr('ball',[240,255],[400,205],[605,199])]),
   step('A point ends this short round','Everyone returns after a goal or a full-team elimination. No one waits through the next point.','End the point',s5,[320,365]),
   step('Rotate keepers and keep the score','Choose fresh keepers and share the balls evenly. The first team to three points wins.','Return players and rotate',s6,[567,180])
  ]};
}

{
 const s0=frame([...halfCourt({waiting:false}),...six(),B('ball',450,130),B('ball2',195,280)],{a1:{label:'M'},b1:{label:'M'}},
  [note('MEDICS ARE SHOWN HERE · KEEP THEM SECRET IN PLAY')]);
 const s1=frame(s0,{a2:{fill:WAIT},ball:{x:105,y:234}},[ring('stuck-a2',105,220,23,{dash:'4 4'}),cue('still','STAY AT THIS SPOT',144,177)]);
 const s2=frame(s1,{ball:{x:535,y:234},b2:{fill:WAIT}},[ring('stuck-b2',535,220,23,{dash:'4 4'}),note('STATIONARY PLAYERS CAN STILL CATCH + THROW')]);
 const s3=frame(s2,{a1:{x:129,y:202},a2:{fill:A}},[cue('heal','MOVING MEDIC: HEALED',185,153)],['stuck-a2']);
 const s4=frame(s3,{a1:{fill:WAIT},ball:{x:129,y:216}},[ring('stuck-medic',129,202,23,{dash:'4 4'}),cue('no','HIT MEDIC CANNOT HEAL',203,151)]);
 const s5=frame(s4,{},[note('FIVE MINUTES · BOTH TEAMS STILL MOVING · DRAW')]);
 const s6=frame(s0,{a1:{label:'A1'},b1:{label:'B1'},a3:{label:'M'},b3:{label:'M'}},[note('RESET EVERYONE · CHOOSE NEW MEDICS')]);
 LESSONS['medic-dodgeball']={summary:'Keep a medic moving so they can restore stationary teammates with a shoulder tap.',
  legend:[{color:A,label:'Green team'},{color:BTEAM,label:'Coral team'},{color:WAIT,label:'Stationary, still able to throw'}],steps:[
   step('Secretly choose one medic per team','The host knows both medics. Our teaching diagram marks them M so you can see how healing works.','Choose the medics',s0),
   step('A hit makes you stationary','A direct low hit or dropped catch makes you stay at your current spot. You do not leave the court.','Make a player stationary',s1,[105,220],[tr('ball',[450,130],[105,234])]),
   step('Stationary does not mean unable to play','A2 picks up the ball without leaving the spot, then hits B2. Stationary players can catch and throw; a catch makes its thrower stationary.','Throw from the fixed spot',s2,[535,220],[tr('ball',[105,234],[105,206],[300,190],[535,234])]),
   step('A moving medic can restore you','The green medic touches A2’s shoulder. A2 can move again immediately.','Tap to heal',s3,[105,220],[tr('a1',[165,115],[150,155],[129,202])]),
   step('A hit medic loses the healing power','Stationary B2 hits the medic. The medic now stays planted and cannot heal anyone, including themselves, although they can still catch and throw.','Hit the medic',s4,[129,202],[tr('ball',[535,234],[535,206],[260,200],[129,216])]),
   step('Stop at full freeze or five minutes','Here five minutes end with moving players on both teams: a draw. Making the entire opposing team stationary wins earlier.','Call the timed finish',s5,[320,365]),
   step('Reset and choose different medics','Everyone moves again. Quietly give the medic jobs to new players before restarting.','Choose new medics',s6,[240,270])
  ]};
}

{
 const s0=[ring('pit',320,200,155,{width:6}),Z('waiting',535,90,70,255,'OUT','#e3e6de'),
  P('p1',220,110,'a','1'),P('p2',420,110,'a','2'),P('p3',445,245,'a','3'),P('p4',245,292,'a','4'),P('p5',181,204,'a','5'),B('ball',320,155),
  cue('serve','HAND ON THE WALL TO START',320,30)];
 const s1=frame(s0,{ball:{x:320,y:215}},[cue('call','GA · GA · GO',320,25)]);
 const s2=frame(s1,{p1:{x:300,y:215},p3:{x:570,y:145,fill:WAIT},ball:{x:445,y:259}},[note('BELOW KNEE → OUT')]);
 const s3=frame(s2,{ball:{x:420,y:124},p1:{x:570,y:195,fill:WAIT}},[cue('catch','AIRBORNE CATCH',404,30)]);
 const s4=frame(s3,{ball:{x:506,y:135},p2:{x:570,y:245,fill:WAIT}},[cue('wall','LAST TOUCHER OUT',430,30),note('BALL OUTSIDE · PAUSE + RETRIEVE')]);
 const s5=frame(s4,{p5:{x:570,y:295,fill:WAIT},p4:{x:245,y:240},ball:{x:181,y:218}},[cue('winner','PLAYER 4 WINS',310,284)]);
 const s6=frame(s0,{},[note('EVERYONE RETURNS · THREE NEW BOUNCES')]);
 LESSONS.gaga={summary:'Use open-hand strikes to dodge below-knee contacts and be the last player in the pit.',
  legend:[{color:A,label:'Still in the pit'},{color:WAIT,label:'Out until next round'}],steps:[
   step('Start with a hand on the wall','Everyone begins inside a safe pit. Keep the entry and exit clear. A host drops the ball into the centre.','Enter the pit',s0),
   step('Wait for the third bounce','Call “ga, ga, go” on three bounces. Play begins on “go”.','Bounce ga, ga, go',s1,[320,215],[tr('ball',[320,155],[320,215],[320,165],[320,215],[320,185],[320,215])],2100),
   step('Strike with an open hand','Player 1 strikes the ball along the floor. Its below-knee contact puts player 3 out—even an own hit would count.','Strike below the knees',s2,[445,245],[
    {...tr('p1',[220,110],[300,215]),end:.3},{...tr('ball',[320,215],[380,236],[445,259]),start:.3,end:.6},{...tr('p3',[445,245],[487,285],[570,145]),start:.65,end:1}]),
   step('A clean airborne catch reverses it','Player 1 reaches the loose ball and strikes it airborne. Player 2 catches it, so the last hitter, player 1, leaves the pit.','Catch the airborne ball',s3,[420,110],[
    {...tr('ball',[445,259],[460,195],[420,124]),start:.35,end:.65},tr('p1',[300,215],[426,249],[487,285],[570,195])],2200),
   step('Over the wall means a pause','Player 2 sends the ball outside. As the last toucher, player 2 is out. Pause, retrieve the ball and restart with three bounces.','Send it over the wall',s4,[500,135],[tr('ball',[420,124],[460,80],[506,135])]),
   step('The last player remaining wins','After the three-bounce restart, player 4 strikes a low ball that catches player 5. Player 4 is the last one in.','Restart and finish the round',s5,[181,204],[
    {...tr('ball',[506,135],[320,155],[320,215],[320,170],[320,215],[320,190],[320,215],[245,228],[181,218]),end:.75},{...tr('p5',[181,204],[180,325],[490,325],[570,295]),start:.75,end:1}],2400),
   step('Bring everyone back','All players return for a new short round. Begin again with a hand on the wall and three bounces.','Reset the pit',s6,[320,200])
  ]};
}

{
 const s0=[Z('court',30,60,580,250,'','#edf0e7'),L('vertical',320,60,320,310,{width:3}),L('horizontal',30,185,610,185,{width:3}),
  P('a1',130,100,'a','A1'),P('a2',235,145,'a','A2'),P('b1',435,100,'b','B1'),P('b2',550,145,'b','B2'),
  P('c1',130,230,'c','C1'),P('c2',235,275,'c','C2'),P('d1',435,230,'neutral','D1'),P('d2',550,275,'neutral','D2'),
  B('ball',147,113),B('ball2',420,113),T('outside',320,370,'OUTSIDE COURT = WAITING')];
 const s1=frame(s0,{d1:{x:530,y:345,opacity:.4},ball:{x:435,y:244}},[cue('out','D1 OUT',524,318)]);
 const s2=frame(s1,{ball2:{x:235,y:132},b1:{x:250,y:345,opacity:.4}},[cue('catch','A2 CATCHES · B1 OUT',224,30)]);
 const s3=frame(s2,{ball:{x:550,y:288},d2:{x:580,y:345,opacity:.4}},[cue('team','NO D PLAYERS LEFT',473,215)]);
 const s4=frame(s3,{},[note('THREE MINUTES · SEVERAL TEAMS REMAIN · DRAW',320,30)]);
 const s5=frame(s0,{},[note('RESET ALL FOUR TEAMS',320,30)]);
 LESSONS['four-corners']={summary:'Stay in your own square while choosing threats among three opposing teams.',
  legend:[{color:A,label:'Team A'},{color:BTEAM,label:'Team B'},{color:C,label:'Team C'},{color:PAPER,label:'Team D'}],steps:[
   step('Give each team one square','Four teams begin with equal balls. Players must remain within their own square during play.','Divide the court into four',s0),
   step('A direct low hit eliminates','A1 hits D1 below the waist. D1 waits beyond the court; a floor bounce would make the hit dead.','Attack across a different square',s1,[435,230],[
    {...tr('ball',[147,113],[435,244]),end:.55},{...tr('d1',[435,230],[530,345]),start:.6,end:1}]),
   step('A catch puts the thrower out','A2 catches B1’s live throw. B1 leaves the court. This version does not rescue anyone for a catch.','Catch another team’s throw',s2,[235,145],[
    {...tr('ball2',[420,113],[235,132]),end:.55},{...tr('b1',[435,100],[615,50],[615,325],[250,345]),start:.6,end:1}],2200),
   step('A team is out when its square empties','C1 collects a loose ball entering the square and hits D2. Team D has nobody active, while the other teams keep playing.','Empty one team’s square',s3,[550,275],[
    {...tr('ball',[435,244],[320,280],[145,236],[550,288]),end:.7},{...tr('d2',[550,275],[580,345]),start:.7,end:1}],2400),
   step('Stop at one team or three minutes','The last active team wins. Here three minutes expire while several teams remain, so call a draw.','Finish the timed round',s4,[320,30]),
   step('Return all four teams','Everyone goes back to their original square and balls are shared evenly for the next short round.','Refill all four squares',s5,[320,185])
  ]};
}

{
 const s0=frame([...halfCourt(),...six(),O('ap1','pin',65,110,{fill:A}),O('ap2','pin',65,270,{fill:A}),
  O('bp1','pin',575,110,{fill:BTEAM}),O('bp2','pin',575,270,{fill:BTEAM}),B('ball',460,130)],
  {'score-a':{label:'GREEN: 2 PINS UP'},'score-b':{label:'CORAL: 2 PINS UP'}});
 const s1=frame(s0,{a2:{x:110,y:360,fill:WAIT},ball:{x:105,y:233}},[note('A2 WAITS AFTER A DIRECT HIT')]);
 const s2=frame(s1,{ball:{x:575,y:120},bp1:{rotate:90},a2:{x:105,y:220,fill:A},'score-b':{label:'CORAL: 1 PIN UP'}},
  [cue('rescue','PIN DOWN → YOUR WHOLE TEAM RETURNS',339,330)]);
 const s3=frame(s2,{ball:{x:470,y:102},a1:{x:180,y:360,fill:WAIT}},[cue('catch','CATCH → THROWER OUT',438,74)]);
 const s4=frame(s3,{ball:{x:575,y:280},bp2:{rotate:90},a1:{x:165,y:115,fill:A},'score-b':{label:'CORAL: 0 PINS UP'}},
  [cue('two','BOTH CORAL PINS DOWN',472,320)]);
 const s5=frame(s4,{'score-a':{label:'GREEN WINS'}},[note('TWO PINS DOWN ENDS THE ROUND')]);
 const s6=frame(s0,{},[note('STAND BOTH PINS UP · RESET EVERY PLAYER')]);
 LESSONS['two-pin']={summary:'Topple opposing pins to revive your team; topple both to win.',
  legend:teamLegend,steps:[
   step('Place two pins near each back line','Protect your two pins without holding or moving them. All throws come from your own half.','Stand the pins up',s0),
   step('Ordinary hits create waiting players','A direct below-waist hit sends A2 out. Bounced hits do not count.','Send A2 to waiting',s1,[105,220],[
    {...tr('ball',[460,130],[105,233]),end:.5},{...tr('a2',[105,220],[110,360]),start:.55,end:1}]),
   step('A fallen pin rescues your team','A1 collects the loose ball and topples coral’s first pin. Every eliminated green player returns, including A2. Leave the pin down.','Topple the first pin',s2,[575,110],[
    {...tr('ball',[105,233],[180,125],[400,85],[575,120]),end:.65},{...tr('a2',[110,360],[105,220]),start:.65,end:1}],2200),
   step('A catch has no rescue bonus','The loose ball rolls back across centre. A1 throws again, but B1 catches: A1 goes out, and no waiting player returns.','Catch the next throw',s3,[470,115],[
    {...tr('ball',[575,120],[390,230],[180,125],[470,102]),end:.7},{...tr('a1',[165,115],[180,360]),start:.7,end:1}],2400),
   step('The second pin stays a live target','B1 returns a throw that bounces dead. A2 collects it, topples the other coral pin and rescues green’s waiting players again.','Topple the second pin',s4,[575,270],[
    {...tr('ball',[470,102],[315,200],[145,250],[120,233],[370,285],[575,280]),end:.7},{...tr('a1',[180,360],[165,115]),start:.7,end:1}],2400),
   step('Two fallen opposing pins wins','Green wins immediately. Eliminating every opposing player would also end the round.','Claim the two-pin win',s5,[575,270]),
   step('Rebuild for a new round','Stand up all four pins, return all players and distribute the balls again.','Reset all pins and players',s6,[575,110])
  ]};
}

{
 const s0=[...area(),P('mouse',300,245,'a','M'),P('cat',480,245,'b','C'),
  P('p1',145,125,'neutral','1',{pose:'lying'}),P('p2',185,125,'neutral','2',{pose:'lying'}),
  P('p3',420,115,'neutral','3',{pose:'lying'}),P('p4',460,115,'neutral','4',{pose:'lying'}),
  P('p5',130,285,'neutral','5',{pose:'lying'}),P('p6',170,285,'neutral','6',{pose:'lying'}),
  cue('pair','TWO PER ISLAND',165,75)];
 const s1=frame(s0,{mouse:{x:250,y:185},cat:{x:355,y:230}},[note('CAT CHASES MOUSE')]);
 const s2=frame(s1,{mouse:{x:105,y:125,pose:'lying'},cat:{x:280,y:185}},[cue('three','THREE? ONE MUST LEAVE',170,70)]);
 const s3=frame(s2,{mouse:{fill:PAPER,label:'M',pose:'lying'},p2:{x:268,y:100,fill:A,label:'M',pose:'standing'},cat:{x:275,y:180}},
  [cue('two','TWO AGAIN',125,70),cue('new','NEW MOUSE',280,60)]);
 const s4=frame(s3,{p2:{x:310,y:170},cat:{x:330,y:188}},[cue('tag','TAG',355,163)]);
 const s5=frame(s4,{p2:{fill:BTEAM,label:'C'},cat:{x:425,y:235,fill:A,label:'M'}},[cue('grace','3 SECONDS TO LEAVE',436,280)]);
 const s6=frame(s0,{cat:{x:460,y:115,fill:PAPER,label:'4',pose:'lying'},p4:{x:480,y:245,fill:BTEAM,label:'C',pose:'standing'}},
  [note('PAUSE · CHOOSE A FRESH CAT')]);
 LESSONS.islands={summary:'Escape a chase by joining a pair and sending its opposite person out as the new mouse.',
  legend:[{color:A,label:'Mouse'},{color:BTEAM,label:'Cat'},{color:PAPER,label:'Paired players'}],steps:[
   step('Make islands of two','Choose one cat and one mouse. Everyone else lies side by side in pairs, with room to run between them.','Set up islands',s0),
   step('The cat follows the mouse','The cat tries to make a gentle tag. The mouse can keep running or join an island.','Start the chase',s1,[250,185],[tr('mouse',[300,245],[275,205],[250,185]),tr('cat',[480,245],[420,285],[355,230])]),
   step('Slow down and join one end','The mouse lies beside the left end of this pair. There are briefly three people.','Join the island',s2,[105,125],[tr('mouse',[250,185],[215,85],[105,125])]),
   step('The opposite person gets up','Player 2 leaves from the opposite end and becomes the mouse. The other two stay together.','Release the new mouse',s3,[185,125],[tr('p2',[185,125],[220,80],[268,100])]),
   step('A tag changes both roles','This time the cat reaches the mouse. Stop briefly to exchange roles.','Make the tag',s4,[310,170],[tr('p2',[268,100],[310,130],[310,170]),tr('cat',[275,180],[330,188])]),
   step('Give the new mouse a head start','The tagged mouse is now the cat. The former cat gets three seconds to move away as the new mouse.','Swap cat and mouse',s5,[425,235],[tr('cat',[330,188],[380,215],[425,235])]),
   step('Pause and rotate the cat','After a minute, pause the chase. Choose a fresh cat, rebuild the pairs and start another timed round.','Rotate and reset',s6,[480,245])
  ]};
}

{
 const s0=[...area(),Z('hide',410,85,170,170,'ROOM FOR EVERYONE','#dfe4d3'),Z('meeting',65,280,240,60,'MEETING POINT','#e7e2d6'),
  P('h',105,320,'c','H'),P('s1',160,320,'a','1'),P('s2',210,320,'a','2'),P('s3',260,320,'a','3')];
 const s1=frame(s0,{h:{x:485,y:155},s1:{x:325,y:215},s2:{x:180,y:115},s3:{x:95,y:200}},[note('ONE HIDES · EVERYONE ELSE SEARCHES')]);
 const s2=frame(s1,{s1:{x:457,y:181,fill:C},s2:{x:250,y:110},s3:{x:180,y:255}},[cue('quiet','SHHH… JOIN THEM',493,122)]);
 const s3=frame(s2,{s2:{x:515,y:182,fill:C},s3:{x:315,y:265}},[note('THE HIDING GROUP GROWS')]);
 const s4=frame(s3,{s3:{x:485,y:219,fill:C}},[cue('found','EVERYONE FOUND IT',495,290)]);
 const s5=frame(s0,{h:{fill:A,label:'1'},s1:{fill:C,label:'H'}},[note('NEW HIDER · NEW ROUND')]);
 LESSONS.sardines={summary:'Find the one hidden player, then quietly become part of the hiding group.',
  legend:[{color:A,label:'Searching'},{color:C,label:'Hiding together'}],steps:[
   step('Pick a place everyone can fit','Choose one hider and accessible hiding areas. Everyone else waits at a meeting point.','Choose the hider',s0),
   step('Let the hider go first','Give the hider one minute. Then the others search independently or in pairs.','Begin the search',s1,[485,155],[tr('h',[105,320],[380,300],[485,155])]),
   step('Finding means joining','Searcher 1 finds the hider. They quietly sit beside them instead of calling out the discovery.','Join quietly',s2,[457,181],[tr('s1',[325,215],[405,235],[457,181])]),
   step('Each finder makes the group bigger','Searcher 2 joins too. The last searcher must now find a whole hidden group.','Hide one more person',s3,[515,182],[tr('s2',[250,110],[365,75],[515,182])]),
   step('The last searcher finds everyone','The shared reveal ends the round. Being last is a finale, not an elimination or penalty.','Reveal the group',s4,[485,219],[tr('s3',[315,265],[400,270],[485,219])]),
   step('Return together and rotate','Regroup and choose a new hider. Use the agreed stop call if the search timer ends first.','Reset the search',s5,[185,320])
  ]};
}

{
 const s0=[...area(),P('b1',140,190,'b','1'),P('b2',175,190,'b','2'),L('link12',140,190,175,190,{width:5}),
  P('r1',320,140,'a','3'),P('r2',440,180,'a','4'),P('r3',180,290,'a','5'),P('r4',520,285,'a','6')];
 const s1=frame(s0,{b1:{x:245,y:160},b2:{x:280,y:160},r1:{x:315,y:160,fill:BTEAM},link12:{x:245,y:160,x2:280,y2:160}},
  [L('link23',280,160,315,160,{width:5}),cue('three','THREE TOGETHER',280,110)]);
 const s2=frame(s1,{b1:{x:322,y:190},b2:{x:357,y:190},r1:{x:392,y:190},r2:{x:427,y:190,fill:BTEAM},
  link12:{x:322,y:190,x2:357,y2:190},link23:{x:357,y:190,x2:392,y2:190}},
  [L('link34',392,190,427,190,{width:5}),cue('four','FOUR → SPLIT',375,140)]);
 const s3=frame(s2,{b1:{x:230,y:225},b2:{x:265,y:225},r1:{x:442,y:238},r2:{x:477,y:238},
  link12:{x:230,y:225,x2:265,y2:225},link34:{x:442,y:238,x2:477,y2:238}},[note('TWO PAIRS CAN CHASE')],['link23']);
 const s4=frame(s3,{b1:{x:158,y:270},b2:{x:193,y:270},r3:{x:228,y:270,fill:BTEAM},
  r1:{x:440,y:280},r2:{x:475,y:280},r4:{x:510,y:280,fill:BTEAM},
  link12:{x:158,y:270,x2:193,y2:270},link34:{x:440,y:280,x2:475,y2:280}},
  [L('link25',193,270,228,270,{width:5}),L('link46',475,280,510,280,{width:5}),note('EVERYONE BELONGS TO A BLOB')]);
 const s5=frame(s0,{b1:{fill:A},b2:{fill:A},r3:{x:300,y:245,fill:BTEAM},r4:{x:335,y:245,fill:BTEAM}},
  [L('new-link',300,245,335,245,{width:5}),note('LAST TWO CAUGHT START THE NEXT ROUND')],['link12']);
 LESSONS['blob-tag']={summary:'Catch runners together, grow to four, then split into two chasing pairs.',
  legend:[{color:A,label:'Free runner'},{color:BTEAM,label:'Linked blob'}],steps:[
   step('Start with a linked pair','The two blob players link hands or elbows. Their free hands make gentle tags.','Link the first pair',s0),
   step('A catch joins the chain','Stop safely after the tag. Player 3 joins the blob, which now moves as a group of three.','Add a third player',s1,[315,160],[tr('b1',[140,190],[205,160],[245,160]),tr('b2',[175,190],[240,160],[280,160])]),
   step('Four people trigger a split','Another catch brings the blob to four. Four is the signal to divide.','Grow to four',s2,[427,190]),
   step('Make two separate pairs','Break the middle link. Both pairs can now move and tag independently.','Split the blob',s3,[375,190],[tr('b1',[322,190],[230,225]),tr('b2',[357,190],[265,225]),tr('r1',[392,190],[442,238]),tr('r2',[427,190],[477,238])]),
   step('Each pair keeps growing','Both blobs catch another runner. Larger games repeat the grow-to-four, split-in-two rule until everyone joins.','Catch the remaining runners',s4,[510,280]),
   step('Choose the next starting pair','This small round is complete. The last two caught can start together while everyone else spreads out.','Re-form the starting blob',s5,[318,245])
  ]};
}

{
 const s0=[...area(),Z('shore-left',35,75,75,245,'SHORE','#e4ddbf'),Z('shore-right',530,75,75,245,'SHORE','#e4ddbf'),
  P('o',325,210,'b','O'),P('f1',75,130,'a','1'),P('f2',75,210,'a','2'),P('f3',75,290,'a','3')];
 const s1=frame(s0,{f1:{x:285,y:145},f2:{x:565,y:210},f3:{x:565,y:290},o:{x:307,y:161}},
  [cue('cross','CROSS!',325,95)]);
 const s2=frame(s1,{f1:{fill:WAIT,label:'C'}},[ring('reach1',285,145,34,{dash:'4 5',stroke:INK}),cue('feet','FEET STAY HERE',275,95)]);
 const s3=frame(s2,{f2:{x:310,y:164,fill:WAIT,label:'C'},f3:{x:75,y:290},o:{x:350,y:245}},
  [ring('reach2',310,164,34,{dash:'4 5'}),note('CRABS CAN TAG · CRABS CANNOT TRAVEL')]);
 const s4=frame(s3,{f3:{x:380,y:277,fill:WAIT,label:'C'},o:{x:361,y:260}},
  [ring('reach3',380,277,34,{dash:'4 5'}),note('ALL FISH CAUGHT · STOP')]);
 const s5=frame(s0,{o:{x:75,y:130,fill:A,label:'1'},f1:{x:325,y:210,fill:BTEAM,label:'O'},f2:{x:75,y:210},f3:{x:75,y:290}},
  [note('CLEAR THE OCEAN · NEW OCTOPUS')]);
 LESSONS.octopus={summary:'Cross between safe shores while each caught fish becomes a stationary tagging crab.',
  legend:[{color:A,label:'Fish'},{color:BTEAM,label:'Moving octopus'},{color:WAIT,label:'Stationary crab'}],steps:[
   step('Start behind one shore','All fish begin on the same shore. Only the octopus starts in the ocean.','Place the fish',s0),
   step('Cross when the octopus calls','All fish travel to the other shore. The octopus moves to intercept fish before they reach safety.','Call the first crossing',s1,[565,210],[tr('f1',[75,130],[210,115],[285,145]),tr('f2',[75,210],[330,210],[565,210]),tr('f3',[75,290],[300,310],[565,290])]),
   step('A caught fish becomes a crab','Fish 1 was tagged. It stays at this exact spot for the rest of the round, with feet planted.','Plant the first crab',s2,[285,145]),
   step('Cross back past the crabs','Fish 2 passes within the crab’s reach and becomes another crab. Fish 3 reaches the opposite shore safely.','Make the return crossing',s3,[310,164],[tr('f2',[565,210],[400,120],[310,164]),tr('f3',[565,290],[310,300],[75,290])]),
   step('The last fish is caught','On another crossing the octopus catches fish 3. All fish are now stationary, so the round ends.','Catch the final fish',s4,[380,277],[tr('f3',[75,290],[225,255],[380,277])]),
   step('Reset the ocean','Everyone becomes a fish again except the new octopus. Return the fish to one shore.','Clear the crabs and restart',s5,[75,210])
  ]};
}

{
 const shadow=(id,x,y)=>Z(id,x,y,56,17,'',INK,{opacity:.16,rotate:-20});
 const s0=[...area(),O('sun','star',565,85,{r:22,fill:'#e6cb62'}),P('tag',130,210,'b','T'),P('r1',345,140,'a','1'),P('r2',435,270,'a','2'),
  shadow('sh-tag',154,239),shadow('sh1',369,169),shadow('sh2',459,299),cue('sun','SUN',565,125)];
 const s1=frame(s0,{tag:{x:394,y:174},'sh-tag':{x:418,y:203}},[cue('caught','“1, CAUGHT!”',357,110)]);
 const s2=frame(s1,{r1:{fill:BTEAM,label:'T'},tag:{x:270,y:260,fill:A,label:'1'},'sh-tag':{x:294,y:289}},[note('PAUSE BRIEFLY · OLD TAGGER MOVES AWAY')]);
 const s3=frame(s2,{r1:{x:478,y:303},sh1:{x:502,y:332}},[cue('caught','“2, CAUGHT!”',440,232)]);
 const s4=frame(s3,{r2:{fill:BTEAM,label:'T'},r1:{x:385,y:200,fill:A,label:'2'},sh1:{x:409,y:229}},[note('ROLE PASSES AGAIN · NOBODY IS OUT')]);
 const s5=frame(s0,{tag:{fill:A,label:'2'},r2:{fill:BTEAM,label:'T'}},[note('TIMER ENDS · CHOOSE THE NEXT STARTER')]);
 LESSONS['shadow-tag']={summary:'Become the next tagger when someone steps on your shadow and calls your name.',
  legend:[{color:A,label:'Runner'},{color:BTEAM,label:'Tagger'},{color:INK,label:'Ground shadow'}],steps:[
   step('Find clear shadows','Choose a sunny open area and one tagger. The dark shapes are the players’ shadows on the ground.','Find the shadows',s0),
   step('Step on a shadow','The tagger steps on player 1’s shadow and calls their name and “caught”. No body contact is needed.','Catch the shadow',s1,[394,174],[tr('tag',[130,210],[270,250],[394,174])]),
   step('Give the new tagger room','Player 1 becomes the tagger. Pause briefly while the previous tagger moves away.','Exchange the role',s2,[345,140],[tr('tag',[394,174],[320,220],[270,260])]),
   step('Find another moving shadow','The new tagger steps onto player 2’s shadow. Everyone plays honestly about the contact.','Catch another shadow',s3,[478,303],[tr('r1',[345,140],[380,240],[478,303])]),
   step('Keep everybody playing','Player 2 is now the tagger. The previous tagger returns to running after a brief pause.','Pass the role again',s4,[435,270]),
   step('Finish at the short timer','Call the stop. This is continuous play, with no elimination; swap the starting tagger for another round.','Stop and reset',s5,[320,365])
  ]};
}

{
 const s0=[...area(),...[110,220,330].map((y,i)=>L(`h${i}`,100,y,550,y,{width:4})),...[120,320,520].map((x,i)=>L(`v${i}`,x,90,x,340,{width:4})),
  P('tag',120,110,'b','T'),P('r1',320,110,'a','1'),P('r2',520,220,'a','2'),P('r3',120,330,'a','3')];
 const s1=frame(s0,{tag:{x:296,y:110},r1:{fill:WAIT,label:'X'}},[cue('block','ROADBLOCK',320,75)]);
 const s2=frame(s1,{r2:{x:320,y:330},r3:{x:520,y:220}},[trail('route',320,220,320,300),note('RUNNERS CANNOT PASS A ROADBLOCK')]);
 const s3=frame(s2,{tag:{x:320,y:309},r2:{fill:WAIT,label:'X'}},[cue('walk','TAGGER MAY WALK AROUND',400,75)],
  []);
 const s4=frame(s3,{},[cue('last','LAST RUNNER',520,177),note('ONE RUNNER REMAINS · STOP')]);
 const s5=frame(s0,{tag:{fill:A,label:'3'},r3:{fill:BTEAM,label:'T'}},[note('REOPEN EVERY ROUTE · NEW TAGGER')]);
 LESSONS['line-tag']={summary:'Stay on the lines, choose connected routes and avoid players who become roadblocks.',
  legend:[{color:A,label:'Runner'},{color:BTEAM,label:'Tagger'},{color:WAIT,label:'Roadblock'}],steps:[
   step('Choose connected court lines','Walk the allowed routes first. Everyone, including the tagger, must move along these lines.','Choose the routes',s0),
   step('A tagged runner blocks the line','The tagger reaches player 1. Player 1 stops exactly there and becomes a visible roadblock.','Close the first route',s1,[320,110],[tr('tag',[120,110],[296,110])]),
   step('Use a different intersection','Player 2 takes the lower route. Runners cannot squeeze past roadblocks or jump a gap between lines.','Choose the open route',s2,[320,220],[tr('r2',[520,220],[320,220],[320,330]),tr('r3',[120,330],[520,330],[520,220])]),
   step('Taggers can carefully walk around','The tagger walks around the roadblock, rejoins the clear line below it and follows it to catch player 2.','Walk around and rejoin',s3,[340,110],[tr('tag',[296,110],[285,80],[355,80],[355,145],[320,145],[320,309])],2200),
   step('One runner ends this round','Player 3 is the last runner. Stop now, or stop at two minutes if more runners remain.','Call the last runner',s4,[520,220]),
   step('Everybody rejoins','Remove all roadblocks and choose a new tagger. Every chosen line is open again.','Reopen the court',s5,[320,110])
  ]};
}

{
 const s0=[...area(),P('p1',140,120,'a','1'),P('p2',250,150,'a','2'),P('p3',460,130,'a','3'),P('p4',440,280,'a','4'),
  T('count1',130,30,'1: 0'),T('count2',260,30,'2: 0'),T('count3',390,30,'3: 0'),T('count4',520,30,'4: 0')];
 const s1=frame(s0,{p1:{x:230,y:143},count1:{label:'1: 1'}},[cue('tag','+1 FOR PLAYER 1',215,105)]);
 const s2=frame(s1,{p2:{x:440,y:144},p1:{x:270,y:245},count2:{label:'2: 1'}},[cue('tag','PLAYER 2 CAN STILL TAG',438,90)]);
 const s3=frame(s2,{p1:{x:420,y:273},p2:{x:340,y:170},p3:{x:515,y:190},count1:{label:'1: 2'}},[cue('new','TAG A DIFFERENT PERSON',435,325)]);
 const s4=frame(s3,{},[note('STOP · COUNT YOUR TAGS')]);
 const s5=frame(s0,{},[note('ALL COUNTS BACK TO ZERO')]);
 LESSONS['everybodys-it']={summary:'Everyone scores their own tags and keeps playing even after being tagged.',
  legend:[{color:A,label:'Everyone is a tagger and runner'},{color:INK,label:'Personal tag counts'}],steps:[
   step('Everyone starts at zero','Set a three-minute timer. Every player may gently tag any other player.','Set every score to zero',s0),
   step('Count one successful tag','Player 1 tags player 2 and adds one to their own count. Player 2 stays free to move.','Score the first tag',s1,[250,150],[tr('p1',[140,120],[190,130],[230,143])]),
   step('Being tagged does not stop you','Player 2 immediately keeps playing and later tags player 3. Nobody freezes or sits out.','Let the tagged player score',s2,[460,130],[tr('p2',[250,150],[350,100],[440,144])]),
   step('Find somebody different','Player 1 tags player 4 for a second point. Avoid immediate repeated tags on the same person.','Find a new target',s3,[440,280],[tr('p1',[270,245],[350,300],[420,273])]),
   step('Stop and compare your counts','Freeze at the stop signal. Compare counts or personal bests; all four players participated throughout.','Stop the timer',s4,[320,365]),
   step('Reset every score together','Everyone returns to zero. Start another short round with the same no-elimination rule.','Start a fresh count',s5,[320,30])
  ]};
}

{
 const s0=[...area(),P('tag',150,195,'b','T'),P('r1',315,195,'a','1'),P('r2',160,100,'a','2'),P('r3',500,125,'a','3')];
 const s1=frame(s0,{tag:{x:292,y:205},r1:{fill:WAIT,label:'X'}},[cue('stuck','STUCK',315,150)]);
 const s2=frame(s1,{tag:{x:450,y:280},r2:{x:286,y:177},r3:{x:344,y:177}},
  [L('shoulder-left',286,177,305,189,{width:3}),L('shoulder-right',344,177,325,189,{width:3}),cue('two','TWO FREE RESCUERS',315,110)]);
 const s3=frame(s2,{r1:{fill:A,label:'1'}},
  [L('clap',295,159,335,159,{width:3}),O('clap-star','star',315,153,{r:12,fill:'#e6cb62'}),cue('clap','CLAP FREE HANDS',315,110)]);
 const s4=frame(s3,{r1:{x:180,y:275},r2:{x:200,y:115},r3:{x:505,y:185},tag:{x:469,y:225}},
  [note('RESCUED PLAYER RUNS AGAIN')],['shoulder-left','shoulder-right','clap','clap-star']);
 const s5=frame(s4,{},[note('TIME! FREE RUNNERS WIN THIS ROUND')]);
 const s6=frame(s0,{tag:{fill:A,label:'1'},r1:{fill:BTEAM,label:'T'}},[note('ROTATE TAGGERS · EVERYONE FREE')]);
 LESSONS['stuck-in-the-mud']={summary:'Free a frozen teammate with two runners touching shoulders and clapping their free hands together.',
  legend:[{color:A,label:'Free runner'},{color:BTEAM,label:'Tagger'},{color:WAIT,label:'Stuck'}],steps:[
   step('Spread out and start the timer','Choose taggers and a two-minute round. The remaining players are free runners.','Start with free runners',s0),
   step('A tag makes you stationary','The tagger catches player 1. Player 1 stays still with hands held forward.','Stick the first runner',s1,[315,195],[tr('tag',[150,195],[225,210],[292,205])]),
   step('Bring two rescuers together','Two free runners approach the stuck player. Each touches one of the stuck player’s shoulders.','Touch both shoulders',s2,[315,195],[tr('r2',[160,100],[230,120],[286,177]),tr('r3',[500,125],[405,115],[344,177])]),
   step('Clap the two free hands','While touching the shoulders, the rescuers clap their other hands together. That completes the rescue.','Complete the rescue clap',s3,[315,153]),
   step('The rescued player can run','All three runners are free again. The tagger keeps chasing; a rescued player can be caught later.','Run free again',s4,[180,275],[tr('r1',[315,195],[260,265],[180,275])]),
   step('End at the timer or full freeze','Here time runs out with free runners remaining, so the runners win. Taggers win if everyone becomes stuck first.','Call time',s5,[320,365]),
   step('Choose new taggers','Reset every stuck player and rotate the tagger role before the next short round.','Reset and rotate',s6,[315,195])
  ]};
}

{
 const s0=[...area(),L('centre',320,60,320,345,{dash:'5 5'}),Z('home-a',40,80,55,245,'HOME','#dfe7c4'),Z('home-b',545,80,55,245,'HOME','#efd9ce'),
  P('a1',282,140,'a','A1'),P('b1',358,140,'b','B1'),P('a2',282,265,'a','A2'),P('b2',358,265,'b','B2')];
 const s1=frame(s0,{},[cue('a1','PAPER',250,105),cue('b1','ROCK',390,105),cue('a2','ROCK',250,310),cue('b2','PAPER',390,310)]);
 const s2=frame(s1,{a1:{x:410,y:140},b1:{x:455,y:140},a2:{x:170,y:265},b2:{x:215,y:265}},
  [trail('right',385,95,510,95),trail('left',245,315,130,315),note('WINNER CHASES · LOSER RUNS HOME')]);
 const s3=frame(s2,{a1:{x:501,y:140},b1:{x:521,y:140},a2:{x:75,y:265},b2:{x:128,y:265}},
  [cue('caught','TAGGED',490,95),cue('safe','SAFE',75,224)]);
 const s4=frame(s0,{},[note('BOTH RETURN · NOBODY IS ELIMINATED')]);
 const s5=frame(s4,{b1:{y:265},b2:{y:140}},[note('SHIFT ONE LINE · MEET A NEW PARTNER')]);
 LESSONS['rps-chase']={summary:'Win rock–paper–scissors to chase your partner; lose it and race to your own home line.',
  legend:[{color:A,label:'Left starting side'},{color:BTEAM,label:'Right starting side'}],steps:[
   step('Face a partner at centre','Each pair starts between two home lines. Partners will run toward different homes.','Pair up at centre',s0),
   step('Reveal rock, paper or scissors','Use the same count. Paper beats rock in these examples; replay any tied pair.','Reveal the hands',s1,[320,200]),
   step('The winner becomes the chaser','A1 chases B1 toward the right home. In the other pair, B2 chases A2 toward the left home.','Start both chases',s2,[455,140]),
   step('A tag or home ends the chase','B1 is tagged before home. A2 reaches home safely. Either result ends that pair’s chase.','Reach the home lines',s3,[550,140],[tr('a2',[170,265],[75,265]),tr('b2',[215,265],[128,265]),tr('a1',[410,140],[501,140]),tr('b1',[455,140],[521,140])]),
   step('Both partners return','Caught and safe players both come back to their original side. This version has no elimination or cumulative score.','Return to centre',s4,[320,200]),
   step('Shift along for a new opponent','Move one line along to create new pairs. Play another reveal and chase, for five rounds in total.','Change partners',s5,[358,200],[tr('b1',[358,140],[410,200],[358,265]),tr('b2',[358,265],[455,200],[358,140])])
  ]};
}

{
 const pos0=[[190,130],[245,130],[290,170],[270,225],[215,255],[165,225]];
 const linkNodes=(pos,order=[0,1,2,3,4,5])=>order.slice(0,-1).map((n,i)=>L(`chain-${i}`,pos[n][0],pos[n][1],pos[order[i+1]][0],pos[order[i+1]][1],{width:5}));
 const make=(pos,order=[0,1,2,3,4,5])=>[...area(),...linkNodes(pos,order),...pos.map(([x,y],i)=>P(`p${i}`,x,y,i===order[0]?'b':'a',i===order[0]?'H':i===order.at(-1)?'T':String(i+1)))];
 const pos1=[[150,170],[198,145],[249,165],[260,215],[210,242],[160,230]];
 const s0=make(pos0),s1=make(pos1);
 const s2=frame(s1,{p3:{x:330,y:215},'chain-2':{x2:287,y2:194,stroke:BTEAM,dash:'4 5'},'chain-3':{x:310,y:232,stroke:BTEAM,dash:'4 5'}},
  [note('THE CHAIN BROKE · EVERYONE PAUSES')]);
 const s3=frame(s1,{},[note('RECONNECT BEFORE MOVING')]);
 const pos4=[[142,207],[175,165],[225,160],[257,202],[212,241],[165,226]];
 const s4=frame(make(pos4),{},[cue('tag','HEAD TAGS TAIL',175,295)]);
 const pos5=[[168,280],[190,130],[245,130],[290,170],[270,225],[215,255]];
 const s5=frame(make(pos5,[1,2,3,4,5,0]),{},[note('OLD HEAD JOINS THE BACK')]);
 LESSONS['dragon-tail']={summary:'Stay connected while the head tries to reach the tail, then rotate the head to the back.',
  legend:[{color:BTEAM,label:'Head'},{color:A,label:'Connected body and tail'}],steps:[
   step('Make one comfortable connected line','Use light hands on the hips or shoulders ahead, where comfortable. Front is head; back is tail.','Connect the dragon',s0),
   step('Curl the dragon at walking pace','The head tries to gently tag the tail. Everyone moves together without pulling the line apart.','Chase your own tail',s1,[160,230]),
   step('Stop if the connection breaks','This gap breaks the line. Everyone pauses immediately; the head cannot claim a tag during the break.','Show a broken link',s2,[280,195]),
   step('Reconnect and restart','Restore every connection before the chase continues. Keep a comfortable walking pace.','Reconnect the line',s3,[250,195]),
   step('Tag the tail without breaking','The head reaches the tail while the dragon stays connected. Stop the whole line.','Catch the tail',s4,[165,226],[tr('p0',[150,170],[135,190],[142,207])]),
   step('Move the head to the back','The old head becomes the new tail, and player 2 becomes head. Continue until everyone has led the dragon.','Rotate the dragon',s5,[168,280],[tr('p0',[142,207],[105,250],[168,280])])
  ]};
}

{
 const s0=[...area(),L('centre',320,48,320,348,{dash:'5 5'}),
  Z('holding-a',45,292,115,50,'CORAL HELD','#ecdcd4',{labelY:-10}),Z('holding-b',480,292,115,50,'GREEN HELD','#e1e8cc',{labelY:-10}),
  ring('flag-zone-a',80,105,30),ring('flag-zone-b',560,105,30),
  O('flag-a','flag',80,105,{fill:A}),O('flag-b','flag',560,105,{fill:BTEAM}),
  P('a1',200,100,'a','A1'),P('a2',150,230,'a','A2'),P('a3',250,270,'a','A3'),
  P('b1',425,150,'b','B1'),P('b2',410,265,'b','B2'),T('score-a',200,28,'GREEN 0'),T('score-b',450,28,'CORAL 0')];
 const s1=frame(s0,{a1:{x:535,y:113},'flag-b':{x:548,y:97}},[cue('steal','TAKE THEIR FLAG',508,66)]);
 const s2=frame(s1,{a1:{x:542,y:325,fill:WAIT},b1:{x:489,y:153},'flag-b':{x:560,y:105}},[cue('held','TAGGED IN THEIR HALF',459,248)]);
 const s3=frame(s2,{a2:{x:520,y:320},b1:{x:410,y:120}},[cue('rescue','ONE TEAMMATE RESCUED',465,230)]);
 const s4=frame(s3,{a1:{x:240,y:315,fill:A},a2:{x:275,y:315},a3:{x:535,y:110},'flag-b':{x:548,y:94}},
  [cue('walk','SAFE WALK HOME',203,270)]);
 const s5=frame(s4,{a3:{x:292,y:160},'flag-b':{x:303,y:144},'score-a':{label:'GREEN 1'}},[cue('point','CROSSED CENTRE: +1',287,105)]);
 const s6=frame(s0,{'score-a':{label:'GREEN 1'}},[note('RESET FLAGS + PLAYERS · FIRST TO THREE')]);
 LESSONS['capture-the-flag']={summary:'Bring the opposing flag across centre while freeing teammates caught in enemy territory.',
  legend:[{color:A,label:'Green team'},{color:BTEAM,label:'Coral team'},{color:WAIT,label:'Held player'}],steps:[
   step('Give each team a flag and holding zone','You are safe on your own half. Agree space around flag and holding zones that defenders must respect.','Mark the two territories',s0),
   step('Enter their half and take their flag','A1 crosses into coral territory and picks up the coral flag. It must come back across centre.','Steal the opposing flag',s1,[560,105],[tr('a1',[200,100],[340,75],[535,113])]),
   step('A tag sends the carrier to holding','B1 tags A1 before the return. The flag goes back to its zone, and A1 enters the coral holding area.','Catch the flag carrier',s2,[490,150],[tr('a1',[535,113],[490,150],[542,325])]),
   step('A free teammate can rescue one player','A2 reaches the holding zone and gently tags A1. That frees one held teammate.','Touch to rescue',s3,[542,325],[tr('a2',[150,230],[330,280],[520,320])]),
   step('The rescued pair walks safely home','Both players get a safe walk to their own half before rejoining. Meanwhile A3 makes a new attempt on the flag.','Walk home together',s4,[240,315],[tr('a1',[542,325],[400,340],[240,315]),tr('a2',[520,320],[400,315],[275,315])]),
   step('Cross centre with the flag to score','A3 carries the coral flag into the green half. That successful return scores one point.','Bring the flag home',s5,[292,160],[tr('a3',[535,110],[435,80],[350,135],[292,160]),tr('flag-b',[548,94],[448,64],[363,119],[303,144])]),
   step('Reset both flags and every player','Return the flags to their zones and release all held players. Keep the score; first to three returns wins.','Reset after the point',s6,[560,105])
  ]};
}

{
 const s0=[...area(),Z('hide-left',70,75,145,95,'HIDING AREA','#dae1ce'),Z('hide-right',420,70,150,125,'HIDING AREA','#dae1ce'),
  Z('meeting',80,270,200,65,'MEETING POINT','#e5dfd0'),P('hunter',120,315,'b','H'),
  P('r1',170,315,'a','1'),P('r2',210,315,'a','2'),P('r3',250,315,'a','3')];
 const s1=frame(s0,{r1:{x:465,y:120},r2:{x:155,y:110},r3:{x:520,y:245},hunter:{x:310,y:220}},[note('ONE MINUTE TO HIDE · THEN SEARCH')]);
 const s2=frame(s1,{hunter:{x:444,y:139},r1:{fill:WAIT,label:'5'}},[cue('count','COUNT TO FIVE',476,32)]);
 const s3=frame(s2,{r1:{x:380,y:215,fill:BTEAM,label:'H'},hunter:{x:179,y:125},r2:{fill:WAIT,label:'5'}},
  [cue('count','COUNT TO FIVE',156,32),note('TWO HUNTERS NOW')]);
 const s4=frame(s3,{r2:{x:310,y:160,fill:BTEAM,label:'H'},r1:{x:500,y:247},r3:{fill:WAIT,label:'5'}},[cue('last','LAST RUNNER CAUGHT',475,292)]);
 const s5=frame(s4,{r3:{fill:BTEAM,label:'H'}},[note('EVERYONE CAUGHT · STOP')]);
 const s6=frame(s0,{hunter:{fill:A,label:'1'},r1:{fill:BTEAM,label:'H'},r2:{label:'2'},r3:{label:'3'}},[note('REGROUP · COUNT EVERYONE · NEW FIRST HUNTER')]);
 LESSONS.manhunt={summary:'Hide or move until the timer ends; every tagged runner eventually joins the hunters.',
  legend:[{color:A,label:'Runner'},{color:BTEAM,label:'Hunter'},{color:WAIT,label:'Five-second pause'}],steps:[
   step('Agree where everyone may go','Set boundaries, a meeting point and a stop call. Choose a first hunter; this small example has three runners.','Gather the group',s0),
   step('Hide, then begin the search','Runners get one minute to hide. Hunters search only within the agreed area; runners may keep moving.','Hide and search',s1,[465,120],[tr('r1',[170,315],[350,250],[465,120]),tr('r2',[210,315],[95,210],[155,110]),tr('r3',[250,315],[520,245])]),
   step('A tag begins the change','The hunter gently tags runner 1. The caught runner announces it and counts to five before joining the search.','Tag runner 1',s2,[465,120],[tr('hunter',[310,220],[395,185],[444,139])]),
   step('Caught runners become hunters','Runner 1 now searches too. The original hunter finds runner 2, who must also wait five seconds.','Spread the hunt',s3,[155,110],[tr('hunter',[444,139],[285,90],[179,125]),tr('r1',[465,120],[420,170],[380,215])]),
   step('Hunt from more than one direction','The newest hunter joins. Hunter 1 catches the last free runner; there are no prisons or rescues in this version.','Catch the last runner',s4,[520,245],[tr('r1',[380,215],[455,230],[500,247])]),
   step('Stop when everyone is caught','All runners have changed sides, so the hunters win this round. If time expires first, the remaining runners win together.','Call the stop',s5,[320,365]),
   step('Everyone returns to the meeting point','Count the whole group and rotate the first hunter. Give the runners a new hiding minute.','Regroup and restart',s6,[180,310])
  ]};
}
