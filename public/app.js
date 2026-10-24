const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#year').textContent=new Date().getFullYear();
if('IntersectionObserver' in window){
 document.documentElement.classList.add('js-motion');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
const timeline=document.querySelector('.timeline-wrap');
let scrollFrame=0;
function updateJourney(){
 const max=document.documentElement.scrollHeight-innerHeight;
 document.querySelector('.progress').style.width=`${max>0?scrollY/max*100:0}%`;
 const box=timeline.getBoundingClientRect(), amount=Math.max(0,Math.min(1,(innerHeight*.65-box.top)/box.height));
 document.querySelector('.timeline-fill').style.transform=`scaleY(${amount})`;
 scrollFrame=0;
}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateJourney);},{passive:true});
addEventListener('resize',updateJourney);updateJourney();
// A rotating planet follows the pointer; touch devices retain native controls.
const planetCursor = document.querySelector('.planet-cursor');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let planetX = -100, planetY = -100, pointerX = -100, pointerY = -100, cursorFrame = 0, lastTrail = 0;
function animatePlanet() {
  const easing = reduced.matches ? 1 : .24;
  planetX += (pointerX - planetX) * easing; planetY += (pointerY - planetY) * easing;
  planetCursor.style.transform = `translate3d(${planetX - 17.5}px,${planetY - 17.5}px,0)`;
  if (Math.abs(pointerX-planetX)+Math.abs(pointerY-planetY) > .2) cursorFrame=requestAnimationFrame(animatePlanet); else cursorFrame=0;
}
function syncPointerMode() { document.documentElement.classList.toggle('planet-pointer',finePointer.matches); }
if(planetCursor) {
  syncPointerMode(); finePointer.addEventListener('change',syncPointerMode);
  addEventListener('pointermove',e=>{
    if(!finePointer.matches||e.pointerType==='touch')return;
    pointerX=e.clientX;pointerY=e.clientY;
    if(!planetCursor.classList.contains('tracking')){planetX=pointerX;planetY=pointerY;planetCursor.classList.add('tracking');}
    if(!cursorFrame)animatePlanet();
    if(!reduced.matches && performance.now()-lastTrail>45){
      lastTrail=performance.now();const dot=document.createElement('span');dot.className='planet-trail';dot.setAttribute('aria-hidden','true');dot.style.left=`${planetX}px`;dot.style.top=`${planetY}px`;document.body.append(dot);setTimeout(()=>dot.remove(),600);
    }
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>planetCursor.classList.remove('tracking'));
  addEventListener('blur',()=>planetCursor.classList.remove('tracking'));
}
for(const link of document.querySelectorAll('.header nav a'))link.addEventListener('click',e=>{
  if(reduced.matches)return;
  const rect=link.getBoundingClientRect(),x=e.detail?e.clientX:rect.left+rect.width/2,y=e.detail?e.clientY:rect.top+rect.height/2;
  link.classList.remove('nav-pop');void link.offsetWidth;link.classList.add('nav-pop');setTimeout(()=>link.classList.remove('nav-pop'),450);
  const ring=document.createElement('span');ring.className='nav-burst';ring.setAttribute('aria-hidden','true');ring.style.left=`${x}px`;ring.style.top=`${y}px`;document.body.append(ring);setTimeout(()=>ring.remove(),650);
  for(let i=0;i<10;i++){const spark=document.createElement('span');spark.className='nav-spark';spark.setAttribute('aria-hidden','true');spark.style.left=`${x}px`;spark.style.top=`${y}px`;const a=i*Math.PI/5;spark.style.setProperty('--dx',`${Math.cos(a)*85}px`);spark.style.setProperty('--dy',`${Math.sin(a)*85}px`);document.body.append(spark);setTimeout(()=>spark.remove(),600);}
});
