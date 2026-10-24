import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resume} from './resume-data.mjs';
const old=await readFile('public/index.html','utf8');
const social=old.match(/<div class="social-links"[\s\S]*?<\/a><\/div>/)?.[0];
if(!social)throw Error('Social links missing');
const copy={
 'nav-experience':['經歷','Experience'],'nav-education':['學歷','Education'],'nav-certifications':['證照','Certifications'],
 'intro-role':['Icefeather Tech 共同創辦人暨營運長','Co-Founder & COO · Icefeather Tech'],
 'intro-study':['國立政治大學・地政學系','Land Economics · National Chengchi University'],
 'connect-title':['保持連結。','Let’s connect.'],
 'page-home':['Dennis Hsiao.','Dennis Hsiao.'],
 'page-experience':['工作經歷','Experience'],
 'page-education':['教育背景','Education'],
 'page-certifications':['專業證照','Certifications'],
 'home-experience':['創業、工作與志工服務','Entrepreneurship, work & volunteering'],
 'home-education':['學位與國際學習','Degree studies & international learning'],
 'home-certifications':['專業認證與進修','Professional credentials & further learning']
};
for(const r of resume)for(const key of ['date','kind','org','role','body'])copy[r.id+'-'+key]=r[key];
const categories={experience:resume.filter(r=>['nest','housing','icefeather','patient','research'].includes(r.id)),education:resume.filter(r=>['skku','education'].includes(r.id)),certifications:resume.filter(r=>r.id.endsWith('-cert'))};
function text(key){return `data-copy="${key}"`;}
const link=k=>`/${k}/`;
const socialSection=`<section class="connect-section reveal" id="connect"><h2 ${text('connect-title')}>保持連結。</h2>${social}</section>`;
const card=r=>`<li class="timeline-entry reveal" id="${r.id}"><div class="timeline-date" ${text(r.id+'-date')}>${r.date[0]}</div><div class="timeline-node" aria-hidden="true"></div><article class="timeline-card"><p class="entry-kind" ${text(r.id+'-kind')}>${r.kind[0]}</p><h3 ${text(r.id+'-role')}>${r.role[0]}</h3><p class="entry-org" ${text(r.id+'-org')}>${r.org[0]}</p><p class="entry-description" ${text(r.id+'-body')}>${r.body[0]}</p></article></li>`;
for(const page of ['home',...Object.keys(categories)]){
 const home=page==='home',path=home?'/':link(page),title=home?'Dennis Hsiao — 個人網站':`${copy['page-'+page][0]} — Dennis Hsiao`;
 const nav=Object.keys(categories).map(k=>`<a href="${link(k)}" ${text('nav-'+k)}${page===k?' aria-current="page"':''}>${copy['nav-'+k][0]}</a>`).join('');
 const intro=home?`<section class="resume-intro" id="home"><p class="intro-kicker">TAIWAN · DENNIS HSIAO</p><h1>Dennis<span> Hsiao.</span></h1><p class="intro-role" ${text('intro-role')}>${copy['intro-role'][0]}</p><p class="intro-study" ${text('intro-study')}>${copy['intro-study'][0]}</p></section><section class="page-links" aria-label="履歷分類">${Object.keys(categories).map(k=>`<a href="${link(k)}"><h2 ${text('nav-'+k)}>${copy['nav-'+k][0]}</h2><p ${text('home-'+k)}>${copy['home-'+k][0]}</p><span aria-hidden="true">↗</span></a>`).join('')}</section>`:`<section class="resume-intro page-intro" id="home"><p class="intro-kicker">DENNIS HSIAO</p><h1 ${text('page-'+page)}>${copy['page-'+page][0]}</h1></section><section class="journey-section" id="journey" aria-label="${copy['page-'+page][0]}"><div class="timeline-wrap"><div class="timeline-rail" aria-hidden="true"><div class="timeline-fill"></div></div><ol class="timeline-list">${categories[page].map(card).join('\n')}</ol></div></section>`;
 const html=`<!doctype html><html lang="zh-Hant" data-page="${page}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111311"><title>${title}</title><meta name="description" content="Dennis Hsiao 的工作經歷、教育背景與專業證照。"><meta property="og:title" content="${title}"><meta property="og:description" content="Dennis Hsiao 的工作經歷、教育背景與專業證照。"><meta property="og:type" content="website"><meta property="og:url" content="https://dennis-tw.com${path}"><link rel="canonical" href="https://dennis-tw.com${path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><script defer src="/language.js"></script><script defer src="/app.js"></script></head><body><canvas id="mesh-background" aria-hidden="true"></canvas><div class="progress" aria-hidden="true"></div><header class="header"><a class="brand" href="/" aria-label="Dennis 首頁">dennis<span>®</span></a><nav aria-label="主選單">${nav}</nav><div class="language-switch" role="group" aria-label="網站語言 / Site language"><button data-language="zh" lang="zh-Hant" aria-pressed="true">中</button><button data-language="en" lang="en" aria-pressed="false">EN</button></div></header><main>${intro}${socialSection}</main><footer><span>© <span id="year">2026</span> DENNIS HSIAO</span><a href="#home" aria-label="回到頂部">↑</a></footer></body></html>`;
 const directory=home?'public':`public/${page}`;await mkdir(directory,{recursive:true});await writeFile(directory+'/index.html',html);
}
let language=await readFile('public/language.js','utf8');language=language.slice(language.indexOf("let siteLanguage='zh';"));
language=language.replace("document.title=en?'Dennis Hsiao — Experience & Exploration':'Dennis Hsiao — 經歷與探索';",`const page=document.documentElement.dataset.page;document.title=page==='home'?'Dennis Hsiao':resumeCopy['page-'+page][en?1:0]+' — Dennis Hsiao';`);
await writeFile('public/language.js','const resumeCopy = '+JSON.stringify(copy,null,2)+';\n'+language);
