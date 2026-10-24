const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clock = document.querySelector('#local-time');
function updateClock() { clock.textContent = `TAIWAN / ${new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit'}).format(new Date())}`; }
updateClock(); setInterval(updateClock, 60000);
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
addEventListener('scroll', () => { const max = document.documentElement.scrollHeight-innerHeight; document.querySelector('.progress').style.width = `${max > 0 ? scrollY/max*100 : 0}%`; }, {passive:true});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  document.querySelectorAll('.project').forEach(p => { p.hidden = button.dataset.filter !== 'all' && p.dataset.category !== button.dataset.filter; });
}));
const dialog = document.querySelector('#demo-dialog'), stage = document.querySelector('#demo-stage');
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if(e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
  stage.replaceChildren(); stage.style.background = '#111710';
  const demo = b.dataset.demo;
  if (demo === 'orbit') {
    const shape = document.createElement('div'); shape.className = 'demo-orbit'; stage.append(shape);
    const control = document.createElement('input'); control.type='range'; control.min='2';control.max='20';control.value='9';control.className='color-slider';control.setAttribute('aria-label','軌道旋轉週期');
    control.addEventListener('input',()=>shape.style.animationDuration=`${control.value}s`);stage.append(control);
    document.querySelector('#demo-description').textContent='軌道之外 / 拖動滑桿，調整軌道旋轉速度。';
  } else if(demo === 'gradient') {
    const shape=document.createElement('div');shape.className='glass-shape';stage.append(shape);stage.style.background='#b9affb';
    const control=document.createElement('input');control.type='range';control.min='0';control.max='360';control.value='0';control.className='color-slider';control.setAttribute('aria-label','色彩色相');control.addEventListener('input',()=>{shape.style.filter=`hue-rotate(${control.value}deg)`;stage.style.background=`hsl(${255+Number(control.value)} 65% 80%)`;});stage.append(control);
    document.querySelector('#demo-description').textContent='流動的色彩 / 拖動滑桿，找到屬於你的色彩。';
  } else {
    const input=document.createElement('input');input.className='type-input';input.value='想像無限';input.maxLength=12;input.setAttribute('aria-label','輸入你想展示的文字');stage.append(input);
    document.querySelector('#demo-description').textContent='字裡的可能 / 輸入一個念頭，讓文字成為畫面。最多 12 個字。';
  }
  document.querySelector('#demo-label').textContent=b.querySelector('h3').textContent+' / LIVE EXPERIMENT';dialog.showModal();
}));
let toastTimer;
document.querySelector('#copy-link').addEventListener('click',async()=>{
  const toast=document.querySelector('#toast');
  try { await navigator.clipboard.writeText('https://dennis-tw.com/');toast.textContent='網站連結已複製'; }
  catch { toast.textContent='網站連結：https://dennis-tw.com/'; }
  toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500);
});
const canvas=document.querySelector('#orb'),ctx=canvas.getContext('2d');
if(ctx) {
  let w=0,h=0,frame=0,phase=0,targetX=0,targetY=0,rx=0,ry=0,visible=true;
  const points=Array.from({length:1050},(_,i)=>{const y=1-2*(i+.5)/1050;const r=Math.sqrt(1-y*y);const a=i*Math.PI*(3-Math.sqrt(5));return [Math.cos(a)*r,y,Math.sin(a)*r];});
  const resize=()=>{const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  new ResizeObserver(resize).observe(canvas);
  canvas.addEventListener('pointermove',e=>{const box=canvas.getBoundingClientRect();targetX=(e.clientX-box.left)/w-.5;targetY=(e.clientY-box.top)/h-.5;},{passive:true});
  canvas.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  function draw(){
    ctx.clearRect(0,0,w,h);rx+=(targetX-rx)*.035;ry+=(targetY-ry)*.035;
    const radius=Math.min(w*.32,h*.38),cx=w*.52,cy=h*.48,a=phase+rx*.7,b=-.2+ry*.5;
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.5);glow.addColorStop(0,'#c4f5630a');glow.addColorStop(1,'#c4f56300');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    const rotated=points.map(([x,y,z])=>{const xx=x*Math.cos(a)-z*Math.sin(a),zz=x*Math.sin(a)+z*Math.cos(a);return [xx,y*Math.cos(b)-zz*Math.sin(b),y*Math.sin(b)+zz*Math.cos(b)];}).sort((p,q)=>p[2]-q[2]);
    for(const [x,y,z] of rotated){const scale=1/(1-z*.15);ctx.beginPath();ctx.arc(cx+x*radius*scale,cy+y*radius*scale,(z+1)*.6+.35,0,Math.PI*2);ctx.fillStyle=`rgba(196,245,99,${.16+(z+1)*.32})`;ctx.fill();}
    for(let j=0;j<3;j++){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.48+j*.43);ctx.scale(1,.25+j*.05);ctx.beginPath();ctx.arc(0,0,radius*(1.24+j*.1),0,Math.PI*2);ctx.strokeStyle=j===1?'#c4f56375':'#c4f56329';ctx.lineWidth=.8;ctx.stroke();ctx.restore();}
    if(!reduced.matches&&visible){phase+=.0025;frame=requestAnimationFrame(draw);}else frame=0;
  }
  const restart=()=>{if(!frame)draw();};
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)restart();}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)restart();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;restart();});resize();restart();
}
