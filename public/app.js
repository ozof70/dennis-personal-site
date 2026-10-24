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
 if(timeline){const box=timeline.getBoundingClientRect(), amount=Math.max(0,Math.min(1,(innerHeight*.65-box.top)/box.height));
 document.querySelector('.timeline-fill').style.transform=`scaleY(${amount})`;
 }scrollFrame=0;
}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateJourney);},{passive:true});
addEventListener('resize',updateJourney);updateJourney();
for(const link of document.querySelectorAll('.header nav a'))link.addEventListener('click',e=>{
  if(reduced.matches)return;
  const rect=link.getBoundingClientRect(),x=e.detail?e.clientX:rect.left+rect.width/2,y=e.detail?e.clientY:rect.top+rect.height/2;
  link.classList.remove('nav-pop');void link.offsetWidth;link.classList.add('nav-pop');setTimeout(()=>link.classList.remove('nav-pop'),450);
  const ring=document.createElement('span');ring.className='nav-burst';ring.setAttribute('aria-hidden','true');ring.style.left=`${x}px`;ring.style.top=`${y}px`;document.body.append(ring);setTimeout(()=>ring.remove(),650);
  for(let i=0;i<10;i++){const spark=document.createElement('span');spark.className='nav-spark';spark.setAttribute('aria-hidden','true');spark.style.left=`${x}px`;spark.style.top=`${y}px`;const a=i*Math.PI/5;spark.style.setProperty('--dx',`${Math.cos(a)*85}px`);spark.style.setProperty('--dy',`${Math.sin(a)*85}px`);document.body.append(spark);setTimeout(()=>spark.remove(),600);}
});

// Triangular lattice inspired by the reference: nearby edges glow and fade.
const mesh=document.querySelector('#mesh-background'),meshContext=mesh.getContext('2d');
if(meshContext){
 let width=0,height=0,edges=[],frame=0,lastTime=0,mouse={x:-1000,y:-1000},energy=0;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 function resizeMesh(){
  width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);mesh.width=width*dpr;mesh.height=height*dpr;meshContext.setTransform(dpr,0,0,dpr,0,0);edges=[];
  const step=52,dy=step*Math.sqrt(3)/2,rows=Math.ceil(height/dy)+1,cols=Math.ceil(width/step)+2;
  for(let r=0;r<rows;r++)for(let c=-1;c<cols;c++){
   const x=c*step+(r%2)*step/2,y=r*dy;
   edges.push({x,y,x2:x+step,y2:y,glow:0});
   edges.push({x,y,x2:x+step/2,y2:y+dy,glow:0});
   edges.push({x,y,x2:x-step/2,y2:y+dy,glow:0});
  }
  renderMesh(performance.now());
 }
 function renderMesh(time){
  if(frame){cancelAnimationFrame(frame);frame=0;}
  const dt=Math.min(50,time-lastTime||16);lastTime=time;meshContext.clearRect(0,0,width,height);let active=false;
  for(const edge of edges){
   const distance=Math.hypot((edge.x+edge.x2)/2-mouse.x,(edge.y+edge.y2)/2-mouse.y);
   const proximity=fine.matches&&!reduced.matches?Math.max(0,1-distance/150)*energy:0;
   edge.glow=Math.max(proximity,edge.glow-dt/1250);
   const glow=edge.glow*(.82+.18*Math.sin(time*.0025+edge.x*.015));
   meshContext.beginPath();meshContext.moveTo(edge.x,edge.y);meshContext.lineTo(edge.x2,edge.y2);
   meshContext.strokeStyle=glow>.01?`rgba(196,245,99,${.045+glow*.5})`:'rgba(173,193,151,.045)';meshContext.lineWidth=glow>.2?1.2:.6;meshContext.stroke();if(edge.glow>.002)active=true;
  }
  if(energy>0){energy=Math.max(0,energy-dt/2100);active=true;}
  if(active&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(renderMesh);
 }
 addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!fine.matches||reduced.matches)return;mouse={x:e.clientX,y:e.clientY};energy=1;if(!frame)frame=requestAnimationFrame(renderMesh);},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{energy=0;mouse={x:-1000,y:-1000};});
 addEventListener('resize',resizeMesh);reduced.addEventListener('change',resizeMesh);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resizeMesh();});resizeMesh();
}
