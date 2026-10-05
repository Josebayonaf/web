(() => {
  'use strict';
  const slides = window.SLIDES;
  const stage = document.getElementById('stage');
  const indexDialog = document.getElementById('index-dialog');
  const notesDialog = document.getElementById('notes-dialog');
  let current = 0;
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled=!motionPreference.matches;
  let running=[];
  const completedChecks=new Set();
  const money=n=>'$'+Math.round(n).toLocaleString('es-CO');
  const cancelMotion=()=>{running.forEach(a=>a.cancel());running=[];};
  function play(el,frames,options={}){
    if(!el||!motionEnabled)return;
    const a=el.animate(frames,{duration:850,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...options});
    running.push(a);return a;
  }
  function syncMotionButton(){
    document.body.classList.toggle('motion-off',!motionEnabled);
    const b=document.getElementById('motion-button');
    b.textContent='Movimiento: '+(motionEnabled?'sí':'no');b.setAttribute('aria-pressed',String(motionEnabled));
  }
  function animateSlide(direction=1){
    cancelMotion();syncMotionButton();
    if(!motionEnabled)return;
    const a=stage.querySelector('.slide');
    play(a,[{opacity:0,transform:`translateX(${direction*70}px) rotateY(${direction*5}deg) scale(.975)`},{opacity:1,transform:'translateX(0) rotateY(0deg) scale(1)'}],{duration:740});
    const title=a.querySelector('h1,h2');
    if(title){
      const lines=title.querySelectorAll('.title-line, :scope > span');
      if(lines.length)lines.forEach((line,i)=>play(line,[{transform:'translateY(105%)',opacity:0,clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',opacity:1,clipPath:'inset(0 0 0 0)'}],{delay:120+i*150,duration:1150}));
      else play(title,[{transform:'translateY(38px)',opacity:0,clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',opacity:1,clipPath:'inset(0 0 0 0)'}],{delay:100,duration:980});
    }
    const items=a.querySelectorAll('.eyebrow,.lede,.list li,.three>div,.split>div,.column-list>div,.table tbody tr,.callout,.route-choice,.route-detail,.check-item,.investment,.cost-row');
    items.forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{delay:180+Math.min(i,9)*80,duration:750}));
    const art=a.querySelector('.art');
    if(art)play(art,[{transform:'scale(1.015) translateX(-.5%)'},{transform:'scale(1.09) translateX(1%)'}],{duration:15000,direction:'alternate',iterations:Infinity,easing:'ease-in-out'});
    a.querySelectorAll('.creative-sequence>div').forEach((el,i)=>{
      play(el,[{opacity:0,transform:'translateY(34px)'},{opacity:1,transform:'translateY(0)'}],{delay:450+i*850});
      play(el.querySelector('.sequence-line'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{delay:450+i*850,duration:850,easing:'ease-in-out'});
    });
    a.querySelectorAll('.hierarchy>div').forEach((el,i)=>play(el,[{opacity:0,transform:'translateX(-60px) rotateX(-18deg)'},{opacity:1,transform:'translateX(0) rotateX(0deg)'}],{delay:400+i*450,duration:900}));
    a.querySelectorAll('[data-chat]').forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(24px) scale(.82)'},{opacity:1,transform:'translateY(0) scale(1)'}],{delay:650+i*1400,duration:700}));
    a.querySelectorAll('.journey>div').forEach((el,i)=>play(el,[{opacity:.15,transform:'translateX(-35px)'},{opacity:1,transform:'translateX(0)'}],{delay:500+i*700,duration:1000}));
    a.querySelectorAll('.cost-fill').forEach((el,i)=>play(el,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{delay:450+i*220,duration:1300}));
    a.querySelectorAll('.cost-label strong').forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{delay:500+i*220}));
  }
  function syncChecks(){
    const items=stage.querySelectorAll('.check-item');
    items.forEach((b,i)=>{const done=completedChecks.has(i);b.setAttribute('aria-pressed',String(done));b.querySelector('b').textContent=done?'✓':'+';});
    const p=stage.querySelector('.check-progress');if(p)p.textContent=`${completedChecks.size} de 8 comprobados`;
  }
  const clamp = n => Math.min(slides.length - 1,Math.max(0,n));
  const pad = n => String(n).padStart(2,'0');
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(n, focus=false) {
    const direction=n>=current?1:-1;
    cancelMotion();
    current=clamp(n);
    const slide=slides[current];
    stage.innerHTML=`<article class="slide ${slide.type || ''}" aria-label="Diapositiva ${current+1} de ${slides.length}: ${escape(slide.title)}">${slide.body}<div class="slide-footer"><span>FÓRMULA JUMPERS / ADS</span><span>${pad(current+1)} — ${pad(slides.length)}</span></div></article>`;
    document.getElementById('counter').innerHTML=`${pad(current+1)} <span>/ ${pad(slides.length)}</span>`;
    document.getElementById('prev').disabled=current===0;
    document.getElementById('next').disabled=current===slides.length-1;
    document.getElementById('progress').style.width=`${(current+1)/slides.length*100}%`;
    document.getElementById('announcement').textContent=`Diapositiva ${current+1} de ${slides.length}. ${slide.title}.`;
    document.title=`${slide.title} · Fórmula Jumpers`;
    document.querySelectorAll('#slide-index button').forEach((b,i)=>{b.classList.toggle('current',i===current);b.setAttribute('aria-current',i===current?'step':'false')});
    syncChecks();animateSlide(direction);
    if(focus) {stage.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function go(n) {const target=clamp(n);if(target===current)return;history.pushState(null,'',`#${target+1}`);render(target,true);}
  function fromHash(){const raw=location.hash.slice(1);const n=/^\d+$/.test(raw)?Number(raw)-1:0;render(clamp(n));}
  function openIndex(){indexDialog.showModal();indexDialog.querySelector('.current')?.focus();}
  function openNotes(){
    const slide=slides[current],n=slide.notes;
    document.getElementById('notes-number').textContent=`GUÍA DE CLASE / ${pad(current+1)} DE ${pad(slides.length)}`;
    document.getElementById('notes-title').textContent=slide.title;
    let html=[['Explicación',n.explanation],['Demostración en pantalla',n.demo],['Tarea',n.task],['Criterio de comprobación',n.check]].map(([title,text])=>`<section><h3>${title}</h3><p>${escape(text)}</p></section>`).join('');
    if(n.sources)html+=`<section><h3>Fuente de consulta</h3><ul>${n.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a></li>`).join('')}</ul></section>`;
    if(n.referenceLinks)html+=`<section><h3>Recurso para la revisión en cuenta</h3><ul>${n.referenceLinks.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a></li>`).join('')}</ul><p class="note-disclosure">Comprueba las reglas vigentes en este recurso al preparar tu campaña.</p></section>`;
    if(n.downloads)html+=`<section><h3>Plantillas de implementación</h3><a class="download" href="recursos/ficha-campana.txt" download>Descargar ficha de campaña y checklist (.txt)</a><a class="download" href="recursos/seguimiento-leads.csv" download>Descargar registro de seguimiento (.csv)</a><a class="download" href="recursos/resultados-campana.csv" download>Descargar registro de resultados (.csv)</a></section>`;
    html+=`<p class="note-disclosure">Base: documento «MÓDULO ADS». Los casos y cifras de práctica son ilustrativos. Los pasos concretos de Meta se comprueban en la cuenta usada para la demostración.</p>`;
    document.getElementById('notes-content').innerHTML=html;notesDialog.showModal();
  }
  async function toggleFullscreen(){
    try {if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error('unsupported');}
    catch{document.getElementById('fullscreen-button').textContent='Usa pantalla completa del navegador';}
  }
  document.getElementById('slide-index').innerHTML=slides.map((s,i)=>`<button data-slide="${i}"><span>${pad(i+1)}</span>${escape(s.title)}</button>`).join('');
  document.getElementById('slide-index').addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(b){indexDialog.close();go(Number(b.dataset.slide));}});
  document.getElementById('prev').addEventListener('click',()=>go(current-1));
  document.getElementById('next').addEventListener('click',()=>go(current+1));
  document.getElementById('index-button').addEventListener('click',openIndex);
  document.getElementById('counter').addEventListener('click',openIndex);
  document.getElementById('notes-button').addEventListener('click',openNotes);
  document.getElementById('fullscreen-button').addEventListener('click',toggleFullscreen);
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  [indexDialog,notesDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreen-button').innerHTML=`${document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa'} <span class="keyhint">F</span>`;});
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||indexDialog.open||notesDialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    const k=e.key.toLowerCase();
    if(['arrowright','pagedown'].includes(k)||(k===' '&&e.target.tagName!=='BUTTON')){e.preventDefault();go(current+1);}
    else if(['arrowleft','pageup'].includes(k)){e.preventDefault();go(current-1);}
    else if(k==='home'){e.preventDefault();go(0);}
    else if(k==='end'){e.preventDefault();go(slides.length-1);}
    else if(k==='r'){e.preventDefault();animateSlide();}
    else if(k==='i'){e.preventDefault();openIndex();}
    else if(k==='n'){e.preventDefault();openNotes();}
    else if(k==='f'){e.preventDefault();toggleFullscreen();}
  });
  let touch=null;
  stage.addEventListener('touchstart',e=>{if(e.target.closest('input,button,a,select,textarea')){touch=null;return;}if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  stage.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));},{passive:true});
  window.addEventListener('hashchange',fromHash);
  window.addEventListener('popstate',fromHash);
  document.getElementById('replay-button').addEventListener('click',()=>animateSlide());
  document.getElementById('motion-button').addEventListener('click',()=>{motionEnabled=!motionEnabled;animateSlide();});
  motionPreference.addEventListener('change',e=>{motionEnabled=!e.matches;animateSlide();});
  document.addEventListener('visibilitychange',()=>{running.forEach(a=>document.hidden?a.pause():a.play());});
  stage.addEventListener('click',e=>{
    if(e.target.closest('[data-next]'))go(current+1);
    if(e.target.closest('[data-notes]'))openNotes();
    const route=e.target.closest('[data-route]');
    if(route){
      const wa=route.dataset.route==='wa';
      stage.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(b===route)));
      document.getElementById('route-heading').textContent=wa?'Del anuncio al chat.':'Del anuncio al perfil.';
      document.getElementById('route-text').textContent=wa?'Para cuando puedes responder, entender la necesidad y proponer un siguiente paso.':'Para cuando tu perfil explica tu propuesta, ofrece contenido relacionado y facilita iniciar una conversación.';
      document.getElementById('route-signal').textContent=wa?'SEÑAL: CONVERSACIONES CALIFICADAS':'SEÑAL: VISITAS Y CONVERSACIONES';
      play(stage.querySelector('.route-detail'),[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:500});
    }
    const check=e.target.closest('.check-item');
    if(check){const i=[...stage.querySelectorAll('.check-item')].indexOf(check);completedChecks.has(i)?completedChecks.delete(i):completedChecks.add(i);syncChecks();}
  });
  stage.addEventListener('input',e=>{
    if(e.target.id!=='investment')return;
    const value=Number(e.target.value);
    document.getElementById('investment-value').textContent=money(value);
    stage.querySelectorAll('[data-cost]').forEach(el=>el.textContent=money(value/Number(el.dataset.cost)));
  });
  fromHash();
})();
