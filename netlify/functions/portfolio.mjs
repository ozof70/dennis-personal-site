import {getStore} from '@netlify/blobs';
import {randomUUID} from 'node:crypto';
import {cookie,json,sameOrigin,validSession} from '../../server/auth.mjs';
const idPattern=/^[a-f0-9-]{36}$/;
const store=()=>getStore({name:'dennis-portfolio',consistency:'strong'});
function text(value,max){return typeof value==='string'?value.trim().slice(0,max):'';}
export function projectInput(data){
 const title=text(data.title,120),titleEn=text(data.titleEn,120),description=text(data.description,2000),descriptionEn=text(data.descriptionEn,2000),link=text(data.link,2000);
 if(!title)throw Error('請填寫作品名稱 / A title is required');
 if(link){try{if(!['https:','http:'].includes(new URL(link).protocol))throw Error();}catch{throw Error('請使用 http 或 https 網址 / Use an HTTP(S) URL');}}
 return {title,titleEn,description,descriptionEn,link};
}
export function fileType(bytes){
 if(bytes.subarray(0,5).toString()==='%PDF-')return {type:'application/pdf',ext:'pdf'};
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {type:'image/png',ext:'png'};
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {type:'image/jpeg',ext:'jpg'};
 if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')return {type:'image/webp',ext:'webp'};
 return null;
}
export default async function(req){
 const url=new URL(req.url),path=url.pathname;
 try{
 if(path==='/api/session'&&req.method==='GET')return json({authenticated:validSession(req)});
 if(path==='/api/logout'&&req.method==='POST'){if(!sameOrigin(req))return json({error:'Forbidden'},403);return json({authenticated:false},200,{'Set-Cookie':cookie('',0)});}
 if(path.startsWith('/api/assets/')&&req.method==='GET'){
  const id=path.split('/').pop();if(!idPattern.test(id))return json({error:'Not found'},404);
  const item=await store().get('projects/'+id,{type:'json'});if(!item?.asset)return json({error:'Not found'},404);
  const bytes=await store().get('assets/'+id,{type:'arrayBuffer'});if(!bytes)return json({error:'Not found'},404);
  return new Response(bytes,{headers:{'Content-Type':item.asset.type,'Content-Disposition':`${item.asset.type==='application/pdf'?'attachment':'inline'}; filename="${id}.${item.asset.ext}"`,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store'}});
 }
 if(path==='/api/projects'&&req.method==='GET'){
  const records=[];for await(const page of store().list({prefix:'projects/',paginate:true})){const items=await Promise.all(page.blobs.map(b=>store().get(b.key,{type:'json'})));records.push(...items.filter(Boolean));}
  return json({projects:records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
 }
 if(req.method!=='POST')return json({error:'Not found'},404);
 if(!sameOrigin(req))return json({error:'Forbidden'},403);
 if(!validSession(req))return json({error:'請先登入 / Please sign in'},401);
 if(path==='/api/projects'){
  const raw=await req.text();if(Buffer.byteLength(raw)>4500000)return json({error:'檔案太大 / File is too large'},413);
  const body=JSON.parse(raw),data=projectInput(body),id=randomUUID();let asset=null,bytes;
  if(body.file){if(typeof body.file.base64!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.file.base64))throw Error('Invalid file');bytes=Buffer.from(body.file.base64,'base64');if(bytes.length>3*1024*1024)throw Error('檔案上限 3 MB / Maximum file size: 3 MB');asset=fileType(bytes);if(!asset)throw Error('僅支援 PNG、JPG、WebP 或 PDF / Unsupported file type');asset.name=text(body.file.name,180);}
  if(!data.link&&!asset)throw Error('請附上作品連結或檔案 / Add a project link or file');
  const item={id,...data,asset,createdAt:new Date().toISOString()};
  if(asset)await store().set('assets/'+id,bytes);
  try{await store().setJSON('projects/'+id,item);}catch(error){if(asset)await store().delete('assets/'+id);throw error;}
  return json({project:item},201);
 }
 if(path==='/api/archive'){
  const {id}=await req.json();if(!idPattern.test(id||''))throw Error('Invalid project');
  const item=await store().get('projects/'+id,{type:'json'});if(!item)return json({error:'Not found'},404);
  await store().setJSON('archive/'+id,item);await store().delete('projects/'+id);return json({archived:true});
 }
 return json({error:'Not found'},404);
 }catch(error){if(error.message?.includes('請')||error.message?.includes('檔案')||error.message?.includes('支援'))return json({error:error.message},400);console.error('Portfolio request failed:',error.name);return json({error:'暫時無法完成，請稍後再試 / Please try again later'},500);}
}
export const config={path:['/api/projects','/api/session','/api/logout','/api/archive','/api/assets/*']};
