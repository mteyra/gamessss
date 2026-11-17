// An absolute film clock, shared by the MP4 renderer and its chapter metadata.
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
// The research edition keeps its original palette. Film narration names the
// neutral on-screen teams. These three colours name example teams, not rules.
// Croquet's fixed blue/red/black/yellow order is deliberately preserved.
export function filmLesson(lesson,game){
 const identities=[['green','white'],['coral','slate'],['purple','blue']];
 const copy=value=>{
  if(typeof value!=='string')return value;
  return identities.reduce((text,[from,to])=>text.replace(new RegExp(`\\b${from}\\b`,'gi'),word=>word===word.toUpperCase()?to.toUpperCase():word[0]===word[0].toUpperCase()?to[0].toUpperCase()+to.slice(1):to),value);
 };
 return {...lesson,summary:copy(lesson.summary),legend:lesson.legend.map(item=>({...item,label:copy(item.label)})),steps:lesson.steps.map(step=>({...step,title:copy(step.title),text:copy(step.text),action:copy(step.action),nodes:step.nodes.map(node=>({...node,label:copy(node.label),...(game?.id==='human-knot'&&node.id==='cut'?{y:355,size:12}:game?.id==='human-knot'&&node.id==='choice'?{y:385}:{})}))}))};
}
export function compileFilm(game,lesson){
 const authored=filmLesson(lesson,game),intro=1.1,outro=1;let cursor=intro;
 const segments=authored.steps.map((current,index)=>{
  const words=(current.title+' '+current.text).split(/\s+/).length;
  const duration=Math.max(4.6,words/3.45+.12);
  // The action occupies the whole chapter. There is no lead-in or settled hold.
  const segment={index,start:cursor,end:cursor+duration,lead:0,move:duration,current,previous:index?authored.steps[index-1]:null};cursor=segment.end;return segment;
 });
 return {game,lesson:authored,intro,outro,segments,duration:cursor+outro};
}
export function sampleFilm(film,time){
 const t=clamp(time,0,film.duration),last=film.segments.at(-1);
 const setupProgress=clamp(t/film.segments[0].end);
 if(t<film.intro)return {index:0,previous:null,current:film.segments[0].current,progress:1,chapterProgress:setupProgress,setupProgress,phase:'title',chapterStart:0,chapterEnd:film.intro,time:t,chapterTime:t,openingOpacity:1-t/film.intro,closingOpacity:0};
 if(t>=last.end)return {index:last.index,previous:last.previous,current:last.current,progress:1,chapterProgress:1,setupProgress:1,phase:'outro',chapterStart:last.end,chapterEnd:film.duration,time:t,chapterTime:t-last.end,openingOpacity:0,closingOpacity:clamp((t-last.end)/film.outro)};
 const segment=film.segments.find(s=>t<s.end)||last,local=t-segment.start;
 const chapterProgress=clamp(local/segment.move),progress=segment.index===0?1:chapterProgress;
 return {...segment,time:t,chapterTime:local,chapterStart:segment.start,chapterEnd:segment.end,progress,chapterProgress:segment.index===0?setupProgress:chapterProgress,setupProgress,phase:segment.index===0?'setup':'move',openingOpacity:0,closingOpacity:0};
}
export const timecode=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
