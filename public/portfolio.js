const isAdmin=document.documentElement.dataset.page==='admin';
const t=key=>resumeCopy[key]?.[document.documentElement.lang==='en'?1:0]||key;
let projects=[],authenticated=false,loading=false,previewURL;
const status=document.querySelector(isAdmin?'#admin-status':'#portfolio-status');
async function api(path,options={}){
 let response;try{response=await fetch('/api/'+path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}});}catch{throw Error(t('network-error'));}
 let data;try{data=await response.json();}catch{throw Error(response.status===429?'登入嘗試過多，請一分鐘後再試 / Too many attempts. Try again in a minute.':t('load-error'));}
 if(!response.ok){if(response.status===401&&isAdmin){authenticated=false;renderAuth();}throw Error(data.error||t('load-error'));}return data;
}
function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text)n.textContent=text;return n;}
function renderProjects(){
 const grid=document.querySelector(isAdmin?'#admin-projects':'#portfolio-grid');grid.replaceChildren();
 if(!projects.length){grid.append(node('p','empty-state',t('empty-portfolio')));return;}
 const en=document.documentElement.lang==='en';
 for(const p of projects){
  const article=node('article','portfolio-card'),title=en?(p.titleEn||p.title):p.title,description=en?(p.descriptionEn||p.description):p.description;
  if(p.asset?.type?.startsWith('image/')){const img=node('img');img.src='/api/assets/'+p.id;img.alt=title;img.loading='lazy';article.append(img);}else{const art=node('div','project-file-symbol',p.asset?'PDF':'↗');art.setAttribute('aria-hidden','true');article.append(art);}
  const content=node('div','portfolio-card-content');content.append(node('h2','',title));if(description)content.append(node('p','project-description',description));
  const links=node('div','project-actions');
  if(p.link){try{const url=new URL(p.link);if(['http:','https:'].includes(url.protocol)){const a=node('a','',t('open-project')+' ↗');a.href=p.link;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}}catch{}}
  if(p.asset){const a=node('a','',t('download-file')+' ↓');a.href='/api/assets/'+p.id;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
  if(isAdmin&&authenticated){const button=node('button','archive-button',t('archive'));button.type='button';button.addEventListener('click',async()=>{button.disabled=true;try{await api('archive',{method:'POST',body:JSON.stringify({id:p.id})});projects=projects.filter(item=>item.id!==p.id);renderProjects();status.textContent=t('archived');}catch(e){status.textContent=e.message;button.disabled=false;}});links.append(button);}
  content.append(links);article.append(content);grid.append(article);
 }
}
async function loadProjects(){loading=true;status.textContent=t('working');try{projects=(await api('projects')).projects;renderProjects();status.textContent='';}catch(e){status.replaceChildren(node('span','',e.message));const retry=node('button','retry-button',t('retry'));retry.addEventListener('click',loadProjects);status.append(retry);}finally{loading=false;}}
function renderAuth(){document.querySelector('#login-form').hidden=authenticated;document.querySelector('#admin-editor').hidden=!authenticated;}
if(isAdmin){
 const login=document.querySelector('#login-form'),form=document.querySelector('#project-form');
 (async()=>{try{authenticated=(await api('session')).authenticated;renderAuth();status.textContent='';if(authenticated)await loadProjects();}catch(e){login.hidden=false;status.textContent=e.message;}})();
 login.addEventListener('submit',async e=>{e.preventDefault();const button=login.querySelector('button');button.disabled=true;status.textContent=t('working');try{await api('login',{method:'POST',body:JSON.stringify({password:login.elements.password.value})});login.reset();authenticated=true;renderAuth();await loadProjects();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
 document.querySelector('#logout').addEventListener('click',async()=>{try{await api('logout',{method:'POST',body:'{}'});authenticated=false;form.reset();clearPreview();renderAuth();status.textContent='';}catch(e){status.textContent=e.message;}});
 function clearPreview(){if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;document.querySelector('#file-preview').replaceChildren();}
 form.elements.file.addEventListener('change',()=>{clearPreview();const file=form.elements.file.files[0];if(!file)return;if(file.size>3*1024*1024){status.textContent='檔案上限 3 MB / Maximum file size: 3 MB';form.elements.file.value='';return;}if(file.type.startsWith('image/')){previewURL=URL.createObjectURL(file);const img=node('img');img.src=previewURL;img.alt=file.name;document.querySelector('#file-preview').append(img);}else document.querySelector('#file-preview').append(node('p','',file.name));});
 form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent=t('publishing');try{
  const data={};for(const key of ['title','titleEn','description','descriptionEn','link'])data[key]=form.elements[key].value;
  const file=form.elements.file.files[0];if(file){if(file.size>3*1024*1024)throw Error('檔案上限 3 MB / Maximum file size: 3 MB');const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});data.file={name:file.name,base64};}
  const {project}=await api('projects',{method:'POST',body:JSON.stringify(data)});projects.unshift(project);renderProjects();form.reset();clearPreview();status.textContent=t('published');status.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
}else loadProjects();
document.addEventListener('languagechange',()=>{if(!loading)renderProjects();});
