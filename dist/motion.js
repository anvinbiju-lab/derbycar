(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  const picture = document.querySelector('.hero-picture');
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true'); header.append(progress);
  let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
  let heroHeight = hero.offsetHeight, heroTop = hero.offsetTop, pageHeight = document.documentElement.scrollHeight - innerHeight;
  const measure = () => { heroHeight=hero.offsetHeight;heroTop=hero.offsetTop;pageHeight=document.documentElement.scrollHeight-innerHeight; schedule(); };
  const tick = () => {
    frame=0;
    const scroll=window.scrollY;
    header.classList.toggle('scrolled',scroll>24);
    progress.style.transform=`scaleX(${Math.min(1,Math.max(0,scroll/Math.max(1,pageHeight)))})`;
    if(preference.matches || !finePointer.matches || innerWidth<=800 || document.hidden) return;
    const visible=scroll<heroTop+heroHeight;
    targetX=visible?pointerX:0;
    targetY=visible?Math.min(scroll*.025,10)+pointerY:0;
    x+=(targetX-x)*.08; y+=(targetY-y)*.08;
    picture.style.setProperty('--hero-x',`${x.toFixed(2)}px`);
    picture.style.setProperty('--hero-y',`${y.toFixed(2)}px`);
    if(visible && (Math.abs(x-targetX)>.05 || Math.abs(y-targetY)>.05)) schedule();
  };
  function schedule(){if(!frame) frame=requestAnimationFrame(tick);}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  hero.addEventListener('pointermove',event=>{if(preference.matches || !finePointer.matches)return;const rect=hero.getBoundingClientRect();pointerX=((event.clientX-rect.left)/rect.width-.5)*-12;pointerY=((event.clientY-rect.top)/rect.height-.5)*-8;schedule();},{passive:true});
  hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
  if('ResizeObserver' in window)new ResizeObserver(measure).observe(document.body);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  preference.addEventListener('change',()=>{if(preference.matches){x=y=pointerX=pointerY=0;picture.style.removeProperty('--hero-x');picture.style.removeProperty('--hero-y');document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}schedule();});
  schedule();

  document.querySelectorAll('.button,.service-card').forEach(element=>{
    let pending=0, latest;
    element.addEventListener('pointermove',event=>{
      if(preference.matches || !finePointer.matches || innerWidth<=800)return;
      latest={x:event.clientX,y:event.clientY};
      if(pending)return;
      pending=requestAnimationFrame(()=>{
        pending=0;const rect=element.getBoundingClientRect();const px=latest.x-rect.left,py=latest.y-rect.top;
        if(element.classList.contains('service-card')){
          element.style.setProperty('--shine-x',`${px}px`);element.style.setProperty('--shine-y',`${py}px`);
          element.style.setProperty('--tilt-x',`${(py/rect.height-.5)*-2}deg`);element.style.setProperty('--tilt-y',`${(px/rect.width-.5)*2}deg`);
        }else{element.style.setProperty('--magnet-x',`${(px/rect.width-.5)*5}px`);element.style.setProperty('--magnet-y',`${(py/rect.height-.5)*4}px`);}
      });
    },{passive:true});
    element.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;['--tilt-x','--tilt-y','--magnet-x','--magnet-y'].forEach(prop=>element.style.removeProperty(prop));});
  });

  const routeAnimations = new Map();
  document.querySelectorAll('[data-airport]').forEach(button=>button.addEventListener('click',()=>{
    if(preference.matches)return;
    ['#airport-code','#airport-name','.flight-line span'].forEach((selector,index)=>{
      const element=document.querySelector(selector);routeAnimations.get(element)?.cancel();
      const frames=index===2?[{transform:'translateX(-16px)',opacity:0},{transform:'translateX(0)',opacity:1}]:[{transform:'translateY(9px)',opacity:0},{transform:'translateY(0)',opacity:1}];
      routeAnimations.set(element,element.animate(frames,{duration:480,delay:index*45,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    });
  }));

  document.querySelectorAll('.faq-list details').forEach(details=>{
    const summary=details.querySelector('summary');let animation=null, desiredOpen=details.open;
    summary.addEventListener('click',event=>{
      if(preference.matches){animation?.cancel();animation=null;details.style.height='';details.style.overflow='';return;}
      event.preventDefault();desiredOpen=animation?!desiredOpen:!details.open;
      const start=details.getBoundingClientRect().height;
      animation?.cancel();details.open=true;details.style.height='auto';
      const end=desiredOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+2;
      details.style.overflow='hidden';
      animation=details.animate({height:[`${start}px`,`${end}px`]},{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
      animation.onfinish=()=>{details.open=desiredOpen;details.style.height='';details.style.overflow='';animation=null;};
    });
    preference.addEventListener('change',()=>{if(preference.matches&&animation){animation.cancel();animation=null;details.open=desiredOpen;details.style.height='';details.style.overflow='';}});
  });
})();
