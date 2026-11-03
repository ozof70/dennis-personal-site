import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export const COOKIE='dennis_admin';
export function encodePassword(password,salt=randomBytes(16).toString('hex')){return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function passwordMatches(password,encoded){
 if(typeof password!=='string'||password.length>200||typeof encoded!=='string')return false;
 const [salt,hash]=encoded.split(':');if(!salt||!/^[a-f0-9]{128}$/.test(hash||''))return false;
 return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(hash,'hex'));
}
function secret(){const value=process.env.ADMIN_PASSWORD_HASH;if(!value)throw Error('ADMIN_NOT_CONFIGURED');return value;}
export function issueSession(now=Date.now()){const payload=Buffer.from(JSON.stringify({exp:now+8*60*60*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return payload+'.'+createHmac('sha256',secret()).update(payload).digest('base64url');}
export function validSession(req,now=Date.now()){
 try{const cookie=(req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='));if(!cookie)return false;
 const [payload,signature]=cookie.slice(COOKIE.length+1).split('.');const expected=createHmac('sha256',secret()).update(payload).digest();const actual=Buffer.from(signature||'','base64url');
 return actual.length===expected.length&&timingSafeEqual(actual,expected)&&JSON.parse(Buffer.from(payload,'base64url').toString()).exp>now;
 }catch{return false;}
}
export function sameOrigin(req){const origin=req.headers.get('origin');return origin===new URL(req.url).origin;}
export function cookie(value,maxAge=28800){return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;}
export function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
