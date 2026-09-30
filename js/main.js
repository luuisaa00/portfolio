(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* celosía de la grúa */
  function zig(pts){ return 'M' + pts.map(function(p){return p[0]+' '+p[1];}).join('L'); }
  var m=[],i,k=0; for(i=50;i<=386;i+=14){ m.push([k%2?414:400,i]); k++; }
  document.getElementById('mastZig').setAttribute('d',zig(m));
  var j=[]; k=0; for(i=60;i<=452;i+=12){ j.push([i,k%2?50:40]); k++; }
  document.getElementById('jibZig').setAttribute('d',zig(j));

  /* dibujo a trazo */
  function draw(root, base){
    if(reduce) return;
    var els = root.querySelectorAll('.draw');
    els.forEach(function(el,n){
      var len; try{ len = el.getTotalLength(); }catch(e){ return; }
      if(!len) return;
      var dash = el.getAttribute('stroke-dasharray');
      el.style.strokeDasharray = len+' '+len;
      el.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:700,delay:(base||0)+n*45,easing:'ease-out',fill:'backwards'})
        .onfinish=function(){ el.style.strokeDasharray = dash || ''; };
    });
  }

  /* montaje del hero */
  var carga=document.getElementById('carga'), rig=document.getElementById('rig'),
      cable=document.getElementById('cable'), hook=document.getElementById('hook'),
      gato=document.getElementById('gato'), nota=document.getElementById('nota');
  var ease=function(t){return 1-Math.pow(1-t,3);};
  function setCable(y){ cable.setAttribute('y2',y); hook.setAttribute('transform','translate(0 '+(y-66)+')'); }
  function tween(ms,fn,done){
    var t0=null; function step(ts){ if(t0===null) t0=ts; var t=Math.min(1,(ts-t0)/ms); fn(t); if(t<1) requestAnimationFrame(step); else if(done) done(); }
    requestAnimationFrame(step);
  }
  var running=false;
  function montaje(){
    if(reduce || running) return;
    running=true;
    var OFF=90;
    gato.style.opacity=0; nota.style.opacity=0; rig.setAttribute('opacity',1);
    carga.setAttribute('transform','translate(0 '+(-OFF)+')'); setCable(166-1.15*OFF);
    draw(document.querySelector('#heroPlan svg'),0);
    setTimeout(function(){
      tween(1500,function(t){ var off=OFF*(1-ease(t)); carga.setAttribute('transform','translate(0 '+(-off)+')'); setCable(166-1.15*off); },function(){
        rig.setAttribute('opacity',0);
        tween(700,function(t){ setCable(166-100*ease(t)); },function(){
          gato.style.opacity=1; draw(gato,0);
          tween(500,function(t){ nota.style.opacity=t; },function(){ running=false; });
        });
      });
    },1500);
  }
  montaje();
  document.getElementById('replay').addEventListener('click',montaje);

  var cb=document.getElementById('cotasBtn'), hp=document.getElementById('heroPlan');
  cb.addEventListener('click',function(){
    var off=hp.classList.toggle('hide-cotas');
    cb.setAttribute('aria-pressed',String(!off)); cb.textContent='Cotas: '+(off?'no':'sí');
  });

  /* pestañas de modelos */
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  function select(tab){
    tabs.forEach(function(t){
      var on=t===tab; t.setAttribute('aria-selected',on); t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!on;
    });
    draw(document.getElementById(tab.getAttribute('aria-controls')),0);
  }
  tabs.forEach(function(t,n){
    t.addEventListener('click',function(){select(t);});
    t.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if(!d) return;
      var nx=tabs[(n+d+tabs.length)%tabs.length]; nx.focus(); select(nx);
    });
  });

  /* avance de obra */
  var secs=[].slice.call(document.querySelectorAll('section.phase')), links=[].slice.call(document.querySelectorAll('.nav a.link'));
  var pct=document.getElementById('pct'), bar=document.getElementById('bar'), fase=document.getElementById('fase');
  function onScroll(){
    var h=document.documentElement.scrollHeight-innerHeight, p=h>0?Math.round(scrollY/h*100):100;
    p=Math.max(0,Math.min(100,p)); pct.textContent=p+'%'; bar.style.setProperty('--p',p+'%');
    var cur=secs[0]; secs.forEach(function(s){ if(s.getBoundingClientRect().top<innerHeight*.4) cur=s; });
    fase.textContent=cur.getAttribute('data-fase');
    links.forEach(function(a){ a.classList.toggle('on',a.getAttribute('href')==='#'+cur.id); });
  }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); onScroll();

  /* mira CAD */
  var xh=document.getElementById('xh'), hl=xh.querySelector('.h'), vl=xh.querySelector('.v'), lbl=xh.querySelector('.lbl');
  addEventListener('pointermove',function(e){
    if(e.pointerType!=='mouse') return;
    xh.classList.add('on');
    hl.style.top=e.clientY+'px'; vl.style.left=e.clientX+'px';
    lbl.style.left=(e.clientX+12)+'px'; lbl.style.top=(e.clientY+12)+'px';
    lbl.textContent='X '+(e.clientX/100).toFixed(2)+'  Y '+((e.clientY+scrollY)/100).toFixed(2)+' m';
  },{passive:true});
  document.addEventListener('pointerleave',function(){ xh.classList.remove('on'); });

  /* copiar correo */
  var copy=document.getElementById('copy'), mail=document.getElementById('mail'), ok=document.getElementById('copied');
  copy.addEventListener('click',function(){
    function sel(){ var r=document.createRange(); r.selectNodeContents(mail); var s=getSelection(); s.removeAllRanges(); s.addRange(r); ok.textContent='Seleccionado'; }
    try{
      navigator.clipboard.writeText(mail.textContent).then(function(){ ok.textContent='Copiado'; },sel);
    }catch(e){ sel(); }
  });
})();
