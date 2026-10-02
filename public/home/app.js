const mobileNav=document.querySelector('.main-nav');
if(mobileNav&&!mobileNav.querySelector('.mobile-auth-links')){const auth=document.createElement('div');auth.className='mobile-auth-links';auth.innerHTML='<a href="/login">Log in</a><a href="/signup">Get started</a>';mobileNav.appendChild(auth)}
document.querySelector('.menu-toggle')?.addEventListener('click',e=>{const n=document.querySelector('.main-nav');const open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'×':'☰'});
document.querySelector('.search-input')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();document.querySelectorAll('.directory-card').forEach(c=>c.classList.toggle('hidden',!c.dataset.search.includes(q)))});
const tabs=document.querySelectorAll('.tour-tabs button');
const tourCopy=[
  ['Relocation Expert','Answers that know your plan.'],
  ['My Plan','Your move, clearly mapped.'],
  ['Documents','Documents, organized.'],
  ['Checklists','Every step, covered.'],
  ['Country Guide','Compare what matters.'],
  ['Cost Calculator','Know the real cost.']
];
function activateTour(index){
  tabs.forEach((tab,i)=>{const active=i===index;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active))});
  const frame=document.querySelector('.tour-dashboard iframe');
  const views=['advisor','plan','documents','documents','countries','overview'];
  if(frame&&frame.dataset.view!==views[index]){
    frame.dataset.view=views[index];
    frame.classList.add('is-switching');
    window.setTimeout(()=>{
      frame.src=`https://relova-design-preview.murbinance.chatgpt.site/dashboard-preview/?panel=${views[index]}&embed=1`;
      frame.addEventListener('load',()=>frame.classList.remove('is-switching'),{once:true});
    },140);
  }
  const narrative=document.querySelector('.tour-narrative');if(!narrative)return;
  narrative.querySelector('.eyebrow').textContent='Relova / '+tourCopy[index][0];
  narrative.querySelector('h3').textContent=tourCopy[index][1];
}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activateTour(i));tab.addEventListener('mouseenter',()=>activateTour(i));tab.addEventListener('focus',()=>activateTour(i))});
document.querySelectorAll('.billing-toggle button').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.billing;
  document.querySelectorAll('.billing-toggle button').forEach(item=>item.classList.toggle('active',item===button));
  document.querySelectorAll('.price').forEach(price=>{
    price.querySelector('span').textContent=price.dataset[mode];
    price.querySelector('small').textContent=price.dataset[`${mode}Period`];
  });
  document.querySelectorAll('.price-cta').forEach(cta=>cta.textContent=cta.dataset[`${mode}Label`]);
  const note=document.querySelector('.lifetime-note');
  if(note)note.hidden=mode!=='lifetime';
}));
document.querySelectorAll('.price-cta').forEach(cta=>cta.addEventListener('click',event=>{
  event.preventDefault();
  const plan=(cta.closest('.price-card')?.querySelector('h3')?.textContent||'').trim().toLowerCase();
  if(plan==='free'){location.href='/chat';return;}
  const lifetime=document.querySelector('.billing-toggle button.active')?.dataset.billing==='lifetime';
  location.href=`/checkout?plan=${plan}${lifetime?'_lifetime':''}`;
}));
document.querySelector('.concierge .btn')?.addEventListener('click',event=>{
  event.preventDefault();
  location.href='/checkout?plan=concierge';
});
if(matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
  document.querySelectorAll('.feature,.tile,.price-card,.tool-card,.directory-card,.country-card').forEach(card=>{
    let frame=0;
    card.addEventListener('pointermove',event=>{
      if(frame)cancelAnimationFrame(frame);
      const x=event.clientX,y=event.clientY;
      frame=requestAnimationFrame(()=>{
        const rect=card.getBoundingClientRect();
        card.style.setProperty('--mx',`${x-rect.left}px`);
        card.style.setProperty('--my',`${y-rect.top}px`);
        frame=0;
      });
    });
    card.addEventListener('pointerleave',()=>{
      if(frame)cancelAnimationFrame(frame);
      frame=0;
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}
