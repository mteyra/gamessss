// The illustrated field guide keeps its own palette. Only films use this map.
export const FILM_THEME=Object.freeze({
 background:'#090b10',paper:'#090b10',ink:'#f5f6f8',text:'#f5f6f8',
 muted:'#9299a6',label:'#c4cdd9',court:'#535d6d',line:'#c6cedb',surface:'#131820',
 surfaceAlt:'#1b222d',white:'#f5f6f8',slate:'#29313d',blue:'#8196b3',
 accent:'#a9c9ef',ball:'#a9c9ef',inactive:'#161c25',
});
const palette=Object.freeze({
 '#bbda63':FILM_THEME.white,'#e9977c':FILM_THEME.slate,
 '#a99bd8':FILM_THEME.blue,'#ced2cb':FILM_THEME.inactive,
 '#e6cb62':FILM_THEME.ball,'#222522':FILM_THEME.ink,
 '#f7f7ef':FILM_THEME.surfaceAlt,
 // Actual named croquet colours carry a rule; keep them subtly distinguishable.
 '#6095cf':'#87aeda','#de7769':'#b78487','#ddc956':'#c3b786',
 '#cda878':'#8893a3',
});
const lightSurfaces=new Set([
 '#edf0e7','#e4e7e0','#ebd9d0','#e1e8ce','#f0e6bc','#e3e9d7',
 '#e4e6de','#dfe7c7','#ebd8cd','#e0e8cd','#eddccf','#e3e6de',
 '#dfe4d3','#e7e2d6','#e4ddbf','#dfe7c4','#efd9ce','#ecdcd4',
 '#e1e8cc','#dae1ce','#e5dfd0','#e5e9df','#e5e0ee','#dfe5d2',
 '#d9e6bd','#dfd3ad','#e2ebc7','#f3d7cb','#edf1df','#fae8df',
 '#ded5ee','#ebe5f3','#e8ecdc','#e7e7dc',
]);
/** Map authored colours without mutation; SVG values like "none" survive. */
export function filmColor(value){
 if(typeof value!=='string')return value;
 const key=value.toLowerCase();
 return palette[key]||(lightSurfaces.has(key)?FILM_THEME.surface:value);
}
/** Legend chips represent object fills, so a named black ball stays black. */
export function legendColor(value){
 return String(value).toLowerCase()==='#222522'?FILM_THEME.slate:filmColor(value);
}
