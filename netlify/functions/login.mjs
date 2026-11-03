import {cookie,issueSession,json,passwordMatches,sameOrigin} from '../../server/auth.mjs';
export default async function(req){
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(!sameOrigin(req))return json({error:'Forbidden'},403);
 if(!process.env.ADMIN_PASSWORD_HASH)return json({error:'管理登入尚未設定，請稍後再試。'},503);
 try{if(Number(req.headers.get('content-length'))>1024)return json({error:'Request too large'},413);
 const body=await req.json();if(!passwordMatches(body.password,process.env.ADMIN_PASSWORD_HASH))return json({error:'密碼不正確 / Incorrect password'},401);
 return json({authenticated:true},200,{'Set-Cookie':cookie(issueSession())});
 }catch{return json({error:'無法登入 / Unable to sign in'},400);}
}
export const config={path:'/api/login',rateLimit:{windowLimit:10,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
