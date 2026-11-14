// An absolute film clock, shared by the MP4 renderer and its chapter metadata.
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
export function compileFilm(game,lesson){
 const intro=3.2,outro=3;let cursor=intro;
 const segments=lesson.steps.map((current,index)=>{
  const words=(current.title+' '+current.text).split(/\s+/).length;
  const lead=index===0?0:.55,move=index===0?0:clamp((current.duration||1800)/1000*1.5,2.6,4.2);
  const duration=Math.max(index===0?6.1:6.8,Math.min(10.6,words/3.1+.6),lead+move+2.2);
  const segment={index,start:cursor,end:cursor+duration,lead,move,current,previous:index?lesson.steps[index-1]:null};cursor=segment.end;return segment;
 });
 return {game,lesson,intro,outro,segments,duration:cursor+outro};
}
export function sampleFilm(film,time){
 const t=clamp(time,0,film.duration),last=film.segments.at(-1);
 if(t<film.intro)return {index:0,previous:null,current:film.segments[0].current,progress:1,phase:'title',chapterStart:0,chapterEnd:film.intro,time:t,chapterTime:t,openingOpacity:Math.min(1,t/.35)*Math.min(1,(film.intro-t)/.45),closingOpacity:0};
 if(t>=last.end)return {index:last.index,previous:last.previous,current:last.current,progress:1,phase:'outro',chapterStart:last.end,chapterEnd:film.duration,time:t,chapterTime:t-last.end,openingOpacity:0,closingOpacity:clamp((t-last.end)/.5)};
 const segment=film.segments.find(s=>t<s.end)||last,local=t-segment.start;
 const progress=segment.index===0?1:clamp((local-segment.lead)/segment.move);
 return {...segment,time:t,chapterTime:local,chapterStart:segment.start,chapterEnd:segment.end,progress,phase:segment.index===0?'setup':progress<1?'move':'hold',openingOpacity:0,closingOpacity:0};
}
export const timecode=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
