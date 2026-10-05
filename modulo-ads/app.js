(() => {
  'use strict';
  const slides = window.SLIDES;
  const stage = document.getElementById('stage');
  const indexDialog = document.getElementById('index-dialog');
  const notesDialog = document.getElementById('notes-dialog');
  let current = 0;
  const clamp = n => Math.min(slides.length - 1,Math.max(0,n));
  const pad = n => String(n).padStart(2,'0');
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(n, focus=false) {
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
    else if(k==='i'){e.preventDefault();openIndex();}
    else if(k==='n'){e.preventDefault();openNotes();}
    else if(k==='f'){e.preventDefault();toggleFullscreen();}
  });
  let touch=null;
  stage.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  stage.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));},{passive:true});
  window.addEventListener('hashchange',fromHash);
  window.addEventListener('popstate',fromHash);
  fromHash();
})();
