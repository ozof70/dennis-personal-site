import test from 'node:test';
import assert from 'node:assert/strict';
import {encodePassword,passwordMatches,issueSession,validSession,cookie} from '../server/auth.mjs';
import login from '../netlify/functions/login.mjs';
import portfolio,{fileType,projectInput} from '../netlify/functions/portfolio.mjs';
process.env.ADMIN_PASSWORD_HASH=encodePassword('unit-test-password');
const request=(path,body={},headers={})=>new Request('https://example.com'+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com',...headers},body:JSON.stringify(body)});
test('password verification and session integrity',()=>{
 assert.equal(passwordMatches('unit-test-password',process.env.ADMIN_PASSWORD_HASH),true);
 assert.equal(passwordMatches('wrong',process.env.ADMIN_PASSWORD_HASH),false);
 const token=issueSession(1000),req=new Request('https://example.com',{headers:{cookie:cookie(token)}});
 assert.equal(validSession(req,2000),true);assert.equal(validSession(req,1000+8*60*60*1000),false);
 assert.equal(validSession(new Request('https://example.com',{headers:{cookie:'dennis_admin='+token+'x'}}),2000),false);
});
test('login sets secure HttpOnly cookie and rejects wrong password and foreign origin',async()=>{
 const response=await login(request('/api/login',{password:'unit-test-password'}));assert.equal(response.status,200);
 assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);
 assert.equal((await login(request('/api/login',{password:'wrong'}))).status,401);
 assert.equal((await login(request('/api/login',{password:'unit-test-password'},{Origin:'https://evil.example'}))).status,403);
});
test('mutating routes reject anonymous users and cross-site writes before storage access',async()=>{
 assert.equal((await portfolio(request('/api/projects',{title:'x'}))).status,401);
 assert.equal((await portfolio(request('/api/archive',{id:'x'}))).status,401);
 assert.equal((await portfolio(request('/api/projects',{}, {Origin:'https://evil.example'}))).status,403);
});
test('only supported binary formats and safe project links are accepted',()=>{
 assert.equal(fileType(Buffer.from('<svg onload="alert(1)">')),null);
 assert.equal(fileType(Buffer.from('%PDF-1.7')).type,'application/pdf');
 assert.equal(fileType(Buffer.from([137,80,78,71,13,10,26,10])).type,'image/png');
 assert.throws(()=>projectInput({title:'x',link:'javascript:alert(1)'}));
 assert.throws(()=>projectInput({title:''}));
 assert.equal(projectInput({title:'  Project  ',link:'https://example.com'}).title,'Project');
});
