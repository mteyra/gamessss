import {DEMOS} from './demos.js';
import {escapeHTML as esc} from './core.js';

// No autoplay: each action reveals one useful teaching beat.
export function mountDemo(container,id){
 const demo=DEMOS[id];if(!demo)return false;
 let step=0;
 container.classList.add('demo-player');
 container.innerHTML=`<div class="demo-player-frame"></div><div class="demo-player-caption" aria-live="polite"></div><div class="demo-player-controls"><div role="group" aria-label="Demonstration step">${demo.steps.map((caption,i)=>`<button type="button" data-demo-step="${i}" aria-label="Step ${i+1}: ${esc(caption)}" aria-pressed="${i===0}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div><button type="button" data-demo-next>Next move <span aria-hidden="true">→</span></button></div>`;
 function show(next,animate=false){
  step=next;
  container.querySelector('.demo-player-frame').innerHTML=demo.render(step,{animate:animate&&!document.body.classList.contains('motion-paused')});
  container.querySelector('.demo-player-caption').textContent=demo.steps[step];
  container.querySelectorAll('[data-demo-step]').forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.demoStep)===step));
  container.querySelector('[data-demo-next]').innerHTML=step===2?'Start again <span aria-hidden="true">↺</span>':'Next move <span aria-hidden="true">→</span>';
 }
 container.addEventListener('click',event=>{
  const button=event.target.closest('[data-demo-step],[data-demo-next]');if(!button)return;
  show(button.hasAttribute('data-demo-next')?(step+1)%demo.steps.length:Number(button.dataset.demoStep),true);
 });
 show(0);return true;
}
