// Curated English copy. Original Traditional Chinese markup is retained for switching back.
const translations = [
 ['.header nav a[href="#about"]','About'],
 ['.header nav a[href="#playground"]','Playground'],
 ['.header nav a[href="#connect"]','Connect <span>↗</span>'],
 ['h1','Ideas.<br>Without <span class="outline">limits</span><span class="lime">.</span>'],
 ['.intro','Led by curiosity.<br>Exploring where technology, design, and everyday life meet.'],
 ['.round-link','Explore the playground <span>↘</span>'],
 ['.hero-bottom a','Explore <span>↓</span>'],
 ['.orb-note','MOVE TO EXPLORE · SHAPE THE ORBIT'],
 ['.about h2','Hello,<br>I’m <span>Dennis.</span>'],
 ['.big-copy','I don’t just imagine ideas.<br>I want to see them <span>come alive.</span>'],
 ['.about-copy > p:nth-of-type(2)','This is my digital space—a place to follow my curiosity. I’m drawn to the meeting point of technology and design, where a simple idea becomes something you can see, feel, and explore.'],
 ['.about-copy > p:nth-of-type(3)','It started with a simple thought: create a space that feels like me. Expressive, full of movement, and at home on any screen.'],
 ['.tags span:nth-child(1)','Driven by curiosity'],['.tags span:nth-child(2)','Always exploring'],['.tags span:nth-child(3)','A different perspective'],
 ['.values > div:nth-child(1) h3','Stay curious'],['.values > div:nth-child(1) p','One more “what if” opens up a new possibility.'],
 ['.values > div:nth-child(2) h3','Try things out'],['.values > div:nth-child(2) p','Turn a spark of inspiration into a world you can explore.'],
 ['.values > div:nth-child(3) h3','Make it your own'],['.values > div:nth-child(3) p','Find your rhythm. Leave your own mark.'],
 ['.lab h2','Imagination.<br>In <span>motion.</span>'],
 ['.lab-title > p','A little design. A little code. A lot of curiosity.<br>Step inside and see where an idea can take you.<small>Interactive concepts created for this site, rather than past client work.</small>'],
 ['[data-filter="all"]','All experiments <sup>03</sup>'],['[data-filter="visual"]','Visual'],['[data-filter="interactive"]','Interactive'],
 ['[data-demo="orbit"] h3','Beyond the Orbit'],['[data-demo="gradient"] h3','Color in Flow'],['[data-demo="type"] h3','Type, Reimagined'],
 ['.project-one .project-caption > span','Visual'],['.project-two .project-caption > span','Interactive'],['.project-three .project-caption > span','Interactive'],
 ['.now-line > div > span','Still exploring'],['.now-line p','The next great idea<br>might start with a conversation.'],
 ['.contact h2','Let’s explore <span>what’s next.</span><span class="contact-arrow">↗</span>'],
 ['.contact-bottom > p','Stay curious.<br>Stay connected.'],['#copy-link','Copy site link <span>⧉</span>']
];
const languageEntries = translations.map(([selector,en])=>{const node=document.querySelector(selector);return {node,en,zh:node?.innerHTML};});
const languageLabels = [
 ['.social-links','社群連結','Social links'],
 ['[data-social=instagram]','Dennis 的 Instagram（另開分頁）','Dennis on Instagram (opens in a new tab)'],
 ['[data-social=linkedin]','Dennis 的 LinkedIn（另開分頁）','Dennis on LinkedIn (opens in a new tab)'],
 ['[data-social=github]','Dennis 的 GitHub（另開分頁）','Dennis on GitHub (opens in a new tab)'],
 ['.header .brand','Dennis 首頁','Dennis home'],['.header nav','主選單','Main navigation'],
 ['.orbit-scene','互動粒子星球','Interactive particle planet'],['.filters','實驗分類','Experiment categories'],['#close-dialog','關閉實驗','Close experiment']
];
const messages = {
 orbitLabel:['軌道旋轉週期','Orbit rotation period'], colorLabel:['色彩色相','Color hue'], typeLabel:['輸入你想展示的文字','Enter your text'],
 orbitDescription:['軌道之外 / 拖動滑桿，調整軌道旋轉速度。','Beyond the Orbit / Move the slider to change the rotation speed.'],
 colorDescription:['流動的色彩 / 拖動滑桿，找到屬於你的色彩。','Color in Flow / Move the slider and find a color that feels like you.'],
 typeDescription:['字裡的可能 / 輸入一個念頭，讓文字成為畫面。最多 12 個字。','Type, Reimagined / Give an idea a little space. Enter up to 12 characters.'],
 typeDefault:['想像無限','Imagine more'],copied:['網站連結已複製','Site link copied'],copyFallback:['網站連結：','Site link: ']
};
let siteLanguage='zh';
window.siteText=key=>messages[key]?.[siteLanguage==='en'?1:0]??key;
function applyLanguage(language){
 siteLanguage=language;
 document.documentElement.lang=language==='en'?'en':'zh-Hant';
 document.documentElement.dataset.language=language;
 for(const entry of languageEntries)if(entry.node)entry.node.innerHTML=entry[language];
 for(const [selector,zh,en] of languageLabels)document.querySelector(selector)?.setAttribute('aria-label',language==='en'?en:zh);
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 document.title=language==='en'?'Dennis — Ideas Without Limits':'Dennis — 想法不設限';
 const description=language==='en'?'Dennis’s digital space. Exploring the possibilities of technology, design, and interaction, led by curiosity.':'Dennis 的數位空間。讓好奇心帶路，探索設計、科技與互動的更多可能。';
 document.querySelector('meta[name="description"]').content=description;
 document.querySelector('meta[property="og:title"]').content=document.title;
 document.querySelector('meta[property="og:description"]').content=description;
 document.querySelector('#toast').textContent='';
 try{localStorage.setItem('dennis-language',language);}catch{}
}
let languageTimer;
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
 const language=button.dataset.language;if(language===siteLanguage)return;
 clearTimeout(languageTimer);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){applyLanguage(language);return;}
 document.documentElement.classList.add('language-changing');
 languageTimer=setTimeout(()=>{applyLanguage(language);document.documentElement.classList.remove('language-changing');},140);
}));
let preferredLanguage;
try{preferredLanguage=localStorage.getItem('dennis-language');}catch{}
applyLanguage(preferredLanguage==='en'?'en':'zh');
