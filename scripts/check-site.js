/* Checks the actual public bundle, not a parallel copy of the templates. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {ROOT, ORIGIN, LANGUAGES, ROUTES, route, readContent, publicPath} = require('./site-lib');
const root = path.join(ROOT, 'dist');
const files = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const docs = new Map(files.map(name => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
let references = 0;
function attribute(tag, name) { return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]; }
function checkURL(value, from) {
  if (!value) return;
  assert(!/^javascript:|^data:/i.test(value), `Unsafe URL in ${from}`);
  if (/^(mailto:|https?:)/.test(value) && !value.startsWith(ORIGIN)) return;
  const url = new URL(value, ORIGIN + '/' + from);
  if (url.origin !== ORIGIN) return;
  const target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
  const full = path.resolve(root, target);
  assert(full.startsWith(root + path.sep), `Path escape in ${from}: ${value}`);
  assert(fs.existsSync(full), `${from}: missing ${value}`);
  if (url.hash && docs.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert(docs.get(target).includes(`id="${id}"`), `${from}: missing fragment ${value}`);
  }
  references++;
}
assert.equal(files.length, 28, 'Expected 27 localized routes and one 404');
for (const [name, html] of docs) {
  assert.equal((html.match(/<main\b/g) || []).length, 1, `${name}: main landmark`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name}: single primary heading`);
  assert(html.includes('name="viewport"'), `${name}: viewport missing`);
  assert(html.includes('class="skip-link"'), `${name}: skip link missing`);
  assert(!/G-DEINE-ID|eklenecek|You can write a short description|Bu bölüm için kısa açıklamayı|\bundefined\b/.test(html), `${name}: unfinished copy`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate ids`);
  for (const match of html.matchAll(/<(?:a|img|script|link|source|video|form)\b[^>]*>/g)) {
    const tag = match[0];
    for (const attr of ['href', 'src', 'poster', 'action']) checkURL(attribute(tag, attr), name);
    if (tag.startsWith('<img') && attribute(tag,'src')) {
      assert(attribute(tag,'alt'), `${name}: informative image lacks alt text`);
      assert(attribute(tag,'width') && attribute(tag,'height'), `${name}: image dimensions missing`);
    }
    if (tag.includes('target="_blank"')) assert(tag.includes('noopener'), `${name}: external link isolation`);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  if (name === '404.html') continue;
  const lang = attribute(html.match(/<html\b[^>]*>/)[0], 'lang');
  assert(LANGUAGES.includes(lang), `${name}: language`);
  const page = attribute(html.match(/<body\b[^>]*>/)[0], 'data-page');
  assert.equal(name, route(page, lang));
  for (const language of LANGUAGES) {
    assert(html.includes(`href="${route(page, language)}" lang="${language}"`), `${name}: same-page language switch missing`);
    assert(html.includes(`rel="alternate" hreflang="${language}"`), `${name}: SEO alternate missing`);
  }
  assert(html.includes('name="description"'), `${name}: description missing`);
  if (page !== 'tesekkurler') {
    const form = html.match(/<form\b[\s\S]*?<\/form>/)?.[0];
    assert(form && /method="POST"/.test(form), `${name}: native POST form missing`);
    assert(form.includes(`value="${name}"`), `${name}: submission page missing`);
    assert(form.includes(`name="language" value="${lang}"`), `${name}: submission language missing`);
    assert(form.includes(`action="/${route('tesekkurler',lang)}"`), `${name}: wrong thank-you language`);
    assert(/name="consent"[^>]*required/.test(form), `${name}: publication consent missing`);
    assert(form.includes('netlify-honeypot="bot-field"'), `${name}: honeypot missing`);
    assert(html.includes('aria-current="page"'), `${name}: active navigation missing`);
  }
  if (page === 'felsefe') {
    assert.equal((html.match(/class="writing"/g)||[]).length, readContent(lang).philosophy.length, `${name}: missing articles`);
    assert(!html.includes('Yazı yükleniyor'), `${name}: text not prerendered`);
  }
  if (page === 'videolar') {
    assert.equal((html.match(/data-youtube=/g)||[]).length, 3, `${name}: YouTube videos missing`);
    assert.equal((html.match(/<video\b/g)||[]).length, 1, `${name}: local video missing`);
    assert(!html.includes('<iframe'), `${name}: eager external video`);
  }
}
for(const lang of LANGUAGES) {
  const content=readContent(lang);
  assert.equal(content.podcasts.length,readContent('tr').podcasts.length);
  assert.equal(content.philosophy.length,readContent('tr').philosophy.length);
  for(const collection of ['podcasts','photos','philosophy','news']) for(const item of content[collection]) {
    for(const key of ['audio','cover','image','file']) if(item[key]) assert(fs.existsSync(publicPath(item[key])), `Missing ${key}: ${item[key]}`);
  }
}
const rss=fs.readFileSync(path.join(root,'feed.xml'),'utf8');
assert.equal((rss.match(/<item>/g)||[]).length,readContent('tr').podcasts.length);
for(const match of rss.matchAll(/<enclosure\b[^>]+>/g)) {
  const url=attribute(match[0],'url'),length=Number(attribute(match[0],'length'));
  const file=path.join(root,new URL(url).pathname.slice(1));
  assert.equal(length,fs.statSync(file).size,'RSS enclosure length');
}
assert([...rss.matchAll(/<itunes:duration>(\d+)<\/itunes:duration>/g)].every(m=>Number(m[1])>0),'RSS duration');
assert.equal((fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').match(/<url>/g)||[]).length,24);
for(const name of ['package.json','site-copy.js','update-feed.js','sync-comments.js','scripts','.git','node_modules']) assert(!fs.existsSync(path.join(root,name)),`Private build file published: ${name}`);
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'CSS braces');
assert(css.includes('prefers-reduced-motion'),'Reduced motion support');
function luminance(hex) {const c=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
for(const [front,back] of [['61645c','f7f5f0'],['a13e2c','f7f5f0'],['ffffff','a13e2c'],['d5d9ce','232a24']]) {
  const a=luminance(front),b=luminance(back),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert(ratio>=4.5,`Insufficient text contrast: ${front}/${back}`);
}
console.log(`PASS: ${files.length} pages, ${references} internal links/assets, 24 localized forms, complete language content, podcast files, SEO, contrast and public bundle boundaries.`);
